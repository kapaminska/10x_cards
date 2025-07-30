import type { APIRoute } from "astro";
import { flashcardFormSchema } from "@/lib/schemas/flashcard.schema";

export const prerender = false;

// Update a flashcard
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { supabase } = locals;
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Flashcard ID is required" }), {
      status: 400,
    });
  }

  const formData = await request.json();
  const validation = flashcardFormSchema.partial().safeParse(formData);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.flatten() }), {
      status: 400,
    });
  }

  const { error, data } = await supabase.from("flashcards").update(validation.data).eq("id", id).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 200 });
};

// Delete a flashcard
export const DELETE: APIRoute = async ({ params, locals }) => {
  const { supabase } = locals;
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Flashcard ID is required" }), {
      status: 400,
    });
  }

  const { error } = await supabase.from("flashcards").delete().eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(null, { status: 204 });
};
