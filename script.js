// ============================================
// DATA STORAGE
// ============================================

// Store posts in memory (will be lost on page refresh)
let posts = [
    {
        id: 1,
        title: "Traditional Italian Pasta Making",
        content: "Growing up in a small village in Tuscany, I learned the art of pasta making from my grandmother. Every Sunday, we would gather in her kitchen, the warm smell of fresh dough filling the air.\n\nThe secret, she would say, is in the patience. The dough needs time to rest, to breathe, to become one with your intentions. We would knead for exactly 10 minutes, no more, no less.\n\nHer recipe was simple: 100g of flour per egg, a pinch of salt, and lots of love. The pasta would be rolled out thin enough to read a newspaper through it, then cut into perfect fettuccine strips.\n\nThese Sunday meals taught me that food is more than sustenance - it's memory, tradition, and love passed down through generations.",
        region: "Europe",
        image: null,
        date: "2024-12-10"
    },
    {
        id: 2,
        title: "Street Food Magic in Bangkok",
        content: "The streets of Bangkok come alive at night with the sizzle of woks and the aromatic blend of lemongrass, chili, and fish sauce. My first experience with Pad Thai from a street vendor changed my understanding of food forever.\n\nThe vendor, an elderly woman who had been cooking at the same corner for 30 years, moved with practiced precision. Rice noodles dancing in the wok, eggs cracking with one hand, tamarind paste adding that perfect sweet-sour balance.\n\nWhat makes Thai street food special is the balance - sweet, sour, salty, and spicy all in perfect harmony. It's fast food, but made with the care and expertise of a five-star restaurant.\n\nThis experience taught me that great food doesn't need fancy settings - it needs passion, skill, and authentic flavors.",
        region: "Asia",
        image: null,
        date: "2024-12-09"
    }
];

let currentFilter = 'all';
let selectedFiles = [];

// ============================================
// INITIALIZATION
// ============================================

// Initialize the blog grid when page loads
document.addEventListener('DOMContentLoaded', function() {
    renderBlogGrid();
});

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderBlogGrid() {
    const grid = document.getElementById('blogGrid');
    const filteredPosts = currentFilter === 'all' 
        ? posts 
        : posts.filter(post => post.region === currentFilter);

    if (filteredPosts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #636e72;">
                <div style="font-size: 64px; margin-bottom: 20px;">🍽️</div>
                <h3>No posts yet from this region</h3>
                <p>Be the first to share a food story!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredPosts.map(post => `
        <div class="blog-card" onclick="viewPost(${post.id})">
            ${post.image 
                ? `<img src="${post.image}" alt="${post.title}" class="blog-card-image">` 
                : '<div class="blog-card-image"></div>'
            }
            <div class="blog-card-content">
                <div class="blog-card-title">${escapeHtml(post.title)}</div>
                <div class="blog-card-excerpt">${escapeHtml(post.content.substring(0, 150))}...</div>
                <div class="blog-card-meta">
                    <span class="region-tag">${escapeHtml(post.region)}</span>
                    <span>${post.date}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// FILTER FUNCTIONS
// ============================================

function filterByRegion(region) {
    currentFilter = region;
    renderBlogGrid();

    // Update active button
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openCreateModal() {
    document.getElementById('createModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCreateModal() {
    document.getElementById('createModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('createPostForm').reset();
    selectedFiles = [];
    document.getElementById('previewContainer').innerHTML = '';
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// FILE HANDLING
// ============================================

function previewFiles() {
    const files = document.getElementById('fileInput').files;
    const container = document.getElementById('previewContainer');
    container.innerHTML = '';
    selectedFiles = Array.from(files);

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// ============================================
// POST CREATION
// ============================================

function handleSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('postTitle').value;
    const region = document.getElementById('postRegion').value;
    const content = document.getElementById('postContent').value;
    
    let imageUrl = null;
    if (selectedFiles.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageUrl = e.target.result;
            savePost(title, region, content, imageUrl);
        };
        reader.readAsDataURL(selectedFiles[0]);
    } else {
        savePost(title, region, content, null);
    }
}

function savePost(title, region, content, imageUrl) {
    const newPost = {
        id: posts.length + 1,
        title: title,
        content: content,
        region: region,
        image: imageUrl,
        date: new Date().toISOString().split('T')[0]
    };

    posts.unshift(newPost); // Add to beginning of array
    renderBlogGrid();
    closeCreateModal();
    
    // Auto-open the newly created post after a short delay
    setTimeout(() => viewPost(newPost.id), 300);
}

// ============================================
// POST VIEWING
// ============================================

function viewPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const postView = document.getElementById('postView');
    postView.innerHTML = `
        <div class="post-header">
            <h1 class="post-title">${escapeHtml(post.title)}</h1>
            <div class="post-meta-info">
                <span class="region-tag">${escapeHtml(post.region)}</span>
                <span>📅 ${post.date}</span>
            </div>
        </div>
        ${post.image ? `
            <div class="post-image-container">
                <img src="${post.image}" alt="${escapeHtml(post.title)}" class="post-image">
            </div>
        ` : ''}
        <div class="post-content">${escapeHtml(post.content)}</div>
    `;

    document.getElementById('viewModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// EVENT LISTENERS
// ============================================

// Close modals when clicking outside
window.onclick = function(event) {
    const createModal = document.getElementById('createModal');
    const viewModal = document.getElementById('viewModal');
    
    if (event.target === createModal) {
        closeCreateModal();
    }
    if (event.target === viewModal) {
        closeViewModal();
    }
}

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCreateModal();
        closeViewModal();
    }
});