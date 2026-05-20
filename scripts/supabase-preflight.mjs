import { existsSync, readFileSync } from "node:fs";

const requiredTables = [
  "profiles",
  "dealerships",
  "dealer_users",
  "vehicles",
  "vehicle_photos",
  "rental_applications",
  "application_documents",
  "rentals",
];

const requiredBuckets = ["vehicle-photos", "application-documents"];

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const failures = [];
const warnings = [];

if (!supabaseUrl) {
  failures.push("NEXT_PUBLIC_SUPABASE_URL is missing.");
}

if (!supabaseAnonKey) {
  failures.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
}

if (!siteUrl) {
  warnings.push("NEXT_PUBLIC_SITE_URL is missing; auth callbacks will default to localhost.");
} else if (process.env.NODE_ENV === "production" && siteUrl.includes("localhost")) {
  failures.push("NEXT_PUBLIC_SITE_URL must not point at localhost in production.");
}

if (failures.length === 0) {
  await checkAuth();
  await checkTables();
  await checkBuckets();
}

if (warnings.length > 0) {
  console.warn("\nWarnings:");
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (failures.length > 0) {
  console.error("\nSupabase preflight failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(
    "\nApply the SQL files in supabase/migrations, configure auth redirect URLs, then rerun npm run supabase:preflight.",
  );
  process.exit(1);
}

console.log("Supabase preflight passed.");

async function checkAuth() {
  const response = await supabaseFetch("/auth/v1/health");

  if (!response.ok) {
    failures.push(`Supabase Auth health check failed with HTTP ${response.status}.`);
  }
}

async function checkTables() {
  for (const table of requiredTables) {
    const response = await supabaseFetch(`/rest/v1/${table}?select=*&limit=1`);

    if (!response.ok) {
      const error = await safeJson(response);
      failures.push(
        `${table} table is unavailable (${error.code ?? response.status}: ${
          error.message ?? response.statusText
        }).`,
      );
    }
  }
}

async function checkBuckets() {
  for (const bucket of requiredBuckets) {
    const response = await supabaseFetch(`/storage/v1/object/list/${bucket}`, {
      body: JSON.stringify({ limit: 1, offset: 0, prefix: "" }),
      method: "POST",
    });

    if (!response.ok) {
      const error = await safeJson(response);
      failures.push(
        `${bucket} storage bucket is unavailable (${
          error.statusCode ?? error.code ?? response.status
        }: ${error.message ?? response.statusText}).`,
      );
    }
  }
}

function supabaseFetch(path, init = {}) {
  return fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  const contents = readFileSync(path, "utf8");

  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}
