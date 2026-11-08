"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  House,
  User,
  Briefcase,
  BookOpen,
  Chalkboard,
  Article,
  Stamp,
} from "@phosphor-icons/react";

interface PageSelectorProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const pathname = usePathname();

  const navigationItems = [
    { path: "/", label: "Home", icon: House },
    { path: "/about", label: "About", icon: User },
    { path: "/projects", label: "Projects", icon: Briefcase },
    { path: "/publications", label: "Publications", icon: BookOpen },
    { path: "/service", label: "Service", icon: Stamp },
    { path: "/lectures", label: "Lectures", icon: Chalkboard },
    { path: "/blog", label: "Blog", icon: Article },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className="hidden md:flex items-center gap-1 pb-3 overflow-visible"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={item.path}
                className={`
                  flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-colors duration-150
                  ${
                    active
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900/[0.06] dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }
                `}
              >
                <Icon size={16} weight={active ? "fill" : "regular"} />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Mobile Navigation: dropdown panel, opened via the hamburger button in the top bar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              className="md:hidden absolute left-4 right-4 top-full mt-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-lg z-20"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 transition-colors border-b border-zinc-100 dark:border-zinc-700 last:border-b-0
                      ${
                        active
                          ? "bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                      }
                    `}
                  >
                    <Icon size={18} weight={active ? "fill" : "regular"} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PageSelector;
