import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import logging
from api.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_STORAGE_BUCKET, IS_SUPABASE_CONFIGURED
from api.models import DiecastCreate, DiecastUpdate, DiecastResponse, CollectionStats

logger = logging.getLogger("diecast-tracker")

# In-memory mock storage fallback with authentic Minichamps, AUTOart, Spark & Hot Wheels diecasts
MOCK_DATABASE: List[Dict[str, Any]] = [
    {
        "id": "m1a2c3d4-minichamps-18-porsche-gt3rs",
        "brand": "Minichamps",
        "scale": "1:18",
        "casting_name": "Porsche 911 (992) GT3 RS",
        "livery": "Weissach Package / Pyro Red Accents",
        "color": "Ice Grey Metallic / Pyro Red Wheels",
        "era": "Modern Supercar",
        "condition": "Mint in Box",
        "purchase_price": 4200000,
        "current_value": 7800000,
        "valuation_source": "Market Comps (eBay Sold / European Auctions)",
        "storage_location": "Center Display Case S-01",
        "notes": "Limited edition of 504 pieces worldwide. Full diecast metal body with opening doors, active aero DRS wing replica, and detailed carbon Weissach weave.",
        "photos": ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80"],
        "reference_photos": [],
        "is_favorite": True,
        "created_at": "2024-05-12T10:00:00Z",
        "updated_at": "2024-05-12T10:00:00Z"
    },
    {
        "id": "m2b3c4d5-minichamps-43-redbull-rb19",
        "brand": "Minichamps",
        "scale": "1:43",
        "casting_name": "Oracle Red Bull Racing RB19",
        "livery": "Max Verstappen #1 World Champion 2023",
        "color": "Matte Navy / Yellow & Red Bull Bull",
        "era": "2023 Formula 1",
        "condition": "Mint in Box",
        "purchase_price": 1950000,
        "current_value": 3400000,
        "valuation_source": "HobbyDB & F1 Collector Index",
        "storage_location": "F1 Acrylic Showcase F-02",
        "notes": "Record-breaking 19 wins in a single season. Includes driver figure standing on halo, pitboard '#1 World Champion', and custom acrylic display plinth.",
        "photos": ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80"],
        "reference_photos": [],
        "is_favorite": True,
        "created_at": "2024-05-01T15:00:00Z",
        "updated_at": "2024-05-01T15:00:00Z"
    },
    {
        "id": "c1f7b764-839e-4c7b-b83b-9a72d3f74011",
        "brand": "Hot Wheels RLC",
        "scale": "1:64",
        "casting_name": "Nissan Skyline GT-R (BNR34)",
        "livery": "Nismo Clubman Race Spec",
        "color": "Spectraflame Chameleon",
        "era": "1990s JDM",
        "condition": "Mint in Box",
        "purchase_price": 1250000,
        "current_value": 2800000,
        "valuation_source": "Market Comps (eBay Sold & Yahoo Japan)",
        "storage_location": "Acrylic Case A-01",
        "notes": "Numbered 04821/25000. Real Riders rubber tires, opening hood with RB26DETT twin-turbo engine detail.",
        "photos": ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80"],
        "reference_photos": ["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"],
        "is_favorite": True,
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
    },
    {
        "id": "d2e8c875-94af-5d8c-c94c-ab83e4a85122",
        "brand": "Mini GT",
        "scale": "1:64",
        "casting_name": "Porsche 911 GT3 R",
        "livery": "Pfaff Motorsports #9 'Plaid GT3'",
        "color": "Red / Black Plaid Pattern",
        "era": "Modern IMSA GTD",
        "condition": "Mint in Box",
        "purchase_price": 380000,
        "current_value": 650000,
        "valuation_source": "Recent Collector Transactions (Mini GT Vietnam Hub)",
        "storage_location": "Display Shelf B2",
        "notes": "IMSA WeatherTech SportsCar Championship 2021 Sebring 12h Class Winner.",
        "photos": ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"],
        "reference_photos": [],
        "is_favorite": True,
        "created_at": "2024-02-10T14:30:00Z",
        "updated_at": "2024-02-10T14:30:00Z"
    },
    {
        "id": "f4a0ea97-16cb-7fae-eb6e-cda5a6ca7344",
        "brand": "AUTOart",
        "scale": "1:18",
        "casting_name": "Mazda 787B",
        "livery": "Renown Charge #55",
        "color": "Green / Orange Argyle Renown",
        "era": "1991 Le Mans Group C",
        "condition": "Mint in Box",
        "purchase_price": 6800000,
        "current_value": 11500000,
        "valuation_source": "Appraisal & High-End Auction Comps",
        "storage_location": "Center Glass Showcase",
        "notes": "1991 24 Hours of Le Mans overall winner. Iconic 4-rotor R26B engine replica with fully removable rear cowl and working suspension.",
        "photos": ["https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80"],
        "reference_photos": [],
        "is_favorite": True,
        "created_at": "2024-03-20T16:45:00Z",
        "updated_at": "2024-03-20T16:45:00Z"
    },
    {
        "id": "a5b1fb08-27dc-8abf-fc7f-deb6b7db8455",
        "brand": "Spark",
        "scale": "1:43",
        "casting_name": "Porsche 956",
        "livery": "Rothmans Racing #1",
        "color": "Blue / White / Gold Racing",
        "era": "1982 Le Mans",
        "condition": "Loose Mint",
        "purchase_price": 1850000,
        "current_value": 2600000,
        "valuation_source": "Market Comps (European Resin Models Guide)",
        "storage_location": "Case C-03",
        "notes": "Driven by Jacky Ickx & Derek Bell. High-precision resin casting with aerodynamic ground-effect underbody detail.",
        "photos": ["https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80"],
        "reference_photos": [],
        "is_favorite": False,
        "created_at": "2024-04-05T11:20:00Z",
        "updated_at": "2024-04-05T11:20:00Z"
    }
]

