import { type NextRequest, NextResponse } from "next/server";

import { isMissingSupabaseEnvError } from "@/lib/env";
import { safeRedirectPath } from "@/lib/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeRedirectPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
    }
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    throw error;
  }

  return NextResponse.redirect(new URL(next, request.url));
}
