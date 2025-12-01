// ==========================================
// DOM Content Loaded - Initialize Everything
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    initLoader();
    initNavbar();
    initMobileMenu();
    initThemeToggle();
    initTypingEffect();
    initScrollAnimations();
    initCounters();
    initProgressBars();
    initProjectFilters();
    initModal();
    initContactForm();
    initScrollToTop();
    initSmoothScroll();
    initImageErrorHandling();
    initParallaxEffect();
    // initAdminIntegration(); // Function not defined
});

// ==========================================
// Storage Keys for Admin Integration
// ==========================================
const STORAGE_KEYS = {
    projects: 'portfolioProjects',
    skills: 'portfolioSkills',
    education: 'portfolioEducation',
    messages: 'portfolioMessages',
    profile: 'portfolioProfile',
    settings: 'portfolioSettings'
};

// ==========================================
// Loader
// ==========================================
function initLoader() {
    const loader = document.getElementById('loader');

    if (!loader) return;

    window.addEventListener('load', function () {
        setTimeout(function () {
            loader.classList.add('hidden');
            document.body.style.overflow = 'visible';

            setTimeout(function () {
                loader.style.display = 'none';
            }, 500);
        }, 800);
    });

    setTimeout(function () {
        if (!loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            document.body.style.overflow = 'visible';
        }
    }, 3000);
}

// ==========================================
// Navbar Scroll Effect
// ==========================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (!navbar) return;

    let ticking = false;

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                handleNavbarScroll();
                updateActiveNavLink();
                ticking = false;
            });
            ticking = true;
        }
    });

    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    handleNavbarScroll();
    updateActiveNavLink();
}

// ==========================================
// Mobile Menu
// ==========================================
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    const navLinksItems = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (!mobileToggle || !navLinks) return;

    mobileToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
    });

    navLinksItems.forEach(link => {
        link.addEventListener('click', function () {
            closeMenu();
        });
    });

    document.addEventListener('click', function (e) {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !mobileToggle.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });

    function toggleMenu() {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }

    function closeMenu() {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.style.overflow = '';
    }
}

