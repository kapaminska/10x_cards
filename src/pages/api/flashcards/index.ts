import type { APIRoute } from "astro";
import type { FlashcardsListResponse } from "@/types";
import { DEFAULT_USER_ID } from "@/db/supabase.client";
import { flashcardFormSchema } from "@/lib/schemas/flashcard.schema";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const { supabase } = locals;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const sortBy = url.searchParams.get("sort") || "created_at";
  const order = url.searchParams.get("order") || "desc";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("flashcards")
    .select("*", { count: "exact" })
    .eq("user_id", DEFAULT_USER_ID)
    .order(sortBy, { ascending: order === "asc" })
    .range(from, to);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const response: FlashcardsListResponse = {
    data: data || [],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;
  const formData = await request.json();

  const validation = flashcardFormSchema.safeParse(formData);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { front, back } = validation.data;

  const { data, error } = await supabase
    .from("flashcards")
    .insert({
      front,
      back,
      user_id: DEFAULT_USER_ID,
      source: "manual",
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
