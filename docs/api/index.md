# API Reference

## `SubtitleOptions`

```typescript
interface SubtitleOptions {
  enabledModes: ("dev" | "build" | "export")[];
  chunkMode: "sentence" | "line";
  sentenceDelimiters: string[];
  maxDisplayWidth: number;
}
```

| Option               | Type       | Default                                         | Description                                            |
| -------------------- | ---------- | ----------------------------------------------- | ------------------------------------------------------ |
| `enabledModes`       | `string[]` | `['export']`                                    | Reserved option (not currently used by built-in setup) |
| `chunkMode`          | `string`   | `'sentence'`                                    | Subtitle chunking strategy                             |
| `sentenceDelimiters` | `string[]` | `['.', '!', '?', '。', '！', '？', '…', '\\n']` | Delimiters used when `chunkMode=sentence`              |
| `maxDisplayWidth`    | `number`   | `80`                                            | Word-based wrapping width (`fullwidth=2`)              |

## `SubtitleEntry`

```typescript
interface SubtitleEntry {
  start: number;
  text: string;
}
```

- `start`: click index where this subtitle becomes active
- `text`: subtitle text

## `defaultOptions`

```typescript
const defaultOptions: SubtitleOptions;
```

## `parseNoteToSubtitleTimeline`

```typescript
function parseNoteToSubtitleTimeline(
  note: string | undefined,
  options?: Partial<SubtitleOptions>,
): SubtitleEntry[];
```

Converts a note string into a click-driven subtitle timeline.

Parsing rules:

1. Normalize CRLF to LF and trim
2. Handle `[click]` and `[click:n]` markers
3. Split text by `chunkMode`
4. Wrap long chunks by word units using display width (`fullwidth=2`, combining marks=`0`)
5. Optimize wrapping for balanced chunk sizes
6. Avoid tiny trailing one-word chunks when a small overflow merge is better
7. Keep starts monotonic when marker values overlap or go backward

## Built-in Setup Behavior

The packaged Slidev setup currently injects subtitles only in `export` mode:

- `setup/main.ts` registers `SubtitleDisplay`
- `setup/transformers.ts` prepends `<SubtitleDisplay />` only when the slide has a note and mode is `export`
