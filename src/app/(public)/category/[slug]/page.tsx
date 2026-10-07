import { redirect } from "next/navigation";

export default async function LegacyCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") query.set(key, value);
  }
  const suffix = query.size ? `?${query.toString()}` : "";
  redirect(`/shop/category/${encodeURIComponent(slug)}${suffix}`);
}
