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

The addon wires itself through `setup/` files:

- `setup/main.ts`: registers `SubtitleDisplay`
- `setup/transformers.ts`: injects `<SubtitleDisplay />` only in `export` mode and only when a slide note exists

Because of this, default behavior is export-first. In `dev`/`build` mode, subtitles are not auto-injected.

## Usage

Write speaker notes as usual:

```markdown
---

# My Slide

Content here

<!--
첫 문장입니다. 둘째 문장입니다.
[click]
셋째 문장입니다.
-->
```

### Delaying subtitles with `[subtitle:pause]`

Use `[subtitle:pause]` at the beginning of a note to show the slide without a subtitle on the first click. The subtitle starts from the next click:

```markdown
<!--
[subtitle:pause]
This text appears only after the first click.
-->
```

This is useful for title slides where you want a clean visual before narration begins.

## Export behavior

Use Slidev export with clicks:

```bash
slidev export --with-clicks
```

The injected subtitle component participates in Slidev click flow, so export pages follow subtitle/click progression.

## Repository workflow (Bazel)

This repository uses Bazelisk through `mise` for CI and docs build.

```bash
mise trust
mise install
mise x -- bazelisk build //:ci_checks
mise x -- bazelisk build //docs:site_archive
```

## Parsing behavior

Default parser behavior (`parseNoteToSubtitleTimeline` + `defaultOptions`):

- Splits notes into timeline entries (default `chunkMode: "sentence"`)
- Supports `[click]` and `[click:n]`
- Supports `[subtitle:pause]` to skip a click step (useful for showing a slide without subtitle first)
- Supports `chunkMode: "line"` for newline-based chunks
- Wraps by word units using `maxDisplayWidth`
- Measures display width with fullwidth Unicode characters counted as `2`
- Prefers balanced wrapping and avoids awkward tiny trailing chunks when possible

## Styling

Override `.pdf-subtitle` in your slide styles:

```css
.pdf-subtitle {
  bottom: 2rem;
  font-size: 1.2rem;
}
```

## Library API

Use parser options directly from your code if you need custom note-to-timeline conversion:

```ts
import { defaultOptions, parseNoteToSubtitleTimeline } from "slidev-addon-subtitle";

const timeline = parseNoteToSubtitleTimeline(note, {
  ...defaultOptions,
  chunkMode: "sentence", // or "line"
  sentenceDelimiters: [".", "!", "?", "。", "！", "？", "…", "\n"],
  maxDisplayWidth: 80, // fullwidth Unicode chars count as width 2
});
```
