import time
from fastapi import FastAPI
from sqlalchemy.exc import OperationalError
from app.database import engine, Base

app = FastAPI(title="Campus Hub API", version="0.1.0")


@app.on_event("startup")
def startup():
    max_retries = 5
    wait_seconds = 2

    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as connection:
                print(f"✅ Database connection successful (attempt {attempt})")
            break
        except OperationalError as e:
            print(f"⚠️  DB not ready (attempt {attempt}/{max_retries}): {e}")
            if attempt == max_retries:
                raise RuntimeError("Could not connect to the database after multiple retries.") from e
            time.sleep(wait_seconds)

    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Campus Hub API"}
