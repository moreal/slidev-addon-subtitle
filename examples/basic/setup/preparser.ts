import { definePreparserSetup } from "@slidev/types";
import { createCaptionPreparserExtensions, defaultOptions } from "slidev-subtitle";

export default definePreparserSetup(({ mode }) => {
  return createCaptionPreparserExtensions({ mode }, defaultOptions);
});
