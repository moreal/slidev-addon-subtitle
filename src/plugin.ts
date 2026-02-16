import { type CaptionOptions, defaultOptions } from "./types";
import { chunkNoteToCaptions } from "./chunking";
import { injectCaptionsIntoSlide } from "./injection";

export interface PreparserExtension {
  transformNote?(note: string | undefined, frontmatter: Record<string, any>): string | undefined;
  transformSlide?(content: string, frontmatter: Record<string, any>): string | undefined;
}

export function createCaptionPreparserExtensions(
  ctx: { mode: string },
  options: Partial<CaptionOptions> = {},
): PreparserExtension[] {
  const opts = { ...defaultOptions, ...options };

  if (!opts.enabledModes.includes(ctx.mode as CaptionOptions["enabledModes"][number])) {
    return [];
  }

  return [
    {
      transformNote(note: string | undefined, frontmatter: Record<string, any>) {
        const chunks = chunkNoteToCaptions(note, opts);
        frontmatter[opts.storageKey] = chunks;

        if (opts.stripNotesOnExport) {
          return "";
        }
        return note;
      },
    },
    {
      transformSlide(content: string, frontmatter: Record<string, any>) {
        const chunks: string[] | undefined = frontmatter[opts.storageKey];
        delete frontmatter[opts.storageKey];

        if (!chunks || chunks.length === 0) {
          return content;
        }

        return injectCaptionsIntoSlide(content, frontmatter, chunks);
      },
    },
  ];
}
