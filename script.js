const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}

function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.setAttribute('role', 'status');

    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check me-2' : 'fas fa-exclamation-circle me-2';
    toast.append(icon, document.createTextNode(message));

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service_worker.js')
            .then(registration => console.log('Service Worker registered. Scope:', registration.scope))
            .catch(error => console.warn('Service Worker registration failed:', error));
    });
}
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.getElementById('installPWABtn');
    if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }, { once: true });
    }
});

window.addEventListener('appinstalled', () => console.log('PWA was installed'));

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const body = document.body;

    const render = () => {
        const isLight = body.classList.contains('light-theme');
        themeToggle.innerHTML = isLight
            ? '<i class="fas fa-sun" aria-hidden="true"></i>'
            : '<i class="fas fa-moon" aria-hidden="true"></i>';
        themeToggle.setAttribute('aria-pressed', String(isLight));
    };

    if (storageGet('theme') === 'light') {
        body.classList.add('light-theme');
    }
    render();

    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        body.classList.toggle('light-theme');
        storageSet('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
        render();
    });
}

const RESUME_URL = 'Resume.txt';
const RESUME_DOWNLOAD_NAME = 'Khalid_Bin_Masud_Resume.txt';

function initResumeDownload() {
    document.querySelectorAll('#resumeDownload, #downloadResumeHero').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();

            try {
                const response = await fetch(RESUME_URL, { cache: 'no-cache' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = objectUrl;
                link.download = RESUME_DOWNLOAD_NAME;
                document.body.appendChild(link);
                link.click();
                link.remove();
                setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

                showToast('Resume downloaded!', 'success');
            } catch (error) {
                console.error('Resume download failed:', error);
                showToast('Could not download the resume. Please email me: khalidmasud22@gmail.com', 'danger');
            }
        });
    });
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (!contactForm || !formStatus) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');

    const setStatus = (type, message) => {
        formStatus.className = type ? `mt-3 alert alert-${type}` : 'mt-3';
        formStatus.replaceChildren();
        if (message) {
            const icon = document.createElement('i');
            icon.className = type === 'success' ? 'fas fa-check-circle me-2' : 'fas fa-exclamation-circle me-2';
            formStatus.append(icon, document.createTextNode(message));
        }
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch('https://formspree.io/f/xyzgqwpb', {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error(`Form submission failed (${response.status})`);

            setStatus('success', "Message sent successfully! I'll get back to you soon.");
            contactForm.reset();
            setTimeout(() => setStatus('', ''), 5000);
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus('danger', 'Error sending message. Please email me directly: khalidmasud22@gmail.com');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.navbar .nav-link');
    const sections = Array.from(document.querySelectorAll('section[id]'));

    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.type = 'button';
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            const target = document.getElementById(href.slice(1));
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });

            const collapseEl = document.getElementById('navbarNav');
            if (collapseEl && collapseEl.classList.contains('show') && window.bootstrap) {
                window.bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
            }
        });
    });

    let ticking = false;

    const onScroll = () => {
        const y = window.scrollY;
        let current = '';

        sections.forEach(section => {
            if (y + 200 >= section.offsetTop) current = section.id;
        });

        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${current}`;
            link.classList.toggle('text-primary', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        scrollTopBtn.classList.toggle('show', y > 300);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    onScroll();
}

function initRevealAnimations() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll(
        '.skill-card, .project-card, .stat-box, .contact-card, .blog-card, .github-widget'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            el.classList.add('is-visible');
            observer.unobserve(el);

            el.addEventListener('animationend', () => {
                el.classList.remove('reveal', 'is-visible');
            }, { once: true });
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    targets.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}


document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initResumeDownload();
    initContactForm();
    initNavigation();
    initRevealAnimations();
    initFooterYear();
});
