import { type SubtitleEntry, type SubtitleOptions, defaultOptions } from "./types";

const CLICK_MARKER_RE = /^\[click(?::(\d+))?\]$/i;
const COMBINING_MARK_RE = /\p{Mark}/u;

export function parseNoteToSubtitleTimeline(
  note: string | undefined,
  options: Partial<SubtitleOptions> = {},
): SubtitleEntry[] {
  const opts = resolveOptions(options);

  if (note === undefined || note === null) return [];

  const normalized = note.replace(/\r\n/g, "\n").trim();
  if (normalized === "") return [];
  return buildTimeline(normalized, opts);
}

function buildTimeline(note: string, options: SubtitleOptions): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = note.split("\n");

  let cursor = 0;
  let current: string[] = [];

  const flush = (): number => {
    const text = current.join("\n").trim();
    current = [];
    if (text === "") return 0;

    const chunks = splitGroupText(text, options);
    let emitted = 0;
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (trimmed === "") continue;

      entries.push({ start: cursor, text: trimmed });
      cursor += 1;
      emitted += 1;
    }

    return emitted;
  };

  for (const line of lines) {
    const match = line.trim().match(CLICK_MARKER_RE);
    if (!match) {
      current.push(line);
      continue;
    }

    const emitted = flush();

    if (match[1] !== undefined) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) {
        cursor = Math.max(cursor, Math.max(0, Math.trunc(parsed)));
      } else {
        cursor += 1;
      }
    } else if (emitted === 0) {
      // If marker is not separating subtitle groups (e.g. leading/consecutive markers),
      // keep it as an explicit click advance.
      cursor += 1;
    }
  }

  flush();
  return entries;
}

function splitGroupText(text: string, options: SubtitleOptions): string[] {
  const sourceSegments =
    options.chunkMode === "line"
      ? text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "")
      : splitSentences(text, new Set(options.sentenceDelimiters.filter((value) => value !== "\n")));

  return wrapSegmentsByDisplayWidth(sourceSegments, options.maxDisplayWidth);
}

function splitSentences(text: string, delimiters: Set<string>): string[] {
  const result: string[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (line === "") continue;

    let current = "";
    const pushCurrent = () => {
      const trimmed = current.trim();
      if (trimmed !== "") {
        result.push(trimmed);
      }
      current = "";
    };

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      current += char;

      if (!isSentenceBoundary(line, i, char, delimiters)) {
        continue;
      }

      pushCurrent();
    }

    pushCurrent();
  }

  return result;
}

function isSentenceBoundary(
  line: string,
  index: number,
  char: string,
  delimiters: Set<string>,
): boolean {
  if (!delimiters.has(char)) return false;

  // Keep decimal numbers like 3.14 in one chunk.
  if (char === ".") {
    const prev = line[index - 1] ?? "";
    const next = line[index + 1] ?? "";

    if (isDigit(prev) && isDigit(next)) return false;
    if (next === ".") return false;
  }

  return true;
}

function isDigit(value: string): boolean {
  return value >= "0" && value <= "9";
}

function wrapSegmentsByDisplayWidth(segments: string[], maxDisplayWidth: number): string[] {
  if (!Number.isFinite(maxDisplayWidth) || maxDisplayWidth <= 0) return segments;

  const wrapped: string[] = [];
  for (const segment of segments) {
    wrapped.push(...wrapByWords(segment, maxDisplayWidth));
  }

  return wrapped;
}

function wrapByWords(text: string, maxDisplayWidth: number): string[] {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word !== "");

  if (words.length === 0) return [];
  if (words.length === 1) return [words[0]];

  const wordWidths = words.map((word) => displayWidth(word));
  const baseRanges = greedyLineRanges(wordWidths, maxDisplayWidth);
  if (baseRanges.length <= 1) return [words.join(" ")];

  const baseLineCount = baseRanges.length;
  const strictCandidate = optimizeLineRanges(wordWidths, maxDisplayWidth, baseLineCount, 0);
  const candidates: OptimizationCandidate[] = [];

  if (strictCandidate) {
    candidates.push({
      ranges: strictCandidate.ranges,
      score: strictCandidate.score,
      overflow: strictCandidate.overflow,
    });
  } else {
    candidates.push({
      ranges: baseRanges,
      score: Number.POSITIVE_INFINITY,
      overflow: 0,
    });
  }

  // If strict width wrapping creates awkward tails, also evaluate one-line-fewer layout
  // with a small overflow allowance and pick the lower-cost result.
  if (baseLineCount > 1) {
    const maxOverflow = Math.max(2, Math.floor(maxDisplayWidth * 0.15));
    const compactCandidate = optimizeLineRanges(
      wordWidths,
      maxDisplayWidth,
      baseLineCount - 1,
      maxOverflow,
    );

    if (compactCandidate) {
      const droppedLinePenalty = Math.pow(maxDisplayWidth * 0.45, 2);
      candidates.push({
        ranges: compactCandidate.ranges,
        score: compactCandidate.score + droppedLinePenalty,
        overflow: compactCandidate.overflow,
      });
    }
  }

  candidates.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    if (a.overflow !== b.overflow) return a.overflow - b.overflow;
    return a.ranges.length - b.ranges.length;
  });

  const best = candidates[0] ?? { ranges: baseRanges };
  const mergedRanges = mergeTinyTrailingWordRange(best.ranges, wordWidths, maxDisplayWidth);
  return mergedRanges.map(([start, end]) => words.slice(start, end).join(" "));
}

