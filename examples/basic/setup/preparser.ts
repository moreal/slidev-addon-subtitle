import { definePreparserSetup } from "@slidev/types";
import { createSubtitlePreparserExtensions, defaultOptions } from "slidev-subtitle";

export default definePreparserSetup(({ mode }) => {
  return createSubtitlePreparserExtensions({ mode }, defaultOptions);
});
