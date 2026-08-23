import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tooltip } from "./Tooltip";
import {
  GithubLogo,
  LinkedinLogo,
  At,
  Student,
  GlobeHemisphereWest,
  BookOpen,
  Briefcase,
  User,
  Heart,
  Code,
} from "@phosphor-icons/react";

const Footer: React.FC = () => {
  const socialLinks = [
    {
      icon: GithubLogo,
      url: "https://github.com/NilsHellwig",
      label: "GitHub",
      color: "hover:text-zinc-900 dark:hover:text-zinc-100",
    },
    {
      icon: LinkedinLogo,
      url: "https://www.linkedin.com/in/nils-ch/",
      label: "LinkedIn",
      color: "hover:text-blue-600 dark:hover:text-blue-400",
    },
    {
      icon: At,
      url: "mailto:nils.hellwig@ur.de",
      label: "Email",
      color: "hover:text-emerald-600 dark:hover:text-emerald-400",
    },
    {
      icon: Student,
      url: "https://scholar.google.com/citations?user=VzUTKcwAAAAJ",
      label: "Google Scholar",
      color: "hover:text-indigo-600 dark:hover:text-indigo-400",
    },
    {
      icon: GlobeHemisphereWest,
      url: "https://orcid.org/0009-0000-7305-8797",
      label: "ORCID",
      color: "hover:text-lime-600 dark:hover:text-lime-400",
    },
  ];

  const navigationLinks = [
    { to: "/about", icon: User, label: "About" },
    { to: "/projects", icon: Briefcase, label: "Projects" },
    { to: "/publications", icon: BookOpen, label: "Publications" },
    { to: "/blog", icon: BookOpen, label: "Blog" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-20 pt-12 pb-8 border-t border-zinc-200 dark:border-zinc-700 w-full"
    >
      <div className="mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white">Nils Hellwig</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              PhD Candidate in AI & NLP at University of Regensburg. Passionate about building
              innovative solutions at the intersection of research and software engineering.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {navigationLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-2 group"
                >
                  <link.icon
                    size={14}
                    className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                  />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => (
                <Tooltip key={index} text={link.label} position="top" asChild>
                  <motion.a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className={`p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ${link.color} transition-all border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500`}
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <link.icon size={18} weight="fill" />
                  </motion.a>
                </Tooltip>
              ))}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-3">
              Feel free to reach out for collaborations or just a friendly chat!
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.div
            className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
            whileHover={{ scale: 1.02 }}
          >
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart size={14} weight="fill" className="text-red-500" />
            </motion.div>
            <span>and</span>
            <Code size={14} weight="bold" className="text-zinc-600 dark:text-zinc-400" />
            <span>in Regensburg</span>
          </motion.div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
            <span>© {new Date().getFullYear()} Nils Hellwig</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
