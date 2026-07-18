import { createClient } from "@supabase/supabase-js";

// Retrieve variables from Vite env
const meta = import.meta as any;
const supabaseUrl = (meta.env && meta.env.VITE_SUPABASE_URL) || "";
const supabaseAnonKey = (meta.env && meta.env.VITE_SUPABASE_ANON_KEY) || "";

// Custom state to allow runtime override of credentials in UI
let activeUrl = supabaseUrl || localStorage.getItem("override_supabase_url") || "";
let activeAnonKey = supabaseAnonKey || localStorage.getItem("override_supabase_anon_key") || "";

export function isSupabaseConfigured() {
  return activeUrl.trim().length > 0 && activeAnonKey.trim().length > 0;
}

export function getSupabaseCredentials() {
  return {
    url: activeUrl,
    anonKey: activeAnonKey,
    isEnvProvided: !!(supabaseUrl && supabaseAnonKey),
  };
}

export function saveSupabaseOverride(url: string, anonKey: string) {
  activeUrl = url;
  activeAnonKey = anonKey;
  if (url && anonKey) {
    localStorage.setItem("override_supabase_url", url);
    localStorage.setItem("override_supabase_anon_key", anonKey);
  } else {
    localStorage.removeItem("override_supabase_url");
    localStorage.removeItem("override_supabase_anon_key");
  }
  // Reinitialize client
  initSupabaseClient();
}

let supabase: any = null;

function initSupabaseClient() {
  if (activeUrl && activeAnonKey) {
    try {
      supabase = createClient(activeUrl, activeAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      supabase = null;
    }
  } else {
    supabase = null;
  }
}

// Initial setup
initSupabaseClient();

export function getSupabaseClient() {
  return supabase;
}
