import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { resetPasswordSchema } from "../../../lib/schemas/auth.schema";
import { logger } from "../../../lib/utils";

export const prerender = false;

export const POST: APIRoute = async ({ request, url, cookies }) => {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid data",
          details: result.error.flatten(),
        }),
        {
          status: 400,
        }
      );
    }

    const { email } = result.data;

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // The redirect URL should point to a page where users can create a new password.
    // This page is not yet created. Let's assume it will be `/update-password`.
    const redirectUrl = new URL("/update-password", url.origin).toString();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      logger.error("Error sending password reset email:", error.message);
    }

    // Always return a success response to prevent email enumeration.
    return new Response(null, { status: 200 });
  } catch (e) {
    logger.error("An unexpected error occurred:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
    });
  }
};
