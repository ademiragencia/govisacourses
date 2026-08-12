export const SUPABASE_URL = "https://rklhlorhfgpueffsqfod.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGhsb3JoZmdwdWVmZnNxZm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjUyNTAsImV4cCI6MjA5MTUwMTI1MH0.11b9Xc5dTk7IZLslUbAG54JqS16fW2M-3kvBn9Pcud0";

export async function supabaseRpc<T>(fn: string, args: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const json = (await res.json().catch(() => null)) as T | { message?: string } | null;
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : `Supabase ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}
