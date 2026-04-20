const crypto = require('crypto');
const fs = require('fs');

/**
 * Decrypts the AES-128-CTR encrypted game data file.
 * If the file is already plain JSON, it parses it directly.
 * @param {string} inputPath - Path to the encrypted JSON file.
 * @returns {Object} The decrypted JSON data as a JavaScript object.
 */
function decryptFile(inputPath) {
    console.log(`[Crypto] Reading ${inputPath}...`);
    const buffer = fs.readFileSync(inputPath);

    // Check if the file is already plain JSON (starts with '{' or '[')
    if (buffer[0] === 0x7B || buffer[0] === 0x5B) {
        console.log(`[Crypto] File is already plain JSON, skipping decryption.`);
        return JSON.parse(buffer.toString('utf-8'));
    }

    console.log(`[Crypto] Decrypting AES-128-CTR payload...`);
    const iv = buffer.slice(0, 16);
    const key = buffer.slice(16, 32);
    const ciphertext = buffer.slice(32);

    const decipher = crypto.createDecipheriv('aes-128-ctr', key, iv);
    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}

module.exports = { decryptFile };
