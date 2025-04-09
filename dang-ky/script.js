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

    // Hiệu ứng ripple cho nút
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.className = 'ripple-effect';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Hiệu ứng cho input groups
    document.querySelectorAll('.input-group').forEach(group => {
        group.classList.add('input-group-animated');
    });

    // Hiệu ứng cho logo
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

    // Toggle hiển thị mật khẩu
    const passwordToggles = document.querySelectorAll('#show_hide_password a, #show_hide_confirm_password a');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const input = this.closest('.input-group').querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'text') {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Kiểm tra độ mạnh mật khẩu
    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength++;
        if (password.match(/([0-9])/)) strength++;
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength++;
        return strength;
    }

    // Thêm thanh hiển thị độ mạnh mật khẩu
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        const strengthBar = document.createElement('div');
        strengthBar.className = 'password-strength d-none';
        passwordInput.parentNode.insertAdjacentElement('afterend', strengthBar);

        passwordInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            strengthBar.className = 'password-strength';
            
            if (this.value === '') {
                strengthBar.classList.add('d-none');
            } else {
                strengthBar.classList.remove('d-none');
                strengthBar.className = `password-strength password-strength-${strength <= 2 ? 'weak' : strength === 3 ? 'medium' : 'strong'}`;
            }
        });
    }

    // Kiểm tra xác nhận mật khẩu
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            if (this.value === '') {
                this.classList.remove('is-valid', 'is-invalid');
            } else if (this.value === password) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    }

    // Kiểm tra email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value === '') {
                this.classList.remove('is-valid', 'is-invalid');
            } else if (emailRegex.test(this.value)) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    }

    // Kiểm tra mã số sinh viên
    const studentIdInput = document.getElementById('studentId');
    if (studentIdInput) {
        studentIdInput.addEventListener('input', function() {
            const studentIdRegex = /^\d{10}$/;
            if (this.value === '') {
                this.classList.remove('is-valid', 'is-invalid');
            } else if (studentIdRegex.test(this.value)) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    }

    // Xử lý form submit
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            
            // Kiểm tra các trường bắt buộc
            const requiredFields = ['firstName', 'lastName', 'studentId', 'email', 'password', 'confirmPassword'];
            requiredFields.forEach(field => {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                }
            });
            
            // Kiểm tra mật khẩu khớp
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password !== confirmPassword) {
                document.getElementById('confirmPassword').classList.add('is-invalid');
                isValid = false;
            }
            
            // Kiểm tra đồng ý điều khoản
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox.checked) {
                termsCheckbox.classList.add('is-invalid');
                isValid = false;
            }
            
            if (isValid) {
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Đang xử lý...';
                submitBtn.disabled = true;
                
                // Giả lập gửi form
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Đăng ký thành công!';
                    submitBtn.classList.remove('btn-primary');
                    submitBtn.classList.add('btn-success');
                    
                    setTimeout(() => {
                        window.location.href = 'dang-nhap.html';
                    }, 1000);
                }, 2000);
            }
        });
    }
}); 