export function safeRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return "/dashboard";
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/dashboard";
  }

  return trimmed;
}

export function pathWithSearch(pathname: string, search: string) {
  return `${pathname}${search}`;
}
