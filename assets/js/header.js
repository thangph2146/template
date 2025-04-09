/**
 * Header JavaScript functionality
 */
document.addEventListener("DOMContentLoaded", function() {
    console.log("Header JavaScript loaded");
    
    // Xử lý dropdown menu trong header
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Thêm sự kiện hover cho desktop
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
    
    // Highlight active menu item based on current page
    highlightActiveMenuItem();
});

/**
 * Highlight active menu item based on current URL
 */
function highlightActiveMenuItem() {
    const currentUrl = window.location.href;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        if (link.href === currentUrl || currentUrl.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
} 