/**
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
    if (!text || typeof text !== 'string') {
        return 'danh-muc';
    }

    const slug = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return slug || 'danh-muc';
}

/**
 * @param {string} name
 * @param {Model} CategoryModel
 * @param {ObjectId|null} excludeId
 * @returns {Promise<string>}
 */
async function generateUniqueCategorySlug(name, CategoryModel, excludeId = null) {
    const baseSlug = slugify(name);
    let candidateSlug = baseSlug;
    let counter = 2;

    while (true) {
        const query = { slug: candidateSlug };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const existing = await CategoryModel.findOne(query).lean();
        if (!existing) {
            return candidateSlug;
        }
        candidateSlug = `${baseSlug}-${counter}`;
        counter++;
    }
}

module.exports = {
    slugify,
    generateUniqueCategorySlug,
};
