import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { updatePasswordSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const result = updatePasswordSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ error: "Invalid data", details: result.error.flatten() }), {
        status: 400,
      });
    }

    const { password } = result.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // Supabase client exchanges the code for a session in the background
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Error updating password:", error.message);
      return new Response(JSON.stringify({ error: "Link wygasł lub jest nieprawidłowy." }), {
        status: 401,
      });
    }

    return new Response(null, { status: 200 });
  } catch (e) {
    console.error("An unexpected error occurred:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
    });
  }
};
