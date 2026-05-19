import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from app.database import engine, Base
from app.models import *
from app.routers.auth import router as auth_router
from app.routers.clubs import router as clubs_router
from app.routers.events import router as events_router
from app.routers.sks import router as sks_router
from app.routers.salons import router as salons_router
from fastapi.staticfiles import StaticFiles
from app.routers.upload import router as upload_router

app = FastAPI(title="Campus Hub API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(clubs_router, prefix="/clubs")
app.include_router(events_router, prefix="/events")
app.include_router(sks_router)
app.include_router(salons_router, prefix="")
app.include_router(upload_router)
app.mount("/static", StaticFiles(directory="static"), name="static")

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