// ==========================================
// Theme Toggle
// ==========================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', function () {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        announceThemeChange(newTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });

    function announceThemeChange(theme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Theme changed to ${theme} mode`;
        document.body.appendChild(announcement);

        setTimeout(() => announcement.remove(), 1000);
    }
}

// ==========================================
// Typing Effect
// ==========================================
function initTypingEffect() {
    const typedElement = document.getElementById('typed');

    if (!typedElement) return;

    const texts = [
        'Full Stack Developer',
        'UI/UX Designer',
        'Mobile App Developer',
        'Problem Solver',
        'Tech Enthusiast',
        'IT Student at University of Juba'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            typedElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typedElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1500);
}

// ==========================================
// Scroll Animations
// ==========================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.fade-in, .fade-in-left, .fade-in-right, .scale-in'
    );

    if (animatedElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ==========================================
// Counter Animation
// ==========================================
function initCounters() {
    const counters = document.querySelectorAll('.counter');

    if (counters.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;

                if (!counter.classList.contains('counted')) {
                    counter.classList.add('counted');
                    animateCounter(counter);
                }
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target')) || 0;
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);

        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }

    requestAnimationFrame(updateCounter);
}

// ==========================================
// Progress Bars Animation
// ==========================================
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');

    if (progressBars.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.getAttribute('data-width');

                if (width && !progressBar.classList.contains('animated')) {
                    progressBar.classList.add('animated');

                    setTimeout(function () {
                        progressBar.style.width = width + '%';
                    }, 200);
                }
            }
        });
    }, observerOptions);

    progressBars.forEach(bar => {
        observer.observe(bar);
    });
}

// ==========================================
// Project Filters
// ==========================================
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length === 0 || projectCards.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            projectCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');

                card.style.animation = 'none';
                card.offsetHeight; // Trigger reflow

                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hidden');
                    card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// ==========================================
// Modal
// ==========================================
function initModal() {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const projectLinks = document.querySelectorAll('.project-link[data-modal]');

    if (!modal) return;

    // Project data for hardcoded projects
    const projectData = {
        project1: {
            title: 'E-Commerce Platform',
            content: `
                <p>A comprehensive e-commerce solution built with modern technologies, featuring a responsive design and seamless user experience for online shopping.</p>
                
                <h4>Project Overview</h4>
                <p>This full-stack e-commerce platform was developed to provide a complete online shopping experience. The application handles everything from product browsing to secure checkout.</p>
                
                <h4>Key Features</h4>
                <ul>
                    <li>User authentication and authorization with JWT</li>
                    <li>Product catalog with advanced search and filters</li>
                    <li>Shopping cart and wishlist functionality</li>
                    <li>Secure payment integration (Stripe/PayPal)</li>
                    <li>Order tracking and history</li>
                    <li>Admin dashboard for inventory management</li>
                    <li>Responsive design for all devices</li>
                    <li>Email notifications for orders</li>
                </ul>
                
                <h4>Technologies Used</h4>
                <p>React.js, Node.js, Express.js, MongoDB, Stripe API, JWT Authentication, Redux, Tailwind CSS</p>
                
                <h4>Challenges & Solutions</h4>
                <p>Implemented efficient state management using Redux and optimized database queries for better performance with large product catalogs.</p>
            `
        },
        project2: {
            title: 'Task Management App',
            content: `
                <p>A feature-rich mobile application designed to boost productivity and help users manage their daily tasks efficiently across multiple devices.</p>
                
                <h4>Project Overview</h4>
                <p>This cross-platform mobile app was built using Flutter to provide a seamless task management experience on both iOS and Android devices.</p>
                
                <h4>Key Features</h4>
                <ul>
                    <li>Create, edit, and delete tasks with ease</li>
                    <li>Set priorities, due dates, and reminders</li>
                    <li>Push notifications for task reminders</li>
                    <li>Categories and labels for organization</li>
                    <li>Progress tracking with visual statistics</li>
                    <li>Cloud sync across multiple devices</li>
                    <li>Dark and light theme support</li>
                    <li>Offline mode with local storage</li>
                </ul>
                
                <h4>Technologies Used</h4>
                <p>Flutter, Dart, Firebase (Authentication, Firestore, Cloud Messaging), Provider State Management, SQLite for offline storage</p>
                
                <h4>Challenges & Solutions</h4>
                <p>Implemented efficient offline-first architecture that syncs data seamlessly when connection is restored.</p>
            `
        },
        project3: {
            title: 'Learning Management System',
            content: `
                <p>An educational platform that enables instructors to create and manage courses while students can learn at their own pace with interactive content.</p>
                
                <h4>Project Overview</h4>
                <p>This comprehensive LMS was developed using Django to provide a robust platform for online education with video streaming and interactive assessments.</p>
                
                <h4>Key Features</h4>
                <ul>
                    <li>Course creation and management tools</li>
                    <li>Video streaming with progress tracking</li>
                    <li>Interactive quizzes and assessments</li>
                    <li>Discussion forums for each course</li>
                    <li>Certificate generation upon completion</li>
                    <li>Analytics dashboard for instructors</li>
                    <li>Student progress monitoring</li>
                    <li>Payment integration for premium courses</li>
                </ul>
                
                <h4>Technologies Used</h4>
                <p>Django, Python, PostgreSQL, Bootstrap, AWS S3, Celery, Redis, Video.js</p>
                
                <h4>Challenges & Solutions</h4>
                <p>Implemented adaptive video streaming for different bandwidths and efficient content delivery using AWS CloudFront.</p>
            `
        },
        project4: {
            title: 'Banking App Redesign',
            content: `
                <p>A modern UI/UX redesign concept for a mobile banking application focused on simplicity, accessibility, and enhanced user experience.</p>
                
                <h4>Project Overview</h4>
                <p>This design project aimed to reimagine the mobile banking experience with a focus on user-centered design principles and modern aesthetics.</p>
                
                <h4>Design Highlights</h4>
                <ul>
                    <li>Clean and intuitive user interface</li>
                    <li>Streamlined navigation and information architecture</li>
                    <li>Accessibility-focused design (WCAG 2.1 compliant)</li>
                    <li>Dark and light mode support</li>
                    <li>Micro-interactions and animations</li>
                    <li>Comprehensive design system</li>
                    <li>Biometric authentication flow</li>
                    <li>Quick actions for frequent transactions</li>
                </ul>
                
                <h4>Tools Used</h4>
                <p>Figma, Adobe Illustrator, Protopie, Maze for usability testing</p>
                
                <h4>Research & Process</h4>
                <p>Conducted user research, competitive analysis, and multiple rounds of usability testing to validate design decisions.</p>
            `
        },
        project5: {
            title: 'ML in Healthcare Research',
            content: `
                <p>A research paper exploring the application of machine learning algorithms for early disease prediction and diagnosis in healthcare settings.</p>
                
                <h4>Research Overview</h4>
                <p>This academic research project investigated how various machine learning models can be applied to predict diseases based on patient symptoms and medical history.</p>
                
                <h4>Research Areas</h4>
                <ul>
                    <li>Data preprocessing and feature engineering</li>
                    <li>Comparative analysis of ML algorithms</li>
                    <li>Model training, validation, and testing</li>
                    <li>Performance metrics evaluation</li>
                    <li>Real-world application potential</li>
                    <li>Ethical considerations in healthcare AI</li>
                    <li>Data privacy and security implications</li>
                </ul>
                
                <h4>Technologies & Methods Used</h4>
                <p>Python, TensorFlow, Scikit-learn, Pandas, NumPy, Matplotlib, Seaborn, Jupyter Notebooks</p>
                
                <h4>Key Findings</h4>
                <p>Achieved 94% accuracy in disease prediction using ensemble methods, with Random Forest and XGBoost showing the best performance.</p>
            `
        },
        project6: {
            title: 'Tech Blog Platform',
            content: `
                <p>A modern blogging platform designed for tech enthusiasts to share knowledge, tutorials, and engage with the developer community.</p>
                
                <h4>Project Overview</h4>
                <p>This full-stack blogging platform was built with Vue.js and Express to provide a modern writing and reading experience for technical content.</p>
                
                <h4>Key Features</h4>
                <ul>
                    <li>Rich markdown editor with live preview</li>
                    <li>Syntax highlighting for code blocks</li>
                    <li>User profiles and following system</li>
                    <li>Comments, likes, and bookmarks</li>
                    <li>Tag-based content organization</li>
                    <li>Full-text search functionality</li>
                    <li>RSS feed generation</li>
                    <li>SEO optimization</li>
                </ul>
                
                <h4>Technologies Used</h4>
                <p>Vue.js, Vuex, Express.js, MySQL, Marked.js, Highlight.js, Elasticsearch</p>
                
                <h4>Challenges & Solutions</h4>
                <p>Implemented server-side rendering for better SEO and integrated Elasticsearch for fast full-text search across all articles.</p>
            `
        }
    };

    // Store project data globally for viewProjectDetails function
    window.projectData = projectData;

    // Open modal for hardcoded projects
    projectLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const projectId = this.getAttribute('data-modal');

            if (projectId && projectData[projectId]) {
                openModal(projectData[projectId]);
            }
        });
    });

    // Close modal - close button
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close modal - outside click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal - escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function openModal(data) {
        if (modalTitle) modalTitle.textContent = data.title;
        if (modalBody) modalBody.innerHTML = data.content;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (modalClose) modalClose.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Make openModal available globally
    window.openProjectModal = openModal;
    window.closeProjectModal = closeModal;
}

// ==========================================
// View Project Details (for admin-loaded projects)
// ==========================================
function viewProjectDetails(projectId) {
    try {
        const storedProjects = localStorage.getItem(STORAGE_KEYS.projects);
        if (!storedProjects) return;

        const projects = JSON.parse(storedProjects);
        const project = projects.find(p => p.id === projectId);

        if (project && window.openProjectModal) {
            const modalData = {
                title: project.title,
                content: `
                    <p>${escapeHtml(project.description)}</p>
                    
                    ${project.fullDescription ? `
                        <h4>Project Overview</h4>
                        <p>${escapeHtml(project.fullDescription)}</p>
                    ` : ''}
                    
                    <h4>Technologies Used</h4>
                    <p>${(project.technologies || []).join(', ')}</p>
                    
                    ${project.features ? `
                        <h4>Key Features</h4>
                        <ul>
                            ${project.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    ${project.liveUrl || project.githubUrl ? `
                        <h4>Links</h4>
                        <p>
                            ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank">Live Demo</a>` : ''}
                            ${project.liveUrl && project.githubUrl ? ' | ' : ''}
                            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank">GitHub</a>` : ''}
                        </p>
                    ` : ''}
                `
            };
            window.openProjectModal(modalData);
        }
    } catch (error) {
        console.error('Error viewing project details:', error);
    }
}

