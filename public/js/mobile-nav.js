// Mobile navigation with GitHub Pages compatibility
(function() {
    'use strict';

    // Helper for GitHub Pages paths
    function getBasePath() {
        // Get the current path and adjust for GitHub Pages
        const path = window.location.pathname;
        const isGitHubPages = path.includes('Portfolio-TR');
        return isGitHubPages ? '/Portfolio-TR' : '';
    }

    // Update all navigation links to work with GitHub Pages
    function updateNavigationLinks() {
        const basePath = getBasePath();
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href.startsWith('/')) {
                link.href = `${basePath}${href}`;
            }
        });
    }

    // Mobile menu functionality
    function initializeMobileMenu() {
        const mobileMenu = document.querySelector('.header__sm-menu');
        const menuButton = document.querySelector('.header__main-ham-menu-cont');
        const menuOpenIcon = document.querySelector('.header__main-ham-menu');
        const menuCloseIcon = document.querySelector('.header__main-ham-menu-close');
        
        if (!mobileMenu || !menuButton) return;

        function toggleMenu(show) {
            mobileMenu.classList.toggle('header__sm-menu--active', show);
            menuOpenIcon.classList.toggle('d-none', show);
            menuCloseIcon.classList.toggle('d-none', !show);
            document.body.style.overflow = show ? 'hidden' : '';
        }

        // Handle menu button click
        menuButton.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = mobileMenu.classList.contains('header__sm-menu--active');
            toggleMenu(!isActive);
        });

        // Handle menu item clicks
        document.querySelectorAll('.header__sm-menu-link a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('header__sm-menu--active') &&
                !e.target.closest('.header__sm-menu') &&
                !e.target.closest('.header__main-ham-menu-cont')) {
                toggleMenu(false);
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('header__sm-menu--active')) {
                toggleMenu(false);
            }
        });
    }

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        updateNavigationLinks();
        initializeMobileMenu();
    });

    // Update links when navigating with history
    window.addEventListener('popstate', updateNavigationLinks);
})();
