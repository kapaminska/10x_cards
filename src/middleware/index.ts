import { createSupabaseServerInstance } from "../db/supabase.client.ts";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];
const AUTH_PATHS = ["/login", "/register"];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  locals.user = user;
  locals.supabase = supabase;

  if (url.pathname === "/") {
    if (user) {
      return redirect("/generate");
    }
    return redirect("/login");
  }

  if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/login");
  }

  if (user && AUTH_PATHS.includes(url.pathname)) {
    return redirect("/generate");
  }

  return next();
});
