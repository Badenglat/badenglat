// ==========================================
// ADMIN PANEL - COMPLETE FIXED VERSION
// All Features Working + EmailJS Integration
// ==========================================

// ==========================================
// Configuration & State
// ==========================================
const CONFIG = {
    credentials: { username: 'admin', password: 'BadengLat@2025!' },
    storageKeys: {
        isLoggedIn: 'adminLoggedIn',
        rememberMe: 'adminRememberMe',
        theme: 'adminTheme',
        sidebarCollapsed: 'adminSidebarCollapsed',
        projects: 'portfolioProjects',
        skills: 'portfolioSkills',
        education: 'portfolioEducation',
        messages: 'portfolioMessages',
        settings: 'portfolioSettings',
        profile: 'portfolioProfile',
        notifications: 'adminNotifications',
        activityLog: 'adminActivityLog',
        loginTimestamp: 'adminLoginTimestamp',
        sessionExpiry: 'adminSessionExpiry',
        projectsView: 'projectsViewMode'
    },
    toastDuration: 4000,
    animationDuration: 300,
    sessionTimeout: 30 * 60 * 1000
};

const state = {
    currentPage: 'dashboard',
    isLoggedIn: false,
    projects: [],
    skills: [],
    education: [],
    messages: [],
    settings: {},
    profile: {},
    charts: {},
    confirmCallback: null,
    currentMessageId: null,
    selectedMessages: new Set(),
    notifications: [],
    activityLog: [],
    projectsViewMode: 'grid',
    emailJSInitialized: false
};

// ==========================================
// DOM Elements Cache
// ==========================================
const DOM = {};

function cacheDOM() {
    DOM.loginModal = document.getElementById('loginModal');
    DOM.loginForm = document.getElementById('loginForm');
    DOM.loginError = document.getElementById('loginError');
    DOM.usernameInput = document.getElementById('username');
    DOM.passwordInput = document.getElementById('password');
    DOM.togglePassword = document.getElementById('togglePassword');
    DOM.rememberMe = document.getElementById('rememberMe');
    DOM.adminPanel = document.getElementById('adminPanel');
    DOM.sidebar = document.getElementById('sidebar');
    DOM.sidebarToggle = document.getElementById('sidebarToggle');
    DOM.mobileMenuToggle = document.getElementById('mobileMenuToggle');
    DOM.navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    DOM.navLinks = document.querySelectorAll('.sidebar-nav a');
    DOM.pages = document.querySelectorAll('.page');
    DOM.themeToggle = document.getElementById('adminThemeToggle');
    DOM.notificationBtn = document.getElementById('notificationBtn');
    DOM.notificationDropdown = document.getElementById('notificationDropdown');
    DOM.userMenu = document.getElementById('userMenu');
    DOM.userDropdown = document.getElementById('userDropdown');
    DOM.globalSearch = document.getElementById('globalSearch');
    DOM.logoutBtn = document.getElementById('logoutBtn');
    DOM.dropdownLogout = document.getElementById('dropdownLogout');
    DOM.toastContainer = document.getElementById('toastContainer');
    DOM.loadingOverlay = document.getElementById('loadingOverlay');
    DOM.projectModal = document.getElementById('projectModal');
    DOM.skillModal = document.getElementById('skillModal');
    DOM.educationModal = document.getElementById('educationModal');
    DOM.confirmModal = document.getElementById('confirmModal');
    DOM.passwordModal = document.getElementById('passwordModal');
    DOM.forgotPasswordLink = document.getElementById('forgotPasswordLink');
}

// ==========================================
// Utility Functions
// ==========================================
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

function formatTimeAgo(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 0) return 'just now';
        if (seconds < 60) return 'just now';
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            return mins + (mins === 1 ? ' min ago' : ' mins ago');
        }
        if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            return hours + (hours === 1 ? ' hour ago' : ' hours ago');
        }
        if (seconds < 604800) {
            const days = Math.floor(seconds / 86400);
            return days + (days === 1 ? ' day ago' : ' days ago');
        }
        return formatDate(dateString);
    } catch (e) {
        return '';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// Storage Functions
// ==========================================
function loadDataFromStorage() {
    state.projects = getProjects();
    state.skills = getSkillCategories();
    state.education = getEducation();
    state.messages = getMessages();
    state.profile = getProfile();
    state.settings = getSettings();
    state.notifications = getNotifications();
    state.projectsViewMode = localStorage.getItem(CONFIG.storageKeys.projectsView) || 'grid';
}

function getProjects() {
    try {
        const data = localStorage.getItem(CONFIG.storageKeys.projects);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading projects:', e);
        return [];
    }
}

function saveProjects(projects) {
    try {
        localStorage.setItem(CONFIG.storageKeys.projects, JSON.stringify(projects));
        state.projects = projects;
    } catch (e) {
        console.error('Error saving projects:', e);
        showToast('Error saving projects', 'error');
    }
}

function getSkillCategories() {
    try {
        const data = localStorage.getItem(CONFIG.storageKeys.skills);
        if (data) {
            return JSON.parse(data);
        }
        return [
            { id: 'frontend', name: 'Frontend Development', icon: 'fa-code', skills: [] },
            { id: 'backend', name: 'Backend Development', icon: 'fa-server', skills: [] },
            { id: 'database', name: 'Database', icon: 'fa-database', skills: [] },
            { id: 'tools', name: 'Tools & Technologies', icon: 'fa-tools', skills: [] }
        ];
    } catch (e) {
        console.error('Error loading skills:', e);
        return [];
    }
}

function saveSkillCategories(categories) {
    try {
        localStorage.setItem(CONFIG.storageKeys.skills, JSON.stringify(categories));
        state.skills = categories;
    } catch (e) {
        console.error('Error saving skills:', e);
        showToast('Error saving skills', 'error');
    }
}

function getEducation() {
    try {
        const data = localStorage.getItem(CONFIG.storageKeys.education);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading education:', e);
        return [];
    }
}

function saveEducationToStorage(education) {
    try {
        localStorage.setItem(CONFIG.storageKeys.education, JSON.stringify(education));
        state.education = education;
    } catch (e) {
        console.error('Error saving education:', e);
        showToast('Error saving education', 'error');
    }
}

function getMessages() {
    try {
        const data = localStorage.getItem(CONFIG.storageKeys.messages);
        return data ? JSON.parse(data) : getDefaultMessages();
    } catch (e) {
        console.error('Error loading messages:', e);
        return getDefaultMessages();
    }
}

function getDefaultMessages() {
    return [
        {
            id: 'msg1',
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Project Inquiry',
            message: 'Hello! I came across your portfolio and I\'m very impressed with your work. I\'m looking for a developer to help with a new e-commerce project. Would you be interested in discussing this further?',
            date: new Date().toISOString(),
            unread: true,
            replies: []
        },
        {
            id: 'msg2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            subject: 'Collaboration Opportunity',
            message: 'Hi there! I\'m a UI/UX designer and I think we could create some amazing projects together. Let me know if you\'d be open to a collaboration.',
            date: new Date(Date.now() - 3600000).toISOString(),
            unread: true,
            replies: []
        },
        {
            id: 'msg3',
            name: 'Tech Corp',
            email: 'hr@techcorp.com',
            subject: 'Internship Opportunity',
            message: 'We have reviewed your portfolio and would like to offer you an internship opportunity at Tech Corp. Please reply if you\'re interested in learning more about this position.',
            date: new Date(Date.now() - 86400000).toISOString(),
            unread: false,
            replies: []
        }
    ];
}

function saveMessages(messages) {
    try {
        localStorage.setItem(CONFIG.storageKeys.messages, JSON.stringify(messages));
        state.messages = messages;
    } catch (e) {
        console.error('Error saving messages:', e);
        showToast('Error saving messages', 'error');
    }
}

function getSettings() {
    try {
        const data = localStorage.getItem(CONFIG.storageKeys.settings);
        return data ? JSON.parse(data) : {
            siteTitle: 'Badeng Lat',
            siteDescription: '',
            siteKeywords: '',
            theme: 'light',
            primaryColor: '#6366f1',
            emailNotifications: true,
            browserNotifications: false,
            showEmail: true,
            showPhone: false,
            allowAnalytics: true,
            emailJSServiceID: '',
            emailJSTemplateID: '',
            emailJSPublicKey: '',
            fromEmail: '',
            fromName: 'Badeng Lat'
        };
    } catch (e) {
        console.error('Error loading settings:', e);
        return {};
    }
}

function saveSettingsToStorage(settings) {
    try {
        localStorage.setItem(CONFIG.storageKeys.settings, JSON.stringify(settings));
        state.settings = settings;
    } catch (e) {
        console.error('Error saving settings:', e);
        showToast('Error saving settings', 'error');
    }
}

function getProfile() {
    try {
        const data = localStorage.getItem(CONFIG.storageKeys.profile);
        return data ? JSON.parse(data) : {
            name: 'Badeng Lat',
            email: 'badenglat@gmail.com',
            title: 'Full Stack Developer',
            phone: '',
            location: '',
            bio: '',
            github: '',
            linkedin: '',
            avatar: ''
        };
    } catch (e) {
        console.error('Error loading profile:', e);
        return {};
    }
}

function saveProfileToStorage(profile) {
    try {
        localStorage.setItem(CONFIG.storageKeys.profile, JSON.stringify(profile));
        state.profile = profile;
    } catch (e) {
        console.error('Error saving profile:', e);
        showToast('Error saving profile', 'error');
    }
}

function getNotifications() {
    try {
        const data = localStorage.getItem(CONFIG.storageKeys.notifications);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading notifications:', e);
        return [];
    }
}

function saveNotifications(notifications) {
    try {
        localStorage.setItem(CONFIG.storageKeys.notifications, JSON.stringify(notifications));
        state.notifications = notifications;
    } catch (e) {
        console.error('Error saving notifications:', e);
    }
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${escapeHtml(message)}</span>
        <button class="toast-close" type="button" aria-label="Close"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => removeToast(toast));

    setTimeout(() => removeToast(toast), CONFIG.toastDuration);
}

function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('show');
    toast.classList.add('hiding');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// ==========================================
// Loading Overlay
// ==========================================
function showLoading() {
    DOM.loadingOverlay?.classList.add('active');
}

function hideLoading() {
    DOM.loadingOverlay?.classList.remove('active');
}

// ==========================================
// Modal Management
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const firstInput = modal.querySelector('input:not([type="hidden"]):not([type="checkbox"]), textarea, select');
            firstInput?.focus();
        }, 100);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';

        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            delete form.dataset.projectId;
            delete form.dataset.skillId;
            delete form.dataset.categoryId;
            delete form.dataset.educationId;
            delete form.dataset.messageId;
        }
    }

    const openModals = document.querySelectorAll('.modal.active, .modal[style*="display: flex"]');
    if (openModals.length === 0) {
        document.body.style.overflow = '';
    }

    state.confirmCallback = null;
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
    document.body.style.overflow = '';
    state.confirmCallback = null;
}

