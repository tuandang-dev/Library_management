// data.js - Dữ liệu thư viện HAUI
const libraryData = {
  "theLoai": [
    { "id": 1, "ten": "Công nghệ thông tin" },
    { "id": 2, "ten": "Văn học" },
    { "id": 3, "ten": "Ngoại ngữ" },
    { "id": 4, "ten": "Kỹ năng sống" }
  ],

  "sach": [
    {
      "id": 1,
      "tieuDe": "Lập Trình Java Cơ Bản",
      "tacGia": "Nguyễn Văn A",
      "theLoaiId": 1,
      "namXuatBan": 2020,
      "soLuong": 12,
      "description": "Giới thiệu toàn diện về lập trình Java từ cơ bản đến nâng cao. Sách bao gồm các khái niệm cơ bản, hướng đối tượng, xử lý ngoại lệ và lập trình giao diện."
    },
    {
      "id": 2,
      "tieuDe": "Hướng Dẫn HTML & CSS",
      "tacGia": "Trần Thị B",
      "theLoaiId": 1,
      "namXuatBan": 2019,
      "soLuong": 7,
      "description": "Hướng dẫn chi tiết về phát triển web với HTML5 và CSS3. Bao gồm các kỹ thuật hiện đại như Flexbox, Grid và Responsive Design."
    },
    {
      "id": 3,
      "tieuDe": "Cấu Trúc Dữ Liệu & Giải Thuật",
      "tacGia": "Lê Minh C",
      "theLoaiId": 1,
      "namXuatBan": 2021,
      "soLuong": 5,
      "description": "Khám phá các cấu trúc dữ liệu và giải thuật cơ bản trong khoa học máy tính. Bao gồm mảng, danh sách liên kết, cây, đồ thị và các thuật toán sắp xếp, tìm kiếm."
    },
    {
      "id": 4,
      "tieuDe": "Văn Học Việt Nam Hiện Đại",
      "tacGia": "Tố Hữu",
      "theLoaiId": 2,
      "namXuatBan": 2015,
      "soLuong": 20,
      "description": "Tuyển tập các tác phẩm văn học Việt Nam hiện đại, phản ánh đời sống xã hội và tâm tư con người Việt Nam qua các thời kỳ."
    },
    {
      "id": 5,
      "tieuDe": "Tiếng Anh Giao Tiếp",
      "tacGia": "John Smith",
      "theLoaiId": 3,
      "namXuatBan": 2018,
      "soLuong": 9,
      "description": "Sách hướng dẫn tiếng Anh giao tiếp với các tình huống thực tế, từ cơ bản đến nâng cao, giúp người học tự tin trong giao tiếp."
    },
    {
      "id": 6,
      "tieuDe": "Kỹ Năng Sống Cho Sinh Viên",
      "tacGia": "Phạm Hương",
      "theLoaiId": 4,
      "namXuatBan": 2017,
      "soLuong": 14,
      "description": "Cung cấp các kỹ năng sống cần thiết cho sinh viên: quản lý thời gian, giao tiếp, làm việc nhóm và phát triển bản thân."
    },
    {
      "id": 7,
      "tieuDe": "Lập Trình Python Cơ Bản",
      "tacGia": "Nguyễn Tấn Dũng",
      "theLoaiId": 1,
      "namXuatBan": 2021,
      "soLuong": 10,
      "description": "Hướng dẫn lập trình Python từ cơ bản, phù hợp cho người mới bắt đầu. Bao gồm cú pháp, cấu trúc dữ liệu và ứng dụng thực tế."
    },
    {
      "id": 8,
      "tieuDe": "Lập Trình Web với JavaScript",
      "tacGia": "Hoàng Long",
      "theLoaiId": 1,
      "namXuatBan": 2022,
      "soLuong": 8,
      "description": "Khám phá lập trình web hiện đại với JavaScript, bao gồm ES6+, DOM manipulation, và các framework phổ biến."
    },
    {
      "id": 9,
      "tieuDe": "ReactJS Nâng Cao",
      "tacGia": "Phạm Chí Tài",
      "theLoaiId": 1,
      "namXuatBan": 2023,
      "soLuong": 11,
      "description": "Hướng dẫn nâng cao về ReactJS với hooks, context API, performance optimization và testing."
    },
    {
      "id": 10,
      "tieuDe": "NodeJS Cho Người Mới",
      "tacGia": "Trần Hữu Nghĩa",
      "theLoaiId": 1,
      "namXuatBan": 2020,
      "soLuong": 6,
      "description": "Giới thiệu về NodeJS và phát triển backend, bao gồm Express.js, REST API, và kết nối database."
    },
    {
      "id": 11,
      "tieuDe": "Phân Tích Thiết Kế Hệ Thống",
      "tacGia": "Nguyễn Hữu Khoa",
      "theLoaiId": 1,
      "namXuatBan": 2018,
      "soLuong": 9,
      "description": "Hướng dẫn phân tích và thiết kế hệ thống phần mềm, từ yêu cầu đến triển khai."
    },
    {
      "id": 12,
      "tieuDe": "SQL Server Từ Cơ Bản Đến Nâng Cao",
      "tacGia": "Lê Văn Minh",
      "theLoaiId": 1,
      "namXuatBan": 2021,
      "soLuong": 16,
      "description": "Học SQL Server từ cơ bản đến nâng cao, bao gồm truy vấn, quản lý database và optimization."
    },
    {
      "id": 13,
      "tieuDe": "MongoDB Thực Hành",
      "tacGia": "Hồ Thanh Sơn",
      "theLoaiId": 1,
      "namXuatBan": 2019,
      "soLuong": 6,
      "description": "Thực hành với MongoDB, database NoSQL phổ biến cho ứng dụng hiện đại."
    },
    {
      "id": 14,
      "tieuDe": "Docker & DevOps",
      "tacGia": "Đặng Ngọc Hải",
      "theLoaiId": 1,
      "namXuatBan": 2022,
      "soLuong": 10,
      "description": "Hướng dẫn sử dụng Docker và các công cụ DevOps để triển khai ứng dụng hiệu quả."
    },
    {
      "id": 15,
      "tieuDe": "Lập Trình Kotlin",
      "tacGia": "Hoàng Văn Tú",
      "theLoaiId": 1,
      "namXuatBan": 2020,
      "soLuong": 12,
      "description": "Học lập trình Kotlin cho phát triển Android và ứng dụng đa nền tảng."
    },
    {
      "id": 16,
      "tieuDe": "Văn Học Trung Đại Việt Nam",
      "tacGia": "Nhiều tác giả",
      "theLoaiId": 2,
      "namXuatBan": 2010,
      "soLuong": 18,
      "description": "Tuyển tập các tác phẩm văn học trung đại Việt Nam, phản ánh văn hóa và lịch sử dân tộc."
    },
    {
      "id": 17,
      "tieuDe": "Tác Phẩm Chọn Lọc - Nam Cao",
      "tacGia": "Nam Cao",
      "theLoaiId": 2,
      "namXuatBan": 2013,
      "soLuong": 22,
      "description": "Tuyển tập các tác phẩm tiêu biểu của nhà văn Nam Cao, đại diện cho văn học hiện thực Việt Nam."
    },
    {
      "id": 18,
      "tieuDe": "Tuyển Tập Thơ Xuân Diệu",
      "tacGia": "Xuân Diệu",
      "theLoaiId": 2,
      "namXuatBan": 2014,
      "soLuong": 17,
      "description": "Tuyển tập thơ của Xuân Diệu, ông hoàng thơ tình Việt Nam với những vần thơ lãng mạn."
    },
    {
      "id": 19,
      "tieuDe": "Tố Tâm",
      "tacGia": "Hoàng Ngọc Phách",
      "theLoaiId": 2,
      "namXuatBan": 2009,
      "soLuong": 10,
      "description": "Tiểu thuyết lãng mạn nổi tiếng của Hoàng Ngọc Phách, tác phẩm tiêu biểu của văn học Việt Nam đầu thế kỷ 20."
    },
    {
      "id": 20,
      "tieuDe": "Dế Mèn Phiêu Lưu Ký",
      "tacGia": "Tô Hoài",
      "theLoaiId": 2,
      "namXuatBan": 2011,
      "soLuong": 25,
      "description": "Tác phẩm thiếu nhi kinh điển của Tô Hoài, kể về cuộc phiêu lưu của chú Dế Mèn."
    },
    {
      "id": 21,
      "tieuDe": "Ngữ Pháp Tiếng Anh Hiện Đại",
      "tacGia": "Raymond Murphy",
      "theLoaiId": 3,
      "namXuatBan": 2017,
      "soLuong": 15,
      "description": "Cung cấp kiến thức ngữ pháp tiếng Anh từ cơ bản đến nâng cao với giải thích rõ ràng và bài tập thực hành."
    },
    {
      "id": 22,
      "tieuDe": "600 Từ Vựng TOEIC",
      "tacGia": "Nhiều tác giả",
      "theLoaiId": 3,
      "namXuatBan": 2018,
      "soLuong": 30,
      "description": "Tập hợp 600 từ vựng thường gặp trong kỳ thi TOEIC, giúp nâng cao điểm số."
    },
    {
      "id": 23,
      "tieuDe": "Tự Học IELTS 7.0",
      "tacGia": "Nguyễn Thị Trang",
      "theLoaiId": 3,
      "namXuatBan": 2022,
      "soLuong": 13,
      "description": "Hướng dẫn tự học IELTS đạt 7.0 với chiến lược làm bài và luyện tập hiệu quả."
    },
    {
      "id": 24,
      "tieuDe": "Tiếng Nhật Sơ Cấp N5",
      "tacGia": "Sato Haruki",
      "theLoaiId": 3,
      "namXuatBan": 2016,
      "soLuong": 18,
      "description": "Giáo trình tiếng Nhật sơ cấp cho người mới bắt đầu, chuẩn bị cho kỳ thi JLPT N5."
    },
    {
      "id": 25,
      "tieuDe": "Hán Ngữ Tập 1",
      "tacGia": "Lý Hạo",
      "theLoaiId": 3,
      "namXuatBan": 2015,
      "soLuong": 14,
      "description": "Giáo trình Hán ngữ cơ bản cho người mới học tiếng Trung."
    },
    {
      "id": 26,
      "tieuDe": "Tư Duy Tích Cực",
      "tacGia": "Norman Vincent Peale",
      "theLoaiId": 4,
      "namXuatBan": 2012,
      "soLuong": 11,
      "description": "Phát triển tư duy tích cực để vượt qua khó khăn và đạt được thành công trong cuộc sống."
    },
    {
      "id": 27,
      "tieuDe": "Đắc Nhân Tâm",
      "tacGia": "Dale Carnegie",
      "theLoaiId": 4,
      "namXuatBan": 2014,
      "soLuong": 40,
      "description": "Nghệ thuật thu phục lòng người và xây dựng mối quan hệ tốt đẹp."
    },
    {
      "id": 28,
      "tieuDe": "Quẳng Gánh Lo Đi Và Vui Sống",
      "tacGia": "Dale Carnegie",
      "theLoaiId": 4,
      "namXuatBan": 2011,
      "soLuong": 22,
      "description": "Phương pháp loại bỏ lo lắng và sống hạnh phúc hơn mỗi ngày."
    },
    {
      "id": 29,
      "tieuDe": "7 Thói Quen Hiệu Quả",
      "tacGia": "Stephen Covey",
      "theLoaiId": 4,
      "namXuatBan": 2013,
      "soLuong": 18,
      "description": "7 thói quen giúp bạn trở nên hiệu quả trong công việc và cuộc sống."
    },
    {
      "id": 30,
      "tieuDe": "Nghệ Thuật Giao Tiếp",
      "tacGia": "Brian Tracy",
      "theLoaiId": 4,
      "namXuatBan": 2016,
      "soLuong": 20,
      "description": "Kỹ năng giao tiếp hiệu quả trong mọi tình huống."
    }
  ],

  "docGia": [
    {
      "id": 1,
      "hoTen": "Nguyễn Văn An",
      "email": "an@gmail.com",
      "dienThoai": "0901234561"
    },
    {
      "id": 2,
      "hoTen": "Trần Hoài Nam",
      "email": "nam@gmail.com",
      "dienThoai": "0901234562"
    },
    {
      "id": 3,
      "hoTen": "Lê Minh Hòa",
      "email": "hoa@gmail.com",
      "dienThoai": "0901234563"
    },
    {
      "id": 4,
      "hoTen": "Phạm Quốc Khánh",
      "email": "khanh@gmail.com",
      "dienThoai": "0901234564"
    },
    {
      "id": 5,
      "hoTen": "Nguyễn Thị Hương",
      "email": "huong@gmail.com",
      "dienThoai": "0901234565"
    },
    {
      "id": 6,
      "hoTen": "Đặng Trọng Phú",
      "email": "phu@gmail.com",
      "dienThoai": "0901234566"
    },
    {
      "id": 7,
      "hoTen": "Lê Thanh Sơn",
      "email": "son@gmail.com",
      "dienThoai": "0901234567"
    },
    {
      "id": 8,
      "hoTen": "Trần Thị Hải",
      "email": "hai@gmail.com",
      "dienThoai": "0901234568"
    },
    {
      "id": 9,
      "hoTen": "Hoàng Nhật Tân",
      "email": "tan@gmail.com",
      "dienThoai": "0901234569"
    },
    {
      "id": 10,
      "hoTen": "Nguyễn Thanh Trúc",
      "email": "truc@gmail.com",
      "dienThoai": "0901234570"
    }
  ],

  "muonTra": [
    {
      "id": 1,
      "docGiaId": 3,
      "sachId": 7,
      "ngayMuon": "2024-01-03",
      "hanTra": "2024-01-20",
      "trangThai": "Đang mượn"
    },
    {
      "id": 2,
      "docGiaId": 5,
      "sachId": 12,
      "ngayMuon": "2024-01-04",
      "hanTra": "2024-01-25",
      "trangThai": "Đang mượn"
    },
    {
      "id": 3,
      "docGiaId": 10,
      "sachId": 4,
      "ngayMuon": "2024-01-10",
      "hanTra": "2024-01-30",
      "trangThai": "Đã trả"
    },
    {
      "id": 4,
      "docGiaId": 6,
      "sachId": 22,
      "ngayMuon": "2024-01-14",
      "hanTra": "2024-02-05",
      "trangThai": "Đang mượn"
    },
    {
      "id": 5,
      "docGiaId": 9,
      "sachId": 1,
      "ngayMuon": "2024-01-15",
      "hanTra": "2024-02-01",
      "trangThai": "Đã trả"
    }
  ],

  "yeuCauDat": [
    {
      "id": 1,
      "docGiaId": 2,
      "sachId": 10,
      "ngayYeuCau": "2024-02-01",
      "trangThai": "Chờ duyệt"
    },
    {
      "id": 2,
      "docGiaId": 7,
      "sachId": 17,
      "ngayYeuCau": "2024-02-02",
      "trangThai": "Đã duyệt"
    },
    {
      "id": 3,
      "docGiaId": 12,
      "sachId": 8,
      "ngayYeuCau": "2024-02-04",
      "trangThai": "Từ chối"
    },
    {
      "id": 4,
      "docGiaId": 14,
      "sachId": 33,
      "ngayYeuCau": "2024-02-05",
      "trangThai": "Chờ duyệt"
    },
    {
      "id": 5,
      "docGiaId": 18,
      "sachId": 41,
      "ngayYeuCau": "2024-02-06",
      "trangThai": "Đã duyệt"
    }
  ],

  "admin": [
    {
      "id": 1,
      "taiKhoan": "admin",
      "matKhau": "123456",
      "vaiTro": "Quản trị viên"
    },
    {
      "id": 2,
      "taiKhoan": "manager",
      "matKhau": "123456",
      "vaiTro": "Nhân viên quản lý"
    },
    {
      "id": 3,
      "taiKhoan": "librarian",
      "matKhau": "123456",
      "vaiTro": "Thủ thư"
    }
  ]
};

