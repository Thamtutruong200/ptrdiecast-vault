from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from api.models import (
    DiecastCreate,
    DiecastUpdate,
    DiecastResponse,
    CollectionStats,
    DuplicateCheckRequest,
    DuplicateCheckResponse
)
from api import database

router = APIRouter(tags=["items"])

@router.get("/items", response_model=List[DiecastResponse])
def list_items(
    q: Optional[str] = Query(None, description="Search keyword across model, brand, livery, notes"),
    scale: Optional[str] = Query(None, description="Filter by scale e.g. 1:64, 1:43, 1:18"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    is_favorite: Optional[bool] = Query(None, description="Filter favorites"),
    sort_by: Optional[str] = Query("created_at", description="Sort field: created_at, current_value, purchase_price, casting_name"),
    sort_order: Optional[str] = Query("desc", description="Sort direction: asc or desc")
):
    """Retrieve all diecast collection items with optional search, filtering, and sorting."""
    return database.get_items(
        query=q,
        scale=scale,
        brand=brand,
        condition=condition,
        is_favorite=is_favorite,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.get("/stats", response_model=CollectionStats)
def get_stats():
    """Calculate aggregated collection statistics, total investment (VND), and market valuation."""
    return database.calculate_stats()

@router.get("/items/{item_id}", response_model=DiecastResponse)
def get_item(item_id: str):
    """Get single diecast item details by ID."""
    item = database.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diecast item not found")
    return item

@router.post("/items", response_model=DiecastResponse, status_code=status.HTTP_201_CREATED)
def create_item(payload: DiecastCreate):
    """Add a new diecast model to the collection."""
    return database.create_item(payload)

@router.put("/items/{item_id}", response_model=DiecastResponse)
def update_item(item_id: str, payload: DiecastUpdate):
    """Update details of an existing diecast model."""
    updated = database.update_item(item_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diecast item not found")
    return updated

@router.delete("/items/{item_id}", status_code=status.HTTP_200_OK)
def delete_item(item_id: str):
    """Delete a diecast model from the collection."""
    success = database.delete_item(item_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diecast item not found")
    return {"message": "Diecast item deleted successfully", "id": item_id}

@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
def check_duplicate(payload: DuplicateCheckRequest):
    """Check if a casting name or livery already exists in the collection to prevent unwanted duplicates."""
    matches = database.check_duplicates(
        casting_name=payload.casting_name,
        brand=payload.brand,
        livery=payload.livery,
        exclude_id=payload.exclude_id
    )
    return DuplicateCheckResponse(
        is_duplicate=(len(matches) > 0),
        matching_items=matches
    )

@router.post("/bulk-import", response_model=List[DiecastResponse])
def bulk_import(items: List[DiecastCreate]):
    """Bulk import diecast items from CSV or JSON backup."""
    imported = []
    for item_data in items:
        imported.append(database.create_item(item_data))
    return imported
