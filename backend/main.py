import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from app.database import engine, Base
from app.models import *
from app.routers.auth import router as auth_router
from app.routers.clubs import router as clubs_router
from app.routers.events import router as events_router

app = FastAPI(title="Campus Hub API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(clubs_router, prefix="/clubs")
app.include_router(events_router, prefix="/events")

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
