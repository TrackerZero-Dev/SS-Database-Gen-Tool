# Subway Surfers Database Builder

A zero-dependency, standalone Node.js CLI tool for extracting, decrypting, and formatting Subway Surfers game data into highly efficient O(1) JSON databases.

## 🔗 The Ecosystem

- **Database API:** [https://subway-city-database.trackerzero.workers.dev/](https://subway-city-database.trackerzero.workers.dev/)
- **Save Editor:** [https://subway-city-save-editor.vercel.app/](https://subway-city-save-editor.vercel.app/)

---

## Features

- **Zero Dependencies**: Uses only native Node.js modules (`fs`, `path`, `crypto`). No `package.json` or `npm install` required.
- **Black Box Architecture**: Extractors run independently. If one fails, the others continue.
- **O(1) Dictionary Structure**: Converts arrays into nested objects keyed by ID for instant lookups in client applications.
- **Custom Naming**: Supports manual name overrides via split JSON files.
- **Smart Decryption**: Automatically handles AES-128-CTR encrypted game files or plain JSON files.
- **Unified Metadata**: Generates a single `metadata.json` file containing versioning and timestamps for all extracted databases.

---

## Directory Structure

- `database/encrypted/`: Place your raw, encrypted game data files here.
- `database/decrypted/`: The tool will automatically decrypt files and place them here. You can also place plain JSON files here directly.
- `out/`: The generated O(1) databases and `metadata.json` will be saved here.
- `config/custom_names/`: Contains JSON files for manual name overrides (e.g., `characters.json`, `boards.json`).

---

## Usage

1. Place your raw game data file (encrypted or plain JSON) into either `database/encrypted/` or `database/decrypted/`.
2. Run the tool:
   ```bash
   node generate_robust_db.js
   ```

---

## Configuration

You can toggle specific extractors on or off by editing the `TOGGLES` object at the top of `generate_robust_db.js`.

## Custom Names

To manually override a generated name, add an entry to the corresponding JSON file in `config/custom_names/`.
For example, in `characters.json`:

```json
{
  "darkOutfit": "Dark Outfit",
  "starOutfit": "Star Outfit"
}
```

---

## Hosting

The generated JSON files in the `out/` directory can be hosted on any static file server, CDN, or Cloudflare Worker. Client applications can fetch `metadata.json` to check for updates and then download the specific database files as needed.
