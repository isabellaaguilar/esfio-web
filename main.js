// ===== Mobile menu =====
const menuBtn = document.querySelector('.menu-btn');
const mobileNav = document.querySelector('.mobile-nav');

menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);
});

mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
    });
});

// ===== Scroll reveal =====
const animatedEls = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

animatedEls.forEach(el => observer.observe(el));

// ===== Add data-animate to elements on load =====
document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll(
        '.mundo-image, .mundo-text, .section--quote blockquote, .acto, .vivo-img, .vivo-info, .pronto-inner'
    );
    targets.forEach((el, i) => {
        el.setAttribute('data-animate', '');
        el.style.transitionDelay = `${(i % 3) * 0.12}s`;
        observer.observe(el);
    });
});
