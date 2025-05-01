document.addEventListener('DOMContentLoaded', function() {
    const verifyBtn = document.getElementById('verifyBtn');
    const laterBtn = document.getElementById('laterBtn');

    // Add ripple effect to verify button
    verifyBtn.addEventListener('click', function(e) {
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        // Position the ripple
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // Add ripple to button
        this.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Navigate to page6 after animation
        setTimeout(() => {
            window.location.href = 'page6.html';
        }, 300);
    });

    // Later button click handler
    laterBtn.addEventListener('click', function() {
        // Add animation before navigation
        this.classList.add('animate__animated', 'animate__fadeOut');
        
        setTimeout(() => {
            window.location.href = 'page4.html';
        }, 300);
    });

    // Add animation to offer card on hover
    const offerCard = document.querySelector('.offer-card');
    offerCard.addEventListener('mouseenter', function() {
        this.classList.add('animate__animated', 'animate__pulse');
    });
    
    offerCard.addEventListener('animationend', function() {
        this.classList.remove('animate__animated', 'animate__pulse');
    });
});

// Add ripple effect styles dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        width: 20px;
        height: 20px;
    }
`;
document.head.appendChild(style);