let _isLoggedIn = false;
let _ready = false;
const _listeners: Array<() => void> = [];

export const setAuthState = (val: boolean) => {
  _isLoggedIn = val;
  _ready = true;
  _listeners.splice(0).forEach((fn) => fn());
};

export const isLoggedIn = (): boolean => _isLoggedIn;

// Resolves once Clerk has determined auth state (signed in or not).
// Service functions call this instead of isLoggedIn() to avoid a race
// where Clerk hasn't loaded yet on initial mount.
export const waitForAuth = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (_ready) return Promise.resolve(_isLoggedIn);
  return new Promise((resolve) => {
    _listeners.push(() => resolve(_isLoggedIn));
  });
};
