"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Session } from "@/lib/types";
import { getSessionById } from "@/lib/client/sessions";
import SessionView from "./SessionView";
import SessionEditForm from "./SessionEditForm";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  useEffect(() => {
    getSessionById(id).then((s) => {
      if (!s) { router.replace("/sessions"); return; }
      setSession(s);
      setLoading(false);
    });
  }, [id, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Loading…</p>
      </main>
    );
  }

  if (!session) return null;

  if (mode === "edit") {
    return (
      <SessionEditForm
        session={session}
        onSaved={(updated) => { setSession(updated); setMode("view"); }}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <SessionView
      session={session}
      onEdit={() => setMode("edit")}
      onDeleted={() => router.replace("/sessions")}
    />
  );
}
