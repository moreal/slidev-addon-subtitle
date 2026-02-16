import { createCaptionPreparserExtensions } from "../src/plugin";

describe("createCaptionPreparserExtensions", () => {
  it("returns empty array when mode is not in enabledModes", () => {
    const result = createCaptionPreparserExtensions({ mode: "dev" }, { enabledModes: ["export"] });
    expect(result).toEqual([]);
  });

  it("returns two extensions when mode matches", () => {
    const result = createCaptionPreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"] },
    );
    expect(result).toHaveLength(2);
    expect(result[0].transformNote).toBeDefined();
    expect(result[1].transformSlide).toBeDefined();
  });

  it("transformNote stores chunks under storageKey", () => {
    const [noteExt] = createCaptionPreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"], storageKey: "__captions" },
    );
    const fm: Record<string, any> = {};
    noteExt.transformNote!("First caption line\nSecond caption line", fm);
    expect(fm.__captions).toEqual([["First caption line", "Second caption line"]]);
  });

  it("transformNote with stripNotesOnExport returns empty string", () => {
    const [noteExt] = createCaptionPreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"], stripNotesOnExport: true },
    );
    const fm: Record<string, any> = {};
    const result = noteExt.transformNote!("Some note content here", fm);
    expect(result).toBe("");
  });

  it("transformNote without strip returns original note", () => {
    const [noteExt] = createCaptionPreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"], stripNotesOnExport: false },
    );
    const fm: Record<string, any> = {};
    const note = "Some note content here";
    const result = noteExt.transformNote!(note, fm);
    expect(result).toBe(note);
  });

  it("transformSlide injects captions and cleans up storageKey", () => {
    const [, slideExt] = createCaptionPreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"], storageKey: "__captions" },
    );
    const fm: Record<string, any> = {
      __captions: [["First caption text", "Second caption text"]],
    };
    const result = slideExt.transformSlide!("# Slide content", fm);
    expect(result).toContain("pdf-caption");
    expect(result).toContain("First caption text");
    expect(result).toContain("Second caption text");
    expect(fm.__captions).toBeUndefined();
  });

  it("transformSlide with no stored chunks returns content unchanged", () => {
    const [, slideExt] = createCaptionPreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"] },
    );
    const fm: Record<string, any> = {};
    const result = slideExt.transformSlide!("# Slide content", fm);
    expect(result).toBe("# Slide content");
  });

  it("end-to-end: transformNote then transformSlide produces correct output", () => {
    const [noteExt, slideExt] = createCaptionPreparserExtensions(
      { mode: "export" },
      { enabledModes: ["export"] },
    );
    const fm: Record<string, any> = {};
    const note = "First caption line\n[click]\nSecond caption line\n[click]\nThird caption line";

    noteExt.transformNote!(note, fm);
    const result = slideExt.transformSlide!("# My Slide", fm);

    expect(result).toContain("# My Slide");
    expect(result).toContain('v-if="$clicks === 0"');
    expect(result).toContain('v-else-if="$clicks === 1"');
    expect(result).toContain("v-else");
    expect(result).toContain("First caption line");
    expect(result).toContain("Second caption line");
    expect(result).toContain("Third caption line");
    expect(fm.clicks).toBe(2);
    expect(fm.__captions).toBeUndefined();
  });
});
