# API Reference

## `createSubtitlePreparserExtensions`

Main entry point. Creates Slidev preparser extensions that transform speaker notes into click-synchronized subtitles.

```typescript
function createSubtitlePreparserExtensions(
  ctx: { mode: string },
  options?: Partial<SubtitleOptions>,
): PreparserExtension[];
```

**Parameters:**

- `ctx.mode` — The Slidev mode (`"dev"`, `"build"`, or `"export"`)
- `options` — Optional configuration overrides (merged with `defaultOptions`)

**Returns:** An array of preparser extensions to pass to `definePreparserSetup`.

## `SubtitleOptions`

Configuration interface for subtitle behavior.

```typescript
interface SubtitleOptions {
  enabledModes: ("dev" | "build" | "export")[];
  preferManualLineBreaks: boolean;
  respectClickMarkers: boolean;
  maxCharsPerLine: number;
  maxChunksPerSlide: number;
  minCharsPerChunk: number;
  stripNotesOnExport: boolean;
  storageKey: string;
}
```

| Option                   | Type       | Default         | Description                                                  |
| ------------------------ | ---------- | --------------- | ------------------------------------------------------------ |
| `enabledModes`           | `string[]` | `["export"]`    | Slidev modes where subtitles are active                      |
| `preferManualLineBreaks` | `boolean`  | `true`          | Split notes on newlines                                      |
| `respectClickMarkers`    | `boolean`  | `true`          | Split notes on `[click]` markers                             |
| `maxCharsPerLine`        | `number`   | `80`            | Maximum characters per subtitle line                         |
| `maxChunksPerSlide`      | `number`   | `Infinity`      | Maximum subtitle chunks per slide                            |
| `minCharsPerChunk`       | `number`   | `10`            | Minimum characters before merging short chunks               |
| `stripNotesOnExport`     | `boolean`  | `false`         | Remove speaker notes from exported output                    |
| `storageKey`             | `string`   | `"__subtitles"` | Internal frontmatter key for passing data between transforms |

## `defaultOptions`

The default `SubtitleOptions` object, exported for convenience.

```typescript
const defaultOptions: SubtitleOptions;
```

## `chunkNoteToSubtitles`

Lower-level function that splits a speaker note string into subtitle chunks.

```typescript
function chunkNoteToSubtitles(
  note: string | undefined,
  options?: Partial<SubtitleOptions>,
): string[];
```

**Parameters:**

- `note` — The raw speaker note text
- `options` — Optional configuration overrides

**Returns:** An array of subtitle strings.

**Processing steps:**

1. Split by `[click]` markers (if `respectClickMarkers` is enabled)
2. Split by newlines (if `preferManualLineBreaks` is enabled)
3. Wrap lines exceeding `maxCharsPerLine`
4. Merge chunks shorter than `minCharsPerChunk`
5. Truncate to `maxChunksPerSlide`

## `injectSubtitlesIntoSlide`

Lower-level function that injects subtitle HTML into slide content.

```typescript
function injectSubtitlesIntoSlide(
  content: string,
  frontmatter: Record<string, any>,
  subtitles: string[],
): string;
```

**Parameters:**

- `content` — The slide markdown content
- `frontmatter` — The slide frontmatter object (may be mutated to set `clicks`)
- `subtitles` — Array of subtitle strings to inject

**Returns:** The modified slide content with subtitle `<div>` elements appended.

For a single subtitle, a static `<div>` is rendered. For multiple subtitles, Vue `v-if`/`v-else-if`/`v-else` directives are used to synchronize with `$clicks`.
