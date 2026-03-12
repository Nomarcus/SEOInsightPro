-- ============================================================
-- SEO Insight Pro - Supabase Database Setup
-- ============================================================
-- Copy & paste this entire script into Supabase SQL Editor
-- and run it to create all necessary tables

-- 1. User Accounts Table
CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own account"
  ON user_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own account"
  ON user_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_name VARCHAR(50) DEFAULT '5-analyses',
  price_sek DECIMAL(10, 2) DEFAULT 199.00,
  price_eur DECIMAL(10, 2) DEFAULT 19.00,
  currency VARCHAR(3),
  payment_method VARCHAR(20),
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  credits_awarded INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Analysis Logs Table
CREATE TABLE IF NOT EXISTS analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  url VARCHAR(2048) NOT NULL,
  overall_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE analysis_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own analyses"
  ON analysis_logs FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can insert analyses"
  ON analysis_logs FOR INSERT
  WITH CHECK (true);

-- 4. Admin Access Table
CREATE TABLE IF NOT EXISTS admin_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  admin_secret VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Indexes for Performance
-- ============================================================
CREATE INDEX idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_analysis_logs_user_id ON analysis_logs(user_id);
CREATE INDEX idx_analysis_logs_created ON analysis_logs(created_at);

-- ============================================================
-- Done!
-- You can now:
-- 1. Set NEXT_PUBLIC_SUPABASE_URL and keys in .env.local
-- 2. Run: npm install
-- 3. Run: npm run dev
-- ============================================================
