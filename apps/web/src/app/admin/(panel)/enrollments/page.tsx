"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";

type Enrollment = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
};

const statusLabel: Record<string, string> = {
  NEW: "Nova",
  SENT: "Email enviado",
  FAILED: "Falha no email",
  HANDLED: "Tratada",
};

export default function AdminEnrollmentsPage() {
  const { data: session } = authClient.useSession();
  const [items, setItems] = useState<Enrollment[]>([]);
  const [selected, setSelected] = useState<Enrollment | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setItems(await adminFetch<Enrollment[]>("/api/admin/enrollments"));
  }

  useEffect(() => {
    if (!session) return;
    load().catch(console.error);
  }, [session]);

  async function setStatus(id: string, status: string) {
    setBusy(true);
    setMsg("");
    try {
      const updated = await adminFetch<Enrollment>(`/api/admin/enrollments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setSelected((s) => (s?.id === id ? updated : s));
      setMsg("Estado atualizado.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function retry(id: string) {
    setBusy(true);
    setMsg("");
    try {
      await adminFetch(`/api/admin/enrollments/${id}/retry`, { method: "POST" });
      await load();
      setMsg("Email reencaminhado para a fila.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function exportGdpr(id: string) {
    setBusy(true);
    setMsg("");
    try {
      const data = await adminFetch<unknown>(`/api/admin/enrollments/${id}/gdpr-export`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gdpr-export-enrollment-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Export RGPD descarregado.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function eraseGdpr(id: string) {
    if (
      !confirm(
        "Apagar dados pessoais desta inscrição (RGPD)? Nome/email/telefone/mensagem serão anonimizados. Irreversível.",
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      await adminFetch(`/api/admin/enrollments/${id}/gdpr-erase`, {
        method: "POST",
        body: JSON.stringify({ confirm: true }),
      });
      setSelected(null);
      await load();
      setMsg("Dados pessoais apagados (RGPD).");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl">Inscrições</h1>
        <p className="mt-2 text-sm text-cream/50">
          Pedidos recebidos pelo formulário público. Marca como tratada quando contactares a pessoa.
        </p>
      </div>

      {msg && <p className="text-sm text-cream/70">{msg}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto border border-ink/10 bg-white text-ink">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink text-cream">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr
                  key={i.id}
                  className={`cursor-pointer border-t border-ink/10 hover:bg-cream/40 ${
                    selected?.id === i.id ? "bg-cream/60" : ""
                  }`}
                  onClick={() => setSelected(i)}
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    {new Date(i.createdAt).toLocaleString("pt-PT")}
                  </td>
                  <td className="px-3 py-3 font-medium">{i.name}</td>
                  <td className="px-3 py-3">{i.email}</td>
                  <td className="px-3 py-3">{statusLabel[i.status] ?? i.status}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-ink/50">
                    Sem inscrições de momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="border border-white/10 bg-[#171b21] p-5">
          {selected ? (
            <div className="space-y-3 text-sm">
              <h2 className="font-display text-3xl text-cream">{selected.name}</h2>
              <p>
                <a className="text-accent underline" href={`mailto:${selected.email}`}>
                  {selected.email}
                </a>
              </p>
              {selected.phone && (
                <p>
                  <a className="text-accent underline" href={`tel:${selected.phone.replace(/\s/g, "")}`}>
                    {selected.phone}
                  </a>
                </p>
              )}
              <p className="text-cream/45">
                {new Date(selected.createdAt).toLocaleString("pt-PT")} ·{" "}
                {statusLabel[selected.status] ?? selected.status}
              </p>
              {selected.message && (
                <p className="whitespace-pre-wrap rounded-md border border-white/10 bg-ink/40 p-3 text-cream/80">
                  {selected.message}
                </p>
              )}
              <div className="flex flex-col gap-2 pt-2">
                {selected.status !== "HANDLED" && (
                  <Button
                    disabled={busy}
                    onClick={() => setStatus(selected.id, "HANDLED")}
                  >
                    Marcar como tratada
                  </Button>
                )}
                {selected.status === "HANDLED" && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setStatus(selected.id, "NEW")}
                  >
                    Reabrir
                  </Button>
                )}
                {(selected.status === "FAILED" || selected.status === "NEW") && (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => retry(selected.id)}
                  >
                    Reenviar email
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => exportGdpr(selected.id)}
                >
                  Exportar RGPD (JSON)
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => eraseGdpr(selected.id)}
                >
                  Apagar dados RGPD
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-cream/45">Seleciona uma inscrição para ver detalhes.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
