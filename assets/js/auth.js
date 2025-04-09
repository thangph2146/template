/**
 * JavaScript xử lý trang đăng nhập và đăng ký - Đại Học Ngân Hàng TP.HCM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các component
    initPasswordToggle();
    initParticlesEffect();
    initLoginForm();
    initRegisterForm();
    
    /**
     * Khởi tạo chức năng hiển thị/ẩn mật khẩu
     */
    function initPasswordToggle() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const input = this.closest('.input-group').querySelector('input');
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }
    
    /**
     * Khởi tạo hiệu ứng particles
     */
    function initParticlesEffect() {
        const particlesContainer = document.getElementById('particles-js');
        
        if (!particlesContainer || typeof particlesJS === 'undefined') return;
        
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#ffffff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
    
    /**
     * Khởi tạo xử lý form đăng nhập
     */
    function initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Lấy giá trị input
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe')?.checked;
            
            // Validate
            let isValid = true;
            
            if (!email) {
                showInputError('loginEmail', 'Vui lòng nhập email');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showInputError('loginEmail', 'Email không hợp lệ');
                isValid = false;
            } else {
                hideInputError('loginEmail');
            }
            
            if (!password) {
                showInputError('loginPassword', 'Vui lòng nhập mật khẩu');
                isValid = false;
            } else {
                hideInputError('loginPassword');
            }
            
            if (!isValid) return;
            
            // Hiển thị loading
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang đăng nhập...';
                
                // Giả lập đăng nhập
                setTimeout(() => {
                    // Giả lập đăng nhập thành công
                    // Trong ứng dụng thực tế, đây sẽ là một API call
                    
                    // Redirect sau khi đăng nhập thành công
                    window.location.href = 'trang-chu.html';
                    
                    // Khôi phục trạng thái nút submit
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 1500);
            }
        });
    }
    
    /**
     * Khởi tạo xử lý form đăng ký
     */
    function initRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        
        if (!registerForm) return;
        
        // Xử lý các bước đăng ký
        const registerSteps = document.querySelectorAll('.auth-form-step');
        const stepButtons = {
            next: document.querySelectorAll('.step-next'),
            prev: document.querySelectorAll('.step-prev'),
            submit: document.querySelector('.step-submit')
        };
        
        let currentStep = 0;
        
        // Hiển thị bước hiện tại
        function showStep(stepIndex) {
            registerSteps.forEach((step, index) => {
                step.classList.toggle('active', index === stepIndex);
            });
            
            // Cập nhật UI steps
            updateStepsUI(stepIndex);
        }
        
        // Cập nhật giao diện các bước
        function updateStepsUI(currentStepIndex) {
            const stepIndicators = document.querySelectorAll('.auth-step');
            
            stepIndicators.forEach((step, index) => {
                if (index < currentStepIndex) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else if (index === currentStepIndex) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
        }
        
        // Validate từng bước
        function validateStep(stepIndex) {
            switch (stepIndex) {
                case 0:
                    return validatePersonalInfo();
                case 1:
                    return validateAccountInfo();
                case 2:
                    return validateAdditionalInfo();
                default:
                    return true;
            }
        }
        
        // Validate thông tin cá nhân
        function validatePersonalInfo() {
            let isValid = true;
            
            const fullName = document.getElementById('registerFullName').value.trim();
            const phone = document.getElementById('registerPhone').value.trim();
            
            if (!fullName) {
                showInputError('registerFullName', 'Vui lòng nhập họ tên');
                isValid = false;
            } else if (fullName.length < 3) {
                showInputError('registerFullName', 'Họ tên phải có ít nhất 3 ký tự');
                isValid = false;
            } else {
                hideInputError('registerFullName');
            }
            
            if (!phone) {
                showInputError('registerPhone', 'Vui lòng nhập số điện thoại');
                isValid = false;
            } else if (!isValidPhone(phone)) {
                showInputError('registerPhone', 'Số điện thoại không hợp lệ');
                isValid = false;
            } else {
                hideInputError('registerPhone');
            }
            
            return isValid;
        }
        
        // Validate thông tin tài khoản
        function validateAccountInfo() {
            let isValid = true;
            
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!email) {
                showInputError('registerEmail', 'Vui lòng nhập email');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showInputError('registerEmail', 'Email không hợp lệ');
                isValid = false;
            } else {
                hideInputError('registerEmail');
            }
            
            if (!password) {
                showInputError('registerPassword', 'Vui lòng nhập mật khẩu');
                isValid = false;
            } else if (password.length < 6) {
                showInputError('registerPassword', 'Mật khẩu phải có ít nhất 6 ký tự');
                isValid = false;
            } else {
                hideInputError('registerPassword');
            }
            
            if (!confirmPassword) {
                showInputError('confirmPassword', 'Vui lòng xác nhận mật khẩu');
                isValid = false;
            } else if (confirmPassword !== password) {
                showInputError('confirmPassword', 'Xác nhận mật khẩu không khớp');
                isValid = false;
            } else {
                hideInputError('confirmPassword');
            }
            
            return isValid;
        }
        
        // Validate thông tin bổ sung
        function validateAdditionalInfo() {
            let isValid = true;
            
            const userType = document.querySelector('input[name="userType"]:checked');
            const termsAgree = document.getElementById('termsAgree')?.checked;
            
            if (!userType) {
                showInputError('userTypeGroup', 'Vui lòng chọn loại người dùng');
                isValid = false;
            } else {
                hideInputError('userTypeGroup');
            }
            
            if (!termsAgree) {
                showInputError('termsAgreeGroup', 'Bạn phải đồng ý với điều khoản sử dụng');
                isValid = false;
            } else {
                hideInputError('termsAgreeGroup');
            }
            
            return isValid;
        }
        
        // Nút Next
        stepButtons.next.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (validateStep(currentStep)) {
                    currentStep++;
                    showStep(currentStep);
                }
            });
        });
        
        // Nút Previous
        stepButtons.prev.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                currentStep--;
                showStep(currentStep);
            });
        });
        
        // Nút Submit
        if (stepButtons.submit) {
            stepButtons.submit.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (validateStep(currentStep)) {
                    // Hiển thị loading
                    const submitBtn = stepButtons.submit;
                    submitBtn.disabled = true;
                    const originalText = submitBtn.textContent;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...';
                    
                    // Giả lập đăng ký
                    setTimeout(() => {
                        // Chuyển sang trang xác nhận đăng ký
                        window.location.href = 'dang-ky-thanh-cong.html';
                        
                        // Khôi phục trạng thái nút submit
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }, 1500);
                }
            });
        }
        
        // Hiển thị bước đầu tiên
        showStep(currentStep);
    }
    
    /**
     * Hiển thị lỗi cho input
     * @param {string} inputId - ID của input
     * @param {string} message - Thông báo lỗi
     */
    function showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        const feedbackElement = document.querySelector(`#${inputId} + .invalid-feedback`) || 
                                document.querySelector(`.invalid-feedback[data-for="${inputId}"]`);
        
        if (input) {
            input.classList.add('is-invalid');
        }
        
        if (feedbackElement) {
            feedbackElement.textContent = message;
        } else {
            // Tạo feedback element nếu chưa có
            const newFeedback = document.createElement('div');
            newFeedback.className = 'invalid-feedback';
            newFeedback.textContent = message;
            
            if (input) {
                input.parentNode.appendChild(newFeedback);
            }
        }
    }
    
    /**
     * Ẩn lỗi cho input
     * @param {string} inputId - ID của input
     */
    function hideInputError(inputId) {
        const input = document.getElementById(inputId);
        
        if (input) {
            input.classList.remove('is-invalid');
        }
    }
}); 