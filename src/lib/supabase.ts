import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client-side Supabase (read/write with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase (admin access, bypass RLS)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Types
export interface UserAccount {
  id: string;
  user_id: string;
  email: string;
  display_name?: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  package_name: string;
  price_sek: number;
  price_eur: number;
  currency: "SEK" | "EUR";
  payment_method: "paypal" | "swish";
  transaction_id: string;
  status: "pending" | "completed" | "failed" | "refunded";
  credits_awarded: number;
  created_at: string;
  completed_at?: string;
}

export interface AnalysisLog {
  id: string;
  user_id?: string;
  url: string;
  overall_score?: number;
  created_at: string;
}
