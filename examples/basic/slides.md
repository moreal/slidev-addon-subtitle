---
theme: default
addons:
  - subtitle
---

# slidev-addon-subtitle Demo

Turn presenter notes into export-ready, click-aware subtitles.

---

# 1) No note, no subtitle

This slide intentionally has no presenter note.

- In built-in setup, subtitle UI is injected only when a note exists.
- So this slide renders without a subtitle overlay in export.

---

# 2) Basic workflow

1. Write presenter notes as usual.
2. Add optional click markers (`[click]`, `[click:n]`) to control timing.
3. Run export with clicks to render subtitle progression.

```bash
slidev export --with-clicks
```

<!--
No extra subtitle file is needed.
Your presenter notes are the subtitle source.
The exported PDF captures each click step with matching subtitle text.
-->

---

# 3) Sentence-based chunking (default)

By default, notes are split by sentence boundaries.
Line breaks are also respected.

```md
<!--
First sentence. Second sentence!
Third sentence on the next line.
-->
```

<!--
First sentence. Second sentence!
Third sentence on the next line.
-->

---

# 4) Click-synchronized subtitles

Use `[click]` markers in notes to align subtitle timeline with slide clicks.

<v-click>

- First visual item appears on click 1

</v-click>
<v-click>

- Second visual item appears on click 2

</v-click>

<!--
This subtitle appears before any click.
[click]
After click 1, this subtitle appears.
[click]
After click 2, this final subtitle appears.
-->

---

# 5) Explicit click index with `[click:n]`

You can jump subtitle timing to a specific click index.

```md
<!--
Visible at click 0.
[click:3]
Visible from click 3.
-->
```

<!--
Visible at click 0.
[click:3]
Visible from click 3.
-->

---

# 6) Wrapping behavior

- Wrapped by word units
- Fullwidth Unicode (e.g. Korean) counts as width `2`
- Tries to avoid awkward tiny trailing chunks

<!--
This addon splits subtitles by word units and balances them using display width.
When possible, it also merges awkward tiny trailing tails into the previous line.
-->

---

# 7) Export result

`--with-clicks` export records each click step as a separate page state.

- Subtitle text follows the same click progression.
- Useful for shared PDFs that preserve presenter context.

<!--
When you share the exported PDF, each click stage keeps its matching subtitle.
That makes it easier to follow the original talk context even without attending live.
-->
