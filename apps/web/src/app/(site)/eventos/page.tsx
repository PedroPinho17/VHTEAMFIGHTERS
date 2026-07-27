import Link from "next/link";
import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

type Event = {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  description?: string | null;
  imageKey?: string | null;
};

export default async function EventosPage() {
  const events = await publicGet<Event[]>("/api/public/events").catch(() => [] as Event[]);

  return (
    <div className="bg-ink pt-10 md:pt-14">
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <h1 className="font-display text-6xl tracking-wide text-cream">Eventos</h1>
        <div className="mt-12 space-y-4">
          {events.map((e) => (
            <Link
              key={e.id}
              href={`/eventos/${e.id}`}
              className="grid gap-0 overflow-hidden border border-white/10 bg-panel transition hover:border-accent md:grid-cols-[200px_1fr]"
            >
              <div
                className="min-h-36 bg-cover bg-center"
                style={{
                  backgroundImage: mediaUrl(e.imageKey)
                    ? `url(${mediaUrl(e.imageKey)})`
                    : "linear-gradient(160deg,#2a2f38,#12151a)",
                }}
              />
              <div className="p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h2 className="font-display text-3xl text-cream">{e.title}</h2>
                  <p className="text-sm text-cream/60">
                    {new Date(e.date).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {e.location && <p className="mt-2 text-sm text-accent">{e.location}</p>}
                {e.description && <p className="mt-3 text-sm text-cream/70">{e.description}</p>}
              </div>
            </Link>
          ))}
          {!events.length && <p className="text-cream/60">Sem eventos publicados.</p>}
        </div>
      </div>
    </div>
  );
}
