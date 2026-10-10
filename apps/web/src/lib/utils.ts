import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mediaUrl(key?: string | null) {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  const base =
    process.env.NEXT_PUBLIC_S3_PUBLIC_URL ??
    "http://vh-media.web.garage.localhost:3902";
  // R2 public / Garage website: só a key. Path-style legado: NEXT_PUBLIC_S3_INCLUDE_BUCKET=true
  if (process.env.NEXT_PUBLIC_S3_INCLUDE_BUCKET === "true") {
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET ?? "vh-media";
    return `${base.replace(/\/$/, "")}/${bucket}/${key}`;
  }
  return `${base.replace(/\/$/, "")}/${key}`;
}

export const dayLabels: Record<string, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};
