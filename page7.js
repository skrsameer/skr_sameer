document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const watchAdsBtn = document.getElementById('watchAdsBtn');
    const startAdBtn = document.getElementById('startAdBtn');
    const claimBtn = document.getElementById('claimBtn');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const shareBtn = document.getElementById('shareBtn');
    const withdrawBtn = document.getElementById('withdrawBtn');
    const confirmWithdrawBtn = document.getElementById('confirmWithdrawBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfilePic = document.getElementById('editProfilePic');
    const withdrawalModal = document.getElementById('withdrawalModal');
    const closeModal = document.querySelector('.close-modal');
    
    // Load user data from localStorage
    let userData = JSON.parse(localStorage.getItem('currentUser')) || {
        name: "John Doe",
        username: "user" + Math.floor(1000 + Math.random() * 9000),
        phone: "+91 9876543210",
        joinDate: new Date().toLocaleDateString(),
        isVerified: false,
        walletBalance: 0,
        totalEarnings: 0,
        adsWatched: 0,
        dailyAds: 0,
        referrals: 0,
        referralEarnings: 0,
        referralCode: "SKR" + Math.floor(1000 + Math.random() * 9000)
    };
    
    // Initialize the app
    function initApp() {
        // Update user data display
        updateUserData();
        
        // Load ads
        loadAvailableAds();
        
        // Load ad history
        loadAdHistory();
        
        // Load referrals
        loadReferrals();
        
        // Load withdrawal history
        loadWithdrawalHistory();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Update user data display
    function updateUserData() {
        // Profile tab
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userUsername').textContent = userData.username;
        document.getElementById('userMobile').textContent = userData.phone;
        document.getElementById('joinDate').textContent = userData.joinDate;
        document.getElementById('referralCodeDisplay').textContent = userData.referralCode;
        document.getElementById('referralName').textContent = `(${userData.name})`;
        
        // Dashboard tab
        document.getElementById('walletBalance').textContent = `₹${userData.walletBalance.toFixed(2)}`;
        document.getElementById('totalEarnings').textContent = `₹${userData.totalEarnings.toFixed(2)}`;
        document.getElementById('totalAds').textContent = userData.adsWatched;
        document.getElementById('dailyProgress').textContent = `${userData.dailyAds}/10`;
        document.getElementById('progressFill').style.width = `${userData.dailyAds * 10}%`;
        
        // Wallet tab
        document.getElementById('walletBalanceAmount').textContent = `₹${userData.walletBalance.toFixed(2)}`;
        
        // Referral tab
        document.getElementById('totalReferrals').textContent = userData.referrals;
        document.getElementById('referralEarnings').textContent = `₹${userData.referralEarnings.toFixed(2)}`;
        
        // Update verification status
        updateVerificationStatus();
        
        // Enable/disable claim button
        if (userData.dailyAds >= 10) {
            claimBtn.classList.remove('disabled');
        } else {
            claimBtn.classList.add('disabled');
        }
    }
    
    // Update verification status
    function updateVerificationStatus() {
        const verificationBadge = document.getElementById('verificationBadge');
        const verifySection = document.getElementById('verifySection');
        
        if (userData.isVerified) {
            verificationBadge.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
            verificationBadge.className = 'verification-badge verified';
            verifySection.style.display = 'none';
        } else {
            verificationBadge.innerHTML = '<i class="fas fa-times-circle"></i> Not Verified';
            verificationBadge.className = 'verification-badge not-verified';
            verifySection.style.display = 'block';
        }
    }
    
    // Load available ads
    function loadAvailableAds() {
        const adSlotsContainer = document.getElementById('adSlotsContainer');
        const now = new Date();
        const currentHour = now.getHours();
        
        // Clear existing ads
        adSlotsContainer.innerHTML = '';
        
        // Generate ads based on current time
        for (let i = 0; i < 5; i++) {
            const adHour = currentHour + i;
            const adTime = `${adHour % 12 || 12}:00 ${adHour < 12 ? 'AM' : 'PM'}`;
            
            const adSlot = document.createElement('div');
            adSlot.className = i === 0 ? 'ad-slot' : 'ad-slot coming-soon';
            
            adSlot.innerHTML = `
                <div class="ad-info">
                    <div class="ad-time">${adTime}</div>
                    <div class="ad-reward">₹0.20</div>
                </div>
                ${i === 0 ? 
                    '<button class="watch-btn">Watch Now</button>' : 
                    '<div class="ad-status">Coming Soon</div>'
                }
            `;
            
            adSlotsContainer.appendChild(adSlot);
        }
        
        // Add event listener to watch buttons
        document.querySelectorAll('.watch-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Switch to ads tab
                switchTab('ads');
            });
        });
    }
    
    // Load ad history
    function loadAdHistory() {
        const adHistoryList = document.getElementById('adHistoryList');
        const adHistory = JSON.parse(localStorage.getItem('adHistory')) || [];
        
        if (adHistory.length === 0) {
            adHistoryList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No ads watched yet</p>
                </div>
            `;
        } else {
            adHistoryList.innerHTML = '';
            adHistory.slice(0, 5).forEach(ad => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-details">
                        <span>Ad watched at ${ad.time}</span>
                        <small>${ad.date}</small>
                    </div>
                    <div class="history-amount">+₹${ad.amount.toFixed(2)}</div>
                `;
                adHistoryList.appendChild(historyItem);
            });
        }
    }
    
    // Load referrals
    function loadReferrals() {
        const referralsList = document.getElementById('referralsList');
        const referrals = JSON.parse(localStorage.getItem('referrals')) || [];
        
        if (referrals.length === 0) {
            referralsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No referrals yet</p>
                </div>
            `;
        } else {
            referralsList.innerHTML = '';
            referrals.slice(0, 5).forEach(ref => {
                const referralItem = document.createElement('div');
                referralItem.className = 'referral-item';
                referralItem.innerHTML = `
                    <div>
                        <span class="referral-name">${ref.name}</span>
                        <span class="referral-date">${ref.date}</span>
                    </div>
                    <span class="referral-status ${ref.status === 'verified' ? 'status-verified' : 'status-pending'}">
                        ${ref.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                `;
                referralsList.appendChild(referralItem);
            });
        }
    }
    
    // Load withdrawal history
    function loadWithdrawalHistory() {
        const withdrawalHistoryList = document.getElementById('withdrawalHistoryList');
        const withdrawals = JSON.parse(localStorage.getItem('withdrawals')) || [];
        
        if (withdrawals.length === 0) {
            withdrawalHistoryList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No withdrawals yet</p>
                </div>
            `;
        } else {
            withdrawalHistoryList.innerHTML = '';
            withdrawals.slice(0, 5).forEach(withdrawal => {
                const withdrawalItem = document.createElement('div');
                withdrawalItem.className = 'withdrawal-item';
                withdrawalItem.innerHTML = `
                    <div class="withdrawal-details">
                        <span>Withdrawal to ${withdrawal.upiId}</span>
                        <small class="withdrawal-date">${withdrawal.date}</small>
                    </div>
                    <div>
                        <div class="withdrawal-amount">₹${withdrawal.amount.toFixed(2)}</div>
                        <span class="withdrawal-status ${withdrawal.status === 'approved' ? 'status-approved' : 
                            withdrawal.status === 'rejected' ? 'status-rejected' : 'status-pending'}">
                            ${withdrawal.status === 'approved' ? 'Approved' : 
                              withdrawal.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                    </div>
                `;
                withdrawalHistoryList.appendChild(withdrawalItem);
            });
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Tab switching
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
        
        // Watch ads button
        watchAdsBtn.addEventListener('click', function() {
            switchTab('ads');
        });
        
        // Start ad button
        startAdBtn.addEventListener('click', startAd);
        
        // Claim bonus button
        claimBtn.addEventListener('click', claimBonus);
        
        // Copy referral code
        copyCodeBtn.addEventListener('click', copyReferralCode);
        
        // Share referral link
        shareBtn.addEventListener('click', shareReferralLink);
        
        // Withdraw button
        withdrawBtn.addEventListener('click', showWithdrawalConfirmation);
        
        // Confirm withdrawal
        confirmWithdrawBtn.addEventListener('click', processWithdrawal);
        
        // Logout button
        logoutBtn.addEventListener('click', logout);
        
        // Edit profile picture
        editProfilePic.addEventListener('click', editProfilePicture);
        
        // Close modal
        closeModal.addEventListener('click', function() {
            withdrawalModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === withdrawalModal) {
                withdrawalModal.style.display = 'none';
            }
        });
    }
    
    // Switch tabs
    function switchTab(tabId) {
        // Update active nav item
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            }
        });
        
        // Update active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    }
    
    // Start ad
    function startAd() {
        const adTimer = document.getElementById('adTimer');
        let seconds = 30;
        
        startAdBtn.disabled = true;
        startAdBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Watching...';
        
        const timer = setInterval(() => {
            seconds--;
            adTimer.textContent = `${seconds}s`;
            
            if (seconds <= 0) {
                clearInterval(timer);
                completeAd();
            }
        }, 1000);
    }
    
    // Complete ad
    function completeAd() {
        // Update user data
        userData.adsWatched++;
        userData.dailyAds++;
        userData.totalEarnings += 0.20;
        userData.walletBalance += 0.20;
        
        // Add to ad history
        const now = new Date();
        const adHistory = JSON.parse(localStorage.getItem('adHistory')) || [];
        adHistory.unshift({
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            amount: 0.20
        });
        localStorage.setItem('adHistory', JSON.stringify(adHistory));
        
        // Update UI
        updateUserData();
        loadAdHistory();
        
        // Reset ad timer
        document.getElementById('adTimer').textContent = '30s';
        startAdBtn.disabled = false;
        startAdBtn.innerHTML = 'Start Ad';
        
        // Show success message
        alert('You earned ₹0.20 for watching this ad!');
    }
    
    // Claim bonus
    function claimBonus() {
        if (userData.dailyAds >= 10) {
            // Update user data
            userData.walletBalance += 2;
            userData.totalEarnings += 2;
            userData.dailyAds = 0;
            
            // Update UI
            updateUserData();
            
            // Show success message
            alert('₹2 bonus claimed and added to your wallet!');
        }
    }
    
    // Copy referral code
    function copyReferralCode() {
        navigator.clipboard.writeText(userData.referralCode).then(() => {
            const originalText = copyCodeBtn.innerHTML;
            copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyCodeBtn.innerHTML = originalText;
            }, 2000);
        });
    }
    
    // Share referral link
    function shareReferralLink() {
        const shareText = `Join EarnWithSKR using my referral code ${userData.referralCode} and earn money together!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'EarnWithSKR',
                text: shareText,
                url: 'https://earnwithskr.com'
            }).catch(err => {
                console.log('Error sharing:', err);
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
    }
    
    // Fallback for share
    function fallbackShare(text) {
        prompt('Copy this referral link:', text);
    }
    
    // Show withdrawal confirmation
    function showWithdrawalConfirmation() {
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const upiId = document.getElementById('upiId').value.trim();
        
        // Validate inputs
        if (!amount || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (amount < 110) {
            alert('Minimum withdrawal amount is ₹110');
            return;
        }
        
        if (amount > userData.walletBalance) {
            alert('Insufficient balance');
            return;
        }
        
        if (!upiId.includes('@')) {
            alert('Please enter a valid UPI ID');
            return;
        }
        
        // Show confirmation modal
        document.getElementById('confirmAmount').textContent = `₹${amount.toFixed(2)}`;
        document.getElementById('confirmUpiId').textContent = upiId;
        withdrawalModal.style.display = 'flex';
    }
    
    // Process withdrawal
    function processWithdrawal() {
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const upiId = document.getElementById('upiId').value.trim();
        
        // Update user data
        userData.walletBalance -= amount;
        
        // Add to withdrawal history
        const now = new Date();
        const withdrawals = JSON.parse(localStorage.getItem('withdrawals')) || [];
        withdrawals.unshift({
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            amount: amount,
            upiId: upiId,
            status: 'pending'
        });
        localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
        
        // Submit to admin for approval
        submitWithdrawalRequest({
            userId: userData.username,
            amount: amount,
            upiId: upiId,
            date: now.toISOString()
        });
        
        // Update UI
        updateUserData();
        loadWithdrawalHistory();
        
        // Clear form
        document.getElementById('withdrawAmount').value = '';
        document.getElementById('upiId').value = '';
        
        // Close modal
        withdrawalModal.style.display = 'none';
        
        // Show success message
        alert(`Withdrawal request of ₹${amount.toFixed(2)} submitted for admin approval!`);
    }
    
    // Submit withdrawal request
    function submitWithdrawalRequest(withdrawalData) {
        const pendingWithdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals')) || [];
        pendingWithdrawals.push(withdrawalData);
        localStorage.setItem('pendingWithdrawals', JSON.stringify(pendingWithdrawals));
    }
    
    // Edit profile picture
    function editProfilePicture() {
        alert('Profile picture upload functionality will be added soon!');
    }
    
    // Logout
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session data
            localStorage.removeItem('currentUser');
            
            // Redirect to login page
            window.location.href = 'page4.html';
        }
    }
    
    // Admin redirect function
    window.redirectToAdminPanel = function() {
        window.location.href = "Admin Panel.html";
    };
    
    // Initialize the app
    initApp();
});