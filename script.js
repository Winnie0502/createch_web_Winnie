// Ideas in Art and Technology (ARTD6231) weekly micro-abstract structure —
// the "name" values must stay in sync with admin/config.yml and the week-NN.json files.
const ACM_SECTIONS = [
  { name: "introduction", label: "1. Introduction" },
  { name: "related_work", label: "2. Related Work" },
  { name: "method", label: "3. Method" },
  { name: "results_discussion", label: "4. Results and Discussion" },
  { name: "conclusion_future_work", label: "5. Conclusion and Future Work" },
];

const siteTitleEl = document.getElementById("site-title");
const moduleTabsEl = document.getElementById("module-tabs");
const subTabsEl = document.getElementById("sub-tabs");
const contentEl = document.getElementById("content");

let modules = [];
let activeModule = null;
let activeSubTab = "blog";

init();

async function init() {
  const [site, moduleList] = await Promise.all([
    fetchJSON("content/site.json"),
    fetchJSON("content/modules.json"),
  ]);

  const name = site.studentName && site.studentName.trim();
  siteTitleEl.textContent = `Creative Technologies MSc — The Work of ${
    name || "[Your Name]"
  }`;
  document.title = name
    ? `Creative Technologies MSc — ${name}`
    : "Creative Technologies MSc";

  modules = moduleList.modules || [];
  renderModuleTabs();
  if (modules.length) selectModule(modules[0].id);
}

function renderModuleTabs() {
  moduleTabsEl.innerHTML = "";
  modules.forEach((mod) => {
    const btn = document.createElement("button");
    btn.textContent = mod.title;
    btn.className = mod.id === activeModule ? "active" : "";
    btn.addEventListener("click", () => selectModule(mod.id));
    moduleTabsEl.appendChild(btn);
  });
}

async function selectModule(moduleId) {
  activeModule = moduleId;
  activeSubTab = "blog";
  renderModuleTabs();

  const mod = modules.find((m) => m.id === moduleId);
  renderSubTabs(mod);
  await renderActiveSubTab(mod);
}

function renderSubTabs(mod) {
  subTabsEl.innerHTML = "";
  subTabsEl.hidden = false;

  const blogBtn = document.createElement("button");
  blogBtn.textContent = "Blog";
  blogBtn.className = activeSubTab === "blog" ? "active" : "";
  blogBtn.addEventListener("click", () => switchSubTab(mod, "blog"));
  subTabsEl.appendChild(blogBtn);

  if (mod.hasProjects) {
    const projectsBtn = document.createElement("button");
    projectsBtn.textContent = "Projects";
    projectsBtn.className = activeSubTab === "projects" ? "active" : "";
    projectsBtn.addEventListener("click", () => switchSubTab(mod, "projects"));
    subTabsEl.appendChild(projectsBtn);
  }
}

async function switchSubTab(mod, tab) {
  activeSubTab = tab;
  renderSubTabs(mod);
  await renderActiveSubTab(mod);
}

async function renderActiveSubTab(mod) {
  contentEl.innerHTML = "";
  if (activeSubTab === "blog") {
    await renderBlog(mod.id);
  } else if (activeSubTab === "projects") {
    await renderProjects(mod.id);
  }
}

async function renderBlog(moduleId) {
  const weekNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
  const weeks = await Promise.all(
    weekNumbers.map((n) =>
      fetchJSON(
        `content/modules/${moduleId}/weeks/week-${String(n).padStart(2, "0")}.json`
      ).catch(() => null)
    )
  );

  const posted = weeks.filter((w) => w && w.title && w.title.trim() !== "");

  if (!posted.length) {
    contentEl.innerHTML = `<p class="empty-state">No weekly entries posted yet.</p>`;
    return;
  }

  posted.forEach((week) => {
    const card = document.createElement("article");
    card.className = "week-card";

    const heading = document.createElement("h2");
    heading.textContent = `Week ${week.week}: ${week.title}`;
    card.appendChild(heading);

    if (week.date) {
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = week.date;
      card.appendChild(meta);
    }

    ACM_SECTIONS.forEach((section) => {
      const text = week[section.name];
      if (!text || !text.trim()) return;
      const wrap = document.createElement("div");
      wrap.className = "acm-section";
      const h3 = document.createElement("h3");
      h3.textContent = section.label;
      const p = document.createElement("p");
      p.textContent = text;
      wrap.appendChild(h3);
      wrap.appendChild(p);
      card.appendChild(wrap);
    });

    appendMedia(card, week.images, week.video);

    if (week.references && week.references.trim()) {
      const wrap = document.createElement("div");
      wrap.className = "acm-section";
      const h3 = document.createElement("h3");
      h3.textContent = "References";
      const p = document.createElement("p");
      p.textContent = week.references;
      wrap.appendChild(h3);
      wrap.appendChild(p);
      card.appendChild(wrap);
    }

    contentEl.appendChild(card);
  });
}

async function renderProjects(moduleId) {
  const data = await fetchJSON(
    `content/modules/${moduleId}/projects.json`
  ).catch(() => ({ projects: [] }));
  const projects = data.projects || [];

  if (!projects.length) {
    contentEl.innerHTML = `<p class="empty-state">No projects posted yet.</p>`;
    return;
  }

  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const heading = document.createElement("h2");
    heading.textContent = project.title || "Untitled project";
    card.appendChild(heading);

    if (project.description) {
      const p = document.createElement("p");
      p.textContent = project.description;
      card.appendChild(p);
    }

    appendMedia(card, project.images, project.video);

    if (project.link) {
      const a = document.createElement("a");
      a.href = project.link;
      a.textContent = "View project →";
      a.target = "_blank";
      a.rel = "noopener";
      card.appendChild(a);
    }

    contentEl.appendChild(card);
  });
}

function appendMedia(card, images, videoUrl) {
  if (images && images.length) {
    const gallery = document.createElement("div");
    gallery.className = "media-gallery";
    images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      gallery.appendChild(img);
    });
    card.appendChild(gallery);
  }

  const embedUrl = toEmbedUrl(videoUrl);
  if (embedUrl) {
    const wrap = document.createElement("div");
    wrap.className = "video-embed";
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.allowFullscreen = true;
    wrap.appendChild(iframe);
    card.appendChild(wrap);
  }
}

// Converts a normal YouTube or Vimeo watch URL into an embeddable iframe URL.
function toEmbedUrl(url) {
  if (!url) return null;

  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}
