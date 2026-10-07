import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productAdminUpdateSchema } from "@/lib/validations/catalog-admin";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const parsed = productAdminUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: issue?.message ?? "Please correct the product fields.",
        field: issue?.path.join(".") || undefined,
      },
      { status: 400 },
    );
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (!error && !data) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  if (error) {
    console.error("[admin/products] update failed", {
      code: error.code,
      hint: error.hint,
      message: error.message,
    });
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "That slug is already in use."
            : "Unable to update product.",
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
    .from("products")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (!error && !data) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  if (error) {
    return NextResponse.json({ error: "Unable to delete product." }, { status: 400 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ deleted: true });
}
