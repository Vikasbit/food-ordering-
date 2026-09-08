-- ========================================================
-- BIGBITES PRODUCTION SUPABASE DATABASE MIGRATION
-- Complete Schema, Foreign Keys, Functions, RLS & Seed Data
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Identity mapped to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'seller', 'delivery_partner', 'admin')) DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESTAURANTS TABLE (Supports string IDs like "kitchen-1" and UUIDs)
CREATE TABLE IF NOT EXISTS public.restaurants (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  cuisine TEXT NOT NULL,
  phone TEXT NOT NULL,
  opening_hours TEXT DEFAULT '10:00 AM - 11:00 PM',
  delivery_radius_km NUMERIC DEFAULT 15,
  status TEXT DEFAULT 'active',
  logo_url TEXT,
  cover_url TEXT,
  rating NUMERIC DEFAULT 4.8,
  reviews_count INT DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MENU CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  is_veg BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  prep_time_min INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  driver_name TEXT,
  driver_phone TEXT,
  delivery_address TEXT,
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  delivery_location JSONB,
  status TEXT DEFAULT 'PENDING',
  payment_method TEXT DEFAULT 'UPI',
  payment_status TEXT DEFAULT 'PENDING',
  amount NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  coupon_code TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  accepted_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  out_for_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT,
  provider_payment_id TEXT,
  status TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_place_id TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DRIVER LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  heading DOUBLE PRECISION DEFAULT 0,
  speed DOUBLE PRECISION DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- INDEXES FOR OPTIMIZATION
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON public.restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON public.restaurants(city);
CREATE INDEX IF NOT EXISTS idx_menu_categories_rest ON public.menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_rest ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_cat ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_rest_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_order ON public.driver_locations(order_id);

-- ========================================================
-- SECURITY & AUTOMATION FUNCTIONS / TRIGGERS
-- ========================================================

-- 1. Helper function: check if authenticated user is admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Prevent role self-escalation trigger on profiles
-- Even if an attacker crafts an UPDATE request with role='admin', this trigger rejects it.
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Users cannot change their own role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();

-- 3. Sync user_id and customer_id on orders
CREATE OR REPLACE FUNCTION public.sync_order_user_ids()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_id IS NULL AND NEW.customer_id IS NOT NULL THEN
    NEW.user_id := NEW.customer_id;
  ELSIF NEW.customer_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.customer_id := NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_order_user_ids ON public.orders;
CREATE TRIGGER trg_sync_order_user_ids
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.sync_order_user_ids();

-- 4. Authoritative profile creation on auth.users signup
-- CRITICAL SECURITY FIX: ALWAYS forces role = 'customer'.
-- Never trusts client-supplied metadata for role assignment.
-- ON CONFLICT preserves existing role if user already has an elevated role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- PROFILES RLS (Strict Privacy: No Public Exposure of Emails/Phones)
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles can be read" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    -- Customer views own profile
    auth.uid() = id
    -- Admins can view profiles
    OR public.is_admin()
    -- Restaurant sellers can view customer info for orders placed at their restaurant
    OR EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.restaurants r ON r.id = o.restaurant_id
      WHERE (o.user_id = profiles.id OR o.customer_id = profiles.id)
        AND r.seller_id = auth.uid()
    )
    -- Drivers can view recipient info for their assigned deliveries
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE (o.user_id = profiles.id OR o.customer_id = profiles.id)
        AND o.driver_id = auth.uid()
    )
    -- Customers can view assigned driver info for their active order
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE profiles.id = o.driver_id
        AND (o.user_id = auth.uid() OR o.customer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND role = 'customer');

DROP POLICY IF EXISTS "Users can edit own profile" ON public.profiles;
CREATE POLICY "Users can edit own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- --------------------------------------------------------
-- RESTAURANTS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view active restaurants" ON public.restaurants;
CREATE POLICY "Anyone can view active restaurants" ON public.restaurants
  FOR SELECT USING (status ILIKE 'active' OR auth.uid() = seller_id OR public.is_admin());

