const TOKEN_KEY = "ka_access_token";
const USER_KEY = "ka_user";
const THEME_KEY = "ka_theme";

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clearToken: (): void => localStorage.removeItem(TOKEN_KEY),

  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: object): void =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: (): void => localStorage.removeItem(USER_KEY),

  getTheme: (): "light" | "dark" => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },
  setTheme: (mode: "light" | "dark"): void =>
    localStorage.setItem(THEME_KEY, mode),

  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
