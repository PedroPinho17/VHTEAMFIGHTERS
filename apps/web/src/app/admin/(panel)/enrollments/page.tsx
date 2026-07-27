"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";

type Enrollment = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
};

export default function AdminEnrollmentsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [items, setItems] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (!session) return;
    adminFetch<Enrollment[]>("/api/admin/enrollments").then(setItems).catch(console.error);
  }, [session]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl">Inscrições</h1>
      <div className="overflow-x-auto border border-ink/10 bg-white text-ink">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-cream">
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-ink/10">
                <td className="px-3 py-3">{new Date(i.createdAt).toLocaleString("pt-PT")}</td>
                <td className="px-3 py-3">{i.name}</td>
                <td className="px-3 py-3">{i.email}</td>
                <td className="px-3 py-3">{i.status}</td>
                <td className="px-3 py-3 max-w-xs truncate">{i.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
