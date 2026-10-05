// ===== Announcement bar =====
const announceBar = document.getElementById('announceBar');
const announceClose = document.getElementById('announceClose');

announceClose.addEventListener('click', () => {
    announceBar.classList.remove('is-visible');
    document.documentElement.classList.remove('has-announce');
    try { localStorage.setItem('esfio_ep_banner_closed', '1'); } catch(e) {}
});

// ===== Próximos shows =====
// Hoja de Google publicada como CSV. Columnas: fecha (AAAA-MM-DD, texto plano), titulo, lugar, link
const SHOWS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwCCSwov22npqoZoTxN-_CUa2llaTsTk8cSN_kJNWciwm8XNDabZ05QTINWf0xXlJFjwviiptzrJgy/pub?output=csv';

function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
            else if (ch === '"') inQuotes = false;
            else cell += ch;
        } else if (ch === '"') inQuotes = true;
        else if (ch === ',') { row.push(cell); cell = ''; }
        else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); cell = '';
            if (row.some(c => c.trim() !== '')) rows.push(row);
            row = [];
        } else cell += ch;
    }
    row.push(cell);
    if (row.some(c => c.trim() !== '')) rows.push(row);
    return rows;
}

function imageSrc(url) {
    if (!/^https:\/\//i.test(url)) return '';
    if (/drive\.google\.com/i.test(url)) {
        const m = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
        return m ? 'https://lh3.googleusercontent.com/d/' + m[1] + '=w700' : '';
    }
    return url;
}

function makeImage(url, alt, className) {
    const src = imageSrc(url);
    if (!src) return null;
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    if (className) img.className = className;
    img.addEventListener('error', () => img.remove());
    return img;
}

function formatDate(d, withYear) {
    const opts = { day: 'numeric', month: 'short' };
    if (withYear) opts.year = 'numeric';
    return d.toLocaleDateString('es-CR', opts).replace(/\./g, '');
}

async function loadShows() {
    const upcomingList = document.getElementById('proximoList');
    const pastSection = document.getElementById('pasados');
    const pastList = document.getElementById('pasadosList');
    if (!upcomingList) return;
    try {
        const res = await fetch(SHOWS_URL);
        if (!res.ok) return;
        const rows = parseCSV(await res.text());
        const header = rows.shift().map(h => h.trim().toLowerCase());
        const col = name => header.indexOf(name);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const all = rows.map(r => ({
            fecha: (r[col('fecha')] || '').trim(),
            titulo: (r[col('titulo')] || '').trim(),
            lugar: (r[col('lugar')] || '').trim(),
            link: (r[col('link')] || '').trim(),
            imagen: (r[col('imagen')] || '').trim()
        })).filter(s => s.titulo && !isNaN(new Date(s.fecha + 'T00:00:00')));

        const dateOf = s => new Date(s.fecha + 'T00:00:00');
        const upcoming = all.filter(s => dateOf(s) >= today).sort((a, b) => a.fecha.localeCompare(b.fecha));
        const past = all.filter(s => dateOf(s) < today).sort((a, b) => b.fecha.localeCompare(a.fecha));

        if (upcoming.length) {
            upcomingList.textContent = '';
            upcoming.forEach(s => {
                const item = document.createElement('div');
                item.className = 'show';
                const date = document.createElement('div');
                date.className = 'show-date';
                date.textContent = formatDate(dateOf(s), false);
                const info = document.createElement('div');
                info.className = 'show-info';
                const title = document.createElement('p');
                title.className = 'show-title';
                title.textContent = s.titulo;
                info.appendChild(title);
                if (s.lugar) {
                    const place = document.createElement('p');
                    place.className = 'show-place';
                    place.textContent = s.lugar;
                    info.appendChild(place);
                }
                if (/^https?:\/\//i.test(s.link)) {
                    const a = document.createElement('a');
                    a.className = 'show-link';
                    a.href = s.link;
                    a.target = '_blank';
                    a.rel = 'noopener';
                    a.textContent = 'Más info';
                    info.appendChild(a);
                }
                item.append(date, info);
                const flyer = makeImage(s.imagen, 'Flyer: ' + s.titulo, 'show-flyer');
                if (flyer) item.appendChild(flyer);
                upcomingList.appendChild(item);
            });
        }

        if (past.length && pastSection && pastList) {
            past.forEach(s => {
                const card = document.createElement('figure');
                card.className = 'past';
                const img = makeImage(s.imagen, 'Flyer: ' + s.titulo, '');
                if (img) card.appendChild(img);
                const cap = document.createElement('figcaption');
                cap.className = 'past-meta';
                const d = document.createElement('span');
                d.className = 'past-date';
                d.textContent = formatDate(dateOf(s), true);
                const t = document.createElement('span');
                t.className = 'past-title';
                t.textContent = s.titulo + (s.lugar ? ' · ' + s.lugar : '');
                cap.append(d, t);
                card.appendChild(cap);
                pastList.appendChild(card);
            });
            pastSection.hidden = false;
        }
    } catch (e) {}
}
loadShows();

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
