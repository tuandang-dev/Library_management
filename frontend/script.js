// Dữ liệu mẫu (Đã cập nhật nhiều sách và lịch sử dài hơn cho năm 2025)
const data = {
  "theLoai": [
    { "id": 1, "ten": "Công nghệ thông tin" },
    { "id": 2, "ten": "Văn học" },
    { "id": 3, "ten": "Ngoại ngữ" },
    { "id": 4, "ten": "Kỹ năng sống" },
    { "id": 5, "ten": "Kinh tế" }
  ],
  "sach": [
    { "id": 1, "tieuDe": "Lập Trình Java Cơ Bản", "tacGia": "Nguyễn Văn A", "theLoaiId": 1, "namXuatBan": 2020 },
    { "id": 2, "tieuDe": "Hướng Dẫn HTML & CSS", "tacGia": "Trần Thị B", "theLoaiId": 1, "namXuatBan": 2019 },
    { "id": 3, "tieuDe": "Cấu Trúc Dữ Liệu & Giải Thuật", "tacGia": "Lê Minh C", "theLoaiId": 1, "namXuatBan": 2021 },
    { "id": 4, "tieuDe": "Văn Học Việt Nam Hiện Đại", "tacGia": "Tố Hữu", "theLoaiId": 2, "namXuatBan": 2015 },
    { "id": 5, "tieuDe": "Nhà Giả Kim", "tacGia": "Paulo Coelho", "theLoaiId": 2, "namXuatBan": 2012 },
    { "id": 6, "tieuDe": "Đắc Nhân Tâm", "tacGia": "Dale Carnegie", "theLoaiId": 4, "namXuatBan": 2014 },
    { "id": 7, "tieuDe": "Lập Trình Python Cơ Bản", "tacGia": "Nguyễn Tấn Dũng", "theLoaiId": 1, "namXuatBan": 2021 },
    { "id": 8, "tieuDe": "Clean Code", "tacGia": "Robert C. Martin", "theLoaiId": 1, "namXuatBan": 2008 },
    { "id": 9, "tieuDe": "Tuổi Trẻ Đáng Giá Bao Nhiêu", "tacGia": "Rosie Nguyễn", "theLoaiId": 4, "namXuatBan": 2016 },
    { "id": 10, "tieuDe": "Mắt Biếc", "tacGia": "Nguyễn Nhật Ánh", "theLoaiId": 2, "namXuatBan": 1990 },
    { "id": 11, "tieuDe": "Sherlock Holmes Toàn Tập", "tacGia": "Conan Doyle", "theLoaiId": 2, "namXuatBan": 2000 },
    { "id": 12, "tieuDe": "SQL Server Từ Cơ Bản Đến Nâng Cao", "tacGia": "Lê Văn Minh", "theLoaiId": 1, "namXuatBan": 2021 },
    { "id": 13, "tieuDe": "Marketing Căn Bản", "tacGia": "Philip Kotler", "theLoaiId": 5, "namXuatBan": 2018 },
    { "id": 14, "tieuDe": "Dế Mèn Phiêu Lưu Ký", "tacGia": "Tô Hoài", "theLoaiId": 2, "namXuatBan": 1941 },
    { "id": 15, "tieuDe": "Tiếng Anh Giao Tiếp", "tacGia": "Oxford", "theLoaiId": 3, "namXuatBan": 2022 },
    { "id": 22, "tieuDe": "600 Từ Vựng TOEIC", "tacGia": "Nhiều tác giả", "theLoaiId": 3, "namXuatBan": 2018 }
  ],
  "docGia": [
    { "id": 1, "hoTen": "Nguyễn Văn An", "email": "an@student.haui.edu.vn", "dienThoai": "0901234561" },
    { "id": 2, "hoTen": "Trần Thị Mai", "email": "mai@student.haui.edu.vn", "dienThoai": "0901234562" },
    { "id": 3, "hoTen": "Lê Minh Hòa", "email": "hoa@student.haui.edu.vn", "dienThoai": "0901234563" }
  ],
  "muonTra": [
    // --- NĂM 2025 (Mới nhất) ---
    // Đang mượn (Trong hạn)
    { "id": 30, "docGiaId": 1, "sachId": 8, "ngayMuon": "2025-04-10", "hanTra": "2025-04-25", "trangThai": "Đang mượn" },
    { "id": 29, "docGiaId": 1, "sachId": 13, "ngayMuon": "2025-04-08", "hanTra": "2025-04-22", "trangThai": "Đang mượn" },
    
    // Đang mượn (QUÁ HẠN - Để test màu đỏ)
    { "id": 28, "docGiaId": 1, "sachId": 1, "ngayMuon": "2025-03-01", "hanTra": "2025-03-15", "trangThai": "Đang mượn" }, 
    { "id": 27, "docGiaId": 1, "sachId": 7, "ngayMuon": "2025-02-20", "hanTra": "2025-03-05", "trangThai": "Đang mượn" },

    // Đã trả (Gần đây)
    { "id": 26, "docGiaId": 1, "sachId": 5, "ngayMuon": "2025-03-20", "hanTra": "2025-04-05", "trangThai": "Đã trả" },
    { "id": 25, "docGiaId": 1, "sachId": 22, "ngayMuon": "2025-03-15", "hanTra": "2025-03-30", "trangThai": "Đã trả" },
    { "id": 24, "docGiaId": 1, "sachId": 10, "ngayMuon": "2025-03-10", "hanTra": "2025-03-25", "trangThai": "Đã trả" },
    { "id": 23, "docGiaId": 1, "sachId": 3, "ngayMuon": "2025-02-25", "hanTra": "2025-03-10", "trangThai": "Đã trả" },
    { "id": 22, "docGiaId": 1, "sachId": 15, "ngayMuon": "2025-02-10", "hanTra": "2025-02-24", "trangThai": "Đã trả" },
    
    // --- NĂM 2024 (Lịch sử cũ) ---
    { "id": 21, "docGiaId": 1, "sachId": 2, "ngayMuon": "2024-12-20", "hanTra": "2025-01-05", "trangThai": "Đã trả" },
    { "id": 20, "docGiaId": 1, "sachId": 9, "ngayMuon": "2024-12-15", "hanTra": "2024-12-30", "trangThai": "Đã trả" },
    { "id": 19, "docGiaId": 1, "sachId": 6, "ngayMuon": "2024-11-20", "hanTra": "2024-12-05", "trangThai": "Đã trả" },
    { "id": 18, "docGiaId": 1, "sachId": 11, "ngayMuon": "2024-11-01", "hanTra": "2024-11-15", "trangThai": "Đã trả" },
    { "id": 17, "docGiaId": 1, "sachId": 4, "ngayMuon": "2024-10-15", "hanTra": "2024-10-30", "trangThai": "Đã trả" },
    { "id": 16, "docGiaId": 1, "sachId": 12, "ngayMuon": "2024-09-10", "hanTra": "2024-09-25", "trangThai": "Đã trả" },
    { "id": 15, "docGiaId": 1, "sachId": 14, "ngayMuon": "2024-08-20", "hanTra": "2024-09-05", "trangThai": "Đã trả" },
    { "id": 14, "docGiaId": 1, "sachId": 8, "ngayMuon": "2024-08-01", "hanTra": "2024-08-15", "trangThai": "Đã trả" },
    { "id": 13, "docGiaId": 1, "sachId": 1, "ngayMuon": "2024-07-15", "hanTra": "2024-07-30", "trangThai": "Đã trả" },
    { "id": 12, "docGiaId": 1, "sachId": 5, "ngayMuon": "2024-06-20", "hanTra": "2024-07-05", "trangThai": "Đã trả" },
    { "id": 11, "docGiaId": 1, "sachId": 3, "ngayMuon": "2024-06-01", "hanTra": "2024-06-15", "trangThai": "Đã trả" },
    { "id": 10, "docGiaId": 1, "sachId": 7, "ngayMuon": "2024-05-10", "hanTra": "2024-05-25", "trangThai": "Đã trả" },
    { "id": 9, "docGiaId": 1, "sachId": 2, "ngayMuon": "2024-04-20", "hanTra": "2024-05-05", "trangThai": "Đã trả" },
    { "id": 8, "docGiaId": 1, "sachId": 13, "ngayMuon": "2024-04-01", "hanTra": "2024-04-15", "trangThai": "Đã trả" },
    { "id": 7, "docGiaId": 1, "sachId": 9, "ngayMuon": "2024-03-15", "hanTra": "2024-03-30", "trangThai": "Đã trả" },
    { "id": 6, "docGiaId": 1, "sachId": 6, "ngayMuon": "2024-03-01", "hanTra": "2024-03-15", "trangThai": "Đã trả" },
    { "id": 5, "docGiaId": 1, "sachId": 10, "ngayMuon": "2024-02-15", "hanTra": "2024-03-01", "trangThai": "Đã trả" },
    { "id": 4, "docGiaId": 1, "sachId": 22, "ngayMuon": "2024-02-01", "hanTra": "2024-02-15", "trangThai": "Đã trả" },
    { "id": 3, "docGiaId": 1, "sachId": 4, "ngayMuon": "2024-01-20", "hanTra": "2024-02-05", "trangThai": "Đã trả" },
    { "id": 2, "docGiaId": 1, "sachId": 12, "ngayMuon": "2024-01-10", "hanTra": "2024-01-25", "trangThai": "Đã trả" },
    { "id": 1, "docGiaId": 1, "sachId": 11, "ngayMuon": "2024-01-05", "hanTra": "2024-01-20", "trangThai": "Đã trả" }
  ]
};

