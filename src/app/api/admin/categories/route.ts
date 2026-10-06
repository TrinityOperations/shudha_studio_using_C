import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { categoryAdminSchema } from "@/lib/validations/catalog-admin";

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = categoryAdminSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please correct the category fields." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "That slug is already in use."
            : "Unable to create category.",
      },
      { status: error.code === "23505" ? 409 : 400 },
    );
  }
  return NextResponse.json(data, { status: 201 });
}
