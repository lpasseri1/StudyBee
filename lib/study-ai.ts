import { Note } from './types';

// These helpers run entirely client-side so Study features work with zero
// configuration. Each function is a natural drop-in point for a real model
// call later — e.g. POST the same input to an `/api/ai` route that calls
// the Anthropic API and return its response instead of the local heuristic.

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be',
  'to', 'of', 'in', 'on', 'for', 'with', 'that', 'this', 'it', 'as', 'by',
  'at', 'from', 'into', 'their', 'its', 'you', 'your', 'i', 'we', 'they',
  'he', 'she', 'not', 'can', 'will', 'has', 'have', 'had', 'so', 'than'
]);

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractKeyTerms(text: string, limit = 8): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w[0].toUpperCase() + w.slice(1));
}

export interface StudyGuide {
  unit: string;
  keyTerms: string[];
  summaryPoints: string[];
  reviewQuestions: string[];
}

export function generateStudyGuide(notes: Note[], unit: string): StudyGuide {
  const combined = notes.map((n) => n.content).join(' ');
  const allSentences = notes.flatMap((n) => splitSentences(n.content));
  const keyTerms = extractKeyTerms(combined, 8);

  // Prefer sentences that mention a key term as summary points
  const summaryPoints = allSentences
    .filter((s) => keyTerms.some((t) => s.toLowerCase().includes(t.toLowerCase())))
    .slice(0, 6);

  const fallbackPoints = summaryPoints.length > 0 ? summaryPoints : allSentences.slice(0, 6);

  const reviewQuestions = keyTerms.slice(0, 5).map((term) => `What is the role of "${term}" in this unit?`);

  return {
    unit,
    keyTerms,
    summaryPoints: fallbackPoints,
    reviewQuestions
  };
}

export interface HomeworkFeedback {
  strengths: string[];
  improvements: string[];
  wordCount: number;
  score: 'strong' | 'solid' | 'needs work';
}

export function getHomeworkFeedback(submission: string): HomeworkFeedback {
  const sentences = splitSentences(submission);
  const wordCount = submission.trim().split(/\s+/).filter(Boolean).length;
  const avgSentenceLength = wordCount / Math.max(1, sentences.length);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 120) {
    strengths.push('Good level of detail — the response is well developed.');
  } else if (wordCount > 0) {
    improvements.push('Add more detail or examples to fully support your points.');
  }

  if (sentences.length >= 3) {
    strengths.push('Ideas are broken into clear, separate sentences.');
  } else {
    improvements.push('Break your answer into more than one sentence so each idea is clear.');
  }

  if (avgSentenceLength > 30) {
    improvements.push('Some sentences run long — consider splitting them for clarity.');
  }

  if (/\b(because|therefore|as a result|this shows|for example)\b/i.test(submission)) {
    strengths.push('Nice use of reasoning language to connect ideas (e.g. "because", "therefore").');
  } else {
    improvements.push('Try connecting ideas with reasoning words like "because" or "for example" to show your thinking.');
  }

  if (!/[.!?]$/.test(submission.trim())) {
    improvements.push('End your final sentence with proper punctuation.');
  }

  if (strengths.length === 0) strengths.push('You submitted a response — that\'s the first step!');

  const score: HomeworkFeedback['score'] =
    improvements.length === 0 ? 'strong' : improvements.length <= 2 ? 'solid' : 'needs work';

  return { strengths, improvements, wordCount, score };
}

export interface ImportedSummary {
  title: string;
  bulletPoints: string[];
  keyTerms: string[];
}

export function summarizeImportedContent(rawText: string): ImportedSummary {
  const sentences = splitSentences(rawText);
  const keyTerms = extractKeyTerms(rawText, 6);
  const bulletPoints = sentences.slice(0, 8);
  const firstLine = rawText.trim().split('\n')[0]?.slice(0, 60) || 'Imported content';

  return {
    title: firstLine,
    bulletPoints,
    keyTerms
  };
}
