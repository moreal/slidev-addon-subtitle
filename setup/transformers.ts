import { defineTransformersSetup, type MarkdownTransformContext } from "@slidev/types";

const SUBTITLE_COMPONENT_TAG = "<SubtitleDisplay />";

function injectSubtitleDisplay(ctx: MarkdownTransformContext): void {
  if (ctx.options.mode !== "export") return;

  const note = ctx.slide.note?.trim();
  if (!note) return;

  const source = ctx.s.toString();
  if (source.includes("<SubtitleDisplay")) return;

  const prefix = source.startsWith("\n")
    ? `${SUBTITLE_COMPONENT_TAG}\n`
    : `${SUBTITLE_COMPONENT_TAG}\n\n`;
  ctx.s.prepend(prefix);
}

export default defineTransformersSetup(() => ({
  pre: [injectSubtitleDisplay],
}));
