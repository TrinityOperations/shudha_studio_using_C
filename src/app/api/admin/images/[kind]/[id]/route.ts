import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Kind = "category" | "product";
type Context = { params: Promise<{ kind: string; id: string }> };

function isKind(value: string): value is Kind {
  return value === "category" || value === "product";
}

function isSafePath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    path.length <= 500 &&
    !path.includes("..")
  );
}

function isGallery(value: unknown): value is Array<Record<string, unknown>> {
  return (
    Array.isArray(value) &&
    value.length <= 10 &&
    value.every(
      (image) =>
        image &&
        typeof image === "object" &&
        isSafePath((image as Record<string, unknown>).path),
    )
  );
}

export async function PATCH(request: Request, context: Context) {
  await requireAdmin();
  const { kind, id } = await context.params;
  if (!isKind(kind))
    return NextResponse.json({ error: "Invalid image resource." }, { status: 400 });

  const body = (await request.json()) as {
    image_path?: unknown;
    gallery_images?: unknown;
  };
  const supabase = await createSupabaseServerClient();

  if (
    kind === "category" &&
    (body.image_path === null || isSafePath(body.image_path))
  ) {
    const { error } = await supabase
      .from("categories")
      .update({ image_path: body.image_path })
      .eq("id", id);
    if (error)
      return NextResponse.json(
        { error: "Unable to save the category image." },
        { status: 400 },
      );
    return NextResponse.json({ saved: true });
  }

  if (kind === "product" && (body.image_path === null || isSafePath(body.image_path))) {
    const { error } = await supabase
      .from("products")
      .update({ main_image_path: body.image_path })
      .eq("id", id);
    if (error)
      return NextResponse.json(
        { error: "Unable to save the product image." },
        { status: 400 },
      );
    return NextResponse.json({ saved: true });
  }

  if (kind === "product" && isGallery(body.gallery_images)) {
    const { error } = await supabase
      .from("products")
      .update({ gallery_images: body.gallery_images })
      .eq("id", id);
    if (error)
      return NextResponse.json(
        { error: "Unable to save the product gallery." },
        { status: 400 },
      );
    return NextResponse.json({ saved: true });
  }

  return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
}
