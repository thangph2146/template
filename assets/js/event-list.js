/**
 * JavaScript xử lý trang danh sách sự kiện - Đại Học Ngân Hàng TP.HCM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo biến và elements cơ bản
    const eventContainer = document.getElementById('eventContainer');
    const searchInput = document.getElementById('eventSearchInput');
    const searchButton = document.getElementById('searchButton');
    const resetButton = document.getElementById('resetSearch');
    const noEventsFound = document.getElementById('noEventsFound');
    const loadingEvents = document.getElementById('loadingEvents');
    const pagination = document.getElementById('pagination');
    
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
    
    // Lấy dữ liệu sự kiện từ API
    fetchEvents();
    
    // Xử lý tìm kiếm
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function() {
            searchEvents();
        });
        
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchEvents();
            }
        });
    }
    
    // Reset tìm kiếm
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            currentFilter = 'all';
            currentFormatFilter = 'all';
            
            // Reset UI
            resetActiveFilters();
            
            // Hiển thị lại tất cả sự kiện
            filterEvents();
        });
    }
    
    // Xử lý lọc theo loại sự kiện
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Cập nhật UI
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Lọc sự kiện
            currentFilter = this.getAttribute('data-filter');
            filterEvents();
        });
    });
    
    // Xử lý lọc theo hình thức
    const formatFilterButtons = document.querySelectorAll('.format-filter-btn');
    formatFilterButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Cập nhật UI
            formatFilterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Lọc sự kiện
            currentFormatFilter = this.getAttribute('data-format');
            filterEvents();
        });
    });
    
    /**
     * Lấy dữ liệu sự kiện từ API
     */
    function fetchEvents() {
        if (loadingEvents) loadingEvents.style.display = 'block';
        if (noEventsFound) noEventsFound.style.display = 'none';
        if (eventContainer) eventContainer.innerHTML = '';
        
        // Xử lý loading
        document.body.classList.add('loading');
        
        fetch('data/su-kien.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                allEvents = data;
                filteredEvents = [...allEvents];
                
                // Lấy trạng thái filter từ URL nếu có
                parseUrlParams();
                
                // Hiển thị sự kiện
                filterEvents();
                
                // Ẩn loading
                document.body.classList.remove('loading');
                if (loadingEvents) loadingEvents.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                if (loadingEvents) loadingEvents.style.display = 'none';
                if (noEventsFound) {
                    noEventsFound.style.display = 'block';
                    noEventsFound.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i class="fas fa-exclamation-circle"></i>
                            </div>
                            <h3>Đã xảy ra lỗi</h3>
                            <p class="empty-state-text">Không thể tải dữ liệu sự kiện. Vui lòng thử lại sau.</p>
                            <button class="btn btn-primary" onclick="location.reload()">
                                <i class="fas fa-sync-alt me-2"></i> Tải lại trang
                            </button>
                        </div>
                    `;
                }
                
                // Ẩn loading
                document.body.classList.remove('loading');
            });
    }
    
    /**
     * Lọc danh sách sự kiện theo điều kiện hiện tại
     */
    function filterEvents() {
        // Lấy từ khóa tìm kiếm
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        
        // Lọc sự kiện
        filteredEvents = allEvents.filter(event => {
            // Lọc theo loại sự kiện
            if (currentFilter !== 'all' && event.loai_su_kien_id != currentFilter) {
                return false;
            }
            
            // Lọc theo hình thức
            if (currentFormatFilter !== 'all' && event.hinh_thuc !== currentFormatFilter) {
                return false;
            }
            
            // Lọc theo từ khóa
            if (searchTerm) {
                return (
                    event.ten_su_kien.toLowerCase().includes(searchTerm) ||
                    event.mo_ta.toLowerCase().includes(searchTerm) ||
                    event.dia_diem.toLowerCase().includes(searchTerm) ||
                    event.tu_khoa_su_kien.toLowerCase().includes(searchTerm)
                );
            }
            
            return true;
        });
        
        // Cập nhật URL với các tham số lọc
        updateUrlParams();
        
        // Reset về trang đầu tiên
        currentPage = 1;
        
        // Hiển thị sự kiện
        renderEvents();
    }
    
    /**
     * Tìm kiếm sự kiện
     */
    function searchEvents() {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.trim();
        
        // Hiệu ứng loading
        document.body.classList.add('searching');
        
        // Delay nhỏ để hiệu ứng loading được hiển thị
        setTimeout(() => {
            filterEvents();
            document.body.classList.remove('searching');
        }, 300);
    }
    
    /**
     * Hiển thị danh sách sự kiện
     */
    function renderEvents() {
        if (!eventContainer) return;
        
        // Tính toán phân trang
        const startIndex = (currentPage - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        const eventsToShow = filteredEvents.slice(startIndex, endIndex);
        
        // Xóa nội dung hiện tại
        eventContainer.innerHTML = '';
        
        // Kiểm tra nếu không có sự kiện nào
        if (filteredEvents.length === 0) {
            if (noEventsFound) {
                noEventsFound.style.display = 'block';
                noEventsFound.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-calendar-times"></i>
                        </div>
                        <h3>Không tìm thấy sự kiện nào</h3>
                        <p class="empty-state-text">Không có sự kiện nào phù hợp với điều kiện tìm kiếm của bạn.</p>
                        <button class="btn btn-primary" id="resetSearchButton">
                            <i class="fas fa-sync-alt me-2"></i> Xem tất cả sự kiện
                        </button>
                    </div>
                `;
                
                // Thêm event listener cho nút reset
                document.getElementById('resetSearchButton').addEventListener('click', function() {
                    if (searchInput) searchInput.value = '';
                    currentFilter = 'all';
                    currentFormatFilter = 'all';
                    
                    // Reset UI
                    resetActiveFilters();
                    
                    // Hiển thị lại tất cả sự kiện
                    filterEvents();
                });
            }
            return;
        }
        
        // Ẩn thông báo không tìm thấy
        if (noEventsFound) {
            noEventsFound.style.display = 'none';
        }
        
        // Render các sự kiện
        eventsToShow.forEach(event => {
            const eventType = eventTypes[event.loai_su_kien_id] || eventTypes[4];
            const eventCard = createEventCard(event, eventType);
            eventContainer.appendChild(eventCard);
        });
        
        // Hiển thị phân trang
        renderPagination();
    }
    
    /**
     * Tạo thẻ sự kiện
     * @param {Object} event - Dữ liệu sự kiện
     * @param {Object} eventType - Loại sự kiện
     * @returns {Element} - Element thẻ sự kiện
     */
    function createEventCard(event, eventType) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        col.setAttribute('data-type', event.loai_su_kien_id);
        col.setAttribute('data-format', event.hinh_thuc);
        
        // Tính toán phần trăm đăng ký
        const registrationPercent = Math.min(Math.round((event.tong_dang_ky / event.so_luong_tham_gia) * 100), 100);
        
        // Kiểm tra ngày kết thúc đăng ký
        const daysRemaining = getDaysRemaining(event.ket_thuc_dang_ky);
        let statusClass = 'status-open';
        let statusText = 'Đang mở đăng ký';
        
        if (daysRemaining <= 0) {
            statusClass = 'status-closed';
            statusText = 'Đã kết thúc đăng ký';
        } else if (daysRemaining <= 3) {
            statusClass = 'status-closing';
            statusText = `Còn ${daysRemaining} ngày`;
        }
        
        col.innerHTML = `
            <div class="event-card" data-aos="fade-up" data-aos-delay="${Math.floor(Math.random() * 300)}">
                <div class="event-image">
                    <img src="${event.su_kien_poster?.url || 'https://hub.edu.vn/wp-content/uploads/2023/12/event-default.jpg'}" 
                         alt="${event.su_kien_poster?.alt || event.ten_su_kien}" loading="lazy">
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
                            <i class="far fa-calendar-alt"></i> <span>${formatDate(event.thoi_gian_bat_dau)}</span>
                        </div>
                        <div class="meta-item time">
                            <i class="far fa-clock"></i> <span>${formatTime(event.thoi_gian_bat_dau)}</span>
                        </div>
                        <div class="meta-item location">
                            <i class="fas fa-map-marker-alt"></i> <span>${event.dia_diem}</span>
                        </div>
                        <div class="meta-item format">
                            <i class="fas fa-wifi"></i> <span>${event.hinh_thuc}</span>
                        </div>
                    </div>
                    <p class="event-description">${event.mo_ta}</p>
                    <div class="event-progress">
                        <div class="progress-label">
                            <span>Số lượng đăng ký</span>
                            <span>${event.tong_dang_ky}/${event.so_luong_tham_gia}</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${registrationPercent}%" 
                                 aria-valuenow="${registrationPercent}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                    <div class="event-footer">
                        <div class="event-status ${statusClass}">${statusText}</div>
                        <div class="event-actions">
                            <a href="chi-tiet-su-kien.html?id=${event.su_kien_id}&slug=${event.slug}" class="btn btn-sm btn-primary">
                                Chi tiết
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return col;
    }
    
    /**
     * Hiển thị phân trang
     */
    function renderPagination() {
        if (!pagination) return;
        
        pagination.innerHTML = '';
        
        const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
        
        if (totalPages <= 1) {
            return;
        }
        
        const paginationContainer = document.createElement('ul');
        paginationContainer.className = 'pagination justify-content-center';
        
        // Nút Previous
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </a>`;
        paginationContainer.appendChild(prevLi);
        
        // Các trang
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            paginationContainer.appendChild(pageLi);
        }
        
        // Nút Next
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </a>`;
        paginationContainer.appendChild(nextLi);
        
        pagination.appendChild(paginationContainer);
        
        // Thêm event listener cho các nút phân trang
        const pageLinks = pagination.querySelectorAll('.page-link');
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageNumber = parseInt(this.getAttribute('data-page'));
                
                if (pageNumber === currentPage || isNaN(pageNumber)) {
                    return;
                }
                
                if (pageNumber <= 0 || pageNumber > totalPages) {
                    return;
                }
                
                currentPage = pageNumber;
                renderEvents();
                
                // Cuộn lên đầu container
                eventContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }
    
    /**
     * Phân tích và lấy tham số từ URL
     */
    function parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Lọc theo loại sự kiện
        const typeParam = urlParams.get('type');
        if (typeParam) {
            currentFilter = typeParam;
            
            // Cập nhật UI
            const activeFilterBtn = document.querySelector(`.filter-btn[data-filter="${typeParam}"]`);
            if (activeFilterBtn) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                activeFilterBtn.classList.add('active');
            }
        }
        
        // Lọc theo hình thức
        const formatParam = urlParams.get('format');
        if (formatParam) {
            currentFormatFilter = formatParam;
            
            // Cập nhật UI
            const activeFormatBtn = document.querySelector(`.format-filter-btn[data-format="${formatParam}"]`);
            if (activeFormatBtn) {
                document.querySelectorAll('.format-filter-btn').forEach(btn => btn.classList.remove('active'));
                activeFormatBtn.classList.add('active');
            }
        }
        
        // Tìm kiếm
        const searchParam = urlParams.get('q');
        if (searchParam && searchInput) {
            searchInput.value = searchParam;
        }
    }
    
    /**
     * Cập nhật tham số trong URL
     */
    function updateUrlParams() {
        const urlParams = new URLSearchParams();
        
        // Thêm tham số loại sự kiện
        if (currentFilter !== 'all') {
            urlParams.set('type', currentFilter);
        }
        
        // Thêm tham số hình thức
        if (currentFormatFilter !== 'all') {
            urlParams.set('format', currentFormatFilter);
        }
        
        // Thêm tham số tìm kiếm
        if (searchInput && searchInput.value.trim()) {
            urlParams.set('q', searchInput.value.trim());
        }
        
        // Cập nhật URL
        const newUrl = urlParams.toString() ? `?${urlParams.toString()}` : window.location.pathname;
        history.replaceState(null, '', newUrl);
    }
    
    /**
     * Reset trạng thái active của các bộ lọc
     */
    function resetActiveFilters() {
        // Reset loại sự kiện
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
        
        // Reset hình thức
        document.querySelectorAll('.format-filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.format-filter-btn[data-format="all"]')?.classList.add('active');
    }
}); 