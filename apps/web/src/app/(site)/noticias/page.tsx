import Link from "next/link";
import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notícias",
  description: "Novidades e artigos da VH Team Fighters.",
};

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  coverKey?: string | null;
};

export default async function NoticiasPage() {
  const posts = await publicGet<Post[]>("/api/public/posts").catch(() => [] as Post[]);

  return (
    <div className="bg-cream pt-10 text-ink md:pt-14">
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <h1 className="font-display text-6xl tracking-wide">Notícias</h1>
        {posts.length ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {posts.map((p) => {
              const cover = mediaUrl(p.coverKey);
              return (
                <Link
                  key={p.id}
                  href={`/noticias/${p.slug}`}
                  className="overflow-hidden border border-ink/10 bg-white transition hover:border-accent"
                >
                  <div
                    className="h-44 bg-cover bg-center"
                    style={{
                      backgroundImage: cover
                        ? `url(${cover})`
                        : "linear-gradient(160deg,#ece7dc,#d9d2c4)",
                    }}
                    role={cover ? "img" : undefined}
                    aria-label={cover ? p.title : undefined}
                  />
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-widest text-ink/50">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("pt-PT") : ""}
                    </p>
                    <h2 className="mt-2 font-display text-3xl">{p.title}</h2>
                    {p.excerpt && <p className="mt-3 text-sm text-ink/70">{p.excerpt}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-12 text-ink/60">Ainda sem notícias publicadas.</p>
        )}
      </div>
    </div>
  );
}
