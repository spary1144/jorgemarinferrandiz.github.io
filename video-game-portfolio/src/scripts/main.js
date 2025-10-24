// Función para cargar un componente HTML en un contenedor
async function loadComponent(containerId, file) {
  const container = document.getElementById(containerId);
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(response.status);
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p>Error al cargar ${file}: ${err}</p>`;
  }
}

// Función para habilitar scroll suave
function enableSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault(); // evita el salto brusco
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Animación fade-in al hacer scroll
function revealOnScroll() {
  const items = document.querySelectorAll('.timeline-item');
  const windowHeight = window.innerHeight;

  items.forEach(item => {
    const elementTop = item.getBoundingClientRect().top;
    const revealPoint = 150; // px antes de llegar a la ventana
    if (elementTop < windowHeight - revealPoint) {
      item.classList.add('visible');
    }
  });
}

// Control del modal “Show more”
function setupExperienceModal() {
  const modal = document.getElementById('experience-modal');
  const modalContent = document.querySelector('#experience-modal .modal-content');
  const closeBtn = document.getElementById('close-modal');

  // Botones “Show more”
  document.querySelectorAll('.show-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const details = btn.getAttribute('data-details');
      modalContent.querySelector('.modal-body').textContent = details;
      modal.classList.add('active');
    });
  });

  // Cerrar modal
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// Ejecutar al hacer scroll y al cargar página
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Cargar componentes y preparar interactividad
async function initPage() {
  await loadComponent('header', 'components/header.html');

  // Contenedor principal donde se cargan secciones
  const mainContent = document.getElementById('main-content');
  const sections = await Promise.all([
    fetch('components/hero-about.html').then(r => r.text()),
    fetch('components/about.html').then(r => r.text()),
    fetch('components/experience.html').then(r => r.text()),
    fetch('components/projects.html').then(r => r.text())
  ]);

  mainContent.innerHTML = sections.join('');

  await loadComponent('footer', 'components/footer.html');

  // Activar scroll suave y animaciones
  enableSmoothScroll();
  revealOnScroll();

  // Configurar los botones de “Show more”
  setupExperienceModal();
}

// Inicializar la página
initPage();
