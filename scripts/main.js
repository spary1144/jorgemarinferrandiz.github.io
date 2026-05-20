async function loadComponent(containerId, file) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(String(response.status));
    }

    container.innerHTML = await response.text();
  } catch (error) {
    container.innerHTML = `<p>Error loading ${file}: ${error.message}</p>`;
  }
}

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) {
      throw new Error(String(response.status));
    }

    const data = await response.json();
    return Array.isArray(data.projects) ? data.projects : [];
  } catch (error) {
    console.error("Error loading projects:", error);
    return [];
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function renderProjectList(projects) {
  const container = document.getElementById("project-list");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  projects.forEach(project => {
    const tags = Array.isArray(project.stack)
      ? project.stack.map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`).join("")
      : "";
    const projectLink = project.url || project.github || "#";
    const projectLinkLabel = project.linkLabel || "Open repository";

    const card = document.createElement("a");
    card.className = "project-card";
    card.href = projectLink;
    card.target = "_blank";
    card.rel = "noopener";
    card.setAttribute("data-reveal", "");
    card.innerHTML = `
      <div class="project-media">
        <img src="${escapeHtml(project.img)}" alt="${escapeHtml(project.title)}">
      </div>
      <div class="project-card-body">
        <div class="project-card-top">
          <span class="project-card-year">${escapeHtml(project.date)}</span>
          <span class="project-card-link">${escapeHtml(projectLinkLabel)}</span>
        </div>
        <h3>${escapeHtml(project.title)}</h3>
        <p class="project-card-role">${escapeHtml(project.role)}</p>
        <p class="project-card-copy">${escapeHtml(project.short)}</p>
        <div class="project-tags">${tags}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

function initNavigation() {
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  const navPanel = document.getElementById("nav-panel");

  if (!navbar || !toggle || !navPanel) {
    return;
  }

  const setScrolledState = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  const closeNavigation = () => {
    body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const nextState = !body.classList.contains("nav-open");
    body.classList.toggle("nav-open", nextState);
    toggle.setAttribute("aria-expanded", String(nextState));
  });

  navPanel.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeNavigation();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) {
      closeNavigation();
    }
  });

  window.addEventListener("scroll", setScrolledState, { passive: true });
  setScrolledState();
}

function initModals() {
  const body = document.body;
  const modalButtons = document.querySelectorAll(".show-more-btn");
  const modals = Array.from(document.querySelectorAll(".modal"));

  if (!modalButtons.length || !modals.length) {
    return;
  }

  const closeModal = modal => {
    modal.classList.remove("active");
    if (!document.querySelector(".modal.active")) {
      body.classList.remove("modal-open");
    }
  };

  const openModal = modal => {
    body.classList.add("modal-open");
    modal.classList.add("active");
  };

  modalButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-modal");
      if (!targetId) {
        return;
      }

      const modal = document.getElementById(targetId.replace(/^#/, ""));
      if (modal) {
        openModal(modal);
      }
    });
  });

  modals.forEach(modal => {
    modal.querySelectorAll(".close-btn, .modal-close, .close").forEach(button => {
      button.addEventListener("click", () => closeModal(modal));
    });

    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
      return;
    }

    modals.forEach(modal => {
      if (modal.classList.contains("active")) {
        closeModal(modal);
      }
    });
  });
}

function initRevealAnimations() {
  const revealElements = document.querySelectorAll("[data-reveal]");

  if (!revealElements.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach(element => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.2,
    rootMargin: "0px 0px -40px 0px"
  });

  revealElements.forEach(element => observer.observe(element));
}

function setCurrentYear() {
  const yearNode = document.getElementById("current-year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

async function loadSection(file) {
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(`Failed to load ${file}: ${response.status}`);
  }

  return response.text();
}

async function initPage() {
  await loadComponent("header", "components/header.html");

  const mainContent = document.getElementById("main-content");
  if (!mainContent) {
    return;
  }

  const sections = await Promise.all([
    loadSection("components/hero-about.html"),
    loadSection("components/projects.html"),
    loadSection("components/technical-experience.html"),
    loadSection("components/experience.html"),
    loadSection("components/about.html")
  ]);

  mainContent.innerHTML = sections.join("");
  await loadComponent("footer", "components/footer.html");

  const projects = await loadProjects();
  renderProjectList(projects);

  initNavigation();
  initModals();
  initRevealAnimations();
  setCurrentYear();
}

window.addEventListener("DOMContentLoaded", initPage);
