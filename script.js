document.addEventListener('DOMContentLoaded', () => {
    const blogs = [
        {
            id: 1,
            title: "Artificial Inteligence (AI)",
            date: "October 26, 2023",
            readTime: "10 min read",
            imageUrl: "https://okcredit-blog-images-prod.storage.googleapis.com/2020/12/blog4.jpg",
            contentFile: "blog-1.html",
            tags: ['AI']
        },
        {
            id: 2,
            title: "Python for Artificial Inteligence (AI)",
            date: "October 20, 2023",
            readTime: "7 min read",
            imageUrl: "https://via.placeholder.com/640x360/555555/EEEEEE?text=Responsive+Design",
            contentFile: "blog-2.html",
            tags: [ 'Python', 'AI']
        },
        {
            id: 3,
            title: "Understanding Asynchronous JavaScript",
            date: "October 15, 2023",
            readTime: "6 min read",
            imageUrl: "https://via.placeholder.com/640x360/666666/EEEEEE?text=Async+JS",
            contentFile: "blog-3.html",
            tags: ['JavaScript', 'Backend']
        }
    ];

    const blogsPerPage = 12;
    let currentPage = 1;
    let filteredBlogs = [];
    let currentBlogIndex = 0;

    const blogListSection = document.getElementById('blog-list-section');
    const blogDetailSection = document.getElementById('blog-detail-section');
    const blogListDiv = document.getElementById('blog-list');
    const blogDetailContentDiv = document.getElementById('blog-detail-content');
    const backToListBtn = document.getElementById('back-to-list');
    const prevBlogBtn = document.getElementById('prev-blog');
    const nextBlogBtn = document.getElementById('next-blog');
    const tagFilterSelect = document.getElementById('tag-filter');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageInfoSpan = document.getElementById('page-info');

    function getUniqueTags() {
        const tags = new Set();
        blogs.forEach(blog => {
            blog.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }

    function populateTagFilter() {
        const uniqueTags = getUniqueTags();
        tagFilterSelect.innerHTML = '<option value="all">All</option>';
        uniqueTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.toLowerCase();
            option.textContent = tag;
            tagFilterSelect.appendChild(option);
        });
    }

    function displayBlogList(filterTag = tagFilterSelect.value, page = 1) {
        filteredBlogs = blogs.filter(blog => {
            if (filterTag === 'all') return true;
            return blog.tags.some(tag => tag.toLowerCase() === filterTag);
        }).sort((a, b) => b.id - a.id);

        currentPage = page;

        const startIndex = (currentPage - 1) * blogsPerPage;
        const endIndex = startIndex + blogsPerPage;
        const blogsToDisplay = filteredBlogs.slice(startIndex, endIndex);

        blogListDiv.innerHTML = '';
        if (blogsToDisplay.length === 0) {
            blogListDiv.innerHTML = '<p style="text-align: center; color: #b0b0b0; margin-top: 30px;">Blogs on way ✈️</p>';
            prevPageBtn.style.display = 'none';
            nextPageBtn.style.display = 'none';
            pageInfoSpan.style.display = 'none';
            return;
        }

        prevPageBtn.style.display = '';
        nextPageBtn.style.display = '';
        pageInfoSpan.style.display = '';

        blogsToDisplay.forEach(blog => {
            const blogItem = document.createElement('div');
            blogItem.classList.add('blog-item');
            blogItem.setAttribute('data-id', blog.id);

            const tagsHtml = blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            blogItem.innerHTML = `
                <div class="blog-item-image-container">
                    <img src="${blog.imageUrl}" alt="${blog.title}">
                </div>
                <div class="blog-item-content">
                    <h3>${blog.title}</h3>
                    <div class="meta-info">
                        <p><span>${blog.date}</span></p>
                        <p><span>${blog.readTime}</span></p>
                        <div class="tags">${tagsHtml}</div>
                    </div>
                </div>
            `;
            blogItem.addEventListener('click', () => showBlogDetail(blog.id));
            blogListDiv.appendChild(blogItem);
        });

        updatePaginationControls();

        blogListSection.classList.add('active');
        blogListSection.classList.remove('hidden');
        blogDetailSection.classList.add('hidden');
        blogDetailSection.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Clear blog slug from URL when returning to list
        const url = new URL(window.location);
        url.hash = '';
        history.pushState({}, '', url);
    }

    async function showBlogDetail(blogId) {
        const blog = filteredBlogs.find(b => b.id === blogId);
        if (!blog) return;

        currentBlogIndex = filteredBlogs.findIndex(b => b.id === blogId);

        try {
            const response = await fetch(`blogs/${blog.contentFile}`);
            if (!response.ok) throw new Error('Content not found');

            const contentHtml = await response.text();

            blogDetailContentDiv.innerHTML = `
                <img src="${blog.imageUrl}" alt="${blog.title}">
                <h2>${blog.title}</h2>
                <span class="blog-date">${blog.date} • ${blog.readTime}</span>
                ${contentHtml}
            `;

            updateArticleNavigationButtons();

            blogListSection.classList.add('hidden');
            blogListSection.classList.remove('active');
            blogDetailSection.classList.add('active');
            blogDetailSection.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            const blogSlug = blog.contentFile.replace('.html', '');
            const newUrl = window.location.pathname + '#/' + blogSlug;
            history.pushState({ blogId: blogId }, '', newUrl);

        } catch (error) {
            blogDetailContentDiv.innerHTML = `<p>Error loading blog content.</p>`;
            console.error(error);
        }
    }

    function updateArticleNavigationButtons() {
        prevBlogBtn.disabled = currentBlogIndex <= 0;
        nextBlogBtn.disabled = currentBlogIndex >= filteredBlogs.length - 1;
    }

    function updatePaginationControls() {
        const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;

        pageInfoSpan.textContent = totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : '';
    }

    backToListBtn.addEventListener('click', () => {
        displayBlogList(tagFilterSelect.value, currentPage);

        const url = new URL(window.location);
        url.hash = '';
        history.pushState({}, '', url);
    });

    prevBlogBtn.addEventListener('click', () => {
        if (currentBlogIndex > 0) {
            showBlogDetail(filteredBlogs[currentBlogIndex - 1].id);
        }
    });

    nextBlogBtn.addEventListener('click', () => {
        if (currentBlogIndex < filteredBlogs.length - 1) {
            showBlogDetail(filteredBlogs[currentBlogIndex + 1].id);
        }
    });

    tagFilterSelect.addEventListener('change', () => {
        displayBlogList(tagFilterSelect.value, 1);
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            displayBlogList(tagFilterSelect.value, currentPage - 1);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
        if (currentPage < totalPages) {
            displayBlogList(tagFilterSelect.value, currentPage + 1);
        }
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const hash = window.location.hash;
        const blogSlug = hash.startsWith('#/') ? hash.slice(2) : null;
        const blogFromUrl = blogSlug ? blogs.find(b => b.contentFile === `${blogSlug}.html`) : null;

        if (blogFromUrl) {
            filteredBlogs = blogs.slice().sort((a, b) => b.id - a.id);
            showBlogDetail(blogFromUrl.id);
        } else {
            displayBlogList(tagFilterSelect.value, currentPage);
        }
    });

    // Initial load: check hash URL for blog slug
    const hash = window.location.hash;
    let blogSlug = hash.startsWith('#/') ? hash.slice(2) : null;

    let blogFileFromUrl = null;
    if (blogSlug && blogSlug.startsWith('blog-')) {
        blogFileFromUrl = `${blogSlug}.html`;
    }

    populateTagFilter();
filteredBlogs = blogs.slice().sort((a, b) => b.id - a.id); // Ensure it's always sorted

if (blogFileFromUrl) {
    const blogFromUrl = filteredBlogs.find(b => b.contentFile === blogFileFromUrl);
    if (blogFromUrl) {
        currentPage = 1;
        showBlogDetail(blogFromUrl.id);
    } else {
        displayBlogList('all', 1);
    }
} else {
    displayBlogList('all', 1);
}

});
