import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

let supabase;

if (!supabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };