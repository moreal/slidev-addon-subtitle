import transformersSetup from "../setup/transformers";

async function transform(
  content: string,
  mode: "dev" | "build" | "export",
  note?: string,
): Promise<string> {
  const setup = await transformersSetup();
  const transformer = setup.pre?.find(Boolean);

  if (!transformer) {
    throw new Error("subtitle transformer not found");
  }

  let code = content;
  const s = {
    toString: () => code,
    prepend: (value: string) => {
      code = `${value}${code}`;
    },
  };

  await transformer({
    s: s as any,
    slide: { note } as any,
    options: { mode } as any,
  });

  return code;
}

describe("subtitle markdown transformer", () => {
  it("injects SubtitleDisplay in export mode when slide note exists", async () => {
    const result = await transform("# Slide\n\ncontent", "export", "발표자 노트");

    expect(result).toContain("<SubtitleDisplay />");
    expect(result).toContain("# Slide");
  });

  it("does not inject in non-export modes", async () => {
    const dev = await transform("# Slide\n\ncontent", "dev", "발표자 노트");
    const build = await transform("# Slide\n\ncontent", "build", "발표자 노트");

    expect(dev).toBe("# Slide\n\ncontent");
    expect(build).toBe("# Slide\n\ncontent");
  });

  it("does not inject when slide note is empty", async () => {
    const result = await transform("# Slide\n\ncontent", "export", "   ");

    expect(result).toBe("# Slide\n\ncontent");
  });

  it("does not inject twice", async () => {
    const result = await transform("<SubtitleDisplay />\n\n# Slide", "export", "발표자 노트");

    expect(result).toBe("<SubtitleDisplay />\n\n# Slide");
  });
});
