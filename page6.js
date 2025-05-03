document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // DOM Elements
    // ======================
    const warningPopup = document.getElementById('warningPopup');
    const closePopup = document.getElementById('closePopup');
    const acceptWarning = document.getElementById('acceptWarning');
    const mainContainer = document.getElementById('mainContainer');
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

    // ======================
    // Warning Popup Functions
    // ======================
    function showWarningPopup() {
        document.body.classList.add('popup-visible');
        warningPopup.style.display = 'flex';
    }

    function closeWarningPopup() {
        document.body.classList.remove('popup-visible');
        warningPopup.style.display = 'none';
    }

    // Initialize popup event listeners
    closePopup.addEventListener('click', closeWarningPopup);
    acceptWarning.addEventListener('click', closeWarningPopup);

    // Show popup on page load
    showWarningPopup();

    // ======================
    // Payment Process Functions
    // ======================
    function initiatePayment() {
        payButton.disabled = true;
        payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        setTimeout(() => {
            payButton.disabled = false;
            payButton.innerHTML = '<i class="fas fa-rupee-sign"></i> Pay ₹21 Now';
            showVerificationSection();
            window.history.pushState({}, '', '?payment=initiated');
        }, 2000);
    }

    function showVerificationSection() {
        paymentSection.classList.add('animate__fadeOut');
        
        setTimeout(() => {
            paymentSection.style.display = 'none';
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            verificationSection.style.display = 'block';
            verificationSection.classList.add('animate__fadeIn');
        }, 500);
    }

    // ======================
    // File Upload Functions
    // ======================
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            
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

    // ======================
    // Verification Functions
    // ======================
    function verifyPayment() {
        const screenshot = screenshotInput.files[0];
        const transactionId = document.getElementById('transactionId').value.trim();
        
        if (!screenshot) {
            alert('Please upload payment screenshot');
            return;
        }
        
        if (!transactionId) {
            alert('Please enter transaction ID');
            return;
        }
        
        verifyButton.disabled = true;
        verifyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        const transactionData = {
            userId: getCurrentUserId(),
            amount: 21,
            transactionId: transactionId,
            screenshot: screenshot.name,
            timestamp: new Date().toISOString()
        };
        
        setTimeout(() => {
            storeTransaction(transactionData);
            verificationSection.classList.add('animate__fadeOut');
            
            setTimeout(() => {
                verificationSection.style.display = 'none';
                pendingSection.style.display = 'block';
                simulateAdminVerification(transactionData);
            }, 500);
        }, 3000);
    }

    function simulateAdminVerification(transactionData) {
        let seconds = 0;
        const statusMessages = [
            "Payment received",
            "Verifying transaction",
            "Checking payment details",
            "Finalizing verification"
        ];
        
        const interval = setInterval(() => {
            statusText.textContent = statusMessages[seconds % statusMessages.length];
            seconds++;
            
            if (seconds >= 3 && (seconds > 5 || Math.random() > 0.7)) {
                clearInterval(interval);
                completeVerification(transactionData);
            }
        }, 1000);
    }

    function completeVerification(transactionData) {
        verifyUserAccount(transactionData.userId);
        statusText.textContent = "Verification Successful!";
        statusText.style.color = "var(--success)";
        
        setTimeout(() => {
            pendingSection.style.display = 'none';
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
            successSection.style.display = 'block';
            updateUserSession();
        }, 1000);
    }

    // ======================
    // Helper Functions
    // ======================
    function checkReturningUser() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('payment')) {
            paymentSection.style.display = 'none';
            document.getElementById('step1').classList.add('active');
            verificationSection.style.display = 'block';
            verificationSection.classList.remove('animate__fadeIn');
        }
        
        if (urlParams.has('verify')) {
            paymentSection.style.display = 'none';
            verificationSection.style.display = 'none';
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            pendingSection.style.display = 'block';
            simulateAdminVerification({ userId: getCurrentUserId() });
        }
    }

    window.copyUpiId = function() {
        upiIdInput.select();
        document.execCommand('copy');
        copyIcon.classList.replace('fa-copy', 'fa-check');
        setTimeout(() => {
            copyIcon.classList.replace('fa-check', 'fa-copy');
        }, 2000);
    };

    function getCurrentUserId() {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        return user.username || 'USER_' + Math.floor(Math.random() * 10000);
    }

    function storeTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('verificationTransactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('verificationTransactions', JSON.stringify(transactions));
        
        const pendingApprovals = JSON.parse(localStorage.getItem('pendingApprovals') || '[]');
        pendingApprovals.push({
            ...transaction,
            status: 'pending',
            adminViewed: false
        });
        localStorage.setItem('pendingApprovals', JSON.stringify(pendingApprovals));
    }

    function verifyUserAccount(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === userId);
        
        if (userIndex !== -1) {
            users[userIndex].isVerified = true;
            users[userIndex].verifiedOn = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    function updateUserSession() {
        const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        user.isVerified = true;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    function goToDashboard() {
        window.location.href = "page7.html";
    }

    // ======================
    // Event Listeners
    // ======================
    payButton.addEventListener('click', initiatePayment);
    verifyButton.addEventListener('click', verifyPayment);
    dashboardButton.addEventListener('click', goToDashboard);
    screenshotInput.addEventListener('change', handleFileUpload);

    // Check if returning user
    checkReturningUser();
});