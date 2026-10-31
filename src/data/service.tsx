export interface ReviewingEntry {
  venue: string;
  cycle: string;
  type: "Conference" | "Workshop" | "Journal";
  url: string;
}

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
