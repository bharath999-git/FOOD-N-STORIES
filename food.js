const postsGrid = document.getElementById("postsGrid");
const postForm = document.getElementById("postForm");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const regionSelect = document.getElementById("regionSelect");
const categoryTags = document.getElementById("categoryTags");
const searchInput = document.getElementById("searchInput");

const postModal = document.getElementById("postModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalMeta = document.getElementById("modalMeta");
const modalMedia = document.getElementById("modalMedia");
const closeModal = document.getElementById("closeModal");

let posts = JSON.parse(localStorage.getItem("fs_posts") || "[]");

let currentFilter = { region:"all", category:"all", q:"" };

function savePosts() {
  localStorage.setItem("fs_posts", JSON.stringify(posts));
}

function humanDate(ts) {
  return new Date(ts).toLocaleString();
}

/* ========== RENDERING ========== */
function renderPosts() {
  postsGrid.innerHTML = "";

  const filtered = posts
    .filter(p => {
      if (currentFilter.region !== "all" && p.region !== currentFilter.region) return false;
      if (currentFilter.category !== "all" && p.category !== currentFilter.category) return false;

      if (currentFilter.q) {
        const q = currentFilter.q.toLowerCase();
        const hay = (p.title + p.content).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => b.ts - a.ts);

  if (filtered.length === 0) {
    postsGrid.innerHTML = `<p style="color:gray;">No posts found.</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";

    let mediaHTML = "";
    if (p.mediaType === "image") {
      mediaHTML = `<img src="${p.media}" alt="">`;
    } else if (p.mediaType === "video") {
      mediaHTML = `<video src="${p.media}" muted></video>`;
    }

    card.innerHTML = `
      <div class="thumb">${mediaHTML}</div>
      <h4>${p.title}</h4>
      <p>${p.content.slice(0, 120)}${p.content.length > 120 ? "..." : ""}</p>
      <div class="meta">
        <span class="pill region">${p.region}</span>
        <span class="pill cat">${p.category}</span>
      </div>
      <div class="cardActions">
        <button class="btn viewBtn" data-id="${p.id}">View</button>
        <button class="btn ghost deleteBtn" data-id="${p.id}">Delete</button>
      </div>
    `;

    postsGrid.appendChild(card);
  });
}

/* Event Delegation for View/Delete */
postsGrid.addEventListener("click", e => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("viewBtn")) viewPost(id);
  if (e.target.classList.contains("deleteBtn")) deletePost(id);
});

/* ========== MEDIA PREVIEW ========== */
mediaInput.addEventListener("change", () => {
  const f = mediaInput.files[0];
  if (!f) return (mediaPreview.innerHTML = "");

  const url = URL.createObjectURL(f);

  mediaPreview.innerHTML =
    f.type.startsWith("image/")
      ? `<img src="${url}" style="max-height:120px;">`
      : `<video src="${url}" controls style="max-height:120px;"></video>`;
});

/* ========== CREATE POST ========== */
postForm.addEventListener("submit", async e => {
  e.preventDefault();

  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const region = document.getElementById("postRegion").value;
  const category = document.getElementById("postCategory").value;

  if (!title || !content) {
    alert("Please fill both title and content.");
    return;
  }

  let media = null;
  let mediaType = null;

  if (mediaInput.files[0]) {
    const f = mediaInput.files[0];
    media = await readAsBase64(f);
    mediaType = f.type.startsWith("image/") ? "image" : "video";
  }

  posts.push({
    id: "p_" + Math.random().toString(36).slice(2, 9),
    title,
    content,
    region,
    category,
    media,
    mediaType,
    ts: Date.now()
  });

  savePosts();
  postForm.reset();
  mediaPreview.innerHTML = "";
  renderPosts();
});

function readAsBase64(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });
}

/* ========== MODAL HANDLING ========== */
function viewPost(id) {
  const p = posts.find(x => x.id === id);
  if (!p) return;

  postModal.style.display = "flex";
  modalTitle.textContent = p.title;
  modalMeta.textContent = `${p.region} • ${p.category} • ${humanDate(p.ts)}`;
  modalBody.innerHTML = p.content.replace(/\n/g, "<br>");

  modalMedia.innerHTML =
    p.mediaType === "image"
      ? `<img src="${p.media}">`
      : p.mediaType === "video"
      ? `<video src="${p.media}" controls></video>`
      : `<p>No media</p>`;
}

closeModal.addEventListener("click", () => {
  postModal.style.display = "none";
});

/* Close on background click */
postModal.addEventListener("click", e => {
  if (e.target === postModal) postModal.style.display = "none";
});

/* ========== DELETE ========== */
function deletePost(id) {
  if (!confirm("Delete this post?")) return;
  posts = posts.filter(p => p.id !== id);
  savePosts();
  renderPosts();
}

/* Filters */
regionSelect.addEventListener("change", () => {
  currentFilter.region = regionSelect.value;
  renderPosts();
});

categoryTags.addEventListener("click", e => {
  if (!e.target.matches(".tag")) return;

  document.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));
  e.target.classList.add("active");

  currentFilter.category = e.target.dataset.cat;
  renderPosts();
});

searchInput.addEventListener("input", () => {
  currentFilter.q = searchInput.value.toLowerCase();
  renderPosts();
});

/* Initial content if empty */
if (posts.length === 0) {
  posts.push({
    id: "p_demo1",
    title: "Coconut Chutney — Kerala Style",
    region: "india",
    category: "recipe",
    content: "Fresh coconut, chillies, curry leaves...",
    media: null,
    mediaType: null,
    ts: Date.now()
  });
  savePosts();
}

renderPosts();
