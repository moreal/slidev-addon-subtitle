import { defineAppSetup } from "@slidev/types";
import SubtitleDisplay from "./components/SubtitleDisplay.vue";

export default defineAppSetup(({ app }) => {
  app.component("SubtitleDisplay", SubtitleDisplay);
});
