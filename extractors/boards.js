const fs = require('fs');
const path = require('path');
const { loadCustomNames, formatName } = require('../core/utils.js');

/**
 * Extracts and formats board data into an O(1) nested dictionary.
 * @param {Object} sourceData - The decrypted source JSON data.
 * @param {string} outputDir - The directory to save the output file.
 * @returns {Object} Metadata for the extraction.
 */
function run(sourceData, outputDir, version = "1.0.0") {
    console.log(`  [Boards] Running extractor...`);
    const customNames = loadCustomNames('boards');
    
    // Safely parse raw data, checking if it's nested under 'boards' or if it's the root object.
    const rawItems = sourceData?.boards ?? sourceData ?? {};
    
    // Filter out potential non-object keys and sort for consistent output
    const sortedKeys = Object.keys(rawItems).filter(k => typeof rawItems[k] === 'object').sort();
    
    const transformed = { boards: {} };
    let count = 0;
    let totalUpgrades = 0;

    for (const key of sortedKeys) {
        const rawData = rawItems[key];
        const boardId = rawData.id ?? key;
        const boardName = formatName(boardId, customNames);
        
        // Transform the upgrades field into an O(1) dictionary
        const transformedUpgrades = {
            "default": { id: "default", name: "Default" }
        };
        totalUpgrades++;

        const rawUpgrades = rawData.upgrades ?? [];
        
        let upgradeArray = [];
        if (Array.isArray(rawUpgrades)) {
            upgradeArray = rawUpgrades;
        } else if (typeof rawUpgrades === 'object') {
            upgradeArray = Object.keys(rawUpgrades);
        }

        for (const upgrade of upgradeArray) {
            const upgradeId = typeof upgrade === 'object' ? (upgrade.id ?? 'default') : upgrade;
            if (upgradeId !== 'default') {
                transformedUpgrades[upgradeId] = {
                    id: upgradeId,
                    name: formatName(upgradeId, customNames)
                };
                totalUpgrades++;
            }
        }

        // Construct the final normalized object
        transformed.boards[boardId] = {
            id: boardId,
            name: boardName,
            upgrades: transformedUpgrades
        };
        count++;
    }

    const outputPath = path.join(outputDir, 'boards_db.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
    
    console.log(`  [Boards] Extracted ${count} boards and ${totalUpgrades} upgrades to boards_db.json`);
    
    // Return generation metadata (to be consumed by Phase 4)
    return {
        version: version,
        generatedAt: new Date().toISOString(),
        count: count
    };
}

module.exports = { run };
