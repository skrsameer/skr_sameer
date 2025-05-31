document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('registrationForm');
    const usernameInput = document.getElementById('username');
    const nameInput = document.getElementById('name');
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
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthText = document.querySelector('.strength-text');
    const termsLink = document.getElementById('termsLink');
    const modal = document.getElementById('termsModal');
    const closeModal = document.querySelector('.close-modal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    // Error Elements
    const usernameError = document.getElementById('usernameError');
    const phoneError = document.getElementById('phoneError');
    const otpError = document.getElementById('otpError');
    const passwordError = document.getElementById('passwordError');

    // Variables
    let otpExpiryTime = 0;
    let otpTimerInterval;
    let isOtpSent = false;
    let generatedOtp = '';
    let canResendOtp = true;

    // Initialize the application
    function init() {
        setupEventListeners();
        updateContinueButtonState();
    }

    // Setup all event listeners
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

        // Terms modal
        termsLink.addEventListener('click', onTermsLinkClick);
        closeModal.addEventListener('click', closeTermsModal);
        modalCloseBtn.addEventListener('click', closeTermsModal);
        window.addEventListener('click', onWindowClick);
    }

    // Event Handlers
    function onSendOtpClick(e) {
        e.preventDefault();
        const phone = phoneInput.value.trim();
        
        if (!validatePhoneNumber(phone)) {
            return;
        }

        if (!canResendOtp) {
            showError(phoneError, 'Please wait before resending OTP');
            return;
        }

        // Show loading state
        sendOtpBtn.disabled = true;
        document.getElementById('btnText').textContent = 'Sending...';
        otpLoader.style.display = 'block';

        // Generate and "send" OTP (simulated)
        setTimeout(() => {
            generatedOtp = generateOTP();
            console.log(`OTP for ${phone}: ${generatedOtp}`); // For testing
            
            otpGroup.style.display = 'block';
            startOtpTimer();
            isOtpSent = true;
            
            // Scroll to OTP field
            otpGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Focus OTP input
            setTimeout(() => otpInput.focus(), 500);
            
            showTemporaryMessage('OTP sent successfully (Demo OTP: ' + generatedOtp + ')', 'success');
            otpLoader.style.display = 'none';
            resetOtpButton();
            
            // Prevent immediate resend
            canResendOtp = false;
            setTimeout(() => {
                canResendOtp = true;
                document.getElementById('btnText').textContent = 'Resend OTP';
            }, 30000); // 30 second cooldown
        }, 1500);
    }

    function onOtpInput() {
        const otp = otpInput.value;
        if (otp.length === 6) {
            otpError.style.display = 'none';
        }
        updateContinueButtonState();
    }

    function onFormSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        if (!validateAllFields()) {
            return;
        }

        // Verify OTP
        if (otpInput.value !== generatedOtp) {
            showError(otpError, 'Invalid OTP. Please try again.');
            otpInput.focus();
            return;
        }

        // Create account
        const accountCreated = createUserAccount();
        if (!accountCreated) return;
        
        // Show success and redirect
        showTemporaryMessage('Registration successful!', 'success');
        setTimeout(() => {
            window.location.href = 'page5.html'; // Redirect to login page
        }, 1500);
    }

    function onUsernameInput() {
        validateUsername(this.value.trim());
        updateContinueButtonState();
    }

    function onPhoneInput() {
        validatePhoneNumber(this.value.trim());
        updateContinueButtonState();
    }

    function onPasswordInput() {
        checkPasswordStrength(passwordInput.value);
        validatePassword();
        updateContinueButtonState();
    }

    function onTermsLinkClick(e) {
        e.preventDefault();
        modal.style.display = 'block';
    }

    // Core Functions
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function validateAllFields() {
        const usernameValid = validateUsername(usernameInput.value.trim());
        const phoneValid = validatePhoneNumber(phoneInput.value.trim());
        const passwordValid = validatePassword();
        const termsChecked = termsCheckbox.checked;
        const otpValid = otpInput.value.length === 6;

        if (!usernameValid || !phoneValid || !passwordValid || !termsChecked || !otpValid) {
            return false;
        }

        return true;
    }

    function createUserAccount() {
        const username = usernameInput.value.trim();
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;

        // Create user object
        const user = {
            username,
            name,
            phone,
            password: btoa(password), // Base64 encoding (demo only - use proper hashing in production)
            isVerified: true,
            balance: 0,
            joinedDate: new Date().toISOString()
        };

        // Save to localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        const userExists = users.some(u => u.phone === phone || u.username === username);
        if (userExists) {
            showError(phoneError, 'User already registered');
            return false;
        }
        
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }

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

        hideError(phoneError);
        return true;
    }

    function validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;

        if (!username) {
            showError(usernameError, 'Username is required');
            return false;
        }

        if (!usernameRegex.test(username)) {
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
        const confirmPassword = confirmPasswordInput.value;

        if (!password) {
            showError(passwordError, 'Password is required');
            return false;
        }

        if (password.length < 8) {
            showError(passwordError, 'Minimum 8 characters required');
            return false;
        }

        if (password !== confirmPassword) {
            showError(passwordError, 'Passwords do not match');
            return false;
        }

        hideError(passwordError);
        return true;
    }

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
            strengthMeter.style.backgroundColor = 'var(--error-color)';
            strengthText.textContent = 'Weak';
            strengthText.style.color = 'var(--error-color)';
        } else if (strength <= 4) {
            strengthMeter.style.width = '66%';
            strengthMeter.style.backgroundColor = 'var(--warning-color)';
            strengthText.textContent = 'Medium';
            strengthText.style.color = 'var(--warning-color)';
        } else {
            strengthMeter.style.width = '100%';
            strengthMeter.style.backgroundColor = 'var(--success-color)';
            strengthText.textContent = 'Strong';
            strengthText.style.color = 'var(--success-color)';
        }
    }

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
                updateContinueButtonState();
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
        const usernameValid = validateUsername(usernameInput.value.trim());
        const phoneValid = validatePhoneNumber(phoneInput.value.trim());
        const passwordValid = validatePassword();
        const termsChecked = termsCheckbox.checked;
        const otpValid = otpInput.value.length === 6;

        continueBtn.disabled = !(usernameValid && phoneValid && passwordValid && termsChecked && otpValid && isOtpSent);
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

    function resetOtpButton() {
        sendOtpBtn.disabled = false;
        document.getElementById('btnText').textContent = 'Resend OTP';
    }

    function closeTermsModal() {
        modal.style.display = 'none';
    }

    function onWindowClick(e) {
        if (e.target === modal) {
            closeTermsModal();
        }
    }

    function showTemporaryMessage(message, type) {
        const tempMsg = document.createElement('div');
        tempMsg.className = `temp-message ${type}`;
        tempMsg.textContent = message;
        document.body.appendChild(tempMsg);

        setTimeout(() => {
            tempMsg.classList.add('fade-out');
            setTimeout(() => tempMsg.remove(), 500);
        }, 3000);
    }

    // Initialize the application
    init();
});