import type { Metadata } from "next";
import LLM from "../../views/LLM";

// Hidden page: not linked from the navigation and kept out of search engines.
export const metadata: Metadata = {
  title: "How LLMs work, visualized - Nils Hellwig",
  description:
    "An interactive, visual explanation of large language models: tokens, embeddings, attention, sampling and training.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LLM />;
}
