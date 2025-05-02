// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-Bsgg9aihEA4IQfCJwHK1Q452hEUv1_w",
  authDomain: "skr-otp.firebaseapp.com",
  projectId: "skr-otp",
  storageBucket: "skr-otp.firebasestorage.app",
  messagingSenderId: "370395566351",
  appId: "1:370395566351:web:06b3a967f2e04db7672e7a",
  measurementId: "G-MJQK7VQD12"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

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
    let confirmationResult;
    let otpExpiryTime = 0;
    let otpTimerInterval;
    let isPhoneVerified = false;

    // Initialize
    continueBtn.disabled = true;
    otpGroup.style.display = 'none';

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
    sendOtpBtn.addEventListener('click', async function() {
        const phone = phoneInput.value.trim();
        
        if (!validatePhoneNumber(phone)) return;

        this.disabled = true;
        document.getElementById('btnText').textContent = 'Sending...';

        try {
            const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                size: 'invisible'
            });

            const formattedPhone = `+91${phone}`;
            confirmationResult = await auth.signInWithPhoneNumber(formattedPhone, appVerifier);
            
            otpGroup.style.display = 'block';
            startOtpTimer();
            isPhoneVerified = false;
            alert('OTP sent successfully!');
        } catch (error) {
            console.error('OTP Error:', error);
            showError(phoneError, 'Failed to send OTP. Please try again.');
        } finally {
            this.disabled = false;
            document.getElementById('btnText').textContent = 'Resend OTP';
        }
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

    // Form Submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const name = document.getElementById('name').value.trim();
        const phone = phoneInput.value.trim();
        const otp = otpInput.value.trim();
        const password = passwordInput.value;

        if (!validatePassword()) return;

        try {
            // Verify OTP
            const userCredential = await confirmationResult.confirm(otp);
            isPhoneVerified = true;
            
            // Create user object
            const user = {
                username,
                name,
                phone,
                password: btoa(password), // Simple encoding
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

            alert('Registration successful!');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Verification Error:', error);
            showError(otpError, 'Invalid OTP. Please try again.');
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
});