// --- 1. Cấu hình API và Biến toàn cục ---
const bookApi = 'http://localhost:3000/sach';
const categoryApi = 'http://localhost:3000/theLoai';
const borrowApi = 'http://localhost:3000/muonTra';

let allBooksData = []; // Dữ liệu gốc
let currentFilteredBooks = []; // Dữ liệu đang được hiển thị (đã lọc)

// CẤU HÌNH PHÂN TRANG
let currentPage = 1;
const perPage = 12; // Hiển thị 12 cuốn mỗi trang

const colorPalettes = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
];

// --- 2. Hàm khởi chạy (Start) ---
function start() {
    Promise.all([
        fetch(bookApi).then(res => res.json()),
        fetch(categoryApi).then(res => res.json()),
        fetch(borrowApi).then(res => res.json())
    ])
        .then(([books, categories, borrows]) => {
            // 1. Render Categories (Select & Tags)
            renderCategories(categories);
            renderCategoryTags(categories);

            // 2. Xử lý dữ liệu sách
            allBooksData = books.map(book => {
                const category = categories.find(c => c.id == book.theLoaiId);
                const isBorrowed = borrows.some(mt => mt.sachId == book.id && mt.trangThai === "Đang mượn");
                return {
                    ...book,
                    tenTheLoai: category ? category.ten : 'Khác',
                    trangThai: isBorrowed ? 'borrowed' : 'available'
                };
            });

            // 3. Khởi tạo dữ liệu ban đầu
            currentFilteredBooks = allBooksData; // Ban đầu chưa lọc gì cả

            // 4. Hiển thị trang đầu tiên
            renderCurrentPage();
            updateStats(allBooksData);
            setupEventListeners();
        })
        .catch(err => console.error("Lỗi tải dữ liệu:", err));
}

start();

// --- 3. Logic Phân Trang & Render ---

// Hàm này chịu trách nhiệm cắt dữ liệu và gọi hiển thị
function renderCurrentPage() {
    // 1. Tính vị trí cắt mảng (Slice)
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;

    // 2. Cắt lấy 12 cuốn sách cho trang hiện tại
    const booksOnPage = currentFilteredBooks.slice(start, end);

    // 3. Hiển thị sách và thanh phân trang
    renderBooks(booksOnPage);
    renderPagination();
}

