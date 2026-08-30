import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Universal singleton client instance for convenient usage
export const supabase = createClient();
