import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

type Event = {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  description?: string | null;
  opponent?: string | null;
  result?: string | null;
  imageKey?: string | null;
};

async function loadEvent(id: string) {
  try {
    return await publicGet<Event>(`/api/public/events/${id}`, 30);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) return { title: "Evento" };
  const img = mediaUrl(event.imageKey);
  return {
    title: event.title,
    description: event.description ?? undefined,
    openGraph: {
      title: event.title,
      description: event.description ?? undefined,
      images: img ? [{ url: img }] : undefined,
    },
  };
}

export default async function EventoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) notFound();

  const img = mediaUrl(event.imageKey);

  return (
    <div className="bg-ink pt-10 md:pt-14">
      <div className="mx-auto max-w-3xl px-5 pb-20">
        <Link href="/eventos" className="text-sm uppercase tracking-widest text-accent">
          ← Eventos
        </Link>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={event.title} className="mt-6 max-h-[420px] w-full object-cover" />
        )}
        <h1 className="mt-6 font-display text-6xl tracking-wide text-cream">{event.title}</h1>
        <p className="mt-4 text-cream/70">
          {new Date(event.date).toLocaleString("pt-PT")}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        {event.opponent && <p className="mt-2 text-sm text-accent">Adversário: {event.opponent}</p>}
        {event.result && <p className="mt-1 text-sm text-cream/80">Resultado: {event.result}</p>}
        {event.description && (
          <p className="mt-8 whitespace-pre-wrap text-lg leading-relaxed text-cream/80">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}
