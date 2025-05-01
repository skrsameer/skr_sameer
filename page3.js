document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('registrationForm');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const phoneInput = document.getElementById('phone');
    const otpInput = document.getElementById('otp');
    const otpGroup = document.getElementById('otpGroup');
    const otpError = document.getElementById('otpError');
    const phoneError = document.getElementById('phoneError');
    const continueBtn = document.getElementById('continueBtn');
    const otpTimer = document.getElementById('otpTimer');

    // Variables
    let generatedOtp = '';
    let otpExpiryTime = 0;
    let otpTimerInterval;
    let isPhoneVerified = false;

    // Generate 6-digit OTP
    function generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP via SMS API
    async function sendOtpToPhone(phone, otp) {
        try {
            // Using MSG91 API (replace with your actual API key)
            const response = await fetch('https://api.msg91.com/api/v5/otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': 'YOUR_MSG91_AUTH_KEY' // Replace with actual key
                },
                body: JSON.stringify({
                    mobile: `91${phone}`, // Indian country code
                    template_id: 'YOUR_TEMPLATE_ID', // Approved DLT template
                    otp: otp,
                    otp_expiry: 5 // 5 minutes expiry
                })
            });

            const result = await response.json();
            
            if (result.type === 'success') {
                // Store OTP and expiry time
                generatedOtp = otp;
                otpExpiryTime = Date.now() + 5 * 60 * 1000;
                
                // Show OTP field and start timer
                otpGroup.style.display = 'block';
                startOtpTimer();
                
                // Update button text
                document.getElementById('btnText').textContent = 'Resend OTP';
                
                console.log(`OTP sent successfully to ${phone}`);
                return true;
            } else {
                console.error('OTP send failed:', result.message);
                showError(phoneError, 'Failed to send OTP. Please try again.');
                return false;
            }
        } catch (error) {
            console.error('OTP API error:', error);
            showError(phoneError, 'Network error. Please check your connection.');
            return false;
        }
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

    // Validate phone number
    function validatePhoneNumber(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            showError(phoneError, 'Please enter a valid 10-digit Indian number');
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

    // Event Listeners
    sendOtpBtn.addEventListener('click', async function() {
        const phone = phoneInput.value.trim();
        
        if (!validatePhoneNumber(phone)) return;
        
        // Disable button during request
        this.disabled = true;
        document.getElementById('btnText').textContent = 'Sending...';
        
        const otp = generateOtp();
        const otpSent = await sendOtpToPhone(phone, otp);
        
        // Re-enable button
        this.disabled = false;
        if (!otpSent) {
            document.getElementById('btnText').textContent = 'Send OTP';
        }
    });

    otpInput.addEventListener('input', function() {
        const otp = this.value.trim();
        
        if (otp.length === 6) {
            continueBtn.disabled = !validateOtp(otp);
        } else {
            continueBtn.disabled = true;
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!isPhoneVerified) {
            showError(otpError, 'Please verify your phone number with OTP');
            return;
        }
        
        // Proceed with registration
        alert('Registration successful!');
        // window.location.href = 'dashboard.html';
    });

    // For testing purposes only (remove in production)
    console.warn('Development mode: OTP will be logged to console');
});