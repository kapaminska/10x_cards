import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { registerSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ error: "Invalid data", details: result.error.flatten() }), {
        status: 400,
      });
    }

    const { email, password } = result.data;

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error signing up:", error.message);
      const status = error.message.includes("already registered") ? 409 : 500;
      return new Response(JSON.stringify({ error: error.message }), {
        status,
      });
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return new Response(
        JSON.stringify({
          error: "This user already exists. Please sign in.",
        }),
        { status: 409 }
      );
    }

    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
    });
  } catch (e) {
    console.error("An unexpected error occurred:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
    });
  }
};