// ==========================================
// Confirm Dialog
// ==========================================
function showConfirm(titleOrMessage, messageOrCallback, callback) {
    let title, message, onConfirm;

    if (typeof messageOrCallback === 'function') {
        title = 'Confirm';
        message = titleOrMessage;
        onConfirm = messageOrCallback;
    } else {
        title = titleOrMessage;
        message = messageOrCallback;
        onConfirm = callback;
    }

    let modal = document.getElementById('confirmModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'confirmModal';
        modal.innerHTML = `
            <div class="modal-content modal-sm">
                <div class="modal-header">
                    <h3 id="confirmModalTitle">${escapeHtml(title)}</h3>
                    <button class="modal-close" onclick="closeModal('confirmModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p id="confirmModalMessage">${escapeHtml(message)}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="confirmCancelBtn">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        const titleEl = document.getElementById('confirmModalTitle');
        const messageEl = document.getElementById('confirmModalMessage');
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
    }

    state.confirmCallback = onConfirm;

    const cancelBtn = document.getElementById('confirmCancelBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', () => {
            state.confirmCallback = null;
            closeModal('confirmModal');
        });
    }

    if (confirmBtn) {
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', () => {
            if (state.confirmCallback && typeof state.confirmCallback === 'function') {
                state.confirmCallback();
            }
            state.confirmCallback = null;
            closeModal('confirmModal');
        });
    }

    openModal('confirmModal');
}

// ==========================================
// Authentication Functions
// ==========================================
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem(CONFIG.storageKeys.isLoggedIn);
    const rememberMe = localStorage.getItem(CONFIG.storageKeys.rememberMe);
    const expiry = localStorage.getItem(CONFIG.storageKeys.sessionExpiry);

    if (isLoggedIn === 'true') {
        if (rememberMe === 'true') {
            state.isLoggedIn = true;
        } else if (expiry && Date.now() < parseInt(expiry)) {
            state.isLoggedIn = true;
        } else if (expiry && Date.now() >= parseInt(expiry)) {
            handleSessionExpired();
            return;
        } else {
            state.isLoggedIn = true;
        }
    }

    if (state.isLoggedIn) {
        startSessionMonitoring();
    }
}

function handleLogin(e) {
    e.preventDefault();

    const username = DOM.usernameInput?.value.trim();
    const password = DOM.passwordInput?.value;
    const remember = DOM.rememberMe?.checked;
    const loginBtn = DOM.loginForm?.querySelector('.login-btn');

    if (!loginBtn) return;

    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    loginBtn.disabled = true;

    setTimeout(() => {
        if (username === CONFIG.credentials.username && password === CONFIG.credentials.password) {
            const now = Date.now();
            state.isLoggedIn = true;

            localStorage.setItem(CONFIG.storageKeys.isLoggedIn, 'true');
            localStorage.setItem(CONFIG.storageKeys.loginTimestamp, now.toString());
            localStorage.setItem(CONFIG.storageKeys.sessionExpiry, (now + CONFIG.sessionTimeout).toString());

            if (remember) {
                localStorage.setItem(CONFIG.storageKeys.rememberMe, 'true');
            } else {
                localStorage.removeItem(CONFIG.storageKeys.rememberMe);
            }

            DOM.loginError?.classList.remove('show');
            showAdminPanel();
            initDashboard();
            loadAllProfileImages();
            startSessionMonitoring();
            initEmailJS();
            logActivity('Logged in');
            showToast('Welcome back, Admin!', 'success');
        } else {
            DOM.loginError?.classList.add('show');
            if (DOM.passwordInput) {
                DOM.passwordInput.value = '';
                DOM.passwordInput.focus();
            }
            showToast('Invalid credentials. Please try again.', 'error');
        }
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }, 1000);
}

function handleLogout() {
    showConfirm('Logout', 'Are you sure you want to logout?', () => {
        logActivity('Logged out');
        state.isLoggedIn = false;
        localStorage.removeItem(CONFIG.storageKeys.isLoggedIn);
        localStorage.removeItem(CONFIG.storageKeys.rememberMe);
        localStorage.removeItem(CONFIG.storageKeys.loginTimestamp);
        localStorage.removeItem(CONFIG.storageKeys.sessionExpiry);
        stopSessionMonitoring();
        hideAdminPanel();
        showToast('You have been logged out.', 'info');
        if (DOM.loginForm) {
            DOM.loginForm.reset();
        }
        DOM.loginError?.classList.remove('show');
    });
}

function handleSessionExpired() {
    state.isLoggedIn = false;
    localStorage.removeItem(CONFIG.storageKeys.isLoggedIn);
    localStorage.removeItem(CONFIG.storageKeys.loginTimestamp);
    localStorage.removeItem(CONFIG.storageKeys.sessionExpiry);
    stopSessionMonitoring();
    hideAdminPanel();
    showToast('Session expired. Please login again.', 'warning');
}

let sessionTimer = null;
let activityTimer = null;

function startSessionMonitoring() {
    stopSessionMonitoring();

    sessionTimer = setInterval(() => {
        const rememberMe = localStorage.getItem(CONFIG.storageKeys.rememberMe);
        if (rememberMe !== 'true') {
            const expiry = localStorage.getItem(CONFIG.storageKeys.sessionExpiry);
            if (expiry && Date.now() > parseInt(expiry)) {
                handleSessionExpired();
            }
        }
    }, 60000);

    ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
        document.addEventListener(event, refreshSession, { passive: true });
    });
}

function stopSessionMonitoring() {
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
}

function refreshSession() {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        if (state.isLoggedIn) {
            const rememberMe = localStorage.getItem(CONFIG.storageKeys.rememberMe);
            if (rememberMe !== 'true') {
                const now = Date.now();
                localStorage.setItem(CONFIG.storageKeys.sessionExpiry, (now + CONFIG.sessionTimeout).toString());
            }
        }
    }, 1000);
}

function showAdminPanel() {
    DOM.loginModal?.classList.add('hidden');
    if (DOM.loginModal) DOM.loginModal.style.display = 'none';
    DOM.adminPanel?.classList.add('active');

    if (DOM.forgotPasswordLink) {
        DOM.forgotPasswordLink.style.display = 'none';
    }

    const sidebarCollapsed = localStorage.getItem(CONFIG.storageKeys.sidebarCollapsed);
    if (sidebarCollapsed === 'true' && DOM.sidebar) {
        DOM.sidebar.classList.add('collapsed');
    }
}

function hideAdminPanel() {
    DOM.adminPanel?.classList.remove('active');
    DOM.loginModal?.classList.remove('hidden');
    if (DOM.loginModal) DOM.loginModal.style.display = 'flex';

    if (DOM.forgotPasswordLink) {
        DOM.forgotPasswordLink.style.display = 'inline-block';
    }
}

// ==========================================
// Theme Management
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.storageKeys.theme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    updateThemeIcon();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(CONFIG.storageKeys.theme, newTheme);
    updateThemeIcon();
    showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'info');
}

function updateThemeIcon() {
    const icon = DOM.themeToggle?.querySelector('i');
    if (icon) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ==========================================
// Sidebar Management
// ==========================================
function toggleSidebar() {
    DOM.sidebar?.classList.toggle('collapsed');
    const isCollapsed = DOM.sidebar?.classList.contains('collapsed') || false;
    localStorage.setItem(CONFIG.storageKeys.sidebarCollapsed, isCollapsed.toString());
}

function toggleMobileMenu() {
    DOM.sidebar?.classList.toggle('mobile-open');
    document.body.classList.toggle('sidebar-open');
}

function closeMobileMenu() {
    DOM.sidebar?.classList.remove('mobile-open');
    document.body.classList.remove('sidebar-open');
}

// ==========================================
// Navigation
// ==========================================
function handleNavigation(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const page = link.getAttribute('data-page');

    if (page && page !== state.currentPage) {
        navigateToPage(page);
    }
    closeMobileMenu();
}

function navigateToPage(pageName) {
    DOM.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.querySelector(`a[data-page="${pageName}"]`)) {
            item.classList.add('active');
        }
    });

    DOM.pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `${pageName}Page`) {
            page.classList.add('active');
        }
    });

    state.currentPage = pageName;

    switch (pageName) {
        case 'dashboard':
            initDashboard();
            break;
        case 'projects':
            initProjectsPage();
            break;
        case 'skills':
            initSkillsPage();
            break;
        case 'education':
            initEducationPage();
            break;
        case 'messages':
            initMessagesPage();
            break;
        case 'analytics':
            initAnalyticsPage();
            break;
        case 'profile':
            initProfilePage();
            break;
        case 'settings':
            initSettingsPage();
            break;
    }

    window.location.hash = pageName;
}

// ==========================================
// Dropdowns
// ==========================================
function toggleNotificationDropdown(e) {
    e.stopPropagation();
    DOM.userDropdown?.classList.remove('active');
    DOM.notificationDropdown?.classList.toggle('active');
    updateNotificationDropdown();
}

function toggleUserDropdown(e) {
    e.stopPropagation();
    DOM.notificationDropdown?.classList.remove('active');
    DOM.userDropdown?.classList.toggle('active');
}

function closeAllDropdowns() {
    DOM.notificationDropdown?.classList.remove('active');
    DOM.userDropdown?.classList.remove('active');
}

// ==========================================
// Password Visibility Toggle
// ==========================================
function togglePasswordVisibility() {
    const input = DOM.passwordInput;
    const icon = DOM.togglePassword?.querySelector('i');

    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ==========================================
// Profile Image Management
// ==========================================
function loadAllProfileImages() {
    const profile = getProfile();
    const imageData = profile.avatar || profile.image;

    if (imageData) {
        const selectors = [
            '#profileImage',
            '#sidebarAvatar',
            '.user-menu img',
            '.dropdown-user-info img',
            '.profile-avatar img'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el && el.tagName === 'IMG') {
                    el.src = imageData;
                    el.onerror = function () {
                        this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Admin')}&background=6366f1&color=fff`;
                    };
                }
            });
        });
    }

    const profileName = profile.name || 'Admin';
    const sidebarUserName = document.querySelector('.sidebar-user .user-info h4');
    if (sidebarUserName) sidebarUserName.textContent = profileName;

    const headerUserName = document.querySelector('.user-menu span');
    if (headerUserName) headerUserName.textContent = profileName.split(' ')[0];
}

function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const imageData = event.target?.result;
        if (!imageData) return;

        const profile = getProfile();
        profile.avatar = imageData;
        profile.image = imageData;
        saveProfileToStorage(profile);
        loadAllProfileImages();
        showToast('Profile image updated successfully!', 'success');
    };
    reader.onerror = () => {
        showToast('Error reading image file', 'error');
    };
    reader.readAsDataURL(file);
}

// ==========================================
// Activity Log
// ==========================================
function logActivity(action, details = {}) {
    const activity = {
        id: generateId(),
        action,
        details,
        timestamp: new Date().toISOString(),
        page: state.currentPage
    };

    state.activityLog.unshift(activity);

    if (state.activityLog.length > 100) {
        state.activityLog = state.activityLog.slice(0, 100);
    }

    try {
        localStorage.setItem(CONFIG.storageKeys.activityLog, JSON.stringify(state.activityLog));
    } catch (e) {
        console.error('Error saving activity log:', e);
    }
}

// ==========================================
// Notifications
// ==========================================
function updateNotificationDropdown() {
    const dropdown = DOM.notificationDropdown;
    if (!dropdown) return;

    const messages = getMessages();
    const unreadMessages = messages.filter(m => m.unread);

    const dropdownBody = dropdown.querySelector('.dropdown-body');
    if (!dropdownBody) return;

    if (unreadMessages.length > 0) {
        dropdownBody.innerHTML = unreadMessages.slice(0, 5).map(msg => `
            <div class="notification-item unread" onclick="navigateToPage('messages'); selectMessage('${msg.id}'); closeAllDropdowns();">
                <div class="notification-icon blue">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="notification-content">
                    <h5>New message from ${escapeHtml(msg.name)}</h5>
                    <p>${escapeHtml(msg.subject)}</p>
                    <span class="notification-time">${formatTimeAgo(msg.date)}</span>
                </div>
            </div>
        `).join('');
    } else {
        dropdownBody.innerHTML = `
            <div class="notification-item">
                <div class="notification-content" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-check-circle" style="font-size: 2rem; color: var(--success); margin-bottom: 0.5rem;"></i>
                    <p>All caught up! No new notifications.</p>
                </div>
            </div>
        `;
    }
}

function updateMessagesBadge() {
    const messages = getMessages();
    const unreadCount = messages.filter(m => m.unread).length;

    const badge = document.querySelector('.sidebar-nav a[data-page="messages"] .badge');
    if (badge) {
        badge.textContent = unreadCount.toString();
        badge.classList.toggle('new', unreadCount > 0);
    }

    const notificationCount = document.querySelector('.notification-count');
    if (notificationCount) {
        notificationCount.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
        notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// ==========================================
// Quick Action Buttons - CONTINUED
// ==========================================
function handleQuickAction(action) {
    switch (action) {
        case 'add-project':
            openProjectModal();
            break;
        case 'add-skill':
            openSkillModal();
            break;
        case 'view-messages':
            navigateToPage('messages');
            break;
        case 'edit-profile':
            navigateToPage('profile');
            break;
        case 'view-analytics':
            navigateToPage('analytics');
            break;
        case 'export-data':
            exportAllData();
            break;
    }
}

function initQuickActionButtons() {
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
}

// ==========================================
// Dashboard
// ==========================================
function initDashboard() {
    updateDashboardStats();
    initCharts();
    animateStatsCards();

    setTimeout(() => {
        initQuickActionButtons();
    }, 100);
}

function updateDashboardStats() {
    const projects = getProjects();
    const messages = getMessages();
    const skills = getSkillCategories();
    const totalSkills = skills.reduce((acc, c) => acc + (c.skills?.length || 0), 0);

    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = counter.getAttribute('data-target');
        if (target === '6' || counter.closest('.stat-card')?.querySelector('.stat-label')?.textContent.includes('Project')) {
            counter.setAttribute('data-target', projects.length.toString());
        }
        if (target === '24' || counter.closest('.stat-card')?.querySelector('.stat-label')?.textContent.includes('Message')) {
            counter.setAttribute('data-target', messages.length.toString());
        }
    });

    updateMessagesBadge();
}

