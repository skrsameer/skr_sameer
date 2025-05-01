document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextButtons = document.querySelectorAll('.next-btn');
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 4000; // 4 seconds per slide
    
    // Check if user is visiting for first time
    const isFirstVisit = localStorage.getItem('visited') === null;
    
    if (!isFirstVisit) {
        // For returning users, skip to login/signup slide directly
        currentSlide = 3;
        document.querySelectorAll('.first-visit-slide').forEach(slide => {
            slide.style.display = 'none';
        });
        
        // Check if user is already logged in
        if (localStorage.getItem('isLoggedIn') === 'true') {
            window.location.href = "dashboard.html";
        }
    } else {
        localStorage.setItem('visited', 'true');
    }
    
    // Initialize the slideshow
    function initSlideshow() {
        // Show only the current slide
        slides.forEach((slide, index) => {
            slide.style.display = index === currentSlide ? 'flex' : 'none';
        });
        
        dots[currentSlide].classList.add('active');
        
        // Start auto slideshow if not on last slide
        if (currentSlide < slides.length - 1) {
            startAutoSlide();
        }
        
        // Add click event to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
        });
        
        // Add click event to next buttons
        nextButtons.forEach(button => {
            button.addEventListener('click', nextSlide);
        });
    }
    
    // Go to specific slide
    function goToSlide(n) {
        // Don't proceed if already on this slide
        if (n === currentSlide || n >= slides.length) return;
        
        // Hide current slide
        slides[currentSlide].style.display = 'none';
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        // Update current slide
        currentSlide = n;
        
        // Show new slide
        slides[currentSlide].style.display = 'flex';
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Reset progress bar on slide 3
        if (currentSlide === 2) {
            resetProgressBar();
        }
        
        // Stop auto sliding on last slide
        if (currentSlide === slides.length - 1) {
            clearInterval(slideInterval);
        } else {
            // Restart auto slideshow if not on last slide
            startAutoSlide();
        }
    }
    
    // Next slide
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            goToSlide(currentSlide + 1);
        } else if (currentSlide === slides.length - 1) {
            // If on last slide and clicked, go to signup page
            window.location.href = "page2.html";
        }
    }
    
    // Start auto sliding
    function startAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, slideDuration);
    }
    
    // Reset progress bar animation
    function resetProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.transition = 'none';
        progressBar.style.width = '0';
        
        setTimeout(() => {
            progressBar.style.transition = `width ${slideDuration/1000}s linear`;
            progressBar.style.width = '100%';
        }, 10);
    }
    
    // Login/Signup button handlers
    document.querySelector('.login-btn')?.addEventListener('click', function() {
        window.location.href = "page4.html";
    });
    
    document.querySelector('.signup-btn')?.addEventListener('click', function() {
        // Store any referral code before redirecting
        const referralCode = document.getElementById('referralCode')?.value;
        if (referralCode) {
            localStorage.setItem('referralCode', referralCode);
        }
        window.location.href = "page2.html";
    });
    
    // Referral code verification
    document.getElementById('verifyReferral')?.addEventListener('click', function() {
        const referralCode = document.getElementById('referralCode').value;
        if (referralCode) {
            // In a real app, you would verify with backend
            // For demo, we'll just show a message
            document.getElementById('referralInfo').innerHTML =
                `Verified! Referred by: ${referralCode}`;
            localStorage.setItem('referralCode', referralCode);
            
            // Send notification to admin (simulated)
            sendToAdmin('New referral', `User used referral code: ${referralCode}`);
        }
    });
    
    // Function to simulate sending data to admin
    function sendToAdmin(title, message) {
        // In real implementation, this would be an API call
        console.log(`Admin Notification - ${title}: ${message}`);
        // You would typically use fetch() to send to your backend
    }
    
    // Initialize the slideshow
    initSlideshow();
    
    // Special handling for slide 3 (progress bar)
    if (currentSlide === 2) {
        resetProgressBar();
    }
});