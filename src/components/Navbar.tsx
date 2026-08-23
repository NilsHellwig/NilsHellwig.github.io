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
  X,
} from "phosphor-react";
import { Link } from "react-router-dom";
import { openLinkInNewTab } from "../helper";
import { Tooltip } from "./Tooltip";
import ThemeToggle from "./ThemeToggle";

const iconVariants = {
  hover: {
    scale: 1.3,
    rotate: [0, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.6,
      type: "spring",
      stiffness: 300,
      rotate: { duration: 0.4, ease: "easeInOut" },
    },
  },
};

const textVariants = {
  hover: {
    scale: 1.05,
    textShadow: "0px 0px 8px rgba(0,0,0,0.2)",
    transition: { duration: 0.3 },
  },
};

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

const NavBar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hoverStyle =
    "p-1 px-1.5 hover:bg-black/[0.05] dark:hover:bg-white/10 hover:backdrop-blur-md rounded-lg cursor-pointer duration-300 hover:scale-110 hover:shadow-lg border border-transparent hover:border-black/[0.08] dark:hover:border-white/10";

  return (
    <div className="flex flex-row items-center mt-2 mb-4 justify-between relative px-2 sm:px-0">
      <Link to="/">
        <motion.h1
          className="font-bold text-md hover:cursor-pointer hover:text-zinc-500 dark:text-zinc-100 dark:hover:text-zinc-400 duration-300"
          whileHover={textVariants.hover}
        >
          Nils Hellwig
        </motion.h1>
      </Link>

      <div className="flex flex-row gap-1 xsm:gap-3 items-center">
        {/* Desktop Social Links */}
        <div className="hidden vsm:flex flex-row gap-1 xsm:gap-3 items-center">
          {socialLinks.map((social) => (
            <Tooltip key={social.text} text={social.text} position="bottom" asChild>
              <motion.div
                className={hoverStyle}
                onClick={() => openLinkInNewTab(social.url)}
                whileHover={iconVariants.hover}
              >
                <social.icon
                  size={24}
                  className="text-zinc-900 dark:text-zinc-100"
                  weight="regular"
                />
              </motion.div>
            </Tooltip>
          ))}
        </div>

        {/* Mobile Social Links Dropdown */}
        <div className="relative vsm:hidden">
          <motion.div
            className={hoverStyle}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            whileHover={{ scale: 1.1 }}
          >
            {isDropdownOpen ? (
              <X size={24} className="text-zinc-900 dark:text-zinc-100" weight="regular" />
            ) : (
              <DotsThree size={24} className="text-zinc-900 dark:text-zinc-100" weight="bold" />
            )}
          </motion.div>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl p-2 z-20 overflow-hidden"
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
      </div>
    </div>
  );
};

export default NavBar;
