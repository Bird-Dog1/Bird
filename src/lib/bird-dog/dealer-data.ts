import type { SupabaseClient } from "@supabase/supabase-js";

import type { Dealership } from "@/lib/bird-dog/types";
import type { Database } from "@/lib/supabase/database.types";

export async function listAccessibleDealerships(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("dealer_users")
    .select("dealerships (*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const dealerships = (data ?? [])
    .map((row) => row.dealerships)
    .flat()
    .filter((dealership): dealership is Dealership => Boolean(dealership));

  return { data: dealerships, error };
}
