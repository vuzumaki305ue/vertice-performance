/* VÉRTICE / Efeitos e interações sem bibliotecas externas.
   Cada seção aqui pode ser estudada e modificada separadamente. */
'use strict';

// 1) Cabeçalho e indicador de progresso da rolagem
const header = document.querySelector('#siteHeader');
const progressLine = document.querySelector('#progressLine');
let ticking = false;
function updateScroll() {
  header.classList.toggle('scrolled', window.scrollY > 35);
  const available = document.documentElement.scrollHeight - window.innerHeight;
  progressLine.style.width = `${available > 0 ? (window.scrollY / available) * 100 : 0}%`;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { window.requestAnimationFrame(updateScroll); ticking = true; }
}, { passive: true });
updateScroll();

// 2) Os blocos aparecem suavemente quando entram na tela
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    }
  }, { rootMargin: '0px 0px -35px 0px', threshold: .09 });
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}

// 3) Menu do celular
const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');
function closeMenu() {
  mainNav.classList.remove('open');
  header.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('nav-open');
}
menuToggle.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  mainNav.classList.toggle('open', willOpen);
  header.classList.toggle('menu-open', willOpen);
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('nav-open', willOpen);
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMenu(); });

// 4) Filtro de galeria: realmente filtra sem recarregar a página
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const projectCards = [...document.querySelectorAll('.project-card')];
const projectGrid = document.querySelector('#projectGrid');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filterButtons.forEach(b => {
    const active = b === button;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  projectGrid.classList.toggle('is-filtered', selected !== 'todos');
  projectCards.forEach(card => { card.hidden = selected !== 'todos' && card.dataset.category !== selected; });
}));

// 5) Modal de cada conceito: dados inventados, sem fingir que são projetos reais
const projects = [
  { title: 'MIDNIGHT 01', tag: 'STREET / 001', description: 'Inspiração em carros japoneses da cena noturna. Um conceito visual que explora luz, presença e identidade. A imagem é ilustrativa e não representa serviço realizado.', image: 'https://images.unsplash.com/photo-1748079805633-c14480cd4317?auto=format&fit=crop&w=1400&q=80' },
  { title: 'APEX R', tag: 'TRACK / 002', description: 'Conceito de projeto voltado para pista: postura agressiva, foco em dinâmica e experiência ao volante. Imagem e nome usados apenas para demonstrar o layout.', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80' },
  { title: 'BLUE MOTION', tag: 'STYLE / 003', description: 'O encontro entre impacto visual e cultura automotiva. Uma proposta de galeria para mostrar como um site poderia apresentar projetos de personalização.', image: 'https://images.unsplash.com/photo-1752560930463-75458b2af5c2?auto=format&fit=crop&w=1400&q=80' }
];
const modal = document.querySelector('#projectModal');
const modalPanel = modal.querySelector('.modal-panel');
const modalClose = document.querySelector('#modalClose');
let lastFocusedElement = null;
function openProject(index) {
  const item = projects[index];
  if (!item) return;
  lastFocusedElement = document.activeElement;
  document.querySelector('#modalTitle').textContent = item.title;
  document.querySelector('#modalTag').textContent = item.tag;
  document.querySelector('#modalDescription').textContent = item.description;
  document.querySelector('#modalPhoto').style.backgroundImage = `url("${item.image}")`;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modalClose.focus();
}
function closeProject() {
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lastFocusedElement) lastFocusedElement.focus();
}
projectCards.forEach(card => card.addEventListener('click', () => openProject(Number(card.dataset.project))));
modalClose.addEventListener('click', closeProject);
modal.querySelector('[data-close]').addEventListener('click', closeProject);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!modal.hidden) closeProject(); else closeMenu(); }
  if (e.key === 'Tab' && !modal.hidden) {
    const focusable = [...modalPanel.querySelectorAll('button, a[href], input, select, textarea')].filter(el => !el.disabled);
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// 6) Formulário de demonstração: gera texto no navegador, NÃO envia dados
const contactForm = document.querySelector('#contactForm');
const result = document.querySelector('#formResult');
const messagePreview = document.querySelector('#messagePreview');
const copyBtn = document.querySelector('#copyBtn');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!contactForm.reportValidity()) return;
  const name = contactForm.elements.nome.value.trim();
  const objective = contactForm.elements.objetivo.value;
  const message = contactForm.elements.mensagem.value.trim();
  if (!name || !message) return;
  messagePreview.textContent = `Olá! Meu nome é ${name}.\nTenho interesse em: ${objective}.\n\n${message}`;
  result.hidden = false;
  copyBtn.textContent = 'COPIAR TEXTO';
  result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
});
copyBtn.addEventListener('click', async () => {
  const text = messagePreview.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'TEXTO COPIADO ✓';
  } catch (err) {
    const selection = window.getSelection();
    const range = document.createRange(); range.selectNodeContents(messagePreview);
    selection.removeAllRanges(); selection.addRange(range);
    copyBtn.textContent = 'SELECIONE E COPIE O TEXTO';
  }
});

// 7) Brilho de fundo acompanha o mouse somente em dispositivos compatíveis
const glow = document.querySelector('#pointerGlow');
if (window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  window.addEventListener('pointermove', e => {
    glow.style.transform = `translate(${e.clientX - 210}px, ${e.clientY - 210}px)`;
  }, { passive: true });
} else { glow.style.display = 'none'; }

// 8) Abertura cinematográfica — você pode estudar o tempo das cenas aqui.
// Funciona sem GSAP; usuários com movimento reduzido entram direto no site.
const cinematicIntro = document.querySelector('#cinematicIntro');
const skipIntroButton = document.querySelector('#skipIntro');
const replayIntroButton = document.querySelector('#replayIntro');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let introExitTimer = null;
let introCleanupTimer = null;
let introRunning = false;
const INTRO_DURATION_MS = 4250;
const INTRO_EXIT_MS = 850;
function finishIntro(immediately = false) {
  if (!introRunning) return;
  introRunning = false;
  clearTimeout(introExitTimer);
  clearTimeout(introCleanupTimer);
  if (immediately) {
    cinematicIntro.classList.remove('is-exiting');
    document.documentElement.classList.remove('intro-ready');
    cinematicIntro.setAttribute('aria-hidden', 'true');
    return;
  }
  cinematicIntro.classList.add('is-exiting');
  // O hero retoma sua animação durante a transição, e não antes.
  document.documentElement.classList.remove('intro-ready');
  introCleanupTimer = setTimeout(() => {
    cinematicIntro.classList.remove('is-exiting');
    cinematicIntro.setAttribute('aria-hidden', 'true');
  }, INTRO_EXIT_MS);
}
function startIntro() {
  if (reducedMotionQuery.matches) return;
  clearTimeout(introExitTimer);
  clearTimeout(introCleanupTimer);
  cinematicIntro.classList.remove('is-exiting');
  // Força reinício da linha do tempo CSS ao usar "rever abertura".
  document.documentElement.classList.remove('intro-ready');
  void cinematicIntro.offsetWidth;
  cinematicIntro.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('intro-ready');
  introRunning = true;
  introExitTimer = setTimeout(() => finishIntro(false), INTRO_DURATION_MS);
}
skipIntroButton.addEventListener('click', () => finishIntro(true));
replayIntroButton.addEventListener('click', startIntro);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && introRunning) finishIntro(true);
});
if (document.documentElement.classList.contains('intro-ready')) startIntro();
else cinematicIntro.setAttribute('aria-hidden', 'true');
