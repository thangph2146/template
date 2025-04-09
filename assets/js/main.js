/**
 * Main JavaScript - Hệ thống Quản lý Sự kiện HUB
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các component UI
    initPreloader();
    initNavbar();
    initBackToTop();
    initTooltips();
    handleImageErrors();

    // Khởi tạo animation nếu thư viện AOS được load
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 50,
            delay: 50,
            mirror: false
        });
    }
});

/**
 * Preloader - hiển thị khi trang đang tải
 */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', function() {
        preloader.classList.add('loaded');
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 500);
    });
}

/**
 * Navbar - xử lý hiệu ứng sticky navbar khi cuộn
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const stickyOffset = navbar.offsetTop + 50;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > stickyOffset) {
            navbar.classList.add('navbar-sticky-top');
        } else {
            navbar.classList.remove('navbar-sticky-top');
        }
    });
    
    // Tự động đóng navbar collapse khi click vào link (trên mobile)
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navLinks && navbarCollapse) {
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 992) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    bsCollapse.hide();
                }
            });
        });
    }
}

/**
 * Nút Back to Top - hiển thị khi cuộn xuống và nhấn để lên đầu trang
 */
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Khởi tạo tooltips của Bootstrap
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Xử lý lỗi hình ảnh không load được
 */
function handleImageErrors() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://hub.edu.vn/wp-content/uploads/2023/11/placeholder.png';
            this.alt = 'Hình ảnh không tải được';
        });
    });
}

/**
 * Hiển thị thông báo dạng toast
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo (success, error, info)
 * @param {number} duration - Thời gian hiển thị (ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notificationContainer = document.querySelector('.notification-container');
    
    // Tạo container nếu chưa tồn tại
    if (!notificationContainer) {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button type="button" class="notification-close">&times;</button>
        </div>
    `;
    
    document.querySelector('.notification-container').appendChild(notification);
    
    // Hiển thị thông báo với animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Đóng thông báo khi click vào nút đóng
    notification.querySelector('.notification-close').addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Tự động đóng sau thời gian duration
    setTimeout(() => {
        closeNotification(notification);
    }, duration);
}

/**
 * Đóng thông báo
 * @param {Element} notification - Element thông báo cần đóng
 */
function closeNotification(notification) {
    notification.classList.remove('show');
    
    // Xóa khỏi DOM sau khi animation kết thúc
    setTimeout(() => {
        notification.remove();
    }, 300);
}

/**
 * Format date string thành định dạng ngày/tháng/năm
 * @param {string} dateString - Chuỗi date cần format
 * @returns {string} - Chuỗi đã format
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Format date string thành định dạng giờ:phút
 * @param {string} dateString - Chuỗi date cần format
 * @returns {string} - Chuỗi đã format
 */
function formatTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date string thành định dạng ngày/tháng/năm giờ:phút
 * @param {string} dateString - Chuỗi date cần format
 * @returns {string} - Chuỗi đã format
 */
function formatDateTime(dateString) {
    if (!dateString) return '';
    
    return formatDate(dateString) + ' ' + formatTime(dateString);
}

/**
 * Format số thành định dạng có dấu phân cách hàng nghìn
 * @param {number} number - Số cần format
 * @returns {string} - Chuỗi đã format
 */
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Tính số ngày còn lại giữa hai ngày
 * @param {string} endDateString - Ngày kết thúc
 * @returns {number} - Số ngày còn lại
 */
function getDaysRemaining(endDateString) {
    const endDate = new Date(endDateString);
    const today = new Date();
    
    // Reset thời gian về 00:00:00 để so sánh chỉ theo ngày
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

/**
 * Kiểm tra email có hợp lệ không
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean} - True nếu email hợp lệ
 */
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

/**
 * Kiểm tra số điện thoại có hợp lệ không (Việt Nam)
 * @param {string} phone - Số điện thoại cần kiểm tra
 * @returns {boolean} - True nếu số điện thoại hợp lệ
 */
function isValidPhone(phone) {
    const regex = /^(0|\+84)(\s|\.)?[0-9]{9,10}$/;
    return regex.test(phone);
} 