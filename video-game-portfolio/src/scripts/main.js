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

// Inicialización de la página
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

  enableSmoothScroll();
  setupExperienceModal();
  revealOnScroll();
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', initPage);
