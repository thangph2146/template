/**
 * Form validation utility functions
 */

/**
 * Validate an input field
 * @param {HTMLElement} input - The input element to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing feedback
    const existingFeedback = input.nextElementSibling;
    if (existingFeedback && existingFeedback.classList.contains('invalid-feedback')) {
        existingFeedback.remove();
    }
    
    // Required field validation
    if (input.hasAttribute('required') && value === '') {
        isValid = false;
        errorMessage = 'Trường này không được để trống';
    }
    
    // Email validation
    else if (input.type === 'email' && value !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Email không hợp lệ';
        }
    }
    
    // Phone number validation
    else if (input.id === 'phone' || input.type === 'tel') {
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
        if (value !== '' && !phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)';
        }
    }
    
    // Password validation
    else if (input.type === 'password' && input.id === 'password') {
        if (value.length < 8) {
            isValid = false;
            errorMessage = 'Mật khẩu phải có ít nhất 8 ký tự';
        }
    }
    
    // Password confirmation validation
    else if (input.id === 'confirm-password') {
        const password = document.getElementById('password');
        if (password && value !== password.value) {
            isValid = false;
            errorMessage = 'Mật khẩu không khớp';
        }
    }
    
    // Display validation result
    if (!isValid) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = errorMessage;
        
        // Add after input
        input.parentNode.insertBefore(feedback, input.nextSibling);
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }
    
    return isValid;
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} True if form is valid, false otherwise
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
        // Skip elements without validation (like buttons, hidden inputs)
        if (input.type === 'submit' || input.type === 'button' || input.type === 'hidden') {
            return;
        }
        
        // Validate required inputs, or inputs with values
        if (input.hasAttribute('required') || input.value.trim() !== '') {
            if (!validateInput(input)) {
                isValid = false;
            }
        }
    });
    
    return isValid;
}

/**
 * Generate a random confirmation code
 * @param {string} prefix - Prefix to add to the code (default: 'XN')
 * @returns {string} Random code
 */
function generateRandomCode(prefix = 'XN') {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return prefix + randomNum;
}

/**
 * Setup form validation for a form
 * @param {string} formId - ID of the form to setup validation for
 */
function setupFormValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Add blur validation to inputs
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // Clear validation when input changes
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            this.classList.remove('is-valid');
            const feedback = this.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.remove();
            }
        });
    });
    
    // Add submit validation
    form.addEventListener('submit', function(e) {
        if (!validateForm(this)) {
            e.preventDefault();
        }
    });
} 