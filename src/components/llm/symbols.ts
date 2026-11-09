import type { GlossaryEntry } from "../backprop/Glossary";

export const LLM_SYMBOLS: GlossaryEntry[] = [
  {
    sym: "LLM",
    name: { en: "large language model", de: "großes Sprachmodell" },
    meaning: {
      en: "A huge neural network trained to predict the next token of text. ChatGPT, Claude and Gemini are LLMs.",
      de: "Ein riesiges neuronales Netz, trainiert darauf, das nächste Token eines Textes vorherzusagen. ChatGPT, Claude und Gemini sind LLMs.",
    },
  },
  {
    sym: "tok",
    name: { en: "token", de: "Token" },
    meaning: {
      en: "A piece of text: a whole word, part of a word, or a punctuation mark. The model reads and writes tokens, not letters.",
      de: "Ein Stück Text: ein ganzes Wort, ein Wortteil oder ein Satzzeichen. Das Modell liest und schreibt Tokens, keine Buchstaben.",
    },
  },
  {
    sym: "[ … ]",
    name: { en: "vector", de: "Vektor" },
    meaning: {
      en: "A list of numbers. Inside an LLM, every token is represented as a vector with thousands of numbers.",
      de: "Eine Liste von Zahlen. In einem LLM wird jedes Token als Vektor mit Tausenden Zahlen dargestellt.",
    },
  },
  {
    sym: "n × d",
    name: { en: "matrix", de: "Matrix" },
    meaning: {
      en: "A table of numbers. “11 × 768” means 11 rows (one per token) and 768 columns (numbers per token).",
      de: "Eine Tabelle aus Zahlen. „11 × 768“ heißt 11 Zeilen (eine pro Token) und 768 Spalten (Zahlen pro Token).",
    },
  },
  {
    sym: "W",
    name: { en: "weight matrix", de: "Gewichtsmatrix" },
    meaning: {
      en: "A learned table of weights. Multiplying a vector by it gives a new vector, e.g. q = x × W_Q.",
      de: "Eine gelernte Tabelle aus Gewichten. Multipliziert man einen Vektor damit, entsteht ein neuer Vektor, z. B. q = x × W_Q.",
    },
  },
  {
    sym: "emb",
    name: { en: "embedding", de: "Embedding" },
    meaning: {
      en: "The vector that stands for a token. Tokens with similar meaning get similar vectors.",
      de: "Der Vektor, der für ein Token steht. Tokens mit ähnlicher Bedeutung bekommen ähnliche Vektoren.",
    },
  },
  {
    sym: "attn",
    name: { en: "attention", de: "Attention (Aufmerksamkeit)" },
    meaning: {
      en: "The step where each token looks at earlier tokens and decides which ones matter for it.",
      de: "Der Schritt, in dem jedes Token auf frühere Tokens schaut und entscheidet, welche für es wichtig sind.",
    },
  },
  {
    sym: "q, k, v",
    name: { en: "query, key, value", de: "Query, Key, Value" },
    meaning: {
      en: "Three vectors per token used in attention: the question it asks (q), the label it shows (k), and the content it hands over (v).",
      de: "Drei Vektoren pro Token für die Attention: die Frage, die es stellt (q), das Etikett, das es zeigt (k), und der Inhalt, den es weitergibt (v).",
    },
  },
  {
    sym: "q · k",
    name: { en: "dot product", de: "Skalarprodukt" },
    meaning: {
      en: "Multiply two vectors entry by entry and add everything up. Big when they point the same way.",
      de: "Zwei Vektoren Eintrag für Eintrag multiplizieren und alles addieren. Groß, wenn sie in dieselbe Richtung zeigen.",
    },
  },
  {
    sym: "logit",
    name: { en: "score", de: "Punktzahl" },
    meaning: {
      en: "The model's raw score for one possible next token, before it is turned into a probability.",
      de: "Die rohe Punktzahl des Modells für ein mögliches nächstes Token, bevor daraus eine Wahrscheinlichkeit wird.",
    },
  },
  {
    sym: "softmax",
    name: { en: "softmax", de: "Softmax" },
    meaning: {
      en: "Turns a list of scores into probabilities that are all positive and add up to 100%. Higher score → bigger share.",
      de: "Macht aus einer Liste von Punktzahlen Wahrscheinlichkeiten, die alle positiv sind und zusammen 100% ergeben. Höhere Punktzahl → größerer Anteil.",
    },
  },
  {
    sym: "T",
    name: { en: "temperature", de: "Temperatur" },
    meaning: {
      en: "How adventurous the sampling is. 0 = always the most likely token; higher = more surprising choices.",
      de: "Wie mutig gewürfelt wird. 0 = immer das wahrscheinlichste Token; höher = überraschendere Wahl.",
    },
  },
  {
    sym: "MLP",
    name: { en: "feed-forward network", de: "Feed-Forward-Netz" },
    meaning: {
      en: "The small neural network inside each layer, the same kind as on the backprop page, just much wider.",
      de: "Das kleine neuronale Netz in jeder Schicht, dieselbe Art wie auf der Backprop-Seite, nur viel breiter.",
    },
  },
  {
    sym: "θ",
    name: { en: "parameters", de: "Parameter" },
    meaning: {
      en: "All the adjustable numbers (weights) in the model. Large models have billions.",
      de: "Alle einstellbaren Zahlen (Gewichte) im Modell. Große Modelle haben Milliarden davon.",
    },
  },
  {
    sym: "L",
    name: { en: "loss", de: "Loss (Strafe)" },
    meaning: {
      en: "How surprised the model was by the real next token: −log(probability it gave that token). Training pushes it down.",
      de: "Wie überrascht das Modell vom echten nächsten Token war: −log(Wahrscheinlichkeit, die es diesem Token gab). Training drückt ihn nach unten.",
    },
  },
];
