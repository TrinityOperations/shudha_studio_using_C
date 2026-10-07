import type { Category } from "@/types/catalog";
import type { CustomTheme } from "@/lib/custom-themes";

export type StorefrontGroup = {
  id: "categories" | "occasions" | "recipients" | "collections";
  items: Pick<Category, "id" | "slug" | "name_en" | "name_bn">[];
};

export const occasionOptions = [
  ["birthday", "Birthday", "জন্মদিন"],
  ["wedding", "Wedding", "বিয়ে"],
  ["anniversary", "Anniversary", "বার্ষিকী"],
  ["eid", "Eid", "ঈদ"],
  ["new_baby", "New baby", "নতুন শিশু"],
  ["thank_you", "Thank you", "ধন্যবাদ"],
  ["corporate", "Corporate", "কর্পোরেট"],
  ["seasonal", "Seasonal gifting", "মৌসুমি উপহার"],
] as const;

export const recipientOptions = [
  ["her", "For her", "তার জন্য"],
  ["him", "For him", "তার জন্য"],
  ["parents", "For parents", "মা-বাবার জন্য"],
  ["children", "For children", "শিশুদের জন্য"],
  ["friends", "For friends", "বন্ধুদের জন্য"],
  ["couples", "For couples", "দম্পতিদের জন্য"],
] as const;

export type DiscoveryKey =
  (typeof occasionOptions)[number][0] | (typeof recipientOptions)[number][0];
export type DiscoveryLink = { key: DiscoveryKey; category_id: string };

export function migrateLegacyDiscoveryContent<
  T extends {
    occasion_category_ids?: string[];
    recipient_category_ids?: string[];
    occasion_links?: DiscoveryLink[];
    recipient_links?: DiscoveryLink[];
  },
>(content: T) {
  const occasionKeys = occasionOptions.map(([key]) => key);
  const recipientKeys = recipientOptions.map(([key]) => key);
  return {
    ...content,
    occasion_links:
      content.occasion_links ??
      (content.occasion_category_ids ?? [])
        .slice(0, occasionKeys.length)
        .map((category_id, index) => ({ key: occasionKeys[index], category_id })),
    recipient_links:
      content.recipient_links ??
      (content.recipient_category_ids ?? [])
        .slice(0, recipientKeys.length)
        .map((category_id, index) => ({ key: recipientKeys[index], category_id })),
  };
}

export function buildStorefrontGroups(
  categories: Category[],
  content: CustomTheme["content"],
): StorefrontGroup[] {
  const groups: StorefrontGroup[] = [{ id: "categories", items: categories }];
  for (const [id, ids] of [
    ["occasions", content.occasion_category_ids],
    ["recipients", content.recipient_category_ids],
    ["collections", content.collection_category_ids],
  ] as const) {
    const items = ids
      .map((categoryId) => categories.find((category) => category.id === categoryId))
      .filter((category): category is Category => Boolean(category));
    if (items.length) groups.push({ id, items });
  }
  return groups;
}

export function resolveDiscoveryLinks(links: DiscoveryLink[], categories: Category[]) {
  return links.flatMap((link) => {
    const category = categories.find((item) => item.id === link.category_id);
    return category ? [{ key: link.key, category }] : [];
  });
}

export function resolveDiscoveryLink(
  links: DiscoveryLink[],
  key: string,
  categories: Category[],
) {
  const link = links.find((item) => item.key === key);
  if (!link) return null;
  return categories.find((category) => category.id === link.category_id) ?? null;
}

export function buildDiscoveryHref(kind: "occasion" | "recipient", key: string) {
  return `/shop/${kind}/${encodeURIComponent(key)}`;
}
