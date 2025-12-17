// ==========================
// PHẦN 1 — DỮ LIỆU THƯ VIỆN
// ==========================

const libraryData = {
  theLoai: [
    { id: 1, ten: "Công nghệ thông tin" },
    { id: 2, ten: "Văn học" },
    { id: 3, ten: "Ngoại ngữ" },
    { id: 4, ten: "Kỹ năng sống" }
  ],

  sach: [
    {
      id: 1,
      tieuDe: "Lập Trình Java Cơ Bản",
      tacGia: "Nguyễn Văn A",
      theLoaiId: 1,
      namXuatBan: 2020,
      soLuong: 12,
      description: "Giới thiệu toàn diện về lập trình Java."
    },
    {
      id: 2,
      tieuDe: "Hướng Dẫn HTML & CSS",
      tacGia: "Trần Thị B",
      theLoaiId: 1,
      namXuatBan: 2019,
      soLuong: 7
    },
    {
      id: 3,
      tieuDe: "Cấu Trúc Dữ Liệu & Giải Thuật",
      tacGia: "Lê Minh C",
      theLoaiId: 1,
      namXuatBan: 2021,
      soLuong: 5
    },

    // ======= 60 sách đầy đủ =======
    {
      id: 4,
      tieuDe: "Văn Học Việt Nam Hiện Đại",
      tacGia: "Tố Hữu",
      theLoaiId: 2,
      namXuatBan: 2015,
      soLuong: 20
    },
    {
      id: 5,
      tieuDe: "Tiếng Anh Giao Tiếp",
      tacGia: "John Smith",
      theLoaiId: 3,
      namXuatBan: 2018,
      soLuong: 9
    },
    {
      id: 6,
      tieuDe: "Kỹ Năng Sống Cho Sinh Viên",
      tacGia: "Phạm Hương",
      theLoaiId: 4,
      namXuatBan: 2017,
      soLuong: 14
    },
    {
      id: 7,
      tieuDe: "Lập Trình Python Cơ Bản",
      tacGia: "Nguyễn Tấn Dũng",
      theLoaiId: 1,
      namXuatBan: 2021,
      soLuong: 10
    },
    {
      id: 8,
      tieuDe: "Lập Trình Web với JavaScript",
      tacGia: "Hoàng Long",
      theLoaiId: 1,
      namXuatBan: 2022,
      soLuong: 8
    },
    {
      id: 9,
      tieuDe: "ReactJS Nâng Cao",
      tacGia: "Phạm Chí Tài",
      theLoaiId: 1,
      namXuatBan: 2023,
      soLuong: 11
    },
    {
      id: 10,
      tieuDe: "NodeJS Cho Người Mới",
      tacGia: "Trần Hữu Nghĩa",
      theLoaiId: 1,
      namXuatBan: 2020,
      soLuong: 6
    },
    {
      id: 11,
      tieuDe: "Phân Tích Thiết Kế Hệ Thống",
      tacGia: "Nguyễn Hữu Khoa",
      theLoaiId: 1,
      namXuatBan: 2018,
      soLuong: 9
    },
    {
      id: 12,
      tieuDe: "SQL Server Từ Cơ Bản Đến Nâng Cao",
      tacGia: "Lê Văn Minh",
      theLoaiId: 1,
      namXuatBan: 2021,
      soLuong: 16
    },
    {
      id: 13,
      tieuDe: "MongoDB Thực Hành",
      tacGia: "Hồ Thanh Sơn",
      theLoaiId: 1,
      namXuatBan: 2019,
      soLuong: 6
    },
    {
      id: 14,
      tieuDe: "Docker & DevOps",
      tacGia: "Đặng Ngọc Hải",
      theLoaiId: 1,
      namXuatBan: 2022,
      soLuong: 10
    },
    {
      id: 15,
      tieuDe: "Lập Trình Kotlin",
      tacGia: "Hoàng Văn Tú",
      theLoaiId: 1,
      namXuatBan: 2020,
      soLuong: 12
    },
    {
      id: 16,
      tieuDe: "Văn Học Trung Đại Việt Nam",
      tacGia: "Nhiều tác giả",
      theLoaiId: 2,
      namXuatBan: 2010,
      soLuong: 18
    },
    {
      id: 17,
      tieuDe: "Tác Phẩm Chọn Lọc - Nam Cao",
      tacGia: "Nam Cao",
      theLoaiId: 2,
      namXuatBan: 2013,
      soLuong: 22
    },
    {
      id: 18,
      tieuDe: "Tuyển Tập Thơ Xuân Diệu",
      tacGia: "Xuân Diệu",
      theLoaiId: 2,
      namXuatBan: 2014,
      soLuong: 17
    },
    {
      id: 19,
      tieuDe: "Tố Tâm",
      tacGia: "Hoàng Ngọc Phách",
      theLoaiId: 2,
      namXuatBan: 2009,
      soLuong: 10
    },
    {
      id: 20,
      tieuDe: "Dế Mèn Phiêu Lưu Ký",
      tacGia: "Tô Hoài",
      theLoaiId: 2,
      namXuatBan: 2011,
      soLuong: 25
    },
    {
      id: 21,
      tieuDe: "Ngữ Pháp Tiếng Anh Hiện Đại",
      tacGia: "Raymond Murphy",
      theLoaiId: 3,
      namXuatBan: 2017,
      soLuong: 15
    },
    {
      id: 22,
      tieuDe: "600 Từ Vựng TOEIC",
      tacGia: "Nhiều tác giả",
      theLoaiId: 3,
      namXuatBan: 2018,
      soLuong: 30
    },
    {
      id: 23,
      tieuDe: "Tự Học IELTS 7.0",
      tacGia: "Nguyễn Thị Trang",
      theLoaiId: 3,
      namXuatBan: 2022,
      soLuong: 13
    },
    {
      id: 24,
      tieuDe: "Tiếng Nhật Sơ Cấp N5",
      tacGia: "Sato Haruki",
      theLoaiId: 3,
      namXuatBan: 2016,
      soLuong: 18
    },
    {
      id: 25,
      tieuDe: "Hán Ngữ Tập 1",
      tacGia: "Lý Hạo",
      theLoaiId: 3,
      namXuatBan: 2015,
      soLuong: 14
    },
    {
      id: 26,
      tieuDe: "Tư Duy Tích Cực",
      tacGia: "Norman Vincent Peale",
      theLoaiId: 4,
      namXuatBan: 2012,
      soLuong: 11
    },
    {
      id: 27,
      tieuDe: "Đắc Nhân Tâm",
      tacGia: "Dale Carnegie",
      theLoaiId: 4,
      namXuatBan: 2014,
      soLuong: 40
    },
    {
      id: 28,
      tieuDe: "Quẳng Gánh Lo Đi Và Vui Sống",
      tacGia: "Dale Carnegie",
      theLoaiId: 4,
      namXuatBan: 2011,
      soLuong: 22
    },
    {
      id: 29,
      tieuDe: "7 Thói Quen Hiệu Quả",
      tacGia: "Stephen Covey",
      theLoaiId: 4,
      namXuatBan: 2013,
      soLuong: 18
    },
    {
      id: 30,
      tieuDe: "Nghệ Thuật Giao Tiếp",
      tacGia: "Brian Tracy",
      theLoaiId: 4,
      namXuatBan: 2016,
      soLuong: 20
    },

    // ====== tiếp tục từ 31 đến 60 ======

    {
      id: 31, tieuDe: "Thuật Toán Java Nâng Cao", tacGia: "Trần Đức Hòa", theLoaiId: 1, namXuatBan: 2019, soLuong: 7
    },
    {
      id: 32, tieuDe: "Lập Trình C++ Cho Người Mới", tacGia: "Hà Minh Khang", theLoaiId: 1, namXuatBan: 2021, soLuong: 9
    },
    {
      id: 33, tieuDe: "Hệ Điều Hành Linux", tacGia: "Nguyễn Long", theLoaiId: 1, namXuatBan: 2017, soLuong: 5
    },
    {
      id: 34, tieuDe: "Mạng Máy Tính", tacGia: "Andrew S. Tanenbaum", theLoaiId: 1, namXuatBan: 2015, soLuong: 6
    },
    {
      id: 35, tieuDe: "Kỹ Thuật Lập Trình", tacGia: "Nguyễn Tấn Phước", theLoaiId: 1, namXuatBan: 2018, soLuong: 8
    },
    {
      id: 36, tieuDe: "Văn Học Nga Tuyển Chọn", tacGia: "Nhiều tác giả", theLoaiId: 2, namXuatBan: 2008, soLuong: 15
    },
    {
      id: 37, tieuDe: "Nhật Ký Trong Tù", tacGia: "Hồ Chí Minh", theLoaiId: 2, namXuatBan: 2005, soLuong: 30
    },
    {
      id: 38, tieuDe: "Tuổi Trẻ Đáng Giá Bao Nhiêu", tacGia: "Rosie Nguyễn", theLoaiId: 2, namXuatBan: 2017, soLuong: 26
    },
    {
      id: 39, tieuDe: "Nhà Giả Kim", tacGia: "Paulo Coelho", theLoaiId: 2, namXuatBan: 2012, soLuong: 22
    },
    {
      id: 40, tieuDe: "Harry Potter Tập 1", tacGia: "J.K. Rowling", theLoaiId: 2, namXuatBan: 2000, soLuong: 40
    },
    {
      id: 41, tieuDe: "TOEIC Listening", tacGia: "ETS", theLoaiId: 3, namXuatBan: 2019, soLuong: 25
    },
    {
      id: 42, tieuDe: "TOEIC Reading", tacGia: "ETS", theLoaiId: 3, namXuatBan: 2020, soLuong: 21
    },
    {
      id: 43, tieuDe: "Tiếng Hàn Tổng Hợp", tacGia: "Kim Ji-hoon", theLoaiId: 3, namXuatBan: 2015, soLuong: 18
    },
    {
      id: 44, tieuDe: "Oxford Picture Dictionary", tacGia: "Jayme Adelson-Goldstein", theLoaiId: 3, namXuatBan: 2017, soLuong: 14
    },
    {
      id: 45, tieuDe: "1000 Câu Giao Tiếp Khi Du Lịch", tacGia: "Nhiều tác giả", theLoaiId: 3, namXuatBan: 2013, soLuong: 19
    },
    {
      id: 46, tieuDe: "Tư Duy Phản Biện", tacGia: "Nhật Chiêu", theLoaiId: 4, namXuatBan: 2018, soLuong: 16
    },
    {
      id: 47, tieuDe: "Sức Mạnh Của Thói Quen", tacGia: "Charles Duhigg", theLoaiId: 4, namXuatBan: 2012, soLuong: 30
    },
    {
      id: 48, tieuDe: "Dám Bị Ghét", tacGia: "Ichiro Kishimi", theLoaiId: 4, namXuatBan: 2017, soLuong: 22
    },
    {
      id: 49, tieuDe: "Tỉnh Thức", tacGia: "Eckhart Tolle", theLoaiId: 4, namXuatBan: 2016, soLuong: 18
    },
    {
      id: 50, tieuDe: "Bí Quyết Thành Công", tacGia: "Napoleon Hill", theLoaiId: 4, namXuatBan: 2009, soLuong: 12
    },
    {
      id: 51, tieuDe: "Java Spring Boot Thực Chiến", tacGia: "Hoàng Trọng Tín", theLoaiId: 1, namXuatBan: 2023, soLuong: 10
    },
    {
      id: 52, tieuDe: "Lập Trình Web ASP.NET", tacGia: "Phạm Thành Danh", theLoaiId: 1, namXuatBan: 2021, soLuong: 9
    },
    {
      id: 53, tieuDe: "Thuật Toán AI Cơ Bản", tacGia: "Đỗ Văn Kiên", theLoaiId: 1, namXuatBan: 2022, soLuong: 7
    },
    {
      id: 54, tieuDe: "Machine Learning Ứng Dụng", tacGia: "Lương Minh Khoa", theLoaiId: 1, namXuatBan: 2023, soLuong: 5
    },
    {
      id: 55, tieuDe: "Khoa Học Dữ Liệu Python", tacGia: "Hồ Đức Bảo", theLoaiId: 1, namXuatBan: 2022, soLuong: 10
    },
    {
      id: 56, tieuDe: "Tuyển Tập Thơ Hàn Mặc Tử", tacGia: "Hàn Mặc Tử", theLoaiId: 2, namXuatBan: 2005, soLuong: 12
    },
    {
      id: 57, tieuDe: "Chí Phèo - Tác Phẩm Và Bình Luận", tacGia: "Nam Cao", theLoaiId: 2, namXuatBan: 2010, soLuong: 18
    },
    {
      id: 58, tieuDe: "Sherlock Holmes Tuyển Tập", tacGia: "Arthur Conan Doyle", theLoaiId: 2, namXuatBan: 2006, soLuong: 20
    },
    {
      id: 59, tieuDe: "Kính Vạn Hoa", tacGia: "Nguyễn Nhật Ánh", theLoaiId: 2, namXuatBan: 1995, soLuong: 30
    },
    {
      id: 60, tieuDe: "Totto-chan Cô Bé Bên Cửa Sổ", tacGia: "Tetsuko Kuroyanagi", theLoaiId: 2, namXuatBan: 1981, soLuong: 15
    }
  ],

  docGia: [
    { id: 1, hoTen: "Nguyễn Văn An", email: "an@gmail.com", dienThoai: "0901234561" },
    { id: 2, hoTen: "Trần Hoài Nam", email: "nam@gmail.com", dienThoai: "0901234562" },
    { id: 3, hoTen: "Lê Minh Hòa", email: "hoa@gmail.com", dienThoai: "0901234563" },
    { id: 4, hoTen: "Phạm Quốc Khánh", email: "khanh@gmail.com", dienThoai: "0901234564" },
    { id: 5, hoTen: "Nguyễn Thị Hương", email: "huong@gmail.com", dienThoai: "0901234565" },
    { id: 6, hoTen: "Đặng Trọng Phú", email: "phu@gmail.com", dienThoai: "0901234566" },
    { id: 7, hoTen: "Lê Thanh Sơn", email: "son@gmail.com", dienThoai: "0901234567" },
    { id: 8, hoTen: "Trần Thị Hải", email: "hai@gmail.com", dienThoai: "0901234568" },
    { id: 9, hoTen: "Hoàng Nhật Tân", email: "tan@gmail.com", dienThoai: "0901234569" },
    { id: 10, hoTen: "Nguyễn Thanh Trúc", email: "truc@gmail.com", dienThoai: "0901234570" },
    { id: 11, hoTen: "Phạm Gia Huy", email: "huy@gmail.com", dienThoai: "0901234571" },
    { id: 12, hoTen: "Nguyễn Minh Đức", email: "duc@gmail.com", dienThoai: "0901234572" },
    { id: 13, hoTen: "Lê Đình Hiếu", email: "hieu@gmail.com", dienThoai: "0901234573" },
    { id: 14, hoTen: "Hoàng Thu Trang", email: "thu@gmail.com", dienThoai: "0901234574" },
    { id: 15, hoTen: "Nguyễn Quang Minh", email: "minh@gmail.com", dienThoai: "0901234575" },
    { id: 16, hoTen: "Phạm Thu Thảo", email: "thao@gmail.com", dienThoai: "0901234576" },
    { id: 17, hoTen: "Lê Việt Anh", email: "anh@gmail.com", dienThoai: "0901234577" },
    { id: 18, hoTen: "Đỗ Nhật Nam", email: "nhatnam@gmail.com", dienThoai: "0901234578" },
    { id: 19, hoTen: "Lương Tiến Đạt", email: "dat@gmail.com", dienThoai: "0901234579" },
    { id: 20, hoTen: "Phan Ngọc Dung", email: "dung@gmail.com", dienThoai: "0901234580" },
    { id: 21, hoTen: "Hoàng Kim Ngân", email: "ngan@gmail.com", dienThoai: "0901234581" },
    { id: 22, hoTen: "Nguyễn Hữu Phước", email: "phuoc@gmail.com", dienThoai: "0901234582" },
    { id: 23, hoTen: "Trần Minh Tâm", email: "tam@gmail.com", dienThoai: "0901234583" },
    { id: 24, hoTen: "Lê Hải Yến", email: "yen@gmail.com", dienThoai: "0901234584" },
    { id: 25, hoTen: "Phạm Đức Toàn", email: "toan@gmail.com", dienThoai: "0901234585" }
  ],

  muonTra: [
    { id: 1, docGiaId: 3, sachId: 7, ngayMuon: "2024-01-03", hanTra: "2024-01-20", trangThai: "Đang mượn" },
    { id: 2, docGiaId: 5, sachId: 12, ngayMuon: "2024-01-04", hanTra: "2024-01-25", trangThai: "Đang mượn" },
    { id: 3, docGiaId: 10, sachId: 4, ngayMuon: "2024-01-10", hanTra: "2024-01-30", trangThai: "Đã trả" },
    { id: 4, docGiaId: 6, sachId: 22, ngayMuon: "2024-01-14", hanTra: "2024-02-05", trangThai: "Đang mượn" },
    { id: 5, docGiaId: 9, sachId: 1, ngayMuon: "2024-01-15", hanTra: "2024-02-01", trangThai: "Đã trả" }
  ],

  yeuCauDat: [
    { id: 1, docGiaId: 2, sachId: 10, ngayYeuCau: "2024-02-01", trangThai: "Chờ duyệt" },
    { id: 2, docGiaId: 7, sachId: 17, ngayYeuCau: "2024-02-02", trangThai: "Đã duyệt" },
    { id: 3, docGiaId: 12, sachId: 8, ngayYeuCau: "2024-02-04", trangThai: "Từ chối" },
    { id: 4, docGiaId: 14, sachId: 33, ngayYeuCau: "2024-02-05", trangThai: "Chờ duyệt" },
    { id: 5, docGiaId: 18, sachId: 41, ngayYeuCau: "2024-02-06", trangThai: "Đã duyệt" }
  ],

  admin: [
    { id: 1, taiKhoan: "admin", matKhau: "123456", vaiTro: "Quản trị viên" },
    { id: 2, taiKhoan: "manager", matKhau: "123456", vaiTro: "Nhân viên quản lý" },
    { id: 3, taiKhoan: "librarian", matKhau: "123456", vaiTro: "Thủ thư" }
  ]
};
// =====================================a
// PHẦN 2 — CÁC HÀM XỬ LÝ DỮ LIỆU THƯ VIỆN
// =====================================

