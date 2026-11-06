export interface ReviewingEntry {
  venue: string;
  cycle: string;
  type: "Conference" | "Workshop" | "Journal";
  url: string;
}

export interface SupervisionEntry {
  title: string;
  type: "Master's Thesis" | "Bachelor's Thesis";
  student: string;
  /** Where the work was published; omit if unpublished. */
  publishedIn?: { venue: string; url: string; note?: string };
}

export const SUPERVISION: SupervisionEntry[] = [
  {
    title:
      "SemEval-2026 Task 4: Narrative Story Similarity and Narrative Representation Learning",
    type: "Master's Thesis",
    student: "Maximilian Schmerle",
    publishedIn: {
      venue: "SemEval-2026",
      url: "https://aclanthology.org/2026.semeval-1.257/",
    },
  },
  {
    title:
      "User Assistance in Exploring Online Reviews: A Comparison of a Conversational Interface and an Aspect-Based Sentiment Analysis Dashboard",
    type: "Master's Thesis",
    student: "Oliver Szczygiel",
  },
  {
    title: "GERest: A German Dataset for Aspect Sentiment Quadruple Prediction",
    type: "Bachelor's Thesis",
    student: "Niclas Reuse",
    publishedIn: {
      venue: "LREC 2026",
      url: "https://lrec.elra.info/lrec2026-main-635",
      note: "Dataset included in the paper",
    },
  },
];

export const REVIEWING: ReviewingEntry[] = [
  {
    venue: "ACL Rolling Review (ARR)",
    cycle: "October 2026",
    type: "Conference",
    url: "https://aclrollingreview.org/",
  },
  {
    venue: "ACL Rolling Review (ARR)",
    cycle: "August 2026",
    type: "Conference",
    url: "https://aclrollingreview.org/",
  },
  {
    venue: "SemEval 2026",
    cycle: "2026",
    type: "Workshop",
    url: "https://semeval.github.io/SemEval2026/",
  },
  {
    venue: "Expert Systems with Applications",
    cycle: "Elsevier",
    type: "Journal",
    url: "https://www.sciencedirect.com/journal/expert-systems-with-applications",
  },
];
