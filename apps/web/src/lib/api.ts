/** Browser: same-origin (Next rewrite). Server: hit Nest directly. */
export function getApiBase() {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL ?? "http://localhost:3001";
  }
  return "";
}

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function publicGet<T>(path: string, revalidate = 60): Promise<T> {
  return apiFetch<T>(path, { next: { revalidate } });
}
