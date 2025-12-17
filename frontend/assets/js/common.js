// common.js
function getData() {
  // data.js defines getLibraryData() and initializeLibraryData()
  if (typeof getLibraryData !== 'function') {
    console.error('Missing data.js. Vui lòng đặt data.js trong cùng thư mục.');
    return null;
  }
  return getLibraryData();
}

function makeSidebar(activeKey){
  const nav = [
    {key:'dashboard', label:'Bảng điều khiển', href:'dashboard.html', icon:'bi-speedometer2'},
    {key:'users', label:'Quản lý người dùng', href:'users.html', icon:'bi-people'},
    {key:'readers', label:'Độc giả', href:'readers.html', icon:'bi-person-badge'},
    {key:'books', label:'Quản lý sách', href:'books.html', icon:'bi-book'},
    {key:'devices', label:'Quản lý thiết bị', href:'devices.html', icon:'bi-hdd'},
    {key:'attendance', label:'Số điểm danh', href:'attendance.html', icon:'bi-journal-check'},
    {key:'history', label:'Lịch sử vay mượn', href:'history.html', icon:'bi-clock-history'},
    {key:'overdue', label:'Thông báo quá hạn', href:'overdue.html', icon:'bi-exclamation-circle'},
    {key:'logs', label:'Nhật ký toàn cầu', href:'logs.html', icon:'bi-journal-text'},
    {key:'backup', label:'Sao lưu & Khôi phục', href:'backup.html', icon:'bi-cloud-arrow-up'},
    {key:'change', label:'Thay đổi mật khẩu', href:'change-password.html', icon:'bi-key'}
  ];

  const container = document.createElement('div');
  container.className = 'sidebar-inner';
  container.innerHTML = `
    <div class="brand">
      <img src="https://api.iconify.design/mdi/library.svg?color=%234a3a2a" alt="logo"/>
      <div>
        <h6>Hệ thống thư viện</h6>
        <div style="font-size:12px;color:#7b5a44">Thư viện UCC</div>
      </div>
    </div>
  `;

  nav.forEach(n=>{
    const a = document.createElement('a');
    a.href = n.href;
    a.className = 'nav-link' + (n.key===activeKey ? ' active':'');
    a.innerHTML = `<i class="bi ${n.icon}"></i><span>${n.label}</span>`;
    container.appendChild(a);
  });

  return container;
}

function renderSidebar(activeKey){
  const side = document.querySelector('.sidebar');
  if(!side) return;
  side.innerHTML = '';
  side.appendChild(makeSidebar(activeKey));
}

function renderHeader(title){
  const header = document.querySelector('.header');
  if(!header) return;
  header.innerHTML = `
    <div class="d-flex align-items-center gap-3">
      <div class="title">${title}</div>
    </div>
    <div class="user">
      <div style="text-align:right">
        <div style="font-weight:600">John Anderson</div>
        <div style="font-size:12px;color:#9b9b9b">john.anderson@university.edu</div>
      </div>
      <div class="avatar">JA</div>
    </div>
  `;
}
