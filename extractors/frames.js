const fs = require('fs');
const path = require('path');
const { loadCustomNames, formatName } = require('../core/utils.js');

/**
 * Extracts and formats frame data into an O(1) nested dictionary.
 * @param {Object} sourceData - The decrypted source JSON data.
 * @param {string} outputDir - The directory to save the output file.
 * @returns {Object} Metadata for the extraction.
 */
function run(sourceData, outputDir, version = "1.0.0") {
    console.log(`  [Frames] Running extractor...`);
    const customNames = loadCustomNames('frames');
    
    // Safely parse raw data, checking if it's nested under 'profileFrames' or 'frames'
    const rawItems = sourceData?.profileFrames ?? sourceData?.frames ?? {};
    
    // Sort keys for consistent output
    const sortedKeys = Object.keys(rawItems).sort();
    
    const transformed = { frames: {} };
    let count = 0;

    for (const key of sortedKeys) {
        const frameId = key;
        
        transformed.frames[frameId] = {
            id: frameId,
            name: formatName(frameId, customNames)
        };
        count++;
    }

    const outputPath = path.join(outputDir, 'frames_db.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
    
    console.log(`  [Frames] Extracted ${count} frames to frames_db.json`);
    
    // Return generation metadata (to be consumed by Phase 4)
    return {
        version: version,
        generatedAt: new Date().toISOString(),
        count: count
    };
}

module.exports = { run };
