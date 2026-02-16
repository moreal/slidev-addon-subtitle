import { type SubtitleOptions, defaultOptions } from "./types";
import { chunkNoteToSubtitles } from "./chunking";
import { injectSubtitlesIntoSlide } from "./injection";

export interface PreparserExtension {
  transformNote?(note: string | undefined, frontmatter: Record<string, any>): string | undefined;
  transformSlide?(content: string, frontmatter: Record<string, any>): string | undefined;
}

export function createSubtitlePreparserExtensions(
  ctx: { mode: string },
  options: Partial<SubtitleOptions> = {},
): PreparserExtension[] {
  const opts = { ...defaultOptions, ...options };

  if (!opts.enabledModes.includes(ctx.mode as SubtitleOptions["enabledModes"][number])) {
    return [];
  }

  return [
    {
      transformNote(note: string | undefined, frontmatter: Record<string, any>) {
        const chunks = chunkNoteToSubtitles(note, opts);
        frontmatter[opts.storageKey] = chunks;

        if (opts.stripNotesOnExport) {
          return "";
        }
        return note;
      },
    },
    {
      transformSlide(content: string, frontmatter: Record<string, any>) {
        const chunks: string[][] | undefined = frontmatter[opts.storageKey];
        delete frontmatter[opts.storageKey];

        if (!chunks || chunks.length === 0) {
          return content;
        }

        return injectSubtitlesIntoSlide(content, frontmatter, chunks);
      },
    },
  ];
}
