export function injectCaptionsIntoSlide(
  content: string,
  frontmatter: Record<string, any>,
  captionGroups: string[][],
): string {
  if (captionGroups.length === 0) return content;

  // For multiple groups, offset v-click elements to align with group boundaries
  if (captionGroups.length > 1) {
    content = offsetVClicks(content, captionGroups);
  }

  // Flatten all groups — each line gets its own click state / PDF page
  const captions = captionGroups.flat();
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

/**
 * Offset auto-numbered `<v-click>` elements so they align with group boundaries.
 *
 * Without offset, v-click #1 appears at $clicks===1. But when each caption line
 * consumes its own click, v-click #1 should appear at the start of group 1
 * (= total lines in group 0).
 */
function offsetVClicks(content: string, captionGroups: string[][]): string {
  // groupStarts[i] = cumulative line count before group i
  // e.g. groups of [3, 3, 3] → groupStarts = [0, 3, 6, 9]
  const groupStarts: number[] = [0];
  let cumulative = 0;
  for (const group of captionGroups) {
    cumulative += group.length;
    groupStarts.push(cumulative);
  }

  let autoIndex = 0;

  return content.replace(/<v-click((?:\s[^>]*)?)>/gi, (match, attrs) => {
    const attrStr: string = attrs || "";
    // Skip v-clicks that already have an explicit 'at' attribute
    if (/\bat\s*=/i.test(attrStr)) {
      return match;
    }
    autoIndex++;
    if (autoIndex < groupStarts.length) {
      return `<v-click at="${groupStarts[autoIndex]}"${attrStr}>`;
    }
    return match;
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
