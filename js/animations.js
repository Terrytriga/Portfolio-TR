// Reveal animations for sections
const revealElements = document.querySelectorAll('.projects__row, .skills__skill');
const observerOptions = {
  root: null,
  threshold: 0.1,
  rootMargin: '0px'
};

const revealOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.visibility = 'visible';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

revealElements.forEach(element => {
  element.style.visibility = 'hidden';
  revealOnScroll.observe(element);
});

// Smooth scroll handling with keyboard navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });
      // Update focus for accessibility
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus({preventScroll: true});
    }
  });
});

// Add dark mode toggle
const darkModeToggle = document.createElement('button');
darkModeToggle.classList.add('theme-toggle');
darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
darkModeToggle.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
`;

document.querySelector('.header__content').appendChild(darkModeToggle);

// Add theme toggle functionality
darkModeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-theme');
  const isDark = document.documentElement.classList.contains('dark-theme');
  localStorage.setItem('dark-theme', isDark);
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('dark-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme !== null) {
  document.documentElement.classList.toggle('dark-theme', savedTheme === 'true');
} else if (prefersDark) {
  document.documentElement.classList.add('dark-theme');
}