// Hàm hiển thị thanh phân trang
function renderPagination() {
    const paginationBlock = document.getElementById('pagination');
    const totalPages = Math.ceil(currentFilteredBooks.length / perPage);

    // Nếu không có sách hoặc chỉ có 1 trang thì ẩn thanh phân trang đi cho đỡ rối
    if (totalPages <= 1) {
        paginationBlock.innerHTML = '';
        return;
    }

    let html = '';

    // Nút Previous (Trước)
    html += `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
             </button>`;

    // Các nút số trang
    for (let i = 1; i <= totalPages; i++) {
        // Chỉ hiển thị các trang gần trang hiện tại (tùy chọn, ở đây hiển thị hết nếu ít trang)
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    // Nút Next (Sau)
    html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
             </button>`;

    paginationBlock.innerHTML = html;
}

// Hàm xử lý khi bấm chuyển trang
function changePage(newPage) {
    currentPage = newPage;
    renderCurrentPage();

    // Cuộn màn hình lên đầu danh sách sách để người dùng dễ xem
    document.getElementById('booksGrid').scrollIntoView({ behavior: 'smooth' });
}

// --- 4. Các hàm Render Giao diện (HTML) ---

function renderBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = '';

    if (books.length === 0) {
        booksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Không tìm thấy sách nào.</p>';
        return;
    }

    const htmls = books.map((book, index) => {
        // Tính toán lại index màu sắc để nó không bị trùng lặp quá nhiều khi chuyển trang
        const globalIndex = allBooksData.indexOf(book);
        const colorIndex = globalIndex % colorPalettes.length;

        const statusText = book.trangThai === 'available' ? 'Có sẵn' : 'Đang mượn';
        const statusClass = book.trangThai === 'available' ? 'status-available' : 'status-borrowed';

        return `
            <div class="book-card" onclick="showBookDetails(${book.id})">
                <div class="book-image" style="background: ${colorPalettes[colorIndex]}">
                    <div class="book-status ${statusClass}">${statusText}</div>
                    ${book.trangThai === 'available' ? `<div class="book-quantity">SL: ${book.soLuong}</div>` : ''}
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.tieuDe}</h3>
                    <p class="book-author">${book.tacGia}</p>
                    <p class="book-category">${book.tenTheLoai}</p>
                </div>
            </div>
        `;
    });
    booksGrid.innerHTML = htmls.join('');
}

function renderCategories(categories) {
    const listCategoriesBlock = document.querySelector('#categoryFilter');
    // Xóa các option cũ trừ option đầu tiên
    listCategoriesBlock.innerHTML = '<option value="">Tất cả thể loại</option>';
    const htmls = categories.map(cat => `<option value="${cat.id}">${cat.ten}</option>`);
    listCategoriesBlock.insertAdjacentHTML('beforeend', htmls.join(''));
}

function renderCategoryTags(categories) {
    const tagContainer = document.getElementById('categoryTags');
    if (!tagContainer) return; // Phòng trường hợp chưa thêm HTML

    let html = `<div class="category-tag active" onclick="handleCategoryClick(this, '')">Tất cả</div>`;
    html += categories.map(cat =>
        `<div class="category-tag" onclick="handleCategoryClick(this, '${cat.id}')" data-id="${cat.id}">
            ${cat.ten}
        </div>`
    ).join('');
    tagContainer.innerHTML = html;
}

// --- 5. Chức năng Lọc & Tìm kiếm ---

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterBooks);
    document.getElementById('categoryFilter').addEventListener('change', function () {
        updateActiveTagState(this.value);
        filterBooks();
    });
    document.getElementById('statusFilter').addEventListener('change', filterBooks);
}

function handleCategoryClick(element, categoryId) {
    const selectBox = document.getElementById('categoryFilter');
    selectBox.value = categoryId;
    updateActiveTagState(categoryId);
    filterBooks();
}

function updateActiveTagState(categoryId) {
    document.querySelectorAll('.category-tag').forEach(tag => tag.classList.remove('active'));
    if (categoryId === "") {
        const allTag = document.querySelector('.category-tag');
        if (allTag) allTag.classList.add('active');
    } else {
        const activeTag = document.querySelector(`.category-tag[data-id="${categoryId}"]`);
        if (activeTag) activeTag.classList.add('active');
    }
}

// [QUAN TRỌNG] Hàm lọc sách đã sửa đổi để hỗ trợ phân trang
function filterBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryId = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;

    // 1. Lọc dữ liệu và lưu vào biến toàn cục currentFilteredBooks
    currentFilteredBooks = allBooksData.filter(book => {
        const matchSearch = book.tieuDe.toLowerCase().includes(searchTerm) ||
            book.tacGia.toLowerCase().includes(searchTerm);
        const matchCategory = categoryId === "" || book.theLoaiId == categoryId;
        const matchStatus = status === "" || book.trangThai === status;
        return matchSearch && matchCategory && matchStatus;
    });

    // 2. Reset về trang 1 mỗi khi người dùng thay đổi bộ lọc
    currentPage = 1;

    // 3. Gọi hàm hiển thị trang (Hàm này sẽ tự cắt 12 cuốn để hiển thị)
    renderCurrentPage();

    // 4. Cập nhật thống kê
    updateStats(currentFilteredBooks);
}

// --- 6. Các hàm phụ trợ ---
function updateStats(books) {
    const totalElement = document.getElementById('totalBooks');
    if (totalElement) totalElement.textContent = books.length;
}

function showBookDetails(bookId) {
    const book = allBooksData.find(b => b.id === bookId);
    if (book) {
        alert(`Chi tiết:\n${book.tieuDe}\nTác giả: ${book.tacGia}\nTrạng thái: ${book.trangThai}`);
    }
}

document.querySelector('.btn-login').addEventListener('click', function () {
    // if (confirm('Bạn có muốn đóng trang này không?')) {}
    window.location.href = 'dang_nhap.html';
});

document.querySelector('.btn-cta').addEventListener('click', function () {
    // if (confirm('Bạn có muốn đóng trang này không?')) {}
    window.location.href = 'dang_nhap.html';
});