const currentUser = data.docGia[0];

document.addEventListener('DOMContentLoaded', () => {
    updateUserInfo();

    // Trang QR
    if (document.getElementById('view-qr')) {
        loadQRPage();
        setupDownloadQR();
    }

    // Trang Lịch sử
    if (document.getElementById('history-records')) {
        loadHistoryPage();
    }

    // Trang Đổi mật khẩu
    if (document.getElementById('change-password-form')) {
        setupPasswordPage();
    }
});

function updateUserInfo() {
    const nameEls = document.querySelectorAll('.user-name');
    const emailEls = document.querySelectorAll('.user-email');
    
    nameEls.forEach(el => el.textContent = currentUser.hoTen);
    emailEls.forEach(el => el.textContent = currentUser.email);
}

function showDemoAlert(msg) {
    alert(`Chức năng [${msg}] chỉ mang tính chất demo giao diện.`);
}

// --- QR PAGE LOGIC ---
function loadQRPage() {
    document.getElementById('student-id').textContent = currentUser.id;
    document.getElementById('student-name').textContent = currentUser.hoTen;
    document.getElementById('student-email').textContent = currentUser.email;
    
    const now = new Date();
    document.querySelector('.created-at').textContent = `Được tạo lúc ${now.toLocaleTimeString()} ngày ${now.toLocaleDateString('vi-VN')}`;
}

