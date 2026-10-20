/**
 * Tiện ích hỗ trợ tính toán phân trang an toàn cho Express 5 & Mongoose
 */

/**
 * Tạo dữ liệu phân trang và liên kết chuyển trang bảo toàn query parameters
 * @param {Object} options
 * @param {Object} [options.query={}] - req.query từ Express (chỉ đọc)
 * @param {number} [options.totalItems=0] - Tổng số bản ghi thỏa mãn điều kiện
 * @param {number} [options.limit=10] - Số bản ghi tối đa mỗi trang
 * @param {number} [options.maxButtons=5] - Số lượng nút số trang hiển thị tối đa trên thanh điều hướng
 * @returns {Object} Đối tượng pagination chứa skip, limit, metadata và danh sách các trang
 */
function getPaginationData({ query = {}, totalItems = 0, limit = 10, maxButtons = 5 } = {}) {
    const rawPage = parseInt(query.page, 10);
    const totalCount = Math.max(0, parseInt(totalItems, 10) || 0);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    let currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const skip = (currentPage - 1) * pageSize;

    const showingFrom = totalCount === 0 ? 0 : skip + 1;
    const showingTo = Math.min(skip + pageSize, totalCount);

    // Xây dựng URL chuyển trang, clone query để không ghi đè req.query của Express 5
    const buildPageUrl = (pageNumber) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
            if (key !== 'page' && value !== undefined && value !== null && value !== '') {
                params.set(key, String(value));
            }
        }
        params.set('page', String(pageNumber));
        const queryString = params.toString();
        return queryString ? `?${queryString}` : `?page=${pageNumber}`;
    };

    // Tạo danh sách trang theo cửa sổ trượt (sliding window)
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push({
            pageNumber: i,
            url: buildPageUrl(i),
            isCurrent: i === currentPage,
        });
    }

    return {
        currentPage,
        totalPages,
        totalItems: totalCount,
        limit: pageSize,
        skip,
        showingFrom,
        showingTo,
        showPagination: totalPages > 1,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPageUrl: currentPage < totalPages ? buildPageUrl(currentPage + 1) : null,
        prevPageUrl: currentPage > 1 ? buildPageUrl(currentPage - 1) : null,
        firstPageUrl: buildPageUrl(1),
        lastPageUrl: buildPageUrl(totalPages),
        pages,
    };
}

module.exports = {
    getPaginationData,
};
