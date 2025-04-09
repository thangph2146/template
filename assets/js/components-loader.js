/**
 * Components Loader
 * 
 * This script loads header and footer components into the page.
 */
document.addEventListener("DOMContentLoaded", function() {
    console.log("Components loader initialized");
    
    // Load header
    loadComponent('header-container', 'assets/components/header.html', function() {
        // After header is loaded, initialize its functionality
        if (typeof highlightActiveMenuItem === 'function') {
            highlightActiveMenuItem();
        }
    });
    
    // Load footer
    loadComponent('footer-container', 'assets/components/footer.html', function() {
        // After footer is loaded, initialize its functionality
        if (typeof initBackToTopButton === 'function') {
            initBackToTopButton();
        }
    });
});

/**
 * Load a component into a container
 * 
 * @param {string} containerId - ID of the container to load the component into
 * @param {string} componentUrl - URL of the component HTML file
 * @param {Function} callback - Function to call after loading (optional)
 */
function loadComponent(containerId, componentUrl, callback) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }
    
    fetch(componentUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            if (typeof callback === 'function') {
                callback();
            }
        })
        .catch(error => {
            console.error(`Error loading component ${componentUrl}:`, error);
            container.innerHTML = `<div class="alert alert-danger">Error loading component. Please try refreshing the page.</div>`;
        });
} 