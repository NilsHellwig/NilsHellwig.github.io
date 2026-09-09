import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "phosphor-react";
import "../gradient-style.css";

const Home: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="min-h-[58vh] sm:min-h-[62vh] flex flex-col items-center justify-between text-center max-w-3xl mx-auto px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mt-10 flex flex-col items-center">
        <motion.div
          variants={itemVariants}
          className="mb-6 flex items-center gap-2 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          <span>NLP Researcher & Developer</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-zinc-900 dark:text-white"
        >
          Hi, I'm Nils Hellwig!
        </motion.h1>

        <motion.h2
          variants={itemVariants}
          className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 font-light leading-relaxed"
        >
          I'm an <strong>NLP Researcher</strong> at the University of Regensburg working on
          <strong> Structured Sentiment Analysis and Agents</strong>. Welcome to my portfolio!
        </motion.h2>
      </div>

      <motion.div variants={itemVariants} className="mb-6 sm:mb-10">
        <Link to="/about">
          <motion.div
            className="inline-flex items-center gap-3 px-7 py-3 rounded-full text-sm font-medium tracking-wide border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors duration-300 group cursor-pointer"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>More about me</span>
            <ArrowRight
              size={16}
              weight="regular"
              className="group-hover:translate-x-1 transition-transform"
            />
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Home;
