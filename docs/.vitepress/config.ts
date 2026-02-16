import { defineConfig } from "vitepress";

export default defineConfig({
  title: "slidev-addon-subtitle",
  description: "Automatic click-synchronized subtitles for Slidev presentations",
  base: "/slidev-subtitle/",

  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [{ text: "Getting Started", link: "/guide/" }],
      },
      {
        text: "API",
        items: [{ text: "API Reference", link: "/api/" }],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/moreal/slidev-subtitle" }],
  },
});
