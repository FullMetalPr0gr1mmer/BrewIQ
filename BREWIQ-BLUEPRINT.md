# BrewIQ — Coffee Corp Business Platform
## Complete Technical Blueprint for Claude Code

---

## 1. PROJECT OVERVIEW

**App Name:** BrewIQ
**Tagline:** "Smart Coffee. Smarter Business."
**Type:** Full-stack web application (SPA) with role-based access
**Deadline:** < 24 hours — this is a POC (Proof of Concept)
**Deployment Target:** Vercel (free tier, instant deploys from GitHub)

### What It Does
- **Users (Customers):** Chat with an AI coffee assistant — ask about brewing methods, bean origins, menu recommendations, etc.
- **Admins (Business Owners):** View a rich analytics dashboard showing business insights, user engagement, popular questions, and can export chat logs.

---

## 2. TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **React 18 + Vite** | Fast build, HMR, lightweight |
| Styling | **Tailwind CSS 3** | Utility-first, responsive by default |
| Animations | **Framer Motion** | Smooth page transitions, micro-interactions |
| Routing | **React Router v6** | Client-side routing with protected routes |
| State | **Zustand** | Minimal boilerplate global state |
| Auth + DB | **Supabase** (Auth + PostgreSQL) | Free tier, instant setup, RLS |
| AI Chat | **Google Gemini API** (free tier) | `gemini-2.0-flash` model, generous free quota |
| Charts | **Recharts** | React-native charting, composable |
| Export | **SheetJS (xlsx)** | Client-side Excel export |
| Icons | **Lucide React** | Clean, consistent icon set |
| Deployment | **Vercel** | Free, auto-deploy from GitHub, edge network |

---

## 3. PROJECT STRUCTURE

```
brewiq/
├── public/
│   ├── favicon.ico
│   └── coffee-hero.mp4              # short looping coffee video for landing
├── src/
│   ├── main.jsx                     # App entry point
│   ├── App.jsx                      # Router + layout wrapper
│   ├── index.css                    # Tailwind imports + custom globals
│   │
│   ├── lib/
│   │   ├── supabase.js              # Supabase client init
│   │   ├── gemini.js                # Gemini API helper
│   │   └── constants.js             # App-wide constants, coffee system prompt
│   │
│   ├── store/
│   │   └── authStore.js             # Zustand store for auth state + role
│   │
│   ├── hooks/
│   │   ├── useAuth.js               # Auth hook (session, role, loading)
│   │   └── useChat.js               # Chat logic hook (send, history, streaming)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx           # Top nav (dynamic per role)
│   │   │   ├── Sidebar.jsx          # Admin sidebar navigation
│   │   │   ├── PageTransition.jsx   # Framer Motion page wrapper
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   └── ProtectedRoute.jsx   # Role-based route guard
│   │   │
│   │   ├── user/
│   │   │   ├── ChatWindow.jsx       # Main chat interface
│   │   │   ├── ChatBubble.jsx       # Individual message bubble
│   │   │   ├── ChatInput.jsx        # Input bar with send button
│   │   │   ├── TypingIndicator.jsx  # Animated dots while AI responds
│   │   │   └── WelcomeScreen.jsx    # Pre-chat landing with suggestions
│   │   │
│   │   ├── admin/
│   │   │   ├── DashboardLayout.jsx  # Admin shell with sidebar
│   │   │   ├── StatCard.jsx         # Animated KPI card
│   │   │   ├── RevenueChart.jsx     # Line chart — revenue over time
│   │   │   ├── OrdersChart.jsx      # Bar chart — orders by shop
│   │   │   ├── TopQuestionsTable.jsx# Table of most asked topics
│   │   │   ├── UserGrowthChart.jsx  # Area chart — user signups
│   │   │   ├── ChatLogViewer.jsx    # Browse + export user chats
│   │   │   ├── SatisfactionGauge.jsx# Donut/gauge for satisfaction
│   │   │   └── PeakHoursHeatmap.jsx # Heatmap of chat activity
│   │   │
│   │   └── shared/
│   │       ├── LoadingSpinner.jsx
│   │       ├── CoffeeBackground.jsx # Animated background particles/steam
│   │       └── Logo.jsx
│   │
│   └── pages/
│       ├── LandingPage.jsx          # Public home with hero video + CTA
│       ├── LoginPage.jsx
│       ├── SignupPage.jsx
│       ├── ChatPage.jsx             # User's AI chat page
│       ├── AdminDashboard.jsx       # Admin analytics overview
│       └── AdminChats.jsx           # Admin chat log viewer + export
│
├── .env                             # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY
├── package.json
├── tailwind.config.js
├── vite.config.js
├── vercel.json                      # SPA rewrite config
└── README.md
```

