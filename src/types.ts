export interface SubtitleOptions {
  enabledModes: ("dev" | "build" | "export")[];
  preferManualLineBreaks: boolean;
  respectClickMarkers: boolean;
  maxCharsPerLine: number;
  maxChunksPerSlide: number;
  minCharsPerChunk: number;
  stripNotesOnExport: boolean;
  storageKey: string;
}

export const defaultOptions: SubtitleOptions = {
  enabledModes: ["export"],
  preferManualLineBreaks: true,
  respectClickMarkers: true,
  maxCharsPerLine: 80,
  maxChunksPerSlide: Infinity,
  minCharsPerChunk: 10,
  stripNotesOnExport: false,
  storageKey: "__subtitles",
};
