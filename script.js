const panels = [...document.querySelectorAll('.panel')];
const navBtns = [...document.querySelectorAll('.nav button')];
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const count = document.getElementById('count');
const order = ['hero', 'archive', 'method', 'contact'];
let current = 0;
let activePhoto = 0;

function show(index) {
  if (index < 0 || index >= order.length) return;
  const old = panels[current];
  const nextPanel = document.getElementById(order[index]);
  if (old === nextPanel) return;
  old.classList.add('leaving');
  old.classList.remove('is-active');
  nextPanel.classList.add('is-active');
  setTimeout(() => old.classList.remove('leaving'), 780);
  current = index;
  updateUI();
}

function updateUI() {
  navBtns.forEach((b, i) => b.classList.toggle('active', i === current));
  prev.disabled = current === 0;
  next.disabled = current === order.length - 1;
  count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}`;
}

function buildGallery() {
  const gallery = document.getElementById('stackGallery');
  gallery.innerHTML = PHOTOS.map((p, i) => `
    <button class="stack-card" data-index="${i}" aria-label="展开 ${p.title}">
      <span class="layer l3"></span>
      <span class="layer l2"></span>
      <span class="layer top"><img src="${p.src}" alt="${p.title}" loading="lazy"></span>
      <span class="meta"><span class="t">${p.title}</span></span>
    </button>
  `).join('');
  gallery.querySelectorAll('.stack-card').forEach(card => {
    card.addEventListener('click', () => openPhoto(Number(card.dataset.index)));
  });
}

const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalMeta = document.getElementById('modalMeta');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalAnalysis = document.getElementById('modalAnalysis');
const modalClose = document.getElementById('modalClose');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');

document.querySelectorAll('[data-open]').forEach(el => {
  el.addEventListener('click', () => openPhoto(Number(el.dataset.open)));
});

function openPhoto(index) {
  activePhoto = (index + PHOTOS.length) % PHOTOS.length;
  const p = PHOTOS[activePhoto];
  modalImage.src = p.src;
  modalImage.alt = p.title;
  modalMeta.textContent = `${String(activePhoto + 1).padStart(2, '0')} / ${String(PHOTOS.length).padStart(2, '0')} · ${p.meta}`;
  const accent = (typeof PHOTO_COLORS !== 'undefined' && PHOTO_COLORS[activePhoto]) ? PHOTO_COLORS[activePhoto] : '';
  modalMeta.style.color = accent;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalAnalysis.textContent = p.analysis;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePhoto() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function stepPhoto(delta) { openPhoto(activePhoto + delta); }

navBtns.forEach(btn => btn.addEventListener('click', () => show(order.indexOf(btn.dataset.go))));
prev.addEventListener('click', () => show(current - 1));
next.addEventListener('click', () => show(current + 1));
modalClose.addEventListener('click', closePhoto);
modalPrev.addEventListener('click', () => stepPhoto(-1));
modalNext.addEventListener('click', () => stepPhoto(1));
modal.addEventListener('click', e => { if (e.target === modal) closePhoto(); });

window.addEventListener('keydown', e => {
  const modalOpen = modal.classList.contains('open');
  if (modalOpen) {
    if (e.key === 'Escape') closePhoto();
    if (e.key === 'ArrowLeft') stepPhoto(-1);
    if (e.key === 'ArrowRight') stepPhoto(1);
    return;
  }
  if (e.key === 'ArrowRight' || e.key === 'PageDown') show(current + 1);
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') show(current - 1);
});

let startX = null;
window.addEventListener('touchstart', e => startX = e.changedTouches[0].clientX, { passive: true });
window.addEventListener('touchend', e => {
  if (startX == null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 60) {
    if (modal.classList.contains('open')) stepPhoto(dx < 0 ? 1 : -1);
    else show(current + (dx < 0 ? 1 : -1));
  }
  startX = null;
}, { passive: true });

buildGallery();
updateUI();
