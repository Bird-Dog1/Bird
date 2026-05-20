import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getOptionalSupabaseEnv } from "@/lib/env";
import { type AppRole } from "@/types/app";

const authRoutes = ["/login", "/signup"];
const publicRoutes = ["/", "/auth/callback", "/auth/auth-code-error"];
const roleRoutes: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/dashboard/customer", roles: ["customer", "admin"] },
  { prefix: "/dashboard/dealer", roles: ["dealer", "admin"] },
  { prefix: "/dashboard/admin", roles: ["admin"] },
];

function isPublicPath(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthPath(pathname: string) {
  return authRoutes.includes(pathname);
}

function matchingRoleRoute(pathname: string) {
  return roleRoutes.find(({ prefix }) => pathname.startsWith(prefix));
}

function redirectUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, request.url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const env = getOptionalSupabaseEnv();

  if (!env) {
    if (isPublicPath(pathname) || isAuthPath(pathname)) {
      return response;
    }

    const loginUrl = redirectUrl(request, "/login");
    loginUrl.searchParams.set("next", pathname);
    loginUrl.searchParams.set(
      "error",
      "Supabase environment variables are not configured.",
    );
    return NextResponse.redirect(loginUrl);
  }

  const { url, anonKey } = env;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname) && !isAuthPath(pathname)) {
    const loginUrl = redirectUrl(request, "/login");
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPath(pathname)) {
    return NextResponse.redirect(redirectUrl(request, "/dashboard"));
  }

  const route = matchingRoleRoute(pathname);

  if (user && route) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const profile = data as { role: AppRole } | null;

    if (!profile || !route.roles.includes(profile.role)) {
      return NextResponse.redirect(redirectUrl(request, "/dashboard"));
    }
  }

  return response;
}
