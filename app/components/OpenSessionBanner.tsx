"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Session } from "@/lib/types";
import { getOpenSession } from "@/lib/client/sessions";

export default function OpenSessionBanner() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getOpenSession().then(setSession);
  }, []);

  if (!session) return null;

  return (
    <div className="flex items-center justify-between bg-emerald-900 px-4 py-2.5 text-sm">
      <div>
        <p className="font-medium text-white">Session in progress</p>
        <p className="text-xs text-emerald-300">
          {session.location_name} · {session.stakes_label} · ${session.buy_in}
        </p>
      </div>
      <Link
        href="/sessions/close"
        className="ml-4 shrink-0 font-medium text-emerald-300 hover:text-white"
      >
        Close →
      </Link>
    </div>
  );
}
