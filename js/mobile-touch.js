// Mobile touch handling for navigation
let touchStartY = 0;
let touchEndY = 0;
const MIN_SWIPE_DISTANCE = 50;

document.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  touchEndY = e.changedTouches[0].clientY;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeDistance = touchEndY - touchStartY;
  const mobileMenu = document.querySelector('.header__sm-menu');
  
  // If swiping up and menu is open, close it
  if (swipeDistance < -MIN_SWIPE_DISTANCE && 
      mobileMenu.classList.contains('header__sm-menu--active')) {
    toggleMobileMenu(false);
  }
}

// Improve scroll performance
let isScrolling;
window.addEventListener('scroll', () => {
  // Clear timeout if scrolling
  window.clearTimeout(isScrolling);
  
  // Set timeout to run after scrolling ends
  isScrolling = setTimeout(() => {
    const mobileMenu = document.querySelector('.header__sm-menu');
    if (mobileMenu.classList.contains('header__sm-menu--active')) {
      toggleMobileMenu(false);
    }
  }, 150);
}, { passive: true });