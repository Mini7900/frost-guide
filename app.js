const $ = (selector) => document.querySelector(selector);
let data, datasets, active = 'all', articleId;
let language = 'zh-Hant';
try { if (localStorage.getItem('frost-language') === 'en') language = 'en'; } catch {}
$('#language').value = language;
const t = (key, values = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), data.ui[key]);
const el = (tag, text, className) => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };
function render() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  const guides = data.guides.filter(g => (active === 'all' || g.category === active) && [g.title, g.summary, ...g.tags, ...g.sections.map(s => s.heading + s.body)].join(' ').toLocaleLowerCase().includes(query));
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
  articleId = g.id;
  const content = $('#article-content'); content.replaceChildren(el('p', `${data.categories.find(c => c.id === g.category).name} · ${t('minutes', {count: g.minutes})}`, 'eyebrow'), el('h2', g.title), el('p', g.summary, 'article-summary'));
  g.sections.forEach(s => content.append(el('h3', s.heading), el('p', s.body)));
  content.append(el('p', t('updated', {date: g.updated}), 'article-note')); if (!$('#article').open) $('#article').showModal();
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
  $('#stats').replaceChildren();
  [[data.guides.length, t('notes')], [data.categories.length, t('categories')]].forEach(([v, label]) => { const stat = el('div', '', 'stat'); stat.append(el('strong', String(v).padStart(2, '0')), el('span', label)); $('#stats').append(stat); });
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
    const response = await fetch(path);
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
