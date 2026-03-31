# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side web application for calculating and comparing file hashes in the browser. Users drag files into a drop zone, and the app displays file hashes in a table with visual comparison (green = matches first file, red = different).

Supported hash algorithms: SHA-1, SHA-256, SHA-384, SHA-512.

## Development

This is a static web project with no build system, package manager, or dependencies. To run locally:

```bash
# Serve src/fileshash/ directory with any static server
# Examples:
python -m http.server 8000 --directory src/fileshash/
npx serve src/fileshash/
```

Then open http://localhost:8000 in a browser.

## Architecture

- **src/fileshash/index.html** - Single-page layout with algorithm selector, drop zone and results table
- **src/fileshash/main.js** - Core logic:
  - Hash algorithm selection via dropdown (`#hash-algo`) or URL parameter (`?hash=sha-256`)
  - Drag-and-drop event handling (`drop` event on `#drop_zone`)
  - Dynamic hint text changes during drag ("释放以进行计算" on dragenter)
  - File hash calculation using Web Crypto API (`crypto.subtle.digest(algorithm, buffer)`)
  - Dynamic table header updates to show current algorithm
  - Visual comparison logic in `infoDiff()` - compares each file's hash against the first file's hash
  - **Click to toggle hash display** - Click hash cell to switch between compact and human-readable format (with spaces every 8 chars)
  - **Click to toggle size display** - Click size cell to switch between raw bytes and human-readable format (KB, MB, GB)
  - **Right-click to copy** - Right-click hash cell to copy current display format to clipboard with visual feedback
  - **Toast notifications** - Shows feedback messages (copy success, folder warnings, etc.)
  - **Auto-skip folders** - Silently skips directories and empty files, shows toast warning
- **src/fileshash/style.css** - Styling with color-coded results (`.trGreen`, `.trRed`), responsive table layout with word wrapping

## URL Parameters

- `?hash=sha-256` - Pre-select hash algorithm (case-insensitive). Supported: sha-1, sha-256, sha-384, sha-512

## Known Limitations

Files larger than 2GB cannot be hashed due to browser sandbox limitations with `FileReader.readAsArrayBuffer()`.

## User Interactions

| Action | Result |
|--------|--------|
| Drag files to drop zone | Calculate and display hashes |
| Click hash value | Toggle between compact and spaced format |
| Click file size | Toggle between bytes and human-readable |
| Right-click hash | Copy to clipboard with visual feedback |
| Change algorithm dropdown | Clear results and update URL |
