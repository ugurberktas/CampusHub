from sqlalchemy import text
from app.database import engine

def run_migrations():
    print("🚀 Starting minimal migrations...")
    try:
        with engine.begin() as connection:
            # Check if grade column exists in users table
            result = connection.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='grade'"
            ))
            if not result.fetchone():
                print("⏳ Adding 'grade' column to 'users' table...")
                connection.execute(text("ALTER TABLE users ADD COLUMN grade VARCHAR(50)"))
                print("✅ Added 'grade' column successfully.")
            else:
                print("✅ 'grade' column already exists in 'users' table.")
            
            # Check if image_url column exists in events table
            result2 = connection.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='events' AND column_name='image_url'"
            ))
            if not result2.fetchone():
                print("⏳ Adding 'image_url' column to 'events' table...")
                connection.execute(text("ALTER TABLE events ADD COLUMN image_url VARCHAR(500)"))
                print("✅ Added 'image_url' column successfully.")
            else:
                print("✅ 'image_url' column already exists in 'events' table.")
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    run_migrations()
