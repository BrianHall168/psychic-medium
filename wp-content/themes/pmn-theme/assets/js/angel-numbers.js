/* Пошук лише серед опублікованих сторінок, без збору введених даних. */
(() => {
  const form = document.getElementById('pmn-angel-finder');
  const input = document.getElementById('pmn-angel-input');
  const feedback = document.getElementById('pmn-angel-feedback');
  if (!form || !input || !feedback) return;

  const guides = new Map(
    Array.from(document.querySelectorAll('[data-angel-number]'), card => [card.dataset.angelNumber, card.href])
  );

  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value.trim().replace(/\s/g, '').replace(':', '');
    const target = guides.get(value);
    if (target) {
      window.location.assign(target);
      return;
    }
    feedback.textContent = 'This library covers 111, 222, 333, 444, 555, and 1111. Choose one of these patterns.';
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  });
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    feedback.textContent = 'Choose 111, 222, 333, 444, 555, or 1111.';
  });
})();
