import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { House, User, Code, Briefcase, BookOpen, Chalkboard, Article } from "phosphor-react";

const iconVariants = {
  hover: {
    scale: 1.3,
    rotate: [0, -10, 10, 0],
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 400,
      rotate: { duration: 0.3, ease: "easeInOut" },
    },
  },
};

interface PageSelectorProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const location = useLocation();

  const navigationItems = [
    { path: "/", label: "Home", icon: House },
    { path: "/about", label: "About", icon: User },
    { path: "/skills", label: "Skills", icon: Code },
    { path: "/projects", label: "Projects", icon: Briefcase },
    { path: "/publications", label: "Publications", icon: BookOpen },
    { path: "/lectures", label: "Lectures", icon: Chalkboard },
    { path: "/blog", label: "Blog", icon: Article },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className="hidden md:flex items-center gap-1.5 mb-4 py-2 overflow-visible"
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
                to={item.path}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${
                    active
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md scale-105"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.05] dark:hover:bg-white/10 hover:backdrop-blur-md hover:text-zinc-900 dark:hover:text-zinc-100 hover:scale-110 hover:shadow-lg border border-transparent hover:border-black/[0.08] dark:hover:border-white/10"
                  }
                `}
              >
                <motion.div whileHover={iconVariants.hover}>
                  <Icon size={16} weight={active ? "fill" : "regular"} />
                </motion.div>
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
            <div className="fixed inset-0 z-10 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              className="md:hidden absolute left-0 right-0 top-full mt-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-2xl z-20"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
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
                    <motion.div whileHover={iconVariants.hover}>
                      <Icon size={18} weight={active ? "fill" : "regular"} />
                    </motion.div>
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
