"use client";

import React, { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { BlogType, formatBlogDate } from "../../data/blogs";
import { ArrowLeft, Share, Copy, Check } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Footer from "../Footer";

const BlogPost: React.FC<{ blog: BlogType; markdown: string }> = ({ blog, markdown }) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<{ [key: string]: boolean }>({});

  // Code Block Component with Copy Button
  const CodeBlock = ({ language, children }: { language: string; children: string }) => {
    const codeString = String(children).replace(/\n$/, "");
    const codeId = `${language}-${codeString.substring(0, 20)}`;

    const handleCopy = async () => {
      await navigator.clipboard.writeText(codeString);
      setCopiedCode({ ...copiedCode, [codeId]: true });
      setTimeout(() => {
        setCopiedCode({ ...copiedCode, [codeId]: false });
      }, 2000);
    };

    return (
      <div className="relative group my-6">
        <div className="absolute right-3 top-3 z-10">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700/80 hover:bg-zinc-600/80 text-zinc-100 rounded-lg text-xs font-medium transition-all backdrop-blur-xs border border-zinc-600/50 shadow-lg hover:shadow-xl"
          >
            {copiedCode[codeId] ? (
              <>
                <Check size={14} weight="bold" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} weight="bold" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          className="rounded-2xl text-sm shadow-xl border border-zinc-800"
          showLineNumbers={true}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            borderRadius: "1rem",
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 3000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Navigation bar above hero */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-[92px] md:top-[156px] z-10 flex items-center gap-3 mt-10 mb-4"
      >
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border-[0.5px] border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-xs"
        >
          <ArrowLeft
            size={16}
            weight="bold"
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          All blog posts
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border-[0.5px] border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-xs"
        >
          <Share size={16} weight="bold" />
          {copiedToClipboard ? "Copied!" : "Share"}
        </button>
      </motion.div>

      {/* Article header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 pb-8 mb-4 border-b border-zinc-200 dark:border-zinc-700"
      >
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-full border-[0.5px] border-zinc-200 dark:border-zinc-600">
            {blog.category}
          </span>
          <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums">
            {formatBlogDate(blog.term)}
          </span>
          <span className="text-zinc-300 dark:text-zinc-600">•</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">By {blog.author}</span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
          {blog.title}
        </h1>
      </motion.header>

      {/* Content Section */}
      <div className="pt-2 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="prose prose-lg prose-zinc max-w-none"
        >
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-12 mb-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-14 mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-700">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-10 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed my-6">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-zinc-900 dark:text-white">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-zinc-800 dark:text-zinc-200">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-8 pl-6 pr-4 py-3 border-l-4 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 rounded-r-xl italic text-zinc-700 dark:text-zinc-300 [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <div className="flex items-center justify-center gap-2 my-12" aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                </div>
              ),
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <CodeBlock language={match[1]}>{String(children)}</CodeBlock>
                ) : (
                  <code
                    className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-[0.9em] font-mono text-zinc-800 dark:text-zinc-200"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              a: ({ href, children }) => (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={href}
                  className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-2 decoration-zinc-400 dark:decoration-zinc-500 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="my-6 space-y-2.5 list-disc list-outside pl-5 marker:text-zinc-400 dark:marker:text-zinc-500">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="my-6 space-y-2.5 list-decimal list-outside pl-5 marker:text-zinc-400 dark:marker:text-zinc-500 marker:font-semibold">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed pl-1">
                  {children}
                </li>
              ),
              img: ({ src, alt }) => (
                <figure className="my-8">
                  <img
                    src={src}
                    alt={alt}
                    className="w-full rounded-xl border-[0.5px] border-zinc-300 dark:border-zinc-700 shadow-xs"
                  />
                  {alt && (
                    <figcaption className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400 italic">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              table: ({ children }) => (
                <div className="my-8 overflow-x-auto rounded-xl border-[0.5px] border-zinc-300 dark:border-zinc-700">
                  <table className="w-full text-left border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-zinc-50 dark:bg-zinc-800/80">{children}</thead>
              ),
              tr: ({ children }) => (
                <tr className="border-b border-zinc-200 dark:border-zinc-700 last:border-0">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">{children}</td>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </motion.div>
      </div>

      <Footer />
    </motion.div>
  );
};

export default BlogPost;
