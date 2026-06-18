import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  xp: number;
  level: number;
  streak: number;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AUTH_COOKIE = 'mantra-auth';

function setAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          setAuthCookie();
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          clearAuthCookie();
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'constel-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state.accessToken) setAuthCookie();
      },
    },
  ),
);

interface AIState {
  isOpen: boolean;
  chatId: string | null;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: Record<string, unknown>;
  toggle: () => void;
  open: () => void;
  close: () => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setChatId: (id: string) => void;
  setContext: (ctx: Record<string, unknown>) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isOpen: true,
  chatId: null,
  messages: [],
  context: {},
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  addMessage: (role, content) =>
    set((s) => ({ messages: [...s.messages, { role, content }] })),
  setChatId: (id) => set({ chatId: id }),
  setContext: (ctx) => set({ context: ctx }),
  clearMessages: () => set({ messages: [], chatId: null }),
}));

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next === 'dark');
          }
          return { theme: next };
        }),
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
        set({ theme });
      },
    }),
    { name: 'constel-theme' },
  ),
);

interface SidebarState {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: 'constel-sidebar' },
  ),
);
