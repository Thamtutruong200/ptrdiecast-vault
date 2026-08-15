-- ============================================================================
-- DIECAST TRACKER - IDEMPOTENT SUPABASE DATABASE & STORAGE SCHEMA
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Diecasts Table
CREATE TABLE IF NOT EXISTS public.diecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL,
    scale TEXT NOT NULL DEFAULT '1:64',
    casting_name TEXT NOT NULL,
    livery TEXT,
    color TEXT,
    era TEXT,
    condition TEXT NOT NULL DEFAULT 'Mint in Box',
    purchase_price NUMERIC DEFAULT 0,
    current_value NUMERIC DEFAULT 0,
    valuation_source TEXT DEFAULT 'Market Comps (eBay / Auctions)',
    notes TEXT,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    reference_photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes for High Performance Search and Filtering
CREATE INDEX IF NOT EXISTS idx_diecasts_scale ON public.diecasts(scale);
CREATE INDEX IF NOT EXISTS idx_diecasts_brand ON public.diecasts(brand);
CREATE INDEX IF NOT EXISTS idx_diecasts_condition ON public.diecasts(condition);
CREATE INDEX IF NOT EXISTS idx_diecasts_casting ON public.diecasts(casting_name);
CREATE INDEX IF NOT EXISTS idx_diecasts_created_at ON public.diecasts(created_at DESC);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_diecasts_fts ON public.diecasts 
USING gin(to_tsvector('english', coalesce(brand, '') || ' ' || coalesce(casting_name, '') || ' ' || coalesce(livery, '') || ' ' || coalesce(color, '') || ' ' || coalesce(notes, '')));

-- 4. Automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_diecasts_updated_at ON public.diecasts;
CREATE TRIGGER trigger_diecasts_updated_at
BEFORE UPDATE ON public.diecasts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security (RLS) & Idempotent Policies
ALTER TABLE public.diecasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to diecasts" ON public.diecasts;
CREATE POLICY "Allow public read access to diecasts" 
ON public.diecasts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to diecasts" ON public.diecasts;
CREATE POLICY "Allow public insert access to diecasts" 
ON public.diecasts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to diecasts" ON public.diecasts;
CREATE POLICY "Allow public update access to diecasts" 
ON public.diecasts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to diecasts" ON public.diecasts;
CREATE POLICY "Allow public delete access to diecasts" 
ON public.diecasts FOR DELETE USING (true);

-- 6. Storage Bucket for Diecast Photos & Idempotent Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('diecast-photos', 'diecast-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Access for Diecast Photos" ON storage.objects;
CREATE POLICY "Public Read Access for Diecast Photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'diecast-photos');

DROP POLICY IF EXISTS "Public Insert Access for Diecast Photos" ON storage.objects;
CREATE POLICY "Public Insert Access for Diecast Photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'diecast-photos');

DROP POLICY IF EXISTS "Public Update Access for Diecast Photos" ON storage.objects;
CREATE POLICY "Public Update Access for Diecast Photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'diecast-photos');

DROP POLICY IF EXISTS "Public Delete Access for Diecast Photos" ON storage.objects;
CREATE POLICY "Public Delete Access for Diecast Photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'diecast-photos');

-- 7. Seed Initial Diecast Models (Minichamps, AUTOart, Spark, Hot Wheels RLC, Mini GT)
INSERT INTO public.diecasts (brand, scale, casting_name, livery, color, era, condition, purchase_price, current_value, valuation_source, notes, photos, reference_photos, is_favorite)
VALUES 
(
    'Minichamps',
    '1:18',
    'Porsche 911 (992) GT3 RS',
    'Weissach Package / Pyro Red Accents',
    'Ice Grey Metallic / Pyro Red Wheels',
    'Modern Supercar',
    'Mint in Box',
    4200000,
    7800000,
    'Market Comps (eBay Sold / European Auctions)',
    'Limited edition of 504 pieces worldwide. Full diecast metal body with opening doors, active aero DRS wing replica, and detailed carbon Weissach weave.',
    ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80']::TEXT[],
    ARRAY[]::TEXT[],
    true
),
(
    'Minichamps',
    '1:43',
    'Oracle Red Bull Racing RB19',
    'Max Verstappen #1 World Champion 2023',
    'Matte Navy / Yellow & Red Bull Bull',
    '2023 Formula 1',
    'Mint in Box',
    1950000,
    3400000,
    'HobbyDB & F1 Collector Index',
    'Record-breaking 19 wins in a single season. Includes driver figure standing on halo, pitboard #1 World Champion, and custom acrylic display plinth.',
    ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80']::TEXT[],
    ARRAY[]::TEXT[],
    true
),
(
    'Hot Wheels RLC',
    '1:64',
    'Nissan Skyline GT-R (BNR34)',
    'Nismo Clubman Race Spec',
    'Spectraflame Chameleon',
    '1990s JDM',
    'Mint in Box',
    1250000,
    2800000,
    'Market Comps (eBay Sold & Yahoo Japan)',
    'Numbered 04821/25000. Real Riders rubber tires, opening hood with RB26DETT twin-turbo engine detail.',
    ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80']::TEXT[],
    ARRAY['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80']::TEXT[],
    true
),
(
    'Mini GT',
    '1:64',
    'Porsche 911 GT3 R',
    'Pfaff Motorsports #9 "Plaid GT3"',
    'Red/Black Plaid Pattern',
    'Modern IMSA GTD',
    'Mint in Box',
    380000,
    650000,
    'Recent Collector Transactions (Mini GT Vietnam Hub)',
    'IMSA WeatherTech SportsCar Championship 2021 Sebring 12h Class Winner.',
    ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80']::TEXT[],
    ARRAY[]::TEXT[],
    true
),
(
    'AUTOart',
    '1:18',
    'Mazda 787B',
    'Renown Charge #55',
    'Green / Orange Argyle Renown',
    '1991 Le Mans Group C',
    'Mint in Box',
    6800000,
    11500000,
    'Appraisal & High-End Auction Comps',
    '1991 24 Hours of Le Mans overall winner. Iconic 4-rotor R26B engine replica with fully removable rear cowl.',
    ARRAY['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80']::TEXT[],
    ARRAY[]::TEXT[],
    true
),
(
    'Spark',
    '1:43',
    'Porsche 956',
    'Rothmans Racing #1',
    'Blue / White / Gold Racing',
    '1982 Le Mans',
    'Loose Mint',
    1850000,
    2600000,
    'Market Comps (European Resin Models Guide)',
    'Driven by Jacky Ickx & Derek Bell. Full resin precision casting with detailed cockpit telemetry.',
    ARRAY['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80']::TEXT[],
    ARRAY[]::TEXT[],
    false
)
ON CONFLICT DO NOTHING;
