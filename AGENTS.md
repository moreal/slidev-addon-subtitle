# Agent Instructions

## Git

- Do NOT use `git -C <path>` option. Run git commands from the working directory directly.
- Use clear, descriptive commit messages written as plain sentences.
- Do NOT use Conventional Commit or prefix-style commit messages (for example: `fix: ...`, `feat: ...`, `chore: ...`).

## Bazel

- Use Bazel through Bazelisk.
- Install tools from `mise.toml` in the repository root: `mise install`.
- If this repository is untrusted in `mise`, trust it once: `mise trust`.
- Always execute Bazel commands as `mise x -- bazelisk <command>`.
  - Example: `mise x -- bazelisk build //:ci_all`
  - Example: `mise x -- bazelisk build //docs:site_archive`
- Keep the Bazel version pinned in `.bazelversion`.
