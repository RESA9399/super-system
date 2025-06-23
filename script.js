/**
 * Kurdish City - Main JavaScript File
 * کوردیش سیتی - فایلی سەرەکی JavaScript
 */

'use strict';

// =========================================
// Global Variables & Configuration
// =========================================
const CONFIG = {
    serverIP: 'kurdish.city:30120',
    updateInterval: 30000, // 30 seconds
    animationDuration: 300,
    scrollOffset: 80
};

// Server status data
let serverData = {
    status: 'online',
    playersOnline: 127,
    maxPlayers: 200,
    ping: 45,
    uptime: 99.9
};

// =========================================
// Utility Functions
// =========================================

/**
 * Debounce function to limit function calls
 */
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

/**
 * Generate random number between min and max
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format number with Kurdish digits
 */
function formatKurdishNumber(num) {
    const kurdishDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, digit => kurdishDigits[digit]);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff6b6b' : '#45b7d1'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =========================================
// Loading Screen Management
// =========================================
class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading');
        this.minLoadTime = 1000; // Minimum loading time
        this.startTime = Date.now();
    }

    hide() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);
        
        setTimeout(() => {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                document.body.classList.add('loaded');
            }, 500);
        }, remainingTime);
    }
}

// =========================================
// Navigation Management
// =========================================
class NavigationManager {
    constructor() {
        this.header = document.querySelector('.header');
        this.mobileToggle = document.getElementById('mobileMenuToggle');
        this.navMenu = document.getElementById('navMenu');
        this.scrollIndicator = document.getElementById('scrollIndicator');
        
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupSmoothScrolling();
    }

    setupMobileMenu() {
        this.mobileToggle?.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.mobileToggle.textContent = this.navMenu.classList.contains('active') ? '✕' : '☰';
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container') && this.navMenu.classList.contains('active')) {
                this.navMenu.classList.remove('active');
                this.mobileToggle.textContent = '☰';
            }
        });
    }

    setupScrollEffects() {
        const debouncedScroll = debounce(() => {
            this.updateScrollIndicator();
            this.updateHeaderAppearance();
        }, 10);

        window.addEventListener('scroll', debouncedScroll);
    }

    updateScrollIndicator() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        if (this.scrollIndicator) {
            this.scrollIndicator.style.width = `${Math.min(scrollPercent, 100)}%`;
        }
    }

    updateHeaderAppearance() {
        if (!this.header) return;
        
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            this.header.style.background = 'rgba(0, 0, 0, 0.98)';
            this.header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
            this.header.style.backdropFilter = 'blur(20px)';
        } else {
            this.header.style.background = 'rgba(0, 0, 0, 0.95)';
            this.header.style.boxShadow = 'none';
            this.header.style.backdropFilter = 'blur(15px)';
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const targetPosition = target.offsetTop - CONFIG.scrollOffset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (this.navMenu.classList.contains('active')) {
                        this.navMenu.classList.remove('active');
                        this.mobileToggle.textContent = '☰';
                    }
                }
            });
        });
    }
}

// =========================================
// Server Status Management
// =========================================
class ServerStatusManager {
    constructor() {
        this.statusElements = {
            status: document.getElementById('serverStatus'),
            playerCount: document.getElementById('playerCount'),
            ping: document.getElementById('ping'),
            uptime: document.getElementById('uptime')
        };
        
        this.init();
    }

    init() {
        this.updateDisplay();
        this.startAutoUpdate();
    }

    async fetchServerData() {
        try {
            // In real implementation, this would fetch from your API
            // For demo purposes, we'll simulate server data
            const isOnline = Math.random() > 0.1; // 90% uptime simulation
            
            serverData = {
                status: isOnline ? 'online' : 'offline',
                playersOnline: isOnline ? randomBetween(80, 200) : 0,
                maxPlayers: 200,
                ping: isOnline ? randomBetween(25, 80) : 0,
                uptime: parseFloat((99.5 + Math.random() * 0.4).toFixed(1))
            };
            
            return serverData;
        } catch (error) {
            console.error('Failed to fetch server data:', error);
            return null;
        }
    }

