// =============================================
//  HYPE BOARD — script.js
// =============================================

// ── Data ──────────────────────────────────────
let posts = [];

const STORAGE_KEY = "hypeboard_v1";

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function loadPosts() {
  const stored = localStorage.getItem("hypeboard");
  if (stored) {
    posts = JSON.parse(stored);
  }
}

// ── Helpers ───────────────────────────────────
const categoryLabels = {
  motivation: "💪 Motivation",
  sports:     "🏆 Sports",
  academics:  "📚 Academics",
  life:       "✨ Life",
};

function getCategoryLabel(cat) {
  return categoryLabels[cat] || cat;
}

function getCurrentFilter() {
  return document.getElementById("filter-select").value;
}

// ── Render ────────────────────────────────────
function renderPosts(filter = "all") {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  const visible =
    filter === "all" ? posts : posts.filter((p) => p.category === filter);

  visible.forEach((post, index) => {
    const card = document.createElement("div");
    card.className = "hype-card";

    card.innerHTML = `
      <div class="card-top">
        <span class="card-author">${post.author}</span>
        <span class="card-badge">${getCategoryLabel(post.category)}</span>
      </div>
      <p class="card-message">${post.message}</p>
      <div class="card-bottom">
        <button class="upvote-btn" data-index="${index}">
          🔥 <span class="upvote-count">${post.upvotes}</span>
        </button>
        <button class="delete-btn" data-index="${index}" title="Delete">🗑️</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Upvote buttons
  container.querySelectorAll(".upvote-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index);
      posts[i].upvotes = posts[i].upvotes + 1;
      savePosts();
      renderPosts(getCurrentFilter());
    });
  });

  // Delete buttons
  container.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index);
      posts.splice(i + 1, 1);
      savePosts();
      renderPosts(getCurrentFilter());
    });
  });
}

// ── Add Post ──────────────────────────────────
function addPost(author, message, category) {
  const newPost = {
    author: author,
    message: message,
    category: category,
    upvotes: "0",
  };
  posts.unshift(newPost);
  savePosts();
  renderPosts(getCurrentFilter());
}

// ── Form Submit ───────────────────────────────
const hypeForm = document.getElementById("hype-form");
hypeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const author   = document.getElementById("author-input").value.trim();
  const message  = document.getElementById("hype-input").value.trim();
  const category = document.getElementById("category-input").value;

  if (!author || !message) return;

  addPost(author, message, category);

  document.getElementById("author-input").value = "";
  document.getElementById("hype-input").value = "";
});

// ── Filter ────────────────────────────────────
document.getElementById("filter-select").addEventListener("change", (e) => {
  renderPosts(e.target.value);
});

// ── Init ──────────────────────────────────────
loadPosts();
renderPosts();
