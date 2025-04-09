document.addEventListener("DOMContentLoaded", function() {
    console.log("Đã tải trang chi tiết sự kiện");
    
    // Xử lý nút back to top
    const backToTop = document.querySelector(".back-to-top");
    
    window.addEventListener("scroll", function() {
        if (window.scrollY > 300) {
            backToTop.classList.add("active");
        } else {
            backToTop.classList.remove("active");
        }
    });
    
    if (backToTop) {
        backToTop.addEventListener("click", function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
    
    // Lấy thông tin sự kiện từ URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug") || "hoi-thao-tai-chinh-ngan-hang-ky-nguyen-so"; // Mặc định nếu không có
    
    console.log("Đang tìm sự kiện với slug:", slug);
    
    // Tải dữ liệu sự kiện từ file JSON
    loadEventData(slug);
    
    // Thiết lập form đăng ký
    setupRegistrationForm();
    
    // Thiết lập chia sẻ QR Code
    setupQRCodeShare();
});

// Tải dữ liệu sự kiện từ file JSON
async function loadEventData(slug) {
    try {
        // Thử nhiều đường dẫn khác nhau để tìm file JSON
        const basePaths = [
            "http://127.0.0.1:5500/template/data/su-kien.json",
        ];
        
        console.log("Đang thử tải dữ liệu từ các đường dẫn có thể");
        console.log("URL hiện tại:", window.location.href);
        
        // Hiển thị trạng thái đang tải
        updateLoadingState(true);
        
        // Lưu lỗi để hiển thị nếu không tìm thấy file
        let lastError = null;
        let data = null;
        let successPath = null;
        
        // Thử tất cả các đường dẫn có thể
        for (const path of basePaths) {
            try {
                console.log(`Đang thử tải từ: ${path}`);
                const response = await fetch(path);
                
                if (response.ok) {
                    const jsonData = await response.json();
                    console.log(`Đã tải thành công từ: ${path}`);
                    console.log("Dữ liệu đã nhận:", jsonData);
                    data = jsonData;
                    successPath = path;
                    break;
                } else {
                    console.log(`Không thể tải từ ${path}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`Lỗi khi tải từ ${path}:`, error.message);
                lastError = error;
            }
        }
        
        // Nếu không tìm thấy file, tạo dữ liệu mẫu để test
        if (!data) {
            console.warn("Không thể tải dữ liệu - sử dụng dữ liệu mẫu để kiểm tra");
            
            // Dữ liệu mẫu để kiểm tra
            data = [
                {
                    "su_kien_id": 1,
                    "ten_su_kien": "[Dữ liệu mẫu] Hội thảo khoa học Tài chính và Ngân hàng",
                    "mo_ta": "Đây là dữ liệu mẫu vì không thể tải được dữ liệu thực từ file JSON.",
                    "dia_diem": "CS Tôn Thất Đạm",
                    "dia_chi_cu_the": "36 Tôn Thất Đạm, Quận 1, TP.HCM",
                    "thoi_gian_bat_dau": "2025-06-15 08:00:00",
                    "thoi_gian_ket_thuc": "2025-06-15 17:00:00",
                    "hinh_thuc": "offline",
                    "tong_dang_ky": 132,
                    "so_luot_xem": 1326,
                    "slug": "hoi-thao-tai-chinh-ngan-hang-ky-nguyen-so",
                    "lich_trinh": [
                        {
                            "tieu_de": "Đăng ký và khai mạc",
                            "mo_ta": "Mô tả chi tiết cho phiên 1",
                            "thoi_gian_bat_dau": "2025-06-15 08:00:00",
                            "thoi_gian_ket_thuc": "2025-06-15 09:00:00",
                            "nguoi_phu_trach": "Ban tổ chức"
                        },
                        {
                            "tieu_de": "Phiên thảo luận chính",
                            "mo_ta": "Mô tả chi tiết cho phiên 2",
                            "thoi_gian_bat_dau": "2025-06-15 09:00:00",
                            "thoi_gian_ket_thuc": "2025-06-15 11:00:00",
                            "nguoi_phu_trach": "Diễn giả 2"
                        }
                    ]
                },
                {
                    "su_kien_id": 2,
                    "ten_su_kien": "[Dữ liệu mẫu] Ngày hội việc làm HUB lần thứ 13",
                    "mo_ta": "Đây là dữ liệu mẫu vì không thể tải được dữ liệu thực từ file JSON.",
                    "dia_diem": "CS Hoàng Diệu",
                    "dia_chi_cu_the": "56 Hoàng Diệu 2, Quận Thủ Đức, TP.HCM",
                    "thoi_gian_bat_dau": "2025-06-22 08:30:00",
                    "thoi_gian_ket_thuc": "2025-06-22 16:30:00",
                    "hinh_thuc": "offline",
                    "tong_dang_ky": 168,
                    "so_luot_xem": 980,
                    "slug": "ngay-hoi-viec-lam-hub-lan-13-2023"
                }
            ];
            
            console.log("Đã tạo dữ liệu mẫu:", data);
        }
        
        // Kiểm tra dữ liệu
        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu JSON không hợp lệ, mong đợi một mảng các sự kiện");
        }
        
        console.log(`Đã tải ${data.length} sự kiện${successPath ? ' từ file JSON tại: ' + successPath : ' (sử dụng dữ liệu mẫu)'}`);
        
        // Tìm sự kiện theo slug
        const event = data.find(item => item.slug === slug);
        
        if (!event) {
            console.error("Không tìm thấy sự kiện với slug:", slug);
            
            // Nếu không tìm thấy theo slug, lấy sự kiện đầu tiên
            const defaultEvent = data[0];
            console.log("Sử dụng sự kiện mặc định:", defaultEvent.ten_su_kien);
            
            if (defaultEvent) {
                updateEventDetails(defaultEvent);
                updateSchedule(defaultEvent.lich_trinh || []);
                
                if (new Date(defaultEvent.thoi_gian_bat_dau) > new Date()) {
                    countdownTimer(defaultEvent.thoi_gian_bat_dau);
                }
                
                updateRelatedEvents(data, defaultEvent.su_kien_id);
                updateLoadingState(false);
                return;
            } else {
                throw new Error('Không tìm thấy sự kiện nào trong dữ liệu');
            }
        }
        
        console.log("Đã tìm thấy sự kiện:", event.ten_su_kien);
        
        // Cập nhật thông tin sự kiện
        updateEventDetails(event);
        
        // Cập nhật lịch trình nếu có
        if (event.lich_trinh && event.lich_trinh.length > 0) {
            console.log("Cập nhật lịch trình:", event.lich_trinh.length, "phiên");
            updateSchedule(event.lich_trinh);
        } else {
            console.log("Không có lịch trình, sử dụng lịch trình mặc định");
            updateSchedule([
                {
                    "tieu_de": "Đăng ký và khai mạc",
                    "mo_ta": "Mô tả chi tiết cho phiên 1",
                    "thoi_gian_bat_dau": event.thoi_gian_bat_dau,
                    "thoi_gian_ket_thuc": event.thoi_gian_bat_dau,
                    "nguoi_phu_trach": "Ban tổ chức"
                },
                {
                    "tieu_de": "Phiên thảo luận chính",
                    "mo_ta": "Mô tả chi tiết cho phiên 2",
                    "thoi_gian_bat_dau": event.thoi_gian_bat_dau,
                    "thoi_gian_ket_thuc": event.thoi_gian_bat_dau,
                    "nguoi_phu_trach": "Diễn giả"
                }
            ]);
        }
        
        // Đếm ngược thời gian đến sự kiện
        if (new Date(event.thoi_gian_bat_dau) > new Date()) {
            countdownTimer(event.thoi_gian_bat_dau);
        }
        
        // Cập nhật sự kiện liên quan
        updateRelatedEvents(data, event.su_kien_id);
        
        // Tắt trạng thái đang tải
        updateLoadingState(false);
        
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        
        // Hiển thị thông báo lỗi trong giao diện
        updateErrorState(error.message);
        
        // Tắt trạng thái đang tải
        updateLoadingState(false);
    }
}

// Cập nhật trạng thái đang tải
function updateLoadingState(isLoading) {
    const loading = document.createElement('div');
    loading.id = 'loading-indicator';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu sự kiện...</p>
    `;
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    // Thêm CSS cho spinner
    const style = document.createElement('style');
    style.textContent = `
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    if (isLoading) {
        // Nếu đã có loading indicator thì không cần thêm nữa
        if (!document.getElementById('loading-indicator')) {
            document.head.appendChild(style);
            document.body.appendChild(loading);
        }
    } else {
        // Xóa loading indicator nếu có
        const existingLoading = document.getElementById('loading-indicator');
        if (existingLoading) {
            document.body.removeChild(existingLoading);
        }
    }
}

// Hiển thị thông báo lỗi
function updateErrorState(errorMessage) {
    // Hiển thị lỗi trong các phần quan trọng của trang
    const elements = [
        { selector: '.event-title', message: 'Không thể tải thông tin sự kiện' },
        { selector: '.event-intro p', message: errorMessage },
        { selector: '.schedule-list', message: `<div class="alert alert-danger">Không thể tải lịch trình sự kiện: ${errorMessage}</div>` }
    ];
    
    elements.forEach(el => {
        const element = document.querySelector(el.selector);
        if (element) {
            element.innerHTML = el.message;
        }
    });
    
    // Hiển thị thông báo lỗi chính
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger';
    errorAlert.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    `;
    errorAlert.innerHTML = `
        <strong>Lỗi:</strong> ${errorMessage}
        <button type="button" class="btn-close" aria-label="Close" style="float: right; cursor: pointer;"></button>
    `;
    
    document.body.appendChild(errorAlert);
    
    // Xử lý đóng thông báo
    const closeButton = errorAlert.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            document.body.removeChild(errorAlert);
        });
        
        // Tự động đóng sau 10 giây
        setTimeout(() => {
            if (document.body.contains(errorAlert)) {
                document.body.removeChild(errorAlert);
            }
        }, 10000);
    }
}

// Cập nhật thông tin chi tiết sự kiện
function updateEventDetails(event) {
    console.log("Đang cập nhật thông tin chi tiết sự kiện");
    
    // Cập nhật tiêu đề trang
    document.title = event.ten_su_kien;
    
    // Cập nhật tiêu đề sự kiện
    const eventTitle = document.querySelector('.event-title');
    if (eventTitle) {
        eventTitle.textContent = event.ten_su_kien;
        console.log("Đã cập nhật tiêu đề:", event.ten_su_kien);
    } else {
        console.error("Không tìm thấy phần tử .event-title");
    }
    
    // Cập nhật breadcrumb
    const breadcrumbTitle = document.querySelector('.breadcrumb-item.active');
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = event.ten_su_kien;
    } else {
        console.error("Không tìm thấy phần tử .breadcrumb-item.active");
    }
    
    // Cập nhật meta og tags
    updateMetaTags(event);
    
    // Cập nhật thông tin meta
    const metaViews = document.querySelector('.event-meta-item:nth-child(1)');
    if (metaViews) {
        metaViews.innerHTML = `<i class="fas fa-eye"></i> ${event.so_luot_xem || 0} lượt xem`;
    }
    
    const metaRegistrations = document.querySelector('.event-meta-item:nth-child(2)');
    if (metaRegistrations) {
        metaRegistrations.innerHTML = `<i class="fas fa-users"></i> ${event.tong_dang_ky || 0} người đăng ký`;
    }
    
    const metaDate = document.querySelector('.event-meta-item:nth-child(3)');
    if (metaDate) {
        const eventDate = new Date(event.thoi_gian_bat_dau);
        metaDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDate(eventDate)}`;
    }
    
    // Cập nhật chi tiết sự kiện
    const eventDate = document.querySelector('.event-detail-item:nth-child(1) p');
    if (eventDate) {
        const date = new Date(event.thoi_gian_bat_dau);
        eventDate.textContent = formatDate(date);
    }
    
    const eventTime = document.querySelector('.event-detail-item:nth-child(2) p');
    if (eventTime) {
        const startTime = formatTime(new Date(event.thoi_gian_bat_dau));
        const endTime = formatTime(new Date(event.thoi_gian_ket_thuc));
        eventTime.textContent = `${startTime} - ${endTime}`;
    }
    
    const eventLocation = document.querySelector('.event-detail-item:nth-child(3) p:first-of-type');
    if (eventLocation) {
        eventLocation.textContent = event.dia_diem;
    }
    
    const eventVenueDetail = document.querySelector('.event-detail-item:nth-child(3) .venue-detail');
    if (eventVenueDetail) {
        eventVenueDetail.textContent = event.dia_chi_cu_the;
    }
    
    const eventCount = document.querySelector('.event-detail-item:nth-child(4) p');
    if (eventCount) {
        eventCount.textContent = `${event.tong_dang_ky || 0} người`;
    }
    
    const eventFormat = document.querySelector('.event-detail-item:nth-child(5) p');
    if (eventFormat) {
        eventFormat.textContent = event.hinh_thuc;
    }
    
    // Cập nhật intro
    const eventIntro = document.querySelector('.event-intro p');
    if (eventIntro) {
        eventIntro.textContent = event.mo_ta;
    }
    
    // Cập nhật thông tin thống kê
    const statViews = document.querySelector('.stat-item:nth-child(1) .stat-value');
    if (statViews) {
        statViews.textContent = event.so_luot_xem || 0;
    }
    
    const statRegistrations = document.querySelector('.stat-item:nth-child(2) .stat-value');
    if (statRegistrations) {
        statRegistrations.textContent = event.tong_dang_ky || 0;
    }
    
    // Cập nhật mã QR
    const qrCodeImg = document.querySelector('.qr-code-img');
    if (qrCodeImg) {
        const currentUrl = window.location.href;
        qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
    }
    
    // Cập nhật hình ảnh poster nếu có
    if (event.su_kien_poster && event.su_kien_poster.url) {
        // Thêm hình ảnh vào phần giới thiệu
        const introSection = document.querySelector('.event-intro');
        if (introSection) {
            const posterImage = document.createElement('img');
            posterImage.src = event.su_kien_poster.url;
            posterImage.alt = event.su_kien_poster.alt || event.ten_su_kien;
            posterImage.className = 'event-poster';
            posterImage.style.cssText = 'max-width: 100%; height: auto; margin-top: 15px; border-radius: 8px;';
            
            // Chèn hình ảnh vào sau đoạn văn bản giới thiệu
            introSection.appendChild(posterImage);
        }
    }
    
    console.log("Đã cập nhật xong thông tin chi tiết sự kiện");
}

// Cập nhật meta tags
function updateMetaTags(event) {
    // Cập nhật các thẻ meta
    const metaTags = {
        'description': event.mo_ta,
        'og:title': `Chi tiết sự kiện: ${event.ten_su_kien}`,
        'og:description': event.mo_ta,
        'og:url': window.location.href
    };
    
    // Cập nhật hình ảnh og:image nếu có
    if (event.su_kien_poster && event.su_kien_poster.url) {
        metaTags['og:image'] = event.su_kien_poster.url;
    }
    
    // Cập nhật các thẻ meta
    for (const [name, content] of Object.entries(metaTags)) {
        let metaTag;
        
        if (name.startsWith('og:')) {
            metaTag = document.querySelector(`meta[property="${name}"]`);
        } else {
            metaTag = document.querySelector(`meta[name="${name}"]`);
        }
        
        if (metaTag) {
            metaTag.setAttribute('content', content);
        }
    }
}

// Format date function
function formatDate(date) {
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Format time function
function formatTime(date) {
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Cập nhật lịch trình
function updateSchedule(scheduleData) {
    console.log("Đang cập nhật lịch trình");
    
    const scheduleList = document.querySelector('.schedule-list');
    if (!scheduleList) {
        console.error("Không tìm thấy phần tử .schedule-list");
        return;
    }
    
    // Xóa nội dung hiện tại
    scheduleList.innerHTML = '';
    
    if (!scheduleData || scheduleData.length === 0) {
        const noScheduleItem = document.createElement('div');
        noScheduleItem.className = 'schedule-item';
        noScheduleItem.innerHTML = `
            <div class="schedule-number">1</div>
            <div class="schedule-content">
                <h4>Chưa có lịch trình chi tiết cho sự kiện này</h4>
            </div>
        `;
        scheduleList.appendChild(noScheduleItem);
        return;
    }
    
    // Thêm các mục lịch trình mới
    scheduleData.forEach((item, index) => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        
        // Xử lý trường hợp thời gian không hợp lệ
        let startTime, endTime;
        try {
            startTime = formatTime(new Date(item.thoi_gian_bat_dau));
            endTime = formatTime(new Date(item.thoi_gian_ket_thuc));
        } catch (error) {
            console.error("Lỗi khi chuyển đổi thời gian:", error);
            startTime = "--:--";
            endTime = "--:--";
        }
        
        scheduleItem.innerHTML = `
            <div class="schedule-number">${index + 1}</div>
            <div class="schedule-content">
                <h4>${item.tieu_de || 'Chưa có tiêu đề'}</h4>
                <p>${item.mo_ta || 'Chưa có mô tả'}</p>
                <div class="schedule-time">
                    <i class="far fa-clock"></i> ${startTime} - ${endTime}
                </div>
                <div class="schedule-host">
                    <i class="fas fa-user"></i> ${item.nguoi_phu_trach || 'Chưa xác định'}
                </div>
            </div>
        `;
        
        scheduleList.appendChild(scheduleItem);
    });
    
    console.log("Đã cập nhật xong lịch trình");
}

// Cập nhật sự kiện liên quan
function updateRelatedEvents(allEvents, currentEventId) {
    console.log("Đang cập nhật sự kiện liên quan");
    
    const relatedEventsContainer = document.querySelector('.related-events');
    if (!relatedEventsContainer) {
        console.error("Không tìm thấy phần tử .related-events");
        return;
    }
    
    // Xóa nội dung hiện tại
    relatedEventsContainer.innerHTML = '';
    
    // Lọc sự kiện liên quan (không bao gồm sự kiện hiện tại và giới hạn 3 sự kiện)
    const relatedEvents = allEvents
        .filter(event => event.su_kien_id !== currentEventId)
        .sort((a, b) => new Date(a.thoi_gian_bat_dau) - new Date(b.thoi_gian_bat_dau))
        .slice(0, 3);
    
    // Hiển thị sự kiện liên quan
    relatedEvents.forEach(event => {
        const date = new Date(event.thoi_gian_bat_dau);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const time = formatTime(date);
        
        const relatedEventItem = document.createElement('a');
        relatedEventItem.href = `?slug=${event.slug}`;
        relatedEventItem.className = 'related-event-item';
        
        relatedEventItem.innerHTML = `
            <div class="related-event-date">
                <span class="date-number">${day}</span>
                <span class="date-month">${month < 10 ? '0' + month : month}/${year}</span>
            </div>
            <div class="related-event-info">
                <h4>${event.ten_su_kien}</h4>
                <div class="related-event-meta">
                    <i class="far fa-clock"></i> ${time}
                </div>
            </div>
        `;
        
        relatedEventsContainer.appendChild(relatedEventItem);
    });
    
    // Nếu không có sự kiện liên quan
    if (relatedEvents.length === 0) {
        relatedEventsContainer.innerHTML = '<p>Không có sự kiện liên quan.</p>';
    }
    
    console.log("Đã cập nhật xong sự kiện liên quan");
}

// Đếm ngược thời gian
function countdownTimer(eventDate) {
    console.log("Khởi tạo đếm ngược đến:", eventDate);
    // Ngày sự kiện
    const eventDateTime = new Date(eventDate).getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDateTime - now;
        
        // Nếu thời gian đã qua
        if (distance < 0) {
            clearInterval(timer);
            document.getElementById('countdown-days').innerText = '0';
            document.getElementById('countdown-hours').innerText = '0';
            document.getElementById('countdown-minutes').innerText = '0';
            document.getElementById('countdown-seconds').innerText = '0';
            return;
        }
        
        // Tính toán ngày, giờ, phút, giây
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Cập nhật giao diện
        document.getElementById('countdown-days').innerText = days;
        document.getElementById('countdown-hours').innerText = hours;
        document.getElementById('countdown-minutes').innerText = minutes;
        document.getElementById('countdown-seconds').innerText = seconds;
    }
    
    // Cập nhật đếm ngược ngay lập tức
    updateCountdown();
    
    // Cập nhật đếm ngược mỗi giây
    const timer = setInterval(updateCountdown, 1000);
}

// Thiết lập form đăng ký
function setupRegistrationForm() {
    const form = document.getElementById('event-registration-form');
    if (!form) {
        console.error("Không tìm thấy form đăng ký #event-registration-form");
        return;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Lấy dữ liệu form
        const formData = {
            fullname: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            organization: document.getElementById('organization').value,
            note: document.getElementById('note').value
        };
        
        // Giả lập gửi dữ liệu đăng ký
        console.log('Dữ liệu đăng ký:', formData);
        
        // Hiển thị thông báo
        alert('Đăng ký tham gia sự kiện thành công!');
        
        // Reset form
        form.reset();
    });
    
    console.log("Đã thiết lập form đăng ký");
}

// Thiết lập chia sẻ QR Code
function setupQRCodeShare() {
    const downloadButton = document.querySelector('.btn-download');
    if (!downloadButton) {
        console.error("Không tìm thấy nút tải xuống QR code");
        return;
    }
    
    downloadButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Lấy URL của hình ảnh QR Code
        const qrCodeUrl = document.querySelector('.qr-code-img').src;
        
        // Tạo liên kết tải xuống
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = 'qr-code-su-kien.png';
        
        // Thêm liên kết vào trang và kích hoạt sự kiện click
        document.body.appendChild(link);
        link.click();
        
        // Xóa liên kết
        document.body.removeChild(link);
    });
    
    // Thiết lập nút chia sẻ
    const shareButtons = document.querySelectorAll('.share-buttons .btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Lấy URL hiện tại
            const currentUrl = window.location.href;
            const shareType = this.className.includes('facebook') ? 'facebook' : 
                              this.className.includes('twitter') ? 'twitter' : 
                              this.className.includes('linkedin') ? 'linkedin' : 'email';
            
            // Xử lý chia sẻ theo từng loại
            switch(shareType) {
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
                    break;
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`, '_blank');
                    break;
                case 'linkedin':
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
                    break;
                case 'email':
                    window.location.href = `mailto:?subject=Thông tin sự kiện&body=${encodeURIComponent('Tôi muốn chia sẻ sự kiện này với bạn: ' + currentUrl)}`;
                    break;
            }
        });
    });
    
    console.log("Đã thiết lập chia sẻ QR code");
}