// Khởi tạo dữ liệu nếu localStorage chưa có
function initializeLibraryData() {
  if (!localStorage.getItem("libraryData")) {
    localStorage.setItem("libraryData", JSON.stringify(libraryData));
    console.log("Đã khởi tạo dữ liệu thư viện vào localStorage");
  }
}

// Lấy dữ liệu từ localStorage
function getLibraryData() {
  const stored = localStorage.getItem("libraryData");
  if (!stored) {
    initializeLibraryData();
    return libraryData;
  }
  return JSON.parse(stored);
}

// Ghi dữ liệu trở lại localStorage
function updateLibraryData(newData) {
  localStorage.setItem("libraryData", JSON.stringify(newData));
  console.log("Đã cập nhật dữ liệu thư viện");
}

// ====================
// THAO TÁC VỚI SÁCH
// ====================

// Thêm sách mới
function addNewBook(book) {
  const data = getLibraryData();
  const maxId = data.sach.reduce((m, b) => Math.max(m, b.id), 0);

  const newBook = { ...book, id: maxId + 1 };
  data.sach.push(newBook);

  updateLibraryData(data);
  return newBook;
}

// Cập nhật thông tin sách
function updateBook(bookId, updated) {
  const data = getLibraryData();
  const idx = data.sach.findIndex(b => b.id === bookId);

  if (idx !== -1) {
    data.sach[idx] = { ...data.sach[idx], ...updated };
    updateLibraryData(data);
    return data.sach[idx];
  }
  return null;
}

