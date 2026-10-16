/* Приблизна середня синодична модель; дата завжди оцінюється опівдні UTC. */
(function (root) {
    'use strict';

    const month = 29.530588;
    const epoch = Date.UTC(2000, 0, 6, 18, 14);
    const day = 86400000;
    const labels = ['New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full Moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];

    function parseDate(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
        const parts = value.split('-').map(Number);
        if (parts[0] < 1900 || parts[0] > 2100) return null;
        const stamp = Date.UTC(parts[0], parts[1] - 1, parts[2], 12);
        const date = new Date(stamp);
        if (date.getUTCFullYear() !== parts[0] || date.getUTCMonth() !== parts[1] - 1 || date.getUTCDate() !== parts[2]) return null;
        return stamp;
    }

    function phaseAt(stamp) {
        if (!Number.isFinite(stamp)) return null;
        const age = (((stamp - epoch) / day) % month + month) % month;
        const fraction = age / month;
        const sector = Math.floor((fraction + 1 / 16) * 8) % 8;
        return { age: age, illumination: (1 - Math.cos(2 * Math.PI * fraction)) / 2 * 100, label: labels[sector] };
    }

    function todayUTC(now) {
        return new Date(now).toISOString().slice(0, 10);
    }

    // Чисті функції доступні перевіркам без залежності від DOM.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { parseDate: parseDate, phaseAt: phaseAt, todayUTC: todayUTC, epoch: epoch, month: month };
    }
    if (typeof document === 'undefined') return;

    const input = document.getElementById('pmn-moon-date');
    const result = document.getElementById('pmn-moon-result');
    const calculate = document.getElementById('pmn-moon-calculate');
    const today = document.getElementById('pmn-moon-today');
    if (!input || !result || !calculate || !today) return;

    function show() {
        const stamp = parseDate(input.value);
        if (stamp === null) {
            input.setAttribute('aria-invalid', 'true');
            result.textContent = 'Choose a valid date from 1 January 1900 to 31 December 2100.';
            return;
        }
        input.removeAttribute('aria-invalid');
        const phase = phaseAt(stamp);
        result.textContent = input.value + ' at 12:00 UTC: approximately ' + phase.label +
            '. Model lunar age: ' + phase.age.toFixed(1) + ' days. Approximate illumination: ' + phase.illumination.toFixed(0) + '%.';
    }

    function useToday() {
        input.value = todayUTC(Date.now());
        show();
    }
    calculate.addEventListener('click', show);
    today.addEventListener('click', useToday);
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            show();
        }
    });
    useToday();
})(typeof globalThis !== 'undefined' ? globalThis : this);
