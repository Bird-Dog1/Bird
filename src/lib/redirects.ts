import { type Route } from "next";

const localOrigin = "https://bird-dog.local";

export function safeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback: Route = "/dashboard",
): Route {
  if (typeof value !== "string") {
    return fallback;
  }

  const candidate = value.trim();

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\")
  ) {
    return fallback;
  }

  try {
    const url = new URL(candidate, localOrigin);

    if (url.origin !== localOrigin) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}` as Route;
  } catch {
    return fallback;
  }
}

export function routeWithParams(
  pathname: string,
  params: Record<string, string | null | undefined>,
): Route {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return (query ? `${pathname}?${query}` : pathname) as Route;
}
