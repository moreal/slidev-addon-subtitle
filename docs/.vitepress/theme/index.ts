import { defineAsyncComponent } from "vue";
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component(
      "SlideViewer",
      defineAsyncComponent(() => import("./components/SlideViewer.vue")),
    );
  },
} satisfies Theme;
