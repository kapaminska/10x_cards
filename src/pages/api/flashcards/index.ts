import type { APIRoute } from "astro";
import type { FlashcardsListResponse, FlashcardRow } from "@/types";
import { flashcardFormSchema } from "@/lib/schemas/flashcard.schema";

export const prerender = false;

export const GET: APIRoute = async function GET({ url, locals }) {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const sortBy = url.searchParams.get("sort") || "created_at";
  const order = url.searchParams.get("order") || "desc";
  const source = url.searchParams.get("source");

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("flashcards")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order(sortBy, { ascending: order === "asc" })
    .range(from, to);

  if (source) {
    query = query.eq("source", source);
  }

  const { data, error, count } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const response: FlashcardsListResponse = {
    data: (data || []).map((flashcard: FlashcardRow) => ({
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      generationId: flashcard.generation_id,
      createdAt: flashcard.created_at,
      updatedAt: flashcard.updated_at,
    })),
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
  const { supabase, user } = locals;
  const formData = await request.json();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

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
      user_id: user.id,
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
