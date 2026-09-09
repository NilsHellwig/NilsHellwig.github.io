import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS } from "../data/projects";
import { useParams } from "react-router";
import SingleProject from "../popups/SingleProject";
import { GithubLogo } from "@phosphor-icons/react";
import Footer from "../components/Footer";

interface ProjectsProps {
  showOverlay: boolean;
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>>;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Projects: React.FC<ProjectsProps> = ({ showOverlay, setShowOverlay }) => {
  const [projectId, setProjectId] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const { projectName } = useParams();

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
      window.history.replaceState(null, "Nils Hellwig - Portfolio", "/projects");
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
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="border-b border-zinc-200 dark:border-zinc-700 pb-3 mb-8 mt-10"
      >
        <div className="flex items-baseline gap-2.5">
          <span className="text-base sm:text-lg font-mono font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">
            01
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Projects
          </h2>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
          Selected software projects: web apps, AI tools, mobile apps, and research utilities
        </p>
      </motion.div>

      {/* GitHub link */}
      <motion.div variants={itemVariants} className="mb-8">
        <a
          href="https://github.com/NilsHellwig"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-zinc-800 border-[0.5px] border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-150 shadow-sm"
        >
          <GithubLogo size={16} weight="fill" />
          github/NilsHellwig
        </a>
      </motion.div>

      {/* GitHub Activity Chart */}
      <motion.div
        variants={itemVariants}
        className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl p-5 bg-white dark:bg-zinc-800 mb-8"
      >
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
          GitHub Activity
        </p>
        <img
          src="https://ghchart.rshah.org/16a34a/NilsHellwig"
          alt="GitHub Contribution Chart"
          className="w-full dark:invert dark:hue-rotate-180"
        />
      </motion.div>

      {/* Section header: Selected Projects */}
      <motion.div
        variants={itemVariants}
        className="border-b border-zinc-200 dark:border-zinc-700 pb-3 mb-6"
      >
        <div className="flex items-baseline gap-2.5">
          <span className="text-base sm:text-lg font-mono font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">
            02
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Selected Projects
          </h3>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
          Click a card to see details, tech stack, and links
        </p>
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
                <div className="flex justify-end mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {project.type}
                  </span>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-[0.5px] border-zinc-200 dark:border-zinc-700 p-3">
                    {project.iconPath && (
                      <img
                        src={project.iconPath}
                        alt={project.title}
                        className="w-full h-full object-contain"
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
