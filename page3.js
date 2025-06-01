document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('registrationForm');
    const usernameInput = document.getElementById('username');
    const phoneInput = document.getElementById('phone');
    const otpInput = document.getElementById('otp');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const continueBtn = document.getElementById('continueBtn');
    const otpGroup = document.getElementById('otpGroup');
    const otpTimer = document.getElementById('otpTimer');
    const otpLoader = document.getElementById('otpLoader');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    // Error Elements
    const usernameError = document.getElementById('usernameError');
    const phoneError = document.getElementById('phoneError');
    const otpError = document.getElementById('otpError');
    const passwordError = document.getElementById('passwordError');

    // Variables
    let generatedOtp = '';
    let otpExpiryTime = 0;
    let otpTimerInterval;
    let canResendOtp = true;

    // Initialize
    function init() {
        setupEventListeners();
        updateContinueButtonState();
        fixChromeInputIssues();
    }

    // Fix Chrome input issues
    function fixChromeInputIssues() {
        // Prevent Chrome autofill from breaking input
        usernameInput.autocomplete = 'new-username';
        phoneInput.autocomplete = 'new-phone';
        
        // Fix double-tap issue on mobile
        document.addEventListener('touchstart', function() {}, true);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Form submission
        form.addEventListener('submit', onFormSubmit);

        // OTP related
        sendOtpBtn.addEventListener('click', onSendOtpClick);
        otpInput.addEventListener('input', onOtpInput);

        // Password visibility toggle
        togglePassword.addEventListener('click', () => togglePasswordVisibility(passwordInput, togglePassword));
        toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword));

        // Form validation
        usernameInput.addEventListener('input', onUsernameInput);
        phoneInput.addEventListener('input', onPhoneInput);
        passwordInput.addEventListener('input', onPasswordInput);
        confirmPasswordInput.addEventListener('input', onPasswordInput);
        termsCheckbox.addEventListener('change', updateContinueButtonState);
    }

    // Generate random 6-digit OTP
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP (simulated)
    function sendOTP(phone) {
        generatedOtp = generateOTP();
        console.log(`OTP for ${phone}: ${generatedOtp}`); // For testing
        
        // Show OTP field
        otpGroup.style.display = 'block';
        startOtpTimer();
        
        // In real app, call SMS API here
        alert(`DEMO: OTP would be sent via SMS\nYour OTP is: ${generatedOtp}`);
    }

    // Event Handlers
    function onSendOtpClick(e) {
        e.preventDefault();
        const phone = phoneInput.value.trim();
        
        if (!validatePhoneNumber(phone)) return;
        if (!canResendOtp) {
            showError(phoneError, 'Please wait before resending OTP');
            return;
        }

        sendOtpBtn.disabled = true;
        otpLoader.style.display = 'block';
        document.getElementById('btnText').textContent = 'Sending...';
        
        setTimeout(() => {
            sendOTP(phone);
            otpLoader.style.display = 'none';
            document.getElementById('btnText').textContent = 'Resend OTP';
            sendOtpBtn.disabled = false;
            
            // Prevent immediate resend
            canResendOtp = false;
            setTimeout(() => canResendOtp = true, 30000);
        }, 1500);
    }

    function onFormSubmit(e) {
        e.preventDefault();
        
        if (!validateAllFields()) return;
        if (otpInput.value !== generatedOtp) {
            showError(otpError, 'Invalid OTP. Please try again.');
            return;
        }

        // Create account
        const userData = {
            username: usernameInput.value.trim(),
            name: document.getElementById('name').value.trim(),
            phone: phoneInput.value.trim(),
            password: btoa(passwordInput.value), // Base64 encoding (demo only)
            joinedDate: new Date().toISOString()
        };

        // Save to localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.some(u => u.username === userData.username || u.phone === userData.phone)) {
            showError(phoneError, 'User already registered');
            return;
        }
        
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Registration successful!');
        window.location.href = 'page4.html'; // Redirect to login
    }

    // Validation Functions
    function validatePhoneNumber(phone) {
        const isValid = /^[6-9]\d{9}$/.test(phone);
        if (!isValid) {
            showError(phoneError, 'Enter valid 10-digit Indian number');
            return false;
        }
        hideError(phoneError);
        return true;
    }

    function validateUsername(username) {
        const isValid = /^[a-zA-Z0-9_]{4,20}$/.test(username);
        if (!isValid) {
            showError(usernameError, '4-20 characters (letters, numbers, _)');
            return false;
        }
        
        // Check if username exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.username === username)) {
            showError(usernameError, 'Username already taken');
            return false;
        }
        
        hideError(usernameError);
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;
        const isValid = password.length >= 8 && password === confirmPasswordInput.value;
        if (!isValid) {
            showError(passwordError, password.length < 8 ? 'Minimum 8 characters' : 'Passwords do not match');
            return false;
        }
        hideError(passwordError);
        return true;
    }

    function validateAllFields() {
        return (
            validateUsername(usernameInput.value.trim()) &&
            validatePhoneNumber(phoneInput.value.trim()) &&
            validatePassword() &&
            termsCheckbox.checked &&
            otpInput.value.length === 6
        );
    }

    // Helper Functions
    function startOtpTimer() {
        clearInterval(otpTimerInterval);
        otpExpiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
        
        otpTimerInterval = setInterval(() => {
            const remaining = Math.max(0, otpExpiryTime - Date.now());
            if (remaining <= 0) {
                otpTimer.textContent = 'OTP expired';
                clearInterval(otpTimerInterval);
                return;
            }
            
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            otpTimer.textContent = `OTP expires in ${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function togglePasswordVisibility(input, icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    function updateContinueButtonState() {
        continueBtn.disabled = !validateAllFields();
    }

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

    // Initialize
    init();
});