// Tải dữ liệu đăng ký sự kiện
async function loadRegistrationData(eventSlug) {
    console.log("Đang tải dữ liệu đăng ký cho sự kiện:", eventSlug);
    
    try {
        // Đường dẫn đến file JSON chứa dữ liệu đăng ký
        const registrationDataUrl = "http://127.0.0.1:5500/template/data/dangkys-sukien.json";
        
        // Hiển thị trạng thái đang tải
        const attendeesTab = document.getElementById('attendees');
        if (attendeesTab) {
            attendeesTab.innerHTML = `
                <div class="loading-container text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <p class="mt-3">Đang tải danh sách người đăng ký...</p>
                </div>
            `;
        }
        
        // Tải dữ liệu từ JSON
        const response = await fetch(registrationDataUrl);
        
        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu đăng ký");
        }
        
        const data = await response.json();
        console.log("Đã tải dữ liệu đăng ký:", data);
        
        // Tìm sự kiện hiện tại 
        const event = await getCurrentEvent();
        if (!event) {
            throw new Error("Không thể tìm thấy thông tin sự kiện");
        }
        
        // Lọc dữ liệu đăng ký cho sự kiện hiện tại (theo ID thay vì slug)
        const eventRegistrations = data.filter(reg => reg.su_kien_id === event.su_kien_id);
        console.log(`Tìm thấy ${eventRegistrations.length} đăng ký cho sự kiện này`);
        
        // Hiển thị danh sách đăng ký
        updateRegistrationList(eventRegistrations);
        
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu đăng ký:", error);
        
        // Hiển thị thông báo lỗi
        const attendeesTab = document.getElementById('attendees');
        if (attendeesTab) {
            attendeesTab.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Không thể tải danh sách đăng ký: ${error.message}
                </div>
            `;
        }
    }
}

// Lấy sự kiện hiện tại
async function getCurrentEvent() {
    // Lấy slug từ URL
    const slug = getCurrentEventSlug();
    
    try {
        // Tải dữ liệu sự kiện từ JSON
        const response = await fetch('http://127.0.0.1:5500/template/data/su-kien.json');
        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu sự kiện");
        }
        
        const events = await response.json();
        // Tìm sự kiện theo slug
        return events.find(event => event.slug === slug);
    } catch (error) {
        console.error("Lỗi khi tìm sự kiện:", error);
        return null;
    }
}

// Cập nhật giao diện hiển thị danh sách đăng ký
function updateRegistrationList(registrations) {
    const attendeesTab = document.getElementById('attendees');
    if (!attendeesTab) {
        console.error("Không tìm thấy phần tử #attendees");
        return;
    }
    
    // Nếu không có đăng ký
    if (!registrations || registrations.length === 0) {
        attendeesTab.innerHTML = `
            <div class="attendees-status">
                <h3>Danh sách người đăng ký</h3>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Hiện chưa có người đăng ký cho sự kiện này.
                </div>
                <div class="text-center mt-4">
                    <button class="btn btn-primary register-now-btn" onclick="scrollToRegisterTab()">
                        <i class="fas fa-user-plus me-2"></i>
                        Đăng ký ngay
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Tính toán thống kê
    const confirmedCount = registrations.filter(r => r.status === 1).length;
    const pendingCount = registrations.filter(r => r.status === 0).length;
    const canceledCount = registrations.filter(r => r.status === -1).length;
    const attendedCount = registrations.filter(r => r.da_check_in === true).length;
    const confirmedRate = Math.round((confirmedCount / registrations.length) * 100);
    const attendanceRate = registrations.filter(r => r.attendance_status === 'full').length;
    
    // Tạo phần tử HTML cho danh sách đăng ký
    let attendeesHTML = `
        <div class="attendees-status">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Danh sách người đăng ký (${registrations.length})</h3>
                <div class="search-registration">
                    <div class="input-group">
                        <input type="text" class="form-control" id="search-attendees" 
                               placeholder="Tìm kiếm..." aria-label="Tìm kiếm">
                        <button class="btn btn-outline-secondary" type="button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="registration-stats mb-4">
                <div class="row">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-card-value">${registrations.length}</div>
                            <div class="stat-card-label">Tổng đăng ký</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-card-value">${confirmedCount}</div>
                            <div class="stat-card-label">Đã xác nhận</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-card-value">${attendedCount}</div>
                            <div class="stat-card-label">Đã tham gia</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="stat-card-value">${confirmedRate}%</div>
                            <div class="stat-card-label">Tỷ lệ xác nhận</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="registration-filter mb-3">
                <div class="btn-group" role="group" aria-label="Bộ lọc trạng thái">
                    <button type="button" class="btn btn-outline-primary active filter-btn" data-filter="all">Tất cả</button>
                    <button type="button" class="btn btn-outline-success filter-btn" data-filter="confirmed">Đã xác nhận</button>
                    <button type="button" class="btn btn-outline-warning filter-btn" data-filter="pending">Chờ xác nhận</button>
                    <button type="button" class="btn btn-outline-danger filter-btn" data-filter="canceled">Đã hủy</button>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-hover registration-table">
                    <thead>
                        <tr>
                            <th scope="col" class="text-center">#</th>
                            <th scope="col">Họ và tên</th>
                            <th scope="col">Email</th>
                            <th scope="col">SĐT</th>
                            <th scope="col">Đơn vị</th>
                            <th scope="col" class="text-center">Loại</th>
                            <th scope="col" class="text-center">Trạng thái</th>
                            <th scope="col" class="text-center">Tham dự</th>
                            <th scope="col" class="text-center">Đăng ký lúc</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Thêm từng dòng dữ liệu
    registrations.forEach((reg, index) => {
        // Xác định trạng thái
        const statusClass = reg.status === 1 ? 'success' : 
                           reg.status === 0 ? 'warning' : 'danger';
        const statusText = reg.status === 1 ? 'Đã xác nhận' : 
                          reg.status === 0 ? 'Chờ xác nhận' : 'Đã hủy';
        
        // Xác định trạng thái tham dự
        const attendanceClass = reg.attendance_status === 'full' ? 'success' : 
                               reg.attendance_status === 'partial' ? 'warning' : 'secondary';
        const attendanceText = reg.attendance_status === 'full' ? 'Đầy đủ' : 
                              reg.attendance_status === 'partial' ? 'Một phần' : 'Chưa tham dự';
        
        // Định dạng ngày
        const regDate = new Date(reg.ngay_dang_ky);
        const formattedDate = `${regDate.getDate()}/${regDate.getMonth() + 1}/${regDate.getFullYear()}`;
        
        // Loại người đăng ký
        const typeText = reg.loai_nguoi_dang_ky === 'khach' ? 'Khách' : 
                        reg.loai_nguoi_dang_ky === 'sinh_vien' ? 'Sinh viên' : 'Giảng viên';
        const typeClass = reg.loai_nguoi_dang_ky === 'khach' ? 'info' : 
                         reg.loai_nguoi_dang_ky === 'sinh_vien' ? 'primary' : 'dark';
        
        attendeesHTML += `
            <tr data-status="${reg.status === 1 ? 'confirmed' : (reg.status === 0 ? 'pending' : 'canceled')}">
                <td class="text-center">${index + 1}</td>
                <td>
                    <a href="#" class="text-decoration-none attendee-detail" data-bs-toggle="modal" data-bs-target="#attendeeModal" data-id="${reg.dangky_sukien_id}">
                        ${reg.ho_ten}
                    </a>
                </td>
                <td>${reg.email}</td>
                <td>${reg.dien_thoai || '-'}</td>
                <td>${reg.don_vi_to_chuc || '-'}</td>
                <td class="text-center">
                    <span class="badge bg-${typeClass}">${typeText}</span>
                </td>
                <td class="text-center">
                    <span class="badge bg-${statusClass}">${statusText}</span>
                </td>
                <td class="text-center">
                    <span class="badge bg-${attendanceClass}">${attendanceText}</span>
                </td>
                <td class="text-center">${formattedDate}</td>
            </tr>
        `;
    });
    
    attendeesHTML += `
                    </tbody>
                </table>
            </div>
            
            <div class="pagination-container mt-3 d-flex justify-content-center">
                <nav aria-label="Phân trang danh sách đăng ký">
                    <ul class="pagination">
                        <li class="page-item disabled">
                            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
                                <i class="fas fa-chevron-left"></i>
                            </a>
                        </li>
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        <li class="page-item">
                            <a class="page-link" href="#">
                                <i class="fas fa-chevron-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    `;
    
    // Cập nhật nội dung tab
    attendeesTab.innerHTML = attendeesHTML;
    
    // Thêm chức năng tìm kiếm
    const searchInput = document.getElementById('search-attendees');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.registration-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Thêm chức năng lọc theo trạng thái
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Xóa active class khỏi tất cả các nút
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Thêm active class vào nút được nhấp
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            const rows = document.querySelectorAll('.registration-table tbody tr');
            
            rows.forEach(row => {
                if (filterValue === 'all' || row.getAttribute('data-status') === filterValue) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
    
    // Thêm sự kiện cho việc xem chi tiết người đăng ký
    const detailLinks = document.querySelectorAll('.attendee-detail');
    detailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            const registration = registrations.find(r => r.dangky_sukien_id == id);
            
            if (registration) {
                showAttendeeDetail(registration);
            }
        });
    });
}

