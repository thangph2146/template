/**
 * JavaScript xử lý trang chi tiết sự kiện - Đại Học Ngân Hàng TP.HCM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin sự kiện từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    const eventSlug = urlParams.get('slug');
    
    if (!eventId) {
        showErrorMessage('Không tìm thấy ID sự kiện');
        return;
    }
    
    // Khởi tạo các element cần thiết
    const eventTitleEl = document.getElementById('eventTitle');
    const eventTagEl = document.getElementById('eventTag');
    const eventImageEl = document.getElementById('eventImage');
    const eventDateEl = document.getElementById('eventDate');
    const eventTimeEl = document.getElementById('eventTime');
    const eventLocationEl = document.getElementById('eventLocation');
    const eventFormatEl = document.getElementById('eventFormat');
    const eventOrganizerEl = document.getElementById('eventOrganizer');
    const eventParticipantsEl = document.getElementById('eventParticipants');
    const eventDescriptionEl = document.getElementById('eventDescription');
    const eventScheduleEl = document.getElementById('eventSchedule');
    const registrationBtnEl = document.getElementById('registrationBtn');
    const eventCountdownEl = document.getElementById('eventCountdown');
    const eventShareEl = document.querySelector('.event-share');
    const eventMapEl = document.getElementById('eventMap');
    
    // Loại sự kiện
    const eventTypes = {
        1: { name: 'Hội thảo', class: 'bg-seminar' },
        2: { name: 'Hội nghị', class: 'bg-conference' },
        3: { name: 'Workshop', class: 'bg-workshop' },
        4: { name: 'Sự kiện', class: 'bg-event' }
    };
    
    // Tải thông tin sự kiện
    fetchEventDetail(eventId);
    
    /**
     * Lấy thông tin chi tiết sự kiện
     * @param {string} id - ID sự kiện
     */
    function fetchEventDetail(id) {
        // Hiển thị loading
        document.body.classList.add('loading');
        
        fetch('data/su-kien.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(events => {
                // Tìm sự kiện theo id
                const event = events.find(e => e.su_kien_id == id);
                
                if (!event) {
                    throw new Error('Không tìm thấy sự kiện');
                }
                
                // Hiển thị thông tin sự kiện
                renderEventDetail(event);
                
                // Hiển thị lịch trình
                if (event.lich_trinh && event.lich_trinh.length > 0) {
                    renderEventSchedule(event.lich_trinh);
                }
                
                // Hiển thị bản đồ
                if (event.toa_do_gps) {
                    renderMap(event.toa_do_gps, event.dia_chi_cu_the, event.ten_su_kien);
                }
                
                // Khởi tạo đếm ngược
                initCountdown(event.thoi_gian_bat_dau);
                
                // Khởi tạo nút đăng ký
                initRegistrationButton(event);
                
                // Khởi tạo nút chia sẻ
                initShareButtons(event);
                
                // Tải danh sách người đăng ký
                if (event.su_kien_id) {
                    fetchRegistrations(event.su_kien_id);
                }
                
                // Ẩn loading
                document.body.classList.remove('loading');
            })
            .catch(error => {
                console.error('Error fetching event detail:', error);
                showErrorMessage(error.message);
                document.body.classList.remove('loading');
            });
    }
    
    /**
     * Hiển thị thông tin chi tiết sự kiện
     * @param {Object} event - Thông tin sự kiện
     */
    function renderEventDetail(event) {
        document.title = event.ten_su_kien + ' - HUB';
        
        // Cập nhật URL nếu slug không khớp
        if (eventSlug !== event.slug) {
            const url = new URL(window.location);
            url.searchParams.set('slug', event.slug);
            window.history.replaceState({}, '', url);
        }
        
        // Thông tin cơ bản
        if (eventTitleEl) eventTitleEl.textContent = event.ten_su_kien;
        
        if (eventTagEl) {
            const eventType = eventTypes[event.loai_su_kien_id] || eventTypes[4];
            eventTagEl.textContent = eventType.name.toUpperCase();
            eventTagEl.className = `event-detail-tag ${eventType.class}`;
        }
        
        if (eventImageEl && event.su_kien_poster && event.su_kien_poster.url) {
            eventImageEl.src = event.su_kien_poster.url;
            eventImageEl.alt = event.su_kien_poster.alt || event.ten_su_kien;
        }
        
        if (eventDateEl) eventDateEl.textContent = formatDate(event.thoi_gian_bat_dau);
        if (eventTimeEl) eventTimeEl.textContent = `${formatTime(event.thoi_gian_bat_dau)} - ${formatTime(event.thoi_gian_ket_thuc)}`;
        if (eventLocationEl) eventLocationEl.textContent = event.dia_diem;
        if (eventFormatEl) eventFormatEl.textContent = capitalizeFirstLetter(event.hinh_thuc);
        if (eventOrganizerEl) eventOrganizerEl.textContent = event.don_vi_to_chuc;
        if (eventParticipantsEl) eventParticipantsEl.textContent = `${event.tong_dang_ky}/${event.so_luong_tham_gia}`;
        
        // Thông tin mô tả
        if (eventDescriptionEl) {
            // Sử dụng mô tả chi tiết nếu có, nếu không thì dùng mô tả ngắn
            if (event.chi_tiet_su_kien) {
                eventDescriptionEl.innerHTML = event.chi_tiet_su_kien;
            } else if (event.mo_ta_su_kien) {
                eventDescriptionEl.innerHTML = `<p>${event.mo_ta_su_kien}</p>`;
            } else {
                eventDescriptionEl.innerHTML = `<p>${event.mo_ta}</p>`;
            }
        }
        
        // Thông tin đăng ký trong sidebar
        updateSidebarInfo(event);
        
        // Cập nhật phần trăm đăng ký
        updateRegistrationProgress(event.tong_dang_ky, event.so_luong_tham_gia);
    }
    
    /**
     * Hiển thị lịch trình sự kiện
     * @param {Array} schedule - Danh sách lịch trình
     */
    function renderEventSchedule(schedule) {
        if (!eventScheduleEl) return;
        
        eventScheduleEl.innerHTML = '';
        
        schedule.forEach((item, index) => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            
            scheduleItem.innerHTML = `
                <div class="schedule-number">${index + 1}</div>
                <div class="schedule-content">
                    <h4>${item.tieu_de}</h4>
                    <p>${item.mo_ta}</p>
                    <div class="schedule-time">
                        <i class="far fa-clock"></i>
                        <span>${formatTime(item.thoi_gian_bat_dau)} - ${formatTime(item.thoi_gian_ket_thuc)}</span>
                    </div>
                </div>
            `;
            
            eventScheduleEl.appendChild(scheduleItem);
        });
    }
    
    /**
     * Hiển thị bản đồ
     * @param {string} coordinates - Tọa độ GPS
     * @param {string} address - Địa chỉ đầy đủ
     * @param {string} title - Tên sự kiện
     */
    function renderMap(coordinates, address, title) {
        if (!eventMapEl) return;
        
        // Tạo iframe Google Maps
        const [lat, lng] = coordinates.split(',').map(coord => coord.trim());
        
        if (!lat || !lng) return;
        
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBF24LcAigNpY7eMHAMdNo_kFuUcnrJDNg&q=${lat},${lng}&zoom=16`;
        
        const iframe = document.createElement('iframe');
        iframe.src = mapUrl;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.style.border = '0';
        iframe.allowFullscreen = true;
        
        eventMapEl.appendChild(iframe);
    }
    
    /**
     * Khởi tạo đếm ngược thời gian
     * @param {string} startDate - Ngày bắt đầu sự kiện
     */
    function initCountdown(startDate) {
        if (!eventCountdownEl) return;
        
        const eventDate = new Date(startDate);
        const now = new Date();
        
        // Nếu sự kiện đã diễn ra
        if (eventDate <= now) {
            eventCountdownEl.innerHTML = `
                <h4 class="timer-heading">Sự kiện đã diễn ra</h4>
            `;
            return;
        }
        
        // Hiển thị countdown
        const timerContainer = document.createElement('div');
        timerContainer.className = 'timer-units';
        timerContainer.innerHTML = `
            <div class="timer-unit">
                <div class="timer-value" id="countdown-days">00</div>
                <div class="timer-label">Ngày</div>
            </div>
            <div class="timer-unit">
                <div class="timer-value" id="countdown-hours">00</div>
                <div class="timer-label">Giờ</div>
            </div>
            <div class="timer-unit">
                <div class="timer-value" id="countdown-minutes">00</div>
                <div class="timer-label">Phút</div>
            </div>
            <div class="timer-unit">
                <div class="timer-value" id="countdown-seconds">00</div>
                <div class="timer-label">Giây</div>
            </div>
        `;
        
        eventCountdownEl.innerHTML = '<h4 class="timer-heading">Thời gian còn lại</h4>';
        eventCountdownEl.appendChild(timerContainer);
        
        // Cập nhật đếm ngược mỗi giây
        function updateCountdown() {
            const now = new Date();
            const diff = eventDate - now;
            
            if (diff <= 0) {
                clearInterval(timerInterval);
                eventCountdownEl.innerHTML = `
                    <h4 class="timer-heading">Sự kiện đã bắt đầu</h4>
                `;
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
            document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');
        }
        
        // Cập nhật ngay lần đầu
        updateCountdown();
        
        // Cập nhật mỗi giây
        const timerInterval = setInterval(updateCountdown, 1000);
    }
    
    /**
     * Khởi tạo nút đăng ký
     * @param {Object} event - Thông tin sự kiện
     */
    function initRegistrationButton(event) {
        if (!registrationBtnEl) return;
        
        const now = new Date();
        const registrationStartDate = new Date(event.bat_dau_dang_ky);
        const registrationEndDate = new Date(event.ket_thuc_dang_ky);
        
        // Kiểm tra thời gian đăng ký
        if (now < registrationStartDate) {
            // Chưa mở đăng ký
            registrationBtnEl.textContent = 'Chưa mở đăng ký';
            registrationBtnEl.classList.add('btn-secondary');
            registrationBtnEl.disabled = true;
            
            // Thêm thông tin thời gian mở đăng ký
            registrationBtnEl.title = `Đăng ký sẽ mở vào ${formatDateTime(event.bat_dau_dang_ky)}`;
        } else if (now > registrationEndDate) {
            // Đã hết hạn đăng ký
            registrationBtnEl.textContent = 'Đã kết thúc đăng ký';
            registrationBtnEl.classList.add('btn-secondary');
            registrationBtnEl.disabled = true;
        } else if (event.tong_dang_ky >= event.so_luong_tham_gia) {
            // Đã đủ số lượng
            registrationBtnEl.textContent = 'Đã đủ số lượng';
            registrationBtnEl.classList.add('btn-warning');
            registrationBtnEl.disabled = true;
        } else {
            // Đang mở đăng ký
            registrationBtnEl.textContent = 'Đăng ký tham gia';
            registrationBtnEl.classList.add('btn-primary');
            
            // Thêm sự kiện click
            registrationBtnEl.addEventListener('click', function() {
                // Chuyển hướng đến trang đăng ký với thông tin sự kiện
                window.location.href = `dang-ky-su-kien.html?event_id=${event.su_kien_id}&slug=${event.slug}`;
            });
        }
    }
    
    /**
     * Khởi tạo các nút chia sẻ
     * @param {Object} event - Thông tin sự kiện
     */
    function initShareButtons(event) {
        if (!eventShareEl) return;
        
        const shareButtons = eventShareEl.querySelectorAll('.share-buttons a');
        
        if (!shareButtons.length) return;
        
        const pageUrl = window.location.href;
        const title = `${event.ten_su_kien} - HUB`;
        
        shareButtons.forEach(button => {
            if (button.classList.contains('btn-facebook')) {
                button.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
                button.target = '_blank';
            } else if (button.classList.contains('btn-twitter')) {
                button.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`;
                button.target = '_blank';
            } else if (button.classList.contains('btn-linkedin')) {
                button.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
                button.target = '_blank';
            } else if (button.classList.contains('btn-email')) {
                button.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Xem chi tiết sự kiện tại: ' + pageUrl)}`;
            }
        });
    }
    
    /**
     * Lấy danh sách người đăng ký
     * @param {string} eventId - ID sự kiện
     */
    function fetchRegistrations(eventId) {
        const registrationsTable = document.getElementById('registrationsTable');
        const registrationsBody = document.getElementById('registrationsBody');
        const loadingRegistrations = document.getElementById('loadingRegistrations');
        const noRegistrations = document.getElementById('noRegistrations');
        
        if (!registrationsTable || !registrationsBody) return;
        
        if (loadingRegistrations) loadingRegistrations.style.display = 'block';
        if (registrationsTable) registrationsTable.style.display = 'none';
        if (noRegistrations) noRegistrations.style.display = 'none';
        
        // Lấy danh sách đăng ký
        fetch('data/dangkys-sukien.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(registrations => {
                // Lọc danh sách đăng ký theo sự kiện
                const eventRegistrations = registrations.filter(r => r.su_kien_id == eventId && r.status == 1);
                
                if (loadingRegistrations) loadingRegistrations.style.display = 'none';
                
                if (!eventRegistrations.length) {
                    if (noRegistrations) {
                        noRegistrations.style.display = 'block';
                        noRegistrations.innerHTML = `
                            <div class="empty-state">
                                <div class="empty-state-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <h3>Chưa có người đăng ký</h3>
                                <p class="empty-state-text">Chưa có ai đăng ký tham gia sự kiện này.</p>
                            </div>
                        `;
                    }
                    return;
                }
                
                if (registrationsTable) registrationsTable.style.display = 'table';
                
                // Hiển thị danh sách đăng ký
                renderRegistrations(eventRegistrations);
            })
            .catch(error => {
                console.error('Error fetching registrations:', error);
                if (loadingRegistrations) loadingRegistrations.style.display = 'none';
                if (noRegistrations) {
                    noRegistrations.style.display = 'block';
                    noRegistrations.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i class="fas fa-exclamation-circle"></i>
                            </div>
                            <h3>Đã xảy ra lỗi</h3>
                            <p class="empty-state-text">Không thể tải danh sách đăng ký. Vui lòng thử lại sau.</p>
                        </div>
                    `;
                }
            });
    }
    
    /**
     * Hiển thị danh sách người đăng ký
     * @param {Array} registrations - Danh sách đăng ký
     */
    function renderRegistrations(registrations) {
        const registrationsBody = document.getElementById('registrationsBody');
        
        if (!registrationsBody) return;
        
        registrationsBody.innerHTML = '';
        
        registrations.forEach((registration, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${registration.ho_ten}</td>
                <td>${registration.loai_nguoi_dang_ky}</td>
                <td>${formatDate(registration.ngay_dang_ky)}</td>
                <td>${registration.da_check_in ? '<span class="badge bg-success">Đã check-in</span>' : '<span class="badge bg-warning">Chưa check-in</span>'}</td>
            `;
            
            registrationsBody.appendChild(row);
        });
    }
    
    /**
     * Cập nhật thông tin sidebar
     * @param {Object} event - Thông tin sự kiện
     */
    function updateSidebarInfo(event) {
        // Cập nhật thông tin cơ bản
        document.querySelectorAll('.sidebar-info-value').forEach(el => {
            const key = el.getAttribute('data-key');
            
            if (!key) return;
            
            switch (key) {
                case 'date':
                    el.textContent = formatDate(event.thoi_gian_bat_dau);
                    break;
                case 'time':
                    el.textContent = `${formatTime(event.thoi_gian_bat_dau)} - ${formatTime(event.thoi_gian_ket_thuc)}`;
                    break;
                case 'location':
                    el.textContent = event.dia_diem;
                    break;
                case 'address':
                    el.textContent = event.dia_chi_cu_the || 'Không có thông tin';
                    break;
                case 'format':
                    el.textContent = capitalizeFirstLetter(event.hinh_thuc);
                    break;
                case 'organizer':
                    el.textContent = event.don_vi_to_chuc;
                    break;
                case 'capacity':
                    el.textContent = event.so_luong_tham_gia;
                    break;
                case 'registration_deadline':
                    el.textContent = formatDateTime(event.ket_thuc_dang_ky);
                    break;
                default:
                    break;
            }
        });
    }
    
    /**
     * Cập nhật thanh tiến trình đăng ký
     * @param {number} registered - Số lượng đã đăng ký
     * @param {number} capacity - Số lượng tối đa
     */
    function updateRegistrationProgress(registered, capacity) {
        const progressBar = document.querySelector('.sidebar-progress .progress-bar');
        const progressText = document.querySelector('.sidebar-progress .progress-text');
        
        if (!progressBar || !progressText) return;
        
        const percentage = Math.min(Math.round((registered / capacity) * 100), 100);
        
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        
        progressText.textContent = `${registered}/${capacity} (${percentage}%)`;
    }
    
    /**
     * Hiển thị thông báo lỗi
     * @param {string} message - Nội dung lỗi
     */
    function showErrorMessage(message) {
        const errorContainer = document.getElementById('errorContainer');
        
        if (!errorContainer) return;
        
        errorContainer.innerHTML = `
            <div class="error-container">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3>Đã xảy ra lỗi</h3>
                <p class="empty-state-text">${message}</p>
                <button class="btn btn-primary" onclick="window.location.href='su-kien.html'">
                    <i class="fas fa-arrow-left me-2"></i> Quay lại danh sách sự kiện
                </button>
            </div>
        `;
        
        errorContainer.style.display = 'block';
        
        // Ẩn các phần nội dung khác
        document.querySelectorAll('.event-detail-container').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    /**
     * Viết hoa chữ cái đầu tiên
     * @param {string} str - Chuỗi cần xử lý
     * @returns {string} - Chuỗi đã xử lý
     */
    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}); 