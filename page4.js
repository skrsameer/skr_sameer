document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const togglePassword = document.getElementById('togglePassword');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeModal = document.querySelector('.close-modal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    // Check if remember me was checked
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (rememberMe) {
        document.getElementById('rememberMe').checked = true;
        document.getElementById('loginUsername').value = localStorage.getItem('rememberedUsername') || '';
    }

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('loginPassword');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            this.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Store remember me preference
        localStorage.setItem('rememberMe', rememberMe);
        if (rememberMe) {
            localStorage.setItem('rememberedUsername', username);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
        
        // Validate inputs
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find matching user (check both username and phone)
        const user = users.find(u => 
            (u.username === username || u.phone === username) && 
            atob(u.password) === password
        );
        
        if (user) {
            // Check if account is verified
            if (!user.isVerified) {
                showError('Account not verified. Please complete verification first.');
                return;
            }
            
            // Create session
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                phone: user.phone,
                name: user.name,
                isLoggedIn: true,
                balance: user.balance || 0
            }));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            showError('Invalid username/phone or password');
        }
    });

    // Forgot password functionality
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        forgotPasswordModal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    });

    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phone = document.getElementById('resetPhone').value.trim();
        
        // Validate phone
        if (!/^[6-9]\d{9}$/.test(phone)) {
            alert('Please enter a valid 10-digit Indian phone number');
            return;
        }
        
        // Check if phone exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(u => u.phone === phone);
        
        if (!userExists) {
            alert('No account found with this phone number');
            return;
        }
        
        // In production: Send OTP to phone
        alert(`OTP would be sent to +91${phone} in production`);
        forgotPasswordModal.style.display = 'none';
    });

    // Helper function to show error
    function showError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 400);
    }

    // Make labels work properly for pre-filled inputs
    document.querySelectorAll('.form-group input').forEach(input => {
        // Check on page load
        if (input.value.trim() !== '') {
            input.nextElementSibling.style.transform = 'translateY(-22px) scale(0.9)';
            input.nextElementSibling.style.color = 'var(--primary-color)';
            input.nextElementSibling.style.fontWeight = '500';
            input.nextElementSibling.style.left = '40px';
        }
        
        // Check on input
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.nextElementSibling.style.transform = 'translateY(-22px) scale(0.9)';
                this.nextElementSibling.style.color = 'var(--primary-color)';
                this.nextElementSibling.style.fontWeight = '500';
                this.nextElementSibling.style.left = '40px';
            } else {
                this.nextElementSibling.style.transform = '';
                this.nextElementSibling.style.color = '';
                this.nextElementSibling.style.fontWeight = '';
                this.nextElementSibling.style.left = '40px';
            }
        });
    });
});