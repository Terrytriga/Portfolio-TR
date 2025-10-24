// Mobile menu handling
const hamMenuBtn = document.querySelector('.header__main-ham-menu-cont')
const smallMenu = document.querySelector('.header__sm-menu')
const headerHamMenuBtn = document.querySelector('.header__main-ham-menu')
const headerHamMenuCloseBtn = document.querySelector('.header__main-ham-menu-close')
const headerSmallMenuLinks = document.querySelectorAll('.header__sm-menu-link')

// Toggle mobile menu
function toggleMobileMenu(show) {
  if (show) {
    smallMenu.classList.add('header__sm-menu--active')
    headerHamMenuBtn.classList.add('d-none')
    headerHamMenuCloseBtn.classList.remove('d-none')
    smallMenu.style.visibility = 'visible'
    smallMenu.style.opacity = '1'
  } else {
    smallMenu.classList.remove('header__sm-menu--active')
    headerHamMenuBtn.classList.remove('d-none')
    headerHamMenuCloseBtn.classList.add('d-none')
    smallMenu.style.visibility = 'hidden'
    smallMenu.style.opacity = '0'
  }
}

// Handle mobile menu button click
hamMenuBtn.addEventListener('click', () => {
  const isMenuActive = smallMenu.classList.contains('header__sm-menu--active')
  toggleMobileMenu(!isMenuActive)
})

// Handle mobile menu link clicks
headerSmallMenuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.querySelector('a').getAttribute('href')
    
    // Close the mobile menu
    toggleMobileMenu(false)
    
    // Handle navigation
    if (href.includes('#')) {
      e.preventDefault()
      const targetId = href.split('#')[1]
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = href
      }
    }
  })
})

// Handle logo click
const headerLogoContainer = document.querySelector('.header__logo-container')
headerLogoContainer.addEventListener('click', () => {
  location.href = '/index.html'
})

// Close mobile menu on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 600) { // 37.5em = 600px
    toggleMobileMenu(false)
  }
})

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.header__main-ham-menu-cont') && 
      !e.target.closest('.header__sm-menu') &&
      smallMenu.classList.contains('header__sm-menu--active')) {
    toggleMobileMenu(false)
  }
})