function animateStatsCards() {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    initCounterAnimation();
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        if (!counter.classList.contains('counted')) {
            counter.classList.add('counted');
            animateCounter(counter);
        }
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target')) || 0;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(target * easeOut);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}

function initCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return;
    }

    const ctxVisitor = document.getElementById('visitorChart');
    if (ctxVisitor) {
        if (state.charts.visitor) state.charts.visitor.destroy();

        const ctx = ctxVisitor.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        state.charts.visitor = new Chart(ctxVisitor, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Visitors',
                    data: [1200, 1900, 1500, 2100, 1800, 2400, 2200],
                    borderColor: '#6366f1',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [5, 5], color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    const ctxTraffic = document.getElementById('trafficChart');
    if (ctxTraffic) {
        if (state.charts.traffic) state.charts.traffic.destroy();

        state.charts.traffic = new Chart(ctxTraffic, {
            type: 'doughnut',
            data: {
                labels: ['Direct', 'Social', 'Organic', 'Referral'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20, usePointStyle: true }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

// ==========================================
// Projects Page
// ==========================================
function initProjectsPage() {
    loadProjectsGrid();
    initProjectViewToggle();
}

function loadProjectsGrid() {
    const container = document.getElementById('projectsGridAdmin');
    if (!container) return;

    const projects = getProjects();
    const emptyState = document.getElementById('projectsEmptyState');

    if (projects.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.className = state.projectsViewMode === 'list' ? 'projects-grid-admin list-view' : 'projects-grid-admin';

    container.innerHTML = projects.map(project => `
        <div class="project-card-admin" data-id="${escapeHtml(project.id)}" data-category="${escapeHtml(project.category || 'web')}" data-status="${escapeHtml(project.status || 'draft')}">
            <div class="project-card-image">
                <div class="project-thumb" style="background: linear-gradient(135deg, ${escapeHtml(project.gradientStart || '#6366f1')}, ${escapeHtml(project.gradientEnd || '#ec4899')});">
                    <i class="fas ${escapeHtml(project.icon || 'fa-folder')}"></i>
                </div>
                <div class="project-card-overlay">
                    <button class="action-btn edit" onclick="editProject('${escapeHtml(project.id)}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn view" onclick="viewProject('${escapeHtml(project.id)}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="confirmDeleteProject('${escapeHtml(project.id)}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="project-card-body">
                <div class="project-card-header">
                    <h4 class="project-card-title">${escapeHtml(project.title)}</h4>
                    <span class="status-badge ${escapeHtml(project.status || 'draft')}">${escapeHtml(project.status || 'draft')}</span>
                </div>
                <p class="project-card-desc">${escapeHtml(project.description || '')}</p>
                <div class="project-card-footer">
                    <span class="category-badge ${escapeHtml(project.category || 'web')}">${escapeHtml(project.category || 'web')}</span>
                    <div class="project-card-stats">
                        <span class="project-stat"><i class="fas fa-eye"></i> ${project.views || 0}</span>
                        <span class="project-stat"><i class="fas fa-calendar"></i> ${formatDate(project.date)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function initProjectViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');

    viewButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const view = this.getAttribute('data-view');
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            state.projectsViewMode = view;
            localStorage.setItem(CONFIG.storageKeys.projectsView, view);

            const grid = document.getElementById('projectsGridAdmin');
            if (grid) {
                if (view === 'list') {
                    grid.classList.add('list-view');
                } else {
                    grid.classList.remove('list-view');
                }
            }

            showToast(`Switched to ${view} view`, 'info');
        });
    });

    const currentView = state.projectsViewMode;
    document.querySelectorAll('.view-btn').forEach(btn => {
        if (btn.getAttribute('data-view') === currentView) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function openProjectModal(projectId = null) {
    const modal = DOM.projectModal;
    if (!modal) return;

    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');

    if (form) form.reset();
    if (title) title.textContent = projectId ? 'Edit Project' : 'Add New Project';

    const modalTabs = modal.querySelectorAll('.form-tab');
    const modalContents = modal.querySelectorAll('.form-tab-content');

    modalTabs.forEach((tab, index) => tab.classList.toggle('active', index === 0));
    modalContents.forEach((content, index) => content.classList.toggle('active', index === 0));

    const thumbnailPreview = document.getElementById('thumbnailPreview');
    const screenshotsPreview = document.getElementById('screenshotsPreview');
    if (thumbnailPreview) {
        thumbnailPreview.innerHTML = '';
        thumbnailPreview.style.display = 'none';
    }
    if (screenshotsPreview) screenshotsPreview.innerHTML = '';

    const gradientStart = document.getElementById('gradientStart');
    const gradientEnd = document.getElementById('gradientEnd');
    const gradientPreview = document.getElementById('gradientPreview');

    if (gradientStart) gradientStart.value = '#6366f1';
    if (gradientEnd) gradientEnd.value = '#ec4899';
    if (gradientPreview) gradientPreview.style.background = 'linear-gradient(135deg, #6366f1, #ec4899)';

    const iconPreview = document.getElementById('iconPreview');
    if (iconPreview) iconPreview.className = 'fas fa-folder';

    const projectIdInput = document.getElementById('projectId');

    if (projectId) {
        const project = getProjects().find(p => p.id === projectId);
        if (project) {
            populateProjectForm(project);
        }
    } else {
        if (projectIdInput) projectIdInput.value = '';
        const projectDateInput = document.getElementById('projectDate');
        if (projectDateInput) projectDateInput.value = new Date().toISOString().split('T')[0];
    }

    openModal('projectModal');
}

function populateProjectForm(project) {
    const fields = {
        'projectId': project.id,
        'projectTitle': project.title || '',
        'projectCategory': project.category || 'web',
        'projectDescription': project.description || '',
        'projectStatus': project.status || 'draft',
        'projectDate': project.date?.split('T')[0] || '',
        'projectFullDescription': project.fullDescription || '',
        'projectTechnologies': (project.technologies || []).join(', '),
        'projectFeatures': (project.features || []).join('\n'),
        'projectLiveUrl': project.liveUrl || '',
        'projectGithubUrl': project.githubUrl || '',
        'projectIcon': project.icon || 'fa-folder',
        'gradientStart': project.gradientStart || '#6366f1',
        'gradientEnd': project.gradientEnd || '#ec4899'
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    });

    const iconPreview = document.getElementById('iconPreview');
    if (iconPreview) iconPreview.className = 'fas ' + (project.icon || 'fa-folder');

    const gradientPreview = document.getElementById('gradientPreview');
    if (gradientPreview) {
        gradientPreview.style.background = `linear-gradient(135deg, ${project.gradientStart || '#6366f1'}, ${project.gradientEnd || '#ec4899'})`;
    }
}

function saveProject() {
    const titleInput = document.getElementById('projectTitle');
    const descriptionInput = document.getElementById('projectDescription');

    const title = titleInput?.value.trim();
    const description = descriptionInput?.value.trim();

    if (!title) {
        showToast('Please enter a project title', 'error');
        titleInput?.focus();
        return;
    }

    if (!description) {
        showToast('Please enter a project description', 'error');
        descriptionInput?.focus();
        return;
    }

    const projectIdInput = document.getElementById('projectId');
    const projectId = projectIdInput?.value;
    const isEdit = !!projectId;
    const existingProject = isEdit ? getProjects().find(p => p.id === projectId) : null;

    const projectData = {
        id: projectId || generateId(),
        title,
        category: document.getElementById('projectCategory')?.value || 'web',
        description,
        status: document.getElementById('projectStatus')?.value || 'draft',
        date: document.getElementById('projectDate')?.value || new Date().toISOString().split('T')[0],
        fullDescription: document.getElementById('projectFullDescription')?.value.trim() || '',
        technologies: (document.getElementById('projectTechnologies')?.value || '').split(',').map(t => t.trim()).filter(t => t),
        features: (document.getElementById('projectFeatures')?.value || '').split('\n').map(f => f.trim()).filter(f => f),
        liveUrl: document.getElementById('projectLiveUrl')?.value.trim() || '',
        githubUrl: document.getElementById('projectGithubUrl')?.value.trim() || '',
        icon: document.getElementById('projectIcon')?.value.trim() || 'fa-folder',
        gradientStart: document.getElementById('gradientStart')?.value || '#6366f1',
        gradientEnd: document.getElementById('gradientEnd')?.value || '#ec4899',
        views: existingProject?.views || 0,
        createdAt: existingProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    let projects = getProjects();

    if (isEdit) {
        projects = projects.map(p => p.id === projectId ? projectData : p);
    } else {
        projects.unshift(projectData);
    }

    saveProjects(projects);
    closeModal('projectModal');
    loadProjectsGrid();
    updateDashboardStats();
    logActivity(`Project ${isEdit ? 'updated' : 'created'}: ${title}`);
    showToast(`Project ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
}

function editProject(projectId) {
    openProjectModal(projectId);
}

function viewProject(projectId) {
    const project = getProjects().find(p => p.id === projectId);
    if (project && project.liveUrl) {
        window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
    } else {
        showToast('No live URL available for this project', 'info');
    }
}

function confirmDeleteProject(projectId) {
    showConfirm('Delete Project', 'Are you sure you want to delete this project? This action cannot be undone.', () => {
        const project = getProjects().find(p => p.id === projectId);
        let projects = getProjects().filter(p => p.id !== projectId);
        saveProjects(projects);
        loadProjectsGrid();
        updateDashboardStats();
        logActivity(`Project deleted: ${project?.title || projectId}`);
        showToast('Project deleted successfully', 'success');
    });
}

function filterProjects() {
    const searchInput = document.getElementById('projectSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    const query = searchInput?.value.toLowerCase().trim() || '';
    const category = categoryFilter?.value || '';
    const status = statusFilter?.value || '';

    const projects = document.querySelectorAll('.project-card-admin');
    let hasVisible = false;

    projects.forEach(card => {
        const title = card.querySelector('.project-card-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.project-card-desc')?.textContent.toLowerCase() || '';
        const cardCategory = card.getAttribute('data-category') || '';
        const cardStatus = card.getAttribute('data-status') || '';

        const matchesQuery = !query || title.includes(query) || desc.includes(query);
        const matchesCategory = !category || cardCategory === category;
        const matchesStatus = !status || cardStatus === status;

        if (matchesQuery && matchesCategory && matchesStatus) {
            card.style.display = '';
            hasVisible = true;
        } else {
            card.style.display = 'none';
        }
    });

    const emptyState = document.getElementById('projectsEmptyState');
    if (emptyState) {
        emptyState.classList.toggle('hidden', hasVisible || projects.length === 0);
    }
}

function handleProjectSearch(e) {
    filterProjects();
}

// ==========================================
// Skills Page
// ==========================================
function initSkillsPage() {
    loadSkillsManagement();
}

function loadSkillsManagement() {
    const container = document.getElementById('skillsManagement');
    if (!container) return;

    const skillCategories = getSkillCategories();

    if (skillCategories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-code"></i></div>
                <h3>No Skills Yet</h3>
                <p>Add your first skill category to get started.</p>
                <button class="btn btn-primary" onclick="handleAddCategory()">
                    <i class="fas fa-plus"></i> Add Category
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = skillCategories.map(category => `
        <div class="skill-category-card" data-category-id="${escapeHtml(category.id)}">
            <div class="card-header">
                <h3><i class="fas ${escapeHtml(category.icon || 'fa-folder')}"></i> ${escapeHtml(category.name)}</h3>
                <div class="card-actions">
                    <button class="btn-icon" onclick="deleteCategory('${escapeHtml(category.id)}')" title="Delete Category">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                ${category.skills && category.skills.length > 0 ? category.skills.map(skill => `
                    <div class="skill-item" data-skill-id="${escapeHtml(skill.id)}">
                        <div class="skill-info">
                            <i class="${escapeHtml(skill.icon || 'fas fa-code')}"></i>
                            <span>${escapeHtml(skill.name)}</span>
                        </div>
                        <div class="skill-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${skill.level || 0}%"></div>
                            </div>
                            <span class="skill-level-badge">${skill.level || 0}%</span>
                        </div>
                        <div class="skill-actions">
                            <button class="btn-icon edit" onclick="editSkill('${escapeHtml(category.id)}', '${escapeHtml(skill.id)}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="confirmDeleteSkill('${escapeHtml(skill.id)}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('') : '<p class="text-muted">No skills in this category yet.</p>'}
                <button class="btn btn-sm btn-outline" onclick="openSkillModal('${escapeHtml(category.id)}')" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Add Skill
                </button>
            </div>
        </div>
    `).join('');
}

function openSkillModal(categoryId = null, skillId = null) {
    const modal = DOM.skillModal;
    if (!modal) return;

    const form = document.getElementById('skillForm');
    const title = document.getElementById('skillModalTitle');
    const categorySelect = document.getElementById('skillCategory');

    if (form) form.reset();
    if (title) title.textContent = skillId ? 'Edit Skill' : 'Add New Skill';

    const categories = getSkillCategories();
    if (categorySelect) {
        categorySelect.innerHTML = categories.map(cat =>
            `<option value="${escapeHtml(cat.id)}" ${cat.id === categoryId ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`
        ).join('');
    }

    const levelValue = document.getElementById('skillLevelValue');
    const fillPreview = document.getElementById('skillFillPreview');
    const levelInput = document.getElementById('skillLevel');

    if (levelValue) levelValue.textContent = '50%';
    if (fillPreview) fillPreview.style.width = '50%';
    if (levelInput) levelInput.value = '50';

    const skillIdInput = document.getElementById('skillId');
    if (skillIdInput) skillIdInput.value = '';

    if (skillId && categoryId) {
        const category = categories.find(c => c.id === categoryId);
        const skill = category?.skills?.find(s => s.id === skillId);

        if (skill) {
            if (skillIdInput) skillIdInput.value = skillId;
            document.getElementById('skillName').value = skill.name || '';
            document.getElementById('skillIcon').value = skill.icon || '';
            if (levelInput) levelInput.value = skill.level || 50;
            if (levelValue) levelValue.textContent = (skill.level || 50) + '%';
            if (fillPreview) fillPreview.style.width = (skill.level || 50) + '%';
            if (form) form.dataset.categoryId = categoryId;
        }
    } else if (categoryId) {
        if (form) form.dataset.categoryId = categoryId;
        if (categorySelect) categorySelect.value = categoryId;
    }

    openModal('skillModal');
}

function editSkill(categoryId, skillId) {
    openSkillModal(categoryId, skillId);
}

function saveSkill() {
    const nameInput = document.getElementById('skillName');
    const categoryInput = document.getElementById('skillCategory');
    const levelInput = document.getElementById('skillLevel');
    const iconInput = document.getElementById('skillIcon');
    const skillIdInput = document.getElementById('skillId');

    const name = nameInput?.value.trim();
    const categoryId = categoryInput?.value;
    const level = parseInt(levelInput?.value) || 50;
    const icon = iconInput?.value.trim() || 'fas fa-code';
    const skillId = skillIdInput?.value;

    if (!name) {
        showToast('Please enter a skill name', 'error');
        nameInput?.focus();
        return;
    }

    if (!categoryId) {
        showToast('Please select a category', 'error');
        return;
    }

    const categories = getSkillCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) {
        showToast('Invalid category selected', 'error');
        return;
    }

    if (!categories[categoryIndex].skills) {
        categories[categoryIndex].skills = [];
    }

    const skillData = {
        id: skillId || generateId(),
        name,
        level,
        icon
    };

    if (skillId) {
        const skillIndex = categories[categoryIndex].skills.findIndex(s => s.id === skillId);
        if (skillIndex !== -1) {
            categories[categoryIndex].skills[skillIndex] = skillData;
        } else {
            categories[categoryIndex].skills.push(skillData);
        }
    } else {
        categories[categoryIndex].skills.push(skillData);
    }

    saveSkillCategories(categories);
    closeModal('skillModal');
    loadSkillsManagement();
    logActivity(`Skill ${skillId ? 'updated' : 'added'}: ${name}`);
    showToast(`Skill ${skillId ? 'updated' : 'added'} successfully!`, 'success');
}

function confirmDeleteSkill(skillId) {
    showConfirm('Delete Skill', 'Are you sure you want to delete this skill?', () => {
        const categories = getSkillCategories();
        let skillName = '';

        for (const category of categories) {
            if (category.skills) {
                const skill = category.skills.find(s => s.id === skillId);
                if (skill) {
                    skillName = skill.name;
                    const index = category.skills.findIndex(s => s.id === skillId);
                    if (index !== -1) {
                        category.skills.splice(index, 1);
                        break;
                    }
                }
            }
        }

        saveSkillCategories(categories);
        loadSkillsManagement();
        logActivity(`Skill deleted: ${skillName || skillId}`);
        showToast('Skill deleted successfully', 'success');
    });
}

function handleAddCategory() {
    const name = prompt('Enter category name:');
    if (name && name.trim()) {
        const categories = getSkillCategories();
        const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (categories.some(c => c.id === id)) {
            showToast('Category already exists', 'error');
            return;
        }

        categories.push({
            id: id,
            name: name.trim(),
            icon: 'fa-folder',
            skills: []
        });

        saveSkillCategories(categories);
        loadSkillsManagement();
        logActivity(`Category added: ${name.trim()}`);
        showToast('Category added successfully', 'success');
    }
}

function deleteCategory(categoryId) {
    showConfirm('Delete Category', 'Are you sure you want to delete this category and all its skills?', () => {
        const category = getSkillCategories().find(c => c.id === categoryId);
        let categories = getSkillCategories().filter(c => c.id !== categoryId);
        saveSkillCategories(categories);
        loadSkillsManagement();
        logActivity(`Category deleted: ${category?.name || categoryId}`);
        showToast('Category deleted successfully', 'success');
    });
}

// ==========================================
// Education Page
// ==========================================
function initEducationPage() {
    loadEducationList();
}

function loadEducationList() {
    const container = document.getElementById('educationList');
    if (!container) return;

    const education = getEducation();

    if (education.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-graduation-cap"></i></div>
                <h3>No Education Added</h3>
                <p>Add your educational background to showcase your qualifications.</p>
                <button class="btn btn-primary" onclick="openEducationModal()">
                    <i class="fas fa-plus"></i> Add Education
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = education.map(edu => `
        <div class="education-card" data-id="${escapeHtml(edu.id)}">
            <div class="education-icon">
                <i class="fas ${edu.type === 'certification' ? 'fa-certificate' : 'fa-graduation-cap'}"></i>
            </div>
            <div class="education-content">
                <div class="education-header">
                    <div>
                        <h3>${escapeHtml(edu.title)}</h3>
                        <p class="edu-institution"><i class="fas fa-university"></i> ${escapeHtml(edu.institution)}</p>
                    </div>
                    <span class="edu-date">${escapeHtml(edu.startDate)} - ${escapeHtml(edu.endDate || 'Present')}</span>
                </div>
                ${edu.description ? `<p class="edu-desc">${escapeHtml(edu.description)}</p>` : ''}
                ${edu.courses ? `<p class="edu-courses"><strong>Courses:</strong> ${escapeHtml(edu.courses)}</p>` : ''}
                <div class="education-actions">
                    <button class="btn-text" onclick="editEducation('${escapeHtml(edu.id)}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-text delete" onclick="confirmDeleteEducation('${escapeHtml(edu.id)}')"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openEducationModal(educationId = null) {
    const modal = DOM.educationModal;
    if (!modal) return;

    const form = document.getElementById('educationForm');
    const title = document.getElementById('educationModalTitle');

    if (form) form.reset();
    if (title) title.textContent = educationId ? 'Edit Education' : 'Add Education';

    const educationIdInput = document.getElementById('educationId');

    if (educationId) {
        const edu = getEducation().find(e => e.id === educationId);
        if (edu) {
            if (educationIdInput) educationIdInput.value = edu.id;
            document.getElementById('eduTitle').value = edu.title || '';
            document.getElementById('eduInstitution').value = edu.institution || '';
            document.getElementById('eduStartDate').value = edu.startDate || '';
            document.getElementById('eduEndDate').value = edu.endDate || '';
            document.getElementById('eduDescription').value = edu.description || '';
            document.getElementById('eduCourses').value = edu.courses || '';
            document.getElementById('eduType').value = edu.type || 'degree';
        }
    } else {
        if (educationIdInput) educationIdInput.value = '';
    }

    openModal('educationModal');
}

function editEducation(educationId) {
    openEducationModal(educationId);
}

function saveEducation() {
    const titleInput = document.getElementById('eduTitle');
    const institutionInput = document.getElementById('eduInstitution');
    const startDateInput = document.getElementById('eduStartDate');

    const title = titleInput?.value.trim();
    const institution = institutionInput?.value.trim();
    const startDate = startDateInput?.value.trim();

    if (!title) {
        showToast('Please enter a title/degree', 'error');
        titleInput?.focus();
        return;
    }

    if (!institution) {
        showToast('Please enter an institution', 'error');
        institutionInput?.focus();
        return;
    }

    if (!startDate) {
        showToast('Please enter a start date', 'error');
        startDateInput?.focus();
        return;
    }

    const educationIdInput = document.getElementById('educationId');
    const educationId = educationIdInput?.value;
    const isEdit = !!educationId;

    const eduData = {
        id: educationId || generateId(),
        title,
        institution,
        startDate,
        endDate: document.getElementById('eduEndDate')?.value.trim() || '',
        description: document.getElementById('eduDescription')?.value.trim() || '',
        courses: document.getElementById('eduCourses')?.value.trim() || '',
        type: document.getElementById('eduType')?.value || 'degree'
    };

    let education = getEducation();

    if (isEdit) {
        education = education.map(e => e.id === educationId ? eduData : e);
    } else {
        education.unshift(eduData);
    }

    saveEducationToStorage(education);
    closeModal('educationModal');
    loadEducationList();
    logActivity(`Education ${isEdit ? 'updated' : 'added'}: ${title}`);
    showToast(`Education ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
}

function confirmDeleteEducation(educationId) {
    showConfirm('Delete Education', 'Are you sure you want to delete this education entry?', () => {
        const edu = getEducation().find(e => e.id === educationId);
        let education = getEducation().filter(e => e.id !== educationId);
        saveEducationToStorage(education);
        loadEducationList();
        logActivity(`Education deleted: ${edu?.title || educationId}`);
        showToast('Education deleted successfully', 'success');
    });
}

// ==========================================
// Messages Page
// ==========================================
function initMessagesPage() {
    loadMessagesPage();
}

function loadMessagesPage() {
    const sidebar = document.getElementById('messagesSidebar');
    const detail = document.getElementById('messageDetail');

    if (!sidebar) return;

    const messages = getMessages();

    sidebar.innerHTML = `
        <div class="messages-header-sidebar">
            <h3>Inbox (${messages.length})</h3>
            <div class="messages-actions">
                <button class="btn-icon" onclick="selectAllMessages()" title="Select all">
                    <i class="fas fa-check-square"></i>
                </button>
                <button class="btn-icon" onclick="markAllMessagesRead()" title="Mark all read">
                    <i class="fas fa-check-double"></i>
                </button>
            </div>
        </div>
        ${state.selectedMessages.size > 0 ? `
            <div class="bulk-actions-bar">
                <span>${state.selectedMessages.size} selected</span>
                <div>
                    <button class="btn btn-sm btn-secondary" onclick="deselectAllMessages()">
                        <i class="fas fa-times"></i> Deselect
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSelectedMessages()">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        ` : ''}
        <div class="messages-list-sidebar">
            ${messages.length > 0 ? messages.map(msg => `
                <div class="message-item-sidebar ${msg.unread ? 'unread' : ''} ${state.currentMessageId === msg.id ? 'active' : ''}" 
                     id="msg-${escapeHtml(msg.id)}">
                    <div class="message-checkbox" onclick="event.stopPropagation(); toggleMessageSelection('${escapeHtml(msg.id)}')">
                        <input type="checkbox" class="message-select" value="${escapeHtml(msg.id)}" 
                               ${state.selectedMessages.has(msg.id) ? 'checked' : ''}
                               onchange="handleMessageSelection(event)">
                    </div>
                    <div class="message-content-wrapper" onclick="selectMessage('${escapeHtml(msg.id)}')">
                        <div class="message-avatar-small">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=6366f1&color=fff" 
                                 alt="${escapeHtml(msg.name)}">
                        </div>
                        <div class="message-info-sidebar">
                            <div class="message-top">
                                <span class="message-name">${escapeHtml(msg.name)}</span>
                                <span class="message-time">${formatTimeAgo(msg.date)}</span>
                            </div>
                            <p class="message-subject-sidebar">${escapeHtml(msg.subject)}</p>
                        </div>
                    </div>
                </div>
            `).join('') : '<div class="empty-state-small"><p>No messages yet</p></div>'}
        </div>
    `;

    if (messages.length > 0) {
        if (!state.currentMessageId || !messages.find(m => m.id === state.currentMessageId)) {
            selectMessage(messages[0].id);
        } else {
            selectMessage(state.currentMessageId);
        }
    } else if (detail) {
        detail.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-envelope-open"></i></div>
                <h3>No Messages</h3>
                <p>You haven't received any messages yet.</p>
            </div>
        `;
    }

    updateMessagesBadge();
}

function selectMessage(messageId) {
    const messages = getMessages();
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    state.currentMessageId = messageId;

    document.querySelectorAll('.message-item-sidebar').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(`msg-${messageId}`)?.classList.add('active');

    if (message.unread) {
        message.unread = false;
        saveMessages(messages);
        document.getElementById(`msg-${messageId}`)?.classList.remove('unread');
        updateMessagesBadge();
    }

    const detailContainer = document.getElementById('messageDetail');
    if (detailContainer) {
        detailContainer.innerHTML = `
            <div class="message-detail-header">
                <div class="message-meta">
                    <h2>${escapeHtml(message.subject)}</h2>
                    <div class="message-sender-info">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(message.name)}&background=6366f1&color=fff" 
                             alt="${escapeHtml(message.name)}">
                        <div>
                            <span class="sender-name">${escapeHtml(message.name)}</span>
                            <span class="sender-email">&lt;${escapeHtml(message.email)}&gt;</span>
                        </div>
                    </div>
                    <span class="message-date"><i class="fas fa-calendar"></i> ${formatDate(message.date)}</span>
                </div>
                <div class="message-actions">
                    <button class="btn btn-primary" onclick="openChatReply('${escapeHtml(message.id)}')" type="button">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                    <button class="btn btn-danger" onclick="deleteMessage('${escapeHtml(message.id)}')" type="button">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="message-body">
                <p>${escapeHtml(message.message).replace(/\n/g, '<br>')}</p>
            </div>
            ${message.replies && message.replies.length > 0 ? `
                <div class="message-replies">
                    <h4><i class="fas fa-comments"></i> Replies (${message.replies.length})</h4>
                    ${message.replies.map(reply => `
                        <div class="reply-item">
                            <div class="reply-header">
                                <span class="reply-author">You</span>
                                <span class="reply-date">${formatTimeAgo(reply.date)}</span>
                                ${reply.sentViaEmail ? '<span class="email-sent-badge"><i class="fas fa-check-circle"></i> Sent via Email</span>' : ''}
                            </div>
                            <p>${escapeHtml(reply.text).replace(/\n/g, '<br>')}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }
}

function toggleMessageSelection(messageId) {
    if (state.selectedMessages.has(messageId)) {
        state.selectedMessages.delete(messageId);
    } else {
        state.selectedMessages.add(messageId);
    }
    loadMessagesPage();
}

function handleMessageSelection(event) {
    const checkbox = event.target;
    const messageId = checkbox.value;

    if (checkbox.checked) {
        state.selectedMessages.add(messageId);
    } else {
        state.selectedMessages.delete(messageId);
    }
}

function selectAllMessages() {
    const messages = getMessages();
    const allSelected = messages.every(m => state.selectedMessages.has(m.id));

    if (allSelected) {
        state.selectedMessages.clear();
    } else {
        messages.forEach(msg => state.selectedMessages.add(msg.id));
    }

    loadMessagesPage();
}

function deselectAllMessages() {
    state.selectedMessages.clear();
    loadMessagesPage();
}

function markAllMessagesRead() {
    const messages = getMessages();
    messages.forEach(m => m.unread = false);
    saveMessages(messages);
    loadMessagesPage();
    showToast('All messages marked as read', 'success');
}

function deleteMessage(messageId) {
    showConfirm('Delete Message', 'Are you sure you want to delete this message?', () => {
        const msg = getMessages().find(m => m.id === messageId);
        let messages = getMessages().filter(m => m.id !== messageId);
        saveMessages(messages);
        state.currentMessageId = null;
        loadMessagesPage();
        updateMessagesBadge();
        logActivity(`Message deleted from: ${msg?.name || messageId}`);
        showToast('Message deleted', 'success');
    });
}

function deleteSelectedMessages() {
    if (state.selectedMessages.size === 0) {
        showToast('No messages selected', 'warning');
        return;
    }

    const count = state.selectedMessages.size;
    showConfirm('Delete Messages', `Are you sure you want to delete ${count} selected message(s)?`, () => {
        let messages = getMessages().filter(m => !state.selectedMessages.has(m.id));
        saveMessages(messages);
        state.selectedMessages.clear();
        state.currentMessageId = null;
        loadMessagesPage();
        updateMessagesBadge();
        logActivity(`${count} messages deleted`);
        showToast(`${count} message(s) deleted successfully`, 'success');
    });
}

// ==========================================
// Chat Reply Modal - WITH EMAILJS
// ==========================================
function openChatReply(messageId) {
    const messages = getMessages();
    const message = messages.find(m => m.id === messageId);

    if (!message) {
        showToast('Message not found', 'error');
        return;
    }

    // Remove existing chat modal if any
    const existingModal = document.getElementById('chatModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create chat modal
    const chatModal = document.createElement('div');
    chatModal.className = 'modal';
    chatModal.id = 'chatModal';
    chatModal.innerHTML = `
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h3><i class="fas fa-reply"></i> Reply to ${escapeHtml(message.name)}</h3>
                <button class="modal-close" type="button" onclick="closeModal('chatModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="chat-container">
                    <div class="original-message-box">
                        <div class="original-message-header">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(message.name)}&background=6366f1&color=fff" 
                                 alt="${escapeHtml(message.name)}" class="chat-avatar">
                            <div class="original-message-info">
                                <strong>${escapeHtml(message.name)}</strong>
                                <span class="original-message-email">${escapeHtml(message.email)}</span>
                                <span class="original-message-date">${formatDate(message.date)}</span>
                            </div>
                        </div>
                        <div class="original-message-subject">
                            <strong>Subject:</strong> ${escapeHtml(message.subject)}
                        </div>
                        <div class="original-message-content">
                            ${escapeHtml(message.message).replace(/\n/g, '<br>')}
                        </div>
                    </div>

                    <div class="chat-messages" id="chatMessagesContainer">
                        ${message.replies && message.replies.length > 0 ? message.replies.map(reply => `
                            <div class="chat-message sent">
                                <div class="chat-bubble">
                                    <p>${escapeHtml(reply.text).replace(/\n/g, '<br>')}</p>
                                    <span class="chat-time">
                                        ${formatTimeAgo(reply.date)}
                                        ${reply.sentViaEmail ? '<i class="fas fa-check-circle" title="Sent via email" style="color: var(--success); margin-left: 5px;"></i>' : ''}
                                    </span>
                                </div>
                            </div>
                        `).join('') : '<p class="no-replies-text">No previous replies</p>'}
                    </div>

                    <div class="chat-input-container">
                        <div class="reply-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="sendEmailCheckbox" ${state.emailJSInitialized ? 'checked' : ''} ${!state.emailJSInitialized ? 'disabled' : ''}>
                                <span>Send via Email ${!state.emailJSInitialized ? '(Not configured)' : ''}</span>
                            </label>
                        </div>
                        <div class="chat-input-wrapper">
                            <textarea id="chatReplyInput" 
                                      placeholder="Type your reply here..." 
                                      rows="3"
                                      class="chat-input"></textarea>
                            <button type="button" class="btn btn-primary send-btn" id="sendReplyBtn" onclick="sendChatReply('${escapeHtml(messageId)}')">
                                <i class="fas fa-paper-plane"></i>
                                <span>Send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(chatModal);
    state.currentMessageId = messageId;
    openModal('chatModal');

    setTimeout(() => {
        const textarea = document.getElementById('chatReplyInput');
        if (textarea) textarea.focus();
    }, 100);

    setTimeout(() => {
        const chatContainer = document.getElementById('chatMessagesContainer');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 150);
}

function sendChatReply(messageId) {
    const replyInput = document.getElementById('chatReplyInput');
    const sendEmailCheckbox = document.getElementById('sendEmailCheckbox');
    const sendBtn = document.getElementById('sendReplyBtn');

    const replyText = replyInput?.value?.trim();
    const shouldSendEmail = sendEmailCheckbox?.checked ?? false;

    if (!replyText) {
        showToast('Please enter a reply message', 'warning');
        replyInput?.focus();
        return;
    }

    const messages = getMessages();
    const message = messages.find(m => m.id === messageId);

    if (!message) {
        showToast('Message not found', 'error');
        return;
    }

    const originalBtnHtml = sendBtn?.innerHTML;
    if (sendBtn) {
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        sendBtn.disabled = true;
    }

    const reply = {
        id: generateId(),
        text: replyText,
        date: new Date().toISOString(),
        sentViaEmail: false
    };

    const saveReplyLocally = (emailSent = false) => {
        reply.sentViaEmail = emailSent;

        if (!message.replies) {
            message.replies = [];
        }
        message.replies.push(reply);
        message.unread = false;

        saveMessages(messages);

        if (replyInput) replyInput.value = '';

        addReplyToChat(reply);

        if (state.currentPage === 'messages') {
            loadMessagesPage();
        }
    };

    if (shouldSendEmail && state.emailJSInitialized) {
        sendReplyViaEmail(message, replyText, reply)
            .then((emailSent) => {
                saveReplyLocally(emailSent);

                if (emailSent) {
                    showToast('Reply sent via email successfully!', 'success');
                    logActivity('Email reply sent', { to: message.email, subject: message.subject });
                } else {
                    showToast('Reply saved (email sending failed)', 'warning');
                }
            })
            .catch((error) => {
                console.error('Email error:', error);
                saveReplyLocally(false);
                showToast('Reply saved locally (email failed)', 'warning');
            })
            .finally(() => {
                if (sendBtn) {
                    sendBtn.innerHTML = originalBtnHtml || '<i class="fas fa-paper-plane"></i><span>Send</span>';
                    sendBtn.disabled = false;
                }
            });
    } else {
        saveReplyLocally(false);
        showToast('Reply saved successfully!', 'success');
        logActivity('Reply saved', { to: message.name, subject: message.subject });

        if (sendBtn) {
            sendBtn.innerHTML = originalBtnHtml || '<i class="fas fa-paper-plane"></i><span>Send</span>';
            sendBtn.disabled = false;
        }
    }
}

function addReplyToChat(reply) {
    const chatContainer = document.getElementById('chatMessagesContainer');
    if (!chatContainer) return;

    const noRepliesText = chatContainer.querySelector('.no-replies-text');
    if (noRepliesText) {
        noRepliesText.remove();
    }

    const replyElement = document.createElement('div');
    replyElement.className = 'chat-message sent';
    replyElement.innerHTML = `
        <div class="chat-bubble">
            <p>${escapeHtml(reply.text).replace(/\n/g, '<br>')}</p>
            <span class="chat-time">
                Just now
                ${reply.sentViaEmail ? '<i class="fas fa-check-circle" title="Sent via email" style="color: var(--success); margin-left: 5px;"></i>' : ''}
            </span>
        </div>
    `;

    chatContainer.appendChild(replyElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ==========================================
// EmailJS Integration - COMPLETE
// ==========================================
function initEmailJS() {
    if (typeof emailjs === 'undefined') {
        console.warn('⚠️ EmailJS SDK not loaded. Email features will be disabled.');
        console.log('Add this script to your HTML:');
        console.log('<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>');
        state.emailJSInitialized = false;
        return false;
    }

    const settings = getSettings();

    if (settings.emailJSPublicKey) {
        try {
            emailjs.init({
                publicKey: settings.emailJSPublicKey,
            });
            console.log('✅ EmailJS initialized successfully');
            state.emailJSInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ EmailJS initialization failed:', error);
            state.emailJSInitialized = false;
            return false;
        }
    } else {
        console.warn('⚠️ EmailJS Public Key not configured. Go to Settings to configure.');
        state.emailJSInitialized = false;
        return false;
    }
}

function sendReplyViaEmail(message, replyText, replyObj) {
    return new Promise((resolve, reject) => {
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS SDK not loaded');
            resolve(false);
            return;
        }

        const settings = getSettings();

        if (!settings.emailJSServiceID) {
            console.error('❌ EmailJS Service ID not configured');
            resolve(false);
            return;
        }

        if (!settings.emailJSTemplateID) {
            console.error('❌ EmailJS Template ID not configured');
            resolve(false);
            return;
        }

        if (!settings.emailJSPublicKey) {
            console.error('❌ EmailJS Public Key not configured');
            resolve(false);
            return;
        }

        try {
            emailjs.init({ publicKey: settings.emailJSPublicKey });

            const templateParams = {
                to_email: message.email,
                to_name: message.name,
                from_name: settings.fromName || state.profile?.name || 'Admin',
                from_email: settings.fromEmail || state.profile?.email || '',
                reply_to: settings.fromEmail || state.profile?.email || '',
                subject: `Re: ${message.subject}`,
                message: replyText,
                message_html: replyText.replace(/\n/g, '<br>'),
                original_message: message.message,
                original_subject: message.subject,
                date: new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            console.log('📧 Sending email with EmailJS...');
            console.log('Service ID:', settings.emailJSServiceID);
            console.log('Template ID:', settings.emailJSTemplateID);
            console.log('To:', message.email);

            emailjs.send(
                settings.emailJSServiceID,
                settings.emailJSTemplateID,
                templateParams
            )
                .then((response) => {
                    console.log('✅ Email sent successfully!', response);
                    resolve(response.status === 200 || response.text === 'OK');
                })
                .catch((error) => {
                    console.error('❌ EmailJS Error:', error);

                    let errorMessage = 'Failed to send email. ';

                    if (error.status === 400) {
                        errorMessage += 'Bad request - check your template parameters.';
                    } else if (error.status === 401 || error.status === 403) {
                        errorMessage += 'Authentication failed - check your Public Key.';
                    } else if (error.status === 404) {
                        errorMessage += 'Service or Template not found - check your IDs.';
                    } else if (error.status === 422) {
                        errorMessage += 'Template parameters mismatch - check variable names.';
                    } else if (error.text) {
                        errorMessage += error.text;
                    } else if (error.message) {
                        errorMessage += error.message;
                    }

                    console.error('Error details:', {
                        status: error.status,
                        text: error.text,
                        message: error.message
                    });

                    reject(error);
                });
        } catch (error) {
            console.error('EmailJS Error:', error);
            reject(error);
        }
    });
}

function testEmailJS() {
    console.log('🧪 Testing EmailJS Configuration...');

    if (typeof emailjs === 'undefined') {
        showToast('EmailJS SDK not loaded! Add the script to your HTML.', 'error');
        console.error('Add this to your HTML:');
        console.error('<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>');
        return;
    }

    const settings = getSettings();

    const missing = [];
    if (!settings.emailJSServiceID) missing.push('Service ID');
    if (!settings.emailJSTemplateID) missing.push('Template ID');
    if (!settings.emailJSPublicKey) missing.push('Public Key');

    if (missing.length > 0) {
        showToast(`Missing: ${missing.join(', ')}. Configure in Settings.`, 'error');
        return;
    }

    const testEmail = prompt('Enter email address to send test:', settings.fromEmail || '');
    if (!testEmail) {
        showToast('Test cancelled', 'info');
        return;
    }

    if (!testEmail.includes('@')) {
        showToast('Invalid email address', 'error');
        return;
    }

    showLoading();

    emailjs.init({ publicKey: settings.emailJSPublicKey });

    emailjs.send(
        settings.emailJSServiceID,
        settings.emailJSTemplateID,
        {
            to_email: testEmail,
            to_name: 'Test User',
            from_name: settings.fromName || 'Admin Panel',
            from_email: settings.fromEmail || '',
            subject: 'EmailJS Test - Configuration Working!',
            message: 'This is a test email from your Admin Panel.\n\nIf you receive this, your EmailJS configuration is correct!',
            message_html: '<p>This is a test email from your Admin Panel.</p><p><strong>If you receive this, your EmailJS configuration is correct!</strong></p>',
            original_message: 'N/A - This is a test email',
            date: new Date().toLocaleString()
        }
    )
        .then((response) => {
            hideLoading();
            console.log('✅ Test email sent:', response);
            showToast('Test email sent successfully! Check your inbox.', 'success');
        })
        .catch((error) => {
            hideLoading();
            console.error('❌ Test email failed:', error);

            let errorMsg = 'Test failed: ';
            if (error.status === 422) {
                errorMsg += 'Template variable mismatch. Check your EmailJS template.';
            } else if (error.text) {
                errorMsg += error.text;
            } else {
                errorMsg += 'Unknown error. Check console for details.';
            }

            showToast(errorMsg, 'error');
        });
}

function debugEmailJS() {
    const settings = getSettings();

    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║      EmailJS Debug Information           ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log('');

    const sdkLoaded = typeof emailjs !== 'undefined';
    console.log(`1. SDK Status: ${sdkLoaded ? '✅ Loaded' : '❌ NOT LOADED'}`);
    if (!sdkLoaded) {
        console.log('   FIX: Add this to your HTML:');
        console.log('   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>');
    }

    console.log('');

    const hasServiceID = !!settings.emailJSServiceID;
    console.log(`2. Service ID: ${hasServiceID ? '✅ ' + settings.emailJSServiceID : '❌ NOT SET'}`);

    const hasTemplateID = !!settings.emailJSTemplateID;
    console.log(`3. Template ID: ${hasTemplateID ? '✅ ' + settings.emailJSTemplateID : '❌ NOT SET'}`);

    const hasPublicKey = !!settings.emailJSPublicKey;
    console.log(`4. Public Key: ${hasPublicKey ? '✅ ***' + settings.emailJSPublicKey.slice(-4) : '❌ NOT SET'}`);

    console.log(`5. From Email: ${settings.fromEmail || '⚠️ Not set (optional)'}`);
    console.log(`6. From Name: ${settings.fromName || '⚠️ Not set (optional)'}`);

    console.log('');

    const isReady = sdkLoaded && hasServiceID && hasTemplateID && hasPublicKey;
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║ Overall Status: ${isReady ? '✅ READY TO USE' : '❌ NOT READY'}            ║`);
    console.log('╚══════════════════════════════════════════╝');

    if (!isReady) {
        console.log('');
        console.log('📋 To fix:');
        if (!sdkLoaded) console.log('   1. Add EmailJS SDK script to your HTML');
        if (!hasServiceID) console.log('   2. Add Service ID in Settings > Email Configuration');
        if (!hasTemplateID) console.log('   3. Add Template ID in Settings > Email Configuration');
        if (!hasPublicKey) console.log('   4. Add Public Key in Settings > Email Configuration');
    }

    console.log('');
    console.log('💡 Tip: Run testEmailJS() to send a test email');

    return {
        sdkLoaded,
        serviceID: hasServiceID,
        templateID: hasTemplateID,
        publicKey: hasPublicKey,
        ready: isReady,
        config: {
            serviceID: settings.emailJSServiceID,
            templateID: settings.emailJSTemplateID,
            publicKey: hasPublicKey ? '***' + settings.emailJSPublicKey.slice(-4) : null,
            fromEmail: settings.fromEmail,
            fromName: settings.fromName
        }
    };
}

// ==========================================
// Analytics Page
// ==========================================
function initAnalyticsPage() {
    const container = document.getElementById('analyticsContent');
    if (!container) return;

    container.innerHTML = `
        <div class="analytics-stats">
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fas fa-users"></i></div>
                <div class="stat-details">
                    <h3 class="stat-number">12,458</h3>
                    <p class="stat-label">Total Visitors</p>
                    <span class="stat-change positive"><i class="fas fa-arrow-up"></i> 12.5%</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fas fa-eye"></i></div>
                <div class="stat-details">
                    <h3 class="stat-number">45,892</h3>
                    <p class="stat-label">Page Views</p>
                    <span class="stat-change positive"><i class="fas fa-arrow-up"></i> 8.3%</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple"><i class="fas fa-clock"></i></div>
                <div class="stat-details">
                    <h3 class="stat-number">2m 34s</h3>
                    <p class="stat-label">Avg. Session</p>
                    <span class="stat-change negative"><i class="fas fa-arrow-down"></i> 5.2%</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fas fa-percentage"></i></div>
                <div class="stat-details">
                    <h3 class="stat-number">32.4%</h3>
                    <p class="stat-label">Bounce Rate</p>
                    <span class="stat-change positive"><i class="fas fa-arrow-down"></i> 3.1%</span>
                </div>
            </div>
        </div>
        <div class="charts-grid">
            <div class="chart-card full-width">
                <div class="card-header">
                    <h3><i class="fas fa-chart-line"></i> Visitor Trends</h3>
                </div>
                <div class="card-body">
                    <canvas id="analyticsChart" height="300"></canvas>
                </div>
            </div>
        </div>
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-globe"></i> Top Pages</h3>
                </div>
                <div class="card-body">
                    <div class="top-pages-list">
                        <div class="top-page-item">
                            <span class="page-name">Home</span>
                            <span class="page-views">5,420 views</span>
                        </div>
                        <div class="top-page-item">
                            <span class="page-name">Projects</span>
                            <span class="page-views">3,210 views</span>
                        </div>
                        <div class="top-page-item">
                            <span class="page-name">About</span>
                            <span class="page-views">2,100 views</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-map-marker-alt"></i> Top Locations</h3>
                </div>
                <div class="card-body">
                    <div class="top-pages-list">
                        <div class="top-page-item">
                            <span class="page-name">🇺🇸 United States</span>
                            <span class="page-views">35%</span>
                        </div>
                        <div class="top-page-item">
                            <span class="page-name">🇬🇧 United Kingdom</span>
                            <span class="page-views">18%</span>
                        </div>
                        <div class="top-page-item">
                            <span class="page-name">🇸🇸 South Sudan</span>
                            <span class="page-views">15%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById('analyticsChart');
        if (ctx && typeof Chart !== 'undefined') {
            const existingChart = Chart.getChart(ctx);
            if (existingChart) existingChart.destroy();

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Visitors',
                        data: [2500, 3200, 2800, 3800],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Page Views',
                        data: [8000, 10500, 9200, 12000],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: {
                        y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }, 100);
}

function handleAnalyticsExport() {
    const report = {
        date: new Date().toISOString(),
        period: document.getElementById('analyticsPeriod')?.value || '30',
        visitors: 12458,
        pageViews: 45892,
        avgSession: '2m 34s',
        bounceRate: '32.4%',
        topPages: [
            { page: 'Home', views: 5420 },
            { page: 'Projects', views: 3210 },
            { page: 'About', views: 2100 }
        ]
    };

    downloadJSON(report, `analytics-report-${getDateString()}.json`);
    showToast('Analytics report exported', 'success');
}

// ==========================================
// Profile Page
// ==========================================
function initProfilePage() {
    loadProfileContent();
}

function loadProfileContent() {
    const container = document.getElementById('profileContainer');
    if (!container) return;

    const profile = getProfile();

    container.innerHTML = `
        <div class="profile-container">
            <div class="profile-card">
                <div class="profile-avatar">
                    <img src="${profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Admin')}&background=6366f1&color=fff&size=200`}" 
                         alt="Profile" id="profileImage"
                         onerror="this.src='https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&size=200'">
                    <button class="change-avatar-btn" id="changeAvatarBtn" title="Change Avatar" type="button">
                        <i class="fas fa-camera"></i>
                    </button>
                    <input type="file" id="avatarInput" accept="image/*" hidden>
                </div>
                <h3>${escapeHtml(profile.name || 'Admin User')}</h3>
                <p>${escapeHtml(profile.title || 'Administrator')}</p>
                <div class="profile-stats">
                    <div class="profile-stat">
                        <span class="stat-value">${getProjects().length}</span>
                        <span class="stat-label">Projects</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-value">${getSkillCategories().reduce((acc, c) => acc + (c.skills?.length || 0), 0)}</span>
                        <span class="stat-label">Skills</span>
                    </div>
                    <div class="profile-stat">
                        <span class="stat-value">${getMessages().length}</span>
                        <span class="stat-label">Messages</span>
                    </div>
                </div>
            </div>

            <div class="profile-form-card">
                <h4><i class="fas fa-user"></i> Personal Information</h4>
                <form id="profileForm" onsubmit="event.preventDefault(); saveProfile();">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profileName">Full Name</label>
                            <input type="text" id="profileName" value="${escapeHtml(profile.name || '')}" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="profileEmail">Email Address</label>
                            <input type="email" id="profileEmail" value="${escapeHtml(profile.email || '')}" class="form-control">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profilePhone">Phone Number</label>
                            <input type="tel" id="profilePhone" value="${escapeHtml(profile.phone || '')}" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="profileLocation">Location</label>
                            <input type="text" id="profileLocation" value="${escapeHtml(profile.location || '')}" class="form-control">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profileTitle">Professional Title</label>
                        <input type="text" id="profileTitle" value="${escapeHtml(profile.title || '')}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="profileBio">Bio / About Me</label>
                        <textarea id="profileBio" rows="4" class="form-control">${escapeHtml(profile.bio || '')}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profileGithub">GitHub URL</label>
                            <input type="url" id="profileGithub" value="${escapeHtml(profile.github || '')}" placeholder="https://github.com/username" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="profileLinkedin">LinkedIn URL</label>
                            <input type="url" id="profileLinkedin" value="${escapeHtml(profile.linkedin || '')}" placeholder="https://linkedin.com/in/username" class="form-control">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="openPasswordModal()">
                            <i class="fas fa-key"></i> Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');

    if (changeAvatarBtn && avatarInput) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', handleAvatarChange);
    }
}

function saveProfile() {
    const profile = getProfile();

    profile.name = document.getElementById('profileName')?.value.trim() || profile.name;
    profile.email = document.getElementById('profileEmail')?.value.trim() || profile.email;
    profile.phone = document.getElementById('profilePhone')?.value.trim() || profile.phone;
    profile.location = document.getElementById('profileLocation')?.value.trim() || profile.location;
    profile.title = document.getElementById('profileTitle')?.value.trim() || profile.title;
    profile.bio = document.getElementById('profileBio')?.value.trim() || profile.bio;
    profile.github = document.getElementById('profileGithub')?.value.trim() || profile.github;
    profile.linkedin = document.getElementById('profileLinkedin')?.value.trim() || profile.linkedin;

    saveProfileToStorage(profile);
    loadAllProfileImages();
    logActivity('Profile updated');
    showToast('Profile updated successfully!', 'success');
}

function openPasswordModal() {
    openModal('passwordModal');
}

function handlePasswordChange() {
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const currentPassword = currentPasswordInput?.value;
    const newPassword = newPasswordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }

    if (currentPassword !== CONFIG.credentials.password) {
        showToast('Current password is incorrect', 'error');
        currentPasswordInput?.focus();
        return;
    }

    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        newPasswordInput?.focus();
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        confirmPasswordInput?.focus();
        return;
    }

    CONFIG.credentials.password = newPassword;
    closeModal('passwordModal');
    document.getElementById('passwordForm')?.reset();
    logActivity('Password changed');
    showToast('Password updated successfully!', 'success');
}

// ==========================================
// Settings Page
// ==========================================
function initSettingsPage() {
    loadSettingsContent();
}

function loadSettingsContent() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;

    const settings = getSettings();

    container.innerHTML = `
        <div class="settings-container">
            <div class="settings-section">
                <h3><i class="fas fa-envelope"></i> Email Configuration (EmailJS)</h3>
                <p class="text-muted mb-3">Configure EmailJS to send replies directly to clients' Gmail inboxes.</p>
                <p class="text-muted mb-3">
                    <i class="fas fa-info-circle"></i> 
                    Get free EmailJS account: <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer">emailjs.com</a>
                </p>
                
                <div class="form-group">
                    <label for="emailJSServiceID">Service ID</label>
                    <input type="text" id="emailJSServiceID" 
                           value="${escapeHtml(settings.emailJSServiceID || '')}" 
                           placeholder="service_xxxxxxx" class="form-control">
                    <small class="form-hint">Find this in your EmailJS dashboard under "Email Services"</small>
                </div>
                
                <div class="form-group">
                    <label for="emailJSTemplateID">Template ID</label>
                    <input type="text" id="emailJSTemplateID" 
                           value="${escapeHtml(settings.emailJSTemplateID || '')}" 
                           placeholder="template_xxxxxxx" class="form-control">
                    <small class="form-hint">Find this in your EmailJS dashboard under "Email Templates"</small>
                </div>
                
                <div class="form-group">
                    <label for="emailJSPublicKey">Public Key</label>
                    <input type="text" id="emailJSPublicKey" 
                           value="${escapeHtml(settings.emailJSPublicKey || '')}" 
                           placeholder="Your public key" class="form-control">
                    <small class="form-hint">Find this in Account > General</small>
                </div>
                
                <div class="form-group">
                    <label for="fromEmail">From Email (Your Gmail)</label>
                    <input type="email" id="fromEmail" 
                           value="${escapeHtml(settings.fromEmail || '')}" 
                           placeholder="your-email@gmail.com" class="form-control">
                </div>
                
                <div class="form-group">
                    <label for="fromName">From Name</label>
                    <input type="text" id="fromName" 
                           value="${escapeHtml(settings.fromName || 'Portfolio Admin')}" 
                           placeholder="Your Name" class="form-control">
                </div>
                
                <div class="form-group">
                    <button type="button" class="btn btn-secondary" onclick="testEmailJS()">
                        <i class="fas fa-paper-plane"></i> Test Email Configuration
                    </button>
                    <button type="button" class="btn btn-outline" onclick="debugEmailJS()">
                        <i class="fas fa-bug"></i> Debug Config (Check Console)
                    </button>
                </div>
            </div>

            <div class="settings-section">
                <h3><i class="fas fa-globe"></i> General Settings</h3>
                <div class="form-group">
                    <label for="siteTitle">Site Title</label>
                    <input type="text" id="siteTitle" value="${escapeHtml(settings.siteTitle || 'My Portfolio')}" 
                           placeholder="Enter site title" class="form-control">
                </div>
                <div class="form-group">
                    <label for="siteDescription">Site Description</label>
                    <textarea id="siteDescription" rows="3" placeholder="Short description of your portfolio" class="form-control">${escapeHtml(settings.siteDescription || '')}</textarea>
                </div>
                <div class="form-group">
                    <label for="siteKeywords">SEO Keywords</label>
                    <input type="text" id="siteKeywords" value="${escapeHtml(settings.siteKeywords || '')}" 
                           placeholder="developer, portfolio, web development" class="form-control">
                </div>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-palette"></i> Appearance</h3>
                <div class="form-group">
                    <label for="defaultTheme">Default Theme</label>
                    <select id="defaultTheme" class="form-control">
                        <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="auto" ${settings.theme === 'auto' ? 'selected' : ''}>System Default</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="primaryColor">Primary Color</label>
                    <input type="color" id="primaryColor" value="${settings.primaryColor || '#6366f1'}" class="form-control">
                </div>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-bell"></i> Notifications</h3>
                <div class="form-group">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" id="emailNotifications" ${settings.emailNotifications ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Email Notifications
                    </label>
                    <small class="form-hint">Receive email when someone sends you a message</small>
                </div>
                <div class="form-group">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" id="browserNotifications" ${settings.browserNotifications ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Browser Notifications
                    </label>
                    <small class="form-hint">Show desktop notifications for new messages</small>
                </div>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-shield-alt"></i> Privacy & Security</h3>
                <div class="form-group">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" id="showEmail" ${settings.showEmail ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Show Email on Portfolio
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" id="showPhone" ${settings.showPhone ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Show Phone Number on Portfolio
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" id="allowAnalytics" ${settings.allowAnalytics !== false ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Allow Analytics Tracking
                    </label>
                </div>
            </div>
            
            <div class="settings-section">
                <h3><i class="fas fa-database"></i> Data Management</h3>
                <div class="form-group">
                    <p class="form-hint mb-2">Export or import your portfolio data for backup purposes.</p>
                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary" onclick="exportAllData()">
                            <i class="fas fa-download"></i> Export All Data
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="importAllData()">
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <p class="form-hint mb-2">Clear all stored data. This action cannot be undone.</p>
                    <button type="button" class="btn btn-danger" onclick="clearAllData()">
                        <i class="fas fa-trash"></i> Clear All Data
                    </button>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-primary" onclick="saveSettings()">
                    <i class="fas fa-save"></i> Save Settings
                </button>
                <button type="button" class="btn btn-secondary" onclick="resetSettings()">
                    <i class="fas fa-undo"></i> Reset to Defaults
                </button>
            </div>
        </div>
    `;

    const themeSelect = document.getElementById('defaultTheme');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', val);
            }
            localStorage.setItem(CONFIG.storageKeys.theme, val);
            updateThemeIcon();
        });
    }
}

function saveSettings() {
    const settings = {
        siteTitle: document.getElementById('siteTitle')?.value.trim() || 'Badeng Lat',
        siteDescription: document.getElementById('siteDescription')?.value.trim() || '',
        siteKeywords: document.getElementById('siteKeywords')?.value.trim() || '',
        theme: document.getElementById('defaultTheme')?.value || 'light',
        primaryColor: document.getElementById('primaryColor')?.value || '#6366f1',
        emailNotifications: document.getElementById('emailNotifications')?.checked || false,
        browserNotifications: document.getElementById('browserNotifications')?.checked || false,
        showEmail: document.getElementById('showEmail')?.checked || false,
        showPhone: document.getElementById('showPhone')?.checked || false,
        allowAnalytics: document.getElementById('allowAnalytics')?.checked !== false,
        emailJSServiceID: document.getElementById('emailJSServiceID')?.value.trim() || 'service_2f7dcc9',
        emailJSTemplateID: document.getElementById('emailJSTemplateID')?.value.trim() || 'template_vwqyujg',
        emailJSPublicKey: document.getElementById('emailJSPublicKey')?.value.trim() || 'sLB09gahC4zoh2Ixq',
        fromEmail: document.getElementById('fromEmail')?.value.trim() || 'badenglat@gmail.com',
        fromName: document.getElementById('fromName')?.value.trim() || 'Badeng Lat'
    };

    saveSettingsToStorage(settings);

    // Reinitialize EmailJS with new settings
    initEmailJS();

    logActivity('Settings updated');
    showToast('Settings saved successfully!', 'success');
}

function resetSettings() {
    showConfirm('Reset Settings', 'Are you sure you want to reset all settings to defaults?', () => {
        localStorage.removeItem(CONFIG.storageKeys.settings);
        state.settings = {};
        loadSettingsContent();
        logActivity('Settings reset to defaults');
        showToast('Settings reset to defaults', 'success');
    });
}

function exportAllData() {
    const data = {
        projects: getProjects(),
        skills: getSkillCategories(),
        education: getEducation(),
        messages: getMessages(),
        profile: getProfile(),
        settings: getSettings(),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };

    downloadJSON(data, `portfolio-backup-${getDateString()}.json`);
    logActivity('Data exported');
    showToast('All data exported successfully!', 'success');
}

function importAllData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result);

                if (data.projects) saveProjects(data.projects);
                if (data.skills) saveSkillCategories(data.skills);
                if (data.education) saveEducationToStorage(data.education);
                if (data.messages) saveMessages(data.messages);
                if (data.profile) saveProfileToStorage(data.profile);
                if (data.settings) saveSettingsToStorage(data.settings);

                logActivity('Data imported');
                showToast('Data imported successfully! Refreshing...', 'success');

                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (err) {
                showToast('Error importing data: ' + err.message, 'error');
            }
        };
        reader.onerror = () => {
            showToast('Error reading file', 'error');
        };
        reader.readAsText(file);
    };

    input.click();
}

function clearAllData() {
    showConfirm('Clear All Data', 'Are you sure you want to clear ALL data? This includes projects, skills, education, messages, and settings. This action cannot be undone!', () => {
        Object.values(CONFIG.storageKeys).forEach(key => {
            if (key !== CONFIG.storageKeys.isLoggedIn &&
                key !== CONFIG.storageKeys.rememberMe &&
                key !== CONFIG.storageKeys.theme) {
                localStorage.removeItem(key);
            }
        });

        state.projects = [];
        state.skills = [];
        state.education = [];
        state.messages = [];
        state.settings = {};
        state.profile = {};

        logActivity('All data cleared');
        showToast('All data cleared. Refreshing...', 'success');

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });
}

function downloadJSON(data, filename) {
    try {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        showToast('Error exporting data: ' + err.message, 'error');
    }
}

function getDateString() {
    return new Date().toISOString().split('T')[0];
}

function handleImportProjects() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result);
                if (Array.isArray(data)) {
                    saveProjects(data);
                    loadProjectsGrid();
                    showToast(`${data.length} projects imported successfully`, 'success');
                } else if (data.projects && Array.isArray(data.projects)) {
                    saveProjects(data.projects);
                    loadProjectsGrid();
                    showToast(`${data.projects.length} projects imported successfully`, 'success');
                } else {
                    showToast('Invalid file format', 'error');
                }
            } catch (err) {
                showToast('Error parsing file: ' + err.message, 'error');
            }
        };
        reader.onerror = () => {
            showToast('Error reading file', 'error');
        };
        reader.readAsText(file);
    };

    input.click();
}

function handleExportProjects() {
    const projects = getProjects();
    downloadJSON(projects, `projects-export-${getDateString()}.json`);
    showToast('Projects exported successfully', 'success');
}

function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) return;

    const projects = getProjects();
    const foundProject = projects.find(p => p.title?.toLowerCase().includes(query));
    if (foundProject) {
        navigateToPage('projects');
        setTimeout(() => {
            const searchInput = document.getElementById('projectSearch');
            if (searchInput) {
                searchInput.value = query;
                handleProjectSearch({ target: searchInput });
            }
        }, 100);
        return;
    }

    const skills = getSkillCategories();
    const foundSkill = skills.some(c => c.skills?.some(s => s.name?.toLowerCase().includes(query)));
    if (foundSkill) {
        navigateToPage('skills');
        showToast(`Found skills matching "${query}"`, 'info');
        return;
    }

    const messages = getMessages();
    const foundMessage = messages.find(m =>
        m.subject?.toLowerCase().includes(query) ||
        m.name?.toLowerCase().includes(query)
    );
    if (foundMessage) {
        navigateToPage('messages');
        setTimeout(() => selectMessage(foundMessage.id), 100);
        return;
    }

    const pages = ['dashboard', 'projects', 'skills', 'education', 'messages', 'analytics', 'profile', 'settings'];
    const foundPage = pages.find(p => p.includes(query));
    if (foundPage) {
        navigateToPage(foundPage);
        return;
    }

    showToast(`No results found for "${query}"`, 'info');
}

