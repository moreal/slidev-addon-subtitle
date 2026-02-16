import { definePreparserSetup } from "@slidev/types";
import { createSubtitlePreparserExtensions, defaultOptions } from "slidev-addon-subtitle";

export default definePreparserSetup(({ mode }) => {
  // Our sync PreparserExtension[] is runtime-compatible with Slidev's async SlidevPreparserExtension[]
  return createSubtitlePreparserExtensions({ mode: mode ?? "dev" }, defaultOptions) as any;
});