supabase_client = None

def get_supabase():
    global supabase_client
    if supabase_client is not None:
        return supabase_client
    
    if IS_SUPABASE_CONFIGURED:
        try:
            from supabase import create_client, Client
            supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("Connected to Supabase PostgreSQL & Storage.")
            return supabase_client
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}. Falling back to in-memory store.")
            return None
    return None


def get_items(
    query: Optional[str] = None,
    scale: Optional[str] = None,
    brand: Optional[str] = None,
    condition: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc"
) -> List[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            req = client.table("diecasts").select("*")
            if scale and scale != "All":
                req = req.eq("scale", scale)
            if brand and brand != "All":
                req = req.eq("brand", brand)
            if condition and condition != "All":
                req = req.eq("condition", condition)
            if is_favorite is not None:
                req = req.eq("is_favorite", is_favorite)
            
            if query:
                q = query.strip()
                req = req.or_(f"casting_name.ilike.%{q}%,brand.ilike.%{q}%,livery.ilike.%{q}%,color.ilike.%{q}%,storage_location.ilike.%{q}%,notes.ilike.%{q}%")
            
            is_asc = (sort_order.lower() == "asc")
            valid_sort_fields = ["created_at", "current_value", "purchase_price", "casting_name", "brand", "scale"]
            sort_field = sort_by if sort_by in valid_sort_fields else "created_at"
            
            req = req.order(sort_field, desc=not is_asc)
            res = req.execute()
            return res.data or []
        except Exception as e:
            logger.error(f"Supabase get_items query error: {e}. Fallback to mock data.")

    # In-memory fallback
    results = list(MOCK_DATABASE)
    if scale and scale != "All":
        results = [x for x in results if x.get("scale") == scale]
    if brand and brand != "All":
        results = [x for x in results if x.get("brand") == brand]
    if condition and condition != "All":
        results = [x for x in results if x.get("condition") == condition]
    if is_favorite is not None:
        results = [x for x in results if x.get("is_favorite") == is_favorite]
    
    if query:
        q = query.lower().strip()
        results = [
            x for x in results if (
                q in x.get("casting_name", "").lower() or
                q in x.get("brand", "").lower() or
                q in (x.get("livery") or "").lower() or
                q in (x.get("color") or "").lower() or
                q in (x.get("storage_location") or "").lower() or
                q in (x.get("notes") or "").lower()
            )
        ]

    reverse = (sort_order.lower() == "desc")
    if sort_by == "current_value":
        results.sort(key=lambda x: float(x.get("current_value", 0)), reverse=reverse)
    elif sort_by == "purchase_price":
        results.sort(key=lambda x: float(x.get("purchase_price", 0)), reverse=reverse)
    elif sort_by == "casting_name":
        results.sort(key=lambda x: x.get("casting_name", "").lower(), reverse=reverse)
    elif sort_by == "brand":
        results.sort(key=lambda x: x.get("brand", "").lower(), reverse=reverse)
    else:
        results.sort(key=lambda x: x.get("created_at", ""), reverse=reverse)

    return results


def get_item_by_id(item_id: str) -> Optional[Dict[str, Any]]:
    client = get_supabase()
    if client:
        try:
            res = client.table("diecasts").select("*").eq("id", item_id).single().execute()
            return res.data
        except Exception as e:
            logger.error(f"Supabase get_item_by_id error: {e}")

    for item in MOCK_DATABASE:
        if item.get("id") == item_id:
            return item
    return None


def create_item(data: DiecastCreate) -> Dict[str, Any]:
    now_str = datetime.now(timezone.utc).isoformat()
    item_dict = data.model_dump()
    item_dict["created_at"] = now_str
    item_dict["updated_at"] = now_str
    if not item_dict.get("valuation_source"):
        item_dict["valuation_source"] = "Market Comps (eBay / Auctions)"

    client = get_supabase()
    if client:
        try:
            res = client.table("diecasts").insert(item_dict).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase create_item error: {e}")

    item_dict["id"] = str(uuid.uuid4())
    MOCK_DATABASE.insert(0, item_dict)
    return item_dict


def update_item(item_id: str, data: DiecastUpdate) -> Optional[Dict[str, Any]]:
    now_str = datetime.now(timezone.utc).isoformat()
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    update_dict["updated_at"] = now_str

    client = get_supabase()
    if client:
        try:
            res = client.table("diecasts").update(update_dict).eq("id", item_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase update_item error: {e}")

    for i, item in enumerate(MOCK_DATABASE):
        if item.get("id") == item_id:
            MOCK_DATABASE[i].update(update_dict)
            return MOCK_DATABASE[i]
    return None


def delete_item(item_id: str) -> bool:
    client = get_supabase()
    if client:
        try:
            res = client.table("diecasts").delete().eq("id", item_id).execute()
            return True
        except Exception as e:
            logger.error(f"Supabase delete_item error: {e}")

    global MOCK_DATABASE
    initial_len = len(MOCK_DATABASE)
    MOCK_DATABASE = [x for x in MOCK_DATABASE if x.get("id") != item_id]
    return len(MOCK_DATABASE) < initial_len


def calculate_stats() -> CollectionStats:
    items = get_items()
    total_count = len(items)
    total_paid = sum(float(x.get("purchase_price", 0) or 0) for x in items)
    total_value = sum(float(x.get("current_value", 0) or 0) for x in items)
    total_profit = total_value - total_paid
    profit_pct = (total_profit / total_paid * 100) if total_paid > 0 else 0.0

    scale_counts: Dict[str, int] = {}
    brand_counts: Dict[str, int] = {}
    condition_counts: Dict[str, int] = {}
    fav_count = 0
    top_gainer = None
    max_gain = -1

    for it in items:
        sc = it.get("scale") or "Other"
        scale_counts[sc] = scale_counts.get(sc, 0) + 1

        br = it.get("brand") or "Unknown"
        brand_counts[br] = brand_counts.get(br, 0) + 1

        cond = it.get("condition") or "Unknown"
        condition_counts[cond] = condition_counts.get(cond, 0) + 1

        if it.get("is_favorite"):
            fav_count += 1

        gain = float(it.get("current_value", 0) or 0) - float(it.get("purchase_price", 0) or 0)
        if gain > max_gain:
            max_gain = gain
            top_gainer = it

    return CollectionStats(
        total_count=total_count,
        total_paid=total_paid,
        total_value=total_value,
        total_profit=total_profit,
        profit_percentage=round(profit_pct, 1),
        scale_breakdown=scale_counts,
        brand_breakdown=brand_counts,
        condition_breakdown=condition_counts,
        favorites_count=fav_count,
        top_gainer=top_gainer
    )


def check_duplicates(casting_name: str, brand: Optional[str] = None, livery: Optional[str] = None, exclude_id: Optional[str] = None) -> List[Dict[str, Any]]:
    items = get_items()
    target_c = casting_name.strip().lower() if casting_name else ""
    target_b = brand.strip().lower() if brand else ""
    target_l = livery.strip().lower() if livery else ""

    matches = []
    for item in items:
        if exclude_id and item.get("id") == exclude_id:
            continue
        
        item_c = (item.get("casting_name") or "").strip().lower()
        item_b = (item.get("brand") or "").strip().lower()
        item_l = (item.get("livery") or "").strip().lower()

        if target_c and (target_c == item_c or target_c in item_c or item_c in target_c):
            if target_b and item_b and (target_b in item_b or item_b in target_b):
                matches.append(item)
            elif not target_b:
                matches.append(item)
            elif target_l and item_l and (target_l in item_l or item_l in target_l):
                matches.append(item)

    return matches


def upload_file_to_supabase(file_bytes: bytes, filename: str, content_type: str) -> Optional[str]:
    client = get_supabase()
    if client:
        try:
            unique_filename = f"{uuid.uuid4()}-{filename}"
            bucket = SUPABASE_STORAGE_BUCKET
            client.storage.from_(bucket).upload(
                path=unique_filename,
                file=file_bytes,
                file_options={"content-type": content_type, "cache-control": "3600", "upsert": "true"}
            )
            public_url = client.storage.from_(bucket).get_public_url(unique_filename)
            return public_url
        except Exception as e:
            logger.error(f"Supabase storage upload error: {e}")
    return None
