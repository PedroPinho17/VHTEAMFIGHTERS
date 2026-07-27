import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mediaUrl(key?: string | null) {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  const base = process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? process.env.NEXT_PUBLIC_API_URL?.replace("3001", "9000") ?? "http://localhost:9000";
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET ?? "vh-media";
  return `${base.replace(/\/$/, "")}/${bucket}/${key}`;
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
