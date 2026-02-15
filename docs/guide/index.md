# Getting Started

## Installation

```bash
npm install slidev-subtitle
```

## Setup

Create a preparser setup file in your Slidev project:

```
setup/preparser.ts
```

```typescript
import { definePreparserSetup } from "@slidev/types";
import { createCaptionPreparserExtensions, defaultOptions } from "slidev-subtitle";

export default definePreparserSetup(({ mode }) => {
  return createCaptionPreparserExtensions({ mode }, defaultOptions);
});
```

## Usage

Write speaker notes in your slides as usual. The plugin will automatically convert them into captions:

```markdown
---

# My Slide

Content here

<!--
This is the first caption line.
This becomes the second caption.
[click]
This appears after a click.
-->
```

- Each line in the notes becomes a separate caption chunk
- Use `[click]` markers to group captions by click steps
- Captions are rendered as `<div class="pdf-caption">` elements

## Styling

Add custom CSS to style the caption container:

```css
.pdf-caption {
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

You can customize the behavior by passing options:

```typescript
createCaptionPreparserExtensions(
  { mode },
  {
    enabledModes: ["export"], // When to enable captions
    preferManualLineBreaks: true, // Split on newlines
    respectClickMarkers: true, // Split on [click] markers
    maxCharsPerLine: 80, // Wrap long lines
    maxChunksPerSlide: Infinity, // Max captions per slide
    minCharsPerChunk: 10, // Merge short chunks
    stripNotesOnExport: false, // Remove notes in export
  },
);
```
