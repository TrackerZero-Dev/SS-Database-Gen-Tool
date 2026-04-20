const fs = require('fs');
const path = require('path');
const { loadCustomNames, formatName } = require('../core/utils.js');

/**
 * Extracts and formats character data into an O(1) nested dictionary.
 * @param {Object} sourceData - The decrypted source JSON data.
 * @param {string} outputDir - The directory to save the output file.
 * @returns {Object} Metadata for the extraction.
 */
function run(sourceData, outputDir, version = "1.0.0") {
    console.log(`  [Characters] Running extractor...`);
    const customNames = loadCustomNames('characters');
    
    // Safely parse raw data, checking if it's nested under 'characters' or if it's the root object.
    const rawItems = sourceData?.characters ?? sourceData ?? {};
    
    // Filter out potential non-object keys and sort for consistent output
    const sortedKeys = Object.keys(rawItems).filter(k => typeof rawItems[k] === 'object').sort();
    
    const transformed = { characters: {} };
    let count = 0;
    let totalOutfits = 0;

    for (const key of sortedKeys) {
        const rawData = rawItems[key];
        const charId = rawData.id ?? key;
        const charName = formatName(charId, customNames);
        
        // Transform the outfits field into an O(1) dictionary
        const transformedOutfits = {};
        const rawOutfits = rawData.outfits ?? [];
        
        let outfitArray = [];
        if (Array.isArray(rawOutfits)) {
            outfitArray = rawOutfits;
        } else if (typeof rawOutfits === 'object') {
            outfitArray = Object.keys(rawOutfits);
        }

        for (const outfit of outfitArray) {
            const outfitId = typeof outfit === 'object' ? (outfit.id ?? 'default') : outfit;
            transformedOutfits[outfitId] = {
                id: outfitId,
                name: formatName(outfitId, customNames)
            };
            totalOutfits++;
        }

        // Ensure every character has at least a default outfit if empty
        if (Object.keys(transformedOutfits).length === 0) {
            transformedOutfits["default"] = { id: "default", name: "Default" };
            totalOutfits++;
        }

        // Construct the final normalized object
        transformed.characters[charId] = {
            id: charId,
            name: charName,
            outfits: transformedOutfits
        };
        count++;
    }

    const outputPath = path.join(outputDir, 'characters_db.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
    
    console.log(`  [Characters] Extracted ${count} characters and ${totalOutfits} outfits to characters_db.json`);
    
    // Return generation metadata (to be consumed by Phase 4)
    return {
        version: version,
        generatedAt: new Date().toISOString(),
        count: count
    };
}

module.exports = { run };
