"use client";

import React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon size={20} weight="fill" className="text-zinc-700 dark:text-zinc-300" />
      ) : (
        <Sun size={20} weight="fill" className="text-zinc-300" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
