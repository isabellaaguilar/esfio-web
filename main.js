// ===== Announcement bar =====
const announceBar = document.getElementById('announceBar');
const announceClose = document.getElementById('announceClose');

announceClose.addEventListener('click', () => {
    announceBar.classList.remove('is-visible');
    document.documentElement.classList.remove('has-announce');
    try { localStorage.setItem('esfio_ep_banner_closed', '1'); } catch(e) {}
});

// ===== Próximos shows =====
// Para que Fio edite sin código: publicar una hoja de Google como CSV (Archivo > Compartir > Publicar en la web)
// y reemplazar este valor por esa URL. Columnas: fecha (AAAA-MM-DD), titulo, lugar, link
const SHOWS_URL = 'shows.csv';

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

async function loadShows() {
    const list = document.getElementById('proximoList');
    if (!list) return;
    try {
        const res = await fetch(SHOWS_URL, { cache: 'no-cache' });
        if (!res.ok) return;
        const rows = parseCSV(await res.text());
        const header = rows.shift().map(h => h.trim().toLowerCase());
        const col = name => header.indexOf(name);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const shows = rows.map(r => ({
            fecha: (r[col('fecha')] || '').trim(),
            titulo: (r[col('titulo')] || '').trim(),
            lugar: (r[col('lugar')] || '').trim(),
            link: (r[col('link')] || '').trim()
        })).filter(s => {
            const d = new Date(s.fecha + 'T00:00:00');
            return s.titulo && !isNaN(d) && d >= today;
        }).sort((a, b) => a.fecha.localeCompare(b.fecha));
        if (!shows.length) return;

        list.textContent = '';
        shows.forEach(s => {
            const d = new Date(s.fecha + 'T00:00:00');
            const item = document.createElement('div');
            item.className = 'show';
            const date = document.createElement('div');
            date.className = 'show-date';
            date.textContent = d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }).replace('.', '');
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
            list.appendChild(item);
        });
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