// Hàm khởi tạo dữ liệu trong localStorage nếu chưa có
function initializeLibraryData() {
  if (!localStorage.getItem('libraryData')) {
    localStorage.setItem('libraryData', JSON.stringify(libraryData));
    console.log('Đã khởi tạo dữ liệu thư viện vào localStorage');
  }
}

// Hàm lấy dữ liệu từ localStorage
function getLibraryData() {
  const storedData = localStorage.getItem('libraryData');
  if (!storedData) {
    initializeLibraryData();
    return libraryData;
  }
  return JSON.parse(storedData);
}

// Hàm cập nhật dữ liệu vào localStorage
function updateLibraryData(newData) {
  localStorage.setItem('libraryData', JSON.stringify(newData));
  console.log('Đã cập nhật dữ liệu thư viện');
}

// Hàm thêm sách mới
function addNewBook(book) {
  const data = getLibraryData();
  // Tạo ID mới (tìm ID lớn nhất + 1)
  const maxId = data.sach.reduce((max, book) => Math.max(max, book.id), 0);
  const newBook = {
    ...book,
    id: maxId + 1
  };
  data.sach.push(newBook);
  updateLibraryData(data);
  return newBook;
}

// Hàm cập nhật thông tin sách
function updateBook(bookId, updatedBook) {
  const data = getLibraryData();
  const bookIndex = data.sach.findIndex(book => book.id === bookId);
  if (bookIndex !== -1) {
    data.sach[bookIndex] = { ...data.sach[bookIndex], ...updatedBook };
    updateLibraryData(data);
    return data.sach[bookIndex];
  }
  return null;
}

