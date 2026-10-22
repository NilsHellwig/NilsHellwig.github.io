export type Technology = string | { name: string; favorite?: boolean };

export const TECHNOLOGIES: { name: string; technologies: Technology[] }[] = [
  {
    name: "Web Technologies (Frontend)",
    technologies: [
      { name: "React (+Next.js)", favorite: true },
      "HTML",
      "CSS",
      "Tailwind",
      "shadCN",
      "JavaScript",
      "jQuery",
      "Vue.js (+Nuxt.js)",
      "Angular",
    ],
  },
  {
    name: "Web Technologies (Backend)",
    technologies: [{ name: "FastAPI", favorite: true }, "Node.js", "Django", "socket.io"],
  },
  {
    name: "Data Analysis",
    technologies: ["pandas", "NumPy", "NLTK", "SpaCy", "Matplotlib", "Seaborn", "Plotly"],
  },
  {
    name: "Machine Learning",
    technologies: ["Scikit-learn", "Tensorflow / Keras", "Huggingface Transformer"],
  },
  {
    name: "Databases",
    technologies: ["Firebase", "mySQL", "MangoDB", "ElasticSearch", "Redis", "SQLite", "Kafka"],
  },
  {
    name: "CI/CD",
    technologies: ["GitHub CI/CD", "GitLab CI/CD", "Docker", "nginx", "Vercel"],
  },
  {
    name: "Testing",
    technologies: ["pytest", "Playwright"],
  },
  {
    name: "Versioning (git)",
    technologies: ["GitHub", "BitBucket", "GitLab"],
  },
  {
    name: "GUI-Prototyping",
    technologies: ["Adobe XD", "Figma"],
  },
  {
    name: "Image Editing",
    technologies: ["Affinity Photo", "GIMP", "Adobe Photoshop"],
  },
  {
    name: "Audio Editing",
    technologies: ["Audacity", "Logic Pro"],
  },
  {
    name: "Video Editing",
    technologies: ["iMovie", "Final Cut Pro"],
  },
];