// Xóa sách
function deleteBook(bookId) {
  const data = getLibraryData();
  const originalLength = data.sach.length;

  data.sach = data.sach.filter(b => b.id !== bookId);

  if (data.sach.length < originalLength) {
    updateLibraryData(data);
    return true;
  }
  return false;
}

// ===========================
// CHỨC NĂNG MƯỢN – TRẢ SÁCH
// ===========================

// Mượn sách (readerId = id độc giả)
function borrowBook(bookId, readerId) {
  const data = getLibraryData();
  const book = data.sach.find(b => b.id === bookId);

  if (!book) {
    return { success: false, message: "Sách không tồn tại" };
  }
  if (book.soLuong <= 0) {
    return { success: false, message: "Sách đã hết" };
  }

  // Giảm số lượng
  book.soLuong--;

  // Tạo bản ghi mượn
  const newId =
    data.muonTra.length > 0
      ? Math.max(...data.muonTra.map(m => m.id)) + 1
      : 1;

  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 14);

  const record = {
    id: newId,
    docGiaId: readerId,
    sachId: bookId,
    ngayMuon: today.toISOString().split("T")[0],
    hanTra: due.toISOString().split("T")[0],
    trangThai: "Đang mượn"
  };

  data.muonTra.push(record);
  updateLibraryData(data);

  return { success: true, borrowRecord: record };
}

