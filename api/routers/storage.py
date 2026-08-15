import base64
import uuid
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from api.database import upload_file_to_supabase
from api.config import IS_SUPABASE_CONFIGURED

router = APIRouter(tags=["storage"])

@router.post("/upload")
async def upload_photo(file: UploadFile = File(...)):
    """
    Upload a single diecast photo to Supabase Object Storage bucket 'diecast-photos'.
    If Supabase is not configured, returns a base64 Data URI so the image is immediately viewable in local demo mode.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File provided is not an image."
        )

    content = await file.read()
    filename = file.filename or f"photo-{uuid.uuid4().hex[:8]}.jpg"

    # Try uploading to Supabase Storage if configured
    if IS_SUPABASE_CONFIGURED:
        public_url = upload_file_to_supabase(content, filename, file.content_type)
        if public_url:
            return {"url": public_url, "filename": filename, "source": "supabase"}

    # Fallback to Base64 Data URI
    encoded = base64.b64encode(content).decode("utf-8")
    data_uri = f"data:{file.content_type};base64,{encoded}"
    return {"url": data_uri, "filename": filename, "source": "local_base64"}


@router.post("/upload-multiple")
async def upload_multiple_photos(files: List[UploadFile] = File(...)):
    """Upload multiple photos at once and return an array of URLs."""
    results = []
    for file in files:
        if not file.content_type.startswith("image/"):
            continue
        content = await file.read()
        filename = file.filename or f"photo-{uuid.uuid4().hex[:8]}.jpg"
        
        if IS_SUPABASE_CONFIGURED:
            public_url = upload_file_to_supabase(content, filename, file.content_type)
            if public_url:
                results.append({"url": public_url, "filename": filename, "source": "supabase"})
                continue

        encoded = base64.b64encode(content).decode("utf-8")
        data_uri = f"data:{file.content_type};base64,{encoded}"
        results.append({"url": data_uri, "filename": filename, "source": "local_base64"})

    return {"uploaded": results, "count": len(results)}
