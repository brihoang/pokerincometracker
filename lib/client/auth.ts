// Returns true when a Clerk session is active on the client.
// Uses window.__clerk (the global Clerk singleton) so this works outside
// React components — no hook required. Falls back to false during SSR or
// before Clerk has loaded.
export const isLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!((window as any).__clerk?.session);
};
