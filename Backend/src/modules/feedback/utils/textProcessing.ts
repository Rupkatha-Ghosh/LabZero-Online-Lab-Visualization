import {
  TextFeedbackKeyword,
  TextFeedbackSentimentSummary,
  TextFeedbackWordFrequency,
} from "../types/feedback.types";

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "had",
  "has",
  "have",
  "i",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "there",
  "this",
  "to",
  "was",
  "we",
  "were",
  "with",
  "you",
  "your",
]);

const positiveWords = new Set([
  "accurate",
  "amazing",
  "clear",
  "easy",
  "effective",
  "engaging",
  "excellent",
  "fun",
  "good",
  "great",
  "helpful",
  "improved",
  "interactive",
  "interesting",
  "liked",
  "love",
  "perfect",
  "smooth",
  "useful",
  "well",
]);

const negativeWords = new Set([
  "bad",
  "boring",
  "broken",
  "confusing",
  "difficult",
  "error",
  "frustrating",
  "hard",
  "issue",
  "lag",
  "missing",
  "poor",
  "problem",
  "slow",
  "stuck",
  "unclear",
  "unhelpful",
  "weak",
  "worse",
  "wrong",
]);

export const tokenizeFeedbackText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^'+|'+$/g, ""))
    .filter((word) => word.length > 2 && !stopWords.has(word));

export const calculateWordFrequencies = (
  responses: string[],
  limit = 40
): TextFeedbackWordFrequency[] => {
  const counts = new Map<string, number>();

  for (const token of responses.flatMap(tokenizeFeedbackText)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
};

export const extractKeywords = (
  responses: string[],
  limit = 20
): TextFeedbackKeyword[] =>
  calculateWordFrequencies(responses, limit).map(({ word, count }) => ({
    keyword: word,
    count,
    score: Number((count / Math.max(responses.length, 1)).toFixed(3)),
  }));

export const scoreSentiment = (text: string) => {
  const tokens = tokenizeFeedbackText(text);
  const score = tokens.reduce((total, token) => {
    if (positiveWords.has(token)) {
      return total + 1;
    }

    if (negativeWords.has(token)) {
      return total - 1;
    }

    return total;
  }, 0);

  if (score > 0) {
    return { score, classification: "positive" as const };
  }

  if (score < 0) {
    return { score, classification: "negative" as const };
  }

  return { score, classification: "neutral" as const };
};

export const summarizeSentiment = (
  responses: string[]
): TextFeedbackSentimentSummary => {
  const scores = responses.map(scoreSentiment);
  const positive = scores.filter(
    (score) => score.classification === "positive"
  ).length;
  const negative = scores.filter(
    (score) => score.classification === "negative"
  ).length;
  const neutral = scores.length - positive - negative;
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  const averageScore = scores.length > 0 ? totalScore / scores.length : 0;

  return {
    positive,
    neutral,
    negative,
    averageScore: Number(averageScore.toFixed(3)),
    satisfactionPercentage:
      scores.length > 0 ? Math.round((positive / scores.length) * 100) : 0,
  };
};
