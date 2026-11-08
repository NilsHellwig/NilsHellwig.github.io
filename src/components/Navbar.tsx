"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Student,
  TwitterLogo,
  At,
  GithubLogo,
  LinkedinLogo,
  GlobeHemisphereWest,
  DotsThree,
  List,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { openLinkInNewTab } from "../helper";
import { Tooltip } from "./Tooltip";
import ThemeToggle from "./ThemeToggle";

const socialLinks = [
  {
    text: "Twitter",
    url: "https://twitter.com/nchllwg",
    icon: TwitterLogo,
  },
  {
    text: "GitHub",
    url: "https://github.com/NilsHellwig",
    icon: GithubLogo,
  },
  {
    text: "Google Scholar",
    url: "https://scholar.google.com/citations?user=VzUTKcwAAAAJ",
    icon: Student,
  },
  {
    text: "LinkedIn",
    url: "https://www.linkedin.com/in/nils-ch/",
    icon: LinkedinLogo,
  },
  {
    text: "Mail",
    url: "mailto:Nils-Constantin.Hellwig@stud.uni-regensburg.de",
    icon: At,
  },
  {
    text: "ORCID",
    url: "https://orcid.org/0009-0000-7305-8797",
    icon: GlobeHemisphereWest,
  },
];

interface NavBarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const NavBar: React.FC<NavBarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="flex flex-row items-center mt-2 mb-3 justify-between relative">
      <Link href="/">
        <h1 className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
          Nils Hellwig
        </h1>
      </Link>

      <div className="flex flex-row gap-1 items-center">
        {/* Desktop Social Links */}
        <div className="hidden vsm:flex flex-row gap-0.5 items-center">
          {socialLinks.map((social) => (
            <Tooltip key={social.text} text={social.text} position="bottom" asChild>
              <button
                className="icon-btn"
                onClick={() => openLinkInNewTab(social.url)}
                aria-label={social.text}
              >
                <social.icon size={20} weight="regular" />
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Mobile Social Links Dropdown */}
        <div className="relative vsm:hidden">
          <button
            className="icon-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Social links"
          >
            {isDropdownOpen ? (
              <X size={20} weight="regular" />
            ) : (
              <DotsThree size={20} weight="bold" />
            )}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-2 z-20 overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {socialLinks.map((social) => (
                      <motion.div
                        key={social.text}
                        className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 duration-200 cursor-pointer"
                        onClick={() => {
                          openLinkInNewTab(social.url);
                          setIsDropdownOpen(false);
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <social.icon
                          size={24}
                          className="text-zinc-900 dark:text-zinc-100"
                          weight="regular"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <ThemeToggle />

        {/* Mobile page-navigation toggle */}
        <button
          className="icon-btn md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={20} weight="regular" /> : <List size={20} weight="regular" />}
        </button>
      </div>
    </div>
  );
};

export default NavBar;
