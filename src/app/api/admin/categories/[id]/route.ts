import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { categoryAdminSchema } from "@/lib/validations/catalog-admin";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const parsed = categoryAdminSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please correct the category fields." },
      { status: 400 },
    );
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (!error && !data) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }
  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "That slug is already in use."
            : "Unable to update category.",
      },
      { status: error.code === "23505" ? 409 : 400 },
    );
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ updated: true });
}

export async function DELETE(_request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (!error && !data) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }
  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "23503"
            ? "Move or delete its products before deleting this category."
            : "Unable to delete category.",
      },
      { status: error.code === "23503" ? 409 : 400 },
    );
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ deleted: true });
}
