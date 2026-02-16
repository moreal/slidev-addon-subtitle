# Getting Started

## Installation

```bash
npm install slidev-addon-subtitle
```

## Setup

Add the addon to your slide's frontmatter:

```markdown
---
addons:
  - subtitle
---
```

That's it! The addon automatically registers the preparser and provides default subtitle styles.

## Usage

Write speaker notes in your slides as usual. The plugin will automatically convert them into subtitles:

```markdown
---

# My Slide

Content here

<!--
This is the first subtitle line.
This becomes the second subtitle.
[click]
This appears after a click.
-->
```

- Each line in the notes becomes a separate subtitle chunk
- Use `[click]` markers to group subtitles by click steps
- Subtitles are rendered as `<div class="pdf-subtitle">` elements

## Styling

A default style is automatically provided by the addon. You can customize it by overriding the `.pdf-subtitle` class in your project's styles:

```css
.pdf-subtitle {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2rem;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
```

## Options

For advanced use cases, you can create your own `setup/preparser.ts` instead of relying on the addon's default:

```typescript
import { definePreparserSetup } from "@slidev/types";
import { createSubtitlePreparserExtensions } from "slidev-addon-subtitle";

export default definePreparserSetup(({ mode }) => {
  return createSubtitlePreparserExtensions(
    { mode },
    {
      enabledModes: ["export"], // When to enable subtitles
      preferManualLineBreaks: true, // Split on newlines
      respectClickMarkers: true, // Split on [click] markers
      maxCharsPerLine: 80, // Wrap long lines
      maxChunksPerSlide: Infinity, // Max subtitles per slide
      minCharsPerChunk: 10, // Merge short chunks
      stripNotesOnExport: false, // Remove notes in export
    },
  );
});
```
