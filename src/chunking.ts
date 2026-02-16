import { type CaptionOptions, defaultOptions } from "./types";

export function chunkNoteToCaptions(
  note: string | undefined,
  options: Partial<CaptionOptions> = {},
): string[][] {
  const opts = { ...defaultOptions, ...options };

  if (note === undefined || note === null) return [];

  // Normalize CRLF → LF and trim
  const normalized = note.replace(/\r\n/g, "\n").trim();
  if (normalized === "") return [];

  // Step 1: Split by click markers if enabled
  let groups: string[];
  if (opts.respectClickMarkers) {
    groups = splitByClickMarkers(normalized);
  } else {
    groups = [normalized];
  }

  // Step 2: Split by manual line breaks if enabled
  let chunks: string[];
  if (opts.preferManualLineBreaks) {
    chunks = groups.flatMap((group) =>
      group
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== ""),
    );
  } else {
    chunks = groups.map((g) => g.trim()).filter((g) => g !== "");
  }

  // Step 3: Wrap long lines
  if (isFinite(opts.maxCharsPerLine) && opts.maxCharsPerLine > 0) {
    chunks = chunks.flatMap((chunk) => wrapLine(chunk, opts.maxCharsPerLine));
  }

  // Step 4: Merge short chunks
  if (opts.minCharsPerChunk > 0) {
    chunks = mergeShortChunks(chunks, opts.minCharsPerChunk);
  }

  // Step 5: Truncate to max
  if (isFinite(opts.maxChunksPerSlide) && opts.maxChunksPerSlide > 0) {
    chunks = chunks.slice(0, opts.maxChunksPerSlide);
  }

  return [chunks];
}

function splitByClickMarkers(text: string): string[] {
  const lines = text.split("\n");
  const groups: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^\[click(?::(\d+))?\]$/i.test(line.trim())) {
      if (current.length > 0) {
        groups.push(current.join("\n"));
        current = [];
      }
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    groups.push(current.join("\n"));
  }

  return groups;
}

function wrapLine(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const result: string[] = [];
  let remaining = text;

  while (remaining.length > maxChars) {
    let breakAt = -1;

    // Try to break at last space before limit
    const lastSpace = remaining.lastIndexOf(" ", maxChars);
    if (lastSpace > 0) {
      breakAt = lastSpace;
    }

    // If no space found, try last punctuation before limit
    if (breakAt === -1) {
      for (let i = maxChars - 1; i > 0; i--) {
        if (/[.,;:!?]/.test(remaining[i])) {
          breakAt = i + 1;
          break;
        }
      }
    }

    // Hard cut as last resort
    if (breakAt === -1) {
      breakAt = maxChars;
    }

    result.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining) {
    result.push(remaining);
  }

  return result;
}

function mergeShortChunks(chunks: string[], minChars: number): string[] {
  if (chunks.length <= 1) return chunks;

  const result: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].length < minChars && i + 1 < chunks.length) {
      // Merge with next chunk
      result.push(chunks[i] + " " + chunks[i + 1]);
      i++; // Skip next
    } else if (chunks[i].length < minChars && result.length > 0) {
      // Merge with previous
      result[result.length - 1] += " " + chunks[i];
    } else {
      result.push(chunks[i]);
    }
  }

  return result;
}
