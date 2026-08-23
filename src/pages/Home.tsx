import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowCircleRight } from "phosphor-react";
import "../gradient-style.css";
import "../shadowbutton.css";

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
      className="mt-10 flex justify-center flex-col items-center text-center max-w-3xl mx-auto px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
        className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mb-12"
      >
        I'm an <strong>NLP Researcher</strong> at the University of Regensburg working on
        <strong> Structured Sentiment Analysis and Agents</strong>. Welcome to my portfolio!
      </motion.h2>

      <motion.div variants={itemVariants}>
        <Link to="/about">
          <motion.div
            className="flex items-center gap-3 cursor-pointer duration-300 shadow-button-black px-8 py-4 text-white rounded-2xl focus:outline-none text-lg font-semibold group"
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>More about me</span>
            <ArrowCircleRight
              size={28}
              weight="bold"
              className="group-hover:translate-x-1 transition-transform"
            />
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Home;
