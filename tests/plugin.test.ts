import { createSubtitlePreparserExtensions } from "../src/plugin";

describe("createSubtitlePreparserExtensions", () => {
  it("returns empty array when mode is not in enabledModes", () => {
    const result = createSubtitlePreparserExtensions({ mode: "dev" }, { enabledModes: ["export"] });
    expect(result).toEqual([]);
  });

  it("returns two extensions when mode matches", () => {
    const result = createSubtitlePreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"] },
    );
    expect(result).toHaveLength(2);
    expect(result[0].transformNote).toBeDefined();
    expect(result[1].transformSlide).toBeDefined();
  });

  it("transformNote stores chunks under storageKey", () => {
    const [noteExt] = createSubtitlePreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"], storageKey: "__subtitles" },
    );
    const fm: Record<string, any> = {};
    noteExt.transformNote!("First subtitle line\nSecond subtitle line", fm);
    expect(fm.__subtitles).toEqual([["First subtitle line", "Second subtitle line"]]);
  });

  it("transformNote with stripNotesOnExport returns empty string", () => {
    const [noteExt] = createSubtitlePreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"], stripNotesOnExport: true },
    );
    const fm: Record<string, any> = {};
    const result = noteExt.transformNote!("Some note content here", fm);
    expect(result).toBe("");
  });

  it("transformNote without strip returns original note", () => {
    const [noteExt] = createSubtitlePreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"], stripNotesOnExport: false },
    );
    const fm: Record<string, any> = {};
    const note = "Some note content here";
    const result = noteExt.transformNote!(note, fm);
    expect(result).toBe(note);
  });

  it("transformSlide injects subtitles and cleans up storageKey", () => {
    const [, slideExt] = createSubtitlePreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"], storageKey: "__subtitles" },
    );
    const fm: Record<string, any> = {
      __subtitles: [["First subtitle text", "Second subtitle text"]],
    };
    const result = slideExt.transformSlide!("# Slide content", fm);
    expect(result).toContain("pdf-subtitle");
    expect(result).toContain("First subtitle text");
    expect(result).toContain("Second subtitle text");
    expect(fm.__subtitles).toBeUndefined();
  });

  it("transformSlide with no stored chunks returns content unchanged", () => {
    const [, slideExt] = createSubtitlePreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"] },
    );
    const fm: Record<string, any> = {};
    const result = slideExt.transformSlide!("# Slide content", fm);
    expect(result).toBe("# Slide content");
  });

  it("end-to-end: transformNote then transformSlide produces correct output", () => {
    const [noteExt, slideExt] = createSubtitlePreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"] },
    );
    const fm: Record<string, any> = {};
    const note = "First subtitle line\n[click]\nSecond subtitle line\n[click]\nThird subtitle line";

    noteExt.transformNote!(note, fm);
    const result = slideExt.transformSlide!("# My Slide", fm);

    expect(result).toContain("# My Slide");
    expect(result).toContain('v-if="$clicks === 0"');
    expect(result).toContain('v-else-if="$clicks === 1"');
    expect(result).toContain("v-else");
    expect(result).toContain("First subtitle line");
    expect(result).toContain("Second subtitle line");
    expect(result).toContain("Third subtitle line");
    expect(fm.clicks).toBe(2);
    expect(fm.__subtitles).toBeUndefined();
  });
});
