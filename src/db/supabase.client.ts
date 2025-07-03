import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables. Please check your .env file in the project root.
    Required variables: SUPABASE_URL, SUPABASE_KEY
    Current values: SUPABASE_URL=${supabaseUrl}, SUPABASE_KEY=${supabaseAnonKey ? "[REDACTED]" : "undefined"}`
  );
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const DEFAULT_USER_ID = "03f9de57-49ab-4e56-89b0-8511c0c59bdd";
