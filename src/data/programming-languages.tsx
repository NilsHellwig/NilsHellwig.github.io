export type ProgrammingLanguage = {
  name: string;
  iconPath: string;
  favorite?: boolean;
};

export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  {
    name: "Python",
    favorite: true,
    iconPath: "/img/icons/programming-languages/python.svg",
  },
  {
    name: "TypeScript",
    favorite: true,
    iconPath: "/img/icons/programming-languages/typescript.svg",
  },
  {
    name: "R",
    iconPath: "/img/icons/programming-languages/r.svg",
  },
  {
    name: "Java",
    iconPath: "/img/icons/programming-languages/java.svg",
  },
];
