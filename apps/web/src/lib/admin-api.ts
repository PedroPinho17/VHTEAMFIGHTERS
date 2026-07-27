import { getApiBase } from "@/lib/api";

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<T>;
}

export async function uploadImage(file: File, folder = "uploads") {
  const { key, uploadUrl, publicUrl } = await adminFetch<{
    key: string;
    uploadUrl: string;
    publicUrl: string;
  }>("/api/admin/media/presign", {
    method: "POST",
    body: JSON.stringify({ contentType: file.type || "image/jpeg", folder }),
  });
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  if (!put.ok) throw new Error("Upload failed");
  return { key, publicUrl };
}
