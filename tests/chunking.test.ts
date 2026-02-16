import { chunkNoteToSubtitles } from "../src/chunking";

describe("chunkNoteToSubtitles", () => {
  it("returns empty array for undefined", () => {
    expect(chunkNoteToSubtitles(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(chunkNoteToSubtitles("")).toEqual([]);
  });

  it("returns empty array for whitespace only", () => {
    expect(chunkNoteToSubtitles("   \n  \n  ")).toEqual([]);
  });

  it("returns single group with single chunk for single line", () => {
    expect(chunkNoteToSubtitles("Hello world, this is a test")).toEqual([
      ["Hello world, this is a test"],
    ]);
  });

  it("splits multi-line notes into one chunk per line within a single group", () => {
    const note = "This is the first line\nThis is the second line\nThis is the third line";
    expect(chunkNoteToSubtitles(note)).toEqual([
      ["This is the first line", "This is the second line", "This is the third line"],
    ]);
  });

  it("normalizes CRLF to LF", () => {
    const note = "This is the first line\r\nThis is the second line\r\nThis is the third line";
    expect(chunkNoteToSubtitles(note)).toEqual([
      ["This is the first line", "This is the second line", "This is the third line"],
    ]);
  });

  it("splits on [click] markers into separate groups", () => {
    const note = "Before the click marker\n[click]\nAfter the click marker";
    expect(chunkNoteToSubtitles(note)).toEqual([
      ["Before the click marker"],
      ["After the click marker"],
    ]);
  });

  it("recognizes [click:N] markers and removes them", () => {
    const note = "Part one of the note\n[click:3]\nPart two of the note";
    expect(chunkNoteToSubtitles(note)).toEqual([
      ["Part one of the note"],
      ["Part two of the note"],
    ]);
  });

  it("handles case-insensitive click markers", () => {
    const note = "Before the marker\n[CLICK]\nAfter the marker";
    expect(chunkNoteToSubtitles(note)).toEqual([["Before the marker"], ["After the marker"]]);
  });

  it("limits output with maxChunksPerSlide", () => {
    const note =
      "First long line here\nSecond long line here\nThird long line here\nFourth long line here\nFifth long line here";
    expect(chunkNoteToSubtitles(note, { maxChunksPerSlide: 3 })).toEqual([
      ["First long line here", "Second long line here", "Third long line here"],
    ]);
  });

  it("wraps long lines at word boundary", () => {
    const note =
      "This is a very long line that should be wrapped at the word boundary when it exceeds the maximum characters per line limit";
    const result = chunkNoteToSubtitles(note, { maxCharsPerLine: 50 });
    expect(result.length).toBe(1);
    for (const chunk of result[0]) {
      expect(chunk.length).toBeLessThanOrEqual(50);
    }
    expect(result[0].length).toBeGreaterThan(1);
  });

  it("merges short chunks with adjacent", () => {
    const note = "Hi\nThis is a longer line that should not be merged";
    const result = chunkNoteToSubtitles(note, { minCharsPerChunk: 10 });
    expect(result).toEqual([["Hi This is a longer line that should not be merged"]]);
  });

  it("does not split by line breaks when preferManualLineBreaks is false", () => {
    const note = "First line of the note\nSecond line of the note\nThird line of the note";
    const result = chunkNoteToSubtitles(note, {
      preferManualLineBreaks: false,
    });
    expect(result).toEqual([
      ["First line of the note\nSecond line of the note\nThird line of the note"],
    ]);
  });

  it("ignores click markers when respectClickMarkers is false", () => {
    const note = "Before the marker\n[click]\nAfter the marker";
    const result = chunkNoteToSubtitles(note, {
      respectClickMarkers: false,
      minCharsPerChunk: 0,
    });
    expect(result).toEqual([["Before the marker", "[click]", "After the marker"]]);
  });

  it("filters empty lines between content", () => {
    const note = "First line of text\n\nSecond line of text";
    expect(chunkNoteToSubtitles(note)).toEqual([["First line of text", "Second line of text"]]);
  });

  it("preserves group boundaries when [click] groups have multiple lines", () => {
    const note = [
      "Welcome to this slide.",
      "This is the opening context.",
      "Let's get started.",
      "[click]",
      "Now we move to the first topic.",
      "Here are some important details.",
      "Pay attention to this part.",
      "[click]",
      "Finally, we wrap up the discussion.",
      "Thanks for following along.",
      "See you next time.",
    ].join("\n");

    const result = chunkNoteToSubtitles(note);

    expect(result).toEqual([
      ["Welcome to this slide.", "This is the opening context.", "Let's get started."],
      [
        "Now we move to the first topic.",
        "Here are some important details.",
        "Pay attention to this part.",
      ],
      ["Finally, we wrap up the discussion.", "Thanks for following along.", "See you next time."],
    ]);
  });
});
