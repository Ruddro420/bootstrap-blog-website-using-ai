/**
 * DevPulse - Blog Website Interactive Logic
 * Fully vanilla JavaScript using Bootstrap 5 components and APIs
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initReadingProgress();
    initCategoryFilter();
    initLiveSearch();
    initPostModal();
    initBookmarkButtons();
    initCreatePostForm();
    initNewsletterForms();
    initContactForm();
    initBackToTop();
});

/* ==========================================================================
   1. Dark / Light Theme Toggle with LocalStorage Persistence
   ========================================================================== */
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (!themeToggleBtn) return;

    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Check saved preference or fallback to system
    const savedTheme = localStorage.getItem('devpulse-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    setTheme(initialTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('devpulse-theme', nextTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'bi bi-sun-fill text-warning';
                themeToggleBtn.setAttribute('title', 'Switch to light mode');
            } else {
                themeIcon.className = 'bi bi-moon-stars-fill text-primary';
                themeToggleBtn.setAttribute('title', 'Switch to dark mode');
            }
        }
    }
}

/* ==========================================================================
   2. Reading Progress Bar (Top of Window)
   ========================================================================== */
function initReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/* ==========================================================================
   3. Category Filtering
   ========================================================================== */
function initCategoryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const postCards = document.querySelectorAll('.post-item');
    const emptyState = document.getElementById('no-posts-found');
    const searchInput = document.getElementById('nav-search-input');
    const categoryLinks = document.querySelectorAll('.filter-btn-link');

    if (!filterButtons.length || !postCards.length) return;

    function applyCategory(category) {
        filterButtons.forEach(b => {
            if (b.getAttribute('data-category') === category) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        // Reset search if user clicks a category
        if (searchInput) searchInput.value = '';

        let visibleCount = 0;
        const currentCards = document.querySelectorAll('.post-item');

        currentCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (category === 'all' || cardCat === category) {
                card.style.display = 'block';
                card.classList.add('animate-fade-in');
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            applyCategory(category);
        });
    });

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            if (category) {
                applyCategory(category);
                const section = document.getElementById('articles-section');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Handle tag badge clicks
    document.querySelectorAll('.tag-badge').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const tagText = tag.innerText.replace('#', '').trim();
            if (searchInput) {
                searchInput.value = tagText;
                searchInput.dispatchEvent(new Event('input'));
                const section = document.getElementById('articles-section');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

/* ==========================================================================
   4. Live Search Filter
   ========================================================================== */
function initLiveSearch() {
    const searchInputs = document.querySelectorAll('.blog-search-input');
    const postCards = document.querySelectorAll('.post-item');
    const emptyState = document.getElementById('no-posts-found');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (!searchInputs.length || !postCards.length) return;

    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            // Set "All" pill active if searching
            filterButtons.forEach(b => {
                if (b.getAttribute('data-category') === 'all') b.classList.add('active');
                else b.classList.remove('active');
            });

            let matches = 0;
            postCards.forEach(card => {
                const title = card.querySelector('.card-title')?.innerText.toLowerCase() || '';
                const desc = card.querySelector('.card-text')?.innerText.toLowerCase() || '';
                const category = card.getAttribute('data-category')?.toLowerCase() || '';

                if (title.includes(query) || desc.includes(query) || category.includes(query)) {
                    card.style.display = 'block';
                    matches++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (emptyState) {
                emptyState.style.display = matches === 0 ? 'block' : 'none';
            }
        });
    });
}

/* ==========================================================================
   5. Dynamic Post Modal ("Read More" / Quick Preview)
   ========================================================================== */
function initPostModal() {
    const postModalEl = document.getElementById('postModal');
    if (!postModalEl) return;

    const modal = new bootstrap.Modal(postModalEl);

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.view-post-btn');
        if (!trigger) return;

        e.preventDefault();
        const card = trigger.closest('.post-item');
        if (!card) return;

        const title = card.querySelector('.card-title')?.innerText.trim() || 'Blog Post';
        const category = card.querySelector('.card-category-badge')?.innerText.trim() || 'General';
        const image = card.querySelector('.card-img-wrapper img')?.getAttribute('src') || '';
        const authorName = card.querySelector('.author-name')?.innerText.trim() || 'DevPulse Author';
        const authorRole = card.querySelector('.author-role')?.innerText.trim() || 'Staff Contributor';
        const authorAvatar = card.querySelector('.author-avatar')?.getAttribute('src') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
        const date = card.querySelector('.post-date')?.innerText.trim() || 'Recent';
        const readTime = card.querySelector('.post-read-time')?.innerText.trim() || '5 min read';
        const fullContent = card.querySelector('.post-full-content')?.innerHTML || card.querySelector('.card-text')?.innerText || '';

        // Populate Modal Fields
        document.getElementById('modal-post-title').innerText = title;
        document.getElementById('modal-post-category').innerText = category;
        document.getElementById('modal-post-img').setAttribute('src', image);
        document.getElementById('modal-author-name').innerText = authorName;
        document.getElementById('modal-author-role').innerText = authorRole;
        document.getElementById('modal-author-avatar').setAttribute('src', authorAvatar);
        document.getElementById('modal-post-date').innerText = date;
        document.getElementById('modal-post-read-time').innerText = readTime;
        document.getElementById('modal-post-content').innerHTML = fullContent;

        modal.show();
    });
}

