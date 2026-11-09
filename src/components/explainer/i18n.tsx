"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Translate } from "@phosphor-icons/react";

// Language switch for the interactive explainers (/backprop, /llm). The rest of the
// site stays English, so this lives here instead of in the app layout.

export type Lang = "en" | "de";
export type Tr<T = React.ReactNode> = { en: T; de: T };

const STORAGE_KEY = "explainer-lang";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {} });

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // First render is always English so the static HTML and hydration agree.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (saved === "en" || saved === "de") setLangState(saved);
    else if (navigator.language?.toLowerCase().startsWith("de")) setLangState("de");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "en";
    };
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
};

export const useLang = () => useContext(Ctx);

/** Returns `t({ en, de })`, which picks the current language's variant. */
export const useT = () => {
  const { lang } = useLang();
  return useCallback(<T,>(v: Tr<T>): T => v[lang], [lang]);
};

/** Inline translation: `<T en="Hello" de="Hallo" />`. */
export const T: React.FC<{ en: React.ReactNode; de: React.ReactNode }> = ({ en, de }) => {
  const { lang } = useLang();
  return <>{lang === "de" ? de : en}</>;
};

/** Floating EN | DE pill, bottom left (the symbol cheat sheet sits bottom right). */
export const LangToggle: React.FC = () => {
  const { lang, setLang } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed bottom-5 left-5 z-30 inline-flex h-10 items-center gap-1 rounded-full border border-zinc-200 bg-white/90 p-1 pl-3 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90"
      role="group"
      aria-label="Language / Sprache"
    >
      <Translate size={15} weight="bold" className="mr-1 text-zinc-400" />
      {(["en", "de"] as const).map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={`relative h-8 cursor-pointer rounded-full px-3 text-xs font-bold uppercase transition-colors ${
              active
                ? "text-white dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-zinc-900 dark:bg-zinc-100"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{l}</span>
          </button>
        );
      })}
    </motion.div>
  );
};
