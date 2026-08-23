import React from "react";
import { motion } from "framer-motion";
import {
  Code,
  Desktop,
  Laptop,
  Package,
  Sparkle,
  Robot,
  Lightning,
  Cloud,
  ShieldCheck,
  Terminal,
  GithubLogo,
  GitPullRequest,
  GitBranch,
  Kanban,
  ListChecks,
  Heart,
} from "phosphor-react";
import { PROGRAMMING_LANGUAGES } from "../data/programming-languages";
import { IDES } from "../data/ides";
import { OPERATING_SYSTEMS } from "../data/operating-systems";
import { TECHNOLOGIES } from "../data/technologies";
import Footer from "../components/Footer";

type Skill = { name: string; note?: string };
type AICategory = {
  icon: React.ComponentType<any>;
  title: string;
  description?: string;
  skills: Skill[];
  patterns?: string[];
};

const AI_CATEGORIES: AICategory[] = [
  {
    icon: Sparkle,
    title: "Context Engineering & Prompting",
    description: "",
    skills: [
      { name: "Prompting Techniques", note: "From basic formatting to advanced strategies" },
      { name: "Structured Outputs", note: "Pydantic, XGrammar / Context-free grammars" },
      { name: "Function Calling / Tool Use / MCP Server" },
    ],
  },
  {
    icon: Robot,
    title: "Agents & Workflows",
    skills: [
      {
        name: "Retrieval Augmented Generation (RAG)",
        note: "e.g. Standard/Agentic RAG, GraphRAG, HyDE, ReAct, Advanced Chunking & Reranking",
      },
      {
        name: "Multi-Agent Systems & Frameworks",
        note: "LangChain (LangGraph, LangSmith), LlamaIndex",
      },
      {
        name: "Orchestration & Governance",
        note: "State Management, Human-in-the-Loop (HITL) Workflows, Tool Calling & Function Binding",
      },
      { name: "Langfuse", note: "LLM observability & tracing" },
    ],
  },
  {
    icon: Lightning,
    title: "Inference, Serving & Optimization",
    skills: [
      { name: "vLLM", note: "My preferred engine due to Prefix Caching & PagedAttention <3" },
      { name: "Ollama" },
      { name: "Inference Optimization", note: "e.g. Quantization, TurboQuant, MTP Drafter" },
      { name: "unsloth", note: "LoRA/QLoRA, SFT, DPO & GRPO" },
    ],
  },
  {
    icon: Cloud,
    title: "Cloud Deployment & Serving",
    skills: [
      { name: "Vertex AI" },
      { name: "Google Cloud Run" },
      { name: "Google Kubernetes Engine (GKE)" },
      { name: "Docker" },
      { name: "FastAPI" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Ethics & Safety",
    skills: [
      { name: "Bias & Fairness" },
      { name: "Prompt Injection" },
      { name: "Data Privacy" },
      { name: "AI Safety" },
    ],
  },
];

const VIBE_CODING: { icon: React.ComponentType<any>; name: string; description?: string }[] = [
  {
    icon: Terminal,
    name: "Claude Code",
  },
  {
    icon: GithubLogo,
    name: "GitHub Copilot",
  },
];

const PROJECT_MANAGEMENT: {
  icon: React.ComponentType<any>;
  name: string;
  description: string;
}[] = [
  {
    icon: GitPullRequest,
    name: "Pull Requests & Code Review",
    description: "Well-scoped PRs and constructive reviews.",
  },
  {
    icon: Kanban,
    name: "Scrum & Agile",
    description: "Most important: Stand-ups and well-written issues.",
  },
  {
    icon: ListChecks,
    name: "Jira & Confluence",
    description: "Issue tracking and documentation across the Atlassian suite.",
  },
  {
    icon: GitBranch,
    name: "Git Workflows",
    description: "Clean branching and a readable commit history.",
  },
];

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
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SectionDivider: React.FC<{ number: string; title: string; subtitle: string }> = ({
  number,
  title,
  subtitle,
}) => (
  <div className="border-b border-zinc-200 dark:border-zinc-700 pb-3">
    <div className="flex items-baseline gap-2.5">
      <span className="text-base sm:text-lg font-mono font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">
        {number}
      </span>
      <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
        {title}
      </h3>
    </div>
    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">{subtitle}</p>
  </div>
);

const Skills: React.FC = () => {
  return (
    <div className="pb-8">
      {/* ============================ 01 · AI & NLP ENGINEERING ============================ */}
      <motion.section
        className="mt-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <SectionDivider
            number="01"
            title="AI & NLP Engineering"
            subtitle="I gained 5+ years of experience in Natural Language Processing (NLP) in the research domain, including collaborations with external companies."
          />
        </motion.div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {AI_CATEGORIES.map((category, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl p-5 bg-white dark:bg-zinc-800 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-150"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl border-[0.5px] border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <category.icon
                    size={20}
                    weight="bold"
                    className="text-zinc-700 dark:text-zinc-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-zinc-900 dark:text-white">{category.title}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {category.description}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {category.skills.map((skill, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5">
                    <span className="block w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-[7px] flex-shrink-0" />
                    <span className="text-sm leading-relaxed">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {skill.name}
                      </span>
                      {skill.note && (
                        <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                          {" — "}
                          {skill.note}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {category.patterns && (
                <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-700">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-1.5">
                    Agent Patterns
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {category.patterns.join(", ")}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============================ 02 · SOFTWARE DEVELOPMENT ============================ */}
      <motion.section
        className="mt-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <SectionDivider
            number="02"
            title="Software Development"
            subtitle="Languages, tools and frameworks I build with"
          />
        </motion.div>

        {/* Programming languages */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4 mt-6">
          <Code size={24} className="text-zinc-700 dark:text-zinc-300" weight="bold" />
          <h3 className="font-bold text-xl dark:text-white">Programming Languages</h3>
        </motion.div>
        <div className="grid grid-cols-2 vsm:grid-cols-3 sm:grid-cols-4 gap-4">
          {PROGRAMMING_LANGUAGES.map((language, index) => (
            <motion.div
              key={index}
              className="relative border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl flex items-center justify-center p-4 flex-col gap-3 bg-white dark:bg-zinc-800 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-150"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              {language.favorite && (
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-red-50 dark:bg-red-900/25">
                  <Heart size={10} weight="fill" className="text-red-500" />
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-2.5 border-[0.5px] border-zinc-300 dark:border-zinc-700">
                {language.iconPath && <img src={language.iconPath} alt={`${language.name} icon`} />}
              </div>
              <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300 text-center">
                {language.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Vibe coding */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3 mt-8">
          <Sparkle size={24} className="text-zinc-700 dark:text-zinc-300" weight="bold" />
          <h3 className="font-bold text-xl dark:text-white">Vibe Coding</h3>
        </motion.div>
        <motion.p
          variants={itemVariants}
          className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4"
        >
          Especially Claude Code is a core part of my daily development workflow. Of course, I also
          use custom rules, skills, and hooks to establish consistent behavior across sessions
        </motion.p>
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VIBE_CODING.map((tool, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl p-5 bg-white dark:bg-zinc-800 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-150"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl border-[0.5px] border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <tool.icon size={26} weight="bold" className="text-zinc-700 dark:text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-zinc-900 dark:text-white block">{tool.name}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Editors / IDEs */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4 mt-8">
          <Desktop size={24} className="text-zinc-700 dark:text-zinc-300" weight="bold" />
          <h3 className="font-bold text-xl dark:text-white">Editors / IDEs</h3>
        </motion.div>
        <div className="grid grid-cols-2 vsm:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {IDES.map((ide, index) => (
            <motion.div
              key={index}
              className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl flex items-center justify-center p-4 flex-col gap-3 bg-white dark:bg-zinc-800 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-150"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-2.5 border-[0.5px] border-zinc-300 dark:border-zinc-700">
                {ide.iconPath && (
                  <img src={ide.iconPath} alt={`${ide.name} icon`} className="dark:invert" />
                )}
              </div>
              <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300 text-center">
                {ide.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Operating systems */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4 mt-8">
          <Laptop size={24} className="text-zinc-700 dark:text-zinc-300" weight="bold" />
          <h3 className="font-bold text-xl dark:text-white">Operating Systems</h3>
        </motion.div>
        <div className="grid grid-cols-2 vsm:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {OPERATING_SYSTEMS.map((os, index) => (
            <motion.div
              key={index}
              className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl flex items-center justify-center p-4 flex-col gap-3 bg-white dark:bg-zinc-800 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-150"
              variants={itemVariants}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-2.5 border-[0.5px] border-zinc-300 dark:border-zinc-700">
                {os.iconPath && (
                  <img src={os.iconPath} alt={`${os.name} icon`} className="dark:invert" />
                )}
              </div>
              <span className="font-medium text-xs text-zinc-700 dark:text-zinc-300 text-center">
                {os.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Technologies */}
        {TECHNOLOGIES.map((category, idx_cat) => (
          <div key={idx_cat}>
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4 mt-8">
              <Package size={24} className="text-zinc-700 dark:text-zinc-300" weight="bold" />
              <h3 className="font-bold text-xl dark:text-white">{category.name}</h3>
            </motion.div>
            <div className="grid grid-cols-1 vsm:grid-cols-2 md:grid-cols-3 gap-3">
              {category.technologies.map((name, index) => (
                <motion.div
                  key={index}
                  className="group relative overflow-hidden border-[0.5px] border-zinc-300 dark:border-zinc-700 p-4 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-150 cursor-default"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-50/50 to-transparent dark:from-zinc-700/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  <div className="relative flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-700 dark:group-hover:bg-zinc-300 transition-colors duration-150" />
                    <span>{name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.section>

      {/* ============================ 03 · PROJECT MANAGEMENT ============================ */}
      <motion.section
        className="mt-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <SectionDivider
            number="03"
            title="Project Management"
            subtitle="How I collaborate and ship in a team"
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mt-6 mb-4 max-w-3xl"
        >
          Beyond the tools, what matters most to me is clear communication :)
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECT_MANAGEMENT.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl p-5 bg-white dark:bg-zinc-800 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-150"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl border-[0.5px] border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <item.icon size={24} weight="bold" className="text-zinc-700 dark:text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-zinc-900 dark:text-white block">{item.name}</span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Skills;