/* ==========================================================================
   6. Bookmark Buttons
   ========================================================================== */
function initBookmarkButtons() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.card-bookmark-btn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const icon = btn.querySelector('i');
        const isSaved = btn.classList.toggle('saved');

        if (isSaved) {
            icon.className = 'bi bi-bookmark-fill';
            showToast('Saved to Bookmarks', 'This article has been added to your reading list.', 'primary');
        } else {
            icon.className = 'bi bi-bookmark';
            showToast('Removed from Bookmarks', 'Article was removed from your reading list.', 'secondary');
        }
    });
}

/* ==========================================================================
   7. Create Post Modal & Dynamic Card Creation
   ========================================================================== */
function initCreatePostForm() {
    const form = document.getElementById('createPostForm');
    const modalEl = document.getElementById('createPostModal');
    const postsContainer = document.getElementById('posts-grid');
    if (!form || !modalEl || !postsContainer) return;

    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('postTitleInput').value.trim();
        const category = document.getElementById('postCategoryInput').value;
        const author = document.getElementById('postAuthorInput').value.trim() || 'Anonymous Developer';
        const image = document.getElementById('postImageInput').value.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
        const excerpt = document.getElementById('postExcerptInput').value.trim();
        const content = document.getElementById('postContentInput').value.trim();

        if (!title || !excerpt) return;

        // Create new post item column
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4 post-item animate-fade-in';
        col.setAttribute('data-category', category.toLowerCase());

        col.innerHTML = `
            <article class="card blog-card h-100 shadow-sm">
                <div class="card-img-wrapper">
                    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy">
                    <span class="card-category-badge">${escapeHtml(category)}</span>
                    <button class="card-bookmark-btn" title="Save article" aria-label="Bookmark">
                        <i class="bi bi-bookmark"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="d-flex align-items-center gap-2 text-muted small mb-2">
                        <span><i class="bi bi-calendar3 me-1"></i> Just now</span>
                        <span>•</span>
                        <span class="post-read-time"><i class="bi bi-clock me-1"></i> 4 min read</span>
                    </div>
                    <h3 class="card-title">
                        <a href="post.html" class="view-post-btn">${escapeHtml(title)}</a>
                    </h3>
                    <p class="card-text">${escapeHtml(excerpt)}</p>
                    <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                        <div class="d-flex align-items-center gap-2">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="${escapeHtml(author)}" class="author-avatar-sm">
                            <div>
                                <h6 class="mb-0 small fw-bold author-name">${escapeHtml(author)}</h6>
                                <span class="text-muted text-xs author-role" style="font-size: 0.75rem;">Community Author</span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary rounded-pill px-3 view-post-btn">Read More</button>
                    </div>
                </div>
                <div class="post-full-content d-none">
                    <p class="lead">${escapeHtml(excerpt)}</p>
                    <p>${escapeHtml(content || excerpt)}</p>
                </div>
            </article>
        `;

        // Prepend to posts container
        postsContainer.prepend(col);

        // Reset and hide modal
        form.reset();
        bootstrap.Modal.getInstance(modalEl).hide();

        // Switch to "all" filter
        const allBtn = document.querySelector('.filter-btn[data-category="all"]');
        if (allBtn) allBtn.click();

        showToast('Article Published!', 'Your new article has been published successfully to the blog.', 'success');
    });
}

/* ==========================================================================
   8. Newsletter Forms
   ========================================================================== */
function initNewsletterForms() {
    const forms = document.querySelectorAll('.newsletter-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input && input.value) {
                showToast('Subscribed!', `Welcome aboard! Updates will be sent to ${input.value}.`, 'success');
                input.value = '';
            }
        });
    });
}

/* ==========================================================================
   9. Contact Form
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const modalEl = document.getElementById('contactModal');
    if (!contactForm || !modalEl) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        contactForm.reset();
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        showToast('Message Sent!', 'Thank you for reaching out. We will respond within 24 hours.', 'success');
    });
}

/* ==========================================================================
   10. Back to Top Button
   ========================================================================== */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 350) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ==========================================================================
   Utility Helpers: Toast Notifications & HTML Escaping
   ========================================================================== */
function showToast(title, message, type = 'primary') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1090';
        document.body.appendChild(toastContainer);
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center shadow-lg border-0';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    const iconMap = {
        success: 'bi-check-circle-fill text-success',
        primary: 'bi-info-circle-fill text-primary',
        secondary: 'bi-bell-fill text-secondary',
        danger: 'bi-exclamation-triangle-fill text-danger'
    };
    const icon = iconMap[type] || 'bi-info-circle-fill text-primary';

    toastEl.innerHTML = `
        <div class="toast-header">
            <i class="bi ${icon} me-2 fs-5"></i>
            <strong class="me-auto">${escapeHtml(title)}</strong>
            <small class="text-muted">Just now</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${escapeHtml(message)}
        </div>
    `;

    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
