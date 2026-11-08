import type { Metadata } from "next";
import Backprop from "../../views/Backprop";

// Hidden page: not linked from the navigation and kept out of search engines.
export const metadata: Metadata = {
  title: "Backpropagation, visualized - Nils Hellwig",
  description: "An interactive, visual explanation of backpropagation in a tiny neural network.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Backprop />;
}
