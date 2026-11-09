import type { Lang } from "../explainer/i18n";

/** The tiny training text of the transformer on /llm. */
export const MINI_CORPUS: Record<Lang, string> = {
  en: `the dog runs fast .
the cat runs away .
the dog eats meat .
the cat eats fish .
a dog barks .
a cat meows .
the dog sleeps .
the cat sleeps .`,
  de: `der hund rennt schnell .
die katze rennt weg .
der hund frisst fleisch .
die katze frisst fisch .
ein hund bellt .
eine katze miaut .
der hund schläft .
die katze schläft .`,
};
