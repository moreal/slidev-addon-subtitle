export function injectCaptionsIntoSlide(
  content: string,
  frontmatter: Record<string, any>,
  captions: string[],
): string {
  if (captions.length === 0) return content;

  const escaped = captions.map(escapeHtml);
  const lines: string[] = [];

  lines.push('<div class="pdf-caption">');

  if (escaped.length === 1) {
    lines.push(`  <div>${escaped[0]}</div>`);
  } else {
    for (let i = 0; i < escaped.length; i++) {
      if (i === 0) {
        lines.push(`  <div v-if="$clicks === 0">${escaped[i]}</div>`);
      } else if (i === escaped.length - 1) {
        lines.push(`  <div v-else>${escaped[i]}</div>`);
      } else {
        lines.push(`  <div v-else-if="$clicks === ${i}">${escaped[i]}</div>`);
      }
    }
  }

  lines.push("</div>");

  if (captions.length > 1) {
    const requiredClicks = captions.length - 1;
    const existingClicks = typeof frontmatter.clicks === "number" ? frontmatter.clicks : 0;
    frontmatter.clicks = Math.max(existingClicks, requiredClicks);
  }

  return content + "\n" + lines.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
