import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Code, MapPin, FileArrowDown } from "phosphor-react";
import Footer from "../components/Footer";

const About: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const currentAge =
    new Date().getFullYear() -
    2000 -
    (new Date().getMonth() > 5 || (new Date().getMonth() === 5 && new Date().getDate() >= 6)
      ? 0
      : 1);

  const highlights = [
    { icon: GraduationCap, label: "PhD Candidate", value: "University of Regensburg" },
    { icon: Code, label: "Role", value: "AI Researcher" },
    { icon: MapPin, label: "Location", value: "Regensburg, Germany" },
  ];

  const timeline = [
    {
      year: "2024 - now",
      title: "PhD Candidate",
      description:
        "Chair of Media Informatics, Faculty of Informatics and Data Science (FIDS) at University of Regensburg",
    },
    {
      year: "2022-2024",
      title: "Master of Science (1.0)",
      description:
        "Media Computer Science at University of Regensburg. Thesis: Data Augmentation with LLMs for ABSA",
    },
    {
      year: "2022-now",
      title: "Software Developer",
      description: "Part-time at Chair of Educational Data Science, University of Regensburg",
    },
    {
      year: "2023",
      title: "Lecturer",
      description:
        "Introduction to modern full-stack web development with JavaScript, Node.js and React.js",
    },
    {
      year: "2018-2022",
      title: "Bachelor's Degree (1.5)",
      description: "Media Computer Science, Information Science at University of Regensburg",
    },
  ];

  return (
    <div className="pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold dark:text-white mb-2">About Me</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              PhD Candidate, Software Engineer & NLP Researcher
            </p>
          </div>
          <motion.a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md hover:shadow-lg transition-all duration-150 flex-shrink-0"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <FileArrowDown size={18} weight="bold" />
            Download Résumé
          </motion.a>
        </div>
      </motion.div>

      {/* Quick Info */}
      <motion.div
        className="flex flex-wrap items-center gap-x-8 gap-y-5 mt-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {highlights.map((item, index) => (
          <React.Fragment key={index}>
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <motion.div
                className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <item.icon size={17} className="text-zinc-700 dark:text-zinc-300" weight="bold" />
              </motion.div>
              <div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.value}</p>
              </div>
            </motion.div>
            {index < highlights.length - 1 && (
              <span className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Introduction */}
      <motion.div
        className="mt-14 relative"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Oversized ghost quote mark, purely decorative */}
        <span
          aria-hidden
          className="pointer-events-none select-none absolute -top-16 right-0 md:right-4 text-[10rem] md:text-[13rem] font-black leading-none text-zinc-900/[0.045] dark:text-white/[0.05]"
        >
          "
        </span>

        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-center md:items-start relative">
          <motion.div variants={itemVariants} className="flex-1 order-2 md:order-1 space-y-6">
            <h3 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-tight">
              Introduction
            </h3>

            <div className="text-zinc-600 dark:text-zinc-300 flex flex-col gap-5 text-sm md:text-base leading-relaxed font-normal">
                <p>
                  I'm a {currentAge}-year-old PhD candidate at the{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    University of Regensburg
                  </span>
                  , Germany. Currently, I'm pursuing my doctoral degree at the{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Faculty of Informatics and Data Science
                  </span>
                  , specializing in{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Natural Language Processing
                  </span>{" "}
                  and{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Computational Linguistics
                  </span>
                  .
                </p>
                <p>
                  My research focuses on advancing LLM-based approaches to tackle{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    aspect-based sentiment analysis
                  </span>{" "}
                  in low-resource scenarios. I've published my work in high-impact journals such as{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Knowledge-Based Systems
                  </span>{" "}
                  and{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Expert Systems with Applications
                  </span>
                  , as well as international conferences like{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">LREC</span> and{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">KONVENS</span>.
                </p>
                <p>
                  I have expertise in {" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">LLM efficiency</span>
                  ,{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    structured learning
                  </span>
                  , and {" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    agentic systems
                  </span>
                  . Beyond my academic work, I'm a passionate{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Software Engineer
                  </span>{" "}
                  dedicated to building full-stack, user-friendly applications.
                </p>
              </div>
            </motion.div>

            <div className="w-64 md:w-72 flex-shrink-0 order-1 md:order-2">
              <div className="relative">
                {/* Soft grayscale glow behind the portrait */}
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-zinc-300/40 via-zinc-200/20 to-transparent dark:from-zinc-100/10 dark:via-zinc-400/5 dark:to-transparent blur-2xl -z-10" />

                <motion.div
                  className="relative group bg-white dark:bg-zinc-800 rounded-2xl"
                  whileHover={{ rotate: -1, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                >
                  <img
                    src="portrait.png"
                    alt="Nils Hellwig"
                    className="block dark:hidden rounded-xl object-cover w-full aspect-[4/5] transition-all duration-700 ease-in-out border border-zinc-200 dark:border-zinc-700"
                  />
                  <img
                    src="portrait-dark.png"
                    alt="Nils Hellwig"
                    className="hidden dark:block rounded-xl object-cover w-full aspect-[4/5] transition-all duration-700 ease-in-out border border-zinc-200 dark:border-zinc-700"
                  />
                </motion.div>
              </div>
            </div>
          </div>
      </motion.div>

      {/* Timeline */}
      <motion.div className="mt-8" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold dark:text-white mb-6">Journey</h3>
        </motion.div>

        <div>
          {timeline.map((item, index) => {
            const isLast = index === timeline.length - 1;
            const isOngoing = item.year.toLowerCase().includes("now");

            return (
              <motion.div key={index} variants={itemVariants} className="flex gap-5">
                {/* Rail: node + connecting line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <span
                    className={`relative flex items-center justify-center w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      isOngoing
                        ? "border-zinc-900 dark:border-white bg-white dark:bg-zinc-900"
                        : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOngoing ? "bg-zinc-900 dark:bg-white" : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                    />
                    {isOngoing && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-zinc-900/40 dark:bg-white/40"
                        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}
                  </span>
                  {!isLast && (
                    <motion.span
                      className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700 origin-top"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeInOut" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`min-w-0 flex-1 group ${isLast ? "pb-1" : "pb-8"}`}>
                  <div className="flex items-center gap-2 mb-1 -mt-0.5">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide tabular-nums">
                      {item.year}
                    </span>
                    {isOngoing && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Ongoing
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-1 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                    {item.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default About;
