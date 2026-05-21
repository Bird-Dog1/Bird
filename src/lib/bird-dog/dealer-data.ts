import type { SupabaseClient } from "@supabase/supabase-js";

import type { Dealership } from "@/lib/bird-dog/types";
import type { Database } from "@/lib/supabase/database.types";
import type { AppRole } from "@/types/app";

export async function listAccessibleDealerships(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: AppRole,
) {
  if (role === "admin") {
    const { data, error } = await supabase
      .from("dealerships")
      .select("*")
      .order("created_at", { ascending: false });

    return { data: (data ?? []) as Dealership[], error };
  }

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
