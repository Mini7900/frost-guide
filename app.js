const {createTutorial} = await import(new URL(`./components/tutorial.js${new URL(import.meta.url).search}`, import.meta.url));
const assetVersion = new URL(import.meta.url).searchParams.get('v') || `${Date.now()}-${crypto.randomUUID()}`;
const $ = (selector) => document.querySelector(selector);
let data, datasets, active = 'all', articleId;
const tutorialPositions = new Map();
let language = 'zh-Hant';
try { if (localStorage.getItem('frost-language') === 'en') language = 'en'; } catch {}
$('#language').value = language;
const t = (key, values = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), data.ui[key]);
const el = (tag, text, className) => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };
const searchText = value => typeof value === 'string' ? value : Array.isArray(value) ? value.map(searchText).join(' ') : value && typeof value === 'object' ? Object.values(value).map(searchText).join(' ') : '';
function render() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  const guides = data.guides.filter(g => (active === 'all' || g.category === active) && [g.title, g.summary, ...g.tags, searchText(g.sections)].join(' ').toLocaleLowerCase().includes(query));
  $('#results-count').textContent = t('results', {count: String(guides.length).padStart(2, '0')});
  $('#cards').replaceChildren();
  document.querySelectorAll('.filter').forEach(b => { b.classList.toggle('selected', b.dataset.id === active); b.setAttribute('aria-pressed', String(b.dataset.id === active)); });
  if (!guides.length) $('#cards').append(el('p', t('empty'), 'empty'));
  guides.forEach((g, index) => {
    const card = el('button', '', `card theme-${g.art}`); card.type = 'button';
    const art = el('div', '', 'card-art'); art.append(el('span', g.icon, 'art-icon'), el('span', t('fieldNote', {count: String(index + 1).padStart(2, '0')}), 'art-caption'));
    const body = el('div', '', 'card-body'); const meta = el('div', '', 'meta'); meta.append(el('span', data.categories.find(c => c.id === g.category).name), el('span', t('minutes', {count: g.minutes})));
    body.append(meta, el('h3', g.title), el('p', g.summary)); const bottom = el('div', '', 'card-bottom'); bottom.append(el('span', g.tags.join(' / ')), el('span', '↗')); body.append(bottom); card.append(art, body); card.addEventListener('click', () => openGuide(g)); $('#cards').append(card);
  });
}
function openGuide(g) {
  if (!$('#article').open) tutorialPositions.clear();
  articleId = g.id;
  $('#article-title').textContent = g.title;
  const content = $('#article-content'); content.replaceChildren(el('p', `${data.categories.find(c => c.id === g.category).name} · ${t('minutes', {count: g.minutes})}`, 'eyebrow'), el('p', g.summary, 'article-summary'));
  g.sections.forEach((s, sectionIndex) => {
    const section = el('section', '', 'article-step');
    section.append(el('h3', s.heading));
    if (s.tutorial) {
      const key = `${g.id}:${sectionIndex}`;
      section.append(createTutorial({steps: s.tutorial.steps, t, assetVersion,
        initialIndex: tutorialPositions.get(key) || 0,
        onChange: index => tutorialPositions.set(key, index)}));
    }
    if (s.steps) {
      const flow = el('ol', '', 'guide-flow');
      s.steps.forEach((step, index) => {
        const item = el('li', '', 'guide-flow-step');
        const icon = el('span', step.icon, 'flow-icon');
        icon.setAttribute('aria-hidden', 'true');
        item.append(icon, el('span', String(index + 1).padStart(2, '0'), 'flow-number'), el('strong', step.label));
        flow.append(item);
      });
      section.append(flow);
    }
    if (s.checklist) {
      const list = el('ul', '', 'guide-checklist');
      s.checklist.forEach(check => {
        const item = document.createElement('li');
        const marker = el('span', '✓', 'check-icon');
        marker.setAttribute('aria-hidden', 'true');
        const text = document.createElement('div');
        text.append(el('strong', check.label), el('p', check.detail));
        item.append(marker, text);
        list.append(item);
      });
      section.append(list);
    }
    if (s.image) {
      const figure = el('figure', '', 'guide-figure');
      const image = document.createElement('img');
      const url = new URL(s.image, document.baseURI);
      url.searchParams.set('v', assetVersion);
      image.src = url.href;
      image.alt = s.alt || s.heading;
      image.loading = 'lazy';
      image.decoding = 'async';
      if (s.imageWidth && s.imageHeight) {
        image.width = s.imageWidth;
        image.height = s.imageHeight;
      }
      image.addEventListener('error', () => {
        image.hidden = true;
        figure.append(el('p', t('imageError'), 'image-error'));
      }, {once: true});
      figure.append(image);
      if (s.caption) figure.append(el('figcaption', s.caption));
      section.append(figure);
    }
    if (s.table) {
      const wrapper = el('div', '', 'guide-table-wrap');
      const table = document.createElement('table');
      table.className = 'guide-table';
      table.append(el('caption', s.table.caption || s.heading));
      const head = document.createElement('thead');
      const headings = document.createElement('tr');
      s.table.headers.forEach(label => {
        const cell = el('th', label);
        cell.scope = 'col';
        headings.append(cell);
      });
      head.append(headings);
      const body = document.createElement('tbody');
      s.table.rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((value, index) => {
          const cell = el(index === 0 ? 'th' : 'td', value);
          if (index === 0) cell.scope = 'row';
          tr.append(cell);
        });
        body.append(tr);
      });
      table.append(head, body);
      wrapper.append(table);
      section.append(wrapper);
    }
    if (s.body) section.append(el('p', s.body));
    content.append(section);
  });
  content.append(el('p', g.note || t('updated', {date: g.updated}), 'article-note')); if (!$('#article').open) {
    $('#article').showModal();
    content.scrollTop = 0;
    $('#article .close').focus({preventScroll: true});
  }
}
$('#article .close').addEventListener('click', () => $('#article').close());
$('#article').addEventListener('click', e => { if (e.target === $('#article')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
$('#search').addEventListener('input', () => data && render());
function applyLanguage() {
  data = datasets[language];
  document.documentElement.lang = language;
  $('#language').value = language;
  document.querySelectorAll('[data-i18n]').forEach(node => node.textContent = t(node.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(node => node.setAttribute('aria-label', t(node.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-placeholder]').forEach(node => node.placeholder = t(node.dataset.i18nPlaceholder));
  ['brand', 'footer-brand'].forEach(id => $(`#${id}`).textContent = data.site.name);
  document.title = data.site.name;
  ['eyebrow', 'headline', 'intro'].forEach(id => $(`#${id}`).textContent = data.site[id]);
  $('#about-text').textContent = data.site.about;
  $('#filters').replaceChildren();
  [{id:'all', name:t('all')}, ...data.categories].forEach(c => { const b = el('button', c.name, 'filter'); b.dataset.id = c.id; b.addEventListener('click', () => {active = c.id; render();}); $('#filters').append(b); });
  render();
  if ($('#article').open) openGuide(data.guides.find(g => g.id === articleId));
}
$('#language').addEventListener('change', () => {
  language = $('#language').value;
  try { localStorage.setItem('frost-language', language); } catch {}
  if (datasets) applyLanguage();
  else $('#error').textContent = language === 'en' ? 'Unable to load guides. Please try again later.' : '攻略暫時無法載入，請稍後再試。';
});
try {
  const paths = ['data/content.json', 'data/content.en.json'];
  const [zh, en] = await Promise.all(paths.map(async path => {
    const url = new URL(path, document.baseURI);
    url.searchParams.set('v', assetVersion);
    const response = await fetch(url, {cache: 'no-store'});
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }));
  datasets = {'zh-Hant': zh, en};
  applyLanguage();
} catch (error) {
  $('#error').hidden = false;
  $('#error').textContent = language === 'en' ? 'Unable to load guides. Please try again later.' : '攻略暫時無法載入，請稍後再試。';
  console.error(error);
}
