/**
 * Footer JavaScript functionality
 */
document.addEventListener("DOMContentLoaded", function() {
    console.log("Footer JavaScript loaded");
    
    // Xử lý nút back to top
    initBackToTopButton();
});

/**
 * Initialize back to top button functionality
 */
function initBackToTopButton() {
    const backToTop = document.querySelector(".back-to-top");
    
    if (!backToTop) return;
    
    // Show/hide back to top button based on scroll position
    window.addEventListener("scroll", function() {
        if (window.scrollY > 300) {
            backToTop.classList.add("active");
        } else {
            backToTop.classList.remove("active");
        }
    });
    
    // Scroll to top when button clicked
    backToTop.addEventListener("click", function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
} 