// Make viewProjectDetails available globally
window.viewProjectDetails = viewProjectDetails;

// ==========================================
// Contact Form
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;

        // Get form data
        const formData = {
            name: form.querySelector('#name').value.trim(),
            email: form.querySelector('#email').value.trim(),
            subject: form.querySelector('#subject').value.trim(),
            message: form.querySelector('#message').value.trim()
        };

        // Validate form
        const validation = validateForm(formData);

        if (!validation.isValid) {
            showNotification(validation.message, 'error');
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Save to admin dashboard (localStorage)
        const formDataObj = new FormData(form);
        const saved = saveContactMessage(formDataObj);

        // Simulate form submission
        setTimeout(function () {
            if (saved) {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitBtn.classList.remove('loading');
                submitBtn.classList.add('success');

                showNotification('Your message has been sent successfully!', 'success');

                form.reset();

                // Reset field styles
                const inputs = form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.style.borderColor = 'var(--border)';
                });

                setTimeout(function () {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.classList.remove('success');
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                showNotification('Failed to send message. Please try again.', 'error');
            }
        }, 2000);
    });

    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        // Clear error style on focus
        input.addEventListener('focus', function () {
            if (this.style.borderColor === 'var(--error)') {
                this.style.borderColor = 'var(--primary)';
            }
        });
    });
}

