// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZ8xdSzT1kNBFn1OKzjmHFE1Y_HRONJ4Q",
  authDomain: "earn-with-skr-b3eb0.firebaseapp.com",
  databaseURL: "https://earn-with-skr-b3eb0-default-rtdb.firebaseio.com",
  projectId: "earn-with-skr-b3eb0",
  storageBucket: "earn-with-skr-b3eb0.firebasestorage.app",
  messagingSenderId: "632843327266",
  appId: "1:632843327266:web:57c5ad6d78fae0ad0b377b",
  measurementId: "G-M44HFP9M3Y"
};

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

    // Initialize
    continueBtn.disabled = true;
    otpGroup.style.display = 'none';
    recaptchaContainer.style.display = 'none';

    // Initialize reCAPTCHA
    function initializeRecaptcha() {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow sending OTP
                sendOtp();
            }
        });
    }

    // Check if phone is registered
    function isPhoneRegistered(phone) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.some(user => user.phone === phone);
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
                return;
            }

            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            otpTimer.textContent = `OTP expires in ${mins}:${secs.toString().padStart(2, '0')}`;
        }

        updateTimer();
        otpTimerInterval = setInterval(updateTimer, 1000);
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
        const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
        
        if (!usernameRegex.test(username)) {
            showError(document.getElementById('usernameError'), 
                'Username must be 4-20 characters (letters, numbers, underscore)');
            return false;
        }
        
        hideError(document.getElementById('usernameError'));
        return true;
    }

    // Validate Password
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
        if (strength <= 2) {
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

        if (!validatePhoneNumber(phone)) return;

        sendOtpBtn.disabled = true;
        document.getElementById('btnText').textContent = 'Sending...';

        const formattedPhone = `+91${phone}`;
        
        auth.signInWithPhoneNumber(formattedPhone, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                otpGroup.style.display = 'block';
                startOtpTimer();
                isPhoneVerified = false;
                alert('OTP sent successfully to ' + formattedPhone);
            })
            .catch((error) => {
                console.error('OTP Error:', error);
                let errorMessage = 'Failed to send OTP. Please try again.';
                
                if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many requests. Please try again later.';
                } else if (error.code === 'auth/invalid-phone-number') {
                    errorMessage = 'Invalid phone number format.';
                }
                
                showError(phoneError, errorMessage);
            })
            .finally(() => {
                sendOtpBtn.disabled = false;
                document.getElementById('btnText').textContent = 'Resend OTP';
            });
    }

    // Handle Send OTP Button Click
    sendOtpBtn.addEventListener('click', function() {
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
    });

    confirmPasswordInput.addEventListener('input', validatePassword);

    // Username Validation
    document.getElementById('username').addEventListener('input', function() {
        validateUsername(this.value.trim());
    });

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

        try {
            // Verify OTP
            const userCredential = await confirmationResult.confirm(otp);
            isPhoneVerified = true;

            // Create user object
            const user = {
                username,
                name,
                phone,
                password: btoa(password), // Simple encoding (not secure for production)
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

    // Enable continue button when all fields are valid
    form.addEventListener('input', function() {
        const usernameValid = validateUsername(document.getElementById('username').value.trim());
        const phoneValid = validatePhoneNumber(phoneInput.value.trim());
        const passwordValid = validatePassword();
        const termsChecked = document.getElementById('terms').checked;
        
        continueBtn.disabled = !(usernameValid && phoneValid && passwordValid && termsChecked && isPhoneVerified);
    });
});
