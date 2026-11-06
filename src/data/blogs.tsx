export interface BlogType {
  id: string;
  url: string;
  category: string;
  author: string;
  term: string;
  title: string;
}

export const BLOGS: BlogType[] = [
  {
    id: "5",
    url: "agents-at-work",
    category: "AI",
    author: "Nils Hellwig",
    term: "06/11/2026",
    title: "How Agents Save Me Time at Work",
  },
  {
    id: "4",
    url: "predictions-2027",
    category: "AI",
    author: "Nils Hellwig",
    term: "06/11/2026",
    title: "Five Predictions for AI in 2027",
  },
  {
    id: "3",
    url: "lrec2026",
    category: "NLP",
    author: "Nils Hellwig",
    term: "20/05/2026",
    title: "LREC 2026: Three Papers in Palma",
  },
  {
    id: "2",
    url: "prompting",
    category: "NLP",
    author: "Nils Hellwig",
    term: "17/04/2026",
    title: "Beyond Prompting: Advanced Techniques for Efficient LLM Inference",
  },
  {
    id: "1",
    url: "acl2025",
    category: "NLP",
    author: "Nils Hellwig",
    term: "01/07/2025",
    title: "ACL 2025: My Journey to Vienna",
  },
  {
    id: "0",
    url: "master-thesis",
    category: "NLP",
    author: "Nils Hellwig",
    term: "12/06/2024",
    title:
      "Master Thesis: Data Augmentation with Large Language Models for Aspect-Based Sentiment Analysis in Low-Resource Scenarios",
  },
];

export const convertMonth: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

// Blog terms are stored as "DD/MM/YYYY".
export const formatBlogDate = (term: string) => {
  const [day, month, year] = term.split("/");
  return `${convertMonth[parseInt(month)]} ${parseInt(day)}, ${year}`;
};
