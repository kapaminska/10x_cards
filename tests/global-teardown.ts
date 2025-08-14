/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { Database } from "../src/db/database.types";

export default async function globalTeardown() {
  console.log("[globalTeardown] Starting cleanup...");
  // Load test environment variables
  dotenv.config({ path: ".env.test" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_KEY;
  const testUserEmail = process.env.E2E_USERNAME;
  const testUserPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[globalTeardown] Missing SUPABASE_URL or SUPABASE_KEY. Skipping DB cleanup.");
    return;
  }

  if (!testUserEmail || !testUserPassword) {
    console.warn("[globalTeardown] Missing E2E_USERNAME or E2E_PASSWORD. Skipping DB cleanup.");
    return;
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testUserEmail,
    password: testUserPassword,
  });

  if (authError || !authData.user) {
    console.warn("[globalTeardown] Unable to sign in test user for cleanup:", authError?.message ?? "unknown error");
    return;
  }

  const signedInUserId = authData.user.id;

  const { error: deleteError } = await supabase.from("flashcards").delete().eq("user_id", signedInUserId);

  if (deleteError) {
    console.warn("[globalTeardown] Failed to delete test flashcards:", deleteError.message);
  } else {
    console.log("[globalTeardown] Successfully cleaned up flashcards for signed-in test user.");
  }
}
