from fastapi import FastAPI, HTTPException, Header, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import sqlite3
from datetime import datetime

from database import get_db_connection
from auth import hash_password, verify_password, create_access_token, decode_access_token

app = FastAPI(title="Organic E-Commerce API", version="1.0.0")

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class SignupRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CartItemRequest(BaseModel):
    product_id: int
    quantity: int
    saved_for_later: Optional[int] = 0

class OrderItemSchema(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float

class OrderRequest(BaseModel):
    shipping_address: str
    delivery_slot: str
    payment_method: str
    items: List[OrderItemSchema]
    total_price: float

class ReviewRequest(BaseModel):
    rating: int
    comment: str

class ProductCreateRequest(BaseModel):
    name: str
    description: str
    price: float
    discount: float
    category: str
    brand: str
    organic: int
    eco_certified: int
    ingredients: str
    nutrition: dict
    weight_options: List[str]
    images: List[str]
    stock: int

# Auth Dependency
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token missing or invalid")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token or session expired")
    
    # Get user from db
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name, addresses FROM users WHERE id = ?", (payload.get("user_id"),))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "addresses": json.loads(user["addresses"])
    }

# --- AUTH ENDPOINTS ---

@app.post("/api/signup")
def signup(req: SignupRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email is already registered")
        
        hashed = hash_password(req.password)
        cursor.execute(
            "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
            (req.email, hashed, req.name)
        )
        conn.commit()
        
        # Get newly created user
        user_id = cursor.lastrowid
        token = create_access_token({"user_id": user_id, "email": req.email})
        
        return {
            "token": token,
            "user": {
                "id": user_id,
                "email": req.email,
                "name": req.name,
                "addresses": []
            }
        }
    finally:
        conn.close()

@app.post("/api/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = ?", (req.email,))
        user = cursor.fetchone()
        
        if not user or not verify_password(req.password, user["password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")
        
        token = create_access_token({"user_id": user["id"], "email": user["email"]})
        
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "addresses": json.loads(user["addresses"])
            }
        }
    finally:
        conn.close()

# --- PROFILE ENDPOINTS ---

