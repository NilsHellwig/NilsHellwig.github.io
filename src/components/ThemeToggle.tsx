"use client";

import React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
      {theme === "light" ? <Moon size={20} weight="regular" /> : <Sun size={20} weight="regular" />}
    </button>
  );
};

export default ThemeToggle;
