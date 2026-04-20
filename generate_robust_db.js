const fs = require('fs');
const path = require('path');

// Import core modules
const { decryptFile } = require('./core/crypto.js');

// Import extractors
const extractors = {
    characters: require('./extractors/characters.js'),
    boards: require('./extractors/boards.js'),
    frames: require('./extractors/frames.js'),
    portraits: require('./extractors/portraits.js'),
    achievements: require('./extractors/achievements.js'),
    cities: require('./extractors/cities.js')
};

// --- CONFIGURATION TOGGLES ---
const DB_VERSION = "1.0.0";
const TOGGLES = {
    characters: true,
    boards: true,
    frames: true,
    portraits: true,
    achievements: true,
    cities: true
};

// --- DIRECTORIES ---
const DIRS = {
    encrypted: path.join(__dirname, 'database', 'encrypted'),
    decrypted: path.join(__dirname, 'database', 'decrypted'),
    out: path.join(__dirname, 'out')
};

// Ensure directories exist
Object.values(DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

console.log('=========================================');
console.log('   Robust DB Generator (Black Box Mode)  ');
console.log('=========================================\n');

try {
    // 1. Process Encrypted Files
    const encryptedFiles = fs.readdirSync(DIRS.encrypted).filter(f => f.endsWith('.json') || f.endsWith('.bin'));
    for (const file of encryptedFiles) {
        const inPath = path.join(DIRS.encrypted, file);
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const outPath = path.join(DIRS.decrypted, `${baseName}_dec.json`);
        console.log(`[System] Decrypting ${file}...`);
        const decryptedData = decryptFile(inPath);
        fs.writeFileSync(outPath, JSON.stringify(decryptedData, null, 2), 'utf-8');
    }

    // 2. Load Decrypted Data
    const decryptedFiles = fs.readdirSync(DIRS.decrypted).filter(f => f.endsWith('.json'));
    if (decryptedFiles.length === 0) {
        console.error('[System] No data files found in database/decrypted/ or database/encrypted/.');
        console.error('         Please place your raw game data file there and run again.');
        process.exit(1);
    }

    // Merge all decrypted files into one sourceData object
    let sourceData = {};
    for (const file of decryptedFiles) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(DIRS.decrypted, file), 'utf-8'));
            sourceData = { ...sourceData, ...data };
        } catch (e) {
            console.error(`[System] Failed to parse ${file}: ${e.message}`);
        }
    }

    // 3. Run Extractors (Black Box)
    const metadata = {};
    console.log('\n[System] Running Extractors...');

    for (const [name, extractor] of Object.entries(extractors)) {
        if (!TOGGLES[name]) {
            console.log(`  [${name}] Skipped (Disabled in toggles)`);
            continue;
        }

        try {
            metadata[name] = extractor.run(sourceData, DIRS.out, DB_VERSION);
        } catch (err) {
            console.error(`  [${name}] X FAILED: ${err.message}`);
            // Black box: failure doesn't affect others
        }
    }

    // 4. Generate Unified Metadata
    if (Object.keys(metadata).length > 0) {
        const unifiedMetadata = { databases: {} };
        const timestamp = new Date().toISOString();
        
        for (const [key, extMeta] of Object.entries(metadata)) {
            // Map the extractor metadata to the exact format needed by the app
            unifiedMetadata.databases[`${key}_db`] = {
                version: "3.61.1",
                updatedAt: timestamp
            };
        }

        const metadataPath = path.join(DIRS.out, 'metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(unifiedMetadata, null, 2), 'utf-8');
        console.log(`\n[System] Unified metadata.json generated at ${metadataPath}`);
    }

    console.log('\n[System] Database generation complete!');

} catch (error) {
    console.error('\n[System] Fatal Error:', error);
    process.exit(1);
}