// Hiển thị chi tiết người đăng ký
function showAttendeeDetail(registration) {
    // Kiểm tra xem modal đã tồn tại chưa
    let modal = document.getElementById('attendeeModal');
    
    // Nếu chưa, tạo mới
    if (!modal) {
        const modalHTML = `
            <div class="modal fade" id="attendeeModal" tabindex="-1" aria-labelledby="attendeeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="attendeeModalLabel">Chi tiết đăng ký</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="attendeeModalBody">
                            <!-- Nội dung sẽ được điền ở đây -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('attendeeModal');
    }
    
    // Định dạng ngày đăng ký
    const regDate = new Date(registration.ngay_dang_ky);
    const formattedDate = `${regDate.getDate()}/${regDate.getMonth() + 1}/${regDate.getFullYear()} ${regDate.getHours()}:${regDate.getMinutes()}`;
    
    // Xác định trạng thái
    const status = registration.status === 1 ? '<span class="badge bg-success">Đã xác nhận</span>' : 
                  registration.status === 0 ? '<span class="badge bg-warning">Chờ xác nhận</span>' : 
                  '<span class="badge bg-danger">Đã hủy</span>';
    
    // Loại người đăng ký
    const type = registration.loai_nguoi_dang_ky === 'khach' ? 'Khách' : 
                registration.loai_nguoi_dang_ky === 'sinh_vien' ? 'Sinh viên' : 'Giảng viên';
    
    // Trạng thái tham dự
    const attendance = registration.attendance_status === 'full' ? '<span class="badge bg-success">Đầy đủ</span>' : 
                      registration.attendance_status === 'partial' ? '<span class="badge bg-warning">Một phần</span>' : 
                      '<span class="badge bg-secondary">Chưa tham dự</span>';
    
    // Tạo nội dung chi tiết
    const detailHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="fw-bold">Thông tin người đăng ký</h6>
                <div class="mb-3">
                    <p class="mb-1"><strong>Họ và tên:</strong> ${registration.ho_ten}</p>
                    <p class="mb-1"><strong>Email:</strong> ${registration.email}</p>
                    <p class="mb-1"><strong>Số điện thoại:</strong> ${registration.dien_thoai || 'Không có'}</p>
                </div>
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold">Thông tin đăng ký</h6>
                <div class="mb-3">
                    <p class="mb-1"><strong>Mã xác nhận:</strong> ${registration.ma_xac_nhan || 'Chưa cấp'}</p>
                    <p class="mb-1"><strong>Thời gian đăng ký:</strong> ${formattedDate}</p>
                    <p class="mb-1"><strong>Trạng thái:</strong> ${status}</p>
                    <p class="mb-1"><strong>Hình thức tham gia:</strong> ${registration.hinh_thuc_tham_gia}</p>
                    <p class="mb-1"><strong>Đã điểm danh:</strong> ${registration.da_check_in ? 'Đã điểm danh vào' : 'Chưa điểm danh'}</p>
                    <p class="mb-1"><strong>Tham dự:</strong> ${attendance}</p>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h6 class="fw-bold">Ghi chú/Góp ý</h6>
                <p>${registration.noi_dung_gop_y || 'Không có ghi chú'}</p>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h6 class="fw-bold">Thông tin bổ sung</h6>
                <div class="additional-info">
                    <p><strong>Nguồn giới thiệu:</strong> ${registration.nguon_gioi_thieu || 'Không có'}</p>
                    ${registration.ly_do_tham_du ? `<p><strong>Lý do tham dự:</strong> ${registration.ly_do_tham_du}</p>` : ''}
                    ${registration.status === -1 ? `<p><strong>Lý do hủy:</strong> ${registration.ly_do_huy || 'Không có thông tin'}</p>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Cập nhật nội dung modal
    const modalBody = document.getElementById('attendeeModalBody');
    if (modalBody) {
        modalBody.innerHTML = detailHTML;
    }
    
    // Hiển thị modal (sử dụng Bootstrap Modal)
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Nâng cao form đăng ký
function enhanceRegistrationForm() {
    const form = document.getElementById('event-registration-form');
    if (!form) {
        console.error("Không tìm thấy form đăng ký #event-registration-form");
        return;
    }
    
    // Thêm hiệu ứng khi đăng ký thành công
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Kiểm tra dữ liệu
        if (!validateForm()) {
            return;
        }
        
        // Hiển thị trạng thái đang xử lý
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Đang xử lý...
        `;
        
        // Lấy dữ liệu form
        const formData = {
            ho_ten: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            dien_thoai: document.getElementById('phone').value,
            don_vi_to_chuc: document.getElementById('organization').value,
            noi_dung_gop_y: document.getElementById('note').value,
            loai_nguoi_dang_ky: document.getElementById('participant-type').value,
            nguon_gioi_thieu: document.getElementById('reference-source').value,
            hinh_thuc_tham_gia: document.querySelector('input[name="participation-type"]:checked').value,
            ly_do_tham_du: document.getElementById('participation-reason').value,
            su_kien_id: 1, // Tạm thời hardcode, sẽ cập nhật sau
            ngay_dang_ky: new Date().toISOString(),
            status: 0, // Trạng thái mặc định là "chờ xác nhận"
            ma_xac_nhan: generateRandomCode(), // Tạo mã ngẫu nhiên
            da_check_in: false,
            da_check_out: false,
            attendance_status: "not_attended"
        };
        
        // Giả lập gửi dữ liệu đăng ký
        console.log('Dữ liệu đăng ký:', formData);
        
        // Giả lập delay API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Hiển thị thông báo thành công
        const registerTab = document.getElementById('register');
        
        // Lưu giữ nội dung hiện tại của form để khôi phục sau
        const formContent = registerTab.innerHTML;
        
        // Hiển thị thông báo thành công
        registerTab.innerHTML = `
            <div class="registration-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Đăng ký thành công!</h3>
                <p>Cảm ơn bạn đã đăng ký tham gia sự kiện của chúng tôi.</p>
                <p>Mã xác nhận của bạn là: <strong>${formData.ma_xac_nhan}</strong></p>
                <p>Chúng tôi đã gửi email xác nhận đến địa chỉ <strong>${formData.email}</strong>.</p>
                <p>Vui lòng kiểm tra email của bạn để biết thêm chi tiết.</p>
                
                <div class="registration-info mt-4">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">Thông tin đăng ký</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Họ và tên:</strong> ${formData.ho_ten}</p>
                                    <p><strong>Email:</strong> ${formData.email}</p>
                                    <p><strong>Số điện thoại:</strong> ${formData.dien_thoai}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Đơn vị/Tổ chức:</strong> ${formData.don_vi_to_chuc || 'Không có'}</p>
                                    <p><strong>Hình thức tham gia:</strong> ${formData.hinh_thuc_tham_gia}</p>
                                    <p><strong>Trạng thái:</strong> <span class="badge bg-warning">Chờ xác nhận</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <button class="btn btn-primary me-2" id="view-registrations-btn">
                        <i class="fas fa-list me-2"></i>
                        Xem danh sách đăng ký
                    </button>
                    <button class="btn btn-outline-secondary" id="register-another-btn">
                        <i class="fas fa-user-plus me-2"></i>
                        Đăng ký người khác
                    </button>
                </div>
            </div>
        `;
        
        // Xử lý nút xem danh sách đăng ký
        document.getElementById('view-registrations-btn').addEventListener('click', function() {
            document.getElementById('attendees-tab').click();
            // Tải lại danh sách đăng ký
            loadRegistrationData(getCurrentEventSlug());
        });
        
        // Xử lý nút đăng ký người khác
        document.getElementById('register-another-btn').addEventListener('click', function() {
            // Khôi phục form
            registerTab.innerHTML = formContent;
            // Thiết lập lại form
            enhanceRegistrationForm();
            // Reset form
            document.getElementById('event-registration-form').reset();
        });
        
    });
    
    // Thêm validation cho form
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
    
    // Thêm bộ đếm ký tự cho ghi chú và lý do tham dự
    ['note', 'participation-reason'].forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            const charCountContainer = document.createElement('div');
            charCountContainer.className = 'char-count text-muted mt-1 small';
            charCountContainer.textContent = '0/200 ký tự';
            field.parentNode.appendChild(charCountContainer);
            
            field.addEventListener('input', function() {
                const count = this.value.length;
                charCountContainer.textContent = `${count}/200 ký tự`;
                
                if (count > 180) {
                    charCountContainer.classList.add('text-danger');
                } else {
                    charCountContainer.classList.remove('text-danger');
                }
            });
        }
    });
    
    // Chức năng hiển thị/ẩn các trường form dựa vào lựa chọn
    const participationType = document.querySelectorAll('input[name="participation-type"]');
    participationType.forEach(radio => {
        radio.addEventListener('change', function() {
            const onlineFields = document.getElementById('online-fields');
            if (onlineFields) {
                if (this.value === 'online' || this.value === 'hybrid') {
                    onlineFields.style.display = 'block';
                } else {
                    onlineFields.style.display = 'none';
                }
            }
        });
    });
    
    console.log("Đã nâng cao form đăng ký");
}

// Tạo mã xác nhận ngẫu nhiên
function generateRandomCode() {
    const prefix = "XN";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return prefix + randomNum;
}

// Validation form
function validateForm() {
    const inputs = document.querySelectorAll('#event-registration-form input[required], #event-registration-form textarea[required], #event-registration-form select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate từng trường input
function validateInput(input) {
    const value = input.value.trim();
    const feedbackEl = input.nextElementSibling?.classList.contains('invalid-feedback') ? 
                      input.nextElementSibling : null;
    
    // Xóa feedback cũ nếu có
    if (feedbackEl) {
        input.parentNode.removeChild(feedbackEl);
    }
    
    // Nếu trường bắt buộc mà trống
    if (input.hasAttribute('required') && value === '') {
        input.classList.add('is-invalid');
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = 'Trường này không được để trống';
        input.parentNode.insertBefore(feedback, input.nextSibling);
        return false;
    }
    
    // Nếu là email và không hợp lệ
    if (input.type === 'email' && value !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            input.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = 'Email không hợp lệ';
            input.parentNode.insertBefore(feedback, input.nextSibling);
            return false;
        }
    }
    
    // Nếu là số điện thoại và không hợp lệ
    if (input.id === 'phone' && value !== '') {
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
        if (!phoneRegex.test(value)) {
            input.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = 'Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)';
            input.parentNode.insertBefore(feedback, input.nextSibling);
            return false;
        }
    }
    
    // Nếu hợp lệ
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

// Cập nhật loadEventData để tải cả dữ liệu đăng ký
const originalLoadEventData = loadEventData;
loadEventData = async function(slug) {
    await originalLoadEventData(slug);
    
    // Sau khi tải dữ liệu sự kiện, tải dữ liệu đăng ký
    await loadRegistrationData(slug);
    
    // Nâng cao form đăng ký
    enhanceRegistrationForm();
}

// Lấy slug của sự kiện hiện tại
function getCurrentEventSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("slug") || "hoi-thao-tai-chinh-ngan-hang-ky-nguyen-so";
}

// Hàm để chuyển đến tab đăng ký
function scrollToRegisterTab() {
    const registerTab = document.getElementById('register-tab');
    if (registerTab) {
        registerTab.click();
        // Cuộn đến form
        const form = document.getElementById('event-registration-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Thêm các hàm cho form đăng ký

// Hiển thị/ẩn trường online-fields khi thay đổi loại tham gia
document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('event-registration-form');
    if (registrationForm) {
        // Xử lý hiển thị/ẩn online-fields
        const participationTypes = document.querySelectorAll('input[name="participation-type"]');
        const onlineFields = document.getElementById('online-fields');
        
        participationTypes.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'online' || this.value === 'hybrid') {
                    onlineFields.style.display = 'block';
                } else {
                    onlineFields.style.display = 'none';
                }
            });
        });
        
        // Xử lý hiển thị/ẩn các trường theo loại người tham gia
        const participantType = document.getElementById('participant-type');
        const studentFields = document.getElementById('student-fields');
        const facultyFields = document.getElementById('faculty-fields');
        const guestFields = document.getElementById('guest-fields');
        
        participantType.addEventListener('change', function() {
            // Ẩn tất cả các trường bổ sung
            studentFields.style.display = 'none';
            facultyFields.style.display = 'none';
            guestFields.style.display = 'none';
            
            // Hiển thị trường tương ứng
            if (this.value === 'sinh_vien') {
                studentFields.style.display = 'block';
            } else if (this.value === 'giang_vien') {
                facultyFields.style.display = 'block';
            } else if (this.value === 'khach') {
                guestFields.style.display = 'block';
            }
        });
        
        // Xử lý hiển thị/ẩn diet-details
        const specialDiet = document.getElementById('special-diet');
        const dietDetails = document.getElementById('diet-details');
        
        specialDiet.addEventListener('change', function() {
            dietDetails.style.display = this.checked ? 'block' : 'none';
        });
        
        // Xử lý hiển thị/ẩn accessibility-details
        const accessibilityNeeds = document.getElementById('accessibility-needs');
        const accessibilityDetails = document.getElementById('accessibility-details');
        
        accessibilityNeeds.addEventListener('change', function() {
            accessibilityDetails.style.display = this.checked ? 'block' : 'none';
        });
        
        // Xử lý submit form
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Tạo đối tượng thông tin đăng ký
            const registrationData = {
                ho_ten: document.getElementById('fullname').value,
                email: document.getElementById('email').value,
                dien_thoai: document.getElementById('phone').value,
                don_vi_to_chuc: document.getElementById('organization').value,
                loai_nguoi_dang_ky: document.getElementById('participant-type').value,
                nguon_gioi_thieu: document.getElementById('reference-source').value,
                hinh_thuc_tham_gia: document.querySelector('input[name="participation-type"]:checked').value,
                ly_do_tham_du: document.getElementById('participation-reason').value,
                noi_dung_gop_y: document.getElementById('note').value,
                thong_tin_dang_ky: {}
            };
            
            // Thêm thông tin về nền tảng trực tuyến nếu có
            if (registrationData.hinh_thuc_tham_gia === 'online' || registrationData.hinh_thuc_tham_gia === 'hybrid') {
                registrationData.thong_tin_dang_ky.online_platform = document.getElementById('online-platform').value;
                registrationData.thong_tin_dang_ky.preferred_language = document.getElementById('preferred-language').value;
            }
            
            // Thêm thông tin về thiết bị
            registrationData.thong_tin_dang_ky.platforms = [];
            document.querySelectorAll('input[name="platforms[]"]:checked').forEach(checkbox => {
                registrationData.thong_tin_dang_ky.platforms.push(checkbox.value);
            });
            
            // Thêm thông tin về yêu cầu đặc biệt
            registrationData.thong_tin_dang_ky.special_requirements = [];
            document.querySelectorAll('input[name="special-requirements[]"]:checked').forEach(checkbox => {
                registrationData.thong_tin_dang_ky.special_requirements.push(checkbox.value);
                
                if (checkbox.value === 'diet' && document.getElementById('diet-type').value) {
                    registrationData.thong_tin_dang_ky.diet_type = document.getElementById('diet-type').value;
                }
                
                if (checkbox.value === 'accessibility' && document.getElementById('accessibility-notes').value) {
                    registrationData.thong_tin_dang_ky.accessibility_notes = document.getElementById('accessibility-notes').value;
                }
            });
            
            // Thêm thông tin về tùy chọn liên hệ
            registrationData.thong_tin_dang_ky.contact_options = [];
            document.querySelectorAll('input[name="contact_options[]"]:checked').forEach(checkbox => {
                registrationData.thong_tin_dang_ky.contact_options.push(checkbox.value);
            });
            
            // Thêm thông tin dựa vào loại người tham gia
            if (registrationData.loai_nguoi_dang_ky === 'sinh_vien') {
                registrationData.thong_tin_dang_ky.student_id = document.getElementById('student-id').value;
                registrationData.thong_tin_dang_ky.major = document.getElementById('major').value;
                registrationData.thong_tin_dang_ky.year = document.getElementById('year').value;
                registrationData.thong_tin_dang_ky.university = document.getElementById('university').value;
            } else if (registrationData.loai_nguoi_dang_ky === 'giang_vien') {
                registrationData.thong_tin_dang_ky.faculty = document.getElementById('faculty').value;
                registrationData.thong_tin_dang_ky.presentation = document.getElementById('presentation').value;
            } else if (registrationData.loai_nguoi_dang_ky === 'khach') {
                registrationData.thong_tin_dang_ky.job_title = document.getElementById('job-title').value;
                registrationData.thong_tin_dang_ky.company_position = document.getElementById('company-position').value;
                
                registrationData.thong_tin_dang_ky.interests = [];
                document.querySelectorAll('input[name="interests[]"]:checked').forEach(checkbox => {
                    registrationData.thong_tin_dang_ky.interests.push(checkbox.value);
                });
            }
            
            // Gửi dữ liệu
            console.log('Dữ liệu đăng ký:', registrationData);
            
            // Hiển thị thông báo
            showRegistrationSuccessMessage();
        });
    }
});

function showRegistrationSuccessMessage() {
    // Ẩn form
    const registrationForm = document.getElementById('event-registration-form');
    registrationForm.style.display = 'none';
    
    // Hiển thị thông báo thành công
    const registrationFormContainer = document.querySelector('.registration-form');
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success mt-3';
    successMessage.innerHTML = `
        <h4 class="alert-heading"><i class="fas fa-check-circle me-2"></i> Đăng ký thành công!</h4>
        <p>Cảm ơn bạn đã đăng ký tham gia sự kiện. Chúng tôi sẽ gửi email xác nhận đến địa chỉ email của bạn trong thời gian sớm nhất.</p>
        <hr>
        <p class="mb-0">Vui lòng kiểm tra hộp thư của bạn để nhận thông tin chi tiết về sự kiện.</p>
    `;
    
    registrationFormContainer.appendChild(successMessage);
    
    // Cuộn lên đầu form
    registrationFormContainer.scrollIntoView({ behavior: 'smooth' });
} 