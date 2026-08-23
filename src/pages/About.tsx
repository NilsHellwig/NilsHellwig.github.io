import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Code, MapPin, Calendar, FileArrowDown } from "phosphor-react";
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

  const expertise = [
    {
      area: "Natural Language Processing",
      topics: ["Aspect-Based Sentiment Analysis", "Structured Learning", "Agents"],
    },
    { area: "Software Engineering", topics: ["Full-Stack Development", "React & TypeScript"] },
    {
      area: "Research",
      topics: ["Low-Resource NLP", "Synthetic Data Generation", "Structured Text Generation"],
    },
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

      {/* Quick Info Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {highlights.map((item, index) => {
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative overflow-hidden border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl p-5 bg-white dark:bg-zinc-800"
            >
              <div className="relative flex items-center gap-3">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-[0.5px] border-zinc-300 dark:border-zinc-600 shadow-sm"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <item.icon size={24} className="text-zinc-700 dark:text-zinc-300" weight="bold" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Introduction */}
      <motion.div className="mt-8" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div
          variants={itemVariants}
          className="overflow-hidden border-[0.5px] border-zinc-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm relative"
        >
          {/* Suble decorative element */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-900 dark:bg-zinc-100 hidden md:block" />

          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start p-8 md:p-10">
            <div className="flex-1 order-2 md:order-1 space-y-6">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-tight">
                  Introduction
                </h3>
              </div>

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
                  I have deep expertise in improving{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">LLM efficiency</span>
                  ,{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    structured learning
                  </span>
                  , and exploring{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    synthetic training data generation
                  </span>
                  . Beyond my academic work, I'm a passionate{" "}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Full-Stack Engineer
                  </span>{" "}
                  dedicated to building scalable, user-friendly solutions.
                </p>
              </div>
            </div>

            <div className="w-64 md:w-72 flex-shrink-0 order-1 md:order-2">
              <div className="relative group bg-white rounded-2xl shadow-sm">
                <img
                  src="portrait.png"
                  alt="Nils Hellwig"
                  className="rounded-xl object-cover w-full aspect-[4/5] transition-all duration-700 ease-in-out border border-zinc-200 dark:border-zinc-700"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Expertise Areas */}
      <motion.div className="mt-8" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold dark:text-white mb-4">Areas of Expertise</h3>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {expertise.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl p-5 bg-white dark:bg-zinc-800"
            >
              <h4 className="font-bold text-zinc-900 dark:text-white mb-3">{item.area}</h4>
              <ul className="space-y-2">
                {item.topics.map((topic, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2"
                  >
                    <span className="text-zinc-400 dark:text-zinc-600 flex-shrink-0">•</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div className="mt-8" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold dark:text-white mb-4">Journey</h3>
        </motion.div>
        <div className="space-y-3">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl p-5 bg-white dark:bg-zinc-800"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 border-[0.5px] border-zinc-300 dark:border-zinc-600 flex-shrink-0">
                  <Calendar size={20} className="text-zinc-700 dark:text-zinc-300" weight="bold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full border-[0.5px] border-zinc-300 dark:border-zinc-600">
                      {item.year}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default About;
