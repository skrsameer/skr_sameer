document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const payButton = document.getElementById('payButton');
    const verifyButton = document.getElementById('verifyButton');
    const dashboardButton = document.getElementById('dashboardButton');
    const paymentSection = document.getElementById('paymentSection');
    const verificationSection = document.getElementById('verificationSection');
    const pendingSection = document.getElementById('pendingSection');
    const successSection = document.getElementById('successSection');
    const screenshotInput = document.getElementById('screenshot');
    const previewContainer = document.getElementById('previewContainer');
    const fileNameSpan = document.getElementById('fileName');
    const statusText = document.getElementById('statusText');
    const upiIdInput = document.getElementById('upiId');
    const copyIcon = document.getElementById('copyIcon');
    
    // State variables
    let paymentSubmitted = false;
    let adminApproved = false;
    
    // Initialize event listeners
    payButton.addEventListener('click', initiatePayment);
    verifyButton.addEventListener('click', verifyPayment);
    dashboardButton.addEventListener('click', goToDashboard);
    screenshotInput.addEventListener('change', handleFileUpload);
    
    // Check if returning from payment
    checkReturningUser();
    
    // Function to initiate payment
    function initiatePayment() {
        // Disable button during processing
        payButton.disabled = true;
        payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Simulate payment processing (2 seconds)
        setTimeout(() => {
            // Enable button
            payButton.disabled = false;
            payButton.innerHTML = '<i class="fas fa-rupee-sign"></i> Pay ₹21 Now';
            
            // Show verification section
            showVerificationSection();
            
            // Update URL to simulate payment completion
            window.history.pushState({}, '', '?payment=initiated');
        }, 2000);
    }
    
    // Show verification section with animation
    function showVerificationSection() {
        // Hide payment section with animation
        paymentSection.classList.add('animate__fadeOut');
        
        setTimeout(() => {
            paymentSection.style.display = 'none';
            
            // Update progress steps
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
            // Show verification section with animation
            verificationSection.style.display = 'block';
            verificationSection.classList.add('animate__fadeIn');
        }, 500);
    }
    
    // Handle file upload preview
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Update file name display
            fileNameSpan.textContent = file.name;
            
            // Show preview for image files
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewContainer.innerHTML = `<img src="${e.target.result}" alt="Payment Proof">`;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        } else {
            fileNameSpan.textContent = 'Upload payment proof';
            previewContainer.style.display = 'none';
        }
    }
    
    // Verify payment submission
    function verifyPayment() {
        const screenshot = screenshotInput.files[0];
        const transactionId = document.getElementById('transactionId').value.trim();
        
        // Validate inputs
        if (!screenshot) {
            alert('Please upload payment screenshot');
            return;
        }
        
        if (!transactionId) {
            alert('Please enter transaction ID');
            return;
        }
        
        // Disable button during submission
        verifyButton.disabled = true;
        verifyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        // Prepare transaction data
        const transactionData = {
            userId: getCurrentUserId(),
            amount: 21,
            transactionId: transactionId,
            screenshot: screenshot.name,
            timestamp: new Date().toISOString()
        };
        
        // Simulate submission to admin (3 seconds)
        setTimeout(() => {
            // Store transaction in localStorage (simulating database)
            storeTransaction(transactionData);
            
            // Hide verification section
            verificationSection.classList.add('animate__fadeOut');
            
            setTimeout(() => {
                verificationSection.style.display = 'none';
                
                // Show pending section
                pendingSection.style.display = 'block';
                paymentSubmitted = true;
                
                // Simulate admin verification process
                simulateAdminVerification(transactionData);
            }, 500);
        }, 3000);
    }
    
    // Simulate admin verification process
    function simulateAdminVerification(transactionData) {
        let seconds = 0;
        const statusMessages = [
            "Payment received",
            "Verifying transaction",
            "Checking payment details",
            "Finalizing verification"
        ];
        
        // Show progress updates every second
        const interval = setInterval(() => {
            statusText.textContent = statusMessages[seconds % statusMessages.length];
            seconds++;
            
            // Randomly complete verification after 3-6 seconds
            if (seconds >= 3 && (seconds > 5 || Math.random() > 0.7)) {
                clearInterval(interval);
                completeVerification(transactionData);
            }
        }, 1000);
    }
    
    // Complete verification process
    function completeVerification(transactionData) {
        // Update user verification status
        verifyUserAccount(transactionData.userId);
        
        // Update status text
        statusText.textContent = "Verification Successful!";
        statusText.style.color = "var(--success)";
        
        // After 1 second, show success message
        setTimeout(() => {
            pendingSection.style.display = 'none';
            
            // Update progress steps
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
            
            // Show success section
            successSection.style.display = 'block';
            adminApproved = true;
            
            // Update user session
            updateUserSession();
        }, 1000);
    }
    
    // Redirect to dashboard
    function goToDashboard() {
        window.location.href = "dashboard.html";
    }
    
    // Check if user is returning to this page
    function checkReturningUser() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('payment')) {
            // User already initiated payment, show verification section
            paymentSection.style.display = 'none';
            document.getElementById('step1').classList.add('active');
            
            verificationSection.style.display = 'block';
            verificationSection.classList.remove('animate__fadeIn');
        }
        
        if (urlParams.has('verify')) {
            // User already submitted verification
            paymentSection.style.display = 'none';
            verificationSection.style.display = 'none';
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
            pendingSection.style.display = 'block';
            simulateAdminVerification({ userId: getCurrentUserId() });
        }
    }
    
    // Copy UPI ID to clipboard
    window.copyUpiId = function() {
        upiIdInput.select();
        document.execCommand('copy');
        
        // Visual feedback
        copyIcon.classList.replace('fa-copy', 'fa-check');
        
        setTimeout(() => {
            copyIcon.classList.replace('fa-check', 'fa-copy');
        }, 2000);
    };
    
    // Helper function to get current user ID from session
    function getCurrentUserId() {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || {};
        return user.username || 'USER_' + Math.floor(Math.random() * 10000);
    }
    
    // Store transaction in localStorage (simulating database)
    function storeTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('verificationTransactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('verificationTransactions', JSON.stringify(transactions));
        
        // Also add to admin pending approvals
        const pendingApprovals = JSON.parse(localStorage.getItem('pendingApprovals') || '[]');
        pendingApprovals.push({
            ...transaction,
            status: 'pending',
            adminViewed: false
        });
        localStorage.setItem('pendingApprovals', JSON.stringify(pendingApprovals));
    }
    
    // Verify user account in localStorage
    function verifyUserAccount(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === userId);
        
        if (userIndex !== -1) {
            users[userIndex].isVerified = true;
            users[userIndex].verifiedOn = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    
    // Update user session after verification
    function updateUserSession() {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        user.isVerified = true;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
});