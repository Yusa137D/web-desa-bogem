import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton browser client instance for convenient client-side usage
export const supabase = typeof window !== "undefined"
  ? createClient()
  : (null as unknown as ReturnType<typeof createClient>);
