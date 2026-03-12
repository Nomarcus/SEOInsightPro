"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, type UserAccount } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  userAccount: UserAccount | null;
  credits: number;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    checkSession();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserAccount(session.user.id);
      } else {
        setUserAccount(null);
        setCredits(0);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user;
      setUser(currentUser ?? null);
      if (currentUser) {
        await fetchUserAccount(currentUser.id);
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setUserAccount(data as UserAccount);
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Error fetching user account:", error);
    }
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp(
        {
          email,
          password,
        }
      );

      if (authError) return { error: authError.message };
      if (!authData.user) return { error: "Failed to create account" };

      // Create user account record
      const { error: dbError } = await supabase.from("user_accounts").insert({
        user_id: authData.user.id,
        email: authData.user.email,
        credits: 0,
      });

      if (dbError) return { error: dbError.message };

      setUser(authData.user);
      await fetchUserAccount(authData.user.id);
      return {};
    } catch (error) {
      return { error: String(error) };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };
      if (!data.user) return { error: "Failed to sign in" };

      setUser(data.user);
      await fetchUserAccount(data.user.id);
      return {};
    } catch (error) {
      return { error: String(error) };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserAccount(null);
      setCredits(0);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshCredits = async () => {
    if (user) {
      await fetchUserAccount(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userAccount,
        credits,
        loading,
        signUp,
        signIn,
        signOut,
        refreshCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
