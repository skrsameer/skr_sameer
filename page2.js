document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const referralInput = document.getElementById('referral-code');
    const referralName = document.getElementById('referral-name');
    const continueBtn = document.getElementById('continue-btn');
    const skipBtn = document.getElementById('skip-btn');

    // Sample referral codes (in production, fetch from admin backend)
    const referralCodes = {
        'SKR100': 'John Sharma',
        'SKR200': 'Priya Patel',
        'SKR300': 'Rahul Gupta',
        'SKR400': 'Anjali Singh',
        'SKR500': 'Vikram Kumar'
    };

    // Store referral data
    let referralData = {
        code: '',
        referrer: '',
        timestamp: new Date().toISOString()
    };

    // Initially disable continue button
    continueBtn.disabled = true;

    // Validate referral code in real-time
    referralInput.addEventListener('input', function() {
        const code = this.value.trim().toUpperCase();
        
        if (code && referralCodes[code]) {
            // Valid code entered
            referralName.textContent = `Referred by: ${referralCodes[code]}`;
            referralData.code = code;
            referralData.referrer = referralCodes[code];
            
            // Enable continue button
            continueBtn.disabled = false;
            
            // Add animation
            referralName.style.animation = 'none';
            void referralName.offsetWidth; // Trigger reflow
            referralName.style.animation = 'fadeIn 0.5s ease-out';
        } else {
            // Invalid or empty code
            referralName.textContent = '';
            referralData.code = '';
            referralData.referrer = '';
            
            // Disable continue button
            continueBtn.disabled = true;
        }
    });

    // Continue button click handler (only works with valid referral code)
    continueBtn.addEventListener('click', function() {
        if (!referralData.code) {
            alert('Please enter a valid referral code to continue.');
            return;
        }
        
        // Save referral data
        localStorage.setItem('referralData', JSON.stringify(referralData));
        sessionStorage.setItem('currentReferral', JSON.stringify(referralData));
        
        // Animate and redirect
        animateButton(this);
        redirectToPage('page3.html');
    });

    // Skip button click handler (works independently)
    skipBtn.addEventListener('click', function() {
        // Mark as skipped
        referralData.code = 'SKIPPED';
        referralData.referrer = '';
        
        // Save referral data
        localStorage.setItem('referralData', JSON.stringify(referralData));
        sessionStorage.setItem('currentReferral', JSON.stringify(referralData));
        
        // Animate and redirect
        animateButton(this);
        redirectToPage('page3.html');
    });

    // Helper function to animate buttons
    function animateButton(button) {
        button.style.transform = 'scale(0.95)';
        button.disabled = true;
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.disabled = false;
        }, 200);
    }

    // Redirect function with animation
    function redirectToPage(page) {
        document.querySelector('.card').style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => {
            window.location.href = page;
        }, 500);
    }
});