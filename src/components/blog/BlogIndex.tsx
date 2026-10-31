import { BLOGS } from "../../data/blogs";
import { motion } from "framer-motion";
import BlogListElement from "./BlogListElement";
import Footer from "../Footer";
import PageHeader from "../PageHeader";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BlogIndex: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ fontFamily: "Inter" }}
      className="pb-8"
    >
      {/* Header */}
      <PageHeader
        number="01"
        title="Blog"
        subtitle="Thoughts on my academic journey, software engineering, and innovation"
        variants={itemVariants}
      />

      {/* Card grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BLOGS.map((blog) => (
          <motion.div key={blog.id} variants={itemVariants}>
            <BlogListElement blog={blog} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12">
        <Footer />
      </div>
    </motion.div>
  );
};

export default BlogIndex;
