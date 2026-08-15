from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class DiecastBase(BaseModel):
    brand: str = Field(..., description="Brand / Manufacturer e.g. Minichamps, Hot Wheels RLC, Mini GT, Inno64, AUTOart")
    scale: str = Field(default="1:64", description="Scale e.g. 1:64, 1:43, 1:24, 1:18, 1:12, Other")
    casting_name: str = Field(..., description="Vehicle Model / Casting Name e.g. Porsche 911 GT3 RS Weissach")
    livery: Optional[str] = Field(default="", description="Racing Livery or Special Edition e.g. Calsonic #12, Gulf Racing")
    color: Optional[str] = Field(default="", description="Vehicle primary or secondary color")
    era: Optional[str] = Field(default="", description="Era / Category e.g. 1990s JDM, Modern GT3, Formula 1")
    condition: str = Field(default="Mint in Box", description="Condition: Mint in Box, Loose Mint, Displayed, Custom, Fair")
    purchase_price: float = Field(default=0.0, description="Purchase cost in VND")
    current_value: float = Field(default=0.0, description="Current market / estimated value in VND")
    valuation_source: Optional[str] = Field(default="Market Comps (eBay / Auctions)", description="Source of valuation: Market Comps, HobbyDB Index, AI Estimate, Appraisal")
    storage_location: Optional[str] = Field(default="", description="Display case, shelf, or storage box number")
    notes: Optional[str] = Field(default="", description="Collector notes, serial numbers, details")
    photos: List[str] = Field(default_factory=list, description="Array of photo URLs")
    reference_photos: List[str] = Field(default_factory=list, description="Array of real-car or packaging reference URLs")
    is_favorite: bool = Field(default=False, description="Favorite bookmark toggle")

class DiecastCreate(DiecastBase):
    pass

class DiecastUpdate(BaseModel):
    brand: Optional[str] = None
    scale: Optional[str] = None
    casting_name: Optional[str] = None
    livery: Optional[str] = None
    color: Optional[str] = None
    era: Optional[str] = None
    condition: Optional[str] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    valuation_source: Optional[str] = None
    storage_location: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[List[str]] = None
    reference_photos: Optional[List[str]] = None
    is_favorite: Optional[bool] = None

class DiecastResponse(DiecastBase):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class CollectionStats(BaseModel):
    total_count: int
    total_paid: float
    total_value: float
    total_profit: float
    profit_percentage: float
    scale_breakdown: Dict[str, int]
    brand_breakdown: Dict[str, int]
    condition_breakdown: Dict[str, int]
    favorites_count: int
    top_gainer: Optional[Dict[str, Any]] = None

class DuplicateCheckRequest(BaseModel):
    casting_name: str
    brand: Optional[str] = None
    livery: Optional[str] = None
    exclude_id: Optional[str] = None

class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    matching_items: List[DiecastResponse] = []

class AIIdentifyRequest(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None

class AIIdentifyResponse(BaseModel):
    brand: Optional[str] = ""
    scale: Optional[str] = "1:64"
    casting_name: Optional[str] = ""
    livery: Optional[str] = ""
    color: Optional[str] = ""
    era: Optional[str] = ""
    suggested_condition: Optional[str] = "Mint in Box"
    estimated_market_value: Optional[float] = 0.0
    valuation_source: Optional[str] = "AI Vision & Collector Comps Index"
    confidence: Optional[float] = 0.0
    notes: Optional[str] = ""
