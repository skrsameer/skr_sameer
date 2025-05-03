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
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthText = document.querySelector('.strength-text');
    const recaptchaContainer = document.getElementById('recaptcha-container');

    // Variables
    let confirmationResult;
    let otpExpiryTime = 0;
    let otpTimerInterval;
    let recaptchaVerifier;
    let isPhoneVerified = false;
    let isOtpSent = false;

    // Initialize
    function init() {
        continueBtn.disabled = true;
        otpGroup.style.display = 'none';
        recaptchaContainer.style.display = 'none';
        initializeRecaptcha();
    }

    // Initialize reCAPTCHA
    function initializeRecaptcha() {
        if (!firebase.auth) {
            console.error('Firebase Auth not loaded');
            return;
        }
        
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow sending OTP
                sendOtp();
            },
            'expired-callback': () => {
                // reCAPTCHA expired
                console.log('reCAPTCHA expired');
                sendOtpBtn.disabled = false;
                document.getElementById('btnText').textContent = 'Send OTP';
            }
        });
    }

    // Check if phone is registered
    function isPhoneRegistered(phone) {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            return users.some(user => user.phone === phone);
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            return false;
        }
    }

    // Start OTP Timer
    function startOtpTimer() {
        clearInterval(otpTimerInterval);
        otpExpiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes

        function updateTimer() {
            const now = Date.now();
            const remaining = otpExpiryTime - now;

            if (remaining <= 0) {
                otpTimer.textContent = 'OTP expired. Please request a new one.';
                clearInterval(otpTimerInterval);
                isOtpSent = false;
                return;
            }

            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            otpTimer.textContent = `OTP expires in ${mins}:${secs.toString().padStart(2, '0')}`;
        }

        updateTimer();
        otpTimerInterval = setInterval(updateTimer, 1000);
        isOtpSent = true;
    }

    // Validate Phone Number
    function validatePhoneNumber(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phone) {
            showError(phoneError, 'Mobile number is required');
            return false;
        }

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

    // Validate Username
    function validateUsername(username) {
        const usernameError = document.getElementById('usernameError');
        const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;

        if (!username) {
            showError(usernameError, 'Username is required');
            return false;
        }

        if (!usernameRegex.test(username)) {
            showError(usernameError, 'Username must be 4-20 characters (letters, numbers, underscore)');
            return false;
        }

        // Check if username already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.username === username)) {
            showError(usernameError, 'Username already taken');
            return false;
        }

        hideError(usernameError);
        return true;
    }

    // Validate Password
    function validatePassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!password) {
            showError(passwordError, 'Password is required');
            return false;
        }

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

    // Check Password Strength
    function checkPasswordStrength(password) {
        let strength = 0;

        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;

        // Character variety checks
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Update UI
        if (password.length === 0) {
            strengthMeter.style.width = '0%';
            strengthText.textContent = '';
        } else if (strength <= 2) {
            strengthMeter.style.width = '33%';
            strengthMeter.style.backgroundColor = '#e74c3c';
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#e74c3c';
        } else if (strength <= 4) {
            strengthMeter.style.width = '66%';
            strengthMeter.style.backgroundColor = '#f39c12';
            strengthText.textContent = 'Medium';
            strengthText.style.color = '#f39c12';
        } else {
            strengthMeter.style.width = '100%';
            strengthMeter.style.backgroundColor = '#2ecc71';
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#2ecc71';
        }
    }

    // Show/Hide Error
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        element.parentElement.classList.add('shake');
        setTimeout(() => {
            element.parentElement.classList.remove('shake');
        }, 400);
    }

    function hideError(element) {
        element.style.display = 'none';
    }

    // Toggle Password Visibility
    function togglePasswordVisibility(input, icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    // Send OTP
    function sendOtp() {
        const phone = phoneInput.value.trim();

        if (!validatePhoneNumber(phone)) {
            recaptchaVerifier.reset();
            return;
        }

        sendOtpBtn.disabled = true;
        document.getElementById('btnText').textContent = 'Sending...';

        const formattedPhone = `+91${phone}`;

        auth.signInWithPhoneNumber(formattedPhone, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                otpGroup.style.display = 'block';
                startOtpTimer();
                isPhoneVerified = false;
                console.log('OTP sent successfully to ' + formattedPhone);
            })
            .catch((error) => {
                console.error('OTP Error:', error);
                let errorMessage = 'Failed to send OTP. Please try again.';

                if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many requests. Please try again later.';
                } else if (error.code === 'auth/invalid-phone-number') {
                    errorMessage = 'Invalid phone number format.';
                } else if (error.code === 'auth/quota-exceeded') {
                    errorMessage = 'OTP quota exceeded. Please try again later.';
                }

                showError(phoneError, errorMessage);
                recaptchaVerifier.reset();
            })
            .finally(() => {
                sendOtpBtn.disabled = false;
                document.getElementById('btnText').textContent = isOtpSent ? 'Resend OTP' : 'Send OTP';
            });
    }

    // Handle Send OTP Button Click
    sendOtpBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!recaptchaVerifier) {
            initializeRecaptcha();
        }

        // This will trigger the reCAPTCHA and then call sendOtp() when solved
        recaptchaVerifier.verify();
    });

    // Verify OTP
    otpInput.addEventListener('input', function() {
        if (this.value.length === 6) {
            continueBtn.disabled = false;
        } else {
            continueBtn.disabled = true;
        }
    });

    // Toggle Password
    togglePassword.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, togglePassword);
    });

    toggleConfirmPassword.addEventListener('click', () => {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
    });

    // Password Strength Check
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        validatePassword();
        updateContinueButtonState();
    });

    confirmPasswordInput.addEventListener('input', function() {
        validatePassword();
        updateContinueButtonState();
    });

    // Username Validation
    document.getElementById('username').addEventListener('input', function() {
        validateUsername(this.value.trim());
        updateContinueButtonState();
    });

    // Phone Validation
    phoneInput.addEventListener('input', function() {
        validatePhoneNumber(this.value.trim());
        updateContinueButtonState();
    });

    // Terms Checkbox
    document.getElementById('terms').addEventListener('change', updateContinueButtonState);

    // Form Submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const name = document.getElementById('name').value.trim();
        const phone = phoneInput.value.trim();
        const otp = otpInput.value.trim();
        const password = passwordInput.value;
        const termsChecked = document.getElementById('terms').checked;

        // Validate all fields
        if (!validateUsername(username)) return;
        if (!validatePhoneNumber(phone)) return;
        if (!validatePassword()) return;
        if (!termsChecked) {
            alert('Please agree to the Terms of Service');
            return;
        }
        if (!isOtpSent) {
            showError(otpError, 'Please request an OTP first');
            return;
        }

        try {
            // Verify OTP
            const userCredential = await confirmationResult.confirm(otp);
            isPhoneVerified = true;

            // Create user object with better password handling
            const user = {
                username,
                name,
                phone,
                password: await hashPassword(password), // Use proper hashing
                isVerified: true,
                joinedDate: new Date().toISOString()
            };

            // Save to localStorage
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));

            // Save session
            sessionStorage.setItem('currentUser', JSON.stringify({
                username,
                phone,
                name,
                isLoggedIn: true
            }));

            alert('Registration successful! Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Verification Error:', error);
            let errorMessage = 'Invalid OTP. Please try again.';

            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'Invalid OTP code. Please check and try again.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = 'OTP has expired. Please request a new one.';
            }

            showError(otpError, errorMessage);
        }
    });

    // Modal Handling
    termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Update continue button state
    function updateContinueButtonState() {
        const usernameValid = validateUsername(document.getElementById('username').value.trim());
        const phoneValid = validatePhoneNumber(phoneInput.value.trim());
        const passwordValid = validatePassword();
        const termsChecked = document.getElementById('terms').checked;
        const otpValid = otpInput.value.length === 6;

        continueBtn.disabled = !(usernameValid && phoneValid && passwordValid && termsChecked && otpValid && isOtpSent);
    }

    // Simple password hashing function (in a real app, use proper server-side hashing)
    async function hashPassword(password) {
        // This is a simple example. In production, use Web Crypto API or a proper library
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Initialize the application
    init();
});