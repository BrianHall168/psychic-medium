/* Пошук у статичному індексі без запитів до WordPress. */
(function () {
    'use strict';

    const input = document.getElementById('pmn-search-input');
    const button = document.getElementById('pmn-search-button');
    const status = document.getElementById('pmn-search-status');
    const results = document.getElementById('pmn-search-results');
    const source = document.getElementById('pmn-search-index');

    if (!input || !button || !status || !results || !source) {
        return;
    }

    let index;

    try {
        const data = JSON.parse(source.textContent);
        if (!Array.isArray(data)) {
            throw new TypeError('Invalid search index');
        }

        index = data.filter(function (item) {
            return item !== null &&
                typeof item === 'object' &&
                typeof item.title === 'string' &&
                typeof item.url === 'string' &&
                typeof item.text === 'string' &&
                typeof item.type === 'string' &&
                item.title.trim().length > 0 &&
                item.url.startsWith('/') &&
                !item.url.startsWith('//') &&
                !/[\\\s]/.test(item.url);
        });
    } catch (error) {
        status.textContent = 'Search is unavailable. Browse the guides above.';
        return;
    }

    function search() {
        const terms = input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        results.replaceChildren();

        if (!terms.length) {
            status.textContent = 'Enter a topic to search our reading room.';
            return;
        }

        const matches = index.filter(function (item) {
            const text = (item.title + ' ' + item.text).toLocaleLowerCase();
            return terms.every(function (term) {
                return text.includes(term);
            });
        });

        // Назва має вищу вагу за випадковий збіг у повному тексті.
        const phrase = terms.join(' ');
        function relevance(item) {
            const title = item.title.toLocaleLowerCase();
            let score = terms.every(function (term) {
                return title.includes(term);
            }) ? 100 : 0;
            if (title.includes(phrase)) {
                score += 100;
            }
            return score;
        }

        // Явний початковий порядок зберігає стабільність однакових оцінок.
        const ranked = matches.map(function (item, position) {
            return { item: item, position: position, score: relevance(item) };
        }).sort(function (left, right) {
            return right.score - left.score || left.position - right.position;
        });

        for (const match of ranked.slice(0, 12)) {
            const item = match.item;
            const li = document.createElement('li');
            const link = document.createElement('a');
            const meta = document.createElement('span');

            link.href = item.url;
            link.textContent = item.title;
            meta.textContent = item.type;
            li.append(link, meta);
            results.append(li);
        }

        if (!matches.length) {
            status.textContent = 'No matching guides. Try a broader topic, such as dreams or Tarot.';
            return;
        }

        status.textContent = matches.length + ' result' +
            (matches.length === 1 ? '' : 's') +
            (matches.length > 12 ? ' — showing the first 12.' : '.');
    }

    button.addEventListener('click', search);
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            search();
        }
    });
})();
