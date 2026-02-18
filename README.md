<p align="center">
  <img src="./assets/logo.svg" width="115" height="115" alt="slidev-addon-subtitle" />
</p>

<h1 align="center">slidev-addon-subtitle</h1>

<p align="center">
  Automatic click-synchronized subtitles for <a href="https://sli.dev">Slidev</a> presentations
</p>

<p align="center">
  <a href="https://moreal.github.io/slidev-addon-subtitle/">Documentation</a>
</p>

## Development workflow

```bash
mise trust
mise install
mise x -- bazelisk build //:ci_all
mise x -- bazelisk build //docs:site_archive
```

To build docs into `docs/.vitepress/dist` for local preview:

```bash
yarn docs:build
```

## License

[MIT](./LICENSE)
