/* Два короткі обміни; API-ключ залишається лише на сервері. */
(() => {
  const card = document.querySelector('[data-ai-guide]');
  if (!card) return;
  const form = card.querySelector('.pmn-ai-form');
  const input = form.querySelector('textarea');
  const send = form.querySelector('button[type="submit"]');
  const transcript = card.querySelector('.pmn-ai-transcript');
  const count = card.querySelector('.pmn-ai-count');
  const error = card.querySelector('.pmn-ai-error');
  const next = card.querySelector('.pmn-ai-next');
  const suggestions = card.querySelector('.pmn-ai-suggestions');
  let turns = 0;
  let previousQuestion = '';
  let previousAnswer = '';

  function addMessage(text, kind) {
    const p = document.createElement('p');
    p.className = `pmn-ai-message pmn-ai-message--${kind}`;
    p.textContent = text;
    transcript.append(p);
    p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  suggestions.addEventListener('click', event => {
    const button = event.target.closest('[data-suggestion]');
    if (!button) return;
    input.value = button.dataset.suggestion;
    input.focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (turns >= 2 || send.disabled) return;
    const message = input.value.trim();
    if (!message || message.length > 500) return;
    error.hidden = true;
    send.disabled = true;
    send.textContent = 'Reflecting…';
    try {
      const response = await fetch(card.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: card.dataset.mode, message, turn: turns + 1, previousQuestion, previousAnswer })
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error(data.error || 'The reflection is unavailable right now. Please try again.');
      addMessage(message, 'visitor');
      addMessage(data.reply, 'guide');
      previousQuestion = message;
      previousAnswer = data.reply;
      turns += 1;
      input.value = '';
      count.textContent = turns === 1 ? 'One short reply remaining' : 'Reflection complete';
      if (turns === 2) {
        form.hidden = true;
        suggestions.hidden = true;
        next.hidden = false;
        next.querySelector('a').focus();
      }
    } catch (cause) {
      error.textContent = cause.message || 'The reflection is unavailable right now. Please try again.';
      error.hidden = false;
    } finally {
      send.disabled = false;
      send.textContent = 'Reflect with AI';
    }
  });
})();
