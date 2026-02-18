import { defineConfig } from "vitepress";

export default defineConfig({
  title: "slidev-addon-subtitle",
  description: "Automatic click-synchronized subtitles for Slidev presentations",
  base: "/slidev-addon-subtitle/",

  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
      { text: "Demo", link: "/demo/basic" },
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
      {
        text: "Demo",
        items: [
          { text: "Basic", link: "/demo/basic" },
          { text: "Basic (한국어)", link: "/demo/basic-ko" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/moreal/slidev-addon-subtitle" }],
  },
});
