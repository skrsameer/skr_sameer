document.addEventListener('DOMContentLoaded', function() {
    // Admin Login Functionality
    window.adminLogin = function() {
        const adminId = document.getElementById('adminId').value;
        const password = document.getElementById('adminPassword').value;
        const errorElement = document.getElementById('loginError');
        
        // Hardcoded credentials (in production, use server-side authentication)
        const validAdminId = "@sKr&Sameer#";
        const validPassword = "@sKr#2008";
        
        if(adminId === validAdminId && password === validPassword) {
            // Successful login
            errorElement.style.display = 'none';
            
            // Add animation to login card
            document.querySelector('.login-card').classList.add('animate__fadeOut');
            
            // Show admin panel after animation completes
            setTimeout(() => {
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                
                // Initialize admin panel
                initAdminPanel();
            }, 500);
        } else {
            // Failed login
            errorElement.textContent = "Invalid Admin ID or Password";
            errorElement.style.display = 'block';
            
            // Shake animation for error
            document.querySelector('.login-card').classList.add('animate__shakeX');
            setTimeout(() => {
                document.querySelector('.login-card').classList.remove('animate__shakeX');
            }, 1000);
        }
    };
    
    // Toggle password visibility
    document.querySelector('.toggle-password').addEventListener('click', function() {
        const passwordInput = document.getElementById('adminPassword');
        if(passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
    
    // Initialize Admin Panel
    function initAdminPanel() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link, .menu-item');
        const contentSections = document.querySelectorAll('.content-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Hide all content sections
                contentSections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show the selected section
                const targetSection = this.getAttribute('data-section');
                document.getElementById(targetSection).classList.add('active');
                
                // Close sidebar on mobile
                if(window.innerWidth < 992) {
                    sidebar.classList.remove('active');
                }
                
                // Load data for specific sections
                if(targetSection === 'dashboard') {
                    loadDashboardStats();
                } else if(targetSection === 'verifications') {
                    loadVerifications();
                } else if(targetSection === 'withdrawals') {
                    loadWithdrawals();
                } else if(targetSection === 'users') {
                    loadUsers();
                } else if(targetSection === 'referrals') {
                    loadReferrals();
                } else if(targetSection === 'ads') {
                    loadAds();
                } else if(targetSection === 'reports') {
                    loadReports();
                }
            });
        });
        
        // Notification bell
        const notificationBell = document.querySelector('.notification-bell');
        const notificationPanel = document.querySelector('.notification-panel');
        
        notificationBell.addEventListener('click', function() {
            notificationPanel.classList.toggle('active');
            loadNotifications();
        });
        
        // Close notifications
        document.querySelector('.close-notifications').addEventListener('click', function() {
            notificationPanel.classList.remove('active');
        });
        
        // Mark all as read
        document.querySelector('.mark-all-read').addEventListener('click', function() {
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
                item.classList.add('read');
            });
            updateNotificationCount();
        });
        
        // Modal functionality
        const modals = document.querySelectorAll('.modal');
        const closeModalButtons = document.querySelectorAll('.close-modal');
        
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        window.addEventListener('click', function(e) {
            modals.forEach(modal => {
                if(e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // File upload display
        document.getElementById('adImage').addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
            document.getElementById('fileName').textContent = fileName;
        });
        
        // Initialize charts
        initCharts();
        
        // Load initial data
        loadDashboardStats();
        loadVerifications();
        loadWithdrawals();
        loadUsers();
        loadReferrals();
        loadAds();
        loadNotifications();
        
        // Start simulation in demo mode
        if(window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
            simulateData();
        }
    }
    
    // Initialize charts
    function initCharts() {
        // Earnings Chart
        const earningsCtx = document.getElementById('earningsChart').getContext('2d');
        window.earningsChart = new Chart(earningsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Earnings (₹)',
                    data: [12500, 19000, 15000, 20000, 18000, 22000, 26000],
                    backgroundColor: 'rgba(108, 92, 231, 0.2)',
                    borderColor: 'rgba(108, 92, 231, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '₹' + context.raw.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        
        // User Growth Chart
        const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
        window.userGrowthChart = new Chart(userGrowthCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'New Users',
                    data: [120, 190, 150, 200, 180, 220, 260],
                    backgroundColor: 'rgba(0, 186, 242, 0.7)',
                    borderColor: 'rgba(0, 186, 242, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Earnings Report Chart
        const earningsReportCtx = document.getElementById('earningsReportChart').getContext('2d');
        window.earningsReportChart = new Chart(earningsReportCtx, {
            type: 'pie',
            data: {
                labels: ['Ad Views', 'Referrals', 'Other'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        'rgba(108, 92, 231, 0.7)',
                        'rgba(0, 186, 242, 0.7)',
                        'rgba(253, 121, 168, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ₹' + (context.raw * 100).toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Load dashboard stats
    function loadDashboardStats() {
        // Simulated data - in a real app, fetch from backend
        const stats = {
            totalUsers: 1284,
            activeUsers: 842,
            totalEarnings: 26950,
            pendingVerifications: 5,
            pendingWithdrawals: 3,
            activeAds: 12,
            totalReferrals: 342,
            referralEarnings: 3420
        };
        
        // Update stats cards
        document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
        document.getElementById('totalEarnings').textContent = '₹' + stats.totalEarnings.toLocaleString();
        document.getElementById('activeAds').textContent = stats.activeAds;
        document.querySelector('.menu-item[data-section="verifications"] .badge').textContent = stats.pendingVerifications;
        document.querySelector('.menu-item[data-section="withdrawals"] .badge').textContent = stats.pendingWithdrawals;
        document.getElementById('totalReferrals').textContent = stats.totalReferrals.toLocaleString();
        document.getElementById('referralEarnings').textContent = '₹' + stats.referralEarnings.toLocaleString();
        
        // Load recent activities
        const activities = [
            {
                type: 'user',
                icon: 'user-plus',
                message: 'New user registered: Rajesh Kumar',
                time: '10 minutes ago'
            },
            {
                type: 'verification',
                icon: 'user-check',
                message: 'New verification request from Priya Patel',
                time: '25 minutes ago'
            },
            {
                type: 'withdrawal',
                icon: 'wallet',
                message: 'New withdrawal request: ₹500 from Amit Singh',
                time: '1 hour ago'
            },
            {
                type: 'referral',
                icon: 'user-friends',
                message: 'New referral: Rahul joined using Priya\'s code',
                time: '2 hours ago'
            }
        ];
        
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.message}</p>
                    <small>${activity.time}</small>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }
    
    // Load verification requests
    function loadVerifications() {
        // In a real app, fetch from backend
        const verifications = [
            {
                id: 'VER123',
                userId: 'USER456',
                username: 'rahul_sharma',
                name: 'Rahul Sharma',
                mobile: '9876543210',
                amount: 21,
                transactionId: 'TXN789456123',
                screenshot: 'https://via.placeholder.com/300x600.png?text=Payment+Proof',
                status: 'pending',
                date: new Date().toLocaleString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            },
            {
                id: 'VER124',
                userId: 'USER457',
                username: 'priya_patel',
                name: 'Priya Patel',
                mobile: '8765432109',
                amount: 21,
                transactionId: 'TXN789456124',
                screenshot: 'https://via.placeholder.com/300x600.png?text=Payment+Proof',
                status: 'pending',
                date: new Date(Date.now() - 3600000).toLocaleString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            },
            {
                id: 'VER125',
                userId: 'USER458',
                username: 'amit_singh',
                name: 'Amit Singh',
                mobile: '7654321098',
                amount: 21,
                transactionId: 'TXN789456125',
                screenshot: 'https://via.placeholder.com/300x600.png?text=Payment+Proof',
                status: 'approved',
                date: new Date(Date.now() - 86400000).toLocaleString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            }
        ];
        
        // Filter verifications
        const filter = document.getElementById('verificationFilter').value;
        const search = document.getElementById('verificationSearch').value.toLowerCase();
        
        let filtered = verifications;
        
        if(filter !== 'all') {
            filtered = filtered.filter(v => v.status === filter);
        }
        
        if(search) {
            filtered = filtered.filter(v => 
                v.username.toLowerCase().includes(search) || 
                v.name.toLowerCase().includes(search) ||
                v.mobile.includes(search)
            );
        }
        
        // Update pending count
        const pendingCount = verifications.filter(v => v.status === 'pending').length;
        document.getElementById('pendingVerificationsCount').textContent = pendingCount;
        document.querySelector('.menu-item[data-section="verifications"] .badge').textContent = pendingCount;
        
        // Render list
        const list = document.getElementById('verificationList');
        list.innerHTML = '';
        
        if(filtered.length === 0) {
            list.innerHTML = '<div class="no-results">No verification requests found</div>';
            return;
        }
        
        filtered.forEach(v => {
            const item = document.createElement('div');
            item.className = `verification-item ${v.status}`;
            item.dataset.id = v.id;
            item.innerHTML = `
                <div class="verification-user">
                    <img src="https://ui-avatars.com/api/?name=${v.name.replace(' ', '+')}" alt="${v.name}">
                    <div>
                        <h4>${v.name}</h4>
                        <p>${v.username} | ${v.mobile}</p>
                    </div>
                </div>
                <div class="verification-details">
                    <p><strong>Amount:</strong> ₹${v.amount}</p>
                    <p><strong>TXN ID:</strong> ${v.transactionId}</p>
                    <p><strong>Date:</strong> ${v.date}</p>
                </div>
                <div class="verification-proof">
                    <img src="${v.screenshot}" alt="Payment Proof" onclick="viewVerificationProof('${v.id}')">
                    <button class="view-proof" onclick="viewVerificationProof('${v.id}')">View Full</button>
                </div>
                <div class="verification-actions">
                    <button class="approve-btn" onclick="approveVerification('${v.id}')" ${v.status !== 'pending' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="reject-btn" onclick="rejectVerification('${v.id}')" ${v.status !== 'pending' ? 'disabled' : ''}>
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
            
            if(v.status !== 'pending') {
                const statusBadge = document.createElement('div');
                statusBadge.className = `status-badge ${v.status}`;
                statusBadge.textContent = v.status.charAt(0).toUpperCase() + v.status.slice(1);
                item.querySelector('.verification-actions').innerHTML = '';
                item.querySelector('.verification-actions').appendChild(statusBadge);
            }
            
            list.appendChild(item);
        });
    }
    
    // Load withdrawal requests
    function loadWithdrawals() {
        // In a real app, fetch from backend
        const withdrawals = [
            {
                id: 'WD123',
                userId: 'USER456',
                username: 'rahul_sharma',
                name: 'Rahul Sharma',
                mobile: '9876543210',
                amount: 500,
                upiId: 'rahul@ybl',
                status: 'pending',
                date: new Date().toLocaleString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            },
            {
                id: 'WD124',
                userId: 'USER457',
                username: 'priya_patel',
                name: 'Priya Patel',
                mobile: '8765432109',
                amount: 300,
                upiId: 'priya@ybl',
                status: 'pending',
                date: new Date(Date.now() - 3600000).toLocaleString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            },
            {
                id: 'WD125',
                userId: 'USER458',
                username: 'amit_singh',
                name: 'Amit Singh',
                mobile: '7654321098',
                amount: 1000,
                upiId: 'amit@ybl',
                status: 'approved',
                date: new Date(Date.now() - 86400000).toLocaleString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            }
        ];
        
        // Filter withdrawals
        const filter = document.getElementById('withdrawalFilter').value;
        const search = document.getElementById('withdrawalSearch').value.toLowerCase();
        
        let filtered = withdrawals;
        
        if(filter !== 'all') {
            filtered = filtered.filter(w => w.status === filter);
        }
        
        if(search) {
            filtered = filtered.filter(w => 
                w.username.toLowerCase().includes(search) || 
                w.name.toLowerCase().includes(search) ||
                w.mobile.includes(search)
            );
        }
        
        // Update pending count
        const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
        document.getElementById('pendingWithdrawalsCount').textContent = pendingCount;
        document.querySelector('.menu-item[data-section="withdrawals"] .badge').textContent = pendingCount;
        
        // Render list
        const list = document.getElementById('withdrawalList');
        list.innerHTML = '';
        
        if(filtered.length === 0) {
            list.innerHTML = '<div class="no-results">No withdrawal requests found</div>';
            return;
        }
        
        filtered.forEach(w => {
            const item = document.createElement('div');
            item.className = `withdrawal-item ${w.status}`;
            item.dataset.id = w.id;
            item.innerHTML = `
                <div class="withdrawal-user">
                    <img src="https://ui-avatars.com/api/?name=${w.name.replace(' ', '+')}" alt="${w.name}">
                    <div>
                        <h4>${w.name}</h4>
                        <p>${w.username} | ${w.mobile}</p>
                    </div>
                </div>
                <div class="withdrawal-details">
                    <p><strong>Amount:</strong> ₹${w.amount}</p>
                    <p><strong>UPI ID:</strong> ${w.upiId}</p>
                    <p><strong>Date:</strong> ${w.date}</p>
                </div>
                <div class="withdrawal-actions">
                    <button class="approve-btn" onclick="approveWithdrawal('${w.id}')" ${w.status !== 'pending' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="reject-btn" onclick="rejectWithdrawal('${w.id}')" ${w.status !== 'pending' ? 'disabled' : ''}>
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
            
            if(w.status !== 'pending') {
                const statusBadge = document.createElement('div');
                statusBadge.className = `status-badge ${w.status}`;
                statusBadge.textContent = w.status.charAt(0).toUpperCase() + w.status.slice(1);
                item.querySelector('.withdrawal-actions').innerHTML = '';
                item.querySelector('.withdrawal-actions').appendChild(statusBadge);
            }
            
            list.appendChild(item);
        });
    }
    
    // Load users
    function loadUsers() {
        // In a real app, fetch from backend
        const users = [
            {
                id: 'USER456',
                username: 'rahul_sharma',
                name: 'Rahul Sharma',
                mobile: '9876543210',
                email: 'rahul@example.com',
                verified: true,
                referralCode: 'RAHUL123',
                joinDate: new Date(Date.now() - 86400000 * 7).toLocaleDateString('en-IN'),
                lastActive: '2 hours ago'
            },
            {
                id: 'USER457',
                username: 'priya_patel',
                name: 'Priya Patel',
                mobile: '8765432109',
                email: 'priya@example.com',
                verified: true,
                referralCode: 'PRIYA456',
                joinDate: new Date(Date.now() - 86400000 * 3).toLocaleDateString('en-IN'),
                lastActive: '30 minutes ago'
            },
            {
                id: 'USER458',
                username: 'amit_singh',
                name: 'Amit Singh',
                mobile: '7654321098',
                email: 'amit@example.com',
                verified: false,
                referralCode: 'AMIT789',
                joinDate: new Date(Date.now() - 86400000).toLocaleDateString('en-IN'),
                lastActive: '5 hours ago'
            }
        ];
        
        // Filter users
        const filter = document.getElementById('userFilter').value;
        const search = document.getElementById('userSearch').value.toLowerCase();
        
        let filtered = users;
        
        if(filter === 'verified') {
            filtered = filtered.filter(u => u.verified);
        } else if(filter === 'unverified') {
            filtered = filtered.filter(u => !u.verified);
        } else if(filter === 'active') {
            filtered = filtered.filter(u => u.lastActive.includes('minute') || u.lastActive.includes('hour'));
        } else if(filter === 'inactive') {
            filtered = filtered.filter(u => u.lastActive.includes('day') || u.lastActive.includes('week'));
        }
        
        if(search) {
            filtered = filtered.filter(u => 
                u.username.toLowerCase().includes(search) || 
                u.name.toLowerCase().includes(search) ||
                u.mobile.includes(search) ||
                u.email.toLowerCase().includes(search)
            );
        }
        
        // Render list
        const list = document.getElementById('usersList');
        list.innerHTML = '';
        
        if(filtered.length === 0) {
            list.innerHTML = '<div class="no-results">No users found</div>';
            return;
        }
        
        filtered.forEach(u => {
            const item = document.createElement('div');
            item.className = 'user-item';
            item.innerHTML = `
                <div class="user-info">
                    <img src="https://ui-avatars.com/api/?name=${u.name.replace(' ', '+')}" alt="${u.name}">
                    <div>
                        <h4>${u.name} <span class="status-badge ${u.verified ? 'approved' : 'pending'}">${u.verified ? 'Verified' : 'Unverified'}</span></h4>
                        <p>${u.username} | ${u.mobile} | ${u.email}</p>
                        <small>Joined: ${u.joinDate} | Last active: ${u.lastActive}</small>
                    </div>
                </div>
                <div class="user-details">
                    <p><strong>Referral Code:</strong> ${u.referralCode}</p>
                    <div class="user-actions">
                        <button class="action-btn" onclick="viewUser('${u.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn ${u.verified ? 'danger' : 'success'}" onclick="${u.verified ? 'revokeVerification' : 'verifyUser'}('${u.id}')">
                            <i class="fas fa-${u.verified ? 'times' : 'check'}"></i> ${u.verified ? 'Revoke' : 'Verify'}
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(item);
        });
    }
    
    // Load referrals
    function loadReferrals() {
        // In a real app, fetch from backend
        const referrals = [
            {
                referrer: 'rahul_sharma',
                referee: 'priya_patel',
                date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-IN'),
                earnings: 10,
                status: 'completed'
            },
            {
                referrer: 'priya_patel',
                referee: 'amit_singh',
                date: new Date(Date.now() - 86400000).toLocaleDateString('en-IN'),
                earnings: 10,
                status: 'completed'
            },
            {
                referrer: 'rahul_sharma',
                referee: 'neha_verma',
                date: new Date().toLocaleDateString('en-IN'),
                earnings: 10,
                status: 'pending'
            }
        ];
        
        // Filter referrals
        const search = document.getElementById('referralSearch').value.toLowerCase();
        
        let filtered = referrals;
        
        if(search) {
            filtered = filtered.filter(r => 
                r.referrer.toLowerCase().includes(search) || 
                r.referee.toLowerCase().includes(search)
            );
        }
        
        // Render list
        const list = document.getElementById('referralList');
        list.innerHTML = '';
        
        if(filtered.length === 0) {
            list.innerHTML = '<div class="no-results">No referrals found</div>';
            return;
        }
        
        filtered.forEach(r => {
            const item = document.createElement('div');
            item.className = 'referral-item';
            item.innerHTML = `
                <div class="referral-user">
                    <div>
                        <p><strong>Referrer:</strong> ${r.referrer}</p>
                        <p><strong>Referee:</strong> ${r.referee}</p>
                    </div>
                </div>
                <div class="referral-details">
                    <p><strong>Date:</strong> ${r.date}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${r.status}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></p>
                </div>
                <div class="referral-earnings">
                    ₹${r.earnings}
                </div>
            `;
            list.appendChild(item);
        });
    }
    
    // Load ads
    function loadAds() {
        // In a real app, fetch from backend
        const ads = [
            {
                id: 'AD123',
                title: 'Summer Sale',
                image: 'https://via.placeholder.com/300x200.png?text=Summer+Sale',
                url: 'https://example.com/summer-sale',
                duration: 7,
                views: 1245,
                status: 'active',
                startDate: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-IN'),
                endDate: new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-IN')
            },
            {
                id: 'AD124',
                title: 'New Collection',
                image: 'https://via.placeholder.com/300x200.png?text=New+Collection',
                url: 'https://example.com/new-collection',
                duration: 14,
                views: 842,
                status: 'active',
                startDate: new Date(Date.now() - 86400000 * 5).toLocaleDateString('en-IN'),
                endDate: new Date(Date.now() + 86400000 * 9).toLocaleDateString('en-IN')
            },
            {
                id: 'AD125',
                title: 'Special Offer',
                image: 'https://via.placeholder.com/300x200.png?text=Special+Offer',
                url: 'https://example.com/special-offer',
                duration: 10,
                views: 0,
                status: 'pending',
                startDate: '',
                endDate: ''
            }
        ];
        
        // Filter ads
        const activeCount = ads.filter(a => a.status === 'active').length;
        const pendingCount = ads.filter(a => a.status === 'pending').length;
        
        document.getElementById('activeAdCount').textContent = activeCount;
        document.getElementById('pendingAdCount').textContent = pendingCount;
        document.getElementById('totalAdCount').textContent = ads.length;
        
        // Render grid
        const grid = document.getElementById('adsGrid');
        grid.innerHTML = '';
        
        ads.forEach(ad => {
            const item = document.createElement('div');
            item.className = 'ad-item';
            item.innerHTML = `
                <div class="ad-image">
                    <img src="${ad.image}" alt="${ad.title}">
                    <div class="ad-views">
                        <i class="fas fa-eye"></i> ${ad.views}
                    </div>
                </div>
                <div class="ad-info">
                    <h4>${ad.title}</h4>
                    <span class="ad-status ${ad.status}">${ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}</span>
                    <p>${ad.url}</p>
                    ${ad.startDate ? `<p><small>Runs from ${ad.startDate} to ${ad.endDate}</small></p>` : ''}
                </div>
                <div class="ad-actions">
                    <button class="edit-btn" onclick="editAd('${ad.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteAd('${ad.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            grid.appendChild(item);
        });
    }
    
    // Load notifications
    function loadNotifications() {
        // In a real app, fetch from backend
        const notifications = [
            {
                id: 'NOTIF123',
                type: 'verification',
                message: 'New verification request from Rahul Sharma',
                time: '10 minutes ago',
                read: false
            },
            {
                id: 'NOTIF124',
                type: 'withdrawal',
                message: 'New withdrawal request of ₹500 from Priya Patel',
                time: '25 minutes ago',
                read: false
            },
            {
                id: 'NOTIF125',
                type: 'referral',
                message: 'New referral: Amit joined using Rahul\'s code',
                time: '1 hour ago',
                read: true
            }
        ];
        
        // Render list
        const list = document.getElementById('notificationList');
        list.innerHTML = '';
        
        notifications.forEach(n => {
            const item = document.createElement('div');
            item.className = `notification-item ${n.read ? 'read' : 'unread'}`;
            item.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-${n.type === 'verification' ? 'user-check' : n.type === 'withdrawal' ? 'wallet' : 'user-friends'}"></i>
                </div>
                <div class="notification-content">
                    <p>${n.message}</p>
                    <small>${n.time}</small>
                </div>
            `;
            list.appendChild(item);
        });
        
        updateNotificationCount();
    }
    
    // Update notification count
    function updateNotificationCount() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        document.querySelector('.notification-count').textContent = unreadCount;
    }
    
    // Load reports
    function loadReports() {
        // Charts are already initialized
        // Additional report data can be loaded here
    }
    
    // Show ad form
    window.showAdForm = function() {
        document.getElementById('adModal').style.display = 'flex';
    };
    
    // View verification proof
    window.viewVerificationProof = function(verificationId) {
        // In a real app, fetch verification details from backend
        const verification = {
            id: verificationId,
            userId: 'USER456',
            username: 'rahul_sharma',
            name: 'Rahul Sharma',
            mobile: '9876543210',
            amount: 21,
            transactionId: 'TXN789456123',
            screenshot: 'https://via.placeholder.com/300x600.png?text=Payment+Proof',
            date: new Date().toLocaleString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        document.getElementById('verificationProofImage').src = verification.screenshot;
        document.getElementById('verificationDetails').innerHTML = `
            <p><span>User:</span> <span>${verification.name} (${verification.username})</span></p>
            <p><span>Mobile:</span> <span>${verification.mobile}</span></p>
            <p><span>Amount:</span> <span>₹${verification.amount}</span></p>
            <p><span>Transaction ID:</span> <span>${verification.transactionId}</span></p>
            <p><span>Date:</span> <span>${verification.date}</span></p>
        `;
        
        document.getElementById('modalVerifyApproveBtn').onclick = function() {
            approveVerification(verification.id);
            document.getElementById('verificationModal').style.display = 'none';
        };
        
        document.getElementById('modalVerifyRejectBtn').onclick = function() {
            rejectVerification(verification.id);
            document.getElementById('verificationModal').style.display = 'none';
        };
        
        document.getElementById('verificationModal').style.display = 'flex';
    };
    
    // Approve verification
    window.approveVerification = function(verificationId) {
        // In a real app, send approval to backend
        alert(`Verification ${verificationId} approved!`);
        loadVerifications();
        loadDashboardStats();
        addNotification(`Approved verification for ID: ${verificationId}`);
    };
    
    // Reject verification
    window.rejectVerification = function(verificationId) {
        // In a real app, send rejection to backend
        alert(`Verification ${verificationId} rejected!`);
        loadVerifications();
        loadDashboardStats();
        addNotification(`Rejected verification for ID: ${verificationId}`);
    };
    
    // Approve withdrawal
    window.approveWithdrawal = function(withdrawalId) {
        // In a real app, send approval to backend
        alert(`Withdrawal ${withdrawalId} approved!`);
        loadWithdrawals();
        loadDashboardStats();
        addNotification(`Approved withdrawal for ID: ${withdrawalId}`);
    };
    
    // Reject withdrawal
    window.rejectWithdrawal = function(withdrawalId) {
        // In a real app, send rejection to backend
        alert(`Withdrawal ${withdrawalId} rejected!`);
        loadWithdrawals();
        loadDashboardStats();
        addNotification(`Rejected withdrawal for ID: ${withdrawalId}`);
    };
    
    // View user
    window.viewUser = function(userId) {
        // In a real app, fetch user details from backend
        alert(`Viewing user ${userId}`);
    };
    
    // Verify user
    window.verifyUser = function(userId) {
        // In a real app, send verification to backend
        alert(`User ${userId} verified!`);
        loadUsers();
        addNotification(`Verified user ID: ${userId}`);
    };
    
    // Revoke verification
    window.revokeVerification = function(userId) {
        // In a real app, send revocation to backend
        alert(`Verification revoked for user ${userId}!`);
        loadUsers();
        addNotification(`Revoked verification for user ID: ${userId}`);
    };
    
    // Edit ad
    window.editAd = function(adId) {
        // In a real app, load ad data into form
        alert(`Editing ad ${adId}`);
    };
    
    // Delete ad
    window.deleteAd = function(adId) {
        // In a real app, send delete request to backend
        if(confirm('Are you sure you want to delete this ad?')) {
            alert(`Ad ${adId} deleted!`);
            loadAds();
            addNotification(`Deleted ad ID: ${adId}`);
        }
    };
    
    // Export data
    window.exportData = function(type) {
        // In a real app, generate and download export file
        alert(`Exporting ${type} data`);
        addNotification(`Exported ${type} data`);
    };
    
    // Save settings
    window.saveSettings = function() {
        const minWithdrawal = document.getElementById('minWithdrawal').value;
        const referralBonus = document.getElementById('referralBonus').value;
        const adsLimit = document.getElementById('adsLimit').value;
        const earningsPerAd = document.getElementById('earningsPerAd').value;
        
        // In a real app, send settings to backend
        alert(`Settings saved!\nMin Withdrawal: ₹${minWithdrawal}\nReferral Bonus: ₹${referralBonus}\nAds Limit: ${adsLimit}\nEarnings Per Ad: ₹${earningsPerAd}`);
        addNotification('Settings updated');
    };
    
    // Add notification
    function addNotification(message) {
        // In a real app, send to backend
        const notificationsPanel = document.getElementById('notificationList');
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item unread';
        notificationItem.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="notification-content">
                <p>${message}</p>
                <small>Just now</small>
            </div>
        `;
        notificationsPanel.insertBefore(notificationItem, notificationsPanel.firstChild);
        updateNotificationCount();
    }
    
    // Simulate data changes for demo
    function simulateData() {
        // Simulate new verification every 30 seconds
        setInterval(() => {
            const verifications = [
                {
                    name: ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Neha Verma', 'Rajesh Kumar'][Math.floor(Math.random() * 5)],
                    amount: 21,
                    transactionId: 'TXN' + Math.floor(100000000 + Math.random() * 900000000)
                }
            ];
            
            const verification = verifications[0];
            addNotification(`New verification request from ${verification.name} (₹${verification.amount})`);
            loadVerifications();
            loadDashboardStats();
        }, 30000);
        
        // Simulate new withdrawal every 45 seconds
        setInterval(() => {
            const withdrawals = [
                {
                    name: ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Neha Verma', 'Rajesh Kumar'][Math.floor(Math.random() * 5)],
                    amount: [100, 200, 300, 500, 1000][Math.floor(Math.random() * 5)],
                    upiId: ['ybl', 'oksbi', 'axl', 'paytm'][Math.floor(Math.random() * 4)]
                }
            ];
            
            const withdrawal = withdrawals[0];
            addNotification(`New withdrawal request from ${withdrawal.name} (₹${withdrawal.amount})`);
            loadWithdrawals();
            loadDashboardStats();
        }, 45000);
        
        // Simulate new referral every 60 seconds''
        setInterval(() => {
            const referrals = [
                {
                    referrer: ['rahul_sharma', 'priya_patel', 'amit_singh'][Math.floor(Math.random() * 3)],
                    referee: ['neha_verma', 'rajesh_kumar', 'suresh_reddy'][Math.floor(Math.random() * 3)],
                    earnings: 10
                }
            ];
            
            const referral = referrals[0];
            addNotification(`New referral: ${referral.referee} joined using ${referral.referrer}'s code`);
            loadReferrals();
            loadDashboardStats();
        }, 60000);
    }
});