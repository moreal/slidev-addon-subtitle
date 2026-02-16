import { definePreparserSetup } from "@slidev/types";
import { createSubtitlePreparserExtensions, defaultOptions } from "../src/index";

export default definePreparserSetup(({ mode }) => {
  return createSubtitlePreparserExtensions({ mode }, defaultOptions);
});