---

## 4. DATABASE SCHEMA (Supabase)

Run these SQL statements in Supabase SQL Editor in order.

### 4.1 Profiles Table (extends Supabase Auth)

```sql
-- Profiles table linked to auth.users
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

-- RLS
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
```

### 4.2 Chat Sessions & Messages

```sql
-- Chat sessions
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INT DEFAULT 0,
  satisfaction_rating INT CHECK (satisfaction_rating BETWEEN 1 AND 5)
);

-- Chat messages
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
```

### 4.3 Coffee Shops (Business Data)

```sql
-- Coffee shop locations
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

-- Products / Menu
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hot_coffee', 'cold_coffee', 'tea', 'pastry', 'snack')),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE
);

-- Orders (fake data for analytics)
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

-- All business tables: public read, admin write
ALTER TABLE public.coffee_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Everyone can read shops and products
CREATE POLICY "Public read shops" ON public.coffee_shops FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

-- Admins can read orders
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 4.4 Seed Data Script

```sql
-- === SEED DATA ===

-- Coffee Shops
INSERT INTO public.coffee_shops (name, location, city) VALUES
  ('BrewIQ Downtown', '123 Main Street', 'Cairo'),
  ('BrewIQ Zamalek', '45 26th July St', 'Cairo'),
  ('BrewIQ New Cairo', '90th Street, 5th Settlement', 'Cairo'),
  ('BrewIQ Maadi', '9 Road 233, Degla', 'Cairo'),
  ('BrewIQ Alexandria', '15 Corniche Road', 'Alexandria');

-- Products
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

-- Generate ~500 fake orders spread across last 90 days
INSERT INTO public.orders (shop_id, product_id, customer_name, quantity, total_amount, order_date)
SELECT
  (SELECT id FROM public.coffee_shops ORDER BY random() LIMIT 1),
  p.id,
  'Customer ' || floor(random() * 200 + 1)::text,
  floor(random() * 3 + 1)::int,
  p.price * floor(random() * 3 + 1)::int,
  NOW() - (random() * interval '90 days')
FROM public.products p,
     generate_series(1, 35) s;   -- 35 iterations × 14 products ≈ 490 orders
```

---

## 5. AUTHENTICATION FLOW

### 5.1 Supabase Client Init (`src/lib/supabase.js`)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 5.2 Auth Store (`src/store/authStore.js`)

```javascript
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      set({ user: session.user, profile, loading: false });
    } else {
      set({ loading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ user: session.user, profile });
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  signUp: async (email, password, fullName, role = 'user') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role }
      }
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  }
}));

export default useAuthStore;
```

### 5.3 Protected Route Component

```javascript
// Redirects unauthorized users. Usage:
// <ProtectedRoute allowedRoles={['admin']}>
//   <AdminDashboard />
// </ProtectedRoute>

import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuthStore();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
```

### 5.4 Routing Map

| Route | Page | Access |
|-------|------|--------|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public (redirect if logged in) |
| `/signup` | SignupPage | Public (redirect if logged in) |
| `/chat` | ChatPage | `user` role only |
| `/admin` | AdminDashboard | `admin` role only |
| `/admin/chats` | AdminChats | `admin` role only |

### 5.5 Creating the First Admin

After setting up Supabase, sign up normally then run in Supabase SQL Editor:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@brewiq.com';
```

Or add a signup page with a hidden admin toggle for the POC.

---

## 6. GEMINI AI CHAT INTEGRATION

### 6.1 Get a Free API Key

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy it into `.env` as `VITE_GEMINI_API_KEY`

### 6.2 Gemini Helper (`src/lib/gemini.js`)

```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const COFFEE_SYSTEM_PROMPT = `You are BrewIQ, a friendly and knowledgeable AI coffee assistant for a premium coffee chain called BrewIQ. You help customers with:

- Coffee brewing methods (pour-over, French press, espresso, cold brew, etc.)
- Bean origins and flavor profiles (Ethiopian Yirgacheffe, Colombian, Brazilian, etc.)
- Menu recommendations based on preferences
- Coffee fun facts and history
- Food pairing suggestions
- Caffeine information and health aspects of coffee

