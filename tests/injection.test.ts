import { injectCaptionsIntoSlide } from "../src/injection";

describe("injectCaptionsIntoSlide", () => {
  it("returns content unchanged for empty captions", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, []);
    expect(result).toBe("# Slide");
    expect(fm.clicks).toBeUndefined();
  });

  it("renders single caption without v-if", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, ["Hello world"]);
    expect(result).toContain('<div class="pdf-caption">');
    expect(result).toContain("<div>Hello world</div>");
    expect(result).not.toContain("v-if");
    expect(fm.clicks).toBeUndefined();
  });

  it("renders two captions with v-if and v-else, sets clicks to 1", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, ["First caption", "Second caption"]);
    expect(result).toContain('v-if="$clicks === 0"');
    expect(result).toContain("v-else");
    expect(result).not.toContain("v-else-if");
    expect(fm.clicks).toBe(1);
  });

  it("renders three captions with v-if, v-else-if, and v-else, sets clicks to 2", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, [
      "First caption",
      "Second caption",
      "Third caption",
    ]);
    expect(result).toContain('v-if="$clicks === 0"');
    expect(result).toContain('v-else-if="$clicks === 1"');
    expect(result).toContain("v-else");
    expect(fm.clicks).toBe(2);
  });

  it("escapes HTML characters in captions", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, ['<script>alert("xss")</script>']);
    expect(result).toContain("&lt;script&gt;");
    expect(result).toContain("&quot;xss&quot;");
    expect(result).not.toContain("<script>");
  });

  it("preserves existing clicks when higher than required", () => {
    const fm: Record<string, any> = { clicks: 5 };
    injectCaptionsIntoSlide("# Slide", fm, ["A", "B", "C"]);
    expect(fm.clicks).toBe(5);
  });

  it("updates clicks when required exceeds existing", () => {
    const fm: Record<string, any> = { clicks: 1 };
    injectCaptionsIntoSlide("# Slide", fm, ["A", "B", "C", "D"]);
    expect(fm.clicks).toBe(3);
  });

  it("preserves original content before caption block", () => {
    const fm: Record<string, any> = {};
    const content = "# My Slide\n\nSome content here";
    const result = injectCaptionsIntoSlide(content, fm, ["Caption text"]);
    expect(result.startsWith(content)).toBe(true);
  });

  it("escapes ampersand and single quotes", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, ["Tom & Jerry's show"]);
    expect(result).toContain("Tom &amp; Jerry&#39;s show");
  });
});
