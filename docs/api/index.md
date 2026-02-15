# API Reference

## `createCaptionPreparserExtensions`

Main entry point. Creates Slidev preparser extensions that transform speaker notes into click-synchronized captions.

```typescript
function createCaptionPreparserExtensions(
  ctx: { mode: string },
  options?: Partial<CaptionOptions>,
): PreparserExtension[];
```

**Parameters:**

- `ctx.mode` — The Slidev mode (`"dev"`, `"build"`, or `"export"`)
- `options` — Optional configuration overrides (merged with `defaultOptions`)

**Returns:** An array of preparser extensions to pass to `definePreparserSetup`.

## `CaptionOptions`

Configuration interface for caption behavior.

```typescript
interface CaptionOptions {
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

| Option                   | Type       | Default        | Description                                                  |
| ------------------------ | ---------- | -------------- | ------------------------------------------------------------ |
| `enabledModes`           | `string[]` | `["export"]`   | Slidev modes where captions are active                       |
| `preferManualLineBreaks` | `boolean`  | `true`         | Split notes on newlines                                      |
| `respectClickMarkers`    | `boolean`  | `true`         | Split notes on `[click]` markers                             |
| `maxCharsPerLine`        | `number`   | `80`           | Maximum characters per caption line                          |
| `maxChunksPerSlide`      | `number`   | `Infinity`     | Maximum caption chunks per slide                             |
| `minCharsPerChunk`       | `number`   | `10`           | Minimum characters before merging short chunks               |
| `stripNotesOnExport`     | `boolean`  | `false`        | Remove speaker notes from exported output                    |
| `storageKey`             | `string`   | `"__captions"` | Internal frontmatter key for passing data between transforms |

## `defaultOptions`

The default `CaptionOptions` object, exported for convenience.

```typescript
const defaultOptions: CaptionOptions;
```

## `chunkNoteToCaptions`

Lower-level function that splits a speaker note string into caption chunks.

```typescript
function chunkNoteToCaptions(note: string | undefined, options?: Partial<CaptionOptions>): string[];
```

**Parameters:**

- `note` — The raw speaker note text
- `options` — Optional configuration overrides

**Returns:** An array of caption strings.

**Processing steps:**

1. Split by `[click]` markers (if `respectClickMarkers` is enabled)
2. Split by newlines (if `preferManualLineBreaks` is enabled)
3. Wrap lines exceeding `maxCharsPerLine`
4. Merge chunks shorter than `minCharsPerChunk`
5. Truncate to `maxChunksPerSlide`

## `injectCaptionsIntoSlide`

Lower-level function that injects caption HTML into slide content.

```typescript
function injectCaptionsIntoSlide(
  content: string,
  frontmatter: Record<string, any>,
  captions: string[],
): string;
```

**Parameters:**

- `content` — The slide markdown content
- `frontmatter` — The slide frontmatter object (may be mutated to set `clicks`)
- `captions` — Array of caption strings to inject

**Returns:** The modified slide content with caption `<div>` elements appended.

For a single caption, a static `<div>` is rendered. For multiple captions, Vue `v-if`/`v-else-if`/`v-else` directives are used to synchronize with `$clicks`.