    updateDisplay() {
        if (!this.statusElements.status) return;

        const { status, playersOnline, maxPlayers, ping, uptime } = serverData;
        
        // Update status
        const statusText = status === 'online' ? '🟢 ئۆنلاین' : '🔴 ناکارا';
        const statusClass = status === 'online' ? 'status-online' : 'status-offline';
        
        this.statusElements.status.textContent = statusText;
        this.statusElements.status.className = statusClass;
        
        // Update player count
        if (this.statusElements.playerCount) {
            this.statusElements.playerCount.textContent = `${playersOnline}/${maxPlayers}`;
        }
        
        // Update ping
        if (this.statusElements.ping) {
            this.statusElements.ping.textContent = status === 'online' ? `${ping}ms` : 'N/A';
        }
        
        // Update uptime
        if (this.statusElements.uptime) {
            this.statusElements.uptime.textContent = `${uptime}%`;
        }
    }

    startAutoUpdate() {
        setInterval(async () => {
            await this.fetchServerData();
            this.updateDisplay();
        }, CONFIG.updateInterval);
    }
}

// =========================================
// Animation & Intersection Observer
// =========================================
class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }

    init() {
        this.setupFadeInAnimations();
        this.setupCounterAnimations();
    }

    setupFadeInAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add stagger effect for grouped elements
                    const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
                    siblings.forEach((sibling, index) => {
                        if (sibling === entry.target) return;
                        setTimeout(() => {
                            sibling.classList.add('visible');
                        }, index * 100);
                    });
                }
            });
        }, this.observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    setupCounterAnimations() {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-number').forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current);
        }, 16);
    }
}

// =========================================
// Server Connection Functions
// =========================================

/**
 * Connect to FiveM server
 */
function connectToServer() {
    // Show loading state
    const button = event?.target;
    const originalText = button?.textContent;
    
    if (button) {
        button.textContent = '🔄 پەیوەندیکردن...';
        button.disabled = true;
    }
    
    try {
        // Primary method: FiveM protocol
        const fivemUrl = `fivem://connect/${CONFIG.serverIP}`;
        window.open(fivemUrl, '_blank');
        
        showNotification('پەیوەندیکردن بە سێرڤەر...', 'info');
        
        // Fallback: Copy IP to clipboard
        setTimeout(() => {
            copyServerIP();
        }, 2000);
        
    } catch (error) {
        console.error('Connection failed:', error);
        showNotification('هەڵە لە پەیوەندیکردن! IP کۆپی کرا.', 'error');
        copyServerIP();
    } finally {
        // Restore button state
        if (button) {
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        }
    }
}

/**
 * Copy server IP to clipboard
 */
async function copyServerIP() {
    try {
        await navigator.clipboard.writeText(CONFIG.serverIP);
        showNotification('✅ ئادرەسی سێرڤەر کۆپی کرا!', 'success');
        
        // Update button visual feedback
        const button = event?.target;
        if (button) {
            const originalText = button.textContent;
            const originalBg = button.style.background;
            
            button.textContent = '✅ کۆپی کرا!';
            button.style.background = 'linear-gradient(45deg, #4ecdc4, #45b7d1)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = originalBg;
            }, 2000);
        }
        
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = CONFIG.serverIP;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showNotification('✅ ئادرەسی سێرڤەر کۆپی کرا!', 'success');
        } catch (fallbackError) {
            showNotification(`ئادرەسی سێرڤەر: ${CONFIG.serverIP}`, 'info');
        }
        
        document.body.removeChild(textArea);
    }
}

// =========================================
// Easter Eggs & Special Features
// =========================================
class EasterEggManager {
    constructor() {
        this.konamiCode = [];
        this.targetCode = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        this.clickCount = 0;
        
        this.init();
    }

    init() {
        this.setupKonamiCode();
        this.setupLogoEasterEgg();
        this.setupConsoleMessage();
    }

    setupKonamiCode() {
        document.addEventListener('keydown', (e) => {
            this.konamiCode.push(e.code);
            
            if (this.konamiCode.length > this.targetCode.length) {
                this.konamiCode.shift();
            }
            
            if (JSON.stringify(this.konamiCode) === JSON.stringify(this.targetCode)) {
                this.activateKonamiEffect();
                this.konamiCode = [];
            }
        });
    }

    setupLogoEasterEgg() {
        const logo = document.querySelector('.logo');
        if (!logo) return;
        
        logo.addEventListener('click', () => {
            this.clickCount++;
            
            if (this.clickCount === 10) {
                this.activateRainbowMode();
                this.clickCount = 0;
            }
        });
    }

