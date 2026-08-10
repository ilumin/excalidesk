# Desktop package size

Measured 2026-08-10 · excalidesk 0.0.1 · channel `stable` · macOS arm64 (Apple M2) · Electrobun 1.18.1 · CEF 147.0.10 · Bun 1.3.13

## What we ship

| Artifact | Size |
| --- | --- |
| `stable-macos-arm64-excalidesk.dmg` | **126 MB** |
| `stable-macos-arm64-excalidesk.app.tar.zst` (update archive) | 123 MB |

The `.app` inside the DMG is a self-extractor, not the real app. It carries the
123 MB `.tar.zst` in its `Resources/` and unpacks itself in place on first run.

## What lands on disk

| Component | Size |
| --- | --- |
| **`excalidesk.app` installed** | **393 MB** |
| ↳ `Contents/Frameworks` | 310 MB |
| &nbsp;&nbsp;↳ Chromium Embedded Framework | 305 MB |
| &nbsp;&nbsp;↳ 5 × `bun Helper*.app` | 5 MB |
| ↳ `Contents/MacOS` (Bun runtime 63 MB + launcher, bspatch, zig-zstd) | 63 MB |
| ↳ `Contents/Resources` (our code; `apps/web/dist` is 8.5 MB of it) | 20 MB |

Roughly 3× the download, because the tar is 405 MB uncompressed and zstd
level 19 squeezes it to 123 MB.

For reference, Electron apps on the same machine: Notion 284 MB (arm64),
Obsidian 441 MB, Claude 795 MB, VS Code 1.5 GB. We are larger than an arm64
Electron app because Electrobun ships CEF (305 MB) and the Bun runtime (63 MB)
as two separate payloads, where Electron merges Chromium and Node into one
framework.

## First launch is slow, and it is not the decompressor

First run of the built app logged:

```
Time taken to decompress: 26320617000 ns   (26.3 s)
Time taken to untar:       1788793000 ns   ( 1.8 s)
```

Running the bundled `zig-zstd` by hand on the same archive afterwards:

| Run | Time |
| --- | --- |
| `zig-zstd decompress` (405 MB out) | 0.68 s |
| Homebrew `zstd -d`, same file | 0.68 s |
| `zig-zstd decompress` writing to `~/Library/Application Support` | 0.51 s |

So the 26 s was not compression work — it is one-time macOS overhead on first
launch: Gatekeeper / XProtect scanning a brand-new 393 MB adhoc-signed bundle,
plus a cold read of the 123 MB archive. Not reproducible once everything is
scanned and cached. Second launch onwards: about 3 s.

`build.mac.codesign` and `build.mac.notarize` are both still `false` in
[`electrobun.config.ts`](../apps/desktop/electrobun.config.ts) — signing and
notarizing is what actually removes the Gatekeeper delay, and is required
before anyone else can open the DMG at all.

## Housekeeping

Self-extraction leaves the intermediate tar behind and never deletes it:

```
~/Library/Application Support/dev.bettertstack.excalidesk.desktop/<channel>/self-extraction/*.tar   # 405 MB
```

Safe to delete after the app has unpacked itself — verified the app still
launches with it gone.

## Reproducing these numbers

```sh
bun run build:desktop
du -sh apps/desktop/artifacts/*
du -sh apps/desktop/build/stable-macos-arm64/excalidesk.app
du -sh apps/desktop/build/stable-macos-arm64/excalidesk.app/Contents/*
```
