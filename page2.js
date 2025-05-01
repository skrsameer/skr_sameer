document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const referralInput = document.getElementById('referral-code');
    const referralName = document.getElementById('referral-name'); // Fixed typo in ID
    const continueBtn = document.getElementById('continue-btn');
    const skipBtn = document.getElementById('skip-btn');

    // Check if user is returning (has visited before)
    const isReturningUser = localStorage.getItem('hasVisitedBefore');
    
    // If returning user, redirect to login page
    if (isReturningUser) {
        redirectToPage('page3.html');
        return;
    } else {
        localStorage.setItem('hasVisitedBefore', 'true');
    }

    // Sample referral codes (replace with actual fetch in production)
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

    // Validate referral code in real-time
    referralInput.addEventListener('input', function() {
        const code = this.value.trim().toUpperCase();
        
        if (referralCodes[code]) {
            referralName.textContent = `Referred by: ${referralCodes[code]}`;
            referralData.code = code;
            referralData.referrer = referralCodes[code];
            
            // Add animation
            referralName.style.animation = 'none';
            void referralName.offsetWidth; // Trigger reflow
            referralName.style.animation = 'fadeIn 0.5s ease-out';
        } else {
            referralName.textContent = '';
            referralData.code = '';
            referralData.referrer = '';
        }
    });

    // Continue button click handler
    continueBtn.addEventListener('click', function() {
        // Validate if referral code was entered but not found
        if (referralInput.value.trim() && !referralData.code) {
            alert('Invalid referral code. Please enter a valid code or click Skip.');
            return;
        }
        
        // Save to localStorage and sessionStorage
        localStorage.setItem('referralData', JSON.stringify(referralData));
        sessionStorage.setItem('currentReferral', JSON.stringify(referralData));
        
        // Animate button click
        animateButton(this);
        
        // Redirect to next page
        setTimeout(() => {
            redirectToPage('page3.html');
        }, 500);
    });

    // Skip button click handler
    skipBtn.addEventListener('click', function() {
        // Mark as skipped
        referralData.code = 'SKIPPED';
        referralData.referrer = '';
        localStorage.setItem('referralData', JSON.stringify(referralData));
        sessionStorage.setItem('currentReferral', JSON.stringify(referralData));
        
        // Animate button click
        animateButton(this);
        
        // Redirect to next page
        setTimeout(() => {
            redirectToPage('page3.html');
        }, 500);
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