type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export class MissingSupabaseEnvError extends Error {
  constructor() {
    super(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
    this.name = "MissingSupabaseEnvError";
  }
}

export function getOptionalSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseEnv(): SupabaseEnv {
  const env = getOptionalSupabaseEnv();

  if (!env) {
    throw new MissingSupabaseEnvError();
  }

  return env;
}

export function isMissingSupabaseEnvError(error: unknown) {
  return error instanceof MissingSupabaseEnvError;
}
