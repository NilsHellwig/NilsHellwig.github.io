"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { BlogType, formatBlogDate } from "../../data/blogs";

interface BlogListElementProps {
  blog: BlogType;
}

const BlogListElement: React.FC<BlogListElementProps> = ({ blog }) => {
  return (
    <Link href={`/blog/${blog.url}`} className="block group h-full">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="h-full card card-interactive overflow-hidden flex flex-col"
      >
        <div className="p-6 flex flex-col flex-1">
          {/* Category + date */}
          <div className="flex items-center gap-2 mb-4">
            <span className="chip">{blog.category}</span>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
              {formatBlogDate(blog.term)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 leading-snug tracking-tight mb-6 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
            {blog.title}
          </h2>

          {/* Footer pinned to bottom */}
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-700/70">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">By {blog.author}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              Read
              <ArrowRight
                size={16}
                weight="bold"
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BlogListElement;
