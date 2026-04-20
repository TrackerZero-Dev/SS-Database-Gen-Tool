const fs = require('fs');
const path = require('path');
const { loadCustomNames, formatName } = require('../core/utils.js');

/**
 * Extracts and formats portrait data into an O(1) nested dictionary.
 * @param {Object} sourceData - The decrypted source JSON data.
 * @param {string} outputDir - The directory to save the output file.
 * @returns {Object} Metadata for the extraction.
 */
function run(sourceData, outputDir, version = "1.0.0") {
    console.log(`  [Portraits] Running extractor...`);
    const customNames = loadCustomNames('portraits');
    
    // Safely parse raw data, checking if it's nested under 'profilePortraits' or 'portraits'
    const rawItems = sourceData?.profilePortraits ?? sourceData?.portraits ?? {};
    
    // Sort keys for consistent output
    const sortedKeys = Object.keys(rawItems).sort();
    
    const transformed = { portraits: {} };
    let count = 0;

    for (const key of sortedKeys) {
        const portraitId = key;
        
        transformed.portraits[portraitId] = {
            id: portraitId,
            name: formatName(portraitId, customNames)
        };
        count++;
    }

    const outputPath = path.join(outputDir, 'portraits_db.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
    
    console.log(`  [Portraits] Extracted ${count} portraits to portraits_db.json`);
    
    // Return generation metadata (to be consumed by Phase 4)
    return {
        version: version,
        generatedAt: new Date().toISOString(),
        count: count
    };
}

module.exports = { run };
