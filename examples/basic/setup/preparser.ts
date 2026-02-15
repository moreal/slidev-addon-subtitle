import { definePreparserSetup } from "@slidev/types";
import { createCaptionPreparserExtensions, defaultOptions } from "../../../src/index";

export default definePreparserSetup(({ mode }) => {
  return createCaptionPreparserExtensions({ mode }, defaultOptions);
});
