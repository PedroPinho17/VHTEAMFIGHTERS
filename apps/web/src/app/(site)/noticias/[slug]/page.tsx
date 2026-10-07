import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown";

type Post = {
  title: string;
  body: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  coverKey?: string | null;
};

async function loadPost(slug: string) {
  try {
    return await publicGet<Post>(`/api/public/posts/${slug}`, 30);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Notícia" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: mediaUrl(post.coverKey) ? [{ url: mediaUrl(post.coverKey)! }] : undefined,
    },
  };
}

export default async function NoticiaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const cover = mediaUrl(post.coverKey);
  const html = markdownToHtml(post.body);

  return (
    <div className="bg-cream pt-10 text-ink md:pt-14">
      <article className="mx-auto max-w-3xl px-5 pb-20">
        <Link href="/noticias" className="text-sm uppercase tracking-widest text-accent-strong">
          ← Notícias
        </Link>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={post.title} className="mt-6 max-h-[420px] w-full object-cover" />
        )}
        <h1 className="mt-6 font-display text-6xl tracking-wide">{post.title}</h1>
        {post.publishedAt && (
          <p className="mt-3 text-sm text-ink/50">
            {new Date(post.publishedAt).toLocaleDateString("pt-PT")}
          </p>
        )}
        <div
          className="prose-vh mt-10 text-lg leading-relaxed text-ink/80"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}
