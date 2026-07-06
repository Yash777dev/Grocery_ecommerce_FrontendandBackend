import sqlite3
import os
import json

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "organic_shop.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            addresses TEXT DEFAULT '[]'
        )
    """)
    
    # Create Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            discount REAL DEFAULT 0.0,
            rating REAL DEFAULT 5.0,
            stock INTEGER DEFAULT 10,
            category TEXT,
            brand TEXT,
            organic INTEGER DEFAULT 1,
            eco_certified INTEGER DEFAULT 1,
            ingredients TEXT,
            nutrition TEXT,
            weight_options TEXT,
            images TEXT
        )
    """)
    
    # Create Cart Items table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            saved_for_later INTEGER DEFAULT 0,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(product_id) REFERENCES products(id),
            UNIQUE(user_id, product_id)
        )
    """)
    
    # Create Orders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_price REAL NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            delivery_slot TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            items TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    
    # Create Reviews table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            user_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            created_at TEXT NOT NULL,
            helpful_votes INTEGER DEFAULT 0,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
