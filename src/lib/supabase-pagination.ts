import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 500;

export async function selectAllRows<T>(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  orderColumn: string,
) {
  const rows: T[] = [];
  for (let page = 0; ; page += 1) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderColumn)
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}
