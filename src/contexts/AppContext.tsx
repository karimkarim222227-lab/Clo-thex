import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSetting, setSetting } from "@/lib/db";
import { translations, type Lang, type Translation } from "@/i18n/translations";

type Theme = "light" | "dark";

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translation;
  theme: Theme;
  setTheme: (t: Theme) => void;
  formatPrice: (dzd: number) => string;
  isReady: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);
const RTL_LANGS: Lang[] = ["ar"];

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [l, th] = await Promise.all([
        getSetting<Lang>("lang"),
        getSetting<Theme>("theme"),
      ]);
      if (l) setLangState(l);
      if (th) setThemeState(th);
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
  }, [theme]);

  const setLang = (l: Lang) => { setLangState(l); setSetting("lang", l); };
  const setTheme = (t: Theme) => { setThemeState(t); setSetting("theme", t); };

  const t = translations[lang] as Translation;

  const formatPrice = (dzd: number) => {
    const v = Math.round(dzd);
    const formatted = new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : lang, {
      maximumFractionDigits: 0,
    }).format(v);
    return `${formatted} ${lang === "ar" ? "د.ج" : "DZD"}`;
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t, theme, setTheme, formatPrice, isReady }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
