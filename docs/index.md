---
layout: home

hero:
  name: slidev-addon-subtitle
  text: Automatic Subtitles for Slidev
  tagline: Turn speaker notes into export-ready, click-aware subtitles
  image:
    src: /logo.svg
    alt: slidev-addon-subtitle
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: Smart Chunking
    details: Notes are split by sentence/line and click markers, then wrapped with display-width-aware word splitting.
  - title: Click-aware Timeline
    details: Each chunk maps to click steps (`[click]`, `[click:n]`) and follows Slidev click flow in export output.
  - title: Export-first Setup
    details: Add the addon once, then run `slidev export --with-clicks`. Subtitles are injected automatically for noted slides.
---

## Live Demo

<SlideViewer src="./examples/basic.pdf" />
