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
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthText = document.querySelector('.strength-text');
    const recaptchaContainer = document.getElementById('recaptcha-container');
    const otpLoader = document.getElementById('otpLoader');

    // Variables
    let confirmationResult;
    let otpExpiryTime = 0;
    let otpTimerInterval;
    let recaptchaVerifier;
    let isOtpSent = false;

    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();

    // Initialize application
    function init() {
        continueBtn.disabled = true;
        otpGroup.style.display = 'none';
        recaptchaContainer.style.display = 'none';
        initializeRecaptcha();
        setupEventListeners();
    }

    // Initialize reCAPTCHA
    function initializeRecaptcha() {
        try {
            recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    sendOtp();
                },
                'expired-callback': () => {
                    resetOtpButton();
                }
            });
        } catch (error) {
            console.error('reCAPTCHA initialization error:', error);
            showError(phoneError, 'Failed to initialize security check. Please refresh the page.');
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Send OTP Button Click
        sendOtpBtn.addEventListener('click', onSendOtpClick);

        // OTP Input
        otpInput.addEventListener('input', onOtpInput);

        // Toggle Password Visibility
        togglePassword.addEventListener('click', () => togglePasswordVisibility(passwordInput, togglePassword));
        toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword));

        // Password Strength Check
        passwordInput.addEventListener('input', onPasswordInput);
        confirmPasswordInput.addEventListener('input', onConfirmPasswordInput);

        // Form Fields Validation
        document.getElementById('username').addEventListener('input', onUsernameInput);
        phoneInput.addEventListener('input', onPhoneInput);
        document.getElementById('terms').addEventListener('change', updateContinueButtonState);

        // Form Submission
        form.addEventListener('submit', onFormSubmit);

        // Modal Handling
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

        // Show loading state
        sendOtpBtn.disabled = true;
        document.getElementById('btnText').textContent = 'Sending...';
        
        // Trigger reCAPTCHA
        recaptchaVerifier.verify().catch(error => {
            showError(phoneError, 'Security check failed. Please try again.');
            resetOtpButton();
        });
    }

    function onOtpInput() {
        const otp = otpInput.value;
        if (otp.length === 6) {
            otpError.style.display = 'none';
        }
        updateContinueButtonState();
    }

    function onPasswordInput() {
        checkPasswordStrength(passwordInput.value);
        validatePassword();
        updateContinueButtonState();
    }

    function onConfirmPasswordInput() {
        validatePassword();
        updateContinueButtonState();
    }

    function onUsernameInput() {
        validateUsername(this.value.trim());
        updateContinueButtonState();
    }

    function onPhoneInput() {
        validatePhoneNumber(this.value.trim());
        updateContinueButtonState();
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        if (!validateAllFields()) {
            return;
        }

        // Show loading state
        continueBtn.disabled = true;
        otpLoader.style.display = 'block';

        try {
            // Verify OTP
            await confirmationResult.confirm(otpInput.value);
            
            // Create account
            const accountCreated = await createUserAccount();
            if (!accountCreated) return;
            
            // Show success and redirect
            showTemporaryMessage('Registration successful!', 'success');
            setTimeout(() => {
                window.location.href = 'page5.html';
            }, 1500);
            
        } catch (error) {
            handleOtpVerificationError(error);
        } finally {
            otpLoader.style.display = 'none';
        }
    }

    function onTermsLinkClick(e) {
        e.preventDefault();
        modal.style.display = 'block';
    }

    function closeTermsModal() {
        modal.style.display = 'none';
    }

    function onWindowClick(e) {
        if (e.target === modal) {
            closeTermsModal();
        }
    }

    // Core Functions
    function sendOtp() {
        const phone = phoneInput.value.trim();
        const formattedPhone = `+91${phone}`;

        // Show loading state
        otpLoader.style.display = 'block';

        auth.signInWithPhoneNumber(formattedPhone, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                otpGroup.style.display = 'block';
                startOtpTimer();
                isOtpSent = true;
                
                // Scroll to OTP field
                otpGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Focus OTP input
                setTimeout(() => otpInput.focus(), 500);
                
                showTemporaryMessage('OTP sent to your mobile number', 'success');
            })
            .catch((error) => {
                handleOtpError(error);
            })
            .finally(() => {
                otpLoader.style.display = 'none';
                resetOtpButton();
            });
    }

    function validateAllFields() {
        const usernameValid = validateUsername(document.getElementById('username').value.trim());
        const phoneValid = validatePhoneNumber(phoneInput.value.trim());
        const passwordValid = validatePassword();
        const termsChecked = document.getElementById('terms').checked;
        const otpValid = otpInput.value.length === 6;

        if (!usernameValid || !phoneValid || !passwordValid || !termsChecked || !otpValid) {
            return false;
        }

        return true;
    }

    async function createUserAccount() {
        const username = document.getElementById('username').value.trim();
        const name = document.getElementById('name').value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;

        // Create user object
        const user = {
            username,
            name,
            phone,
            password: btoa(password), // Base64 encoding
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

        // Save current session
        sessionStorage.setItem('currentUser', JSON.stringify({
            username,
            phone,
            name,
            isLoggedIn: true,
            balance: 0
        }));

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
        const usernameError = document.getElementById('usernameError');
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
        const usernameValid = validateUsername(document.getElementById('username').value.trim());
        const phoneValid = validatePhoneNumber(phoneInput.value.trim());
        const passwordValid = validatePassword();
        const termsChecked = document.getElementById('terms').checked;
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
        document.getElementById('btnText').textContent = isOtpSent ? 'Resend OTP' : 'Send OTP';
    }

    function handleOtpError(error) {
        let errorMessage = 'Failed to send OTP. Please try again.';

        switch (error.code) {
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Please try again later.';
                break;
            case 'auth/invalid-phone-number':
                errorMessage = 'Invalid phone number format.';
                break;
            case 'auth/quota-exceeded':
                errorMessage = 'OTP quota exceeded. Try again later.';
                break;
            case 'auth/captcha-check-failed':
                errorMessage = 'Security check failed. Please refresh the page.';
                break;
        }

        showError(phoneError, errorMessage);
    }

    function handleOtpVerificationError(error) {
        let errorMessage = 'Invalid OTP. Please try again.';

        switch (error.code) {
            case 'auth/invalid-verification-code':
                errorMessage = 'Invalid OTP code.';
                break;
            case 'auth/code-expired':
                errorMessage = 'OTP expired. Please request a new one.';
                isOtpSent = false;
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Try again later.';
                break;
        }

        showError(otpError, errorMessage);
        otpInput.focus();
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