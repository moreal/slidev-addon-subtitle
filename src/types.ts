export interface SubtitleOptions {
  enabledModes: ("dev" | "build" | "export")[];
  chunkMode: "sentence" | "line";
  sentenceDelimiters: string[];
  maxDisplayWidth: number;
}

export interface SubtitleEntry {
  start: number;
  text: string;
}

export const defaultOptions: SubtitleOptions = {
  enabledModes: ["export"],
  chunkMode: "sentence",
  sentenceDelimiters: [".", "!", "?", "。", "！", "？", "…", "\n"],
  maxDisplayWidth: 80,
};
