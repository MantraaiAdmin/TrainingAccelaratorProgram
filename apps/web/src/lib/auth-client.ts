/** Client-side session detection (localStorage is source of truth for SPA auth). */

export function readPersistedAuthState(): {
  user: Record<string, unknown> | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('constel-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    const state = parsed.state;
    if (!state || typeof state !== 'object') return null;
    return {
      user: (state.user as Record<string, unknown> | null) ?? null,
      accessToken: (state.accessToken as string | null) ?? null,
      refreshToken: (state.refreshToken as string | null) ?? null,
      isAuthenticated: state.isAuthenticated === true,
    };
  } catch {
    return null;
  }
}

export function hasClientSession(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('accessToken')) return true;
  const persisted = readPersistedAuthState();
  return !!persisted?.accessToken && persisted.isAuthenticated !== false;
}

export function getClientAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || readPersistedAuthState()?.accessToken || null;
}
