import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productAdminSchema } from "@/lib/validations/catalog-admin";

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = productAdminSchema.safeParse(await request.json());
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
    .insert({ ...parsed.data, gallery_images: [] })
    .select("id")
    .single();
  if (error) {
    console.error("[admin/products] create failed", {
      code: error.code,
      hint: error.hint,
      message: error.message,
    });
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "That slug is already in use."
            : "Unable to create product.",
      },
      { status: error.code === "23505" ? 409 : 400 },
    );
  }
  return NextResponse.json(data, { status: 201 });
}