function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.name || data.name.length < 2) {
        return { isValid: false, message: 'Please enter a valid name (at least 2 characters)' };
    }

    if (!emailRegex.test(data.email)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }

    if (!data.subject || data.subject.length < 3) {
        return { isValid: false, message: 'Please enter a subject (at least 3 characters)' };
    }

    if (!data.message || data.message.length < 10) {
        return { isValid: false, message: 'Please enter a message (at least 10 characters)' };
    }

    return { isValid: true, message: '' };
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    let isValid = true;

    switch (fieldName) {
        case 'name':
            isValid = value.length >= 2;
            break;
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;
        case 'subject':
            isValid = value.length >= 3;
            break;
        case 'message':
            isValid = value.length >= 10;
            break;
    }

    if (isValid) {
        field.style.borderColor = 'var(--success)';
    } else if (value.length > 0) {
        field.style.borderColor = 'var(--error)';
    } else {
        field.style.borderColor = 'var(--border)';
    }

    return isValid;
}

// ==========================================
// Save Contact Message to Admin Dashboard
// ==========================================
function saveContactMessage(formData) {
    try {
        const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');

        const newMessage = {
            id: 'msg_' + Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            date: new Date().toISOString(),
            unread: true
        };

        messages.unshift(newMessage);
        localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));

        return true;
    } catch (error) {
        console.error('Error saving message:', error);
        return false;
    }
}

// ==========================================
// Notification System (Single Implementation)
// ==========================================
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Trigger show animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));

    // Auto remove after delay
    setTimeout(function () {
        removeNotification(notification);
    }, 5000);
}

function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(function () {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// ==========================================
// Scroll to Top
// ==========================================
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTop');

    if (!scrollTopBtn) return;

    let ticking = false;

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                if (window.scrollY > 500) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==========================================
// Smooth Scroll
// ==========================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href === '#' || href === '') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.offsetTop - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                history.pushState(null, null, href);
            }
        });
    });

    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function () {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;

                window.scrollTo({
                    top: aboutSection.offsetTop - navbarHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// ==========================================
// Image Error Handling
// ==========================================
function initImageErrorHandling() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.addEventListener('error', function () {
            this.style.display = 'none';

            const parent = this.parentElement;

            if (!parent.querySelector('.fallback-icon')) {
                const fallbackIcon = document.createElement('i');
                fallbackIcon.className = 'fas fa-user fallback-icon';
                fallbackIcon.style.cssText = `
                    font-size: inherit;
                    color: var(--primary);
                    opacity: 0.3;
                `;
                parent.appendChild(fallbackIcon);
            }
        });

        img.addEventListener('load', function () {
            this.style.opacity = '1';

            const parent = this.parentElement;
            const fallbackIcon = parent.querySelector('.fallback-icon');
            if (fallbackIcon) {
                fallbackIcon.remove();
            }
        });
    });
}

// ==========================================
// Parallax Effect
// ==========================================
function initParallaxEffect() {
    const shapes = document.querySelectorAll('.shape');

    if (shapes.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    let ticking = false;

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                const scrolled = window.scrollY;

                shapes.forEach((shape, index) => {
                    const speed = 0.3 + (index * 0.1);
                    const yPos = scrolled * speed;
                    shape.style.transform = `translateY(${yPos}px)`;
                });

                ticking = false;
            });
            ticking = true;
        }
    });
}

// ==========================================
// Utility Functions
// ==========================================
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

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// Add Required CSS Animations
// ==========================================
function addAnimationStyles() {
    const styleId = 'dynamic-animations';

    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOutDown {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(30px);
            }
        }
        
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(style);
}

addAnimationStyles();

// ==========================================
// Keyboard Navigation Enhancement
// ==========================================
function initKeyboardNavigation() {
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary);
        color: white;
        padding: 8px 16px;
        z-index: 10001;
        transition: top 0.3s;
        text-decoration: none;
        border-radius: 0 0 5px 0;
    `;

    skipLink.addEventListener('focus', function () {
        this.style.top = '0';
    });

    skipLink.addEventListener('blur', function () {
        this.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

// initServiceWorker();

// ==========================================
// Export Functions for External Use
// ==========================================
window.portfolioApp = {
    showNotification: showNotification,
    debounce: debounce,
    throttle: throttle,
    isInViewport: isInViewport,
    escapeHtml: escapeHtml,
    viewProjectDetails: viewProjectDetails
};