const fs = require('fs');
const path = require('path');

/**
 * Loads the custom names JSON file for a specific category.
 * @param {string} category - The category name (e.g., 'characters', 'boards').
 * @returns {Object} The custom names dictionary.
 */
function loadCustomNames(category) {
    const filePath = path.join(__dirname, '..', 'config', 'custom_names', `${category}.json`);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
            console.error(`[Utils] Error parsing custom names for ${category}:`, e.message);
        }
    }
    return {};
}

/**
 * Formats an identifier into a human-readable name.
 * Checks custom names first, then falls back to Regex formatting.
 * @param {string} id - The identifier to format (e.g., 'darkOutfit', 'trophy_set_1').
 * @param {Object} customNames - The loaded custom names dictionary.
 * @returns {string} The formatted name.
 */
function formatName(id, customNames = {}) {
    if (customNames[id]) {
        return customNames[id];
    }

    // 1. Replace underscores with spaces (snake_case)
    let formatted = id.replace(/_/g, ' ');

    // 2. Insert space before capital letters (camelCase)
    formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');

    // 3. Capitalize the first letter of each word and lowercase the rest
    formatted = formatted.split(' ').map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');

    return formatted.trim();
}

module.exports = { loadCustomNames, formatName };