Personality: Warm, enthusiastic about coffee, concise but informative. Use coffee-related emojis occasionally (☕🫘✨). Keep responses under 200 words unless the user asks for detail. If asked about non-coffee topics, gently steer back to coffee while being helpful.

Our menu includes: Espresso, Cappuccino, Latte, Americano, Flat White, Iced Latte, Cold Brew, Frappuccino, Iced Mocha, Matcha Latte, Earl Grey, Croissant, Chocolate Muffin, Avocado Toast.`;

export async function sendToGemini(messages) {
  // Convert chat history to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: COFFEE_SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that. Try again!';
}
```

### 6.3 Chat Flow

1. User opens `/chat` → new `chat_session` created in Supabase
2. Each message: save to `chat_messages` → send history to Gemini → save response to `chat_messages`
3. On session end: update `message_count` and optionally prompt for `satisfaction_rating`

---

## 7. USER INTERFACE — CHAT PAGE

### 7.1 Layout

```
┌──────────────────────────────────────────┐
│  ☕ BrewIQ          [Profile] [Logout]    │  ← Navbar
├──────────────────────────────────────────┤
│                                          │
│   Welcome to BrewIQ! ☕                  │  ← Welcome (before first message)
│   I'm your AI coffee expert.             │
│                                          │
│   Try asking:                            │
│   ┌──────────────┐ ┌─────────────────┐   │  ← Suggestion chips
│   │ Best cold brew│ │ Latte vs Cappuc │   │
│   │  method? ☕   │ │   cino? 🤔      │   │
│   └──────────────┘ └─────────────────┘   │
│   ┌──────────────┐ ┌─────────────────┐   │
│   │ What beans   │ │ Pair with my    │   │
│   │  for espresso│ │   croissant 🥐  │   │
│   └──────────────┘ └─────────────────┘   │
│                                          │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                          │
│  👤 What's the best way to make          │  ← User bubble (right-aligned)
│     cold brew at home?                   │
│                                          │
│  ☕ Great question! Cold brew is          │  ← AI bubble (left-aligned)
│     super easy. Here's my favorite...    │
│                                          │
│  ● ● ●                                  │  ← Typing indicator (animated)
│                                          │
├──────────────────────────────────────────┤
│  [💬 Type your coffee question...]  [➤]  │  ← Input bar (sticky bottom)
└──────────────────────────────────────────┘
```

### 7.2 UX Details

- Messages animate in with Framer Motion (`fadeIn` + slight `translateY`)
- Auto-scroll to bottom on new messages
- Typing indicator shows 3 bouncing dots while waiting for Gemini
- Suggestion chips disappear after first message
- Mobile: full-screen chat, input bar fixed at bottom with safe area padding
- Chat bubbles: rounded corners, user = brand color (brown/amber), AI = light gray
- Timestamps shown on hover/tap

---

## 8. ADMIN INTERFACE — DASHBOARD

### 8.1 Layout

```
┌─────────────┬────────────────────────────────────────────┐
│             │  📊 Dashboard          [Export] [Logout]    │
│  ☕ BrewIQ   ├────────────────────────────────────────────┤
│             │                                            │
│  📊 Overview│  ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  💬 Chats   │  │ 1,247   │ │ 489     │ │ EGP 34K │     │
│  👥 Users   │  │ Orders  │ │ Chats   │ │ Revenue │     │
│  📈 Reports │  │ ↑ 12%   │ │ ↑ 28%   │ │ ↑ 15%   │     │
│             │  └─────────┘ └─────────┘ └─────────┘     │
│             │                                            │
│             │  ┌─────────────────────────────────────┐   │
│             │  │   Revenue Trend (Line Chart)         │   │
│             │  │   📈 Last 30 / 60 / 90 days         │   │
│             │  └─────────────────────────────────────┘   │
│             │                                            │
│             │  ┌────────────────┐ ┌──────────────────┐   │
│             │  │ Orders by Shop │ │ Top Questions    │   │
│             │  │  (Bar Chart)   │ │  (Table)         │   │
│             │  └────────────────┘ └──────────────────┘   │
│             │                                            │
│             │  ┌────────────────┐ ┌──────────────────┐   │
│             │  │ Peak Hours     │ │ User Growth      │   │
│             │  │  (Heatmap)     │ │  (Area Chart)    │   │
│             │  └────────────────┘ └──────────────────┘   │
│             │                                            │
└─────────────┴────────────────────────────────────────────┘
```

