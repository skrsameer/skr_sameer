document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextButtons = document.querySelectorAll('.next-btn');
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 4000; // 4 seconds per slide
    
    // Initialize slideshow
    function initSlideshow() {
        showSlide(currentSlide);
        startAutoSlide();
        setupEventListeners();
    }
    
    // Show specific slide
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show current slide
        slides[index].classList.add('active');
        
        // Update dots
        updateDots(index);
        
        // Reset progress bar on slide 3
        if (index === 2) {
            resetProgressBar();
        }
        
        // Stop auto-sliding on last slide
        if (index === slides.length - 1) {
            clearInterval(slideInterval);
        }
    }
    
    // Update navigation dots
    function updateDots(index) {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // Go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
        
        // Restart auto-slide if not on last slide
        if (currentSlide < slides.length - 1) {
            startAutoSlide();
        }
    }
    
    // Start auto-sliding
    function startAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, slideDuration);
    }
    
    // Reset progress bar
    function resetProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = '0';
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 10);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Next buttons
        nextButtons.forEach(button => {
            button.addEventListener('click', nextSlide);
        });
        
        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                clearInterval(slideInterval);
                if (currentSlide < slides.length - 1) {
                    startAutoSlide();
                }
            });
        });
        
        // Login/Signup buttons
        document.querySelector('.login-btn')?.addEventListener('click', () => {
            window.location.href = "page4.html";
        });
        
        document.querySelector('.signup-btn')?.addEventListener('click', () => {
            window.location.href = "page3.html";
        });
    }
    
    // Initialize the slideshow
    initSlideshow();
});