DROP POLICY IF EXISTS "Sellers can create restaurants" ON public.restaurants;
CREATE POLICY "Sellers can create restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (
    (auth.uid() = seller_id AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('seller', 'admin'))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Sellers can update own restaurant" ON public.restaurants;
CREATE POLICY "Sellers can update own restaurant" ON public.restaurants
  FOR UPDATE USING (
    (auth.uid() = seller_id AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('seller', 'admin'))
    OR public.is_admin()
  );

-- --------------------------------------------------------
-- MENU CATEGORIES RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view menu categories" ON public.menu_categories;
CREATE POLICY "Anyone can view menu categories" ON public.menu_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can manage categories" ON public.menu_categories;
CREATE POLICY "Sellers can manage categories" ON public.menu_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = menu_categories.restaurant_id
        AND (r.seller_id = auth.uid() OR public.is_admin())
    )
  );

-- --------------------------------------------------------
-- MENU ITEMS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
CREATE POLICY "Anyone can view menu items" ON public.menu_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can manage menu items" ON public.menu_items;
CREATE POLICY "Sellers can manage menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = menu_items.restaurant_id
        AND (r.seller_id = auth.uid() OR public.is_admin())
    )
  );

-- --------------------------------------------------------
-- ORDERS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() = customer_id
    OR auth.uid() = driver_id
    OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = orders.restaurant_id AND r.seller_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = customer_id
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = user_id
    OR auth.uid() = customer_id
    OR auth.uid() = driver_id
    OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = orders.restaurant_id AND r.seller_id = auth.uid())
    OR public.is_admin()
    OR auth.role() = 'service_role'
  );

-- --------------------------------------------------------
-- ORDER ITEMS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND (
        o.user_id = auth.uid()
        OR o.customer_id = auth.uid()
        OR o.driver_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = o.restaurant_id AND r.seller_id = auth.uid())
        OR public.is_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND (
        o.user_id = auth.uid()
        OR o.customer_id = auth.uid()
        OR auth.role() = 'service_role'
      )
    )
  );

-- --------------------------------------------------------
-- PAYMENTS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id AND (
        o.user_id = auth.uid()
        OR o.customer_id = auth.uid()
        OR public.is_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Service role can insert payments" ON public.payments;
CREATE POLICY "Service role can insert payments" ON public.payments
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id AND (o.user_id = auth.uid() OR o.customer_id = auth.uid())
    )
  );