// Hàm xóa sách
function deleteBook(bookId) {
  const data = getLibraryData();
  const initialLength = data.sach.length;
  data.sach = data.sach.filter(book => book.id !== bookId);
  if (data.sach.length < initialLength) {
    updateLibraryData(data);
    return true;
  }
  return false;
}

// Hàm mượn sách
function borrowBook(bookId, readerId) {
  const data = getLibraryData();
  const book = data.sach.find(b => b.id === bookId);
  
  if (!book || book.soLuong === 0) {
    return { success: false, message: 'Sách không tồn tại hoặc đã hết' };
  }
  
  // Giảm số lượng sách
  book.soLuong -= 1;
  
  // Thêm vào lịch sử mượn
  const borrowId = data.muonTra.length > 0 ? Math.max(...data.muonTra.map(m => m.id)) + 1 : 1;
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 14); // Hạn trả sau 14 ngày
  
  const borrowRecord = {
    id: borrowId,
    docGiaId: readerId,
    sachId: bookId,
    ngayMuon: today.toISOString().split('T')[0],
    hanTra: dueDate.toISOString().split('T')[0],
    trangThai: "Đang mượn"
  };
  
  data.muonTra.push(borrowRecord);
  updateLibraryData(data);
  
  return { 
    success: true, 
    message: 'Mượn sách thành công',
    borrowRecord,
    remainingStock: book.soLuong
  };
}

