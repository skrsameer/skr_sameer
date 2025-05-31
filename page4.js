document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const togglePassword = document.getElementById('togglePassword');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const closeModals = document.querySelectorAll('.close-modal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetPhoneInput = document.getElementById('resetPhone');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    // Variables
    let resetUser = null;
    const mockOtp = '123456'; // For demo purposes only

    // Initialize form labels and remember me
    function init() {
        // Check for remembered username
        if (localStorage.getItem('rememberMe') === 'true') {
            const rememberedUsername = localStorage.getItem('rememberedUsername');
            if (rememberedUsername) {
                document.getElementById('loginUsername').value = rememberedUsername;
                document.getElementById('rememberMe').checked = true;
            }
        }

        // Initialize all input labels
        document.querySelectorAll('.form-group input').forEach(input => {
            const label = input.nextElementSibling;
            if (input.value.trim() !== '') {
                updateLabelPosition(label, true);
            }
            
            input.addEventListener('input', function() {
                updateLabelPosition(label, this.value.trim() !== '');
            });
        });
    }

    function updateLabelPosition(label, hasValue) {
        if (hasValue) {
            label.style.transform = 'translateY(-22px) scale(0.9)';
            label.style.color = 'var(--primary-color)';
            label.style.fontWeight = '500';
            label.style.left = '15px';
            label.style.background = 'white';
        } else {
            label.style.transform = '';
            label.style.color = '';
            label.style.fontWeight = '';
            label.style.left = '40px';
            label.style.background = 'transparent';
        }
    }

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('loginPassword');
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        this.classList.toggle('fa-eye-slash', isPassword);
        this.classList.toggle('fa-eye', !isPassword);
    });

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        loginError.textContent = '';
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate inputs
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find matching user by username OR phone
        const user = users.find(u => 
            (u.username === username || u.phone === username) && 
            u.password === btoa(password) // Compare with base64 encoded password
        );
        
        if (user) {
            // Store remember me preference
            localStorage.setItem('rememberMe', rememberMe);
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
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
            window.location.href = 'page7.html';
        } else {
            showError('Invalid username/phone or password');
        }
    });

    // Forgot password modal
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'block';
    });

    // Close modals
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            forgotPasswordModal.style.display = 'none';
            resetPasswordModal.style.display = 'none';
        });
    });

    // Window click to close modals
    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
        if (e.target === resetPasswordModal) {
            resetPasswordModal.style.display = 'none';
        }
    });

    // Forgot password form submission
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phone = resetPhoneInput.value.trim();
        
        if (!/^[6-9]\d{9}$/.test(phone)) {
            alert('Please enter a valid 10-digit Indian phone number');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        resetUser = users.find(u => u.phone === phone);
        
        if (resetUser) {
            // In production, send OTP here
            alert(`OTP would be sent to +91${phone} in production`);
            forgotPasswordModal.style.display = 'none';
            resetPasswordModal.style.display = 'block';
        } else {
            alert('No account found with this phone number');
        }
    });

    // Reset password form submission
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmNewPasswordInput.value;
        
        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Update password in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.phone === resetUser.phone);
        
        if (userIndex !== -1) {
            users[userIndex].password = btoa(newPassword);
            localStorage.setItem('users', JSON.stringify(users));
            alert('Password updated successfully!');
            resetPasswordModal.style.display = 'none';
        } else {
            alert('Error updating password');
        }
    });

    function showError(message) {
        loginError.textContent = message;
        loginError.classList.add('animate__animated', 'animate__headShake');
        setTimeout(() => {
            loginError.classList.remove('animate__animated', 'animate__headShake');
        }, 1000);
    }

    // Initialize the application
    init();
});