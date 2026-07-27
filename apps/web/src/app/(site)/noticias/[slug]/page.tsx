import Link from "next/link";
import { notFound } from "next/navigation";
import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

type Post = {
  title: string;
  body: string;
  publishedAt?: string | null;
  coverKey?: string | null;
};

export default async function NoticiaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post: Post | null = null;
  try {
    post = await publicGet<Post>(`/api/public/posts/${slug}`, 30);
  } catch {
    notFound();
  }
  if (!post) notFound();

  const cover = mediaUrl(post.coverKey);

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
        <div className="prose-vh mt-10 whitespace-pre-wrap text-lg leading-relaxed text-ink/80">
          {post.body}
        </div>
      </article>
    </div>
  );
}
