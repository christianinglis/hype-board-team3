// =============================================
//  HYPE BOARD — script.js
// =============================================

// ── Data ──────────────────────────────────────
let posts = [];
let isNewPost = false;

const STORAGE_KEY = "hypeboard";

//Saves posts to storage (json file)
function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

//Loads posts from storage (searches through json file and finds posts with matching keys)
function loadPosts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    posts = JSON.parse(stored).map(p => ({
      ...p,
      upvotes: Number(p.upvotes),
      timestamp: typeof p.timestamp === 'string' ? new Date(p.timestamp).getTime() : p.timestamp,
      id: p.id || Date.now() + Math.random()
    }));
  }
}

// ── Helpers ───────────────────────────────────
const categoryLabels = {
  motivation: "💪 Motivation",
  sports:     "🏆 Sports",
  academics:  "📚 Academics",
  life:       "✨ Life",
};

//Returns category of post from category labels
function getCategoryLabel(cat) {
  return categoryLabels[cat] || cat;
}

//Returns the selected value (all, or category) from the dropdown selection
function getCurrentFilter() {
  return document.getElementById("filter-select").value;
}

//Returns the selected sort value
function getCurrentSort() {
  return document.getElementById("sort-select").value;
}

//Calculates and displays the total upvotes across all posts
function updateTotalUpvotes() {
  const total = posts.reduce((sum, post) => sum + Number(post.upvotes), 0);
  const upvotesDisplay = document.getElementById("total-upvotes");
  if (upvotesDisplay) {
    upvotesDisplay.textContent = `Total Hype: ${total} 🔥`;
  }
}

// ── Render ────────────────────────────────────

//Renders the posts based on the current selected filter
function renderPosts(filter = "all", sort = "newest") {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  let visible = filter === "all" ? posts : posts.filter((p) => p.category === filter);

  if (sort === "hype") {
    visible = visible.sort((a, b) => b.upvotes - a.upvotes);
  } else {
    visible = visible.sort((a, b) => b.timestamp - a.timestamp);
  }

  visible.forEach((post, index) => {
    const card = document.createElement("div");
    card.className = "hype-card";
    
    // Add animation class only to the first card if it's a new post
    if (index === 0 && isNewPost) {
      card.classList.add("new-post");
      isNewPost = false;
    }

    card.innerHTML = `
      <div class="card-top">
        <span class="card-author">${post.author}</span>
        <span class="card-badge">${getCategoryLabel(post.category)}</span>
        <span class="card-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
      </div>
      <p class="card-message">${post.message}</p>
      <div class="card-bottom">
        <button class="upvote-btn" data-id="${post.id}" title="Upvote this post">
          🔥 <span class="upvote-count">${post.upvotes}</span>
        </button>
        <button class="delete-btn" data-id="${post.id}" title="Delete this post">🗑️</button>
      </div>
    `;

    container.appendChild(card);

    
  });

  if (posts.length == 0 || visible.length == 0) {
      container.innerHTML = "No hype yet! Be the first. 🔥";
    }
  // Update total upvotes display
  updateTotalUpvotes();

  // Upvote buttons
  container.querySelectorAll(".upvote-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const post = posts.find(p => p.id === id);
      if (post) {
        post.upvotes += 1;
        savePosts();
        updateTotalUpvotes();
        renderPosts(getCurrentFilter(), getCurrentSort());
      }
    });
  });

  // Delete buttons
  container.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {

      //added a prompt to confirm post deletion 
      let query = prompt("Are you sure you would like to delete this post? Y/N")
      if (query.toLowerCase() == "y" || query.toLowerCase() == "yes"){
        const id = parseInt(btn.dataset.id);
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex !== -1) {
          posts.splice(postIndex, 1);
          savePosts();
          updateTotalUpvotes();
          renderPosts(getCurrentFilter(), getCurrentSort());
        }
      }
    });
  });
}

// ── dynamically display character count ───────
hypeInput = document.getElementById("hype-input");
maxLength = document.getElementById("hype-input").maxLength;
hypeInput.addEventListener('input', () => {
  if((Number(maxLength) - hypeInput.value.length) <= 20){
    document.getElementById("char-count").style.color = "red";
  }else{
    document.getElementById("char-count").style.color = "white";
  }
  document.getElementById("char-count").innerHTML = hypeInput.value.length + "/" + maxLength;
  
})

// ── Add Post ──────────────────────────────────

//Adds a new post when the user posts one
function addPost(author, message, category, timestamp) {
  const newPost = {
    id: Date.now(),
    author: author,
    message: message,
    category: category,
    upvotes: 0,
    timestamp: timestamp,
  };

  //Reset the char counter
  document.getElementById("char-count").innerHTML = "0/150"


  if (posts.length < 20){
    posts.unshift(newPost);
    isNewPost = true;
    savePosts();
    renderPosts(getCurrentFilter(), getCurrentSort());
  } else{
    window.alert("Board is full! Delete a post to make room.")
    throw new Error("Board is full! Delete a post to make room.")
  }
}

// ── Form Submit ───────────────────────────────
const hypeForm = document.getElementById("hype-form");
hypeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const author   = document.getElementById("author-input").value.trim();
  const message  = document.getElementById("hype-input").value.trim();
  const category = document.getElementById("category-input").value;
  const timestamp = Date.now();
  

  if (!author || !message) return;

  addPost(author, message, category, timestamp);

  document.getElementById("author-input").value = "";
  document.getElementById("hype-input").value = "";
});

// ── Filter ────────────────────────────────────
document.getElementById("filter-select").addEventListener("change", (e) => {
  renderPosts(e.target.value, getCurrentSort());
});

// ── Sort ──────────────────────────────────────
document.getElementById("sort-select").addEventListener("change", (e) => {
  renderPosts(getCurrentFilter(), e.target.value);
});

// ── Clear All ─────────────────────────────────

let clearAll = document.getElementById("clearAll")
clearAll.innerText = "Clear All Posts"

clearAll.addEventListener("click", function(){
  let query = prompt("Are you sure you would like to delete the whole board? Y/N")
      if (query.toLowerCase() == "y" || query.toLowerCase() == "yes"){
        posts = [];
        savePosts();
        renderPosts(getCurrentFilter())
}})


// ── Init ──────────────────────────────────────
loadPosts();
renderPosts();
