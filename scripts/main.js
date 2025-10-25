// Cargar componente HTML en un contenedor
async function loadComponent(containerId, file) {
  const container = document.getElementById(containerId);
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(response.status);
    container.innerHTML = await response.text();
  } catch (err) {
    container.innerHTML = `<p>Error al cargar ${file}: ${err}</p>`;
  }
}

// Scroll suave
function enableSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Animación fade-in
function revealOnScroll() {
  const items = document.querySelectorAll('.timeline-item');
  const windowHeight = window.innerHeight;
  items.forEach(item => {
    const elementTop = item.getBoundingClientRect().top;
    const revealPoint = 150;
    if (elementTop < windowHeight - revealPoint) {
      item.classList.add('visible');
    }
  });
}

// Control dinámico del modal “Show more”
function setupExperienceModal() {
  // Maneja botones que apuntan a modales ya presentes (data-modal="#id" o data-modal="id")
  document.querySelectorAll('.show-more-btn').forEach(button => {
    button.addEventListener('click', () => {
      const modalRef = button.getAttribute('data-modal');
      if (modalRef) {
        const id = modalRef.startsWith('#') ? modalRef.slice(1) : modalRef;
        const modal = document.getElementById(id);
        if (!modal) {
          console.warn('Modal no encontrado:', modalRef);
          return;
        }
        modal.classList.add('active');

        // cerrar con botones dentro del modal
        modal.querySelectorAll('.close-btn, .modal-close, .close').forEach(cb =>
          cb.addEventListener('click', () => modal.classList.remove('active'))
        );

        // cerrar al hacer click fuera del contenido
        modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); }, { once: false });
        return;
      }

      // Fallback: si el botón no referencia un modal por id, intenta rellenar un modal "global"
      const globalModal = document.querySelector('.modal:not([id])') || document.querySelector('.modal');
      if (!globalModal) return;

      const modalContent = globalModal.querySelector('.modal-content');
      const title = button.getAttribute('data-title') || button.textContent;
      const description = button.getAttribute('data-description') || '';
      const bullets = JSON.parse(button.getAttribute('data-bullets') || '[]');
      const github = button.getAttribute('data-github');

      modalContent.innerHTML = `
        <button class="modal-close">&times;</button>
        <h3>${title}</h3>
        <hr class="modal-separator">
        <p>${description}</p>
        ${bullets.length ? `<ul class="modal-bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
        ${github ? `<a href="${github}" target="_blank" class="modal-github-btn">See on GitHub</a>` : ''}
      `;

      globalModal.classList.add('active');
      const closeBtn = modalContent.querySelector('.modal-close');
      if (closeBtn) closeBtn.addEventListener('click', () => globalModal.classList.remove('active'));
      globalModal.addEventListener('click', e => { if (e.target === globalModal) globalModal.classList.remove('active'); });
    });
  });
}

// Posiciona los dots de la timeline: crea .timeline-dot por cada .timeline-item
function updateTimelineDots() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  // eliminar dots previos
  timeline.querySelectorAll('.timeline-dot').forEach(d => d.remove());

  const items = Array.from(timeline.querySelectorAll('.timeline-item'));
  const timelineRect = timeline.getBoundingClientRect();
  const isMobile = window.innerWidth <= 768;

  items.forEach(item => {
    const title = item.querySelector('h3') || item; // intentar alinear con h3 si existe
    const titleRect = title.getBoundingClientRect();

    // calcular top relativo al contenedor .timeline
    const top = (titleRect.top - timelineRect.top) + (titleRect.height / 2) + timeline.scrollTop;

    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    dot.style.top = `${Math.round(top)}px`;

    if (isMobile) {
      dot.classList.add('timeline-dot--left');
    }

    timeline.appendChild(dot);
  });

  // alterna clase útil para CSS si estamos en modo móvil
  if (isMobile) timeline.classList.add('dots-left');
  else timeline.classList.remove('dots-left');
}

// recalcula al cambiar tamaño, carga y cuando el contenido cambia
window.addEventListener('resize', () => {
  // pequeño debounce para evitar muchas llamadas en resize
  clearTimeout(window.__timelineDotsTimeout);
  window.__timelineDotsTimeout = setTimeout(updateTimelineDots, 120);
});
window.addEventListener('load', updateTimelineDots);
window.addEventListener('DOMContentLoaded', updateTimelineDots);

// ---------------------------
// proyectos (array para escalabilidad)
// ---------------------------
const projects = [
  {
    id: 'p-physics',
    title: 'Sistema de Física Avanzada',
    short: 'Ragdoll, constraints y optimizaciones multihilo.',
    desc: '<p>Optimicé el solver de colisiones, añadí pooling y batching. Resultado: -55% CPU en escenas con 200+ objetos dinámicos.</p><p>Tecnologías: Unity · C#</p>',
    img: 'assets/project-physics.png',
    meta: 'Unity · C# · Performance',
    github: 'https://github.com/jorgemarinferrandiz/physics-system',
    live: ''
  },
  {
    id: 'p-ai',
    title: 'AI Director / Behavior Trees',
    short: 'Director de IA que adapta oleadas según telemetría.',
    desc: '<p>Implementé behavior trees y un director que adapta dificultad según métricas del jugador.</p><p>Tecnologías: Unreal · C++</p>',
    img: 'assets/project-ai.png',
    meta: 'Unreal · C++ · AI',
    github: 'https://github.com/jorgemarinferrandiz/ai-director',
    live: ''
  },
  {
    id: 'p-tools',
    title: 'Editor de Niveles — Herramienta',
    short: 'Editor con undo/redo y exportación a runtime.',
    desc: '<p>Herramienta de edición con pipelines para diseñadores, reduciendo tiempo de creación de niveles.</p><p>Tecnologías: C++ · Qt</p>',
    img: 'assets/project-tools.png',
    meta: 'Tools · C++',
    github: 'https://github.com/jorgemarinferrandiz/level-editor',
    live: ''
  }
];

// Escape básico para inyectar texto seguro en elementos
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Renderiza la grid de proyectos dentro de #project-list
function renderProjectList(){
  const container = document.getElementById('project-list');
  if (!container) return;
  container.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('article');
    card.className = 'project-card card';
    card.innerHTML = `
      <div class="project-media">
        <img src="${p.img}" alt="${escapeHtml(p.title)}">
      </div>
      <h3>${escapeHtml(p.title)}</h3>
      <div class="short" style="color:var(--muted)">${escapeHtml(p.short)}</div>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="project-show-btn btn" data-id="${p.id}" type="button">Ver detalles</button>
        <a class="btn" href="${p.github}" target="_blank" rel="noopener">Repositorio</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// Crea modal global si no existe en el HTML (fallback)
function createGlobalProjectModal(){
  if (document.getElementById('project-modal')) return;
  const tpl = document.createElement('div');
  tpl.innerHTML = `
    <div id="project-modal" class="modal" aria-hidden="true">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
        <button class="close-btn" aria-label="Cerrar">✕</button>
        <div id="project-modal-body"></div>
      </div>
    </div>
  `;
  document.body.appendChild(tpl.firstElementChild);
}

// Inicializa la lógica de abrir/llenar modal de proyectos (usa data-id que apunta al array)
function setupProjectModals(){
  // delegación
  document.body.addEventListener('click', (ev) => {
    const btn = ev.target.closest && ev.target.closest('.project-show-btn');
    if (!btn) return;
    ev.preventDefault();

    const id = btn.getAttribute('data-id');
    const proj = projects.find(x => x.id === id);
    if (!proj) return;

    if (!document.getElementById('project-modal')) createGlobalProjectModal();
    const modal = document.getElementById('project-modal');
    const body = modal.querySelector('#project-modal-body');

    body.innerHTML = `
      ${ proj.img ? `<img class="project-thumb" src="${proj.img}" alt="${escapeHtml(proj.title)}">` : '' }
      <h3 id="project-modal-title">${escapeHtml(proj.title)}</h3>
      <div style="color:var(--muted);margin-bottom:8px">${escapeHtml(proj.meta)}</div>
      <div class="project-desc">${proj.desc}</div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        ${ proj.live ? `<a class="btn" href="${proj.live}" target="_blank" rel="noopener">Ver demo</a>` : '' }
        ${ proj.github ? `<a class="btn" href="${proj.github}" target="_blank" rel="noopener">Repositorio</a>` : '' }
        <button class="btn close-from-inside" type="button">Cerrar</button>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');

    // cerrar desde botones dentro del modal
    modal.querySelectorAll('.close-btn, .close-from-inside').forEach(cb => {
      cb.addEventListener('click', () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden','true');
      }, { once: true });
    });

    // cerrar al pulsar fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden','true');
      }
    }, { once: false });
  });
}

// Llamar desde la inicialización de la página después de cargar las secciones dinámicas
// (si ya tienes initPage, añade updateTimelineDots() allí después de insertar experience)
async function initPage() {
  await loadComponent('header', 'components/header.html');

  const mainContent = document.getElementById('main-content');
  const sections = await Promise.all([
    fetch('components/hero-about.html').then(r => r.text()),
    fetch('components/about.html').then(r => r.text()),
    fetch('components/experience.html').then(r => r.text()),
    fetch('components/projects.html').then(r => r.text())
  ]);

  mainContent.innerHTML = sections.join('');
  await loadComponent('footer', 'components/footer.html');

  // renderizar proyectos desde el array y habilitar los modales
  renderProjectList();
  setupProjectModals();

  enableSmoothScroll();
  setupExperienceModal();
  revealOnScroll();

  // generar y posicionar los dots tras cargar el contenido
  updateTimelineDots();
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', initPage);
