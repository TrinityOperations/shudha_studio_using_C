import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productAdminSchema } from "@/lib/validations/catalog-admin";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const parsed = productAdminSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please correct the product fields." },
      { status: 400 },
    );
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
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
  return NextResponse.json({ updated: true });
}

export async function DELETE(_request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Unable to delete product." }, { status: 400 });
  }
  return NextResponse.json({ deleted: true });
}
