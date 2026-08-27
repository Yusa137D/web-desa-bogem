import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vymxgeivzwtozbqtjiim.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5bXhnZWl2end0b3picXRqaWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1OTcxMjUsImV4cCI6MjEwMjE3MzEyNX0.zG169evwh79OXCr7FPEjfyycNbzhQ0eyHne-Zln-6t8";

export const supabase = createClient(supabaseUrl, supabaseKey);