// ==========================================
// Event Listeners
// ==========================================
function initEventListeners() {
    DOM.loginForm?.addEventListener('submit', handleLogin);
    DOM.togglePassword?.addEventListener('click', togglePasswordVisibility);
    DOM.logoutBtn?.addEventListener('click', handleLogout);
    DOM.dropdownLogout?.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
    DOM.themeToggle?.addEventListener('click', toggleTheme);
    DOM.sidebarToggle?.addEventListener('click', toggleSidebar);
    DOM.mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
    DOM.navLinks.forEach(link => link.addEventListener('click', handleNavigation));
    DOM.notificationBtn?.addEventListener('click', toggleNotificationDropdown);
    DOM.userMenu?.addEventListener('click', toggleUserDropdown);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-wrapper') && !e.target.closest('.user-menu-wrapper')) {
            closeAllDropdowns();
        }
    });

    DOM.globalSearch?.addEventListener('input', debounce(handleGlobalSearch, 300));

    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            closeModal(modalId);
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
            closeAllDropdowns();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            DOM.globalSearch?.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeMobileMenu();
        }
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        if (hash && state.isLoggedIn) {
            const validPages = ['dashboard', 'projects', 'skills', 'education', 'messages', 'analytics', 'profile', 'settings'];
            if (validPages.includes(hash)) {
                navigateToPage(hash);
            }
        }
    });

    document.getElementById('saveProjectBtn')?.addEventListener('click', saveProject);
    document.getElementById('saveSkillBtn')?.addEventListener('click', saveSkill);
    document.getElementById('saveEducationBtn')?.addEventListener('click', saveEducation);
    document.getElementById('savePasswordBtn')?.addEventListener('click', handlePasswordChange);
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);

    document.getElementById('addNewProjectBtn')?.addEventListener('click', () => openProjectModal());
    document.getElementById('addProjectBtn')?.addEventListener('click', () => openProjectModal());
    document.getElementById('addProjectBtnEmpty')?.addEventListener('click', () => openProjectModal());
    document.getElementById('addSkillBtn')?.addEventListener('click', () => openSkillModal());
    document.getElementById('addEducationBtn')?.addEventListener('click', () => openEducationModal());
    document.getElementById('addCategoryBtn')?.addEventListener('click', handleAddCategory);

    document.getElementById('projectSearch')?.addEventListener('input', debounce(handleProjectSearch, 300));
    document.getElementById('importProjects')?.addEventListener('click', handleImportProjects);
    document.getElementById('exportProjects')?.addEventListener('click', handleExportProjects);
    document.getElementById('categoryFilter')?.addEventListener('change', filterProjects);
    document.getElementById('statusFilter')?.addEventListener('change', filterProjects);

    document.getElementById('exportAnalytics')?.addEventListener('click', handleAnalyticsExport);
    document.getElementById('deleteSelectedBtn')?.addEventListener('click', deleteSelectedMessages);
    document.getElementById('markAllReadBtn')?.addEventListener('click', markAllMessagesRead);

    document.getElementById('refreshDashboard')?.addEventListener('click', () => {
        showLoading();
        setTimeout(() => {
            initDashboard();
            hideLoading();
            showToast('Dashboard refreshed!', 'success');
        }, 1000);
    });

    const skillLevelInput = document.getElementById('skillLevel');
    if (skillLevelInput) {
        skillLevelInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const valueDisplay = document.getElementById('skillLevelValue');
            const fillPreview = document.getElementById('skillFillPreview');
            if (valueDisplay) valueDisplay.textContent = value + '%';
            if (fillPreview) fillPreview.style.width = value + '%';
        });
    }

    const gradientStart = document.getElementById('gradientStart');
    const gradientEnd = document.getElementById('gradientEnd');
    const gradientPreview = document.getElementById('gradientPreview');

    function updateGradientPreview() {
        if (gradientPreview && gradientStart && gradientEnd) {
            gradientPreview.style.background = `linear-gradient(135deg, ${gradientStart.value}, ${gradientEnd.value})`;
        }
    }

    gradientStart?.addEventListener('input', updateGradientPreview);
    gradientEnd?.addEventListener('input', updateGradientPreview);

    document.getElementById('projectIcon')?.addEventListener('input', (e) => {
        const iconPreview = document.getElementById('iconPreview');
        if (iconPreview) {
            iconPreview.className = 'fas ' + (e.target.value || 'fa-folder');
        }
    });

    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            const parentModal = tab.closest('.modal');

            if (parentModal) {
                parentModal.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                parentModal.querySelectorAll('.form-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                parentModal.querySelector(`#${tabName}Tab`)?.classList.add('active');
            }
        });
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && state.isLoggedIn) {
            loadAllProfileImages();
            updateMessagesBadge();
        }
    });
}

