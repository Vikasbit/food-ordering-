-- ========================================================
-- BigBites Two-Sided Food Delivery Marketplace Supabase Schema
-- ========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Connected to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'seller', 'admin')) DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  google_place_id TEXT,
  cuisine TEXT NOT NULL,
  phone TEXT NOT NULL,
  opening_hours TEXT DEFAULT '10:00 AM - 11:00 PM',
  delivery_radius_km NUMERIC DEFAULT 12,
  status TEXT CHECK (status IN ('active', 'inactive', 'closed')) DEFAULT 'active',
  logo_url TEXT,
  cover_url TEXT,
  rating NUMERIC DEFAULT 4.8,
  reviews_count INT DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MENU CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  is_veg BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  prep_time_min INT DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SAVED ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT CHECK (label IN ('HOME', 'WORK', 'OTHER')) DEFAULT 'HOME',
  formatted_address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  flat_no TEXT,
  landmark TEXT,
  instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  driver_id UUID,
  delivery_address TEXT NOT NULL,
  delivery_lat DOUBLE PRECISION NOT NULL,
  delivery_lng DOUBLE PRECISION NOT NULL,
  status TEXT CHECK (status IN (
    'PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP',
    'DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  )) DEFAULT 'PENDING',
  subtotal NUMERIC NOT NULL,
  gst_tax NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'UPI_QR',
  payment_status TEXT CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')) DEFAULT 'PAID',
  coupon_code TEXT,
  estimated_delivery_min INT DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL
);

-- 8. DRIVER LOCATIONS TABLE (Realtime Driver GPS)
CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION DEFAULT 0,
  speed DOUBLE PRECISION DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customer Policies:
CREATE POLICY "Public profiles can be read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Restaurant Policies:
CREATE POLICY "Anyone can view active restaurants" ON public.restaurants FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "Sellers can create restaurants" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own restaurant" ON public.restaurants FOR UPDATE USING (auth.uid() = seller_id);

-- Menu Item Policies:
CREATE POLICY "Anyone can view available menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Sellers can edit own menu items" ON public.menu_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r WHERE r.id = menu_items.restaurant_id AND r.seller_id = auth.uid()
  )
);

-- Orders Policies:
CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id OR EXISTS (
    SELECT 1 FROM public.restaurants r WHERE r.id = orders.restaurant_id AND r.seller_id = auth.uid()
  )
);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Sellers can update order status for their restaurant" ON public.orders FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r WHERE r.id = orders.restaurant_id AND r.seller_id = auth.uid()
  )
);