interface OptimizationCandidate {
  ranges: Array<[number, number]>;
  score: number;
  overflow: number;
}

function mergeTinyTrailingWordRange(
  ranges: Array<[number, number]>,
  wordWidths: number[],
  maxDisplayWidth: number,
): Array<[number, number]> {
  if (ranges.length < 2) return ranges;

  const last = ranges[ranges.length - 1];
  const prev = ranges[ranges.length - 2];
  if (last[1] - last[0] !== 1) return ranges;

  const prefix = buildPrefixWidths(wordWidths);
  const tailWidth = lineWidthFromPrefix(prefix, last[0], last[1]);
  const tinyTailLimit = Math.max(2, Math.floor(maxDisplayWidth * 0.45));
  if (tailWidth > tinyTailLimit) return ranges;

  const prevWidth = lineWidthFromPrefix(prefix, prev[0], prev[1]);
  const mergedWidth = prevWidth + 1 + tailWidth;
  const maxOverflow = Math.max(2, Math.floor(maxDisplayWidth * 0.15));
  if (mergedWidth > maxDisplayWidth + maxOverflow) return ranges;

  const merged = ranges.slice(0, -2);
  merged.push([prev[0], last[1]]);
  return merged;
}

function greedyLineRanges(wordWidths: number[], maxDisplayWidth: number): Array<[number, number]> {
  if (wordWidths.length === 0) return [];

  const ranges: Array<[number, number]> = [];
  let start = 0;
  let currentWidth = wordWidths[0];

  for (let i = 1; i < wordWidths.length; i++) {
    const nextWidth = currentWidth + 1 + wordWidths[i];
    if (nextWidth <= maxDisplayWidth) {
      currentWidth = nextWidth;
      continue;
    }

    ranges.push([start, i]);
    start = i;
    currentWidth = wordWidths[i];
  }

  ranges.push([start, wordWidths.length]);
  return ranges;
}

function optimizeLineRanges(
  wordWidths: number[],
  maxDisplayWidth: number,
  totalLines: number,
  maxOverflow: number,
): OptimizationCandidate | null {
  const totalWords = wordWidths.length;
  if (totalWords === 0 || totalLines <= 0) return { ranges: [], score: 0, overflow: 0 };
  if (totalLines >= totalWords) {
    return {
      ranges: wordWidths.map((_, index) => [index, index + 1]),
      score: 0,
      overflow: 0,
    };
  }

  const prefix = buildPrefixWidths(wordWidths);

  const lineWidth = (start: number, end: number): number => {
    return lineWidthFromPrefix(prefix, start, end);
  };

  const isValidLine = (start: number, end: number): boolean => {
    const width = lineWidth(start, end);
    if (width <= maxDisplayWidth + maxOverflow) return true;
    return end - start === 1;
  };

  const totalWidth = lineWidth(0, totalWords);
  const targetWidth = totalWidth / totalLines;

  const dp: number[][] = Array.from({ length: totalLines + 1 }, () =>
    Array(totalWords + 1).fill(Number.POSITIVE_INFINITY),
  );
  const prev: number[][] = Array.from({ length: totalLines + 1 }, () =>
    Array(totalWords + 1).fill(-1),
  );

  dp[0][0] = 0;

  for (let lineIndex = 1; lineIndex <= totalLines; lineIndex++) {
    const minEnd = lineIndex;
    const maxEnd = totalWords - (totalLines - lineIndex);

    for (let end = minEnd; end <= maxEnd; end++) {
      for (let start = lineIndex - 1; start < end; start++) {
        if (!Number.isFinite(dp[lineIndex - 1][start])) continue;
        if (!isValidLine(start, end)) continue;

        const width = lineWidth(start, end);
        const wordsInLine = end - start;
        const cost = lineCost(
          width,
          targetWidth,
          wordsInLine,
          lineIndex,
          totalLines,
          maxDisplayWidth,
        );

        const nextCost = dp[lineIndex - 1][start] + cost;
        if (nextCost < dp[lineIndex][end]) {
          dp[lineIndex][end] = nextCost;
          prev[lineIndex][end] = start;
        }
      }
    }
  }

  if (!Number.isFinite(dp[totalLines][totalWords])) return null;

  const ranges: Array<[number, number]> = [];
  let overflow = 0;
  let end = totalWords;
  for (let lineIndex = totalLines; lineIndex >= 1; lineIndex--) {
    const start = prev[lineIndex][end];
    if (start < 0) return null;
    ranges.push([start, end]);
    const width = lineWidth(start, end);
    overflow += Math.max(0, width - maxDisplayWidth);
    end = start;
  }

  ranges.reverse();
  return {
    ranges,
    score: dp[totalLines][totalWords],
    overflow,
  };
}

