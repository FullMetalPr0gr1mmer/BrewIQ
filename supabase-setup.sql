-- ==========================================
-- BrewIQ Database Setup — Run in Supabase SQL Editor
-- Run this ENTIRE script in one go
-- ==========================================

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. CHAT SESSIONS & MESSAGES
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INT DEFAULT 0,
  satisfaction_rating INT CHECK (satisfaction_rating BETWEEN 1 AND 5)
);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sessions"
  ON public.chat_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users create own sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own sessions"
  ON public.chat_sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins see all sessions"
  ON public.chat_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_messages.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users create messages in own sessions"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = chat_messages.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins see all messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. BUSINESS DATA TABLES
CREATE TABLE public.coffee_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hot_coffee', 'cold_coffee', 'tea', 'pastry', 'snack')),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.coffee_shops(id),
  product_id UUID REFERENCES public.products(id),
  customer_name TEXT,
  quantity INT DEFAULT 1,
  total_amount DECIMAL(10,2),
  order_date TIMESTAMPTZ DEFAULT NOW(),
  hour_of_day INT GENERATED ALWAYS AS (EXTRACT(HOUR FROM order_date)) STORED
);

-- RLS for business tables
ALTER TABLE public.coffee_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read shops" ON public.coffee_shops FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins read orders" ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. SEED DATA
INSERT INTO public.coffee_shops (name, location, city) VALUES
  ('BrewIQ Downtown', '123 Main Street', 'Cairo'),
  ('BrewIQ Zamalek', '45 26th July St', 'Cairo'),
  ('BrewIQ New Cairo', '90th Street, 5th Settlement', 'Cairo'),
  ('BrewIQ Maadi', '9 Road 233, Degla', 'Cairo'),
  ('BrewIQ Alexandria', '15 Corniche Road', 'Alexandria');

INSERT INTO public.products (name, category, price, description) VALUES
  ('Espresso', 'hot_coffee', 35.00, 'Rich double shot espresso'),
  ('Cappuccino', 'hot_coffee', 55.00, 'Espresso with steamed milk foam'),
  ('Latte', 'hot_coffee', 60.00, 'Smooth espresso with velvety steamed milk'),
  ('Americano', 'hot_coffee', 40.00, 'Espresso diluted with hot water'),
  ('Flat White', 'hot_coffee', 65.00, 'Micro-foam milk with double ristretto'),
  ('Iced Latte', 'cold_coffee', 65.00, 'Chilled espresso with cold milk over ice'),
  ('Cold Brew', 'cold_coffee', 70.00, '18-hour steeped cold brew'),
  ('Frappuccino', 'cold_coffee', 75.00, 'Blended ice coffee with whipped cream'),
  ('Iced Mocha', 'cold_coffee', 70.00, 'Chocolate espresso over ice'),
  ('Matcha Latte', 'tea', 65.00, 'Ceremonial grade matcha with steamed milk'),
  ('Earl Grey', 'tea', 35.00, 'Classic bergamot black tea'),
  ('Croissant', 'pastry', 45.00, 'Buttery French croissant'),
  ('Chocolate Muffin', 'pastry', 40.00, 'Double chocolate chip muffin'),
  ('Avocado Toast', 'snack', 80.00, 'Sourdough with smashed avocado and feta');

-- Generate ~490 fake orders spread across last 90 days
INSERT INTO public.orders (shop_id, product_id, customer_name, quantity, total_amount, order_date)
SELECT
  (SELECT id FROM public.coffee_shops ORDER BY random() LIMIT 1),
  p.id,
  'Customer ' || floor(random() * 200 + 1)::text,
  floor(random() * 3 + 1)::int,
  p.price * floor(random() * 3 + 1)::int,
  NOW() - (random() * interval '90 days')
FROM public.products p,
     generate_series(1, 35) s;

-- 5. CREATE PROFILE FOR YOUR EXISTING USER
-- Since you already signed up BEFORE the profiles table existed,
-- we need to manually create your profile row.
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', ''), 'admin'
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET role = 'admin';
