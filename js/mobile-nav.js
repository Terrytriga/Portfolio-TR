// Enhanced mobile navigation with device compatibility fixes
(function() {
    'use strict';

    // Cache DOM elements
    const mobileMenu = document.querySelector('.header__sm-menu');
    const menuButton = document.querySelector('.header__main-ham-menu-cont');
    const menuOpenIcon = document.querySelector('.header__main-ham-menu');
    const menuCloseIcon = document.querySelector('.header__main-ham-menu-close');
    const links = document.querySelectorAll('.header__sm-menu-link a');
    
    // State tracking
    let isMenuOpen = false;
    let startY = 0;
    let startX = 0;
    
    // Feature detection
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Constants
    const SWIPE_THRESHOLD = 50;
    const SCROLL_LOCK_TIMEOUT = 300;
    
    // Utility functions
    function lockScroll() {
        if (isIOS) {
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${window.scrollY}px`;
        } else {
            document.body.style.overflow = 'hidden';
        }
    }
    
    function unlockScroll() {
        if (isIOS) {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        } else {
            document.body.style.overflow = '';
        }
    }
    
    // Menu state management
    function openMenu() {
        isMenuOpen = true;
        mobileMenu.classList.add('header__sm-menu--active');
        menuOpenIcon.classList.add('d-none');
        menuCloseIcon.classList.remove('d-none');
        lockScroll();
        
        // Force repaint to ensure transitions work
        mobileMenu.offsetHeight;
    }
    
    function closeMenu() {
        isMenuOpen = false;
        mobileMenu.classList.remove('header__sm-menu--active');
        menuOpenIcon.classList.remove('d-none');
        menuCloseIcon.classList.add('d-none');
        unlockScroll();
    }
    
    // Event handlers
    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
    }
    
    function handleTouchMove(e) {
        if (!isMenuOpen) return;
        
        const deltaY = e.touches[0].clientY - startY;
        const deltaX = e.touches[0].clientX - startX;
        
        // Only handle vertical swipes
        if (Math.abs(deltaX) > Math.abs(deltaY)) return;
        
        if (deltaY > SWIPE_THRESHOLD) {
            closeMenu();
        }
    }
    
    function handleLink(e) {
        const href = e.currentTarget.getAttribute('href');
        
        if (href.includes('#')) {
            e.preventDefault();
            closeMenu();
            
            // Delay scrolling to ensure menu close animation completes
            setTimeout(() => {
                const targetId = href.split('#')[1];
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, SCROLL_LOCK_TIMEOUT);
        } else {
            closeMenu();
        }
    }
    
    // Event listeners
    menuButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Touch event handling
    if (hasTouch) {
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
    }
    
    // Link handling
    links.forEach(link => {
        link.addEventListener('click', handleLink);
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });
    
    // Close menu on resize to landscape
    window.addEventListener('resize', () => {
        if (window.innerWidth > window.innerHeight && isMenuOpen) {
            closeMenu();
        }
    });
    
    // Close menu on orientation change
    window.addEventListener('orientationchange', () => {
        if (isMenuOpen) {
            closeMenu();
        }
    });
    
    // Handle Android back button
    window.addEventListener('popstate', () => {
        if (isMenuOpen) {
            closeMenu();
            history.pushState(null, '', location.href);
        }
    });
    
    // Initialize history state for back button handling
    history.pushState(null, '', location.href);
})();