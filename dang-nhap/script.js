/**
 * Script để xử lý trang sự kiện đã tham gia
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo particles.js 
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'repulse' },
                onclick: { enable: true, mode: 'push' },
                resize: true
            }
        },
        retina_detect: true
    });
    // Xử lý nút áp dụng bộ lọc
    document.getElementById('applyFilters').addEventListener('click', function() {
        applyFilters();
    });
    
    // Thiết lập ban đầu cho các trường datetime-local
    initDateTimeFields();
    
    // Hàm định dạng ngày giờ theo dd/mm/yyyy h:i:s
    function formatDateTimeVN(date) {
        if (!date || isNaN(date.getTime())) return '';
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    
    // Hàm khởi tạo các trường thời gian
    function initDateTimeFields() {
        // Lấy tham số từ URL hiện tại
        const urlParams = new URLSearchParams(window.location.search);
        
        // Định dạng lại giá trị start_date nếu có
        if(urlParams.has('start_date')) {
            const startDateValue = urlParams.get('start_date');
            try {
                const date = new Date(startDateValue);
                if(!isNaN(date.getTime())) {
                    // Định dạng để phù hợp với trường datetime-local (YYYY-MM-DDThh:mm)
                    const formattedDate = date.toISOString().slice(0, 16);
                    document.getElementById('startDate').value = formattedDate;
                    
                    // Thêm định dạng hiển thị dd/mm/yyyy h:i:s vào phần hiển thị
                    const formattedDisplayDate = formatDateTimeVN(date);
                    document.getElementById('startDateDisplay').textContent = `(${formattedDisplayDate})`;
                }
            } catch(e) {
                console.error('Lỗi khi xử lý ngày bắt đầu:', e);
            }
        }
        
        // Định dạng lại giá trị end_date nếu có
        if(urlParams.has('end_date')) {
            const endDateValue = urlParams.get('end_date');
            try {
                const date = new Date(endDateValue);
                if(!isNaN(date.getTime())) {
                    // Định dạng để phù hợp với trường datetime-local (YYYY-MM-DDThh:mm)
                    const formattedDate = date.toISOString().slice(0, 16);
                    document.getElementById('endDate').value = formattedDate;
                    
                    // Thêm định dạng hiển thị dd/mm/yyyy h:i:s vào phần hiển thị
                    const formattedDisplayDate = formatDateTimeVN(date);
                    document.getElementById('endDateDisplay').textContent = `(${formattedDisplayDate})`;
                }
            } catch(e) {
                console.error('Lỗi khi xử lý ngày kết thúc:', e);
            }
        }
        
        // Thiết lập sự kiện change để cập nhật hiển thị ngày giờ
        document.getElementById('startDate').addEventListener('change', function() {
            updateDateDisplay(this, 'startDateDisplay');
        });
        
        document.getElementById('endDate').addEventListener('change', function() {
            updateDateDisplay(this, 'endDateDisplay');
        });
        
        // Thiết lập sự kiện cho sorting
        const sortSelect = document.getElementById('eventSort');
        if (urlParams.has('sort')) {
            sortSelect.value = urlParams.get('sort');
        }

        // Thiết lập giá trị tìm kiếm nếu có
        if (urlParams.has('search')) {
            document.getElementById('eventSearch').value = urlParams.get('search');
        }

        // Khởi tạo tìm kiếm và sắp xếp trực tiếp
        setupFilterAndSort();
    }
    
    // Hàm cập nhật hiển thị ngày giờ khi người dùng thay đổi
    function updateDateDisplay(inputElement, displayElementId) {
        try {
            const date = new Date(inputElement.value);
            if(!isNaN(date.getTime())) {
                const formattedDisplayDate = formatDateTimeVN(date);
                document.getElementById(displayElementId).textContent = `(${formattedDisplayDate})`;
            } else {
                document.getElementById(displayElementId).textContent = '';
            }
        } catch(e) {
            console.error('Lỗi khi cập nhật hiển thị ngày:', e);
            document.getElementById(displayElementId).textContent = '';
        }
    }
    
    // Hàm áp dụng các bộ lọc
    function applyFilters() {
        let url = new URL(window.location.href);
        let searchParams = new URLSearchParams(url.search);
        
        // Lấy giá trị từ các trường
        const search = document.getElementById('eventSearch').value;
        const sort = document.getElementById('eventSort').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        // Cập nhật tham số URL
        updateParam(searchParams, 'search', search);
        updateParam(searchParams, 'sort', sort);
        
        // Xử lý và cập nhật tham số ngày giờ
        if(startDate) {
            searchParams.set('start_date', new Date(startDate).toISOString());
        } else {
            searchParams.delete('start_date');
        }
        
        if(endDate) {
            searchParams.set('end_date', new Date(endDate).toISOString());
        } else {
            searchParams.delete('end_date');
        }
        
        // Cập nhật URL mà không chuyển hướng trang (trong môi trường không-server)
        url.search = searchParams.toString();
        window.history.pushState({}, '', url.toString());
        
        // Áp dụng lọc và sắp xếp trực tiếp cho trang
        setupFilterAndSort();
    }
    
    // Hàm cập nhật tham số URL
    function updateParam(params, key, value) {
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
    }

    // Hàm lọc và sắp xếp dữ liệu trực tiếp
    function setupFilterAndSort() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search') || '';
        const sortBy = urlParams.get('sort') || 'newest';
        const startDateStr = urlParams.get('start_date');
        const endDateStr = urlParams.get('end_date');
        
        // Chuyển đổi ngày nếu có
        const startDate = startDateStr ? new Date(startDateStr) : null;
        const endDate = endDateStr ? new Date(endDateStr) : null;
        
        // Lấy tất cả các thẻ sự kiện
        const eventCards = document.querySelectorAll('.event-card');
        
        // Mảng để lưu các thẻ đã lọc để sắp xếp sau
        const filteredEvents = [];
        
        // Đếm số sự kiện được hiển thị (cho trạng thái trống)
        let visibleEventCount = 0;
        
        // Lọc sự kiện
        eventCards.forEach(card => {
            const eventName = card.getAttribute('data-event-name') || '';
            const eventDateStr = card.getAttribute('data-event-date') || '';
            const eventDate = eventDateStr ? new Date(eventDateStr) : null;
            
            let isVisible = true;
            
            // Lọc theo tên sự kiện
            if (searchQuery && !eventName.toLowerCase().includes(searchQuery.toLowerCase())) {
                isVisible = false;
            }
            
            // Lọc theo ngày bắt đầu
            if (isVisible && startDate && eventDate && eventDate < startDate) {
                isVisible = false;
            }
            
            // Lọc theo ngày kết thúc
            if (isVisible && endDate && eventDate && eventDate > endDate) {
                isVisible = false;
            }
            
            // Ẩn/hiện thẻ dựa trên kết quả lọc
            if (isVisible) {
                card.style.display = '';
                filteredEvents.push(card);
                visibleEventCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Sắp xếp các sự kiện đã lọc
        filteredEvents.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-event-date') || '');
            const dateB = new Date(b.getAttribute('data-event-date') || '');
            const nameA = a.getAttribute('data-event-name') || '';
            const nameB = b.getAttribute('data-event-name') || '';
            
            switch (sortBy) {
                case 'newest':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'name':
                    return nameA.localeCompare(nameB);
                default:
                    return 0;
            }
        });
        
        // Cập nhật DOM với thứ tự mới
        const eventsList = document.querySelector('.attended-events-list');
        if (eventsList) {
            filteredEvents.forEach(card => {
                eventsList.appendChild(card);
            });
        }
        
        // Hiển thị/ẩn trạng thái trống nếu không có sự kiện
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = visibleEventCount > 0 ? 'none' : 'block';
        }
        
        // Hiển thị danh sách sự kiện nếu có sự kiện
        if (eventsList) {
            eventsList.style.display = visibleEventCount > 0 ? 'grid' : 'none';
        }
    }
});

/**
 * Script trang chủ cho Sự Kiện Đại Học Ngân Hàng TP.HCM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo AOS Animation Library
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Khởi tạo Particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#ffffff' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
                move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
    
    // Navbar scroll effect
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
    
    // Back to top button
    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Form submission handling
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            let isValid = true;
            const formFields = registrationForm.querySelectorAll('input, textarea, select');
            
            formFields.forEach(field => {
                if (field.hasAttribute('required') && !field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                }
                
                // Email validation
                if (field.type === 'email' && field.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value.trim())) {
                        isValid = false;
                        field.classList.add('is-invalid');
                    }
                }
            });
            
            if (isValid) {
                // Here you would normally send data to server
                // For demo purposes, we just show a success message
                showNotification('Đăng ký thành công! Chúng tôi sẽ liên hệ lại với bạn sớm.', 'success');
                registrationForm.reset();
            } else {
                showNotification('Vui lòng điền đầy đủ thông tin.', 'error');
            }
        });
        
        // Remove invalid class on input
        registrationForm.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    this.classList.remove('is-invalid');
                }
            });
        });
    }
    
    // Event card hover animation
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.event-image img').style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('.event-image img').style.transform = 'scale(1)';
        });
    });
    
    // Initialize lazy loading for images
    if ('loading' in HTMLImageElement.prototype) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    observer.unobserve(lazyImage);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            lazyImageObserver.observe(img);
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Show notification function
    function showNotification(message, type = 'info') {
        // Remove any existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification elements
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const notificationContent = document.createElement('div');
        notificationContent.className = 'notification-content';
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', function() {
            notification.remove();
        });
        
        notificationContent.appendChild(messageSpan);
        notificationContent.appendChild(closeButton);
        notification.appendChild(notificationContent);
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Counter animation for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const valueText = target.textContent;
                    let value;
                    
                    // Handle values with + sign
                    if (valueText.includes('+')) {
                        value = parseInt(valueText.replace('+', ''), 10);
                        animateValue(target, 0, value, 2000, true);
                    } else {
                        value = parseInt(valueText, 10);
                        animateValue(target, 0, value, 2000, false);
                    }
                    
                    observer.unobserve(target);
                }
            });
        }, observerOptions);
        
        statNumbers.forEach(number => {
            observer.observe(number);
        });
    }
    
    // Animate value function for counters
    function animateValue(obj, start, end, duration, hasPlus) {
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            
            obj.textContent = hasPlus ? currentValue + '+' : currentValue;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    // Dropdown menu hover effect for desktop
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    if (window.innerWidth >= 992) {
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', function() {
                this.querySelector('.dropdown-menu').classList.add('show');
            });
            
            dropdown.addEventListener('mouseleave', function() {
                this.querySelector('.dropdown-menu').classList.remove('show');
            });
        });
    }
    
    // Event filtering and sorting
    const eventContainer = document.querySelector('#events .row');
    if (eventContainer) {
        // Tìm kiếm sự kiện
        const searchInput = document.createElement('div');
        searchInput.className = 'col-12 mb-4';
        searchInput.innerHTML = `
            <div class="input-group">
                <input type="text" class="form-control" id="eventSearchInput" placeholder="Tìm kiếm sự kiện...">
                <button class="btn btn-primary" type="button" id="searchButton">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;
        
        eventContainer.parentNode.insertBefore(searchInput, eventContainer);
        
        const searchField = document.getElementById('eventSearchInput');
        if (searchField) {
            searchField.addEventListener('input', function() {
                filterEvents(this.value.toLowerCase());
            });
            
            document.getElementById('searchButton').addEventListener('click', function() {
                filterEvents(searchField.value.toLowerCase());
            });
        }
    }
    
    // Filter events function
    function filterEvents(searchTerm) {
        const events = document.querySelectorAll('.event-card');
        let hasVisibleEvents = false;
        
        events.forEach(event => {
            const title = event.querySelector('.event-title').textContent.toLowerCase();
            const description = event.querySelector('.event-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                event.closest('.col-lg-4').style.display = '';
                hasVisibleEvents = true;
            } else {
                event.closest('.col-lg-4').style.display = 'none';
            }
        });
        
        // Show/hide empty state based on search results
        const noEvents = document.querySelector('.no-events');
        const upcomingEvents = document.querySelector('.upcoming-events');
        
        if (!hasVisibleEvents) {
            noEvents.classList.remove('d-none');
            upcomingEvents.classList.add('d-none');
        } else {
            noEvents.classList.add('d-none');
            upcomingEvents.classList.remove('d-none');
        }
    }
    
    // Thêm phần particles-js vào hero banner nếu không tồn tại
    const heroSection = document.querySelector('.hero-banner');
    if (heroSection && !document.getElementById('particles-js')) {
        const particlesDiv = document.createElement('div');
        particlesDiv.id = 'particles-js';
        heroSection.prepend(particlesDiv);
    }

    // Hiệu ứng hiển thị/ẩn mật khẩu
    const passwordToggle = document.querySelector('#show_hide_password a');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const passwordInput = document.querySelector('#inputChoosePassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'text') {
                passwordInput.type = 'password';
                icon.classList.add('bx-hide');
                icon.classList.remove('bx-show');
            } else if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('bx-hide');
                icon.classList.add('bx-show');
            }
        });
    }
    
    // Thêm class cho input-group để có hiệu ứng animation
    const inputGroups = document.querySelectorAll('.input-group');
    inputGroups.forEach(group => {
        group.classList.add('input-group-animated');
    });
    
    // Thêm class cho các nút để có hiệu ứng animation
    const buttons = document.querySelectorAll('.btn-primary, .btn-danger');
    buttons.forEach(button => {
        button.classList.add('btn-animated');
        
        // Hiệu ứng ripple khi click nút
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.className = 'ripple-effect';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Hiệu ứng animation cho icon trong nút
        button.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.add('animate__animated', 'animate__heartBeat');
            }
        });
        
        button.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.remove('animate__animated', 'animate__heartBeat');
            }
        });
    });
    
    // Thêm hiệu ứng pulse cho logo
    const logos = document.querySelectorAll('.school-logo, .mobile-logo');
    logos.forEach(logo => {
        logo.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.5s';
            this.style.transform = 'scale(1.05)';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.animation = '';
            this.style.transform = 'scale(1)';
        });
    });
});