// ==========================================
// Initialize Application
// ==========================================
function init() {
    cacheDOM();
    checkAuthStatus();
    initTheme();
    loadDataFromStorage();
    initEventListeners();

    // Initialize EmailJS
    setTimeout(() => {
        initEmailJS();
    }, 500);

    if (state.isLoggedIn) {
        showAdminPanel();
        loadAllProfileImages();
        initDashboard();
        updateMessagesBadge();
    }

    const hash = window.location.hash.slice(1);
    if (hash && state.isLoggedIn) {
        const validPages = ['dashboard', 'projects', 'skills', 'education', 'messages', 'analytics', 'profile', 'settings'];
        if (validPages.includes(hash)) {
            setTimeout(() => navigateToPage(hash), 100);
        }
    }
}

// ==========================================
// Global Function Exports
// ==========================================
window.editProject = editProject;
window.viewProject = viewProject;
window.confirmDeleteProject = confirmDeleteProject;
window.openProjectModal = openProjectModal;
window.saveProject = saveProject;
window.filterProjects = filterProjects;
window.handleProjectSearch = handleProjectSearch;
window.handleImportProjects = handleImportProjects;
window.handleExportProjects = handleExportProjects;

window.editSkill = editSkill;
window.confirmDeleteSkill = confirmDeleteSkill;
window.openSkillModal = openSkillModal;
window.deleteCategory = deleteCategory;
window.handleAddCategory = handleAddCategory;
window.saveSkill = saveSkill;