@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@app.put("/api/profile")
def update_profile(data: dict, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        name = data.get("name", current_user["name"])
        addresses = data.get("addresses", current_user["addresses"])
        
        cursor.execute(
            "UPDATE users SET name = ?, addresses = ? WHERE id = ?",
            (name, json.dumps(addresses), current_user["id"])
        )
        conn.commit()
        return {"status": "success", "user": {"id": current_user["id"], "email": current_user["email"], "name": name, "addresses": addresses}}
    finally:
        conn.close()

# --- PRODUCTS ENDPOINTS ---

@app.get("/api/products")
def get_products(
    search: str = "",
    category: str = "",
    brand: str = "",
    min_price: float = 0.0,
    max_price: float = 1000.0,
    min_rating: float = 0.0,
    organic: Optional[int] = None,
    eco_certified: Optional[int] = None,
    sort_by: str = "popularity",
    page: int = 1,
    limit: int = 8
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Build query
        query = "SELECT * FROM products WHERE price BETWEEN ? AND ? AND rating >= ?"
        params = [min_price, max_price, min_rating]
        
        if search:
            query += " AND (name LIKE ? OR description LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])
        if category:
            query += " AND category = ?"
            params.append(category)
        if brand:
            query += " AND brand = ?"
            params.append(brand)
        if organic is not None:
            query += " AND organic = ?"
            params.append(organic)
        if eco_certified is not None:
            query += " AND eco_certified = ?"
            params.append(eco_certified)
            
        # Sorting
        if sort_by == "price_low":
            query += " ORDER BY price ASC"
        elif sort_by == "price_high":
            query += " ORDER BY price DESC"
        elif sort_by == "rating":
            query += " ORDER BY rating DESC"
        elif sort_by == "discount":
            query += " ORDER BY discount DESC"
        else: # Default: popularity (represented by id or rating DESC)
            query += " ORDER BY id DESC"
            
        # Pagination count
        cursor.execute(query, params)
        all_matches = cursor.fetchall()
        total_count = len(all_matches)
        
        # Limit and Offset
        offset = (page - 1) * limit
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        products = cursor.fetchall()
        
        result = []
        for p in products:
            result.append({
                "id": p["id"],
                "name": p["name"],
                "description": p["description"],
                "price": p["price"],
                "discount": p["discount"],
                "rating": p["rating"],
                "stock": p["stock"],
                "category": p["category"],
                "brand": p["brand"],
                "organic": bool(p["organic"]),
                "eco_certified": bool(p["eco_certified"]),
                "ingredients": p["ingredients"],
                "nutrition": json.loads(p["nutrition"]) if p["nutrition"] else {},
                "weight_options": json.loads(p["weight_options"]) if p["weight_options"] else [],
                "images": json.loads(p["images"]) if p["images"] else []
            })
            
        return {
            "products": result,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "pages": (total_count + limit - 1) // limit
        }
    finally:
        conn.close()

@app.get("/api/products/{product_id}")
def get_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        p = cursor.fetchone()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get reviews
        cursor.execute("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", (product_id,))
        reviews = cursor.fetchall()
        reviews_list = []
        for r in reviews:
            reviews_list.append({
                "id": r["id"],
                "user_name": r["user_name"],
                "rating": r["rating"],
                "comment": r["comment"],
                "created_at": r["created_at"],
                "helpful_votes": r["helpful_votes"]
            })
            
        return {
            "id": p["id"],
            "name": p["name"],
            "description": p["description"],
            "price": p["price"],
            "discount": p["discount"],
            "rating": p["rating"],
            "stock": p["stock"],
            "category": p["category"],
            "brand": p["brand"],
            "organic": bool(p["organic"]),
            "eco_certified": bool(p["eco_certified"]),
            "ingredients": p["ingredients"],
            "nutrition": json.loads(p["nutrition"]) if p["nutrition"] else {},
            "weight_options": json.loads(p["weight_options"]) if p["weight_options"] else [],
            "images": json.loads(p["images"]) if p["images"] else [],
            "reviews": reviews_list
        }
    finally:
        conn.close()

# --- CART ENDPOINTS ---

@app.get("/api/cart")
def get_cart(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.product_id, c.quantity, c.saved_for_later,
                   p.name, p.price, p.discount, p.images, p.stock, p.category, p.organic, p.eco_certified
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        """, (current_user["id"],))
        
        items = cursor.fetchall()
        result = []
        for item in items:
            images = json.loads(item["images"]) if item["images"] else []
            result.append({
                "id": item["id"],
                "product_id": item["product_id"],
                "name": item["name"],
                "price": item["price"],
                "discount": item["discount"],
                "image": images[0] if images else "",
                "quantity": item["quantity"],
                "stock": item["stock"],
                "saved_for_later": bool(item["saved_for_later"]),
                "category": item["category"],
                "organic": bool(item["organic"]),
                "eco_certified": bool(item["eco_certified"])
            })
        return result
    finally:
        conn.close()

@app.post("/api/cart")
def add_to_cart(item: CartItemRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check product stock
        cursor.execute("SELECT stock FROM products WHERE id = ?", (item.product_id,))
        p = cursor.fetchone()
        if not p:
            raise HTTPException(status_code=404, detail="Product not found")
        if p["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
            
        cursor.execute("""
            INSERT INTO cart_items (user_id, product_id, quantity, saved_for_later)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, product_id) DO UPDATE SET
            quantity = excluded.quantity,
            saved_for_later = excluded.saved_for_later
        """, (current_user["id"], item.product_id, item.quantity, item.saved_for_later))
        
        conn.commit()
        return {"status": "success", "message": "Cart synchronized"}
    finally:
        conn.close()

@app.delete("/api/cart/{product_id}")
def delete_cart_item(product_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", (current_user["id"], product_id))
        conn.commit()
        return {"status": "success", "message": "Item removed from cart"}
    finally:
        conn.close()

# --- ORDER ENDPOINTS ---

@app.post("/api/orders")
def create_order(req: OrderRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Verify and update stocks
        for item in req.items:
            cursor.execute("SELECT stock FROM products WHERE id = ?", (item.product_id,))
            p = cursor.fetchone()
            if not p:
                raise HTTPException(status_code=404, detail=f"Product id {item.product_id} not found")
            if p["stock"] < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {item.name}")
            
            # Update stock
            new_stock = p["stock"] - item.quantity
            cursor.execute("UPDATE products SET stock = ? WHERE id = ?", (new_stock, item.product_id))

        # 2. Insert order
        items_json = json.dumps([item.dict() for item in req.items])
        created_at = datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO orders (user_id, total_price, status, created_at, shipping_address, delivery_slot, payment_method, items)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user["id"],
            req.total_price,
            "Placed",
            created_at,
            req.shipping_address,
            req.delivery_slot,
            req.payment_method,
            items_json
        ))
        order_id = cursor.lastrowid
        
        # 3. Clear cart
        cursor.execute("DELETE FROM cart_items WHERE user_id = ?", (current_user["id"],))
        
        conn.commit()
        return {"status": "success", "order_id": order_id, "message": "Order placed successfully!"}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

@app.get("/api/orders")
def get_orders(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", (current_user["id"],))
        orders = cursor.fetchall()
        result = []
        for o in orders:
            result.append({
                "id": o["id"],
                "total_price": o["total_price"],
                "status": o["status"],
                "created_at": o["created_at"],
                "shipping_address": o["shipping_address"],
                "delivery_slot": o["delivery_slot"],
                "payment_method": o["payment_method"],
                "items": json.loads(o["items"])
            })
        return result
    finally:
        conn.close()

# --- REVIEW POSTING ENDPOINT ---

@app.post("/api/products/{product_id}/reviews")
def add_review(product_id: int, req: ReviewRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        created_at = datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO reviews (product_id, user_id, user_name, rating, comment, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (product_id, current_user["id"], current_user["name"], req.rating, req.comment, created_at))
        
        # Recalculate product rating average
        cursor.execute("SELECT AVG(rating) FROM reviews WHERE product_id = ?", (product_id,))
        avg_rating = cursor.fetchone()[0] or 5.0
        cursor.execute("UPDATE products SET rating = ? WHERE id = ?", (round(avg_rating, 1), product_id))
        
        conn.commit()
        return {"status": "success", "message": "Review added successfully!"}
    finally:
        conn.close()

@app.post("/api/reviews/{review_id}/upvote")
def upvote_review(review_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE reviews SET helpful_votes = helpful_votes + 1 WHERE id = ?", (review_id,))
        conn.commit()
        return {"status": "success"}
    finally:
        conn.close()

# --- ADMIN ENDPOINTS (BONUS STUFF) ---

@app.get("/api/admin/stats")
def get_admin_stats(current_user: dict = Depends(get_current_user)):
    # Simulates stats for the dashboard
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM products")
        total_products = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM orders")
        total_orders = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(total_price) FROM orders")
        total_revenue = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        return {
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "total_users": total_users,
            "recent_orders": [] # structure logic placeholder
        }
    finally:
        conn.close()

@app.post("/api/admin/products")
def create_product(p: ProductCreateRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO products (name, description, price, discount, rating, stock, category, brand, organic, eco_certified, ingredients, nutrition, weight_options, images)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p.name, p.description, p.price, p.discount, 5.0, p.stock,
            p.category, p.brand, p.organic, p.eco_certified, p.ingredients,
            json.dumps(p.nutrition), json.dumps(p.weight_options), json.dumps(p.images)
        ))
        conn.commit()
        return {"status": "success", "id": cursor.lastrowid}
    finally:
        conn.close()

@app.put("/api/admin/products/{product_id}")
def update_product(product_id: int, p: ProductCreateRequest, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE products SET
                name = ?, description = ?, price = ?, discount = ?, stock = ?,
                category = ?, brand = ?, organic = ?, eco_certified = ?,
                ingredients = ?, nutrition = ?, weight_options = ?, images = ?
            WHERE id = ?
        """, (
            p.name, p.description, p.price, p.discount, p.stock,
            p.category, p.brand, p.organic, p.eco_certified, p.ingredients,
            json.dumps(p.nutrition), json.dumps(p.weight_options), json.dumps(p.images),
            product_id
        ))
        conn.commit()
        return {"status": "success"}
    finally:
        conn.close()

@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        return {"status": "success"}
    finally:
        conn.close()