### 8.2 Admin Insights Breakdown

These are the KPI cards and charts to implement. All data comes from Supabase queries (with the seed data we created):

| Insight | Source | Chart Type |
|---------|--------|-----------|
| **Total Orders** | `COUNT(*) FROM orders` | Stat card with % change vs prior period |
| **Total Revenue** | `SUM(total_amount) FROM orders` | Stat card |
| **Active Chat Sessions** | `COUNT(*) FROM chat_sessions` | Stat card |
| **Avg Satisfaction** | `AVG(satisfaction_rating) FROM chat_sessions` | Stat card with star rating |
| **Revenue Over Time** | Orders grouped by `DATE(order_date)` | Line chart (Recharts `<LineChart>`) |
| **Orders by Shop** | Orders grouped by `shop_id` joined with shops | Horizontal bar chart |
| **Product Popularity** | Orders grouped by `product_id` | Pie/donut chart |
| **Peak Hours** | Orders grouped by `hour_of_day` and day of week | Heatmap grid (custom component) |
| **User Growth** | Profiles grouped by `DATE(created_at)` | Area chart |
| **Top Chat Questions** | Chat messages analyzed (keyword frequency from user messages) | Ranked table |
| **Chat Volume Over Time** | Messages grouped by `DATE(created_at)` | Line chart |

### 8.3 Chat Log Viewer + Export (`/admin/chats`)

```
┌─────────────┬────────────────────────────────────────────┐
│  Sidebar    │  💬 Chat Logs         [⬇ Export XLSX]      │
│             ├────────────────────────────────────────────┤
│             │  🔍 [Search chats...]   [Date range ▼]     │
│             │                                            │
│             │  ┌────────────────────────────────────────┐ │
│             │  │ User Email │ Messages │ Date │ Rating  │ │
│             │  │ john@...   │    12    │ Mar 7│  ★★★★☆  │ │
│             │  │ sara@...   │     8    │ Mar 7│  ★★★★★  │ │
│             │  │ ali@...    │    15    │ Mar 6│  ★★★☆☆  │ │
│             │  └────────────────────────────────────────┘ │
│             │                                            │
│             │  ▼ Expanded Chat Preview:                   │
│             │  ┌────────────────────────────────────────┐ │
│             │  │ 👤 What beans for pour-over?            │ │
│             │  │ 🤖 For pour-over I recommend...        │ │
│             │  │ 👤 Thanks! What about water temp?       │ │
│             │  │ 🤖 Great question! Aim for 195-205°F...│ │
│             │  └────────────────────────────────────────┘ │
└─────────────┴────────────────────────────────────────────┘
```

**Export Functionality:**
- Uses SheetJS (`xlsx` package) to generate `.xlsx` client-side
- Export formats: individual chat session OR all chats in date range
- Columns: `User Email`, `Session ID`, `Message Role`, `Message Content`, `Timestamp`, `Satisfaction Rating`

```javascript
import * as XLSX from 'xlsx';

function exportChatsToXLSX(chatData) {
  const ws = XLSX.utils.json_to_sheet(chatData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chat Logs');
  XLSX.writeFile(wb, `brewiq-chats-${new Date().toISOString().slice(0,10)}.xlsx`);
}
```

---

## 9. DESIGN SYSTEM

### 9.1 Color Palette

```javascript
// tailwind.config.js extend
colors: {
  brew: {
    50:  '#FFF8F0',   // Cream (backgrounds)
    100: '#F5E6D3',   // Light latte
    200: '#E8C9A0',   // Latte foam
    300: '#D4A574',   // Caramel
    400: '#B8844C',   // Light roast
    500: '#8B5E3C',   // Medium roast (PRIMARY)
    600: '#6F4E31',   // Dark roast
    700: '#523A25',   // Espresso
    800: '#3A2819',   // Dark espresso
    900: '#1E1410',   // Near black
  },
  accent: {
    green:  '#4CAF50', // Success / growth
    amber:  '#FF9800', // Warnings / highlights
    red:    '#EF5350', // Errors
    blue:   '#42A5F5', // Info / links
  }
}
```

### 9.2 Typography

```css
/* Import in index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

/* Inter = body text, UI elements
   Playfair Display = headings, logo, hero text */
```

### 9.3 Responsive Breakpoints (Tailwind defaults)

- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- Always use `%`, `vw/vh`, `min-w`, `max-w` — NEVER use fixed pixel widths for layout
- Admin sidebar: collapsible on mobile (hamburger menu)
- Chat: full-viewport height on mobile (`h-[100dvh]`)

### 9.4 Animation Guidelines (Framer Motion)

```javascript
// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// Stat cards — staggered entry
const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

// Chat bubbles — slide in
const bubbleVariants = {
  initial: { opacity: 0, x: isUser ? 20 : -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

// Typing dots — infinite bounce
const dotVariants = {
  animate: { y: [0, -6, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.2 } }
};
```

### 9.5 Video / Visual Assets

For the landing page hero section, use a free stock video. Options:
- Pexels: search "coffee shop ambiance" or "barista pouring latte"
- Download a short (5-10s) loop, compress to <5MB
- Place in `public/coffee-hero.mp4`
- Use as background with overlay:

```jsx
<div className="relative h-screen overflow-hidden">
  <video autoPlay muted loop playsInline
    className="absolute inset-0 w-full h-full object-cover">
    <source src="/coffee-hero.mp4" type="video/mp4" />
  </video>
  <div className="absolute inset-0 bg-brew-900/60" /> {/* Dark overlay */}
  <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
    <h1 className="font-playfair text-5xl md:text-7xl font-bold">BrewIQ</h1>
    <p className="mt-4 text-xl text-brew-100">Smart Coffee. Smarter Business.</p>
    <button className="mt-8 px-8 py-3 bg-brew-500 rounded-full text-white hover:bg-brew-400 transition">
      Get Started
    </button>
  </div>
</div>
```

---

## 10. DEPLOYMENT

### 10.1 Vercel (Recommended — Free + Instant)

**Why Vercel over GitHub Pages:**
- GitHub Pages only serves static files, no SPA routing support without hacks
- Vercel handles SPA rewrites natively, has instant deploys, preview URLs, and a free tier that's more than enough

**Steps:**

1. Push code to GitHub
2. Go to https://vercel.com → Sign in with GitHub
3. Import your repo
4. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
5. Deploy — Vercel auto-detects Vite and builds

**vercel.json** (for SPA routing):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 10.2 Alternative: Netlify (also free)
Same flow but use `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 11. ENVIRONMENT VARIABLES

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_GEMINI_API_KEY=AIza...
```

**IMPORTANT:** The Gemini API key will be exposed in the client bundle. This is acceptable for a POC. For production, route through a serverless function (Vercel Edge Functions or Supabase Edge Functions).

---

## 12. SETUP COMMANDS FOR CLAUDE CODE

Run these to scaffold the project:

```bash
# Create project
npm create vite@latest brewiq -- --template react
cd brewiq

# Core dependencies
npm install @supabase/supabase-js zustand react-router-dom framer-motion recharts xlsx lucide-react

# Dev dependencies
npm install -D tailwindcss @tailwindcss/vite

# Start dev server
npm run dev
```

---

## 13. IMPLEMENTATION ORDER (Claude Code Workflow)

Follow this exact order when building with Claude Code:

### Phase 1: Foundation (Est. ~2 hours)
1. Scaffold Vite + React project with all dependencies
2. Configure Tailwind with custom color palette + fonts
3. Set up Supabase client
4. Implement auth store (Zustand)
5. Create all route definitions in App.jsx
6. Build ProtectedRoute component
7. Create Login + Signup pages (functional, styled)

### Phase 2: User Chat (Est. ~2 hours)
8. Build Gemini API helper
9. Create useChat hook (manages session + messages + Supabase persistence)
10. Build ChatWindow, ChatBubble, ChatInput, TypingIndicator components
11. Build WelcomeScreen with suggestion chips
12. Wire up ChatPage with full flow
13. Add Framer Motion animations to chat

### Phase 3: Admin Dashboard (Est. ~3 hours)
14. Create admin layout with collapsible sidebar
15. Build StatCard component with animated counters
16. Build RevenueChart (line chart)
17. Build OrdersChart (bar chart by shop)
18. Build product popularity donut chart
19. Build PeakHoursHeatmap
20. Build UserGrowthChart (area chart)
21. Build TopQuestionsTable
22. Wire all charts to Supabase queries

### Phase 4: Admin Chat Logs + Export (Est. ~1 hour)
23. Build ChatLogViewer with expandable rows
24. Implement XLSX export with SheetJS
25. Add search + date filtering

