// Handle navigation errors and provide fallback
function handleNavigationError() {
  if (document.referrer === '') {
    // If accessed directly, redirect to home
    window.location.href = '/index.html';
  }
}

// Add error handling for navigation
window.addEventListener('error', function(e) {
  if (e.target.tagName === 'A') {
    handleNavigationError();
  }
}, true);

// Handle mobile navigation
document.addEventListener('DOMContentLoaded', function() {
  // Fix mobile menu state
  const mobileMenu = document.querySelector('.header__sm-menu');
  const mobileMenuBtn = document.querySelector('.header__main-ham-menu-cont');
  const menuOpenBtn = document.querySelector('.header__main-ham-menu');
  const menuCloseBtn = document.querySelector('.header__main-ham-menu-close');

  // Ensure menu is closed by default
  mobileMenu.style.visibility = 'hidden';
  mobileMenu.style.opacity = '0';
  menuOpenBtn.classList.remove('d-none');
  menuCloseBtn.classList.add('d-none');

  // Handle navigation clicks
  document.querySelectorAll('a[data-nav]').forEach(link => {
    link.addEventListener('click', function(e) {
      // Store the target URL
      const href = this.getAttribute('href');
      
      // Close mobile menu
      mobileMenu.style.visibility = 'hidden';
      mobileMenu.style.opacity = '0';
      mobileMenu.classList.remove('header__sm-menu--active');
      menuOpenBtn.classList.remove('d-none');
      menuCloseBtn.classList.add('d-none');

      // If it's a hash link, handle smooth scroll
      if (href.includes('#')) {
        e.preventDefault();
        const targetId = href.split('#')[1];
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = href;
        }
      }
    });
  });
});

// Handle back button
window.addEventListener('popstate', function() {
  const mobileMenu = document.querySelector('.header__sm-menu');
  if (mobileMenu) {
    mobileMenu.style.visibility = 'hidden';
    mobileMenu.style.opacity = '0';
    mobileMenu.classList.remove('header__sm-menu--active');
  }
});