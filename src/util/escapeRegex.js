/**
 * @param {string} text
 * @returns {string}
 */
function escapeRegex(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegex;
module.exports.escapeRegex = escapeRegex;
