const $ = (selector) => document.querySelector(selector);
let data, active = 'all';
const el = (tag, text, className) => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };
function render() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  const guides = data.guides.filter(g => (active === 'all' || g.category === active) && [g.title, g.summary, ...g.tags, ...g.sections.map(s => s.heading + s.body)].join(' ').toLocaleLowerCase().includes(query));
  $('#results-count').textContent = `${String(guides.length).padStart(2, '0')} 篇攻略`;
  $('#cards').replaceChildren();
  document.querySelectorAll('.filter').forEach(b => { b.classList.toggle('selected', b.dataset.id === active); b.setAttribute('aria-pressed', String(b.dataset.id === active)); });
  if (!guides.length) $('#cards').append(el('p', '找不到符合的攻略，試試其他關鍵字或分類。', 'empty'));
  guides.forEach((g, index) => {
    const card = el('button', '', `card theme-${g.art}`); card.type = 'button';
    const art = el('div', '', 'card-art'); art.append(el('span', g.icon, 'art-icon'), el('span', `FIELD NOTE / ${String(index + 1).padStart(2, '0')}`, 'art-caption'));
    const body = el('div', '', 'card-body'); const meta = el('div', '', 'meta'); meta.append(el('span', data.categories.find(c => c.id === g.category).name), el('span', `${g.minutes} 分鐘閱讀`));
    body.append(meta, el('h3', g.title), el('p', g.summary)); const bottom = el('div', '', 'card-bottom'); bottom.append(el('span', g.tags.join(' / ')), el('span', '↗')); body.append(bottom); card.append(art, body); card.addEventListener('click', () => openGuide(g)); $('#cards').append(card);
  });
}
function openGuide(g) {
  const content = $('#article-content'); content.replaceChildren(el('p', `${data.categories.find(c => c.id === g.category).name} · ${g.minutes} 分鐘閱讀`, 'eyebrow'), el('h2', g.title), el('p', g.summary, 'article-summary'));
  g.sections.forEach(s => content.append(el('h3', s.heading), el('p', s.body)));
  content.append(el('p', `資料更新：${g.updated} · 示範內容，請依實際遊戲資料替換。`, 'article-note')); $('#article').showModal();
}
$('#article .close').addEventListener('click', () => $('#article').close());
$('#article').addEventListener('click', e => { if (e.target === $('#article')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
$('#search').addEventListener('input', () => data && render());
try {
  const response = await fetch('data/content.json'); if (!response.ok) throw new Error(`HTTP ${response.status}`); data = await response.json();
  ['brand', 'footer-brand'].forEach(id => $(`#${id}`).textContent = data.site.name);
  document.title = data.site.name; $('#eyebrow').textContent = data.site.eyebrow; $('#headline').textContent = data.site.headline; $('#intro').textContent = data.site.intro; $('#about-text').textContent = data.site.about;
  [[data.guides.length, '篇探索筆記'], [data.categories.length, '個攻略分類'], ['JSON', '單一資料來源'], ['DEMO', '示範資料集']].forEach(([v, label]) => { const stat = el('div', '', 'stat'); stat.append(el('strong', String(v).padStart(2, '0')), el('span', label)); $('#stats').append(stat); });
  [{id:'all', name:'全部攻略'}, ...data.categories].forEach(c => { const b = el('button', c.name, 'filter'); b.dataset.id = c.id; b.addEventListener('click', () => {active = c.id; render();}); $('#filters').append(b); }); render();
} catch (error) { $('#error').hidden = false; $('#error').textContent = '攻略資料載入失敗。請透過 HTTP 靜態伺服器開啟，並確認 data/content.json 格式正確。'; console.error(error); }
