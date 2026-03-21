from fastapi import FastAPI

app = FastAPI(title="Campus Hub API", version="0.1.0")


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Campus Hub API is running"}