// Hàm trả sách
function returnBook(borrowId) {
  const data = getLibraryData();
  const borrowIndex = data.muonTra.findIndex(b => b.id === borrowId);
  
  if (borrowIndex === -1) {
    return { success: false, message: 'Không tìm thấy phiếu mượn' };
  }
  
  const borrowRecord = data.muonTra[borrowIndex];
  const book = data.sach.find(b => b.id === borrowRecord.sachId);
  
  if (book) {
    book.soLuong += 1;
  }
  
  data.muonTra[borrowIndex].trangThai = "Đã trả";
  updateLibraryData(data);
  
  return { 
    success: true, 
    message: 'Trả sách thành công',
    borrowRecord,
    updatedStock: book ? book.soLuong : null
  };
}

// Hàm tìm kiếm sách
function searchBooks(keyword, categoryId = 0, year = 0) {
  const data = getLibraryData();
  let results = data.sach;
  
  // Tìm kiếm theo từ khóa
  if (keyword) {
    const searchTerm = keyword.toLowerCase();
    results = results.filter(book => 
      book.tieuDe.toLowerCase().includes(searchTerm) ||
      book.tacGia.toLowerCase().includes(searchTerm)
    );
  }
  
  // Lọc theo thể loại
  if (categoryId > 0) {
    results = results.filter(book => book.theLoaiId === categoryId);
  }
  
  // Lọc theo năm xuất bản
  if (year > 0) {
    results = results.filter(book => book.namXuatBan === year);
  }
  
  return results;
}

