/* ===== THEME SYSTEM ===== */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Nav toggle click handler
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Global theme setter (used by terminal too)
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);

    // Optional: show subtle toast in terminal if open
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

// Expose to window for terminal access
window.setTheme = setTheme;

/* ===== SCROLL PROGRESS BAR ===== */
function updateScrollProgress() {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    document.getElementById('scroll-progress').style.width = progress + '%';
}

/* ===== NAVBAR VISIBILITY ===== */
let lastScroll = 0;
const navbar = document.getElementById('navbar');

function updateNavbar() {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
        navbar.classList.add('visible');
    } else {
        navbar.classList.remove('visible');
    }
    lastScroll = currentScroll;
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

/* ===== COMBINED SCROLL HANDLER (Performance) ===== */
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateScrollProgress();
            updateNavbar();
            updateActiveLink();
            ticking = false;
        });
        ticking = true;
    }
});

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

/* ===== SMOOTH SCROLL FOR ANCHOR LINKS ===== */
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

/* ===== TERMINAL CLI ===== */
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const terminalBody = document.getElementById('terminal-body');

// Track if theme options are currently shown
let themeOptionsVisible = false;

const commands = {
    help: "Available commands: <span class='t-keyword'>about</span>, <span class='t-keyword'>skills</span>, <span class='t-keyword'>projects</span>, <span class='t-keyword'>contact</span>, <span class='t-keyword'>theme</span>, <span class='t-keyword'>clear</span>",
    about: "Final year CSE student. Passionate about <span class='t-string'>Deep Learning</span> and creating <span class='t-func'>Trusted Datasets</span> for research.",
    skills: "['Python', 'TensorFlow', 'Java', 'MySQL', 'MongoDB', 'Data Analysis', 'C/C++', 'PHP', 'HTML/CSS', 'JavaScript']",
    projects: "Featured: <span class='t-func'>Deepfake Detection Model</span> (91% Accuracy). Check the Projects section for more!",
    contact: "Email: <span class='t-string'>nadimdewan789@gmail.com</span>",
    sudo: "<span class='t-error'>Permission denied: user is not in the sudoers file. This incident will be reported.</span>",
    whoami: "visitor"
};

function scrollToBottom() {
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function addOutputLine(html, className = 'terminal-line') {
    const line = document.createElement('div');
    line.className = className;
    line.innerHTML = html;
    terminalOutput.appendChild(line);
    scrollToBottom();
}

if (terminalInput) {
    terminalInput.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;

        const rawInput = this.value;
        const input = rawInput.trim().toLowerCase();

        // Echo the command
        addOutputLine(`<span class="t-prompt">visitor@nadim:~$</span> ${escapeHtml(rawInput)}`);

        if (input === 'clear') {
            terminalOutput.innerHTML = '';
        }
        else if (input === 'theme') {
            themeOptionsVisible = true;
            addOutputLine(`<span class="t-comment"># Available themes:</span>`);
            addOutputLine(`  <span class="t-option">→ dark</span>  — Deep focus mode`);
            addOutputLine(`  <span class="t-option">→ light</span> — Daylight mode`);
            addOutputLine(`<span class="t-comment"># Type 'dark' or 'light' to switch</span>`);
        }
        else if (input === 'dark' || input === 'light') {
            if (themeOptionsVisible || commands[input]) {
                setTheme(input);
                addOutputLine(`<span class="t-comment"># Switched to ${input} mode ✓</span>`);
            } else {
                addOutputLine(`<span class="t-error">Command not found: ${escapeHtml(rawInput)}. Type 'help' for list.</span>`);
            }
            themeOptionsVisible = false;
        }
        else if (commands[input]) {
            addOutputLine(commands[input]);
            themeOptionsVisible = false;
        }
        else if (input !== '') {
            addOutputLine(`<span class="t-error">Command not found: ${escapeHtml(rawInput)}. Type 'help' for list.</span>`);
            themeOptionsVisible = false;
        }

        this.value = '';
    });

    // Click anywhere in terminal to focus input
    terminalBody.addEventListener('click', (e) => {
        if (e.target !== terminalInput) {
            terminalInput.focus();
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ===== CONTACT FORM (EmailJS) ===== */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const submitBtn = document.getElementById("submit-btn");
        const formStatus = document.getElementById("form-status");
        const originalHTML = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
        formStatus.className = 'form-status';
        formStatus.style.display = 'none';

        emailjs.sendForm(
            "service_t11infl",
            "template_5hioo67",
            this,
            { publicKey: "d643sEDf9emYliwTf" }
        )
            .then(() => {
                showSuccessMessage();
            })
            .catch((error) => {
                console.error("EmailJS Error:", error);
                // Handle false negative JSON parse errors
                if (error.message && (error.message.includes("Unexpected token") || error.message.includes("valid JSON"))) {
                    showSuccessMessage();
                } else {
                    formStatus.className = 'form-status error';
                    formStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to send. Please try again later.';
                    formStatus.style.display = 'block';
                }
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            });

        function showSuccessMessage() {
            formStatus.className = 'form-status success';
            formStatus.innerHTML = '<i class="fas fa-check-circle"></i> Email sent successfully!';
            formStatus.style.display = 'block';
            contactForm.reset();
        }
    });
}

/* ===== AUTO-UPDATE COPYRIGHT YEAR ===== */
const yearSpan = document.getElementById('year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

/* ===== KEYBOARD SHORTCUTS ===== */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus terminal
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (terminalInput) {
            terminalInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});
