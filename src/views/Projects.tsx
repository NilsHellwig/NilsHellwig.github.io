"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { PROJECTS } from "../data/projects";
import { useOverlay } from "../context/OverlayContext";
import SingleProject from "../popups/SingleProject";
import { ArrowSquareOut, Info } from "@phosphor-icons/react";
import { Tooltip } from "../components/Tooltip";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import ClaudeBadge from "../components/ClaudeBadge";
import GitHubActivity from "../components/GitHubActivity";

interface ProjectsProps {
  projectName?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.07 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Projects: React.FC<ProjectsProps> = ({ projectName }) => {
  const { showOverlay, setShowOverlay } = useOverlay();
  const [projectId, setProjectId] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const uniqueTypes = Array.from(new Set(PROJECTS.map((p) => p.type)));
    const sorted = uniqueTypes.sort((a, b) => {
      return (
        PROJECTS.filter((p) => p.type === b).length - PROJECTS.filter((p) => p.type === a).length
      );
    });
    return ["All", ...sorted];
  }, []);

  const getCategoryCount = (category: string) =>
    category === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.type === category).length;

  const filteredProjects = useMemo(
    () => (activeFilter === "All" ? PROJECTS : PROJECTS.filter((p) => p.type === activeFilter)),
    [activeFilter],
  );

  function showSingleProjectFct() {
    document.body.style.overflow = document.body.style.overflow === "hidden" ? "scroll" : "hidden";
    if (showOverlay) {
      window.history.replaceState(null, "Nils Hellwig - Portfolio", "/projects/");
    }
    setShowOverlay(!showOverlay);
  }

  useEffect(() => {
    if (projectName !== undefined) {
      setProjectId(projectName);
      showSingleProjectFct();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <motion.div className="pb-8" initial="hidden" animate="visible" variants={containerVariants}>
      <PageHeader
        number="01"
        title="Projects"
        subtitle="Selected software projects: web apps, AI tools, mobile apps, and research utilities"
        className="mb-8 mt-10"
        variants={itemVariants}
      />

      {/* GitHub Activity */}
      <motion.div variants={itemVariants} className="mb-8">
        <GitHubActivity />
      </motion.div>

      <PageHeader
        number="02"
        title="Selected Projects"
        subtitle="Click a card to see details, tech stack, and links"
        as="h3"
        className="mb-6"
        variants={itemVariants}
      />

      {/* Claude legend (hover) */}
      <motion.div variants={itemVariants} className="mb-3">
        <Tooltip
          position="bottom"
          contentClassName="z-50 w-72 rounded-xl border-[0.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 shadow-lg dark:shadow-zinc-900/50"
          text={
            <div className="flex flex-col gap-3 whitespace-normal">
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                System and architecture decisions are always mine. Claude assists with the
                implementation, guided by skills from Matt Pocock's collection.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["/grill-with-docs", "/tdd", "/diagnosing-bugs"].map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 border-[0.5px] border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <a
                href="https://github.com/mattpocock/skills"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#c4552f] dark:text-[#e8896b] hover:underline"
              >
                mattpocock/skills
                <ArrowSquareOut size={12} weight="bold" />
              </a>
            </div>
          }
        >
          <span className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 cursor-help">
            <Info size={13} />
            w/ Claude = AI-assisted
          </span>
        </Tooltip>
      </motion.div>

      {/* Filter pills */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border-[0.5px]
              ${
                activeFilter === category
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
          >
            {category}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums
                ${activeFilter === category ? "bg-white/20 dark:bg-zinc-900/20" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"}`}
            >
              {getCategoryCount(category)}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Project grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 cursor-pointer hover:shadow-md dark:hover:shadow-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-150 overflow-hidden flex flex-col"
              onClick={() => {
                setProjectId(project.id!);
                showSingleProjectFct();
              }}
            >
              <div className="p-4 flex flex-col flex-1">
                {/* Type badge */}
                <div className="flex flex-wrap justify-between items-center gap-1 mb-3">
                  <ClaudeBadge withClaude={!!project.claude} className="shrink-0" />
                  <span
                    title={project.type}
                    className="whitespace-nowrap text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                  >
                    {project.type}
                  </span>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-[22.5%] shadow-md shadow-zinc-900/15 dark:shadow-black/40">
                    {project.iconPath && (
                      <img
                        src={project.iconPath}
                        alt={project.title}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                </div>

                {/* Title + subtitle */}
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white text-center leading-snug">
                  {project.title}
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-1 line-clamp-2 leading-relaxed">
                  {project.subtitle}
                </p>
                <p className="mt-auto pt-3 text-[11px] font-mono tabular-nums text-zinc-400 dark:text-zinc-500 text-center">
                  {project.year}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showOverlay && (
          <SingleProject showSingleProjectFct={showSingleProjectFct} projectId={projectId} />
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  );
};

export default Projects;
