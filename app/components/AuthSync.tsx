"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthState } from "@/lib/client/auth";

export default function AuthSync() {
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (isSignedIn !== undefined) setAuthState(!!isSignedIn);
  }, [isSignedIn]);
  return null;
}
