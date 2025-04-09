/**
 * Date formatting utility functions
 */

/**
 * Format date to DD/MM/YYYY
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Format time to HH:MM
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date and time to DD/MM/YYYY HH:MM
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date and time string
 */
function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Get relative time (e.g., "2 hours ago", "yesterday", etc.)
 * @param {Date|string} date - Date object or string to calculate relative time from
 * @returns {string} Relative time string
 */
function getRelativeTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Vừa xong';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return diffInDays === 1 ? 'Hôm qua' : `${diffInDays} ngày trước`;
    }
    
    return formatDate(date);
} 