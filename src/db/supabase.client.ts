import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

// In test mode or CI, use hardcoded local values if env vars are not available
const isTestMode = process.env.NODE_ENV === "test" || process.env.CI === "true" || typeof window === "undefined";
const supabaseUrl =
  import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL ?? (isTestMode ? "http://127.0.0.1:54321" : undefined);
const supabaseAnonKey =
  import.meta.env.SUPABASE_KEY ??
  process.env.SUPABASE_KEY ??
  (isTestMode
    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Environment debug info:", {
    "import.meta.env.SUPABASE_URL": import.meta.env.SUPABASE_URL,
    "import.meta.env.SUPABASE_KEY": import.meta.env.SUPABASE_KEY ? "[REDACTED]" : "undefined",
    "process.env.SUPABASE_URL": process.env.SUPABASE_URL,
    "process.env.SUPABASE_KEY": process.env.SUPABASE_KEY ? "[REDACTED]" : "undefined",
    "process.env.NODE_ENV": process.env.NODE_ENV,
    "process.env.CI": process.env.CI,
    isTestMode: isTestMode,
  });
  throw new Error(`Missing Supabase environment variables. Please check your .env file in the project root.
    Required variables: SUPABASE_URL, SUPABASE_KEY`);
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const DEFAULT_USER_ID = "03f9de57-49ab-4e56-89b0-8511c0c59bdd";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptionsWithName;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
