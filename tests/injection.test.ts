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
    const result = injectCaptionsIntoSlide("# Slide", fm, [["Hello world"]]);
    expect(result).toContain('<div class="pdf-caption">');
    expect(result).toContain("<div>Hello world</div>");
    expect(result).not.toContain("v-if");
    expect(fm.clicks).toBeUndefined();
  });

  it("renders two captions with v-if and v-else, sets clicks to 1", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, [["First caption", "Second caption"]]);
    expect(result).toContain('v-if="$clicks === 0"');
    expect(result).toContain("v-else");
    expect(result).not.toContain("v-else-if");
    expect(fm.clicks).toBe(1);
  });

  it("renders three captions with v-if, v-else-if, and v-else, sets clicks to 2", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, [
      ["First caption", "Second caption", "Third caption"],
    ]);
    expect(result).toContain('v-if="$clicks === 0"');
    expect(result).toContain('v-else-if="$clicks === 1"');
    expect(result).toContain("v-else");
    expect(fm.clicks).toBe(2);
  });

  it("escapes HTML characters in captions", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, [['<script>alert("xss")</script>']]);
    expect(result).toContain("&lt;script&gt;");
    expect(result).toContain("&quot;xss&quot;");
    expect(result).not.toContain("<script>");
  });

  it("preserves existing clicks when higher than required", () => {
    const fm: Record<string, any> = { clicks: 5 };
    injectCaptionsIntoSlide("# Slide", fm, [["A", "B", "C"]]);
    expect(fm.clicks).toBe(5);
  });

  it("updates clicks when required exceeds existing", () => {
    const fm: Record<string, any> = { clicks: 1 };
    injectCaptionsIntoSlide("# Slide", fm, [["A", "B", "C", "D"]]);
    expect(fm.clicks).toBe(3);
  });

  it("preserves original content before caption block", () => {
    const fm: Record<string, any> = {};
    const content = "# My Slide\n\nSome content here";
    const result = injectCaptionsIntoSlide(content, fm, [["Caption text"]]);
    expect(result.startsWith(content)).toBe(true);
  });

  it("escapes ampersand and single quotes", () => {
    const fm: Record<string, any> = {};
    const result = injectCaptionsIntoSlide("# Slide", fm, [["Tom & Jerry's show"]]);
    expect(result).toContain("Tom &amp; Jerry&#39;s show");
  });

  describe("multi-group injection", () => {
    it("flattens multi-group captions into per-line click states", () => {
      const fm: Record<string, any> = {};
      const result = injectCaptionsIntoSlide("# Slide", fm, [
        ["Line A1", "Line A2"],
        ["Line B1", "Line B2"],
      ]);
      expect(result).toContain('v-if="$clicks === 0">Line A1</div>');
      expect(result).toContain('v-else-if="$clicks === 1">Line A2</div>');
      expect(result).toContain('v-else-if="$clicks === 2">Line B1</div>');
      expect(result).toContain("v-else>Line B2</div>");
      expect(fm.clicks).toBe(3);
    });

    it("offsets v-click elements to align with group boundaries", () => {
      const fm: Record<string, any> = {};
      const content = "# Slide\n<v-click>\n- Item 1\n</v-click>";
      const result = injectCaptionsIntoSlide(content, fm, [
        ["A1", "A2", "A3"],
        ["B1", "B2", "B3"],
      ]);
      expect(result).toContain('<v-click at="3">');
      expect(fm.clicks).toBe(5);
    });

    it("offsets multiple v-click elements", () => {
      const fm: Record<string, any> = {};
      const content = "# Slide\n<v-click>\n- Item 1\n</v-click>\n<v-click>\n- Item 2\n</v-click>";
      const result = injectCaptionsIntoSlide(content, fm, [
        ["A1", "A2", "A3"],
        ["B1", "B2", "B3"],
        ["C1", "C2", "C3"],
      ]);
      expect(result).toContain('<v-click at="3">');
      expect(result).toContain('<v-click at="6">');
      expect(fm.clicks).toBe(8);
    });

    it("sets clicks based on total lines, not group count", () => {
      const fm: Record<string, any> = {};
      injectCaptionsIntoSlide("# Slide", fm, [
        ["A1", "A2", "A3"],
        ["B1", "B2", "B3"],
        ["C1", "C2", "C3"],
      ]);
      expect(fm.clicks).toBe(8);
    });

    it("preserves existing clicks when higher than total lines", () => {
      const fm: Record<string, any> = { clicks: 15 };
      injectCaptionsIntoSlide("# Slide", fm, [["A"], ["B"], ["C"]]);
      expect(fm.clicks).toBe(15);
    });

    it("skips v-click elements that already have at attribute", () => {
      const fm: Record<string, any> = {};
      const content = '<v-click at="5">\n- Item\n</v-click>';
      const result = injectCaptionsIntoSlide(content, fm, [
        ["A1", "A2"],
        ["B1", "B2"],
      ]);
      expect(result).toContain('<v-click at="5">');
    });

    it("escapes HTML in multi-group captions", () => {
      const fm: Record<string, any> = {};
      const result = injectCaptionsIntoSlide("# Slide", fm, [["<b>bold</b>"], ["safe text"]]);
      expect(result).toContain("&lt;b&gt;bold&lt;/b&gt;");
      expect(result).not.toContain("<b>bold</b>");
    });
  });
});