function lineCost(
  width: number,
  targetWidth: number,
  wordsInLine: number,
  lineIndex: number,
  totalLines: number,
  maxDisplayWidth: number,
): number {
  const variance = Math.pow(width - targetWidth, 2);
  const overflow = Math.max(0, width - maxDisplayWidth);
  let penalty = 0;

  // Penalize overflow softly so we can still avoid awkward tiny tails when overflow is small.
  if (overflow > 0) {
    penalty += Math.pow(overflow, 2) * 12;
  }

  // Strongly discourage tiny one-word tails like "... 합니다.".
  if (wordsInLine === 1 && totalLines > 1) {
    const ratio = targetWidth > 0 ? width / targetWidth : 1;
    if (lineIndex === totalLines && ratio < 0.95) {
      penalty += Math.pow(targetWidth * (0.95 - ratio), 2) + targetWidth * 4;
    } else if (ratio < 0.6) {
      penalty += Math.pow(targetWidth * (0.6 - ratio), 2);
    }
  }

  // Discourage very short final lines even when they contain multiple words.
  if (lineIndex === totalLines) {
    const ratio = targetWidth > 0 ? width / targetWidth : 1;
    if (ratio < 0.55) {
      penalty += Math.pow(targetWidth * (0.55 - ratio), 2) * 2.5;
    }
  }

  return variance + penalty;
}

function buildPrefixWidths(wordWidths: number[]): number[] {
  const prefix: number[] = Array(wordWidths.length + 1).fill(0);
  for (let i = 0; i < wordWidths.length; i++) {
    prefix[i + 1] = prefix[i] + wordWidths[i];
  }
  return prefix;
}

function lineWidthFromPrefix(prefix: number[], start: number, end: number): number {
  const wordsWidth = prefix[end] - prefix[start];
  const spaces = Math.max(0, end - start - 1);
  return wordsWidth + spaces;
}

function displayWidth(value: string): number {
  let width = 0;
  for (const char of value) {
    width += charDisplayWidth(char);
  }
  return width;
}

function charDisplayWidth(char: string): number {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return 0;
  if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) return 0;
  if (COMBINING_MARK_RE.test(char)) return 0;
  if (isFullWidthCodePoint(codePoint)) return 2;
  return 1;
}

function isFullWidthCodePoint(codePoint: number): boolean {
  if (codePoint < 0x1100) return false;

  return (
    codePoint <= 0x115f ||
    codePoint === 0x2329 ||
    codePoint === 0x232a ||
    (codePoint >= 0x2e80 && codePoint <= 0x3247 && codePoint !== 0x303f) ||
    (codePoint >= 0x3250 && codePoint <= 0x4dbf) ||
    (codePoint >= 0x4e00 && codePoint <= 0xa4c6) ||
    (codePoint >= 0xa960 && codePoint <= 0xa97c) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
    (codePoint >= 0xfe30 && codePoint <= 0xfe6b) ||
    (codePoint >= 0xff01 && codePoint <= 0xff60) ||
    (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
    (codePoint >= 0x1b000 && codePoint <= 0x1b001) ||
    (codePoint >= 0x1f200 && codePoint <= 0x1f251) ||
    (codePoint >= 0x20000 && codePoint <= 0x3fffd)
  );
}

function resolveOptions(options: Partial<SubtitleOptions>): SubtitleOptions {
  const rawMaxDisplayWidth = options.maxDisplayWidth ?? defaultOptions.maxDisplayWidth;
  const maxDisplayWidth =
    Number.isFinite(rawMaxDisplayWidth) && rawMaxDisplayWidth > 0
      ? Math.trunc(rawMaxDisplayWidth)
      : Number.POSITIVE_INFINITY;

  return {
    enabledModes: options.enabledModes
      ? [...options.enabledModes]
      : [...defaultOptions.enabledModes],
    chunkMode: options.chunkMode ?? defaultOptions.chunkMode,
    sentenceDelimiters: options.sentenceDelimiters
      ? [...options.sentenceDelimiters]
      : [...defaultOptions.sentenceDelimiters],
    maxDisplayWidth,
  };
}
