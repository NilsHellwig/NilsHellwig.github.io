import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import BlogPost from "../../../components/blog/BlogPost";
import { BLOGS } from "../../../data/blogs";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOGS.map((blog) => ({ slug: blog.url }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = BLOGS.find((b) => b.url === slug);
  if (!blog) notFound();
  const markdown = fs.readFileSync(
    path.join(process.cwd(), "src/data/blog-entries", `${slug}.md`),
    "utf-8",
  );
  return <BlogPost blog={blog} markdown={markdown} />;
}
