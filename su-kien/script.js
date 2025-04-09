/**
 * Script cho trang Danh sách sự kiện - Đại Học Ngân Hàng TP.HCM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo AOS Animation Library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 50,
            delay: 50,
            mirror: false
        });
    } else {
        console.warn('Thư viện AOS không được tải');
    }
    
    // Biến và elements cơ bản
    const eventContainer = document.getElementById('eventContainer');
    const searchInput = document.getElementById('eventSearchInput');
    const searchButton = document.getElementById('searchButton');
    const resetButton = document.getElementById('resetSearch');
    const noEventsFound = document.getElementById('noEventsFound');
    const loadingEvents = document.getElementById('loadingEvents');
    const pagination = document.getElementById('pagination');
    const eventCardTemplate = document.getElementById('event-card-template');
    
    // Biến lưu trữ dữ liệu và trạng thái
    let allEvents = [];
    let filteredEvents = [];
    let currentPage = 1;
    let eventsPerPage = 6;
    let currentFilter = 'all';
    let currentFormatFilter = 'all';
    
    // Loại sự kiện
    const eventTypes = {
        1: { name: 'Hội thảo', class: 'bg-seminar' },
        2: { name: 'Hội nghị', class: 'bg-conference' },
        3: { name: 'Workshop', class: 'bg-workshop' },
        4: { name: 'Sự kiện', class: 'bg-event' }
    };
    
    // Hiệu ứng cuộn và nút back to top
    const navbar = document.querySelector('.navbar');
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            backToTop.classList.add('active');
        } else {
            navbar.classList.remove('scrolled');
            backToTop.classList.remove('active');
        }
    });
    
    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Preloader
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('loaded');
            setTimeout(function() {
                preloader.style.display = 'none';
            }, 500);
        }
    });
    
    // Debounce function để tối ưu hóa tìm kiếm
    function debounce(func, wait = 300) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Format date function
    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }
    
    // Format time function
    function formatTime(dateString) {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString('vi-VN', options);
    }
    
    // Format number function
    function formatNumber(num) {
        return new Intl.NumberFormat('vi-VN').format(num);
    }
    
    // Load sự kiện từ JSON
    async function loadEvents() {
        showLoading(true);
        try {
            // Thử các đường dẫn khác nhau
            let response;
            const possiblePaths = [
                'http://127.0.0.1:5500/template/data/su-kien.json',
            ];
            
            for (const path of possiblePaths) {
                try {
                    response = await fetch(path);
                    if (response.ok) break;
                } catch (e) {
                    console.warn(`Không thể tải từ đường dẫn: ${path}`);
                }
            }
            
            if (!response || !response.ok) {
                // Dữ liệu mẫu dự phòng khi không tải được JSON
                console.warn('Sử dụng dữ liệu mẫu dự phòng');
                allEvents = getDummyEvents();
            } else {
                allEvents = await response.json();
            }
            
            filteredEvents = [...allEvents];
            renderEvents();
            showLoading(false);
        } catch (error) {
            console.error('Lỗi khi tải sự kiện:', error);
            showNotification('Không thể tải dữ liệu sự kiện. Vui lòng thử lại sau.', 'error');
            // Sử dụng dữ liệu mẫu khi có lỗi
            allEvents = getDummyEvents();
            filteredEvents = [...allEvents];
            renderEvents();
            showLoading(false);
        }
    }
    
    // Hàm tạo dữ liệu mẫu dự phòng
    function getDummyEvents() {
        return [
            {
                su_kien_id: 1,
                ten_su_kien: "Hội thảo khoa học \"Tài chính và Ngân hàng trong kỷ nguyên số\"",
                su_kien_poster: {
                    url: "https://hub.edu.vn/wp-content/uploads/2023/12/hoi-thao-khoa-hoc.jpg",
                    alt: "Hội thảo khoa học"
                },
                mo_ta: "Hội thảo tập trung vào những thách thức và cơ hội của ngành tài chính ngân hàng trong thời đại số.",
                dia_diem: "CS Tôn Thất Đạm",
                dia_chi_cu_the: "36 Tôn Thất Đạm, Quận 1, TP.HCM",
                thoi_gian_bat_dau: "2023-06-15 08:00:00",
                thoi_gian_ket_thuc: "2023-06-15 17:00:00",
                loai_su_kien_id: 1,
                hinh_thuc: "offline",
                tong_dang_ky: 132,
                so_luot_xem: 1326,
                slug: "hoi-thao-tai-chinh-ngan-hang-ky-nguyen-so",
                status: 1
            },
            {
                su_kien_id: 2,
                ten_su_kien: "Ngày hội việc làm HUB lần thứ 13 - Năm 2023",
                su_kien_poster: {
                    url: "https://hub.edu.vn/wp-content/uploads/2023/12/ngay-hoi-viec-lam.jpeg",
                    alt: "Ngày hội việc làm"
                },
                mo_ta: "Cơ hội kết nối với hơn 50 doanh nghiệp hàng đầu trong lĩnh vực tài chính, ngân hàng và công nghệ.",
                dia_diem: "CS Hoàng Diệu",
                dia_chi_cu_the: "56 Hoàng Diệu 2, Quận Thủ Đức, TP.HCM",
                thoi_gian_bat_dau: "2023-06-22 08:30:00",
                thoi_gian_ket_thuc: "2023-06-22 16:30:00",
                loai_su_kien_id: 2,
                hinh_thuc: "offline",
                tong_dang_ky: 168,
                so_luot_xem: 980,
                slug: "ngay-hoi-viec-lam-hub-lan-13-2023",
                status: 1
            }
        ];
    }
    
    // Hiển thị/ẩn trạng thái loading
    function showLoading(isLoading) {
        if (isLoading) {
            loadingEvents.classList.remove('d-none');
            eventContainer.classList.add('d-none');
            pagination.classList.add('d-none');
        } else {
            loadingEvents.classList.add('d-none');
            eventContainer.classList.remove('d-none');
            pagination.classList.remove('d-none');
        }
    }
    
    // Tạo thẻ sự kiện từ template
    function createEventCard(event) {
        // Kiểm tra template có tồn tại không
        if (!eventCardTemplate) {
            console.warn('Không tìm thấy template, tạo event card thủ công');
            return createManualEventCard(event);
        }
        
        const template = eventCardTemplate.content.cloneNode(true);
        const eventCard = template.querySelector('.col-lg-4');
        
        // Thiết lập các thuộc tính data
        eventCard.dataset.type = event.loai_su_kien_id;
        eventCard.dataset.format = event.hinh_thuc;
        
        // Poster
        const posterImg = template.querySelector('.event-image img');
        posterImg.src = event.su_kien_poster?.url || 'https://hub.edu.vn/wp-content/uploads/2023/12/event-default.jpg';
        posterImg.alt = event.su_kien_poster?.alt || event.ten_su_kien;
        
        // Badge 
        const badge = template.querySelector('.event-badge .badge');
        const eventType = eventTypes[event.loai_su_kien_id] || eventTypes[4];
        badge.textContent = eventType.name.toUpperCase();
        badge.className = `badge ${eventType.class}`;
        
        // Title
        const titleLink = template.querySelector('.event-title a');
        titleLink.textContent = event.ten_su_kien;
        titleLink.href = `chi-tiet-su-kien.html?id=${event.su_kien_id}&slug=${event.slug}`;
        
        // Meta data
        template.querySelector('.meta-item.date span').textContent = 
            `${formatDate(event.thoi_gian_bat_dau)} ${formatTime(event.thoi_gian_bat_dau)}`;
        template.querySelector('.meta-item.location span').textContent = event.dia_diem;
        template.querySelector('.meta-item.participants span').textContent = 
            `${formatNumber(event.tong_dang_ky)} người tham gia`;
        template.querySelector('.meta-item.format span').textContent = 
            event.hinh_thuc === 'offline' ? 'offline' : 
            event.hinh_thuc === 'online' ? 'online' : 'hybrid';
        
        // Description
        template.querySelector('.event-description').textContent = event.mo_ta;
        
        // Stats
        template.querySelector('.stat.views span').textContent = 
            `${formatNumber(event.so_luot_xem)} lượt xem`;
        template.querySelector('.stat.registrations span').textContent = 
            `${formatNumber(event.tong_dang_ky)} đã đăng ký`;
        
        // Action buttons
        const detailLink = template.querySelector('.btn-view-details');
        detailLink.href = `chi-tiet-su-kien.html?id=${event.su_kien_id}&slug=${event.slug}`;
        
        
        return template;
    }
    
    // Hàm tạo thẻ sự kiện thủ công khi không tìm thấy template
    function createManualEventCard(event) {
        const eventType = eventTypes[event.loai_su_kien_id] || eventTypes[4];
        const cardHTML = `
            <div class="col-lg-4 col-md-6 mb-4" data-type="${event.loai_su_kien_id}" data-format="${event.hinh_thuc}">
                <div class="event-card">
                    <div class="event-image">
                        <img src="${event.su_kien_poster?.url || 'https://hub.edu.vn/wp-content/uploads/2023/12/event-default.jpg'}" alt="${event.su_kien_poster?.alt || event.ten_su_kien}" loading="lazy">
                        <div class="event-badge">
                            <span class="badge ${eventType.class}">${eventType.name.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="event-content">
                        <h3 class="event-title">
                            <a href="chi-tiet-su-kien.html?id=${event.su_kien_id}&slug=${event.slug}">${event.ten_su_kien}</a>
                        </h3>
                        <div class="event-meta">
                            <div class="meta-item date">
                                <i class="far fa-calendar-alt"></i> <span>${formatDate(event.thoi_gian_bat_dau)} ${formatTime(event.thoi_gian_bat_dau)}</span>
                            </div>
                            <div class="meta-item location">
                                <i class="fas fa-map-marker-alt"></i> <span>${event.dia_diem}</span>
                            </div>
                            <div class="meta-item participants">
                                <i class="fas fa-users"></i> <span>${formatNumber(event.tong_dang_ky)} người tham gia</span>
                            </div>
                            <div class="meta-item format">
                                <i class="fas fa-wifi"></i> <span>${event.hinh_thuc}</span>
                            </div>
                        </div>
                        <p class="event-description">${event.mo_ta}</p>
                        <div class="event-stats">
                            <div class="stat views">
                                <i class="far fa-eye"></i> <span>${formatNumber(event.so_luot_xem)} lượt xem</span>
                            </div>
                            <div class="stat registrations">
                                <i class="far fa-user"></i> <span>${formatNumber(event.tong_dang_ky)} đã đăng ký</span>
                            </div>
                        </div>
                        <div class="event-actions">
                            <a href="chi-tiet-su-kien.html?id=${event.su_kien_id}&slug=${event.slug}" class="btn-view-details">Xem chi tiết <i class="fas fa-arrow-right"></i></a>
                            <a href="dang-ky-su-kien.html?id=${event.su_kien_id}" class="btn btn-sm btn-primary">Đăng ký</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        return tempDiv.firstElementChild;
    }
    
    // Render danh sách sự kiện với phân trang
    function renderEvents() {
        eventContainer.innerHTML = '';
        
        if (filteredEvents.length === 0) {
            noEventsFound.classList.remove('d-none');
            pagination.classList.add('d-none');
            return;
        }
        
        noEventsFound.classList.add('d-none');
        
        // Tính toán sự kiện cho trang hiện tại
        const startIndex = (currentPage - 1) * eventsPerPage;
        const endIndex = Math.min(startIndex + eventsPerPage, filteredEvents.length);
        const currentEvents = filteredEvents.slice(startIndex, endIndex);
        
        // Render từng sự kiện
        currentEvents.forEach((event, index) => {
            const eventCard = createEventCard(event);
            eventContainer.appendChild(eventCard);
            
            // Animation delay
            const card = eventContainer.children[eventContainer.children.length - 1];
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
        
        // Render phân trang
        renderPagination();
    }
    
    // Render phân trang
    function renderPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
        
        if (totalPages <= 1) {
            pagination.classList.add('d-none');
            return;
        }
        
        pagination.classList.remove('d-none');
        
        // Nút Previous
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.href = '#';
        prevLink.setAttribute('aria-label', 'Previous');
        prevLink.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        if (currentPage > 1) {
            prevLink.addEventListener('click', (e) => {
                e.preventDefault();
                goToPage(currentPage - 1);
            });
        }
        
        prevLi.appendChild(prevLink);
        pagination.appendChild(prevLi);
        
        // Page numbers
        const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page
        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            
            const firstLink = document.createElement('a');
            firstLink.className = 'page-link';
            firstLink.href = '#';
            firstLink.textContent = '1';
            
            firstLink.addEventListener('click', (e) => {
                e.preventDefault();
                goToPage(1);
            });
            
            firstLi.appendChild(firstLink);
            pagination.appendChild(firstLi);
            
            // Ellipsis after first page
            if (startPage > 2) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                
                const ellipsisSpan = document.createElement('span');
                ellipsisSpan.className = 'page-link';
                ellipsisSpan.innerHTML = '&hellip;';
                
                ellipsisLi.appendChild(ellipsisSpan);
                pagination.appendChild(ellipsisLi);
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            
            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.href = '#';
            pageLink.textContent = i;
            
            if (i !== currentPage) {
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    goToPage(i);
                });
            }
            
            pageLi.appendChild(pageLink);
            pagination.appendChild(pageLi);
        }
        
        // Ellipsis before last page
        if (endPage < totalPages - 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            
            const ellipsisSpan = document.createElement('span');
            ellipsisSpan.className = 'page-link';
            ellipsisSpan.innerHTML = '&hellip;';
            
            ellipsisLi.appendChild(ellipsisSpan);
            pagination.appendChild(ellipsisLi);
        }
        
        // Last page
        if (endPage < totalPages) {
            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            
            const lastLink = document.createElement('a');
            lastLink.className = 'page-link';
            lastLink.href = '#';
            lastLink.textContent = totalPages;
            
            lastLink.addEventListener('click', (e) => {
                e.preventDefault();
                goToPage(totalPages);
            });
            
            lastLi.appendChild(lastLink);
            pagination.appendChild(lastLi);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.href = '#';
        nextLink.setAttribute('aria-label', 'Next');
        nextLink.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        if (currentPage < totalPages) {
            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                goToPage(currentPage + 1);
            });
        }
        
        nextLi.appendChild(nextLink);
        pagination.appendChild(nextLi);
    }
    
    // Chuyển đến trang cụ thể
    function goToPage(page) {
        if (page === currentPage) return;
        
        currentPage = page;
        renderEvents();
        
        // Scroll lên đầu phần sự kiện
        const eventSection = document.querySelector('.event-list-section');
        window.scrollTo({
            top: eventSection.offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    // Hàm xử lý tìm kiếm
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Thực hiện tìm kiếm
        filteredEvents = allEvents.filter(event => {
            // Lọc theo từ khóa
            if (searchTerm && 
                !event.ten_su_kien.toLowerCase().includes(searchTerm) && 
                !event.mo_ta.toLowerCase().includes(searchTerm) &&
                !(event.dia_diem && event.dia_diem.toLowerCase().includes(searchTerm))) {
                return false;
            }
            
            // Lọc theo loại sự kiện
            if (currentFilter !== 'all' && event.loai_su_kien_id.toString() !== currentFilter) {
                return false;
            }
            
            // Lọc theo hình thức 
            if (currentFormatFilter !== 'all' && event.hinh_thuc !== currentFormatFilter) {
                return false;
            }
            
            return true;
        });
        
        // Reset về trang đầu tiên
        currentPage = 1;
        
        // Render lại danh sách sự kiện
        renderEvents();
        
        // Hiển thị thông báo kết quả
        if (searchTerm) {
            showNotification(`Tìm thấy ${filteredEvents.length} sự kiện phù hợp`, 
                filteredEvents.length > 0 ? 'info' : 'error');
        }
    }
    
    // Xử lý lọc sự kiện theo loại
    function filterEventsByType(type) {
        currentFilter = type;
        handleSearch();
        
        // Hiển thị thông báo
        const filterName = type === 'all' ? 'tất cả' : 
                          eventTypes[type]?.name.toLowerCase() || 'sự kiện';
        
        showNotification(`Đang hiển thị ${filteredEvents.length} ${filterName}`, 'info');
    }
    
    // Xử lý lọc sự kiện theo hình thức
    function filterEventsByFormat(format) {
        currentFormatFilter = format;
        handleSearch();
        
        // Hiển thị thông báo
        const formatName = format === 'all' ? 'tất cả hình thức' : 
                            format === 'offline' ? 'offline' :
                            format === 'online' ? 'online' : 'hybrid';
        
        showNotification(`Đang hiển thị ${filteredEvents.length} sự kiện ${formatName}`, 'info');
    }
    
    // Lọc sự kiện trong tuần này
    function filterThisWeekEvents() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Chủ nhật là ngày đầu tuần
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        filteredEvents = allEvents.filter(event => {
            const eventDate = new Date(event.thoi_gian_bat_dau);
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });
        
        currentPage = 1;
        renderEvents();
        
        showNotification(`Có ${filteredEvents.length} sự kiện trong tuần này`, 'info');
    }
    
    // Reset tất cả bộ lọc
    function resetAllFilters() {
        searchInput.value = '';
        currentFilter = 'all';
        currentFormatFilter = 'all';
        filteredEvents = [...allEvents];
        currentPage = 1;
        
        // Reset active state của các nút lọc
        document.querySelectorAll('.filter-btn, .format-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
        document.querySelector('.format-filter-btn[data-format="all"]').classList.add('active');
        
        // Render lại danh sách
        renderEvents();
        
        showNotification('Đã đặt lại tất cả bộ lọc', 'info');
    }
    
    // Hiển thị thông báo
    function showNotification(message, type = 'info') {
        // Xóa thông báo cũ
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Tạo thông báo mới
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => notification.remove());
        
        content.appendChild(messageSpan);
        content.appendChild(closeButton);
        notification.appendChild(content);
        
        document.body.appendChild(notification);
        
        // Hiển thị thông báo
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    // Đăng ký sự kiện
    // Tìm kiếm
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        const debouncedSearch = debounce(handleSearch, 300);
        searchInput.addEventListener('input', debouncedSearch);
        searchInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') handleSearch();
        });
    }
    
    // Reset tìm kiếm
    if (resetButton) {
        resetButton.addEventListener('click', resetAllFilters);
    }
    
    // Lọc theo loại sự kiện
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class từ tất cả buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class cho button được click
            this.classList.add('active');
            
            // Lọc sự kiện
            filterEventsByType(this.dataset.filter);
        });
    });
    
    // Lọc theo hình thức
    document.querySelectorAll('.format-filter-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class từ tất cả buttons
            document.querySelectorAll('.format-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class cho button được click
            this.classList.add('active');
            
            // Lọc sự kiện
            filterEventsByFormat(this.dataset.format);
        });
    });
    
    // Lọc sự kiện trong tuần này
    const btnThisWeek = document.getElementById('btnThisWeek');
    if (btnThisWeek) {
        btnThisWeek.addEventListener('click', function(e) {
            e.preventDefault();
            filterThisWeekEvents();
        });
    }
    
    // Xem tất cả sự kiện
    const btnViewAll = document.getElementById('btnViewAll');
    if (btnViewAll) {
        btnViewAll.addEventListener('click', function(e) {
            e.preventDefault();
            resetAllFilters();
        });
    }
    
    // Nút All Events
    const btnAllEvents = document.getElementById('btnAllEvents');
    if (btnAllEvents) {
        btnAllEvents.addEventListener('click', function(e) {
            e.preventDefault();
            resetAllFilters();
        });
    }
    
    // Load dữ liệu sự kiện khi trang được tải
    loadEvents();
});
