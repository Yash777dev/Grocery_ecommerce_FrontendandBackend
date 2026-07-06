import json
from auth import hash_password, verify_password, create_access_token, decode_access_token
from database import get_db_connection

def test_auth():
    print("Testing password hashing...")
    pw = "mysecret123"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrong", hashed) is False
    print("Password hashing works!")

    print("Testing JWT...")
    payload = {"user_id": 42, "email": "test@eco.com"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["user_id"] == 42
    assert decoded["email"] == "test@eco.com"
    print("JWT works!")

def test_db_queries():
    print("Testing database connection and seeded products...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check users
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    print(f"Found {len(users)} users.")
    for u in users:
        print(f" - {u['name']} ({u['email']})")
        
    # Check products
    cursor.execute("SELECT * FROM products LIMIT 3")
    products = cursor.fetchall()
    print(f"Found products in DB:")
    for p in products:
        print(f" - ID {p['id']}: {p['name']} (${p['price']}) - Category: {p['category']}")
        images = json.loads(p['images'])
        assert len(images) > 0
        
    conn.close()
    print("Database queries work successfully!")

if __name__ == "__main__":
    test_auth()
    test_db_queries()