// Trả sách
function returnBook(borrowId) {
  const data = getLibraryData();
  const idx = data.muonTra.findIndex(m => m.id === borrowId);

  if (idx === -1) {
    return { success: false, message: "Không tìm thấy phiếu mượn" };
  }

  const record = data.muonTra[idx];
  const book = data.sach.find(b => b.id === record.sachId);

  if (book) book.soLuong++;

  data.muonTra[idx].trangThai = "Đã trả";

  updateLibraryData(data);

  return { success: true, updatedRecord: data.muonTra[idx] };
}

// ==========================
// TÌM KIẾM & LỌC
// ==========================

// Tìm kiếm sách theo keyword
function searchBooks(keyword, categoryId = 0, year = 0) {
  let { sach } = getLibraryData();

  if (keyword) {
    keyword = keyword.toLowerCase();
    sach = sach.filter(
      b =>
        b.tieuDe.toLowerCase().includes(keyword) ||
        b.tacGia.toLowerCase().includes(keyword)
    );
  }

  if (categoryId > 0) {
    sach = sach.filter(b => b.theLoaiId === categoryId);
  }

  if (year > 0) {
    sach = sach.filter(b => b.namXuatBan === year);
  }

  return sach;
}

// Lấy sách theo thể loại
function getBooksByCategory(categoryId) {
  return getLibraryData().sach.filter(b => b.theLoaiId === categoryId);
}

