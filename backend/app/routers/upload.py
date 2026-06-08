from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
import uuid
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    
    # Check file extension
    allowed = [".jpg", ".jpeg", ".png"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Sadece .jpg, .jpeg, .png dosyaları kabul edilir"
        )
    
    # Check file size (5MB max)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Dosya boyutu 5MB'dan büyük olamaz"
        )
    
    # Save file with unique name
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)
    
    return {
        "url": f"http://localhost:8000/static/uploads/{filename}"
    }
