"use client";

import { useEffect, useState } from "react";
import { Session } from "@/lib/types";
import { getOpenSession } from "@/lib/client/sessions";

export default function OpenSessionBanner() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getOpenSession().then(setSession);
  }, []);

  if (!session) return null;

  return (
    <div className="flex items-center justify-between bg-emerald-900 px-4 py-2 text-sm">
      <span className="text-emerald-200">
        <span className="font-medium text-white">Session in progress</span>
        {" · "}
        {session.location_name} · {session.stakes_label} · ${session.buy_in}
      </span>
      <a
        href="/sessions/close"
        className="ml-4 shrink-0 font-medium text-emerald-300 hover:text-white"
      >
        Close →
      </a>
    </div>
  );
}