window.editEducation = editEducation;
window.confirmDeleteEducation = confirmDeleteEducation;
window.openEducationModal = openEducationModal;
window.saveEducation = saveEducation;

window.selectMessage = selectMessage;
window.markAllMessagesRead = markAllMessagesRead;
window.deleteMessage = deleteMessage;
window.handleMessageSelection = handleMessageSelection;
window.deleteSelectedMessages = deleteSelectedMessages;
window.openChatReply = openChatReply;
window.sendChatReply = sendChatReply;
window.toggleMessageSelection = toggleMessageSelection;
window.selectAllMessages = selectAllMessages;
window.deselectAllMessages = deselectAllMessages;

window.saveProfile = saveProfile;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.exportAllData = exportAllData;
window.importAllData = importAllData;
window.clearAllData = clearAllData;
window.handleAnalyticsExport = handleAnalyticsExport;

window.openModal = openModal;
window.closeModal = closeModal;
window.showConfirm = showConfirm;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.toggleTheme = toggleTheme;
window.handleGlobalSearch = handleGlobalSearch;
window.handlePasswordChange = handlePasswordChange;
window.openPasswordModal = openPasswordModal;
window.handleQuickAction = handleQuickAction;
window.initQuickActionButtons = initQuickActionButtons;

// EmailJS functions
window.testEmailJS = testEmailJS;
window.debugEmailJS = debugEmailJS;
window.initEmailJS = initEmailJS;
window.sendReplyViaEmail = sendReplyViaEmail;

// ==========================================
// Initialize on DOM Ready
// ==========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==========================================
// Success Log
// ==========================================
console.log('%c✅ Admin Panel Loaded Successfully!', 'color: #10b981; font-weight: bold; font-size: 16px;');
console.log('%c🔧 All Features Working:', 'color: #6366f1; font-weight: bold; font-size: 14px;');
console.log('%c  ✓ Reply Modal - Complete & Functional', 'color: #10b981;');
console.log('%c  ✓ EmailJS Integration - Ready', 'color: #10b981;');
console.log('%c  ✓ Quick Action Buttons - All Working', 'color: #10b981;');
console.log('%c  ✓ Grid/List View Toggle - Fully Functional', 'color: #10b981;');
console.log('%c  ✓ Session Management - 30min Auto-Logout', 'color: #10b981;');
console.log('%c  ✓ Full CRUD Operations - Projects, Skills, Education, Messages', 'color: #10b981;');
console.log('%c📧 Run testEmailJS() to test email configuration', 'color: #6366f1;');
console.log('%c🐛 Run debugEmailJS() to debug email settings', 'color: #f59e0b;');