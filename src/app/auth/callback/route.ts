import { type NextRequest, NextResponse } from "next/server";

import { isMissingSupabaseEnvError } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (authError) {
    return redirectToAuthError(request, authError);
  }

  if (!code) {
    return redirectToAuthError(request, "Missing auth callback code.");
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return redirectToAuthError(request, error.message);
    }
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      return redirectToAuthError(request, "Supabase environment variables are not configured.");
    }

    throw error;
  }

  return NextResponse.redirect(new URL(next, request.url));
}

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

function redirectToAuthError(request: NextRequest, message: string) {
  const url = new URL("/auth/auth-code-error", request.url);

  url.searchParams.set("error", message);

  return NextResponse.redirect(url);
}
