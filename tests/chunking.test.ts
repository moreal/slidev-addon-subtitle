import { parseNoteToSubtitleTimeline } from "../src/chunking";

describe("parseNoteToSubtitleTimeline", () => {
  it("returns empty array for undefined", () => {
    expect(parseNoteToSubtitleTimeline(undefined)).toEqual([]);
  });

  it("returns empty array for empty text", () => {
    expect(parseNoteToSubtitleTimeline("   \n  ")).toEqual([]);
  });

  it("splits by sentence delimiters and newlines", () => {
    const note = "첫 문장입니다. 둘째 문장입니다!\n셋째 문장입니다?";
    expect(parseNoteToSubtitleTimeline(note)).toEqual([
      { start: 0, text: "첫 문장입니다." },
      { start: 1, text: "둘째 문장입니다!" },
      { start: 2, text: "셋째 문장입니다?" },
    ]);
  });

  it("keeps decimal numbers in one sentence", () => {
    const note = "점수는 3.14입니다. 다음 문장입니다.";
    expect(parseNoteToSubtitleTimeline(note)).toEqual([
      { start: 0, text: "점수는 3.14입니다." },
      { start: 1, text: "다음 문장입니다." },
    ]);
  });

  it("supports line chunk mode", () => {
    const note = "첫 줄\n둘째 줄\n셋째 줄";
    expect(parseNoteToSubtitleTimeline(note, { chunkMode: "line" })).toEqual([
      { start: 0, text: "첫 줄" },
      { start: 1, text: "둘째 줄" },
      { start: 2, text: "셋째 줄" },
    ]);
  });

  it("advances starts when [click] markers are present", () => {
    const note = "첫 문장입니다.\n[click]\n둘째 문장입니다.";
    expect(parseNoteToSubtitleTimeline(note)).toEqual([
      { start: 0, text: "첫 문장입니다." },
      { start: 1, text: "둘째 문장입니다." },
    ]);
  });

  it("applies explicit [click:n] starts", () => {
    const note = "첫 문장입니다.\n[click:3]\n둘째 문장입니다.";
    expect(parseNoteToSubtitleTimeline(note)).toEqual([
      { start: 0, text: "첫 문장입니다." },
      { start: 3, text: "둘째 문장입니다." },
    ]);
  });

  it("supports markers before first subtitle", () => {
    const note = "[click:2]\n첫 문장입니다.";
    expect(parseNoteToSubtitleTimeline(note)).toEqual([{ start: 2, text: "첫 문장입니다." }]);
  });

  it("normalizes invalid or overlapping starts to monotonic order", () => {
    const note = "첫 문장입니다.\n[click:1]\n둘째 문장입니다.\n[click:1]\n셋째 문장입니다.";
    expect(parseNoteToSubtitleTimeline(note)).toEqual([
      { start: 0, text: "첫 문장입니다." },
      { start: 1, text: "둘째 문장입니다." },
      { start: 2, text: "셋째 문장입니다." },
    ]);
  });

  it("supports custom sentence delimiters", () => {
    const note = "alpha; beta; gamma";
    expect(parseNoteToSubtitleTimeline(note, { sentenceDelimiters: [";", "\n"] })).toEqual([
      { start: 0, text: "alpha;" },
      { start: 1, text: "beta;" },
      { start: 2, text: "gamma" },
    ]);
  });

  it("keeps explicit click offsets when a marker appears between multiline groups", () => {
    const note = "첫 줄\n둘째 줄\n셋째 줄\n[click]\n넷째 줄\n다섯째 줄";
    expect(parseNoteToSubtitleTimeline(note, { chunkMode: "line" })).toEqual([
      { start: 0, text: "첫 줄" },
      { start: 1, text: "둘째 줄" },
      { start: 2, text: "셋째 줄" },
      { start: 3, text: "넷째 줄" },
      { start: 4, text: "다섯째 줄" },
    ]);
  });

  it("wraps by word units using display width", () => {
    const note = "hello 안녕 world 테스트";
    expect(parseNoteToSubtitleTimeline(note, { chunkMode: "line", maxDisplayWidth: 10 })).toEqual([
      { start: 0, text: "hello" },
      { start: 1, text: "안녕 world" },
      { start: 2, text: "테스트" },
    ]);
  });

  it("does not split a single long word even when it exceeds maxDisplayWidth", () => {
    const note = "supercalifragilistic";
    expect(parseNoteToSubtitleTimeline(note, { chunkMode: "line", maxDisplayWidth: 5 })).toEqual([
      { start: 0, text: "supercalifragilistic" },
    ]);
  });

  it("avoids tiny trailing tail chunks when a small overflow creates better balance", () => {
    const note = "aaaaaaaaaaaaaaa bbbbbbbbbbbbbbb ccccccccccccccc 요";
    expect(parseNoteToSubtitleTimeline(note, { chunkMode: "line", maxDisplayWidth: 16 })).toEqual([
      { start: 0, text: "aaaaaaaaaaaaaaa" },
      { start: 1, text: "bbbbbbbbbbbbbbb" },
      { start: 2, text: "ccccccccccccccc 요" },
    ]);
  });
});