function setupDownloadQR() {
    const btnDownload = document.getElementById('btn-download-qr');
    
    if (btnDownload) {
        btnDownload.addEventListener('click', function() {
            // Chuẩn bị nội dung file txt
            const ticketCode = "TKT-HAUI-2025";
            const now = new Date();
            const timeString = `${now.getHours()}:${now.getMinutes()} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

            const fileContent = 
`============================================
       VÉ MƯỢN THƯ VIỆN HAUI - QR TICKET
============================================

MÃ VÉ:        ${ticketCode}
THỜI GIAN:    ${timeString}
TRẠNG THÁI:   TÍCH CỰC

--------------------------------------------
THÔNG TIN SINH VIÊN
--------------------------------------------
Họ tên:       ${currentUser.hoTen}
MSSV:         ${currentUser.id}
Email:        ${currentUser.email}
Số điện thoại: ${currentUser.dienThoai}

--------------------------------------------
HƯỚNG DẪN SỬ DỤNG:
1. Vui lòng xuất trình mã vé hoặc file này cho thủ thư.
2. Vé được sử dụng để mượn/trả sách và check-in.
3. Vui lòng không chia sẻ vé này cho người khác.

============================================
© 2025 Thư viện HAUI System
============================================`;

            const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Ve_Muon_QR_${ticketCode}.txt`;
            
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }
}

// --- HISTORY PAGE LOGIC (Đã cập nhật giao diện mới) ---
function loadHistoryPage() {
    const historyContainer = document.getElementById('history-records');
    let totalBorrowed = data.muonTra.length;
    let currentlyBorrowing = 0;
    let overdueBooks = 0;
    let returnedBooks = 0;

    // Giả lập "Hôm nay" là ngày 15/04/2025 để tính toán quá hạn chính xác
    const today = new Date('2025-04-15'); 

    let htmlContent = '';

    data.muonTra.forEach(record => {
        const book = data.sach.find(s => s.id === record.sachId);
        const reader = data.docGia.find(u => u.id === record.docGiaId);
        
        let statusClass = '';
        let statusText = record.trangThai;
        let iconClass = 'fa-book';
        
        const dueDate = new Date(record.hanTra);
        // Sách được coi là quá hạn nếu chưa trả VÀ ngày hết hạn nhỏ hơn "hôm nay"
        const isOverdue = record.trangThai === 'Đang mượn' && dueDate < today;

        if (record.trangThai === 'Đã trả') {
            returnedBooks++;
            statusClass = 'bg-returned';
            statusText = 'Đã trả';
            iconClass = 'fa-check';
        } else if (isOverdue) {
            overdueBooks++; 
            currentlyBorrowing++; 
            statusClass = 'bg-overdue';
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            statusText = `Quá hạn (+${diffDays} ngày)`;
            iconClass = 'fa-triangle-exclamation';
        } else {
            currentlyBorrowing++;
            statusClass = 'bg-borrowed';
            statusText = 'Đang mượn';
            iconClass = 'fa-clock';
        }

        htmlContent += `
        <div class="borrow-record">
            <div class="record-header">
                <div>
                    <div class="book-title"><i class="fa-solid ${iconClass}"></i> ${book ? book.tieuDe : 'Sách không tồn tại'}</div>
                    <div class="book-author">bởi ${book ? book.tacGia : 'N/A'}</div>
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="record-details">
                <div class="detail-box box-borrowed">
                    <span class="detail-label"><i class="fa-regular fa-calendar"></i> Ngày mượn</span>
                    <span class="detail-value">${new Date(record.ngayMuon).toLocaleDateString('vi-VN')}</span>
                </div>

                <div class="detail-box box-due">
                    <span class="detail-label"><i class="fa-regular fa-calendar-check"></i> Hạn trả</span>
                    <span class="detail-value">${new Date(record.hanTra).toLocaleDateString('vi-VN')}</span>
                </div>

                <div class="detail-box box-user">
                    <span class="detail-label"><i class="fa-solid fa-user-tag"></i> Người mượn</span>
                    <span class="detail-value">${reader ? reader.hoTen : 'Unknown'}</span>
                </div>
            </div>
        </div>
        `;
    });

    historyContainer.innerHTML = htmlContent;

    // Cập nhật thống kê
    document.getElementById('total-borrowed').textContent = totalBorrowed;
    document.getElementById('currently-borrowing').textContent = currentlyBorrowing;
    document.getElementById('overdue-books').textContent = overdueBooks;
    document.getElementById('returned-books').textContent = returnedBooks;
}

// --- PASSWORD PAGE LOGIC ---
function setupPasswordPage() {
    document.querySelectorAll('.input-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const inputId = this.getAttribute('data-target');
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    document.getElementById('change-password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        if (newPass.length < 6) {
            alert('Mật khẩu mới quá ngắn!');
            return;
        }

        if (newPass !== confirmPass) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        alert('Đổi mật khẩu thành công!');
        this.reset();
    });
}