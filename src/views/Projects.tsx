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
import FilterPills from "../components/FilterPills";

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
        variants={itemVariants}
      />

      {/* GitHub Activity */}
      <motion.div variants={itemVariants}>
        <GitHubActivity />
      </motion.div>

      <PageHeader
        number="02"
        title="Selected Projects"
        subtitle="Click a card to see details, tech stack, and links"
        as="h3"
        className="mt-16 mb-6"
        variants={itemVariants}
      />

      {/* Filter pills + Claude legend (hover) */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 mb-6"
      >
        <FilterPills
          options={categories}
          active={activeFilter}
          onChange={setActiveFilter}
          getCount={getCategoryCount}
        />
        <Tooltip
          className="self-start shrink-0"
          position="bottom"
          contentClassName="z-50 w-72 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 shadow-lg dark:shadow-zinc-900/50"
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
                    className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
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
          <span className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap sm:mt-2 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-help">
            <Info size={13} />
            w/ Claude = AI-assisted
          </span>
        </Tooltip>
      </motion.div>

      {/* Project grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id ?? project.title}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="card card-interactive p-5 flex flex-col"
              onClick={() => {
                setProjectId(project.id!);
                showSingleProjectFct();
              }}
            >
              {/* Icon + title + meta */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-[22.5%] shadow-md shadow-zinc-900/15 dark:shadow-black/40">
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold text-base text-zinc-900 dark:text-white leading-snug truncate">
                      {project.title}
                    </h3>
                    <span className="shrink-0 text-xs font-mono tabular-nums text-zinc-400 dark:text-zinc-500">
                      {project.year}
                    </span>
                  </div>
                  <span title={project.type} className="chip mt-1.5">
                    {project.type}
                  </span>
                </div>
              </div>

              {/* Subtitle */}
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                {project.subtitle}
              </p>

              {/* Footer */}
              <div className="mt-auto pt-4">
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700/70">
                  <ClaudeBadge withClaude={!!project.claude} />
                </div>
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
