import json
from database import get_db_connection, init_db
from auth import hash_password

def seed_data():
    # Make sure tables exist
    init_db()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if products already exist
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] > 0:
        print("Database already has products. Skipping seed.")
        conn.close()
        return

    # Seed an admin and dummy user
    cursor.execute("INSERT OR IGNORE INTO users (email, password, name, addresses) VALUES (?, ?, ?, ?)", (
        "john@example.com",
        hash_password("password123"),
        "John Doe",
        json.dumps(["123 Forest Trail, Green Valley", "456 Oak Avenue, Riverdale"])
    ))
    cursor.execute("INSERT OR IGNORE INTO users (email, password, name, addresses) VALUES (?, ?, ?, ?)", (
        "admin@organic.com",
        hash_password("adminpass"),
        "Admin Team",
        json.dumps(["Eco Center, Earth HQ"])
    ))
    
    products = [
        {
            "name": "Organic Roma Tomatoes",
            "description": "Sun-ripened, organic Roma tomatoes grown without synthetic pesticides. Sweet, meaty, and perfect for sauces, salads, or cooking.",
            "price": 4.99,
            "discount": 10.0,
            "rating": 4.7,
            "stock": 45,
            "category": "Fruits & Vegetables",
            "brand": "Earth Harvest",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "Organic Roma Tomatoes",
            "nutrition": json.dumps({"calories": 22, "fat": "0.2g", "protein": "1.1g", "carbs": "4.8g", "fiber": "1.5g"}),
            "weight_options": json.dumps(["500g", "1kg"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Fresh Organic Baby Spinach",
            "description": "Tender, pre-washed organic baby spinach leaves packed with vitamins and minerals. Perfect for fresh green salads and healthy smoothies.",
            "price": 3.49,
            "discount": 0.0,
            "rating": 4.8,
            "stock": 30,
            "category": "Fruits & Vegetables",
            "brand": "Green Field",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "Organic Baby Spinach Leaves",
            "nutrition": json.dumps({"calories": 7, "fat": "0.1g", "protein": "0.9g", "carbs": "1.1g", "fiber": "0.7g"}),
            "weight_options": json.dumps(["250g", "500g"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1551304733-149b5c328db5?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Organic Honeycrisp Apples",
            "description": "Crisp, sweet, and wonderfully juicy organic Honeycrisp apples. Grown locally in organic orchards. Ideal for healthy snacking.",
            "price": 6.99,
            "discount": 15.0,
            "rating": 4.9,
            "stock": 25,
            "category": "Fruits & Vegetables",
            "brand": "Earth Harvest",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "Organic Honeycrisp Apples",
            "nutrition": json.dumps({"calories": 95, "fat": "0.3g", "protein": "0.5g", "carbs": "25g", "fiber": "4.4g"}),
            "weight_options": json.dumps(["1kg", "2kg"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Organic Avocados",
            "description": "Rich and creamy organic Haas avocados. Perfect for making guacamole, spreading on toast, or adding to salads.",
            "price": 5.49,
            "discount": 5.0,
            "rating": 4.6,
            "stock": 40,
            "category": "Fruits & Vegetables",
            "brand": "Green Field",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "Organic Hass Avocados",
            "nutrition": json.dumps({"calories": 240, "fat": "22g", "protein": "3g", "carbs": "12g", "fiber": "10g"}),
            "weight_options": json.dumps(["3 Units", "6 Units"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1604085792782-8d92f276d7d8?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Organic White Quinoa",
            "description": "Organic, pre-washed white quinoa seeds. A complete plant-based protein that is gluten-free and packed with essential nutrients.",
            "price": 7.99,
            "discount": 20.0,
            "rating": 4.5,
            "stock": 18,
            "category": "Pantry & Groceries",
            "brand": "Eco Grain",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "100% Organic White Quinoa Seeds",
            "nutrition": json.dumps({"calories": 222, "fat": "3.6g", "protein": "8.1g", "carbs": "39g", "fiber": "5.2g"}),
            "weight_options": json.dumps(["500g", "1kg"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Cold-Pressed Virgin Coconut Oil",
            "description": "Unrefined, cold-pressed virgin coconut oil extracted from fresh organic coconuts. Excellent for healthy cooking, baking, hair, and skincare.",
            "price": 12.49,
            "discount": 10.0,
            "rating": 4.8,
            "stock": 15,
            "category": "Pantry & Groceries",
            "brand": "Nature's Gold",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "100% Cold-Pressed Organic Coconut Oil",
            "nutrition": json.dumps({"calories": 120, "fat": "14g", "protein": "0g", "carbs": "0g", "saturated_fat": "12g"}),
            "weight_options": json.dumps(["500ml", "1L"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1589244159943-460088ed5c92?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1614264639726-2182df584617?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Raw Himalayan Wildflower Honey",
            "description": "100% pure, raw wildflower honey harvested from the pristine forests of the Himalayas. Never heated or pasteurized to retain enzymes.",
            "price": 14.99,
            "discount": 0.0,
            "rating": 4.9,
            "stock": 12,
            "category": "Pantry & Groceries",
            "brand": "Nature's Gold",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "Raw Organic Wildflower Honey",
            "nutrition": json.dumps({"calories": 64, "fat": "0g", "protein": "0g", "carbs": "17g", "sugar": "16g"}),
            "weight_options": json.dumps(["250g", "500g"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Ceremonial Organic Matcha",
            "description": "Premium ceremonial-grade organic stone-ground Matcha green tea powder. Direct from Uji, Japan. Rich in L-theanine and antioxidants.",
            "price": 24.99,
            "discount": 12.0,
            "rating": 4.9,
            "stock": 8,
            "category": "Beverages",
            "brand": "Leaf Zen",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "100% Japanese Ceremonial Matcha Green Tea Powder",
            "nutrition": json.dumps({"calories": 3, "fat": "0g", "protein": "0.3g", "carbs": "0.5g", "sodium": "0mg"}),
            "weight_options": json.dumps(["30g", "80g"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1582782782782-4bf17478627b?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Organic Chamomile Loose Tea",
            "description": "Whole chamomile flowers carefully dried to preserve sweet honey notes. Naturally caffeine-free and perfect for relaxing bedtime routines.",
            "price": 8.99,
            "discount": 0.0,
            "rating": 4.6,
            "stock": 22,
            "category": "Beverages",
            "brand": "Leaf Zen",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "Organic Whole Chamomile Flowers",
            "nutrition": json.dumps({"calories": 2, "fat": "0g", "protein": "0g", "carbs": "0.2g"}),
            "weight_options": json.dumps(["100g", "200g"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Fair Trade Organic Coffee Beans",
            "description": "Medium roast, single-origin organic whole coffee beans. Sourced ethically via Fair Trade programs. Rich aroma with notes of citrus and chocolate.",
            "price": 16.99,
            "discount": 10.0,
            "rating": 4.7,
            "stock": 16,
            "category": "Beverages",
            "brand": "Eco Grain",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "100% Organic Arabica Whole Coffee Beans",
            "nutrition": json.dumps({"calories": 2, "fat": "0g", "protein": "0.2g", "carbs": "0.1g"}),
            "weight_options": json.dumps(["500g", "1kg"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Raw Organic Almonds",
            "description": "Premium quality raw organic almonds. Rich in heart-healthy monounsaturated fats, protein, and vitamin E. Unsalted and unroasted.",
            "price": 11.99,
            "discount": 8.0,
            "rating": 4.5,
            "stock": 20,
            "category": "Snacks",
            "brand": "Nature's Gold",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "Organic Almonds",
            "nutrition": json.dumps({"calories": 163, "fat": "14g", "protein": "6g", "carbs": "6g", "fiber": "3.5g"}),
            "weight_options": json.dumps(["250g", "500g"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1508061253366-f7da158b6d95?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Dried Organic Mango Slices",
            "description": "Naturally sweet and chewy dried organic mango slices. No added sugars, sulfur, or preservatives. A delicious, nutrient-rich tropical snack.",
            "price": 7.49,
            "discount": 0.0,
            "rating": 4.8,
            "stock": 35,
            "category": "Snacks",
            "brand": "Earth Harvest",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "100% Organic Sliced Mangos",
            "nutrition": json.dumps({"calories": 130, "fat": "0.5g", "protein": "1g", "carbs": "32g", "sugar": "25g"}),
            "weight_options": json.dumps(["200g", "400g"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Bamboo Toothbrush Pack",
            "description": "Four-pack of biodegradable, eco-friendly toothbrushes made from 100% sustainable organic bamboo. Features soft charcoal-infused bristles.",
            "price": 9.99,
            "discount": 15.0,
            "rating": 4.7,
            "stock": 50,
            "category": "Home & Personal Care",
            "brand": "Eco Living",
            "organic": 0,
            "eco_certified": 1,
            "ingredients": "Sustainable Moso Bamboo Handle, Charcoal-Infused Nylon Bristles",
            "nutrition": json.dumps({}),
            "weight_options": json.dumps(["4-Pack"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Natural Lavender Castile Body Wash",
            "description": "Gentle, biodegradable castile liquid soap scented with pure organic lavender oil. Cleanses effectively without synthetic foaming agents.",
            "price": 13.99,
            "discount": 5.0,
            "rating": 4.6,
            "stock": 18,
            "category": "Home & Personal Care",
            "brand": "Eco Living",
            "organic": 1,
            "eco_certified": 1,
            "ingredients": "Organic Saponified Oils (Coconut, Olive, Jojoba), Lavender Essential Oil, Organic Aloe Vera",
            "nutrition": json.dumps({}),
            "weight_options": json.dumps(["400ml", "1L"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop"
            ])
        },
        {
            "name": "Eco-Friendly Laundry Sheets",
            "description": "Zero-waste, plastic-free laundry detergent sheets. Dissolve instantly in hot or cold water. Hypoallergenic and highly concentrated.",
            "price": 15.99,
            "discount": 0.0,
            "rating": 4.8,
            "stock": 25,
            "category": "Home & Personal Care",
            "brand": "Eco Living",
            "organic": 0,
            "eco_certified": 1,
            "ingredients": "Sodium Dodecyl Sulfate, Polyvinyl Alcohol, Glycerin, Water, Essential Oil Fragrance",
            "nutrition": json.dumps({}),
            "weight_options": json.dumps(["60 Sheets"]),
            "images": json.dumps([
                "https://images.unsplash.com/photo-1545180136-1c05d73adbe8?w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1610557892470-76d747eed2f1?w=600&auto=format&fit=crop"
            ])
        }
    ]

    for p in products:
        cursor.execute("""
            INSERT INTO products (name, description, price, discount, rating, stock, category, brand, organic, eco_certified, ingredients, nutrition, weight_options, images)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["name"], p["description"], p["price"], p["discount"], p["rating"], p["stock"],
            p["category"], p["brand"], p["organic"], p["eco_certified"], p["ingredients"],
            p["nutrition"], p["weight_options"], p["images"]
        ))
        p_id = cursor.lastrowid
        
        # Seed 2 reviews for each product
        reviews = [
            {
                "product_id": p_id,
                "user_id": 1,
                "user_name": "John Doe",
                "rating": 5,
                "comment": f"Absolutely love this {p['name']}! The quality is amazing, and I love that it is eco-friendly. Will buy again.",
                "created_at": "2026-06-25T14:30:00Z",
                "helpful_votes": 5
            },
            {
                "product_id": p_id,
                "user_id": 1,
                "user_name": "Sarah Miller",
                "rating": 4,
                "comment": f"Very high quality. Smells/tastes fresh. Packing was simple and recyclable. Highly recommend.",
                "created_at": "2026-07-02T10:15:00Z",
                "helpful_votes": 2
            }
        ]
        
        for r in reviews:
            cursor.execute("""
                INSERT INTO reviews (product_id, user_id, user_name, rating, comment, created_at, helpful_votes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                r["product_id"], r["user_id"], r["user_name"], r["rating"], r["comment"], r["created_at"], r["helpful_votes"]
            ))

    conn.commit()
    conn.close()
    print("Database seeded successfully with users, products, and reviews.")

if __name__ == "__main__":
    seed_data()
