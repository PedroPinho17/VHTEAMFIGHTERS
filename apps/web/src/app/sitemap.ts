import type { MetadataRoute } from "next";
import { publicGet } from "@/lib/api";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

type Post = { slug: string; publishedAt?: string | null; updatedAt?: string };
type Event = { id: string; date: string; updatedAt?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/lutadores",
    "/coaches",
    "/horarios",
    "/eventos",
    "/noticias",
    "/galeria",
    "/contactos",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "weekly" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const [posts, events] = await Promise.all([
    publicGet<Post[]>("/api/public/posts").catch(() => [] as Post[]),
    publicGet<Event[]>("/api/public/events").catch(() => [] as Event[]),
  ]);

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/noticias/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${siteUrl}/eventos/${e.id}`,
    lastModified: e.date ? new Date(e.date) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...eventRoutes];
}
