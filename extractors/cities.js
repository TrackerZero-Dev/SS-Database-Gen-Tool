const fs = require('fs');
const path = require('path');
const { loadCustomNames, formatName } = require('../core/utils.js');

/**
 * Extracts and formats cities data.
 * @param {Object} sourceData - The decrypted source JSON data.
 * @param {string} outputDir - The directory to save the output file.
 * @param {string} version - Version string passed from config
 * @returns {Object} Metadata for the extraction.
 */
function run(sourceData, outputDir, version = "1.0.0") {
    console.log(`  [Cities] Running extractor...`);
    const customNames = loadCustomNames('cities');
    
    const rawItems = sourceData?.cities ?? {};
    
    // Filter out potential non-object keys and sort for consistent output
    const sortedKeys = Object.keys(rawItems).filter(k => typeof rawItems[k] === 'object').sort();
    
    const transformed = { cities: {} };
    let count = 0;

    for (const key of sortedKeys) {
        const rawData = rawItems[key];
        const cityId = rawData.id ?? key;
        const cityName = formatName(cityId, customNames);
        
        // Construct the final normalized object
        transformed.cities[cityId] = {
            id: cityId,
            name: cityName
        };

        count++;
    }

    const outputPath = path.join(outputDir, 'cities_db.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
    
    console.log(`  [Cities] Extracted ${count} cities to cities_db.json`);
    
    return {
        version: version,
        generatedAt: new Date().toISOString(),
        count: count
    };
}

module.exports = { run };
