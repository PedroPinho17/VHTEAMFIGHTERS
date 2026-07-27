import { publicGet } from "@/lib/api";
import { dayLabels } from "@/lib/utils";

type Slot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  modality: string;
  level?: string | null;
  note?: string | null;
};

export default async function HorariosPage() {
  const slots = await publicGet<Slot[]>("/api/public/schedule").catch(() => [] as Slot[]);

  return (
    <div className="bg-cream text-ink">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:pt-14">
        <h1 className="font-display text-6xl tracking-wide">Horários</h1>
        <p className="mt-3 max-w-2xl text-ink/70">Treinos semanais da VH Team Fighters.</p>
        <div className="mt-12 overflow-hidden border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink text-cream">
              <tr>
                <th className="px-4 py-3 font-medium">Dia</th>
                <th className="px-4 py-3 font-medium">Hora</th>
                <th className="px-4 py-3 font-medium">Modalidade</th>
                <th className="px-4 py-3 font-medium">Nível</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="border-t border-ink/10">
                  <td className="px-4 py-4 font-semibold">{dayLabels[s.day] ?? s.day}</td>
                  <td className="px-4 py-4">
                    {s.startTime} – {s.endTime}
                  </td>
                  <td className="px-4 py-4">{s.modality}</td>
                  <td className="px-4 py-4 text-ink/70">{s.level ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!slots.length && <p className="p-6 text-ink/60">Horários em atualização.</p>}
        </div>
      </div>
    </div>
  );
}
