document.addEventListener('DOMContentLoaded', () => {
    const btnToggleScan = document.getElementById('btnToggleScan');
    const btnScanText = document.getElementById('btnScanText');
    const scannerPlaceholder = document.getElementById('scannerPlaceholder');
    const qrReader = document.getElementById('qrReader');
    const manualTicketInput = document.getElementById('manualTicketInput');
    const btnManualVerify = document.getElementById('btnManualVerify');

    const scanResultEmpty = document.getElementById('scanResultEmpty');
    const scanResultContent = document.getElementById('scanResultContent');
    const resStudentName = document.getElementById('resStudentName');
    const resStudentCode = document.getElementById('resStudentCode');
    const resTicketId = document.getElementById('resTicketId');
    const resGeneratedAt = document.getElementById('resGeneratedAt');
    const resBooksCountHeader = document.getElementById('resBooksCountHeader');
    const resBooksList = document.getElementById('resBooksList');
    const btnCheckoutText = document.getElementById('btnCheckoutText');

    let html5QrCode = null;
    let isScanning = false;
    window.currentTicketData = null;

    if (btnToggleScan) {
        btnToggleScan.addEventListener('click', async () => {
            if (!isScanning) {
                await startScanning();
            } else {
                await stopScanning();
            }
        });
    }

    async function startScanning() {
        try {
            scannerPlaceholder.classList.add('d-none');
            qrReader.classList.remove('d-none');
            btnScanText.textContent = 'Stop Scanning';
            btnToggleScan.style.backgroundColor = '#dc2626';
            isScanning = true;

            html5QrCode = new Html5Qrcode('qrReader');
            const cameraConfig = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            };

            await html5QrCode.start(
                { facingMode: 'environment' },
                cameraConfig,
                async (decodedText) => {
                    console.log('[Admin Scanner] Đã đọc mã QR:', decodedText);
                    await stopScanning();
                    await processTicketData(decodedText);
                },
                (errorMessage) => {

                }
            );
        } catch (err) {
            console.error('[Admin Scanner] Lỗi khởi động camera:', err);
            alert('Không thể truy cập camera! Vui lòng kiểm tra quyền truy cập trên trình duyệt.');
            await stopScanning();
        }
    }

    async function stopScanning() {
        if (html5QrCode && html5QrCode.isScanning) {
            try {
                await html5QrCode.stop();
                await html5QrCode.clear();
            } catch (err) {
                console.warn('[Admin Scanner] Lỗi khi dừng camera:', err);
            }
        }

        isScanning = false;
        scannerPlaceholder.classList.remove('d-none');
        qrReader.classList.add('d-none');
        btnScanText.textContent = 'Start Scanning';
        btnToggleScan.style.backgroundColor = '';
    }

    window.addEventListener('beforeunload', () => {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => { });
        }
    });

    if (btnManualVerify) {
        btnManualVerify.addEventListener('click', () => {
            handleManualInput();
        });
    }

    if (manualTicketInput) {
        manualTicketInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleManualInput();
            }
        });
    }

    function handleManualInput() {
        const rawValue = manualTicketInput.value.trim();
        if (!rawValue) {
            alert('Vui lòng nhập Ticket ID hoặc dữ liệu vé QR!');
            manualTicketInput.focus();
            return;
        }
        processTicketData(rawValue);
    }

    async function processTicketData(rawInput) {
        try {
            if (btnManualVerify) {
                btnManualVerify.disabled = true;
                btnManualVerify.textContent = 'Verifying...';
            }

            const response = await fetch('/admin/scanner/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticketData: rawInput }),
            });

            const result = await response.json();

            if (response.ok && result.success && result.data) {
                renderTicketResult(result.data);
            } else {
                alert(result.message || 'Mã vé không hợp lệ hoặc đã hết hạn sử dụng!');
                showEmptyState();
                if (manualTicketInput) {
                    manualTicketInput.focus();
                    manualTicketInput.select();
                }
            }
        } catch (error) {
            console.error('[Admin Scanner] Lỗi khi xác thực vé:', error);
            alert('Lỗi kết nối máy chủ khi kiểm tra vé. Vui lòng kiểm tra lại đường truyền!');
            showEmptyState();
        } finally {
            if (btnManualVerify) {
                btnManualVerify.disabled = false;
                btnManualVerify.textContent = 'Verify';
            }
        }
    }

    function renderTicketResult(data) {
        window.currentTicketData = data;

        resStudentName.textContent = data.studentName || 'Unknown Student';
        resStudentCode.textContent = data.studentCode || 'STU-ACTIVE';
        resTicketId.textContent = data.ticketId || 'N/A';
        resGeneratedAt.textContent = data.generatedAt || new Date().toLocaleString('en-US');

        const books = Array.isArray(data.books) ? data.books : [];
        resBooksCountHeader.textContent = `Books (${books.length})`;
        btnCheckoutText.textContent = `Complete Checkout (${books.length} book${books.length > 1 ? 's' : ''})`;

        resBooksList.innerHTML = '';
        if (books.length > 0) {
            books.forEach((book, index) => {
                const bookItem = document.createElement('div');
                bookItem.className = 'admin-scanner__book-item mb-2';
                bookItem.innerHTML = `
                    <span class="admin-scanner__book-index">${index + 1}.</span>
                    <div class="admin-scanner__book-meta">
                        <p class="admin-scanner__book-title mb-0 font-weight-bold">${escapeHtml(book.title || 'Untitled Book')}</p>
                        <p class="admin-scanner__book-author text-muted small mb-0">${escapeHtml(book.author || 'Unknown Author')}</p>
                    </div>
                `;
                resBooksList.appendChild(bookItem);
            });
        } else {
            resBooksList.innerHTML = '<p class="text-muted small mb-0">No books attached to this ticket.</p>';
        }

        scanResultEmpty.classList.add('d-none');
        scanResultContent.classList.remove('d-none');
    }

    function showEmptyState() {
        window.currentTicketData = null;
        scanResultEmpty.classList.remove('d-none');
        scanResultContent.classList.add('d-none');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    const btnActionCheckout = document.getElementById('btnActionCheckout');
    const btnActionReturn = document.getElementById('btnActionReturn');
    const btnActionAttendance = document.getElementById('btnActionAttendance');

    if (btnActionCheckout) {
        btnActionCheckout.addEventListener('click', async () => {
            if (!window.currentTicketData) {
                alert('Vui lòng quét hoặc xác thực vé mượn trước khi thực hiện!');
                return;
            }

            const ticket = window.currentTicketData;
            if (!ticket.books || ticket.books.length === 0) {
                alert('Vé mượn này không có cuốn sách nào để mượn!');
                return;
            }

            const confirmMsg = `Xác nhận cho sinh viên ${ticket.studentName} mượn ${ticket.books.length} cuốn sách?`;
            if (!confirm(confirmMsg)) return;

            try {
                btnActionCheckout.disabled = true;
                const originalHtml = btnActionCheckout.innerHTML;
                btnActionCheckout.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Processing...';

                const response = await fetch('/admin/scanner/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ticketId: ticket.ticketId,
                        userId: ticket.userId,
                        books: ticket.books,
                    }),
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert(result.message);
                    const bookTitles = ticket.books.map((b) => b.title).join(', ');
                    prependScanHistory({
                        studentName: ticket.studentName,
                        studentIdentifier: ticket.studentCode,
                        description: `Completed checkout of ${ticket.books.length} book(s) [${bookTitles}]`,
                        staffName: 'Sarah Chen',
                        badgeClass: 'admin-scanner__badge--checkout',
                        badgeText: 'Checkout Completed',
                    });
                    showEmptyState();
                    if (manualTicketInput) manualTicketInput.value = '';
                } else {
                    alert(result.message || 'Không thể hoàn tất thủ tục mượn sách!');
                }
            } catch (err) {
                console.error('[Admin Scanner] Lỗi khi Checkout:', err);
                alert('Lỗi kết nối máy chủ khi thực hiện mượn sách!');
            } finally {
                btnActionCheckout.disabled = false;
                btnActionCheckout.innerHTML = `<i class="fa-solid fa-check mr-2"></i> <span id="btnCheckoutText">Complete Checkout</span>`;
            }
        });
    }

    if (btnActionReturn) {
        btnActionReturn.addEventListener('click', async () => {
            if (!window.currentTicketData) {
                alert('Vui lòng quét vé hoặc nhập thông tin độc giả cần trả sách!');
                return;
            }

            const ticket = window.currentTicketData;
            const confirmMsg = `Xác nhận nhận trả sách cho độc giả ${ticket.studentName}?`;
            if (!confirm(confirmMsg)) return;

            try {
                btnActionReturn.disabled = true;
                const originalHtml = btnActionReturn.innerHTML;
                btnActionReturn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Processing...';

                const response = await fetch('/admin/scanner/return', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: ticket.userId,
                        books: ticket.books,
                    }),
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert(result.message);
                    const bookTitles = (ticket.books || []).map((b) => b.title).join(', ');
                    prependScanHistory({
                        studentName: ticket.studentName,
                        studentIdentifier: ticket.studentCode,
                        description: `Processed return of ${(ticket.books || []).length} book(s) [${bookTitles}]`,
                        staffName: 'Sarah Chen',
                        badgeClass: 'admin-scanner__badge--return',
                        badgeText: 'Book Returned',
                    });
                    showEmptyState();
                    if (manualTicketInput) manualTicketInput.value = '';
                } else {
                    alert(result.message || 'Không thể xử lý trả sách!');
                }
            } catch (err) {
                console.error('[Admin Scanner] Lỗi khi Return sách:', err);
                alert('Lỗi kết nối máy chủ khi xử lý trả sách!');
            } finally {
                btnActionReturn.disabled = false;
                btnActionReturn.innerHTML = `<i class="fa-solid fa-arrow-rotate-left mr-2"></i> <span>Process Book Return</span>`;
            }
        });
    }

    if (btnActionAttendance) {
        btnActionAttendance.addEventListener('click', async () => {
            if (!window.currentTicketData) {
                alert('Vui lòng quét mã sinh viên để ghi nhận điểm danh!');
                return;
            }

            const ticket = window.currentTicketData;

            try {
                btnActionAttendance.disabled = true;
                btnActionAttendance.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Recording...';

                const response = await fetch('/admin/scanner/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: ticket.userId,
                        studentCode: ticket.studentCode,
                    }),
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert(result.message);
                    prependScanHistory({
                        studentName: ticket.studentName,
                        studentIdentifier: ticket.studentCode,
                        description: `Recorded library check-in for ${ticket.studentName} (${ticket.studentEmail})`,
                        staffName: 'Sarah Chen',
                        badgeClass: 'admin-scanner__badge--neutral',
                        badgeText: 'Attendance Recorded',
                    });
                    showEmptyState();
                    if (manualTicketInput) manualTicketInput.value = '';
                } else {
                    alert(result.message || 'Không thể ghi nhận điểm danh!');
                }
            } catch (err) {
                console.error('[Admin Scanner] Lỗi khi điểm danh:', err);
                alert('Lỗi kết nối máy chủ khi ghi nhận điểm danh!');
            } finally {
                btnActionAttendance.disabled = false;
                btnActionAttendance.innerHTML = `<i class="fa-solid fa-clipboard-user mr-2"></i> <span>Record Attendance</span>`;
            }
        });
    }

    function prependScanHistory({ studentName, studentIdentifier, description, staffName, badgeClass, badgeText }) {
        const scanHistoryList = document.getElementById('scanHistoryList');
        if (!scanHistoryList) return;

        const emptyNotice = scanHistoryList.querySelector('.text-center.py-4');
        if (emptyNotice) {
            emptyNotice.remove();
        }

        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const formattedTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const item = document.createElement('div');
        item.className = 'admin-scanner__history-item';
        item.innerHTML = `
            <div class="admin-scanner__history-left">
                <div class="admin-scanner__history-user">
                    <span class="admin-scanner__history-name">${escapeHtml(studentName || 'Student Reader')}</span>
                    <span class="admin-scanner__history-id">(${escapeHtml(studentIdentifier || 'STU-VERIFIED')})</span>
                </div>
                <div class="admin-scanner__history-desc">${escapeHtml(description || 'Processed transaction at desk')}</div>
                <div class="admin-scanner__history-staff">Processed by: ${escapeHtml(staffName || 'Sarah Chen')}</div>
            </div>
            <div class="admin-scanner__history-right">
                <span class="admin-scanner__badge ${badgeClass}">${escapeHtml(badgeText)}</span>
                <span class="admin-scanner__history-time">${formattedTime}</span>
            </div>
        `;

        scanHistoryList.prepend(item);
    }
});