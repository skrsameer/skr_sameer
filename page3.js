document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('registrationForm');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const phoneInput = document.getElementById('phone');
    const otpInput = document.getElementById('otp');
    const otpGroup = document.getElementById('otpGroup');
    const otpError = document.getElementById('otpError');
    const phoneError = document.getElementById('phoneError');
    const passwordError = document.getElementById('passwordError');
    const continueBtn = document.getElementById('continueBtn');
    const otpTimer = document.getElementById('otpTimer');
    const termsLink = document.getElementById('termsLink');
    const modal = document.getElementById('termsModal');
    const closeModal = document.querySelector('.close-modal');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Variables
    let generatedOtp = '';
    let otpExpiryTime = 0;
    let otpTimerInterval;
    let isPhoneVerified = false;

    // Check if phone number is already registered
    function isPhoneRegistered(phone) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.some(user => user.phone === phone);
    }

    // Generate 6-digit OTP
    function generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Simulate sending OTP via SMS
    function sendOtpToPhone(phone, otp) {
        // In production, replace with actual SMS API call
        console.log(`OTP sent to +91${phone}: Dear Customer, your SKR OTP is ${otp}, it valid for 5 minutes only.`);
        
        // Store OTP and expiry time (5 minutes from now)
        generatedOtp = otp;
        otpExpiryTime = Date.now() + 5 * 60 * 1000;
        
        // Show OTP field and start timer
        otpGroup.style.display = 'block';
        startOtpTimer();
        
        // Update button text
        document.getElementById('btnText').textContent = 'Resend OTP';
    }

    // Start OTP countdown timer
    function startOtpTimer() {
        clearInterval(otpTimerInterval);
        
        function updateTimer() {
            const now = Date.now();
            const remaining = otpExpiryTime - now;
            
            if (remaining <= 0) {
                otpTimer.textContent = 'OTP expired. Please request a new one.';
                generatedOtp = '';
                clearInterval(otpTimerInterval);
                return;
            }
            
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            otpTimer.textContent = `OTP expires in ${mins}:${secs.toString().padStart(2, '0')}`;
        }
        
        updateTimer();
        otpTimerInterval = setInterval(updateTimer, 1000);
    }

    // Validate OTP
    function validateOtp(otp) {
        if (Date.now() > otpExpiryTime) {
            showError(otpError, 'OTP has expired. Please request a new one.');
            return false;
        }
        
        if (otp !== generatedOtp) {
            showError(otpError, 'Invalid OTP. Please try again.');
            return false;
        }
        
        hideError(otpError);
        isPhoneVerified = true;
        return true;
    }

    // Validate password
    function validatePassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (password.length < 8) {
            showError(passwordError, 'Password must be at least 8 characters');
            return false;
        }
        
        if (password !== confirmPassword) {
            showError(passwordError, 'Passwords do not match');
            return false;
        }
        
        hideError(passwordError);
        return true;
    }

    // Validate phone number
    function validatePhoneNumber(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            showError(phoneError, 'Please enter a valid 10-digit Indian number');
            return false;
        }
        
        if (isPhoneRegistered(phone)) {
            showError(phoneError, 'This number is already registered');
            return false;
        }
        
        hideError(phoneError);
        return true;
    }

    // Show error message
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        element.parentElement.classList.add('shake');
        setTimeout(() => {
            element.parentElement.classList.remove('shake');
        }, 400);
    }

    // Hide error message
    function hideError(element) {
        element.style.display = 'none';
    }

    // Toggle password visibility
    function togglePasswordVisibility(input, icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    // Event Listeners
    sendOtpBtn.addEventListener('click', function() {
        const phone = phoneInput.value.trim();
        
        if (!validatePhoneNumber(phone)) return;
        
        const otp = generateOtp();
        sendOtpToPhone(phone, otp);
    });

    otpInput.addEventListener('input', function() {
        const otp = this.value.trim();
        
        if (otp.length === 6) {
            if (validateOtp(otp)) {
                continueBtn.disabled = false;
            }
        } else {
            continueBtn.disabled = true;
        }
    });

    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validatePassword);

    togglePassword.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, this);
    });

    toggleConfirmPassword.addEventListener('click', function() {
        togglePasswordVisibility(confirmPasswordInput, this);
    });

    termsLink.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const username = document.getElementById('username').value.trim();
        const name = document.getElementById('name').value.trim();
        const phone = phoneInput.value.trim();
        const otp = otpInput.value.trim();
        const password = passwordInput.value;
        const termsChecked = document.getElementById('terms').checked;
        
        if (!username || !name || !phone || !otp || !password || !termsChecked) {
            alert('Please fill all required fields');
            return;
        }
        
        if (!isPhoneVerified) {
            showError(otpError, 'Please verify your phone number with OTP');
            return;
        }
        
        if (!validatePassword()) return;
        
        // Create user object
        const user = {
            username,
            name,
            phone,
            password: btoa(password), // Simple encoding (use proper hashing in production)
            isVerified: false,
            balance: 0,
            joinedDate: new Date().toISOString(),
            referralCode: `SKR${Math.floor(1000 + Math.random() * 9000)}${username.slice(0, 3).toUpperCase()}`
        };
        
        // Save user to localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Save current user session
        sessionStorage.setItem('currentUser', JSON.stringify({
            username,
            phone,
            isLoggedIn: true
        }));
        
        // Notify admin (simulated)
        notifyAdminNewUser(user);
        
        // Redirect to verification page
        window.location.href = 'verification.html';
    });

    // Simulate admin notification
    function notifyAdminNewUser(user) {
        console.log('New user registered:', user);
        // In production: Send to backend/admin panel
        // fetch('/api/notify-admin', { method: 'POST', body: JSON.stringify(user) });
    }
});