// Lấy thông tin thể loại
function getCategoryInfo(categoryId) {
  return getLibraryData().theLoai.find(t => t.id === categoryId);
}

// Sách sắp hết (<= 5)
function getLowStockBooks() {
  return getLibraryData().sach.filter(b => b.soLuong > 0 && b.soLuong <= 5);
}

// Sách đã hết (= 0)
function getOutOfStockBooks() {
  return getLibraryData().sach.filter(b => b.soLuong === 0);
}

// Sách mới nhất
function getNewestBooks(limit = 10) {
  return [...getLibraryData().sach]
    .sort((a, b) => b.namXuatBan - a.namXuatBan)
    .slice(0, limit);
}

// ==========================
// THỐNG KÊ TỔNG HỢP
// ==========================
function getLibraryStats() {
  const data = getLibraryData();

  return {
    totalBooks: data.sach.length,
    totalReaders: data.docGia.length,
    borrowingCount: data.muonTra.filter(m => m.trangThai === "Đang mượn").length,
    lowStockCount: data.sach.filter(b => b.soLuong > 0 && b.soLuong <= 5).length,
    outOfStockCount: data.sach.filter(b => b.soLuong === 0).length,
    booksByCategory: data.theLoai.map(cat => ({
      category: cat.ten,
      count: data.sach.filter(b => b.theLoaiId === cat.id).length
    }))
  };
}