// Hàm lấy sách theo thể loại
function getBooksByCategory(categoryId) {
  const data = getLibraryData();
  return data.sach.filter(book => book.theLoaiId === categoryId);
}

// Hàm lấy thông tin thể loại
function getCategoryInfo(categoryId) {
  const data = getLibraryData();
  return data.theLoai.find(cat => cat.id === categoryId);
}

// Hàm lấy sách sắp hết (số lượng <= 5)
function getLowStockBooks() {
  const data = getLibraryData();
  return data.sach.filter(book => book.soLuong > 0 && book.soLuong <= 5);
}

// Hàm lấy sách đã hết
function getOutOfStockBooks() {
  const data = getLibraryData();
  return data.sach.filter(book => book.soLuong === 0);
}

// Hàm lấy sách mới nhất (năm xuất bản gần đây)
function getNewestBooks(limit = 10) {
  const data = getLibraryData();
  return [...data.sach]
    .sort((a, b) => b.namXuatBan - a.namXuatBan)
    .slice(0, limit);
}

// Hàm lấy thống kê
function getLibraryStats() {
  const data = getLibraryData();
  
  const totalBooks = data.sach.length;
  const totalReaders = data.docGia.length;
  const totalBorrowed = data.muonTra.filter(m => m.trangThai === "Đang mượn").length;
  
  const booksByCategory = {};
  data.theLoai.forEach(category => {
    booksByCategory[category.id] = data.sach.filter(book => book.theLoaiId === category.id).length;
  });
  
  const lowStockCount = data.sach.filter(book => book.soLuong > 0 && book.soLuong <= 5).length;
  const outOfStockCount = data.sach.filter(book => book.soLuong === 0).length;
  
  return {
    totalBooks,
    totalReaders,
    totalBorrowed,
    booksByCategory,
    lowStockCount,
    outOfStockCount
  };
}

// Xuất các hàm và dữ liệu để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    libraryData,
    initializeLibraryData,
    getLibraryData,
    updateLibraryData,
    addNewBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    searchBooks,
    getBooksByCategory,
    getCategoryInfo,
    getLowStockBooks,
    getOutOfStockBooks,
    getNewestBooks,
    getLibraryStats
  };
}