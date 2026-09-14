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
      { name: "Langfuse" },
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
      { name: "Legal & Regulatory Compliance: EU AI Act, DSGVO" },
      { name: "Bias & Fairness" },
      { name: "Prompt Injection" },
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

/* A small "tab title" for a sub-group within a section: icon + label,
   understated, no box around it. */
const GroupLabel: React.FC<{ icon: React.ComponentType<any>; title: string }> = ({
  icon: Icon,
  title,
}) => (
  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4 mt-10">
    <Icon size={18} className="text-zinc-400 dark:text-zinc-500" weight="bold" />
    <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      {title}
    </h3>
  </motion.div>
);

/* Pill with a small icon bubble, used for languages / editors / OS / tools. */
const IconChip: React.FC<{
  iconPath?: string;
  icon?: React.ComponentType<any>;
  name: string;
  invert?: boolean;
  favorite?: boolean;
}> = ({ iconPath, icon: Icon, name, invert, favorite }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -2 }}
    className="inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors duration-150"
  >
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-50 dark:bg-zinc-900 flex-shrink-0 overflow-hidden">
      {iconPath && (
        <img
          src={iconPath}
          alt=""
          className={`w-3.5 h-3.5 object-contain ${invert ? "dark:invert" : ""}`}
        />
      )}
      {Icon && <Icon size={13} weight="bold" className="text-zinc-700 dark:text-zinc-300" />}
    </span>
    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
      {name}
    </span>
    {favorite && <Heart size={10} weight="fill" className="text-red-500 flex-shrink-0" />}
  </motion.div>
);

/* Plain text pill, used for the longer technology lists. */
const TextChip: React.FC<{ name: string }> = ({ name }) => (
  <motion.span
    variants={itemVariants}
    whileHover={{ y: -2 }}
    className="inline-flex items-center px-3 py-1.5 rounded-full border-[0.5px] border-zinc-200 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors duration-150"
  >
    {name}
  </motion.span>
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

        {/* Category rows */}
        <div className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
          {AI_CATEGORIES.map((category, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="py-6 flex flex-col sm:flex-row gap-4 sm:gap-8"
            >
              <div className="flex items-start gap-3 sm:w-64 flex-shrink-0">
                <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <category.icon
                    size={17}
                    weight="bold"
                    className="text-zinc-700 dark:text-zinc-300"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                    {category.title}
                  </h4>
                  {category.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                {category.skills.map((skill, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2.5">
                    <span className="block w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-[7px] flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {skill.name}
                      </span>
                      {skill.note && (
                        <span className="block text-xs text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                          {skill.note}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {category.patterns && (
                <div className="sm:w-56 flex-shrink-0">
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
        <GroupLabel icon={Code} title="Programming Languages" />
        <motion.div variants={containerVariants} className="flex flex-wrap gap-2">
          {PROGRAMMING_LANGUAGES.map((language, index) => (
            <IconChip
              key={index}
              iconPath={language.iconPath}
              name={language.name}
              favorite={language.favorite}
            />
          ))}
        </motion.div>

        {/* Vibe coding */}
        <GroupLabel icon={Sparkle} title="Vibe Coding" />
        <motion.p
          variants={itemVariants}
          className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 max-w-2xl"
        >
          Especially Claude Code is a core part of my daily development workflow. Of course, I also
          use custom rules, skills, and hooks to establish consistent behavior across sessions
        </motion.p>
        <motion.div variants={containerVariants} className="flex flex-wrap gap-2">
          {VIBE_CODING.map((tool, index) => (
            <IconChip key={index} icon={tool.icon} name={tool.name} />
          ))}
        </motion.div>

        {/* Editors / IDEs */}
        <GroupLabel icon={Desktop} title="Editors / IDEs" />
        <motion.div variants={containerVariants} className="flex flex-wrap gap-2">
          {IDES.map((ide, index) => (
            <IconChip key={index} iconPath={ide.iconPath} name={ide.name} invert />
          ))}
        </motion.div>

        {/* Operating systems */}
        <GroupLabel icon={Laptop} title="Operating Systems" />
        <motion.div variants={containerVariants} className="flex flex-wrap gap-2">
          {OPERATING_SYSTEMS.map((os, index) => (
            <IconChip key={index} iconPath={os.iconPath} name={os.name} invert />
          ))}
        </motion.div>

        {/* Technologies */}
        {TECHNOLOGIES.map((category, idx_cat) => (
          <div key={idx_cat}>
            <GroupLabel icon={Package} title={category.name} />
            <motion.div variants={containerVariants} className="flex flex-wrap gap-2">
              {category.technologies.map((name, index) => (
                <TextChip key={index} name={name} />
              ))}
            </motion.div>
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
          className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mt-6 mb-2 max-w-3xl"
        >
          Beyond the tools, what matters most to me is clear communication :)
        </motion.p>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {PROJECT_MANAGEMENT.map((item, index) => (
            <motion.div key={index} variants={itemVariants} className="py-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                <item.icon size={17} weight="bold" className="text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-zinc-900 dark:text-white text-sm block">
                  {item.name}
                </span>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
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