### Phase 5: Landing Page + Polish (Est. ~2 hours)
26. Build LandingPage with hero video, features section, CTA
27. Add page transitions (AnimatePresence)
28. Responsive testing + fixes
29. Add loading states, error boundaries, empty states

### Phase 6: Deploy (Est. ~30 min)
30. Push to GitHub
31. Connect to Vercel
32. Set env vars
33. Deploy + test live URL

---

## 14. WHAT I NEED FROM YOU (KAREEM)

Before starting with Claude Code, please set up:

### Must Have (Before Coding):
1. **Supabase Project** — Create at https://supabase.com
   - Get `Project URL` and `anon public key` from Settings → API
   - Run all SQL from Section 4 in the SQL Editor (in order)
   - Enable Email Auth in Authentication → Providers

2. **Gemini API Key** — Get from https://aistudio.google.com/apikey (free, instant)

3. **GitHub Repo** — Create a new repo (e.g., `brewiq`)

4. **Coffee Video** — Download a free stock video from Pexels:
   - Search "coffee shop" or "barista latte art"
   - Pick a short one (5-10 seconds), compress if > 5MB
   - OR we skip this and use a static hero image instead (faster)

### Nice to Have:
5. **Vercel Account** — Sign up at https://vercel.com with your GitHub

### Optional Extras If Time Permits:
- Custom BrewIQ logo (or we generate one with SVG/CSS)
- Real coffee shop photos for the landing page
- Google Analytics integration

---

## 15. QUICK REFERENCE — KEY DECISIONS

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | React + Vite | You know React, Vite is fastest |
| Auth | Supabase Auth | Built-in, free, handles JWTs |
| Database | Supabase PostgreSQL | Same platform, RLS for security |
| AI | Gemini 2.0 Flash | Free tier, fast, good quality |
| Styling | Tailwind | Responsive by default, no fixed pixels |
| Animations | Framer Motion | Best React animation lib |
| Charts | Recharts | React-native, composable, responsive |
| Export | SheetJS | Client-side, no backend needed |
| Deploy | Vercel | Free, instant, SPA-ready |
| State | Zustand | Minimal setup, clean API |

---

## APPENDIX A: Supabase Admin Analytics Queries

```sql
-- Revenue last 30 days by day
SELECT DATE(order_date) as day, SUM(total_amount) as revenue, COUNT(*) as orders
FROM orders WHERE order_date > NOW() - INTERVAL '30 days'
GROUP BY DATE(order_date) ORDER BY day;

-- Orders by shop
SELECT cs.name, COUNT(o.id) as total_orders, SUM(o.total_amount) as revenue
FROM orders o JOIN coffee_shops cs ON o.shop_id = cs.id
GROUP BY cs.name ORDER BY total_orders DESC;

-- Peak hours heatmap data
SELECT EXTRACT(DOW FROM order_date)::int as day_of_week,
       EXTRACT(HOUR FROM order_date)::int as hour,
       COUNT(*) as order_count
FROM orders GROUP BY day_of_week, hour;

-- Top products
SELECT p.name, p.category, COUNT(o.id) as times_ordered, SUM(o.total_amount) as revenue
FROM orders o JOIN products p ON o.product_id = p.id
GROUP BY p.name, p.category ORDER BY times_ordered DESC LIMIT 10;

-- Chat engagement
SELECT DATE(started_at) as day, COUNT(*) as sessions,
       AVG(message_count) as avg_messages,
       AVG(satisfaction_rating) as avg_rating
FROM chat_sessions GROUP BY DATE(started_at) ORDER BY day;

-- Most common words in user messages (simple keyword extraction)
SELECT word, COUNT(*) as frequency
FROM (
  SELECT UNNEST(STRING_TO_ARRAY(LOWER(content), ' ')) as word
  FROM chat_messages WHERE role = 'user'
) words
WHERE LENGTH(word) > 3
AND word NOT IN ('what', 'that', 'this', 'with', 'have', 'from', 'your', 'about', 'they', 'been', 'would', 'could', 'should', 'their', 'there', 'which', 'when', 'make', 'like', 'just', 'know', 'than', 'them', 'some', 'also', 'more', 'very', 'much', 'does')
GROUP BY word ORDER BY frequency DESC LIMIT 20;
```

---

**END OF BLUEPRINT — Feed this entire document as context to Claude Code and start with Phase 1.**
