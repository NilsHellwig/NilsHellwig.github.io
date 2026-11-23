"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { PROJECTS } from "../data/projects";
import { useOverlay } from "../context/OverlayContext";
import SingleProject from "../popups/SingleProject";
import { GithubLogo } from "@phosphor-icons/react";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import ClaudeBadge from "../components/ClaudeBadge";
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
        title={
          <span className="inline-flex items-center gap-3">
            Projects
            <a
              href="https://github.com/NilsHellwig"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors"
            >
              <GithubLogo size={26} weight="regular" />
            </a>
          </span>
        }
        subtitle="Selected software projects: web apps, AI tools, mobile apps, and research utilities"
        variants={itemVariants}
      />

      {/* Filter pills */}
      <motion.div variants={itemVariants} className="mb-6">
        <FilterPills
          options={categories}
          active={activeFilter}
          onChange={setActiveFilter}
          getCount={getCategoryCount}
        />
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
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span title={project.type} className="chip">
                      {project.type}
                    </span>
                    <ClaudeBadge withClaude={!!project.claude} />
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                {project.subtitle}
              </p>
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
