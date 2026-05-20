export type QueryIssue = {
  message: string;
};

export function getQueryIssue(
  results: Array<{ error?: QueryIssue | null }>,
): QueryIssue | null {
  return results.find((result) => result.error)?.error ?? null;
}

export function normalizeSearch(search?: string) {
  return search?.trim().toLowerCase() ?? "";
}

export function matchesSearch(search: string, values: Array<unknown>) {
  if (!search) {
    return true;
  }

  return values.some((value) => {
    if (value === null || value === undefined) {
      return false;
    }

    return String(value).toLowerCase().includes(search);
  });
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function dealershipStatus(approved: boolean, suspended: boolean) {
  if (suspended) {
    return { label: "Suspended", tone: "danger" as const };
  }

  if (approved) {
    return { label: "Approved", tone: "success" as const };
  }

  return { label: "Pending", tone: "warning" as const };
}

export function statusTone(status: string) {
  if (["approved", "available", "active"].includes(status)) {
    return "success" as const;
  }

  if (["submitted", "under_review", "pending"].includes(status)) {
    return "warning" as const;
  }

  if (["denied", "cancelled", "suspended", "unavailable"].includes(status)) {
    return "danger" as const;
  }

  return "muted" as const;
}
