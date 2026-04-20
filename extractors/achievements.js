const fs = require('fs');
const path = require('path');
const { loadCustomNames, formatName } = require('../core/utils.js');

/**
 * Extracts and formats achievement data into an O(1) nested dictionary.
 * @param {Object} sourceData - The decrypted source JSON data.
 * @param {string} outputDir - The directory to save the output file.
 * @param {string} version - Version string passed from config
 * @returns {Object} Metadata for the extraction.
 */
function run(sourceData, outputDir, version = "1.0.0") {
    console.log(`  [Achievements] Running extractor...`);
    const customNames = loadCustomNames('achievements');
    
    // Safely parse raw data
    const rawItems = sourceData?.achievementData ?? sourceData?.achievements ?? sourceData?.missions ?? {};
    
    // Filter out potential non-object keys and sort for consistent output
    const sortedKeys = Object.keys(rawItems).filter(k => typeof rawItems[k] === 'object').sort();
    
    const transformed = { achievements: {} };
    let count = 0;

    for (const key of sortedKeys) {
        const rawData = rawItems[key];
        const achievementId = rawData.id ?? key;
        let achievementName = formatName(achievementId, customNames);
        
        if (rawData.objective && typeof rawData.objective.title === 'string') {
            const match = rawData.objective.title.match(/([^.]+)\.title$/);
            if (match && match[1]) {
                achievementName = formatName(match[1], customNames);
            }
        }
        
        // Extract tierGoals since app relies on it
        const tierGoals = rawData.tierGoals ?? [];

        // Construct the final normalized object
        transformed.achievements[achievementId] = {
            id: achievementId,
            name: achievementName,
            tierGoals
        };

        count++;
    }

    const outputPath = path.join(outputDir, 'achievements_db.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
    
    console.log(`  [Achievements] Extracted ${count} achievements to achievements_db.json`);
    
    // Return generation metadata (to be consumed by Phase 4)
    return {
        version: version,
        generatedAt: new Date().toISOString(),
        count: count
    };
}

module.exports = { run };