    activateKonamiEffect() {
        document.body.style.filter = 'hue-rotate(180deg) saturate(1.5)';
        showNotification('🎉 Konami Code فعال بوو! ڕەنگەکان گۆڕدران!', 'success');
        
        setTimeout(() => {
            document.body.style.filter = '';
        }, 5000);
    }

    activateRainbowMode() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
            .logo { animation: rainbow 2s linear infinite; }
        `;
        document.head.appendChild(style);
        
        showNotification('🌈 حاڵەتی ڕەنگینەکەمان چالاک بوو!', 'success');
        
        setTimeout(() => {
            style.remove();
        }, 10000);
    }

    setupConsoleMessage() {
        const messages = [
            '🏙️ کوردیش سیتی - Kurdish City',
            '════════════════════════════════',
            '🎮 باشترین سێرڤەری FiveM لە کوردستان',
            '🔗 پەیوەندی: kurdish.city:30120',
            '💻 GitHub: github.com/kurdish-city',
            '👨‍💻 بەرنامەنووس بوویت؟ پەیوەندیمان پێوە بکە!',
            '════════════════════════════════',
            '💡 تۆ ئێستا لە Developer Console دایت!',
            '🎯 ئەگەر حەز دەکەیت یارمەتیمان بدەیت:',
            '📧 ئیمەیڵ: dev@kurdish.city'
        ];
        
        console.log('%c' + messages.join('\n'), 
            'color: #4ecdc4; font-size: 12px; font-family: monospace;'
        );
    }
}

// =========================================
// Performance & Optimization
// =========================================
class PerformanceManager {
    constructor() {
        this.init();
    }

    init() {
        this.preloadImages();
        this.setupLazyLoading();
        this.monitorPerformance();
    }

    preloadImages() {
        const imageUrls = [
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>'
        ];
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    monitorPerformance() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                console.log(`⚡ کاتی بارکردنی پەڕە: ${loadTime}ms`);
                
                // Send analytics if needed
                if (loadTime > 3000) {
                    console.warn('⚠️ پەڕەکە زۆر خاو بارببوو');
                }
            }
        });
    }
}

// =========================================
// Error Handling & Logging
// =========================================
class ErrorManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalErrorHandler();
        this.setupUnhandledRejectionHandler();
    }

    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global Error:', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
            
            // Show user-friendly error message
            showNotification('هەڵەیەک ڕوویدا. تکایە پەڕەکە نوێ بکەرەوە.', 'error');
        });
    }

    setupUnhandledRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled Promise Rejection:', event.reason);
            event.preventDefault();
        });
    }
}

// =========================================
// Local Storage Manager
// =========================================
class StorageManager {
    constructor() {
        this.prefix = 'kurdish_city_';
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Storage not available:', error);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error reading from storage:', error);
            return defaultValue;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.warn('Error removing from storage:', error);
            return false;
        }
    }

    clear() {
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(this.prefix)
            );
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.warn('Error clearing storage:', error);
            return false;
        }
    }
}

// =========================================
// Theme & Settings Manager
// =========================================
class ThemeManager {
    constructor() {
        this.storage = new StorageManager();
        this.currentTheme = this.storage.get('theme', 'dark');
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupThemeToggle();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.storage.set('theme', this.currentTheme);
        this.applyTheme();
        
        showNotification(
            `تیمی ${this.currentTheme === 'dark' ? 'تاریک' : 'ڕووناک'} چالاک کرا`,
            'success'
        );
    }

    setupThemeToggle() {
        // Add theme toggle button if needed
        const themeToggle = document.createElement('button');
        themeToggle.innerHTML = '🌙';
        themeToggle.className = 'theme-toggle';
        themeToggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: var(--gradient-primary);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Only add if not mobile
        if (window.innerWidth > 768) {
            document.body.appendChild(themeToggle);
        }
    }
}

// =========================================
// Analytics & Tracking
// =========================================
class AnalyticsManager {
    constructor() {
        this.storage = new StorageManager();
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackUserInteractions();
        this.trackSessionData();
    }

    generateSessionId() {
        return Math.random().toString(36).substr(2, 9);
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        console.log('📊 Page View:', pageData);
        // Send to analytics service if needed
    }

    trackUserInteractions() {
        // Track button clicks
        document.addEventListener('click', (event) => {
            if (event.target.matches('.btn, .social-link, .feature-card')) {
                const interactionData = {
                    type: 'click',
                    element: event.target.className,
                    text: event.target.textContent?.trim(),
                    timestamp: new Date().toISOString(),
                    sessionId: this.sessionId
                };
                
                console.log('👆 User Interaction:', interactionData);
            }
        });

        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', debounce(() => {
            const scrollDepth = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                
                if (maxScrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                    console.log('📜 Scroll Depth:', maxScrollDepth + '%');
                }
            }
        }, 1000));
    }

    trackSessionData() {
        // Track session duration on page unload
        window.addEventListener('beforeunload', () => {
            const sessionDuration = Date.now() - this.startTime;
            console.log('⏱️ Session Duration:', Math.round(sessionDuration / 1000) + ' seconds');
        });
    }
}

// =========================================
// Accessibility Manager
// =========================================
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        // Enable keyboard navigation for custom elements
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                if (event.target.matches('.feature-card, .social-link')) {
                    event.preventDefault();
                    event.target.click();
                }
            }
            
            // ESC to close mobile menu
            if (event.key === 'Escape') {
                const navMenu = document.getElementById('navMenu');
                const mobileToggle = document.getElementById('mobileMenuToggle');
                
                if (navMenu?.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileToggle.textContent = '☰';
                    mobileToggle.focus();
                }
            }
        });
    }

    setupAriaLabels() {
        // Add missing aria labels
        const elementsNeedingLabels = [
            { selector: '.mobile-menu-toggle', label: 'Toggle navigation menu' },
            { selector: '.scroll-indicator', label: 'Page scroll progress' },
            { selector: '.loading-screen', label: 'Page loading' }
        ];

        elementsNeedingLabels.forEach(({ selector, label }) => {
            const element = document.querySelector(selector);
            if (element && !element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', label);
            }
        });
    }

    setupFocusManagement() {
        // Trap focus in mobile menu when open
        const navMenu = document.getElementById('navMenu');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        
        if (navMenu && mobileToggle) {
            navMenu.addEventListener('keydown', (event) => {
                if (event.key === 'Tab' && navMenu.classList.contains('active')) {
                    const focusableElements = navMenu.querySelectorAll('a');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (event.shiftKey && document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    } else if (!event.shiftKey && document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }
}

// =========================================
// Main Application Class
// =========================================
class KurdishCityApp {
    constructor() {
        this.managers = {};
        this.init();
    }

    async init() {
        try {
            // Initialize loading manager first
            this.managers.loading = new LoadingManager();
            
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize all managers
            this.managers.storage = new StorageManager();
            this.managers.navigation = new NavigationManager();
            this.managers.serverStatus = new ServerStatusManager();
            this.managers.animation = new AnimationManager();
            this.managers.easterEgg = new EasterEggManager();
            this.managers.performance = new PerformanceManager();
            this.managers.error = new ErrorManager();
            this.managers.theme = new ThemeManager();
            this.managers.analytics = new AnalyticsManager();
            this.managers.accessibility = new AccessibilityManager();
            
            // Hide loading screen
            this.managers.loading.hide();
            
            console.log('✅ Kurdish City App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            showNotification('هەڵە لە دەستپێکردنی ئاپ!', 'error');
        }
    }

    // Public API methods
    getManager(name) {
        return this.managers[name];
    }

    updateServerData(newData) {
        Object.assign(serverData, newData);
        this.managers.serverStatus?.updateDisplay();
    }

    showNotification(message, type = 'info') {
        showNotification(message, type);
    }
}

// =========================================
// Global Functions (backwards compatibility)
// =========================================
window.connectToServer = connectToServer;
window.copyServerIP = copyServerIP;
window.showNotification = showNotification;

// =========================================
// Initialize Application
// =========================================
let app;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new KurdishCityApp();
    });
} else {
    app = new KurdishCityApp();
}

// Make app globally available for debugging
window.KurdishCityApp = app;

// =========================================
// CSS Animations (added via JavaScript)
// =========================================
const cssAnimations = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0,0,0);
    }
    40%, 43% {
        transform: translate3d(0, -30px, 0);
    }
    70% {
        transform: translate3d(0, -15px, 0);
    }
    90% {
        transform: translate3d(0, -4px, 0);
    }
}

.bounce {
    animation: bounce 1s ease-in-out;
}
`;

// Inject CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = cssAnimations;
document.head.appendChild(styleSheet);

// =========================================
// Service Worker Registration (Progressive Web App)
// =========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered successfully');
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// =========================================
// Export for module usage
// =========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        KurdishCityApp,
        connectToServer,
        copyServerIP,
        showNotification
    };
}