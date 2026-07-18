/* ===== THEME SYSTEM ===== */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    
    if (typeof terminalOutput !== 'undefined' && terminalOutput) {
        const toast = document.createElement('div');
        toast.className = 'terminal-line';
        toast.innerHTML = `<span class="t-comment"># Theme switched to ${theme} mode</span>`;
        terminalOutput.appendChild(toast);
        scrollToBottom();
    }
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

window.setTheme = setTheme;

/* ===== NAVBAR: HIDE ON SCROLL, SHOW WHEN IDLE ===== */
const navbar = document.getElementById('navbar');
const homeSection = document.getElementById('home');
let scrollTimeout;
let isScrolling = false;
let lastScrollY = 0;

function handleScroll() {
    const currentScrollY = window.scrollY;
    const homeSectionBottom = homeSection
        ? homeSection.offsetTop + homeSection.offsetHeight - 64
        : 50;
    
    // Always show navbar while in home section
    if (currentScrollY <= homeSectionBottom) {
        navbar.classList.add('visible');
        isScrolling = false;
        return;
    }
    
    // Detect scroll direction and activity
    isScrolling = true;
    navbar.classList.remove('visible');
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Set new timeout - navbar reappears when scrolling stops
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        navbar.classList.add('visible');
    }, 150); // 150ms delay after scroll stops
}

// Use passive listener for better performance
window.addEventListener('scroll', handleScroll, { passive: true });

// Also show navbar when mouse moves near top of screen
document.addEventListener('mousemove', (e) => {
    if (e.clientY <= 80 && !isScrolling) {
        navbar.classList.add('visible');
    }
});

// Initial state - show navbar
navbar.classList.add('visible');

/* ===== SCROLL PROGRESS BAR ===== */
function updateScrollProgress() {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    document.getElementById('scroll-progress').style.width = progress + '%';
}

/* ===== ACTIVE NAV LINK HIGHLIGHTING ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveLink() {
    let current = '';
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            current = sectionId;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

/* ===== COMBINED SCROLL HANDLER ===== */
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateScrollProgress();
            updateActiveLink();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

/* ===== MOBILE HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});
