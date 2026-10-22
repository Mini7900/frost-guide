// A self-contained, data-driven tutorial. Text is always rendered as textContent.
export function createTutorial({steps, t, assetVersion, initialIndex = 0, onChange = () => {}}) {
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const root = node('div', undefined, 'tutorial');
  const pages = [...steps].sort((a, b) => a.order - b.order);
  if (!pages.length) { root.append(node('p', t('tutorialEmpty'))); return root; }
  let index = Math.max(0, Math.min(initialIndex, pages.length - 1));
  let animation;
  let suppressClickUntil = 0;
  const page = node('div', undefined, 'tutorial-page');
  const imageButton = node('button', undefined, 'tutorial-image-button');
  imageButton.type = 'button';
  imageButton.setAttribute('aria-label', t('tutorialZoom'));
  const image = node('img');
  image.draggable = false;
  imageButton.append(image);
  const imageError = node('p', t('imageError'), 'image-error');
  imageError.hidden = true;
  const title = node('h4');
  const body = node('p');
  const caption = node('p', undefined, 'tutorial-caption');
  page.append(imageButton, imageError, title, caption, body);
  const controls = node('div', undefined, 'tutorial-controls');
  const previous = node('button', t('tutorialPrevious'));
  const next = node('button', t('tutorialNext'));
  previous.type = next.type = 'button';
  const progress = node('span');
  progress.setAttribute('role', 'status');
  progress.setAttribute('aria-live', 'polite');
  controls.append(previous, progress, next);
  root.append(page, controls);

  // Keep the zoom dialog inside the owning article, with native focus trapping.
  const zoom = node('dialog', undefined, 'tutorial-zoom');
  zoom.setAttribute('aria-label', t('tutorialZoom'));
  const close = node('button', t('tutorialCloseZoom'), 'tutorial-zoom-close');
  close.type = 'button';
  const enlarged = node('img');
  zoom.append(close, enlarged);
  root.append(zoom);
  const closeZoom = () => zoom.close();
  close.addEventListener('click', closeZoom);
  zoom.addEventListener('click', event => { if (event.target === zoom) closeZoom(); });
  imageButton.addEventListener('click', () => {
    if (Date.now() < suppressClickUntil) return;
    if (!image.hidden) {
      enlarged.src = image.src;
      enlarged.alt = image.alt;
      zoom.showModal();
      close.focus();
    }
  });
  zoom.addEventListener('close', () => imageButton.focus({preventScroll: true}));
  function render(direction = 0) {
    const step = pages[index];
    const url = new URL(step.image, document.baseURI);
    // Static site assets must stay on this origin (also works under a subdirectory).
    image.hidden = true;
    imageError.hidden = true;
    imageButton.disabled = true;
    image.onload = () => { image.hidden = false; imageButton.disabled = false; };
    image.onerror = () => { image.hidden = true; imageError.hidden = false; };
    if (url.origin === location.origin && ['http:', 'https:'].includes(url.protocol)) {
      url.searchParams.set('v', assetVersion);
      image.src = url.href;
    } else { image.removeAttribute('src'); imageError.hidden = false; }
    image.alt = step.alt || step.title;
    title.textContent = step.title;
    body.textContent = step.body;
    caption.textContent = step.caption || '';
    caption.hidden = !step.caption;
    previous.disabled = index === 0;
    next.disabled = index === pages.length - 1;
    progress.textContent = `${index + 1} / ${pages.length}`;
    progress.setAttribute('aria-label', t('tutorialProgress', {current: index + 1, total: pages.length}));
    animation?.cancel();
    if (direction && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animation = page.animate([
        {opacity: 0, transform: `perspective(1000px) translateX(${direction * 24}px) rotateY(${direction * -7}deg)`},
        {opacity: 1, transform: 'perspective(1000px) translateX(0) rotateY(0)'}
      ], {duration: 260, easing: 'ease-out'});
    }
    onChange(index);
  }
  function move(direction) {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    index = target;
    render(direction);
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  let start;
  page.addEventListener('touchstart', event => {
    start = event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;
  }, {passive: true});
  page.addEventListener('touchcancel', () => { start = null; });
  page.addEventListener('touchend', event => {
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      move(dx < 0 ? 1 : -1);
      // A swipe on the image must not also trigger click-to-zoom.
      suppressClickUntil = Date.now() + 500;
    }
  }, {passive: true});
  render();
  return root;
}