-- --------------------------------------------------------
-- ADDRESSES RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- --------------------------------------------------------
-- DRIVER LOCATIONS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view assigned driver location" ON public.driver_locations;
CREATE POLICY "Users can view assigned driver location" ON public.driver_locations
  FOR SELECT USING (
    auth.uid() = driver_id
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = driver_locations.order_id AND (o.user_id = auth.uid() OR o.customer_id = auth.uid())
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Drivers can update location" ON public.driver_locations;
CREATE POLICY "Drivers can update location" ON public.driver_locations
  FOR ALL USING (auth.uid() = driver_id OR auth.role() = 'service_role' OR public.is_admin());

-- ========================================================
-- SEED DATA: RESTAURANTS, CATEGORIES & MENU ITEMS (INR)
-- ========================================================

-- 1. Flagship Express Kitchen: kitchen-1
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'kitchen-1',
  'BIGBITES Express Kitchen',
  'bigbites-express-kitchen',
  'Central Express Kitchen Hub, Campus & City Outlets',
  'VADODARA',
  22.2887,
  73.3638,
  'Burgers · Pizza · Sides · Coolers',
  '+91 98765 43210',
  '24/7 Express Delivery',
  30,
  'active',
  '/assets/indian-chef-kitchen.png',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  4.9,
  2450
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES
  ('cat-kitchen-bestsellers', 'kitchen-1', 'BESTSELLERS', 1),
  ('cat-kitchen-new-arrivals', 'kitchen-1', 'NEW ARRIVALS', 2),
  ('cat-kitchen-trending', 'kitchen-1', 'TRENDING PRODUCTS', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  -- Bestsellers
  ('bs-1', 'kitchen-1', 'cat-kitchen-bestsellers', 'Double Smash Cheeseburger', 'Aged cheddar, caramelized onions, toasted brioche bun', 299, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', false, true, true, 15),
  ('bs-2', 'kitchen-1', 'cat-kitchen-bestsellers', 'Classic Margherita Supreme', 'San Marzano tomatoes, fresh mozzarella, sweet basil', 299, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, true, true, 18),
  ('bs-3', 'kitchen-1', 'cat-kitchen-bestsellers', 'Golden Peri-Peri Fries', 'Crispy skin-on fries tossed in peri-peri masala', 209, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', true, true, true, 10),
  ('bs-4', 'kitchen-1', 'cat-kitchen-bestsellers', 'Chocolate Fudge Shake', 'Rich Belgian cocoa, whipped cream, chocolate shavings', 219, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80', true, true, true, 8),
  -- New Arrivals
  ('na-1', 'kitchen-1', 'cat-kitchen-new-arrivals', 'Spicy Crispy Chicken Burger', 'Crispy fried patty, aged cheddar, spicy peri-peri sauce', 249, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', false, true, true, 15),
  ('na-2', 'kitchen-1', 'cat-kitchen-new-arrivals', 'Pepperoni Supreme Pizza', 'Loaded spicy slices, melted mozzarella, fresh basil', 449, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80', false, true, true, 20),
  ('na-3', 'kitchen-1', 'cat-kitchen-new-arrivals', 'Crispy Wing Box', '8pc spicy tandoori glazed wings, mint dip', 279, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80', false, true, true, 18),
  ('na-4', 'kitchen-1', 'cat-kitchen-new-arrivals', 'Cold Brew Cooler', 'South Indian iced cold brew, sweet vanilla cream float', 209, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80', true, true, true, 6),
  -- Trending Products
  ('tp-1', 'kitchen-1', 'cat-kitchen-trending', 'Spicy Chicken Sandwich', 'Crispy fillet, spicy mayo, pickled slaw', 249, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80', false, true, true, 16),
  ('tp-2', 'kitchen-1', 'cat-kitchen-trending', 'Chicken Fry Bucket', 'Crispy marinated drumsticks, mint garlic chutney', 349, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', false, true, true, 18),
  ('tp-3', 'kitchen-1', 'cat-kitchen-trending', 'Garlic Bread Sticks', 'Toasted herbs, garlic butter, spiced herbs', 209, 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80', true, true, true, 10),
  ('tp-4', 'kitchen-1', 'cat-kitchen-trending', 'Mango Lassi', 'Fresh Alphonso mango, creamy thick yogurt, cardamom', 209, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80', true, true, true, 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: BigBites Signature Kitchen — Connaught Place
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-delhi-cp',
  'BigBites Signature Kitchen — Connaught Place',
  'bigbites-connaught-place',
  'Block A, Inner Circle, Connaught Place, New Delhi 110001',
  'DELHI',
  28.6315,
  77.2167,
  'North Indian · Tandoor · Biryani',
  '+91 11 4567 8900',
  '10:00 AM - 11:30 PM',
  12,
  'active',
  '/assets/indian-chef-kitchen.png',
  'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
  4.8,
  1420
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-curries', 'rest-delhi-cp', 'SIGNATURE CURRIES', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-butter-chicken', 'rest-delhi-cp', 'cat-curries', 'Butter Chicken Special', 'Tender tandoori chicken simmered in rich tomato, cashew & butter gravy with aromatic spices.', 329, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80', false, true, true, 15),
  ('item-palak-paneer', 'rest-delhi-cp', 'cat-curries', 'Shahi Palak Paneer', 'Fresh cottage cheese cubes cooked in creamy spinach puree infused with garlic & cumin.', 249, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', true, true, true, 12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-chaats', 'rest-delhi-cp', 'CHAATS & STARTERS', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-bhel-puri', 'rest-delhi-cp', 'cat-chaats', 'Delhi Chaat Platter', 'Crispy samosa, papdi, tangy tamarind chutney, fresh mint yogurt & pomegranate.', 229, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', true, false, true, 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: The Burger Club — Rajiv Chowk
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-delhi-burger',
  'The Burger Club — Rajiv Chowk',
  'the-burger-club-rajiv-chowk',
  'Radial Road 3, Rajiv Chowk, Connaught Place, New Delhi 110001',
  'DELHI',
  28.6335,
  77.2195,
  'American · Gourmet Burgers · Crispy Fries',
  '+91 11 4112 3344',
  '11:00 AM - 12:00 AM',
  10,
  'active',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
  4.7,
  890
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-burgers', 'rest-delhi-burger', 'GOURMET BURGERS', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-beef-burger', 'rest-delhi-burger', 'cat-burgers', 'Double Smash Cheeseburger', 'Double grilled patty, melted aged cheddar, caramelized onion relish, secret house sauce.', 299, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', false, true, true, 12),
  ('item-spicy-chick', 'rest-delhi-burger', 'cat-burgers', 'Spicy Crispy Chicken Burger', 'Crispy fried chicken breast, spicy habanero mayo, dill pickles, brioche bun.', 249, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80', false, true, true, 14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: Biryani Blues & Grills — Janpath
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-delhi-biryani',
  'Biryani Blues & Grills — Janpath',
  'biryani-blues-janpath',
  'Janpath Road, Near Tolstoy Marg, New Delhi 110001',
  'DELHI',
  28.627,
  77.2185,
  'Dum Biryani · Mughlai · Kebabs',
  '+91 11 4987 1122',
  '11:30 AM - 11:00 PM',
  12,
  'active',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
  4.9,
  1650
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-biryani', 'rest-delhi-biryani', 'DUM BIRYANI POTS', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-dum-biryani', 'rest-delhi-biryani', 'cat-biryani', 'Hyderabadi Dum Chicken Biryani', 'Fragrant basmati rice slow-cooked on dum with marinated chicken, saffron, brown onions & raita.', 299, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', false, true, true, 20)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: Crust & Craft Woodfired Pizza — Barakhamba
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-delhi-pizza',
  'Crust & Craft Woodfired Pizza — Barakhamba',
  'crust-craft-barakhamba',
  'Barakhamba Road, Connaught Place Outer Circle, New Delhi 110001',
  'DELHI',
  28.6295,
  77.226,
  'Italian · Woodfired Pizza · Pasta',
  '+91 11 4333 5566',
  '12:00 PM - 11:30 PM',
  10,
  'active',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
  4.8,
  730
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-pizza', 'rest-delhi-pizza', 'ARTISAN PIZZAS', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-pepperoni', 'rest-delhi-pizza', 'cat-pizza', 'Pepperoni Supreme Pizza', 'Stone-baked sourdough crust, San Marzano tomato sauce, mozzarella fior di latte, cured pepperoni.', 449, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80', false, true, true, 18),
  ('item-margherita', 'rest-delhi-pizza', 'cat-pizza', 'Classic Margherita Classica', 'Fresh basil leaves, buffalo mozzarella, extra virgin olive oil, sea salt.', 299, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80', true, true, true, 15)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: BigBites Kitchen — Parul University Campus
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-parul-univ-campus',
  'BigBites Kitchen — Parul University Campus',
  'bigbites-parul-university',
  'Parul University Campus, Waghodia Road, Vadodara, Gujarat 391760',
  'VADODARA',
  22.2887,
  73.3638,
  'Kathiyawadi · Gujarati Thali · Fast Food',
  '+91 2668 260 300',
  '08:30 AM - 10:30 PM',
  25,
  'active',
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  4.8,
  940
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-student-meals', 'rest-parul-univ-campus', 'CAMPUS FAVORITES', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-parul-thali', 'rest-parul-univ-campus', 'cat-student-meals', 'Special Gujarati Kathiyawadi Thali', 'Sev tameta, ringna no olo, bajra rotla with organic ghee & gur, dal rice, masala chaas.', 249, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', true, true, true, 15),
  ('item-crispy-wrap', 'rest-parul-univ-campus', 'cat-student-meals', 'Spicy Paneer Tikka Wrap', 'Char-grilled paneer, mint chutney, crispy cabbage slaw rolled in fresh flaky laccha paratha.', 229, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', true, true, true, 10)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: Taste of Vadodara — Waghodia Road
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-vadodara-waghodia',
  'Taste of Vadodara — Waghodia Road',
  'taste-of-vadodara',
  'Opp. Parul Institute, Waghodia Road, Vadodara 391760',
  'VADODARA',
  22.291,
  73.359,
  'Sev Usal · Chaats · Street Snacks',
  '+91 2668 255 122',
  '09:00 AM - 10:00 PM',
  25,
  'active',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
  4.7,
  610
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-snacks', 'rest-vadodara-waghodia', 'VADODARA FAMOUS', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-sev-usal', 'rest-vadodara-waghodia', 'cat-snacks', 'Famous Vadodara Mahakali Sev Usal', 'Spicy pea curry served hot with crispy sev, spring onions, lemon & fresh butter pav.', 219, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', true, true, true, 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: Royal Kathiyawad & Thali — Alkapuri
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-vadodara-alkapuri',
  'Royal Kathiyawad & Thali — Alkapuri',
  'royal-kathiyawad-alkapuri',
  'RC Dutt Road, Alkapuri, Vadodara, Gujarat 390007',
  'VADODARA',
  22.3105,
  73.1802,
  'Kathiyawadi · Gujarati Thali · North Indian',
  '+91 265 233 4455',
  '11:00 AM - 11:00 PM',
  25,
  'active',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
  4.9,
  1240
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-alkapuri-thali', 'rest-vadodara-alkapuri', 'AUTHENTIC THALIS', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-royal-gujarati-thali', 'rest-vadodara-alkapuri', 'cat-alkapuri-thali', 'Royal Maharaja Gujarati Thali', 'Grand festive thali with 4 subzis, dal, kadhi, farsaans, rotlis, bajra rotla, shrikhand, and gulab jamun.', 349, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', true, true, true, 15)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: The Burger Club — Sayajigunj
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-vadodara-sayajigunj',
  'The Burger Club — Sayajigunj',
  'burger-club-sayajigunj',
  'Near Railway Station, Sayajigunj, Vadodara 390005',
  'VADODARA',
  22.312,
  73.189,
  'Gourmet Burgers · Fast Food · Shakes',
  '+91 265 244 5566',
  '11:00 AM - 11:30 PM',
  25,
  'active',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
  4.8,
  850
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-burgers', 'rest-vadodara-sayajigunj', 'GOURMET BURGERS', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-vadodara-burger', 'rest-vadodara-sayajigunj', 'cat-burgers', 'Classic BigBites Cheeseburger', 'Crispy herb patty, melted sharp cheddar, caramelized onions, house relish on brioche.', 249, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, true, true, 12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- Restaurant: BigBites Coastal — Bandra West
INSERT INTO public.restaurants (id, name, slug, address, city, lat, lng, cuisine, phone, opening_hours, delivery_radius_km, status, logo_url, cover_url, rating, reviews_count)
VALUES (
  'rest-mumbai-bandra',
  'BigBites Coastal — Bandra West',
  'bigbites-mumbai-bandra',
  'Hill Road, Near Bandra Station, Bandra West, Mumbai 400050',
  'MUMBAI',
  19.0596,
  72.8295,
  'Coastal Indian · Seafood · Street Food',
  '+91 22 2640 1122',
  '11:00 AM - 12:00 AM',
  12,
  'active',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  4.8,
  1120
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  cuisine = EXCLUDED.cuisine;

INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order)
VALUES ('cat-mumbai-special', 'rest-mumbai-bandra', 'MUMBAI STREET SPECIALS', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_bestseller, is_available, prep_time_min)
VALUES
  ('item-bhel-mumbai', 'rest-mumbai-bandra', 'cat-mumbai-special', 'Special Chowpatty Sev Bhel Puri', 'Authentic Chowpatty style bhel loaded with crispy sev, tamarind chutney & spicy garlic kick.', 219, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', true, true, true, 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available;

-- NOTIFY POSTGREST TO RELOAD SCHEMA CACHE IMMEDIATELY
NOTIFY pgrst, 'reload schema';
-- ========================================================
