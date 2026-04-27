"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthState } from "@/lib/client/auth";
import { clearLocalData } from "@/lib/client/dataManager";

export default function AuthSync() {
  const { isSignedIn } = useAuth();
  const prevRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = isSignedIn;

    if (isSignedIn !== undefined) setAuthState(!!isSignedIn);

    // Wipe localStorage on sign-out so no stale data bleeds through
    if (isSignedIn === false && prev === true) clearLocalData();
  }, [isSignedIn]);

  return null;
}
