/* Керування меню: фокус, Escape та повернення до кнопки відкриття. */
(function () {
    'use strict';
    const overlay = document.getElementById('pmnMobileOverlay');
    const menu = document.getElementById('pmnMobileNav');
    const header = document.getElementById('pmnHeader');
    const toggle = document.getElementById('pmnMenuToggle');
    const close = document.getElementById('pmnCloseMenu');
    if (!menu || !toggle) return;
    function setOpen(open, restoreFocus) {
        menu.hidden = !open;
        menu.inert = !open;
        menu.setAttribute('aria-hidden', String(!open));
        menu.classList.toggle('open', open);
        if (overlay) overlay.classList.toggle('open', open);
        document.body.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (open && close) close.focus();
        else if (restoreFocus) toggle.focus();
    }
    window.pmnToggleMobile = function () { setOpen(menu.hidden, true); };
    window.pmnCloseMobile = function () { setOpen(false, true); };
    if (close) close.addEventListener('click', window.pmnCloseMobile);
    menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) setOpen(false, false);
    });
    document.addEventListener('keydown', function (event) {
        if (menu.hidden) return;
        if (event.key === 'Escape') {
            event.preventDefault(); setOpen(false, true);
        } else if (event.key === 'Tab') {
            const items = Array.from(menu.querySelectorAll('a[href],button:not([disabled])'));
            const first = items[0], last = items[items.length - 1];
            if (!menu.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault(); first.focus();
            }
        }
    });
    if (header) window.addEventListener('scroll', function () {
        header.style.boxShadow = window.scrollY > 10 ? 'var(--shadow-md)' : 'none';
    });
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && !menu.hidden) setOpen(false, false);
    });
})();
