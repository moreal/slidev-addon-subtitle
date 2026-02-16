---
theme: default
addons:
  - subtitle
---

# Welcome to Slidev Subtitle Demo

This slide has no presenter notes, so no subtitles will appear.

---

# Multi-line Subtitles

Each line in the presenter notes becomes a separate PDF page with its own subtitle overlay.

<!--
This is the first subtitle that appears on the initial page.
This is the second subtitle shown on the next page.
This is the third and final subtitle for this slide.
-->

---

# Click-based Subtitles

Notes are split into groups using [click] markers.

<v-click>

- First item appears on click 1

</v-click>
<v-click>

- Second item appears on click 2

</v-click>

<!--
This subtitle appears before any clicks.
[click]
After the first click, this subtitle is shown instead.
[click]
The final subtitle appears after the second click.
-->

---

# Multi-line Click Subtitles

Each [click] group can contain multiple lines, producing several PDF pages per click.

<v-click>

- Revealed on click 1

</v-click>
<v-click>

- Revealed on click 2

</v-click>

<!--
Welcome to this slide.
This is the opening context.
Let's get started.
[click]
Now we move to the first topic.
Here are some important details.
Pay attention to this part.
[click]
Finally, we wrap up the discussion.
Thanks for following along.
See you next time.
-->

---

# Auto-wrapped Long Subtitle

A single long note line will be automatically wrapped at word boundaries.

<!--
This is a very long presenter note that demonstrates the automatic word-wrapping feature of the subtitle system, which splits text at natural word boundaries when it exceeds the configured maximum characters per line.
-->
