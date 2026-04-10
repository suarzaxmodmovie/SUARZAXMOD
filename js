// Books Functionality for Advanced Mode
const BOOKS_API = window.location.origin;

let currentBooksMode = 'online'; // 'online', 'offline', or 'library'
let booksInitialized = false;

// Show Books Page
function showBooksPage() {
    hideAllSections();
    
    let booksSection = document.getElementById('booksSection');
    if (!booksSection) {
        createBooksSection();
        booksInitialized = true;
    } else {
        booksSection.style.setProperty('display', 'block', 'important');
    }
}

// Create Books Section
function createBooksSection() {
    const mainContent = document.getElementById('mainContent');
    const section = document.createElement('div');
    section.id = 'booksSection';
    section.className = 'books-section';
    section.innerHTML = `
        <div class="books-header">
            <div class="books-mode-selector">
                <button class="mode-btn active" id="booksOnlineBtn" data-mode="online">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    Online
                </button>
                <button class="mode-btn" id="booksOfflineBtn" data-mode="offline">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/></svg>
                    Offline
                </button>
                <button class="mode-btn" id="booksLibraryBtn" data-mode="library">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
                    Library
                </button>
            </div>
            <div class="search-container-books" id="booksSearchContainer">
                <input type="text" id="booksSearch" placeholder="Search books...">
                <button id="booksSearchBtn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </button>
            </div>
        </div>
        <div class="books-grid" id="booksGrid"></div>
        <div class="books-empty" id="booksEmpty">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
            <p>Search for books to get started</p>
        </div>
        <div class="books-loader" id="booksLoader" style="display: none;">
            <div class="spinner"></div>
        </div>
    `;
    mainContent.appendChild(section);

    // Event listeners
    document.getElementById('booksOnlineBtn').addEventListener('click', () => switchBooksMode('online'));
    document.getElementById('booksOfflineBtn').addEventListener('click', () => switchBooksMode('offline'));
    document.getElementById('booksLibraryBtn').addEventListener('click', () => switchBooksMode('library'));
    document.getElementById('booksSearchBtn').addEventListener('click', handleBooksSearch);
    document.getElementById('booksSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleBooksSearch();
    });
}

// Switch Books Mode
function switchBooksMode(mode) {
    currentBooksMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Show/hide search based on mode
    const searchContainer = document.getElementById('booksSearchContainer');
    if (mode === 'library') {
        searchContainer.style.display = 'none';
        loadLibraryBooks();
    } else {
        searchContainer.style.display = '';
        // Clear results
        document.getElementById('booksGrid').innerHTML = '';
        document.getElementById('booksEmpty').style.display = 'flex';
    }
}

// Search Online Books (Z-Library)
async function searchOnlineBooks(query) {
    try {
        const res = await fetch(`${BOOKS_API}/api/zlib/search/${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.books) {
            return data.books.filter(book => book.extension === 'epub');
        }
        return [];
    } catch (e) {
        console.error('[Books] Online search failed:', e);
        return [];
    }
}

// Search Offline Books (LibGen)
async function searchOfflineBooks(query) {
    try {
        const res = await fetch(`http://localhost:6987/libgen/search/${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
            // Transform libgen results to match expected format (without fetching download links yet)
            const transformedBooks = data.results.map((book) => {
                return {
                    title: book.title,
                    author: book.author,
                    fileExtension: book.format,
                    fileSize: parseFileSize(book.size),
                    language: book.language,
                    year: book.year,
                    editionId: book.editionId, // Store editionId for later download link fetching
                    publisher: book.publisher,
                    pages: book.pages
                };
            });
            return transformedBooks.filter(book => book.fileExtension === 'epub');
        }
        return [];
    } catch (e) {
        console.error('[Books] Offline search failed:', e);
        return [];
    }
}

// Get download link for a book (called when download button is clicked)
async function getBookDownloadLink(editionId) {
    try {
        const editionRes = await fetch(`http://localhost:6987/libgen/edition/${editionId}`);
        const editionData = await editionRes.json();
        if (editionData.md5) {
            const downloadRes = await fetch(`http://localhost:6987/libgen/download/${editionData.md5}`);
            const downloadData = await downloadRes.json();
            return downloadData.downloadUrl || '';
        }
        return '';
    } catch (err) {
        console.error('[Books] Failed to get download link:', err);
        return '';
    }
}

// Helper function to parse file size string to bytes
function parseFileSize(sizeStr) {
    if (!sizeStr) return 0;
    const match = sizeStr.match(/([\d.]+)\s*([A-Z]+)/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    const units = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024
    };
    
    return Math.round(value * (units[unit] || 1));
}

// Get library books
async function getLibraryBooks() {
    try {
        const res = await fetch(`${BOOKS_API}/api/books/library`);
        const data = await res.json();
        if (data.success && data.books) {
            return data.books;
        }
        return [];
    } catch (e) {
        console.error('[Books] Failed to get library books:', e);
        return [];
    }
}

// Load library books
async function loadLibraryBooks() {
    const grid = document.getElementById('booksGrid');
    const loader = document.getElementById('booksLoader');
    const empty = document.getElementById('booksEmpty');
    
    grid.innerHTML = '';
    empty.style.display = 'none';
    loader.style.display = 'flex';
    
    const books = await getLibraryBooks();
    
    loader.style.display = 'none';
    
    if (books.length === 0) {
        empty.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
            <p>Your library is empty</p>
            <p style="font-size: 0.9rem; color: rgba(255,255,255,0.4); margin-top: 10px;">Download books using the Offline tab to add them to your library</p>
        `;
        empty.style.display = 'flex';
        return;
    }
    
    renderBooks(books);
}

// Get read link for online book
async function getReadLink(bookPath) {
    try {
        const res = await fetch(`${BOOKS_API}/api/zlib/read-link?path=${encodeURIComponent(bookPath)}`);
        const data = await res.json();
        if (data.success && data.readLink) {
            return data.readLink;
        }
        return null;
    } catch (e) {
        console.error('[Books] Failed to get read link:', e);
        return null;
    }
}

// Format file size
function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// Get epub download path - expand environment variables
async function getEpubDownloadPath() {
    // Try to get the actual path from Electron
    if (window.electronAPI?.getEpubFolder) {
        try {
            const result = await window.electronAPI.getEpubFolder();
            if (result && result.success && result.path) {
                return result.path;
            }
        } catch (error) {
            console.warn('Failed to get epub folder from Electron:', error);
        }
    }
    
    // Fallback to generic paths
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (platform.includes('win') || userAgent.includes('windows')) {
        return '%APPDATA%\\PlayTorrio\\epub';
    } else if (platform.includes('mac') || userAgent.includes('mac')) {
        return '~/Library/Application Support/PlayTorrio/epub';
    } else {
        return '~/.config/PlayTorrio/epub';
    }
}

// Show download modal
async function showDownloadModal(book) {
    const downloadPath = await getEpubDownloadPath();
    
    const modal = document.createElement('div');
    modal.className = 'book-download-modal';
    modal.innerHTML = `
        <div class="book-download-content">
            <h3>Download Book</h3>
            <p>Please download the file to this location:</p>
            <div class="download-path">
                <code>${downloadPath}</code>
            </div>
            <p class="download-note">This ensures the app can find and read your downloaded books.</p>
            <div class="download-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="download-now-btn">Download</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    modal.querySelector('.download-now-btn').addEventListener('click', () => {
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(book.downloadlink);
        } else {
            window.open(book.downloadlink, '_blank');
        }
        modal.remove();
    });
}

// Render Books
function renderBooks(books) {
    const grid = document.getElementById('booksGrid');
    const empty = document.getElementById('booksEmpty');
    
    grid.innerHTML = '';
    empty.style.display = 'none';
    
    if (books.length === 0) {
        empty.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
            <p>No books found</p>
        `;
        empty.style.display = 'flex';
        return;
    }
    
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        if (currentBooksMode === 'online') {
            card.innerHTML = `
                <div class="book-cover">
                    <img src="${book.cover || ''}" alt="${book.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 150%22><rect fill=%22%231f2937%22 width=%22100%22 height=%22150%22/><text x=%2250%22 y=%2275%22 text-anchor=%22middle%22 fill=%22%236b7280%22 font-size=%2212%22>No Cover</text></svg>'">
                    <div class="book-badge online">EPUB</div>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author || 'Unknown Author'}</p>
                    <button class="book-btn read-btn">Read Now</button>
                </div>
            `;
            
            card.querySelector('.read-btn').addEventListener('click', async () => {
                const btn = card.querySelector('.read-btn');
                btn.disabled = true;
                btn.innerHTML = '<div class="spinner-small"></div> Loading...';
                
                const readLink = await getReadLink(book.url);
                if (readLink) {
                    if (window.electronAPI?.openExternal) {
                        window.electronAPI.openExternal(readLink);
                    } else {
                        window.open(readLink, '_blank');
                    }
                } else {
                    alert('Failed to get read link');
                }
                
                btn.disabled = false;
                btn.innerHTML = 'Read Now';
            });
        } else if (currentBooksMode === 'offline') {
            const authors = Array.isArray(book.author) ? book.author.join(', ') : (book.author || 'Unknown Author');
            
            card.innerHTML = `
                <div class="book-cover no-image">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                    <div class="book-badge offline">EPUB</div>
                    <div class="book-size">${formatFileSize(book.fileSize)}</div>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${authors}</p>
                    <p class="book-meta">${book.language || 'Unknown'} ${book.year ? '• ' + book.year : ''}</p>
                    <button class="book-btn download-btn">Download</button>
                </div>
            `;
            
            card.querySelector('.download-btn').addEventListener('click', async () => {
                const btn = card.querySelector('.download-btn');
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<div class="spinner-small"></div> Getting link...';
                
                // Fetch download link when button is clicked
                const downloadlink = await getBookDownloadLink(book.editionId);
                
                btn.disabled = false;
                btn.innerHTML = originalText;
                
                if (downloadlink) {
                    showDownloadModal({ ...book, downloadlink });
                } else {
                    alert('Failed to get download link. Please try again.');
                }
            });
        } else {
            // Library mode
            card.innerHTML = `
                <div class="book-cover no-image">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                    <div class="book-badge library">EPUB</div>
                    <div class="book-size">${formatFileSize(book.size)}</div>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <button class="book-btn library-btn">Read Now</button>
                </div>
            `;
            
            card.querySelector('.library-btn').addEventListener('click', () => {
                // Use the global openEpubReader function from epubReader.js
                if (window.openEpubReader) {
                    window.openEpubReader(book.path, book.title);
                } else {
                    alert('EPUB reader not available');
                }
            });
        }
        
        grid.appendChild(card);
    });
}

// Handle Search
async function handleBooksSearch() {
    // Library mode doesn't use search
    if (currentBooksMode === 'library') return;
    
    const query = document.getElementById('booksSearch').value.trim();
    if (!query) return;
    
    const grid = document.getElementById('booksGrid');
    const loader = document.getElementById('booksLoader');
    const empty = document.getElementById('booksEmpty');
    
    grid.innerHTML = '';
    empty.style.display = 'none';
    loader.style.display = 'flex';
    
    let books = [];
    if (currentBooksMode === 'online') {
        books = await searchOnlineBooks(query);
    } else {
        books = await searchOfflineBooks(query);
    }
    
    loader.style.display = 'none';
    renderBooks(books);
}

// Comics Functionality
let currentComicsPage = 1;
let isLoadingComics = false;
let hasMoreComics = true;
let currentComicId = null;
let currentReaderChapter = null;
let currentReaderPages = [];
let currentReaderPageIndex = 0;
let isReaderFullscreen = false;
let zoomLevel = 1;
let isDragging = false;
let startY;
let scrollTop;

const PROXY_URL = 'http://localhost:6987/comics-proxy?url=';
const COMICS_API_BASE = 'http://localhost:6987/comics';

// Show Comics Page
function showComicsPage() {
    hideAllSections();
    
    // Check if comics section exists, if not create it
    let comicsSection = document.getElementById('comicsSection');
    if (!comicsSection) {
        createComicsSection();
        initialComicsLoad();
    } else {
        comicsSection.style.setProperty('display', 'block', 'important');
    }
}

// Initial Multi-page Load
async function initialComicsLoad() {
    await loadComics(); // Page 1
    if (hasMoreComics) await loadComics(); // Page 2
    if (hasMoreComics) await loadComics(); // Page 3
}

// Create Comics Section Structure
function createComicsSection() {
    const mainContent = document.getElementById('mainContent');
    const section = document.createElement('div');
    section.id = 'comicsSection';
    section.className = 'comics-section';
    section.innerHTML = `
        <div class="comics-header">
            <div class="search-container-comics">
                <input type="text" id="comicsSearch" placeholder="Search comics...">
                <button id="comicsSearchBtn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </button>
            </div>
            <button class="saved-comics-btn" id="comicsSavedBtn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                Saved
            </button>
        </div>
        <div class="comics-grid" id="comicsGrid"></div>
        <div id="comicsSentinel" style="height: 20px; width: 100%;"></div>
        <div class="comics-loader" id="comicsLoader">
            <div class="spinner"></div>
        </div>
    `;
    mainContent.appendChild(section);

    // Setup Observer
    setupComicsInfiniteScroll();

    // Event Listeners for Search and Saved
    const searchInput = document.getElementById('comicsSearch');
    const searchBtn = document.getElementById('comicsSearchBtn');

    searchBtn.addEventListener('click', () => {
        performComicsSearch(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performComicsSearch(searchInput.value);
        }
    });
    
    // Saved button
    const savedBtn = document.getElementById('comicsSavedBtn');
    if (savedBtn) {
        savedBtn.addEventListener('click', showSavedComics);
    }
}

// Show Saved Comics
function showSavedComics() {
    hasMoreComics = false; // Disable infinite scroll
    document.getElementById('comicsGrid').innerHTML = '';
    
    const saved = getSavedComics();
    if (saved.length === 0) {
        document.getElementById('comicsGrid').innerHTML = '<p class="no-results">No saved comics yet.</p>';
    } else {
        renderComics(saved);
    }
}

// Perform Search
async function performComicsSearch(query) {
    if (!query.trim()) {
        // Reset to default list if search is empty
        currentComicsPage = 1;
        hasMoreComics = true;
        document.getElementById('comicsGrid').innerHTML = '';
        loadComics();
        return;
    }

    isLoadingComics = true;
    hasMoreComics = false; // Disable infinite scroll for search results
    document.getElementById('comicsGrid').innerHTML = '';
    document.getElementById('comicsLoader').style.display = 'flex';

    try {
        const response = await fetch(`${COMICS_API_BASE}/search/${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            if (data.results.length === 0) {
                document.getElementById('comicsGrid').innerHTML = '<p class="no-results">No comics found matching your search.</p>';
            } else {
                renderComics(data.results);
            }
        }
    } catch (error) {
        console.error('Error searching comics:', error);
        document.getElementById('comicsGrid').innerHTML = '<p class="no-results">Error performing search.</p>';
    } finally {
        isLoadingComics = false;
        document.getElementById('comicsLoader').style.display = 'none';
    }
}

// Setup Intersection Observer for infinite scroll
function setupComicsInfiniteScroll() {
    const sentinel = document.getElementById('comicsSentinel');
    if (!sentinel) return;
    
    const observer = new IntersectionObserver((entries) => {
        const comicsSection = document.getElementById('comicsSection');
        if (entries[0].isIntersecting && 
            !isLoadingComics && 
            hasMoreComics && 
            comicsSection && 
            window.getComputedStyle(comicsSection).display !== 'none') {
            loadComics();
        }
    }, {
        root: null,
        rootMargin: '500px', // Start loading earlier
        threshold: 0.1
    });
    
    observer.observe(sentinel);
}

// Load Comics
async function loadComics() {
    if (isLoadingComics || !hasMoreComics) return;
    
    isLoadingComics = true;
    document.getElementById('comicsLoader').style.display = 'flex';

    try {
        const response = await fetch(`${COMICS_API_BASE}/all?page=${currentComicsPage}`);
        const data = await response.json();

        if (data.success) {
            if (data.results.length === 0) {
                hasMoreComics = false;
            } else {
                renderComics(data.results);
                currentComicsPage++;
            }
        }
    } catch (error) {
        console.error('Error loading comics:', error);
    } finally {
        isLoadingComics = false;
        document.getElementById('comicsLoader').style.display = 'none';
    }
}

// Render Comics Grid
function renderComics(comics) {
    const grid = document.getElementById('comicsGrid');
    comics.forEach(comic => {
        const card = document.createElement('div');
        card.className = 'comic-card';
        // Extract slug from URL for API calls
        // e.g., https://readcomicsonline.ru/comic/war-wolf-2025 -> war-wolf-2025
        const slug = comic.url.split('/').pop();
        
        // Proxy the poster URL
        const posterUrl = `${PROXY_URL}${encodeURIComponent(comic.poster_url)}`;

        card.innerHTML = `
            <div class="comic-poster">
                <img src="${posterUrl}" alt="${comic.name}" loading="lazy">
                <div class="comic-overlay"></div>
            </div>
            <div class="comic-info">
                <h3 class="comic-title">${comic.name}</h3>
            </div>
        `;
        
        card.addEventListener('click', () => openComicModal(slug, comic));
        grid.appendChild(card);
    });
}

// Open Comic Modal (Chapters)
async function openComicModal(slug, comicData) {
    let modal = document.getElementById('comicModal');
    if (!modal) {
        createComicModal();
        modal = document.getElementById('comicModal');
    }
    
    // Set Modal Content
    const posterUrl = `${PROXY_URL}${encodeURIComponent(comicData.poster_url)}`;
    document.getElementById('modalComicPoster').src = posterUrl;
    document.getElementById('modalComicTitle').textContent = comicData.name;
    document.getElementById('modalChaptersList').innerHTML = '<div class="spinner"></div>';
    
    // Reset buttons
    const readFirstBtn = document.getElementById('readFirstBtn');
    const saveComicBtn = document.getElementById('saveComicBtn');
    
    // Remove old listeners
    const newReadFirstBtn = readFirstBtn.cloneNode(true);
    const newSaveComicBtn = saveComicBtn.cloneNode(true);
    readFirstBtn.parentNode.replaceChild(newReadFirstBtn, readFirstBtn);
    saveComicBtn.parentNode.replaceChild(newSaveComicBtn, saveComicBtn);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Fetch Chapters
    try {
        const response = await fetch(`${COMICS_API_BASE}/chapters/${slug}`);
        const data = await response.json();
        
        if (data.success) {
            renderChapters(data.chapters, slug);
            
            // "Read First" usually means Chapter 1
            newReadFirstBtn.addEventListener('click', () => {
                const firstChapter = data.chapters.find(c => c.chapter === "1") || data.chapters[data.chapters.length - 1];
                if (firstChapter) {
                    openReader(slug, firstChapter.chapter);
                }
            });

            newSaveComicBtn.addEventListener('click', () => {
                const isSaved = toggleSaveComic(slug, comicData);
                newSaveComicBtn.textContent = isSaved ? 'Saved ✓' : 'Save';
            });
            
            // Update button text based on current state
            newSaveComicBtn.textContent = isComicSaved(slug) ? 'Saved ✓' : 'Save';
        }
    } catch (error) {
        console.error('Error loading chapters:', error);
        document.getElementById('modalChaptersList').innerHTML = '<p>Error loading chapters.</p>';
    }
}

// Saved Comics Functions - Shared with basicmode
function getSavedComics() {
    try {
        return JSON.parse(localStorage.getItem('saved_comics') || '[]');
    } catch (e) {
        return [];
    }
}

function setSavedComics(list) {
    localStorage.setItem('saved_comics', JSON.stringify(list));
}

function isComicSaved(slug) {
    return getSavedComics().some(c => c.slug === slug);
}

function toggleSaveComic(slug, data) {
    const list = getSavedComics();
    const idx = list.findIndex(c => c.slug === slug);
    
    if (idx >= 0) {
        list.splice(idx, 1);
        setSavedComics(list);
        return false; // Removed
    } else {
        const comicToSave = { ...data, slug };
        list.unshift(comicToSave);
        setSavedComics(list);
        return true; // Added
    }
}

// Create Comic Modal Structure
function createComicModal() {
    const modal = document.createElement('div');
    modal.id = 'comicModal';
    modal.className = 'comic-modal';
    modal.innerHTML = `
        <div class="comic-modal-content">
            <button class="comic-modal-close" id="closeComicModal">×</button>
            <div class="comic-modal-header">
                <img id="modalComicPoster" class="modal-poster" src="" alt="">
                <div class="modal-info">
                    <h2 id="modalComicTitle"></h2>
                    <div class="modal-actions">
                        <button class="action-btn primary" id="readFirstBtn">Read First</button>
                        <button class="action-btn secondary" id="saveComicBtn">Save</button>
                    </div>
                </div>
            </div>
            <div class="chapters-container">
                <h3>Chapters</h3>
                <div class="chapters-list" id="modalChaptersList"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeComicModal').addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Render Chapters List
function renderChapters(chapters, comicSlug) {
    const list = document.getElementById('modalChaptersList');
    list.innerHTML = '';
    
    chapters.forEach(chapter => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        item.innerHTML = `
            <span class="chapter-name">${chapter.name}</span>
            <span class="chapter-number">#${chapter.chapter}</span>
        `;
        // The chapter ID seems to be the chapter number in the API URL construction
        // e.g. /comics/pages/cruel-universe-2025/7
        item.addEventListener('click', () => openReader(comicSlug, chapter.chapter));
        list.appendChild(item);
    });
}

// Open Reader
async function openReader(comicSlug, chapter) {
    let reader = document.getElementById('comicReader');
    if (!reader) {
        createReader();
        reader = document.getElementById('comicReader');
    }

    // Reset Reader State
    const pagesContainer = document.getElementById('readerPages');
    pagesContainer.innerHTML = '<div class="spinner-large" style="margin: auto;"></div>';
    reader.classList.add('active');
    document.getElementById('comicModal').classList.remove('active'); // Close modal
    
    currentReaderPages = [];
    zoomLevel = 1;
    updateZoom();

    try {
        const response = await fetch(`${COMICS_API_BASE}/pages/${comicSlug}/${chapter}`);
        const data = await response.json();
        
        if (data.success) {
            renderReaderPages(data.pages);
        }
    } catch (error) {
        console.error('Error loading pages:', error);
    }
}

// Create Reader Structure
function createReader() {
    const reader = document.createElement('div');
    reader.id = 'comicReader';
    reader.className = 'comic-reader';
    reader.innerHTML = `
        <div class="reader-toolbar">
            <button class="reader-btn" id="readerClose">Close</button>
            <div class="reader-controls">
                <button class="reader-btn" id="zoomOut">-</button>
                <span id="zoomDisplay">100%</span>
                <button class="reader-btn" id="zoomIn">+</button>
                <button class="reader-btn" id="readerFullscreen">⛶</button>
            </div>
        </div>
        <div class="reader-content" id="readerContent">
            <div class="reader-pages" id="readerPages"></div>
        </div>
    `;
    document.body.appendChild(reader);

    // Controls
    document.getElementById('readerClose').addEventListener('click', closeReader);
    document.getElementById('zoomIn').addEventListener('click', () => { zoomLevel += 0.1; updateZoom(); });
    document.getElementById('zoomOut').addEventListener('click', () => { if(zoomLevel > 0.5) zoomLevel -= 0.1; updateZoom(); });
    document.getElementById('readerFullscreen').addEventListener('click', toggleFullscreen);

    // Drag Scrolling
    const content = document.getElementById('readerContent');
    
    content.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'IMG') e.preventDefault(); // Prevent default image drag
        isDragging = true;
        startY = e.pageY - content.offsetTop;
        scrollTop = content.scrollTop;
        content.style.cursor = 'grabbing';
        content.style.userSelect = 'none'; // Prevent text selection
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            content.style.cursor = 'grab';
            content.style.userSelect = 'auto';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // Only scroll if the reader is active
        const reader = document.getElementById('comicReader');
        if (!reader || !reader.classList.contains('active')) return;

        e.preventDefault();
        const y = e.pageY - content.offsetTop;
        const walk = (y - startY) * 1.5;
        const newScrollTop = scrollTop - walk;
        
        // Prevent scrolling past the bottom
        const maxScroll = content.scrollHeight - content.clientHeight;
        content.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
    });

    // Prevent wheel scroll past bottom
    content.addEventListener('wheel', (e) => {
        const maxScroll = content.scrollHeight - content.clientHeight;
        const currentScroll = content.scrollTop;
        
        // If trying to scroll down past the bottom, prevent it
        if (e.deltaY > 0 && currentScroll >= maxScroll) {
            e.preventDefault();
        }
        // If trying to scroll up past the top, prevent it
        if (e.deltaY < 0 && currentScroll <= 0) {
            e.preventDefault();
        }
    }, { passive: false });

    // Keyboard Nav
    document.addEventListener('keydown', (e) => {
        if (!reader.classList.contains('active')) return;
        
        const maxScroll = content.scrollHeight - content.clientHeight;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newScroll = Math.min(content.scrollTop + 50, maxScroll);
            content.scrollTop = newScroll;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newScroll = Math.max(content.scrollTop - 50, 0);
            content.scrollTop = newScroll;
        }
        if (e.key === 'Escape') closeReader();
    });
}

function renderReaderPages(pages) {
    const container = document.getElementById('readerPages');
    container.innerHTML = '';
    
    pages.forEach(page => {
        const img = document.createElement('img');
        const pageUrl = `${PROXY_URL}${encodeURIComponent(page.url)}`;
        img.src = pageUrl;
        img.className = 'reader-page';
        img.loading = 'lazy';
        container.appendChild(img);
    });
}

function updateZoom() {
    const pages = document.getElementById('readerPages');
    if(pages) {
        pages.style.transform = `scale(${zoomLevel})`;
        document.getElementById('zoomDisplay').textContent = `${Math.round(zoomLevel * 100)}%`;
    }
}

function toggleFullscreen() {
    const elem = document.getElementById('comicReader');
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function closeReader() {
    document.getElementById('comicReader').classList.remove('active');
    document.body.style.overflow = 'auto';
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

// Continue Watching functionality for home page
// Uses API_KEY, BASE_URL, and IMG_BASE_URL from app.js

// Get continue watching list (fallback if streaming.js not loaded yet)
function getContinueWatchingListLocal() {
    if (window.getContinueWatchingList) {
        return window.getContinueWatchingList();
    }
    
    // Fallback implementation
    try {
        const saved = localStorage.getItem('continueWatching');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('[ContinueWatching] Failed to retrieve list:', e);
        return [];
    }
}

// Remove item from continue watching (fallback if streaming.js not loaded yet)
function removeFromContinueWatchingLocal(itemKey) {
    if (window.removeFromContinueWatching) {
        return window.removeFromContinueWatching(itemKey);
    }
    
    // Fallback implementation
    try {
        const continueWatching = getContinueWatchingListLocal();
        const filtered = continueWatching.filter(item => item.key !== itemKey);
        localStorage.setItem('continueWatching', JSON.stringify(filtered));
        
        // Also remove the playback position
        const item = continueWatching.find(i => i.key === itemKey);
        if (item) {
            const posKey = item.type === 'movie' 
                ? `playback_${item.type}_${item.tmdbId}`
                : `playback_${item.type}_${item.tmdbId}_${item.season}_${item.episode}`;
            localStorage.removeItem(posKey);
        }
        
        console.log('[ContinueWatching] Removed item:', itemKey);
        return true;
    } catch (e) {
        console.error('[ContinueWatching] Failed to remove item:', e);
        return false;
    }
}

// Initialize Continue Watching section
function initContinueWatching() {
    const continueWatching = getContinueWatchingListLocal();
    
    if (continueWatching.length === 0) {
        // Hide section if empty
        const section = document.getElementById('continue-watching-section');
        if (section) section.style.display = 'none';
        return;
    }
    
    renderContinueWatching(continueWatching);
}

// Render Continue Watching slider
async function renderContinueWatching(items) {
    const container = document.getElementById('continue-watching-grid');
    if (!container) {
        console.warn('[ContinueWatching] Container not found');
        return;
    }
    
    const section = document.getElementById('continue-watching-section');
    if (section) section.style.display = 'block';
    
    container.innerHTML = '';
    
    // Limit to first 10 items to avoid too many API calls
    const limitedItems = items.slice(0, 10);
    
    for (const item of limitedItems) {
        try {
            // Fetch additional metadata from TMDB
            const detailsUrl = `${BASE_URL}/${item.type}/${item.tmdbId}?api_key=${API_KEY}`;
            const response = await fetch(detailsUrl);
            
            if (!response.ok) {
                console.warn('[ContinueWatching] Failed to fetch metadata for', item.tmdbId);
                continue;
            }
            
            const data = await response.json();
            
            const card = createContinueWatchingCard(item, data);
            container.appendChild(card);
        } catch (error) {
            console.error('[ContinueWatching] Error fetching metadata:', error);
            // Continue with next item instead of breaking
        }
    }
    
    // If no cards were added, hide the section
    if (container.children.length === 0) {
        if (section) section.style.display = 'none';
    }
}

// Create Continue Watching card
function createContinueWatchingCard(item, metadata) {
    const card = document.createElement('div');
    card.className = 'continue-watching-card';
    
    const posterPath = metadata.poster_path 
        ? `${IMG_BASE_URL}/w500${metadata.poster_path}`
        : item.posterUrl || 'https://via.placeholder.com/500x750?text=No+Image';
    
    const title = metadata.title || metadata.name || item.title;
    
    // Calculate progress percentage (assume 2 hour max for movies, 1 hour for TV)
    const estimatedDuration = item.type === 'movie' ? 7200 : 3600;
    const progress = Math.min((item.time / estimatedDuration) * 100, 100);
    
    // Format time
    const minutes = Math.floor(item.time / 60);
    const seconds = Math.floor(item.time % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Episode info for TV shows
    let episodeInfo = '';
    if (item.type === 'tv' && item.season && item.episode) {
        episodeInfo = `<div class="continue-episode-info">S${item.season} E${item.episode}</div>`;
    }
    
    card.innerHTML = `
        <div class="continue-card-poster">
            <img src="${posterPath}" alt="${title}" loading="lazy">
            <button class="continue-remove-btn" onclick="removeContinueWatchingItem('${item.key}', event)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
            <div class="continue-play-overlay">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
        </div>
        <div class="continue-card-info">
            <h3 class="continue-card-title">${title}</h3>
            ${episodeInfo}
            <div class="continue-progress-bar">
                <div class="continue-progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="continue-time">${timeStr}</div>
        </div>
    `;
    
    // Click handler to resume playback
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.continue-remove-btn')) {
            resumePlayback(item);
        }
    });
    
    return card;
}

// Resume playback from Continue Watching
async function resumePlayback(item) {
    console.log('[ContinueWatching] Resuming playback:', item);
    
    // Navigate to details page with auto-play flag
    sessionStorage.setItem('autoPlayStream', 'true');
    sessionStorage.setItem('skipIntro', 'true');
    
    if (item.type === 'movie') {
        window.location.href = `details.html?id=${item.tmdbId}&type=movie`;
    } else {
        window.location.href = `details.html?id=${item.tmdbId}&type=tv&season=${item.season}&episode=${item.episode}`;
    }
}

// Remove item from Continue Watching
function removeContinueWatchingItem(itemKey, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const success = removeFromContinueWatchingLocal(itemKey);
    if (success) {
        // Refresh the Continue Watching section
        initContinueWatching();
    }
}

// Make function globally accessible
window.removeContinueWatchingItem = removeContinueWatchingItem;

// Initialize on page load - wrap in try/catch to prevent breaking other scripts
document.addEventListener('DOMContentLoaded', () => {
    try {
        initContinueWatching();
    } catch (error) {
        console.error('[ContinueWatching] Error initializing:', error);
        // Hide section on error
        const section = document.getElementById('continue-watching-section');
        if (section) section.style.display = 'none';
    }
});

const API_BASE = '/api';

export const getDebridSettings = async () => {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error("Failed to fetch settings", e);
    }
    return {};
};

export const saveDebridSettings = async (settings) => {
    try {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        return response.ok;
    } catch (e) {
        console.error("Failed to save settings", e);
        return false;
    }
};

export const initDebridUI = async () => {
    const useDebridToggle = document.getElementById('use-debrid-toggle');
    const debridConfigContainer = document.getElementById('debrid-config-container');
    const providerSelect = document.getElementById('debrid-provider-select');
    const rdAuthSection = document.getElementById('rd-auth-section');
    const apiKeySection = document.getElementById('api-key-section');
    const rdLoginBtn = document.getElementById('rd-login-btn');
    const rdStatus = document.getElementById('rd-status');
    const debridApiInput = document.getElementById('debrid-api-input');

    if (!useDebridToggle) return;

    // Load initial state
    const settings = await getDebridSettings();
    const useDebrid = !!settings.useDebrid;
    useDebridToggle.checked = useDebrid;
    
    if (useDebrid) {
        debridConfigContainer.classList.remove('opacity-50', 'pointer-events-none');
    }

    if (settings.debridProvider) {
        providerSelect.value = settings.debridProvider;
    }

    const updateUI = (provider) => {
        // Reset specific UI elements
        rdAuthSection.classList.add('hidden');
        apiKeySection.classList.add('hidden');
        rdStatus.textContent = 'Not logged in';
        rdStatus.className = 'text-xs text-red-400';
        debridApiInput.value = ''; // Clear input as we can't retrieve actual keys

        if (provider === 'realdebrid') {
            rdAuthSection.classList.remove('hidden');
            if (settings.debridAuth && settings.debridProvider === 'realdebrid') {
                rdStatus.textContent = 'Logged in';
                rdStatus.className = 'text-xs text-green-400';
                rdLoginBtn.textContent = 'Logout';
                rdLoginBtn.classList.replace('bg-green-600', 'bg-red-600');
                rdLoginBtn.classList.replace('hover:bg-green-500', 'hover:bg-red-500');
            } else {
                rdLoginBtn.textContent = 'Login with Real-Debrid';
                rdLoginBtn.classList.replace('bg-red-600', 'bg-green-600');
                rdLoginBtn.classList.replace('hover:bg-red-500', 'hover:bg-green-500');
            }
        } else {
            apiKeySection.classList.remove('hidden');
            if (settings.debridAuth && settings.debridProvider === provider) {
                debridApiInput.placeholder = 'Saved (Enter new to overwrite)';
            } else {
                debridApiInput.placeholder = 'Enter API Key';
            }
        }
    };

    // Event Listeners
    useDebridToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            debridConfigContainer.classList.remove('opacity-50', 'pointer-events-none');
        } else {
            debridConfigContainer.classList.add('opacity-50', 'pointer-events-none');
        }
        saveDebridSettings({ useDebrid: e.target.checked });
    });

    providerSelect.addEventListener('change', (e) => {
        const provider = e.target.value;
        // Temporarily update UI; real state update happens after save/reload or if auth is persistent
        // For simple switching, we assume not-authed until confirmed
        settings.debridProvider = provider;
        settings.debridAuth = false; // Reset view auth for new provider until confirmed
        updateUI(provider);
        saveDebridSettings({ debridProvider: provider });
        
        // Refresh settings to check if we are actually authed with this new provider
        getDebridSettings().then(newS => {
            Object.assign(settings, newS);
            updateUI(provider);
        });
    });

    debridApiInput.addEventListener('change', async (e) => {
        const provider = providerSelect.value;
        const key = e.target.value.trim();
        if (!key) return;

        let endpoint = '';
        let body = {};

        if (provider === 'alldebrid') {
            endpoint = '/api/debrid/ad/apikey';
            body = { apikey: key };
        } else if (provider === 'torbox') {
            endpoint = '/api/debrid/tb/token';
            body = { token: key };
        } else if (provider === 'premiumize') {
            endpoint = '/api/debrid/pm/apikey';
            body = { apikey: key };
        }

        if (endpoint) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    debridApiInput.value = '';
                    debridApiInput.placeholder = 'Saved!';
                    // Refresh settings to update debridAuth status
                    const newS = await getDebridSettings();
                    Object.assign(settings, newS);
                } else {
                    alert('Failed to save API key');
                }
            } catch (err) {
                console.error(err);
                alert('Error saving API key');
            }
        }
    });

    rdLoginBtn.addEventListener('click', async () => {
        if (rdLoginBtn.textContent === 'Logout') {
            await saveDebridSettings({ rdToken: null, rdRefreshToken: null }); 
            // Note: generic settings save might not clear token if server ignores it.
            // But we don't have a specific logout endpoint for RD in server.mjs visible here?
            // Actually, sending garbage to /api/debrid/token clears it.
            await fetch('/api/debrid/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '' }) // Empty token triggers clear
            });
            
            settings.debridAuth = false;
            updateUI('realdebrid');
        } else {
            startRDDeviceFlow();
        }
    });

    const startRDDeviceFlow = async () => {
        rdLoginBtn.disabled = true;
        rdLoginBtn.textContent = 'Connecting...';
        try {
            const res = await fetch(`${API_BASE}/debrid/rd/device-code`);
            const data = await res.json();
            
            if (data.user_code) {
                // Copy code to clipboard
                if (window.electronAPI?.copyToClipboard) {
                    window.electronAPI.copyToClipboard(data.user_code);
                } else {
                    navigator.clipboard.writeText(data.user_code);
                }
                
                // Open verification URL
                if (window.electronAPI?.openExternal) {
                    window.electronAPI.openExternal(`https://real-debrid.com/device?code=${data.user_code}`);
                } else {
                    window.open(`https://real-debrid.com/device?code=${data.user_code}`, '_blank');
                }

                rdStatus.textContent = `Code: ${data.user_code} (Copied)`;
                rdLoginBtn.textContent = 'Waiting...';

                // Poll for token
                pollRDToken(data.device_code, data.interval);
            }
        } catch (e) {
            console.error("RD Login failed", e);
            rdLoginBtn.textContent = 'Error';
            rdLoginBtn.disabled = false;
        }
    };

    const pollRDToken = async (deviceCode, interval) => {
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/debrid/rd/poll`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ device_code: deviceCode })
                });
                
                // If the response is not OK, it might be a pending state or an error
                // We attempt to parse JSON regardless of status
                let data = {};
                try {
                    data = await res.json();
                } catch (e) {
                    // Non-JSON response (e.g. server error HTML), ignore this poll tick
                    return;
                }
                
                if (data.success || (res.ok && !data.error)) {
                    clearInterval(pollInterval);
                    // Settings are saved by backend, but we refresh local state
                    const newSettings = await getDebridSettings();
                    Object.assign(settings, newSettings);
                    
                    updateUI('realdebrid');
                    rdLoginBtn.disabled = false;
                } else if (data.error) {
                    // Check for terminal errors
                    const errStr = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
                    if (/expired|invalid|access_denied/i.test(errStr)) {
                        clearInterval(pollInterval);
                        rdLoginBtn.textContent = 'Login Failed';
                        rdLoginBtn.disabled = false;
                        rdStatus.textContent = 'Code expired or invalid';
                        rdStatus.className = 'text-xs text-red-400';
                    }
                    // For other errors (including the weird null error), we assume pending/transient and KEEP POLLING
                }
            } catch (e) {
                // Network error, keep polling
            }
        }, interval * 1000);
    };

    // Initial UI Setup
    updateUI(settings.debridProvider || 'realdebrid');
};

// Player Settings (All platforms, but Node MPV only on Windows)
export const initNodeMPVUI = async () => {
    const nodempvSection = document.getElementById('nodempv-section');
    const playerTypeSelect = document.getElementById('player-type-select');
    const mpvPathSection = document.getElementById('mpv-path-section');
    const mpvPathInput = document.getElementById('mpv-path-input');
    const browseMpvBtn = document.getElementById('browse-mpv-btn');
    
    if (!nodempvSection || !playerTypeSelect) return;
    
    // Check platform
    let isWindows = false;
    try {
        const platformRes = await fetch('/api/platform');
        const platformData = await platformRes.json();
        isWindows = platformData.platform === 'win32';
    } catch(e) {
        // If we can't detect platform, assume not Windows
        isWindows = false;
    }
    
    // Show the section on all platforms
    nodempvSection.classList.remove('hidden');
    
    // Remove Node MPV option on non-Windows platforms
    if (!isWindows) {
        const nodempvOption = playerTypeSelect.querySelector('option[value="nodempv"]');
        if (nodempvOption) {
            nodempvOption.remove();
        }
    }
    
    // Load initial state
    const settings = await getDebridSettings();
    
    // Determine current player type from settings
    let currentPlayerType = 'playtorrio'; // default
    if (settings.playerType) {
        currentPlayerType = settings.playerType;
        // If non-Windows and somehow set to nodempv, reset to playtorrio
        if (!isWindows && currentPlayerType === 'nodempv') {
            currentPlayerType = 'playtorrio';
        }
    } else if (settings.useNodeMPV && isWindows) {
        // Legacy support: if useNodeMPV was true on Windows, set to nodempv
        currentPlayerType = 'nodempv';
    }
    
    playerTypeSelect.value = currentPlayerType;
    
    // Show/hide MPV path section based on selection (Windows only)
    const updateMpvPathVisibility = () => {
        if (isWindows && playerTypeSelect.value === 'nodempv') {
            mpvPathSection.classList.remove('hidden');
        } else {
            mpvPathSection.classList.add('hidden');
        }
    };
    updateMpvPathVisibility();
    
    if (mpvPathInput) {
        mpvPathInput.value = settings.mpvPath || '';
    }
    
    // Event listener for player type change
    playerTypeSelect.addEventListener('change', (e) => {
        const playerType = e.target.value;
        // Save both new playerType and legacy useNodeMPV for backwards compatibility
        saveDebridSettings({ 
            playerType: playerType,
            useNodeMPV: playerType === 'nodempv'
        });
        updateMpvPathVisibility();
    });
    
    // Event listener for path input (save on blur) - Windows only
    if (mpvPathInput) {
        mpvPathInput.addEventListener('blur', () => {
            saveDebridSettings({ mpvPath: mpvPathInput.value.trim() || null });
        });
        mpvPathInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                mpvPathInput.blur();
            }
        });
    }
    
    // Browse button - use Electron dialog if available (Windows only)
    if (browseMpvBtn) {
        browseMpvBtn.addEventListener('click', async () => {
            if (window.electronAPI?.pickFile) {
                const result = await window.electronAPI.pickFile({
                    filters: [{ name: 'Executable', extensions: ['exe'] }],
                    title: 'Select mpv.exe'
                });
                if (result && mpvPathInput) {
                    mpvPathInput.value = result;
                    saveDebridSettings({ mpvPath: result });
                }
            } else {
                alert('File browser not available. Please enter the path manually.');
            }
        });
    }
    
    // Download MPV button - open in default browser (Windows only)
    const downloadMpvBtn = document.getElementById('download-mpv-btn');
    if (downloadMpvBtn) {
        downloadMpvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mpvUrl = 'https://mpv.io/installation/';
            if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(mpvUrl);
            } else {
                window.open(mpvUrl, '_blank');
            }
        });
    }
};

// Torrent Engine Settings
export const initTorrentEngineUI = async () => {
    const engineSelect = document.getElementById('torrent-engine-select');
    const instancesContainer = document.getElementById('engine-instances-container');
    const instancesSlider = document.getElementById('engine-instances-slider');
    const instanceCountLabel = document.getElementById('instance-count-label');
    const engineDescription = document.getElementById('engine-description');
    
    if (!engineSelect) return;
    
    const descriptions = {
        stremio: "Stremio's engine provides reliable streaming with built-in transcoding support.",
        webtorrent: "WebTorrent uses WebRTC for browser-compatible P2P streaming. Great for modern setups.",
        torrentstream: "TorrentStream is a lightweight, battle-tested engine optimized for video streaming.",
        hybrid: "Hybrid mode uses BOTH WebTorrent and TorrentStream simultaneously for maximum download speed!"
    };
    
    // Load current settings from BOTH sources (server engine config takes priority)
    let currentEngine = 'stremio';
    let currentInstances = 1;
    
    try {
        // First try to get from engine config API (actual running state)
        const engineConfig = await fetch('/api/torrent-engine/config').then(r => r.json());
        if (engineConfig && engineConfig.engine) {
            currentEngine = engineConfig.engine;
            currentInstances = engineConfig.instances || 1;
            console.log(`[TorrentEngineUI] Loaded from server: ${currentEngine}, instances: ${currentInstances}`);
        }
    } catch (e) {
        console.warn('[TorrentEngineUI] Failed to load engine config from server:', e);
        // Fallback to settings, but still default to 'stremio'
        try {
            const settings = await getDebridSettings();
            if (settings.torrentEngine) {
                currentEngine = settings.torrentEngine;
            }
            if (settings.torrentEngineInstances) {
                currentInstances = settings.torrentEngineInstances;
            }
        } catch (settingsError) {
            console.warn('[TorrentEngineUI] Failed to load settings, using default stremio');
        }
    }
    
    engineSelect.value = currentEngine;
    instancesSlider.value = currentInstances;
    instanceCountLabel.textContent = currentInstances;
    
    // Update UI based on current selection
    const updateUI = (engine) => {
        engineDescription.textContent = descriptions[engine] || descriptions.stremio;
        
        // Show/hide instances slider (not for Stremio or WebTorrent)
        if (engine === 'stremio' || engine === 'webtorrent') {
            instancesContainer.classList.add('hidden');
        } else {
            instancesContainer.classList.remove('hidden');
        }
    };
    
    updateUI(engineSelect.value);
    
    // Event listeners
    engineSelect.addEventListener('change', async (e) => {
        const engine = e.target.value;
        updateUI(engine);
        await saveDebridSettings({ torrentEngine: engine });
        
        // Apply engine change to server
        try {
            await fetch('/api/torrent-engine/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    engine, 
                    instances: parseInt(instancesSlider.value, 10) 
                })
            });
        } catch (e) {
            console.error('[TorrentEngine] Failed to update engine:', e);
        }
    });
    
    instancesSlider.addEventListener('input', (e) => {
        instanceCountLabel.textContent = e.target.value;
    });
    
    instancesSlider.addEventListener('change', async (e) => {
        const instances = parseInt(e.target.value, 10);
        await saveDebridSettings({ torrentEngineInstances: instances });
        
        // Apply to server
        try {
            await fetch('/api/torrent-engine/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    engine: engineSelect.value, 
                    instances 
                })
            });
        } catch (e) {
            console.error('[TorrentEngine] Failed to update instances:', e);
        }
    });
};
// Details Page JavaScript
const API_KEY = 'c3515fdc674ea2bd7b514f4bc3616a4a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

let currentMediaType = 'movie';
let currentMediaId = null;
let currentSeasonNumber = 1;
let allScreenshots = [];
let currentLightboxIndex = 0;

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        type: params.get('type') || 'movie',
        season: params.get('season'),
        episode: params.get('episode')
    };
}

// Initialize page
async function initDetailsPage() {
    const params = getUrlParams();
    currentMediaId = params.id;
    currentMediaType = params.type;
    
    if (!currentMediaId) {
        showError('No media ID provided');
        return;
    }
    
    await loadMediaDetails();
    
    // Check for auto-play after page is fully loaded
    checkAutoPlay();
}

// Load all media details
async function loadMediaDetails() {
    try {
        showLoading();
        
        // Fetch main details
        const detailsUrl = `${BASE_URL}/${currentMediaType}/${currentMediaId}?api_key=${API_KEY}&append_to_response=videos,credits,images,similar`;
        const response = await fetch(detailsUrl);
        const data = await response.json();
        
        // Display details
        displayMainInfo(data);
        displayTrailer(data.videos);
        displayScreenshots(data.images);
        displayCast(data.credits);
        displaySimilar(data.similar);
        
        // Load TV show seasons if applicable
        if (currentMediaType === 'tv' && data.number_of_seasons) {
            await loadSeasons(data.number_of_seasons);
        }
        
        hideLoading();
        
        // Check my list status after details are loaded
        checkMyListStatus();
    } catch (error) {
        console.error('Error loading details:', error);
        showError('Failed to load details');
    }
}

// Display main info
function displayMainInfo(data) {
    const title = data.title || data.name;
    const releaseDate = data.release_date || data.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const rating = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
    const runtime = data.runtime || (data.episode_run_time && data.episode_run_time[0]);
    const posterPath = data.poster_path ? `${IMG_BASE_URL}/w500${data.poster_path}` : '';
    const backdropPath = data.backdrop_path ? `${IMG_BASE_URL}/original${data.backdrop_path}` : '';
    
    // Set backdrop
    document.querySelector('.hero-backdrop').style.backgroundImage = `url(${backdropPath})`;
    
    // Set poster
    document.getElementById('detailsPoster').src = posterPath;
    document.getElementById('detailsPoster').alt = title;
    
    // Set title
    document.getElementById('detailsTitle').textContent = title;
    
    // Set meta info
    document.getElementById('detailsRating').innerHTML = `⭐ ${rating}`;
    document.getElementById('detailsYear').textContent = year;
    document.getElementById('detailsRuntime').textContent = runtime ? `${runtime} min` : '';
    document.getElementById('detailsType').textContent = currentMediaType.toUpperCase();
    
    // Set genres
    const genresContainer = document.getElementById('detailsGenres');
    genresContainer.innerHTML = '';
    if (data.genres) {
        data.genres.forEach(genre => {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = genre.name;
            tag.style.cursor = 'pointer';
            tag.addEventListener('click', () => {
                // Navigate to genre page
                window.location.href = `index.html#genre-${genre.id}`;
            });
            genresContainer.appendChild(tag);
        });
    }
    
    // Set tagline and overview
    document.getElementById('detailsTagline').textContent = data.tagline || '';
    document.getElementById('detailsOverview').textContent = data.overview || 'No overview available.';
    
    // Set extra info
    document.getElementById('detailsStatus').textContent = data.status || 'N/A';
    document.getElementById('detailsLanguage').textContent = data.original_language?.toUpperCase() || 'N/A';
    
    // Budget and revenue (movies only)
    if (currentMediaType === 'movie') {
        document.getElementById('detailsBudget').textContent = data.budget ? `$${(data.budget / 1000000).toFixed(1)}M` : 'N/A';
        document.getElementById('detailsRevenue').textContent = data.revenue ? `$${(data.revenue / 1000000).toFixed(1)}M` : 'N/A';
    } else {
        document.getElementById('budgetItem').style.display = 'none';
        document.getElementById('revenueItem').style.display = 'none';
    }
}

// Display trailer
function displayTrailer(videos) {
    if (!videos || !videos.results || videos.results.length === 0) {
        return;
    }
    
    // Find YouTube trailer
    const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.results[0];
    
    if (trailer) {
        const trailerBtn = document.getElementById('trailerBtn');
        trailerBtn.style.display = 'flex';
        trailerBtn.setAttribute('data-trailer-key', trailer.key);
        
        trailerBtn.addEventListener('click', () => {
            openTrailerModal(trailer.key);
        });
    }
}

// Open trailer modal
function openTrailerModal(trailerKey) {
    const modal = document.getElementById('trailerModal');
    const container = document.getElementById('trailerModalContainer');
    
    // Use youtube-nocookie.com and simplified params to fix "Error 153" 
    // which usually happens in local environments due to origin/referrer issues.
    container.innerHTML = `
        <iframe 
            id="ytPlayer"
            src="https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&showinfo=0&modestbranding=1" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            frameborder="0">
        </iframe>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close trailer modal
function closeTrailerModal() {
    const modal = document.getElementById('trailerModal');
    const container = document.getElementById('trailerModalContainer');
    
    container.innerHTML = ''; // Stop video
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Display screenshots
function displayScreenshots(images) {
    if (!images || !images.backdrops || images.backdrops.length === 0) {
        return;
    }
    
    allScreenshots = images.backdrops.slice(0, 6); // Limit to 6 screenshots
    const screenshotsGrid = document.getElementById('screenshotsGrid');
    const screenshotsSection = document.getElementById('screenshotsSection');
    
    screenshotsGrid.innerHTML = '';
    allScreenshots.forEach((screenshot, index) => {
        const item = document.createElement('div');
        item.className = 'screenshot-item';
        item.innerHTML = `<img src="${IMG_BASE_URL}/w780${screenshot.file_path}" alt="Screenshot ${index + 1}">`;
        item.addEventListener('click', () => openLightbox(index));
        screenshotsGrid.appendChild(item);
    });
    
    screenshotsSection.style.display = 'block';
}

// Display cast
function displayCast(credits) {
    if (!credits || !credits.cast || credits.cast.length === 0) {
        return;
    }
    
    const castSlider = document.getElementById('castSlider');
    const castSection = document.getElementById('castSection');
    const cast = credits.cast.slice(0, 20); // Limit to 20 cast members
    
    castSlider.innerHTML = '';
    cast.forEach(person => {
        const card = document.createElement('div');
        card.className = 'cast-card';
        
        const photoPath = person.profile_path 
            ? `${IMG_BASE_URL}/w185${person.profile_path}` 
            : 'https://via.placeholder.com/185x278?text=No+Photo';
        
        card.innerHTML = `
            <div class="cast-photo">
                <img src="${photoPath}" alt="${person.name}">
            </div>
            <div class="cast-info">
                <div class="cast-name">${person.name}</div>
                <div class="cast-character">${person.character || 'Unknown'}</div>
            </div>
        `;
        
        // Add click handler to navigate to person page
        card.addEventListener('click', () => {
            window.location.href = `person.html?id=${person.id}`;
        });
        
        castSlider.appendChild(card);
    });
    
    castSection.style.display = 'block';
}

// Display similar content
function displaySimilar(similar) {
    if (!similar || !similar.results || similar.results.length === 0) {
        return;
    }
    
    const similarGrid = document.getElementById('similarGrid');
    const similarSection = document.getElementById('similarSection');
    const items = similar.results.slice(0, 20); // Show more items for scrolling
    
    similarGrid.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'similar-card';
        
        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        const posterPath = item.poster_path 
            ? `${IMG_BASE_URL}/w342${item.poster_path}` 
            : 'https://via.placeholder.com/342x513?text=No+Image';
        
        card.innerHTML = `
            <div class="similar-poster">
                <img src="${posterPath}" alt="${title}">
            </div>
            <div class="similar-info">
                <div class="similar-title">${title}</div>
                <div class="similar-meta">
                    <span class="similar-year">${year}</span>
                    <span class="similar-rating">⭐ ${rating}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            const mediaType = item.media_type || currentMediaType;
            sessionStorage.setItem('skipIntro', 'true');
            window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
        });
        
        similarGrid.appendChild(card);
    });
    
    similarSection.style.display = 'block';
}

// Load TV show seasons
async function loadSeasons(numberOfSeasons) {
    const seasonsSelector = document.getElementById('seasonsSelector');
    const seasonsSection = document.getElementById('seasonsSection');
    const prevBtn = document.getElementById('seasonNavPrev');
    const nextBtn = document.getElementById('seasonNavNext');
    
    seasonsSelector.innerHTML = '';
    
    console.log('[Seasons] Loading', numberOfSeasons, 'seasons');
    
    // Create buttons for all seasons (1 to numberOfSeasons)
    for (let i = 1; i <= numberOfSeasons; i++) {
        const btn = document.createElement('button');
        btn.className = `season-btn ${i === 1 ? 'active' : ''}`;
        btn.textContent = `Season ${i}`;
        btn.addEventListener('click', (e) => selectSeason(i, e));
        seasonsSelector.appendChild(btn);
    }
    
    // Check if Season 0 (Specials) exists by trying to fetch it
    try {
        const season0Url = `${BASE_URL}/tv/${currentMediaId}/season/0?api_key=${API_KEY}`;
        const response = await fetch(season0Url);
        if (response.ok) {
            const data = await response.json();
            if (data.episodes && data.episodes.length > 0) {
                console.log('[Seasons] Season 0 (Specials) found with', data.episodes.length, 'episodes');
                // Add Season 0 button at the beginning
                const btn = document.createElement('button');
                btn.className = 'season-btn';
                btn.textContent = 'Specials';
                btn.addEventListener('click', (e) => selectSeason(0, e));
                seasonsSelector.insertBefore(btn, seasonsSelector.firstChild);
            }
        }
    } catch (error) {
        console.log('[Seasons] No Season 0 (Specials) found');
    }
    
    // Setup scroll navigation arrows
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    
    prevBtn.onclick = () => {
        seasonsSelector.scrollBy({ left: -200, behavior: 'smooth' });
    };
    
    nextBtn.onclick = () => {
        seasonsSelector.scrollBy({ left: 200, behavior: 'smooth' });
    };
    
    // Update arrow visibility on scroll
    seasonsSelector.addEventListener('scroll', () => updateScrollArrows(seasonsSelector, prevBtn, nextBtn));
    
    // Initial arrow state check
    setTimeout(() => updateScrollArrows(seasonsSelector, prevBtn, nextBtn), 100);
    
    seasonsSection.style.display = 'block';
    await loadEpisodes(1);
}

// Update scroll arrow states based on scroll position
function updateScrollArrows(container, prevBtn, nextBtn) {
    const isAtStart = container.scrollLeft <= 0;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
    
    prevBtn.disabled = isAtStart;
    nextBtn.disabled = isAtEnd;
}

// Select season
async function selectSeason(seasonNumber, event) {
    currentSeasonNumber = seasonNumber;
    
    // Update active button
    document.querySelectorAll('.season-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    await loadEpisodes(seasonNumber);
}

// Load episodes for a season
async function loadEpisodes(seasonNumber) {
    try {
        const url = `${BASE_URL}/tv/${currentMediaId}/season/${seasonNumber}?api_key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        displayEpisodes(data.episodes);
    } catch (error) {
        console.error('Error loading episodes:', error);
    }
}

// Display episodes
function displayEpisodes(episodes) {
    const episodesGrid = document.getElementById('episodesGrid');
    episodesGrid.innerHTML = '';
    
    if (!episodes || episodes.length === 0) {
        episodesGrid.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No episodes available</p>';
        return;
    }
    
    episodes.forEach(episode => {
        const card = document.createElement('div');
        card.className = 'episode-card';
        
        const stillPath = episode.still_path 
            ? `${IMG_BASE_URL}/w500${episode.still_path}` 
            : 'https://via.placeholder.com/500x281?text=No+Image';
        
        const airDate = episode.air_date ? new Date(episode.air_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }) : 'TBA';
        
        const rating = episode.vote_average ? episode.vote_average.toFixed(1) : 'N/A';
        
        card.innerHTML = `
            <div class="episode-thumbnail">
                <img src="${stillPath}" alt="${episode.name}">
                <div class="episode-play-overlay">
                    <div class="episode-play-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <span class="episode-number">E${episode.episode_number}</span>
                ${episode.runtime ? `<span class="episode-runtime">${episode.runtime}m</span>` : ''}
            </div>
            <div class="episode-info">
                <div class="episode-title">${episode.name}</div>
                <div class="episode-air-date">${airDate}</div>
                <div class="episode-overview">${episode.overview || 'No overview available.'}</div>
                <div class="episode-rating">⭐ ${rating}</div>
            </div>
        `;
        
        card.addEventListener('click', async () => {
            // Check streaming mode setting directly from API
            let streamingEnabled = true; // default to ON (scraping)
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const settings = await res.json();
                    streamingEnabled = settings.streamingMode !== false; // default to true
                }
            } catch (e) {
                console.warn('[Details] Failed to check streaming mode, defaulting to true');
            }
            
            console.log('[Details] Streaming mode:', streamingEnabled ? 'ON (scraping)' : 'OFF (play.html)');
            
            if (streamingEnabled && window.streamingMode) {
                // Streaming mode ON - scrape and extract from videasy/anitaro
                const posterPath = document.getElementById('detailsPoster').src;
                const title = document.getElementById('detailsTitle').textContent;
                const episodeTitle = `${title} - S${currentSeasonNumber}E${episode.episode_number}`;
                
                await window.streamingMode.playStream('tv', currentMediaId, posterPath, episodeTitle, currentSeasonNumber, episode.episode_number);
            } else {
                // Streaming mode OFF - use play.html
                window.location.href = `play.html?id=${currentMediaId}&type=tv&season=${currentSeasonNumber}&episode=${episode.episode_number}`;
            }
        });
        
        episodesGrid.appendChild(card);
    });
}

// Lightbox functionality
function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    
    lightboxImage.src = `${IMG_BASE_URL}/original${allScreenshots[index].file_path}`;
    lightbox.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function nextLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % allScreenshots.length;
    document.getElementById('lightboxImage').src = `${IMG_BASE_URL}/original${allScreenshots[currentLightboxIndex].file_path}`;
}

function prevLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + allScreenshots.length) % allScreenshots.length;
    document.getElementById('lightboxImage').src = `${IMG_BASE_URL}/original${allScreenshots[currentLightboxIndex].file_path}`;
}

// Loading states
function showLoading() {
    document.getElementById('detailsLoading').style.display = 'flex';
    document.getElementById('detailsContent').style.display = 'none';
}

function hideLoading() {
    document.getElementById('detailsLoading').style.display = 'none';
    document.getElementById('detailsContent').style.display = 'block';
}

function showError(message) {
    document.getElementById('detailsLoading').innerHTML = `
        <div style="text-align: center;">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 60px; height: 60px; color: #ef4444; margin-bottom: 20px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p style="font-size: 18px; color: rgba(255,255,255,0.7);">${message}</p>
            <button onclick="window.history.back()" style="margin-top: 20px; padding: 12px 24px; background: #8b5cf6; border: none; border-radius: 25px; color: white; cursor: pointer; font-size: 16px;">Go Back</button>
        </div>
    `;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Set skipIntro flag to skip intro when going back to home
            sessionStorage.setItem('skipIntro', 'true');
            
            // Check if we came from search results (check sessionStorage)
            const savedSearchState = sessionStorage.getItem('searchState');
            if (savedSearchState) {
                try {
                    const searchState = JSON.parse(savedSearchState);
                    if (searchState.results && searchState.results.length > 0) {
                        // Navigate back to index.html with a flag to restore search
                        sessionStorage.setItem('restoreSearch', 'true');
                        window.location.href = 'index.html';
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing search state:', e);
                }
            }
            
            // Check if we came from play page - if so, go to home instead
            if (document.referrer && document.referrer.includes('play.html')) {
                window.location.href = 'index.html';
                return;
            }
            
            // Default: go back in history
            window.history.back();
        });
    }

    // Play Now button
    const playNowBtn = document.getElementById('playNowBtn');
    if (playNowBtn) {
        playNowBtn.addEventListener('click', async () => {
            if (currentMediaType === 'tv') {
                const seasonsSection = document.getElementById('seasonsSection');
                if (seasonsSection) {
                    seasonsSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // Check streaming mode setting directly from API
                let streamingEnabled = true; // default to ON (scraping)
                try {
                    const res = await fetch('/api/settings');
                    if (res.ok) {
                        const settings = await res.json();
                        streamingEnabled = settings.streamingMode !== false; // default to true
                    }
                } catch (e) {
                    console.warn('[Details] Failed to check streaming mode, defaulting to true');
                }
                
                console.log('[Details] Streaming mode:', streamingEnabled ? 'ON (scraping)' : 'OFF (play.html)');
                
                if (streamingEnabled && window.streamingMode) {
                    // Streaming mode ON - scrape and extract from videasy/anitaro
                    const posterPath = document.getElementById('detailsPoster').src;
                    const title = document.getElementById('detailsTitle').textContent;
                    
                    await window.streamingMode.playStream('movie', currentMediaId, posterPath, title);
                } else {
                    // Streaming mode OFF - use play.html
                    window.location.href = `play.html?id=${currentMediaId}&type=${currentMediaType}`;
                }
            }
        });
    }

    // Slider Navigation
    const setupSliderNav = (gridId, prevBtnId, nextBtnId) => {
        const grid = document.getElementById(gridId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (grid && prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                grid.scrollBy({ left: -window.innerWidth * 0.5, behavior: 'smooth' });
            });
            nextBtn.addEventListener('click', () => {
                grid.scrollBy({ left: window.innerWidth * 0.5, behavior: 'smooth' });
            });
        }
    };

    setupSliderNav('screenshotsGrid', 'screenshotsPrev', 'screenshotsNext');
    setupSliderNav('similarGrid', 'similarPrev', 'similarNext');
    setupSliderNav('castSlider', 'castPrev', 'castNext');
    
    // Trailer modal controls
    const trailerModalClose = document.getElementById('trailerModalClose');
    const trailerModal = document.getElementById('trailerModal');
    
    if (trailerModalClose) {
        trailerModalClose.addEventListener('click', closeTrailerModal);
    }
    
    if (trailerModal) {
        trailerModal.addEventListener('click', (e) => {
            if (e.target === trailerModal) {
                closeTrailerModal();
            }
        });
    }
    
    // Lightbox controls
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightbox = document.getElementById('lightbox');
    
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightboxImage);
    if (lightboxNext) lightboxNext.addEventListener('click', nextLightboxImage);
    
    // Close lightbox on background click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Lightbox navigation
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevLightboxImage();
            if (e.key === 'ArrowRight') nextLightboxImage();
        }
        
        // Trailer modal
        if (trailerModal.classList.contains('active')) {
            if (e.key === 'Escape') closeTrailerModal();
        }
    });
    
    // Initialize page
    initDetailsPage();
});

// Auto-play from Continue Watching
async function checkAutoPlay() {
    const autoPlay = sessionStorage.getItem('autoPlayStream');
    if (autoPlay === 'true') {
        sessionStorage.removeItem('autoPlayStream');
        
        console.log('[Details] Auto-playing from Continue Watching');
        
        // Check streaming mode setting directly from API
        let streamingEnabled = true; // default to ON (scraping)
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const settings = await res.json();
                streamingEnabled = settings.streamingMode !== false; // default to true
            }
        } catch (e) {
            console.warn('[Details] Failed to check streaming mode, defaulting to true');
        }
        
        console.log('[Details] Streaming mode:', streamingEnabled ? 'ON (scraping)' : 'OFF (play.html)');
        
        if (streamingEnabled && window.streamingMode) {
            // Streaming mode ON - scrape and extract from videasy/anitaro
            const posterPath = document.getElementById('detailsPoster')?.src;
            const title = document.getElementById('detailsTitle')?.textContent;
            
            if (currentMediaType === 'tv') {
                const params = getUrlParams();
                const season = parseInt(params.season);
                const episode = parseInt(params.episode);
                
                if (season && episode) {
                    const episodeTitle = `${title} - S${season} E${episode}`;
                    window.streamingMode.playStream('tv', currentMediaId, posterPath, episodeTitle, season, episode);
                }
            } else {
                window.streamingMode.playStream('movie', currentMediaId, posterPath, title);
            }
        } else {
            // Streaming mode OFF - use play.html
            const params = getUrlParams();
            if (currentMediaType === 'tv') {
                const season = parseInt(params.season);
                const episode = parseInt(params.episode);
                if (season && episode) {
                    window.location.href = `play.html?id=${currentMediaId}&type=tv&season=${season}&episode=${episode}`;
                }
            } else {
                window.location.href = `play.html?id=${currentMediaId}&type=${currentMediaType}`;
            }
        }
    }
}


// ============================================================================
// MY LIST FUNCTIONALITY
// ============================================================================

let isInList = false;

// Check if current item is in my list
async function checkMyListStatus() {
    try {
        const response = await fetch('/api/my-list');
        if (!response.ok) return;
        
        const list = await response.json();
        isInList = list.some(item => item.id === parseInt(currentMediaId) && item.media_type === currentMediaType);
        
        updateMyListButton();
    } catch (error) {
        console.error('[MyList] Error checking status:', error);
    }
}

// Update my list button appearance
function updateMyListButton() {
    const btn = document.getElementById('myListBtn');
    const btnText = document.getElementById('myListBtnText');
    
    if (!btn || !btnText) return;
    
    if (isInList) {
        btnText.textContent = 'Added';
        btn.style.background = 'rgba(139, 92, 246, 0.2)';
        btn.style.borderColor = 'rgba(139, 92, 246, 0.6)';
    } else {
        btnText.textContent = 'My List';
        btn.style.background = '';
        btn.style.borderColor = '';
    }
}

// Toggle my list
async function toggleMyList() {
    const btn = document.getElementById('myListBtn');
    if (!btn) return;
    
    // Disable button during operation
    btn.disabled = true;
    
    try {
        if (isInList) {
            // Remove from list
            const response = await fetch('/api/my-list/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parseInt(currentMediaId) })
            });
            
            if (!response.ok) throw new Error('Failed to remove from list');
            
            isInList = false;
            showNotification('Removed from My List', 'success');
        } else {
            // Add to list - get current details from the page
            const title = document.getElementById('detailsTitle')?.textContent || 'Unknown';
            const posterImg = document.getElementById('detailsPoster');
            const posterPath = posterImg ? posterImg.src.split('/w500')[1] : null;
            const year = document.getElementById('detailsYear')?.textContent || null;
            const ratingText = document.getElementById('detailsRating')?.textContent || '0';
            const vote_average = parseFloat(ratingText.replace('⭐', '').trim()) || 0;
            
            const item = {
                id: parseInt(currentMediaId),
                media_type: currentMediaType,
                title: title,
                poster_path: posterPath,
                year: year,
                vote_average: vote_average
            };
            
            const response = await fetch('/api/my-list/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            
            if (!response.ok) throw new Error('Failed to add to list');
            
            isInList = true;
            showNotification('Added to My List', 'success');
        }
        
        updateMyListButton();
    } catch (error) {
        console.error('[MyList] Error toggling:', error);
        showNotification('Failed to update My List', 'error');
    } finally {
        btn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Reuse existing notification system if available
    if (window._showingNotification) return;
    window._showingNotification = true;
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10001;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
            window._showingNotification = false;
        }, 300);
    }, 2000);
}

// Initialize my list button
document.addEventListener('DOMContentLoaded', () => {
    const myListBtn = document.getElementById('myListBtn');
    if (myListBtn) {
        myListBtn.addEventListener('click', toggleMyList);
    }
});

// Media Downloader Functionality
let currentDownloaderSource = '111477'; // '111477' or 'acermovies'
let isLoadingDownloader = false;

const DOWNLOADER_API_BASE = 'http://localhost:6987';
const TMDB_API_KEY = 'c3515fdc674ea2bd7b514f4bc3616a4a';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Show Media Downloader Page
function showMediaDownloaderPage() {
    hideAllSections();

    let downloaderSection = document.getElementById('downloaderSection');
    if (!downloaderSection) {
        createDownloaderSection();
    } else {
        downloaderSection.style.setProperty('display', 'block', 'important');
    }
}

// Create Downloader Section Structure
function createDownloaderSection() {
    const mainContent = document.getElementById('mainContent');
    const section = document.createElement('div');
    section.id = 'downloaderSection';
    section.className = 'downloader-section';
    section.innerHTML = `
        <div class="downloader-header">
            <div class="downloader-controls-top">
                <div class="downloader-source-selector">
                    <button class="source-btn active" data-source="111477">111477</button>
                    <button class="source-btn" data-source="acermovies">AcerMovies</button>
                </div>
                <div class="search-container-downloader">
                    <input type="text" id="downloaderSearch" placeholder="Search movies or TV shows...">
                    <button id="downloaderSearchBtn">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    </button>
                </div>
            </div>
            <div id="downloaderSubControls" class="downloader-sub-controls"></div>
        </div>
        <div class="downloader-results" id="downloaderResults"></div>
        <div class="downloader-loader" id="downloaderLoader" style="display: none;">
            <div class="spinner"></div>
        </div>
    `;
    mainContent.appendChild(section);

    // Event Listeners for Sources
    section.querySelectorAll('.source-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            
            section.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentDownloaderSource = btn.dataset.source;
            document.getElementById('downloaderResults').innerHTML = '';
            document.getElementById('downloaderSubControls').innerHTML = '';
        });
    });

    // Search
    const searchInput = document.getElementById('downloaderSearch');
    const searchBtn = document.getElementById('downloaderSearchBtn');
    
    const triggerSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            performDownloaderSearch(query);
        }
    };

    searchBtn.addEventListener('click', triggerSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerSearch();
    });
}

// Perform Search based on source
async function performDownloaderSearch(query) {
    if (isLoadingDownloader) return;
    isLoadingDownloader = true;
    document.getElementById('downloaderLoader').style.display = 'flex';
    document.getElementById('downloaderResults').innerHTML = '';
    document.getElementById('downloaderSubControls').innerHTML = '';

    try {
        if (currentDownloaderSource === '111477') {
            await search111477(query);
        } else {
            await searchAcerMovies(query);
        }
    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('downloaderResults').innerHTML = '<p class="no-results">Error performing search.</p>';
    } finally {
        isLoadingDownloader = false;
        document.getElementById('downloaderLoader').style.display = 'none';
    }
}

// 111477 Search (using TMDB)
async function search111477(query) {
    const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
        render111477Results(data.results);
    } else {
        document.getElementById('downloaderResults').innerHTML = '<p class="no-results">No results found on TMDB.</p>';
    }
}

function render111477Results(results) {
    const container = document.getElementById('downloaderResults');
    results.forEach(item => {
        if (item.media_type !== 'movie' && item.media_type !== 'tv') return;

        const card = document.createElement('div');
        card.className = 'downloader-card';
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];

        card.innerHTML = `
            <div class="downloader-card-poster">
                <img src="${poster}" alt="${title}">
            </div>
            <div class="downloader-card-info">
                <h3 class="downloader-card-title">${title}</h3>
                <p class="downloader-card-meta">${item.media_type.toUpperCase()} • ${year}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            show111477Modal(item);
        });

        container.appendChild(card);
    });
}

function show111477Modal(item) {
    let modal = document.getElementById('downloaderModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'downloaderModal';
        modal.className = 'downloader-modal';
        document.body.appendChild(modal);
    }

    const title = item.title || item.name;
    const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';

    modal.innerHTML = `
        <div class="downloader-modal-content">
            <button class="downloader-modal-close">×</button>
            <div class="modal-header-info">
                <img src="${poster}" class="modal-poster-mini">
                <div class="modal-title-area">
                    <h2>${title}</h2>
                    <p class="downloader-card-meta">${item.media_type.toUpperCase()}</p>
                </div>
            </div>
            <div id="modalContentArea">
                ${item.media_type === 'tv' ? `
                    <div class="tv-selector-pretty">
                        <div class="selector-row">
                            <div class="input-group">
                                <label>Season</label>
                                <input type="number" id="seasonInput" value="1" min="1">
                            </div>
                            <div class="input-group">
                                <label>Episode</label>
                                <input type="number" id="episodeInput" value="1" min="1">
                            </div>
                        </div>
                        <button class="fetch-btn-large" id="fetchEpisodeBtn">Fetch Episode</button>
                    </div>
                ` : `
                    <button class="fetch-btn-large" id="fetchMovieBtn">Fetch Movie Links</button>
                `}
                <div id="modalLinksResults" class="modal-links-container"></div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    modal.querySelector('.downloader-modal-close').onclick = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (item.media_type === 'tv') {
        document.getElementById('fetchEpisodeBtn').onclick = () => {
            const s = document.getElementById('seasonInput').value;
            const e = document.getElementById('episodeInput').value;
            fetch111477DownloadLinks('tv', item.id, s, e);
        };
    } else {
        document.getElementById('fetchMovieBtn').onclick = () => {
            fetch111477DownloadLinks('movie', item.id);
        };
    }
}

async function fetch111477DownloadLinks(type, id, season, episode) {
    const resultsContainer = document.getElementById('modalLinksResults');
    resultsContainer.innerHTML = '<div class="downloader-loader"><div class="spinner"></div></div>';
    
    let url = `${DOWNLOADER_API_BASE}/111477/api/tmdb/${type}/${id}`;
    if (type === 'tv') {
        url += `/season/${season}/episode/${episode}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        render111477ModalLinks(data);
    } catch (error) {
        console.error('Error fetching links:', error);
        resultsContainer.innerHTML = '<p class="no-results">Error fetching download links.</p>';
    }
}

function render111477ModalLinks(data) {
    const container = document.getElementById('modalLinksResults');
    container.innerHTML = '<h3>Links Found</h3>';

    if (!data.success || !data.results || data.results.length === 0) {
        container.innerHTML += '<p class="no-results">No links found for this selection.</p>';
        return;
    }

    data.results.forEach(result => {
        if (!result.files || result.files.length === 0) return;

        result.files.forEach(file => {
            const linkItem = document.createElement('div');
            linkItem.className = 'download-link-item';
            linkItem.style.gridColumn = 'auto'; // Reset for modal
            linkItem.innerHTML = `
                <div class="link-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${file.sizeFormatted || ''}</span>
                </div>
                <button class="download-btn">Download</button>
            `;
            
            const downloadBtn = linkItem.querySelector('.download-btn');
            downloadBtn.addEventListener('click', () => {
                if (window.electronAPI?.openExternal) {
                    window.electronAPI.openExternal(file.url);
                } else {
                    window.open(file.url, '_blank');
                }
            });
            
            container.appendChild(linkItem);
        });
    });
}

// AcerMovies Search
async function searchAcerMovies(query) {
    const response = await fetch(`${DOWNLOADER_API_BASE}/api/acermovies/search/${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.searchResult && data.searchResult.length > 0) {
        renderAcerMoviesResults(data.searchResult);
    } else {
        document.getElementById('downloaderResults').innerHTML = '<p class="no-results">No results found on AcerMovies.</p>';
    }
}

function renderAcerMoviesResults(results) {
    const container = document.getElementById('downloaderResults');
    results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'downloader-card';
        card.innerHTML = `
            <div class="downloader-card-poster">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="downloader-card-info">
                <h3 class="downloader-card-title">${item.title}</h3>
            </div>
        `;

        card.addEventListener('click', () => fetchAcerMoviesQualities(item.url));
        container.appendChild(card);
    });
}

async function fetchAcerMoviesQualities(url) {
    document.getElementById('downloaderLoader').style.display = 'flex';
    try {
        const response = await fetch(`${DOWNLOADER_API_BASE}/api/acermovies/sourceQuality?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        renderAcerMoviesQualities(data.sourceQualityList, data.meta ? data.meta.type : 'movie');
    } catch (error) {
        console.error('Error fetching qualities:', error);
    } finally {
        document.getElementById('downloaderLoader').style.display = 'none';
    }
}

function renderAcerMoviesQualities(qualities, type) {
    const container = document.getElementById('downloaderResults');
    container.innerHTML = '<div class="results-header"><button class="back-btn" onclick="document.getElementById(\'downloaderSearchBtn\').click()">← Back to Results</button><h3>Available Qualities</h3></div>';

    qualities.forEach(q => {
        const item = document.createElement('div');
        item.className = 'quality-item';
        item.innerHTML = `
            <div class="quality-info">
                <h4>${q.title}</h4>
                <span class="quality-badge">${q.quality || ''}</span>
            </div>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'quality-actions';

        if (q.batchUrl && q.episodesUrl) {
            const batchBtn = document.createElement('button');
            batchBtn.className = 'action-btn secondary';
            batchBtn.textContent = 'Season Packs';
            batchBtn.onclick = (e) => getAcerMoviesDownloadUrl(q.batchUrl, 'batch', e.target);
            
            const episodesBtn = document.createElement('button');
            episodesBtn.className = 'action-btn primary';
            episodesBtn.textContent = 'Episodes';
            episodesBtn.onclick = () => fetchAcerMoviesEpisodes(q.episodesUrl);
            
            actions.appendChild(batchBtn);
            actions.appendChild(episodesBtn);
        } else if (q.batchUrl) {
            const batchBtn = document.createElement('button');
            batchBtn.className = 'action-btn primary';
            batchBtn.textContent = 'Season Pack';
            batchBtn.onclick = (e) => getAcerMoviesDownloadUrl(q.batchUrl, 'batch', e.target);
            actions.appendChild(batchBtn);
        } else if (q.episodesUrl) {
            const episodesBtn = document.createElement('button');
            episodesBtn.className = 'action-btn primary';
            episodesBtn.textContent = 'Episodes';
            episodesBtn.onclick = () => fetchAcerMoviesEpisodes(q.episodesUrl);
            actions.appendChild(episodesBtn);
        } else if (q.url) {
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'action-btn primary';
            downloadBtn.textContent = 'Download';
            downloadBtn.onclick = (e) => getAcerMoviesDownloadUrl(q.url, type, e.target);
            actions.appendChild(downloadBtn);
        }

        item.appendChild(actions);
        container.appendChild(item);
    });
}

async function fetchAcerMoviesEpisodes(url) {
    document.getElementById('downloaderLoader').style.display = 'flex';
    try {
        const response = await fetch(`${DOWNLOADER_API_BASE}/api/acermovies/sourceEpisodes?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        renderAcerMoviesEpisodes(data.sourceEpisodes);
    } catch (error) {
        console.error('Error fetching episodes:', error);
    } finally {
        document.getElementById('downloaderLoader').style.display = 'none';
    }
}

function renderAcerMoviesEpisodes(episodes) {
    const container = document.getElementById('downloaderResults');
    container.innerHTML = '<div class="results-header"><button class="back-btn" onclick="document.getElementById(\'downloaderSearchBtn\').click()">← Back to Results</button><h3>Episodes</h3></div>';
    
    episodes.forEach(ep => {
        const item = document.createElement('div');
        item.className = 'episode-download-item';
        item.innerHTML = `
            <span>${ep.title}</span>
            <button class="action-btn primary" onclick="getAcerMoviesDownloadUrl('${ep.link}', 'episode', this)">Fetch Link</button>
        `;
        container.appendChild(item);
    });
}

async function getAcerMoviesDownloadUrl(url, type, button) {
    if (button.classList.contains('ready-to-download')) {
        const downloadUrl = button.dataset.downloadUrl;
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(downloadUrl);
        } else {
            window.open(downloadUrl, '_blank');
        }
        return;
    }

    const originalText = button.textContent;
    button.textContent = 'Fetching...';
    button.disabled = true;

    try {
        const response = await fetch(`${DOWNLOADER_API_BASE}/api/acermovies/sourceUrl?url=${encodeURIComponent(url)}&seriesType=${type}`);
        const data = await response.json();
        if (data.sourceUrl) {
            button.textContent = 'Download Ready';
            button.dataset.downloadUrl = data.sourceUrl;
            button.classList.add('ready-to-download');
            button.disabled = false;
        } else {
            button.textContent = originalText;
            button.disabled = false;
            alert('Could not find download URL');
        }
    } catch (error) {
        console.error('Error getting download URL:', error);
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Genres Page Functionality

// Genre Styling and Icons
const genreIcons = {
    28: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`, // Action
    12: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`, // Adventure
    16: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.5 1.5"/><path d="M7 11l-4-4"/></svg>`, // Animation
    35: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`, // Comedy
    80: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`, // Crime
    99: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`, // Documentary
    18: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/><path d="M12 14c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/><path d="M7 21l3-4"/><path d="M17 21l-3-4"/></svg>`, // Drama
    10751: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, // Family
    14: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`, // Fantasy
    36: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`, // History
    27: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10L9.01 10"/><path d="M15 10L15.01 10"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>`, // Horror
    10402: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`, // Music
    9648: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`, // Mystery
    10749: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`, // Romance
    878: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 2.67-2 3.5 0 1.1.9 2 2 2 .83 0 2.24-.5 3.5-2"/><path d="M12 14c4 0 7.5-3 7.5-7.5S16.5 2 12 2 4.5 2.5 4.5 7s3 7.5 7.5 7.5z"/><path d="M16.5 4.5c1.26-1.5 2.67-2 3.5-2 1.1 0 2 .9 2 2 0 .83-.5 2.24-2 3.5"/></svg>`, // Science Fiction
    10770: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>`, // TV Movie
    53: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`, // Thriller
    10752: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v7"/><path d="M16 2v7"/><path d="M20 9H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2z"/></svg>`, // War
    37: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="M9 9l6 6"/><path d="M15 9l-6 6"/></svg>`, // Western
    10759: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`, // Action & Adventure (TV)
    10762: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`, // Kids
    10763: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l4 4v10a2 2 0 0 1-2 2z"/><polyline points="14 4 14 8 18 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`, // News
    10764: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`, // Reality
    10765: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>`, // Sci-Fi & Fantasy (TV)
    10766: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="3" y="11" width="18" height="11" rx="2"/></svg>`, // Soap
    10767: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`, // Talk
    10768: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 22v-4"/><path d="M12 6V2"/><path d="M22 12h-4"/><path d="M6 12H2"/></svg>` // War & Politics
};

const genreStyles = {
    28: { gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' }, // Action
    12: { gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' }, // Adventure
    16: { gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' }, // Animation
    35: { gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' }, // Comedy
    80: { gradient: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)' }, // Crime
    99: { gradient: 'linear-gradient(135deg, #1d976c 0%, #93f9b9 100%)' }, // Documentary
    18: { gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)' }, // Drama
    10751: { gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' }, // Family
    14: { gradient: 'linear-gradient(135deg, #da22ff 0%, #9733ee 100%)' }, // Fantasy
    36: { gradient: 'linear-gradient(135deg, #e65c00 0%, #f9d423 100%)' }, // History
    27: { gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)' }, // Horror
    10402: { gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' }, // Music
    9648: { gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' }, // Mystery
    10749: { gradient: 'linear-gradient(135deg, #ff00cc 0%, #3333ff 100%)' }, // Romance
    878: { gradient: 'linear-gradient(135deg, #0575e6 0%, #021b79 100%)' }, // Science Fiction
    10770: { gradient: 'linear-gradient(135deg, #7474bf 0%, #348ac7 100%)' }, // TV Movie
    53: { gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' }, // Thriller
    10752: { gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)' }, // War
    37: { gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' }, // Western
    10759: { gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' }, // Action & Adventure (TV)
    10762: { gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' }, // Kids
    10763: { gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }, // News
    10764: { gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' }, // Reality
    10765: { gradient: 'linear-gradient(135deg, #da22ff 0%, #9733ee 100%)' }, // Sci-Fi & Fantasy (TV)
    10766: { gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' }, // Soap
    10767: { gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' }, // Talk
    10768: { gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)' }  // War & Politics
};

const defaultStyle = { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' };
const defaultIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;

// All genres from TMDB
const allGenres = {
    movie: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
    ],
    tv: [
        { id: 10759, name: 'Action & Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 10762, name: 'Kids' },
        { id: 9648, name: 'Mystery' },
        { id: 10763, name: 'News' },
        { id: 10764, name: 'Reality' },
        { id: 10765, name: 'Sci-Fi & Fantasy' },
        { id: 10766, name: 'Soap' },
        { id: 10767, name: 'Talk' },
        { id: 10768, name: 'War & Politics' },
        { id: 37, name: 'Western' }
    ]
};

// Combine and deduplicate genres
const combinedGenres = [...allGenres.movie];
allGenres.tv.forEach(tvGenre => {
    if (!combinedGenres.find(g => g.id === tvGenre.id)) {
        combinedGenres.push(tvGenre);
    }
});

// State for genre browsing
let currentGenre = null;
let currentMediaType = 'all'; // all, movie, tv
let currentPage = 1;
let isLoading = false;
let hasMorePages = true;
let observer = null;

// Show genres page
function showGenresPage() {
    hideAllSections();
    
    // Check if genres page already exists
    let genresPage = document.getElementById('genresPageContainer');
    if (!genresPage) {
        genresPage = document.createElement('div');
        genresPage.id = 'genresPageContainer';
        genresPage.innerHTML = `
            <div class="genres-page">
                <div class="genres-header">
                    <button class="back-btn" id="backToHomeFromGenres" style="margin-bottom: 20px;">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 18px; height: 18px;">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                        Back to Home
                    </button>
                    <h1 class="genres-title">Browse by Genre</h1>
                    <p class="genres-subtitle">Explore movies and TV shows by category</p>
                </div>
                <div class="genres-grid" id="genresGrid"></div>
            </div>
        `;
        document.getElementById('mainContent').appendChild(genresPage);
        
        // Add event listener for the new back button
        document.getElementById('backToHomeFromGenres').addEventListener('click', () => {
            // Clear hash
            if (window.location.hash) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
            showHomePage();
        });
        
        populateGenres();
    } else {
        genresPage.style.setProperty('display', 'block', 'important');
    }
    
    window.scrollTo(0, 0);
}

// Populate genres grid
function populateGenres() {
    const genresGrid = document.getElementById('genresGrid');
    genresGrid.innerHTML = '';
    
    combinedGenres.sort((a, b) => a.name.localeCompare(b.name)).forEach((genre, index) => {
        const style = genreStyles[genre.id] || defaultStyle;
        const icon = genreIcons[genre.id] || defaultIcon;
        const genreCard = document.createElement('div');
        genreCard.className = 'genre-card';
        genreCard.style.setProperty('--genre-gradient', style.gradient);
        genreCard.style.animation = `fadeInUp 0.5s ease-out ${index * 0.05}s both`;
        
        genreCard.innerHTML = `
            <div class="genre-card-bg" style="background: ${style.gradient}"></div>
            <div class="genre-card-content">
                <div class="genre-card-icon-wrapper">
                    ${icon}
                </div>
                <h3 class="genre-card-title">${genre.name}</h3>
                <div class="genre-card-indicator">
                    <span>Explore</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        `;
        genreCard.addEventListener('click', () => showGenreBrowse(genre));
        genresGrid.appendChild(genreCard);
    });
}

// Show genre browse page
function showGenreBrowse(genre) {
    currentGenre = genre;
    currentMediaType = 'all';
    currentPage = 1;
    hasMorePages = true;
    isLoading = false;
    
    hideAllSections();
    
    // Check if browse page exists
    let browsePage = document.getElementById('genreBrowsePageContainer');
    if (!browsePage) {
        browsePage = document.createElement('div');
        browsePage.id = 'genreBrowsePageContainer';
        browsePage.innerHTML = `
            <div class="genre-browse-page">
                <div class="genre-browse-header">
                    <div class="genre-browse-title-section">
                        <button class="back-btn" id="backToGenres">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                            </svg>
                            Back
                        </button>
                        <h1 class="genre-browse-title" id="genreBrowseTitle">${genre.name}</h1>
                    </div>
                    <div class="media-type-filters">
                        <button class="media-type-btn active" data-type="all">All</button>
                        <button class="media-type-btn" data-type="movie">Movies</button>
                        <button class="media-type-btn" data-type="tv">TV Shows</button>
                    </div>
                </div>
                <div class="genre-browse-results" id="genreBrowseResults"></div>
                <!-- Sentinel for Infinite Scroll -->
                <div id="scrollSentinel" style="height: 20px; width: 100%;"></div>
                <div class="loading-indicator" id="loadingIndicator" style="display: none;">
                    <div class="spinner"></div>
                    <p>Loading more...</p>
                </div>
            </div>
        `;
        document.getElementById('mainContent').appendChild(browsePage);
        initGenreBrowse();
    } else {
        browsePage.style.setProperty('display', 'block', 'important');
        document.getElementById('genreBrowseTitle').textContent = genre.name;
        document.getElementById('genreBrowseResults').innerHTML = '';
        document.querySelectorAll('.media-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'all');
        });
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Start scroll checking
    setupInfiniteScroll();
    
    // Load first 3 pages immediately to fill screen
    initialGenreLoad();
}

// Initialize genre browse page
function initGenreBrowse() {
    // Back button
    document.getElementById('backToGenres').addEventListener('click', () => {
        disconnectObserver();
        document.getElementById('genreBrowsePageContainer').style.display = 'none';
        window.scrollTo(0, 0);
        showGenresPage();
    });
    
    // Media type filters
    document.querySelectorAll('.media-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.media-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMediaType = btn.dataset.type;
            currentPage = 1;
            hasMorePages = true;
            isLoading = false;
            document.getElementById('genreBrowseResults').innerHTML = '';
            window.scrollTo(0, 0);
            loadGenreContent();
        });
    });
}

// Stop scroll checking when leaving genre browse
function cleanupGenreBrowse() {
    disconnectObserver();
}

// Setup Intersection Observer for infinite scroll
function setupInfiniteScroll() {
    disconnectObserver();
    
    const sentinel = document.getElementById('scrollSentinel');
    if (!sentinel) return;
    
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMorePages) {
            console.log('👀 Sentinel visible, loading more...');
            loadGenreContent();
        }
    }, {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
    });
    
    observer.observe(sentinel);
}

// Disconnect observer
function disconnectObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

// Initial multi-page load
async function initialGenreLoad() {
    await loadGenreContent(); // Page 1
    if (hasMorePages) await loadGenreContent(); // Page 2
    if (hasMorePages) await loadGenreContent(); // Page 3
}

// Load genre content
async function loadGenreContent() {
    if (isLoading) {
        console.log('⏸️ Already loading, skipping...');
        return;
    }
    
    if (!hasMorePages) {
        console.log('⏸️ No more pages, skipping...');
        return;
    }
    
    console.log(`📥 Loading page ${currentPage} for ${currentGenre.name} (${currentMediaType})`);
    
    isLoading = true;
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    
    try {
        let results = [];
        
        if (currentMediaType === 'all') {
            // Fetch both movies and TV shows
            const [movieData, tvData] = await Promise.all([
                fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${currentGenre.id}&page=${currentPage}`).then(r => r.json()),
                fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${currentGenre.id}&page=${currentPage}`).then(r => r.json())
            ]);
            
            const movies = (movieData.results || []).map(m => ({ ...m, media_type: 'movie' }));
            const tvShows = (tvData.results || []).map(t => ({ ...t, media_type: 'tv' }));
            results = [...movies, ...tvShows].sort((a, b) => {
                const ratingA = a.vote_average || 0;
                const ratingB = b.vote_average || 0;
                return ratingB - ratingA;
            });
            
            // Check if we have more pages for either type
            hasMorePages = currentPage < Math.max(movieData.total_pages || 0, tvData.total_pages || 0);
        } else {
            // Fetch specific media type
            const endpoint = currentMediaType === 'movie' ? 'movie' : 'tv';
            const response = await fetch(`${BASE_URL}/discover/${endpoint}?api_key=${API_KEY}&with_genres=${currentGenre.id}&page=${currentPage}`);
            const data = await response.json();
            results = (data.results || []).map(item => ({ ...item, media_type: currentMediaType }));
            hasMorePages = currentPage < (data.total_pages || 0);
        }
        
        console.log(`✅ Loaded ${results.length} items. More pages: ${hasMorePages}`);
        
        displayGenreResults(results);
        currentPage++;
        
    } catch (error) {
        console.error('❌ Error loading genre content:', error);
    } finally {
        isLoading = false;
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

// Display genre results
function displayGenreResults(results) {
    const resultsContainer = document.getElementById('genreBrowseResults');
    
    results.forEach((item, index) => {
        const card = createGenreResultCard(item);
        card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.05}s both`;
        resultsContainer.appendChild(card);
    });
}

// Create genre result card
function createGenreResultCard(item) {
    const card = document.createElement('div');
    card.className = 'genre-result-card';
    
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const lang = item.original_language ? item.original_language.toUpperCase() : 'EN';
    const posterPath = item.poster_path 
        ? `${IMG_BASE_URL}/w500${item.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Image';
    const mediaType = item.media_type || 'movie';
    
    const movieIcon = `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>`;
    const tvIcon = `<svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.11-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"/></svg>`;
    
    card.innerHTML = `
        <div class="genre-card-poster">
            <img src="${posterPath}" alt="${title}" class="main-poster" loading="lazy">
            <div class="genre-card-full-title">${title}</div>
            <div class="genre-card-overlay">
                <div class="overlay-content">
                    <div class="play-btn-circle">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <span class="view-details">View Details</span>
                </div>
            </div>
            <div class="genre-card-badge">
                ${mediaType === 'movie' ? movieIcon : tvIcon}
                <span>${mediaType === 'movie' ? 'MOVIE' : 'TV SHOW'}</span>
            </div>
        </div>
        <div class="genre-card-info">
            <div class="genre-card-header">
                <h3 class="genre-card-title" title="${title}">${title}</h3>
                <span class="genre-card-rating">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    ${rating}
                </span>
            </div>
            <div class="genre-card-footer">
                <div class="genre-card-meta-left">
                    <span class="genre-card-year">${year}</span>
                    <span class="genre-card-lang">${lang}</span>
                </div>
                <div class="genre-card-actions">
                    <button class="action-btn quick-play-pill" title="Play Now">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        <span>Play</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add click handler for details
    card.addEventListener('click', (e) => {
        if (e.target.closest('.quick-play-pill')) {
            e.stopPropagation();
            sessionStorage.setItem('skipIntro', 'true');
            window.location.href = `play.html?id=${item.id}&type=${mediaType}`;
        } else {
            sessionStorage.setItem('skipIntro', 'true');
            window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
        }
    });
    
    return card;
}


// Handle hash navigation for genre links
window.addEventListener('hashchange', handleGenreHash);
window.addEventListener('load', handleGenreHash);

function handleGenreHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#genre-')) {
        const genreId = parseInt(hash.replace('#genre-', ''));
        const genre = combinedGenres.find(g => g.id === genreId);
        if (genre) {
            // Show genres page first
            showGenresPage();
            // Then navigate to the specific genre
            setTimeout(() => {
                showGenreBrowse(genre);
            }, 100);
        }
    }
}
// SVG Icons for Navbar
const icons = {
    home: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
    
    search: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    
    genres: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>`,
    
    playMagnet: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/><path d="M3.5 18.5L9 13l-5.5-5.5C2.5 8.5 2 9.5 2 10.5v7c0 1 .5 2 1.5 1z"/></svg>`,
    
    liveTv: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.11-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"/></svg>`,
    
    books: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>`,
    
    audiobooks: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7zm-1.5 16c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    
    anime: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>`,
    
    comics: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"/></svg>`,
    
    manga: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>`,
    
    music: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
    
    mediaDownloader: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/></svg>`,
    
    gamesDownloader: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>`,
    
    clearCache: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    
    refresh: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`
};

/**
 * IPTV Functionality for PlayTorrio
 * Handles Xtream Codes API and Playback
 */

class IPTVManager {
    constructor() {
        this.config = JSON.parse(localStorage.getItem('iptv_config')) || null;
        this.userData = null;
        this.categories = { live: [], movie: [], series: [] };
        this.currentView = 'home';
        this.currentCategory = 'all';
        this.allItems = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupGlobalKeyboardShortcuts();
        if (this.config) {
            this.login(this.config);
        } else {
            this.updateLoginUI(false);
        }
    }

    setupGlobalKeyboardShortcuts() {
        // Global Escape key to exit page
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const playerView = document.getElementById('player-view');
                const loginModal = document.getElementById('login-modal');
                
                // If player is open, close it
                if (!playerView.classList.contains('hidden')) {
                    this.closePlayer();
                    e.preventDefault();
                    return;
                }
                
                // If login modal is open, close it
                if (!loginModal.classList.contains('hidden')) {
                    loginModal.classList.add('hidden');
                    e.preventDefault();
                    return;
                }
                
                // Otherwise, go back with skipIntro flag
                sessionStorage.setItem('skipIntro', 'true');
                window.history.back();
                e.preventDefault();
            }
        });
    }

    setupEventListeners() {
        // Back buttons
        document.getElementById('back-btn').addEventListener('click', () => {
            // Set skipIntro flag before navigating back
            sessionStorage.setItem('skipIntro', 'true');
            window.history.back();
        });

        document.getElementById('back-to-home').addEventListener('click', () => {
            this.showView('home');
        });

        document.getElementById('back-to-listing').addEventListener('click', () => {
            this.showView('series');
        });

        // Login Modal
        document.getElementById('login-btn').addEventListener('click', () => {
            document.getElementById('login-modal').classList.remove('hidden');
        });

        document.getElementById('close-login').addEventListener('click', () => {
            document.getElementById('login-modal').classList.add('hidden');
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('submit-login').addEventListener('click', () => {
            const url = document.getElementById('login-url').value.trim();
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value.trim();
            const m3u = document.getElementById('login-m3u').value.trim();

            if (m3u) {
                // Check if it's a get.php URL (Xtream Codes M3U format)
                if (m3u.includes('get.php')) {
                    // Parse get.php URL to extract credentials
                    try {
                        const urlObj = new URL(m3u);
                        const username = urlObj.searchParams.get('username');
                        const password = urlObj.searchParams.get('password');
                        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
                        
                        if (username && password) {
                            // Use Xtream Codes API
                            const config = { url: baseUrl, user: username, pass: password };
                            this.login(config);
                            return;
                        }
                    } catch (e) {
                        console.warn('Failed to parse get.php URL, treating as regular M3U');
                    }
                }
                
                // Handle as regular M3U/M3U8 URL
                this.loginWithM3U(m3u);
                return;
            }

            if (!url || !user || !pass) {
                alert('Please enter URL, Username and Password OR M3U URL');
                return;
            }

            const config = { url, user, pass };
            this.login(config);
        });

        // Box clicks
        document.getElementById('box-live').addEventListener('click', () => this.loadListing('live'));
        document.getElementById('box-movies').addEventListener('click', () => this.loadListing('movie'));
        document.getElementById('box-shows').addEventListener('click', () => this.loadListing('series'));

        // Search
        document.getElementById('iptv-search').addEventListener('input', (e) => {
            this.filterItems(e.target.value);
        });

        // Player
        document.getElementById('close-player-btn').addEventListener('click', () => this.closePlayer());
    }

    async login(config) {
        try {
            const loginUrl = `${config.url}/player_api.php?username=${config.user}&password=${config.pass}`;
            const response = await fetch(loginUrl);
            const data = await response.json();

            if (data && data.user_info && data.user_info.auth === 1) {
                this.config = config;
                this.userData = data;
                localStorage.setItem('iptv_config', JSON.stringify(config));
                this.updateLoginUI(true);
                this.updateSubDetails(data);
                document.getElementById('login-modal').classList.add('hidden');
            } else {
                alert('Login failed. Please check your credentials.');
                this.logout();
            }
        } catch (error) {
            console.error('IPTV Login Error:', error);
            alert('Failed to connect to server. Check URL and connectivity.');
        }
    }

    async loginWithM3U(m3uUrl) {
        try {
            // Fetch and parse M3U/M3U8 playlist
            const response = await fetch(m3uUrl);
            const m3uText = await response.text();
            
            const channels = this.parseM3U(m3uText);
            
            if (channels.length === 0) {
                alert('No channels found in M3U file');
                return;
            }

            // Store M3U config
            const config = { type: 'm3u', url: m3uUrl, channels };
            this.config = config;
            this.userData = { user_info: { auth: 1, status: 'Active' } };
            localStorage.setItem('iptv_config', JSON.stringify(config));
            this.updateLoginUI(true);
            document.getElementById('login-modal').classList.add('hidden');
            
            // Show basic sub details
            document.getElementById('sub-details').classList.remove('hidden');
            document.getElementById('sub-status').textContent = 'Active';
            document.getElementById('sub-expiry').textContent = 'N/A';
            document.getElementById('sub-connections').textContent = '1';
            document.getElementById('sub-max').textContent = '1';
        } catch (error) {
            console.error('M3U Login Error:', error);
            alert('Failed to load M3U file. Check URL and connectivity.');
        }
    }

    parseM3U(m3uText) {
        const lines = m3uText.split('\n');
        const channels = [];
        let currentChannel = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXTINF:')) {
                // Parse channel info
                const nameMatch = line.match(/,(.+)$/);
                const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                const groupMatch = line.match(/group-title="([^"]+)"/);
                
                currentChannel = {
                    name: nameMatch ? nameMatch[1] : 'Unknown Channel',
                    stream_icon: logoMatch ? logoMatch[1] : '',
                    category_name: groupMatch ? groupMatch[1] : 'Uncategorized',
                    category_id: groupMatch ? groupMatch[1].toLowerCase().replace(/\s+/g, '-') : 'uncategorized'
                };
            } else if (line && !line.startsWith('#') && currentChannel) {
                // This is the stream URL
                currentChannel.stream_url = line;
                currentChannel.stream_id = channels.length;
                channels.push(currentChannel);
                currentChannel = null;
            }
        }

        return channels;
    }

    logout() {
        this.config = null;
        this.userData = null;
        localStorage.removeItem('iptv_config');
        this.updateLoginUI(false);
        this.showView('home');
        document.getElementById('sub-details').classList.add('hidden');
    }

    updateLoginUI(isLoggedIn) {
        document.getElementById('login-btn').classList.toggle('hidden', isLoggedIn);
        document.getElementById('logout-btn').classList.toggle('hidden', !isLoggedIn);
        document.getElementById('home-view').classList.toggle('opacity-50', !isLoggedIn);
        document.getElementById('home-view').classList.toggle('pointer-events-none', !isLoggedIn);
    }

    updateSubDetails(data) {
        const info = data.user_info;
        document.getElementById('sub-details').classList.remove('hidden');
        document.getElementById('sub-status').textContent = info.status || 'Active';
        
        if (info.exp_date) {
            const date = new Date(parseInt(info.exp_date) * 1000);
            document.getElementById('sub-expiry').textContent = date.toLocaleDateString();
        } else {
            document.getElementById('sub-expiry').textContent = 'Unlimited';
        }
        
        document.getElementById('sub-connections').textContent = info.active_cons || '0';
        document.getElementById('sub-max').textContent = info.max_connections || '1';
    }

    async loadListing(type) {
        if (!this.config) return;
        this.currentView = type;
        this.showView('listing');
        document.getElementById('view-title').textContent = type === 'live' ? 'Live TV' : (type === 'movie' ? 'Movies' : 'TV Shows');
        
        // Show loading
        document.getElementById('item-grid').innerHTML = '<div class="col-span-full text-center py-20"><div class="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div><p>Loading content...</p></div>';
        
        try {
            // Handle M3U config
            if (this.config.type === 'm3u') {
                if (type === 'live') {
                    this.allItems = this.config.channels;
                    
                    // Extract unique categories
                    const uniqueCategories = [...new Set(this.config.channels.map(ch => ch.category_name))];
                    this.categories.live = uniqueCategories.map((name, idx) => ({
                        category_id: name.toLowerCase().replace(/\s+/g, '-'),
                        category_name: name
                    }));
                    
                    this.renderCategories('live');
                    this.renderItems('all');
                } else {
                    // M3U typically only has live channels
                    document.getElementById('item-grid').innerHTML = '<div class="col-span-full text-center py-20 text-white text-opacity-50">M3U playlists typically only contain live channels.</div>';
                }
                return;
            }

            // Load categories first if not loaded (Xtream Codes)
            if (this.categories[type].length === 0) {
                const catAction = type === 'live' ? 'get_live_categories' : (type === 'movie' ? 'get_vod_categories' : 'get_series_categories');
                const catUrl = `${this.config.url}/player_api.php?username=${this.config.user}&password=${this.config.pass}&action=${catAction}`;
                const catRes = await fetch(catUrl);
                this.categories[type] = await catRes.json();
            }
            
            this.renderCategories(type);

            // Load all items for this type
            const itemAction = type === 'live' ? 'get_live_streams' : (type === 'movie' ? 'get_vod_streams' : 'get_series');
            const itemUrl = `${this.config.url}/player_api.php?username=${this.config.user}&password=${this.config.pass}&action=${itemAction}`;
            const itemRes = await fetch(itemUrl);
            this.allItems = await itemRes.json();
            
            this.renderItems('all');
        } catch (error) {
            console.error('Load Listing Error:', error);
            document.getElementById('item-grid').innerHTML = '<div class="col-span-full text-center py-20 text-red-500">Failed to load content.</div>';
        }
    }

    renderCategories(type) {
        const container = document.getElementById('category-list');
        container.innerHTML = `<div class="category-item active" data-id="all">All Categories</div>`;
        
        this.categories[type].forEach(cat => {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.setAttribute('data-id', cat.category_id);
            div.textContent = cat.category_name;
            div.addEventListener('click', () => {
                document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                this.renderItems(cat.category_id);
            });
            container.appendChild(div);
        });
    }

    renderItems(categoryId) {
        this.currentCategory = categoryId;
        const grid = document.getElementById('item-grid');
        grid.innerHTML = '';
        
        const filtered = categoryId === 'all' ? this.allItems : this.allItems.filter(item => item.category_id === categoryId);
        
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-20 text-white text-opacity-50">No items found in this category.</div>';
            return;
        }

        // Limit rendering for performance if too many
        const toRender = filtered.slice(0, 500);

        toRender.forEach(item => {
            const card = document.createElement('div');
            card.className = `iptv-item ${this.currentView === 'movie' || this.currentView === 'series' ? 'movie' : ''}`;
            
            let imgUrl = item.stream_icon || item.cover || '';
            
            card.innerHTML = `
                <div class="flex-1 overflow-hidden">
                    ${imgUrl ? `<img src="${imgUrl}" loading="lazy" onerror="this.style.display='none'">` : '<div class="no-image-placeholder"><i class="material-icons">tv</i></div>'}
                </div>
                <div class="item-name">${item.name}</div>
            `;
            
            card.addEventListener('click', () => {
                if (this.currentView === 'series') {
                    this.loadSeriesDetail(item);
                } else {
                    this.playItem(item);
                }
            });
            
            grid.appendChild(card);
        });
    }

    filterItems(query) {
        const q = query.toLowerCase();
        const grid = document.getElementById('item-grid');
        const items = grid.querySelectorAll('.iptv-item');
        
        items.forEach(item => {
            const name = item.querySelector('.item-name').textContent.toLowerCase();
            if (name.includes(q)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    async loadSeriesDetail(series) {
        this.showView('series-detail');
        document.getElementById('series-title').textContent = series.name;
        document.getElementById('series-poster').src = series.cover || series.stream_icon || '';
        document.getElementById('series-plot').textContent = 'Loading details...';
        document.getElementById('season-list').innerHTML = '';
        document.getElementById('episode-list').innerHTML = '';

        try {
            const url = `${this.config.url}/player_api.php?username=${this.config.user}&password=${this.config.pass}&action=get_series_info&series_id=${series.series_id}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.info && data.info.plot) {
                document.getElementById('series-plot').textContent = data.info.plot;
            } else {
                document.getElementById('series-plot').textContent = 'No description available.';
            }

            const seasons = Object.keys(data.episodes);
            seasons.forEach((s, index) => {
                const btn = document.createElement('button');
                btn.className = `season-btn ${index === 0 ? 'active' : ''}`;
                btn.textContent = `Season ${s}`;
                btn.onclick = () => {
                    document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.renderEpisodes(data.episodes[s]);
                };
                document.getElementById('season-list').appendChild(btn);
            });

            if (seasons.length > 0) {
                this.renderEpisodes(data.episodes[seasons[0]]);
            }
        } catch (error) {
            console.error('Series Detail Error:', error);
        }
    }

    renderEpisodes(episodes) {
        const container = document.getElementById('episode-list');
        container.innerHTML = '';
        
        episodes.forEach(ep => {
            const div = document.createElement('div');
            div.className = 'episode-item';
            div.innerHTML = `
                <span class="episode-number">${ep.episode_num}</span>
                <div class="flex-1">
                    <div class="font-medium">${ep.title || 'Episode ' + ep.episode_num}</div>
                </div>
                <i class="material-icons text-blue-500">play_circle_filled</i>
            `;
            div.onclick = () => this.playItem(ep, 'series');
            container.appendChild(div);
        });
    }

    async playItem(item, typeOverride = null) {
        const type = typeOverride || this.currentView;
        
        let streamUrl = '';

        // Handle M3U channels
        if (this.config.type === 'm3u' && item.stream_url) {
            streamUrl = item.stream_url;
        } else {
            // Xtream Codes
            const id = item.stream_id || item.id;
            if (type === 'live') {
                streamUrl = `${this.config.url}/live/${this.config.user}/${this.config.pass}/${id}.m3u8`;
            } else if (type === 'movie') {
                streamUrl = `${this.config.url}/movie/${this.config.user}/${this.config.pass}/${id}.${item.container_extension || 'mp4'}`;
            } else if (type === 'series') {
                streamUrl = `${this.config.url}/series/${this.config.user}/${this.config.pass}/${id}.${item.container_extension || 'mp4'}`;
            }
        }

        console.log('Playing stream with PlayTorrio Player:', streamUrl);

        // Use PlayTorrioPlayer for all IPTV streams
        try {
            const response = await fetch('/api/playtorrioplayer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: streamUrl,
                    tmdbId: null,
                    imdbId: null,
                    seasonNum: null,
                    episodeNum: null,
                    mediaType: type === 'live' ? 'live' : (type === 'movie' ? 'movie' : 'tv'),
                    stopOnClose: false
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('[IPTV] PlayTorrio player opened successfully');
                // Don't show player view since external player is used
                return;
            } else {
                console.error('[IPTV] PlayTorrio player failed:', result.error);
                alert('Failed to open PlayTorrio player. Make sure it is installed.');
            }
        } catch (error) {
            console.error('[IPTV] PlayTorrio player error:', error);
            alert('Failed to open PlayTorrio player. Error: ' + error.message);
        }
    }

    closePlayer() {
        // Player is external, no cleanup needed
        document.getElementById('player-view').classList.add('hidden');
    }

    showView(view) {
        document.getElementById('home-view').classList.add('hidden');
        document.getElementById('listing-view').classList.add('hidden');
        document.getElementById('series-view').classList.add('hidden');
        
        if (view === 'home') {
            document.getElementById('home-view').classList.remove('hidden');
        } else if (view === 'listing') {
            document.getElementById('listing-view').classList.remove('hidden');
        } else if (view === 'series-detail') {
            document.getElementById('series-view').classList.remove('hidden');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.iptvManager = new IPTVManager();
});

// Basic Mode Jackett Logic - Synchronized with Main App

import { filterTorrents } from './torrent_filter.js';

// Base URL for main application API
const API_BASE = '/api';

export const getJackettKey = async () => {
    try {
        const response = await fetch(`${API_BASE}/get-api-key`);
        const data = await response.json();
        return data.apiKey || '';
    } catch (e) {
        console.error("Failed to fetch Jackett key from server", e);
        return localStorage.getItem('jackett_api_key') || '';
    }
};

export const setJackettKey = async (key) => {
    try {
        const response = await fetch(`${API_BASE}/set-api-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: key })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('jackett_api_key', key);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Failed to save Jackett key to server", e);
        localStorage.setItem('jackett_api_key', key);
        return true;
    }
};

export const getJackettSettings = async () => {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error("Failed to fetch settings from server", e);
    }
    return {};
};

const fetchFromJackett = async (query) => {
    const apiKey = await getJackettKey();
    const settings = await getJackettSettings();
    const jackettUrl = settings.jackettUrl || 'http://127.0.0.1:9117/api/v2.0/indexers/all/results/torznab';
    
    if (!apiKey) return [];

    // Use the proxy we added to server.mjs, passing the custom Jackett URL
    const url = new URL(`${window.location.origin}/api/jackett`);
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('t', 'search');
    url.searchParams.append('q', query);
    url.searchParams.append('jackettUrl', jackettUrl);
    
    console.log(`[Jackett] Searching with URL: ${jackettUrl}`);
    
    try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Jackett API Error: ${response.status}`);
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        return Array.from(xmlDoc.querySelectorAll('item')).map(item => {
            const torznabAttrs = {};
            const attrs = item.getElementsByTagName('torznab:attr');
            for (let i = 0; i < attrs.length; i++) {
                const name = attrs[i].getAttribute('name');
                const value = attrs[i].getAttribute('value');
                if (name) torznabAttrs[name] = value;
            }

            if (Object.keys(torznabAttrs).length === 0) {
                item.querySelectorAll('attr').forEach(attr => {
                    torznabAttrs[attr.getAttribute('name')] = attr.getAttribute('value');
                });
            }

            const title = item.querySelector('title')?.textContent;
            let link = item.querySelector('link')?.textContent;
            let magnet = torznabAttrs['magneturl'] || null;

            if (!magnet && link && link.startsWith('magnet:')) {
                magnet = link;
            }

            return {
                Title: title,
                Guid: item.querySelector('guid')?.textContent,
                Link: link,
                Comments: item.querySelector('comments')?.textContent,
                PublishDate: item.querySelector('pubDate')?.textContent,
                Size: item.querySelector('size')?.textContent || item.querySelector('enclosure')?.getAttribute('length'),
                Description: item.querySelector('description')?.textContent,
                Category: item.querySelector('category')?.textContent,
                Tracker: item.querySelector('prowlarrindexer')?.textContent || item.querySelector('jackettindexer')?.textContent || 'Unknown',
                MagnetUri: magnet,
                Seeders: parseInt(torznabAttrs['seeders']) || 0,
                Peers: parseInt(torznabAttrs['peers']) || 0,
            };
        });
    } catch (error) {
        console.error('Jackett Fetch Failed:', error);
        // Throw a specific error so the UI can detect it
        throw new Error('JACKETT_CONNECTION_ERROR');
    }
};

export const searchJackett = async (queries, metadata = {}) => {
    const queryList = Array.isArray(queries) ? queries : [queries];
    const results = await Promise.all(queryList.map(q => fetchFromJackett(q)));
    
    const seen = new Set();
    const merged = [];
    
    results.flat().forEach(item => {
        const id = item.Guid || item.MagnetUri || item.Link;
        if (id && !seen.has(id)) {
            seen.add(id);
            merged.push(item);
        }
    });

    return filterTorrents(merged, metadata);
};
// Live TV Functionality

// Show Live TV Page
function showLiveTvPage() {
    hideAllSections();
    
    // Check if Live TV section exists, if not create it
    let liveTvSection = document.getElementById('liveTvSection');
    if (!liveTvSection) {
        createLiveTvSection();
        liveTvSection = document.getElementById('liveTvSection');
    }
    
    // Always show the section
    if (liveTvSection) {
        liveTvSection.style.setProperty('display', 'block', 'important');
    }
}

// Create Live TV Section Structure
function createLiveTvSection() {
    const mainContent = document.getElementById('mainContent');
    const section = document.createElement('div');
    section.id = 'liveTvSection';
    section.className = 'livetv-section';
    section.innerHTML = `
        <div class="livetv-container">
            <iframe 
                id="liveTvIframe" 
                src="https://iptvplaytorrio.pages.dev" 
                frameborder="0" 
                allowfullscreen
                allow="autoplay; fullscreen; picture-in-picture"
            ></iframe>
        </div>
    `;
    mainContent.appendChild(section);
}

// Manga Functionality
let currentMangaPage = 1;
let isLoadingManga = false;
let hasMoreManga = true;
let currentMangaSource = 'comix'; // 'comix' or 'weebcentral'
let currentMangaGenre = '';
let currentMangaQuery = '';

const MANGA_API_BASE = 'http://localhost:6987/api';

// Update showMangaPage to use initial load
function showMangaPage() {
    hideAllSections();

    let mangaSection = document.getElementById('mangaSection');
    if (!mangaSection) {
        createMangaSection();
        initialMangaLoad();
    } else {
        mangaSection.style.setProperty('display', 'block', 'important');
    }

    // Show Warning Modal if needed
    showMangaWarning();
}

// Manga Content Warning
function showMangaWarning() {
    if (localStorage.getItem('hideMangaWarning') === 'true') return;

    let warningModal = document.getElementById('mangaWarningModal');
    if (!warningModal) {
        warningModal = document.createElement('div');
        warningModal.id = 'mangaWarningModal';
        warningModal.className = 'warning-modal';
        warningModal.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⚠️</div>
                <h2>Content Advisory</h2>
                <p>This section contains titles that may include mature themes, explicit language, and 18+ content. By proceeding, you acknowledge that you are of legal age to view such material.</p>
                <div class="warning-actions">
                    <button class="warning-btn primary" id="dismissWarning">I Understand</button>
                    <button class="warning-btn secondary" id="neverShowWarning">Never Show This Again</button>
                </div>
            </div>
        `;
        document.body.appendChild(warningModal);

        document.getElementById('dismissWarning').addEventListener('click', () => {
            warningModal.classList.remove('active');
        });

        document.getElementById('neverShowWarning').addEventListener('click', () => {
            localStorage.setItem('hideMangaWarning', 'true');
            warningModal.classList.remove('active');
        });
    }

    warningModal.classList.add('active');
}

// Create Manga Section Structure
function createMangaSection() {
    const mainContent = document.getElementById('mainContent');
    const section = document.createElement('div');
    section.id = 'mangaSection';
    section.className = 'manga-section';
    section.innerHTML = `
        <div class="manga-header">
            <div class="manga-controls-top">
                <div class="manga-source-selector">
                    <button class="source-btn active" data-source="comix">Comix</button>
                    <button class="source-btn" data-source="weebcentral">WeebCentral</button>
                </div>
                <div class="search-container-comics">
                    <input type="text" id="mangaSearch" placeholder="Search manga...">
                    <button id="mangaSearchBtn">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    </button>
                </div>
                <button class="saved-comics-btn" id="mangaSavedBtn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                    Saved
                </button>
            </div>
            <div class="manga-controls-bottom">
                <div class="custom-dropdown" id="mangaGenreDropdown" style="display: block;">
                    <div class="custom-dropdown-selection" id="genreSelectionText">All Genres</div>
                    <div class="custom-dropdown-list" id="mangaGenreList">
                        <div class="custom-dropdown-item active" data-value="">All Genres</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="manga-grid" id="mangaGrid"></div>
        <div id="mangaSentinel" style="height: 20px; width: 100%;"></div>
        <div class="manga-loader" id="mangaLoader">
            <div class="spinner"></div>
        </div>
    `;
    mainContent.appendChild(section);

    // Custom Dropdown Logic
    const dropdown = document.getElementById('mangaGenreDropdown');
    const selectionText = document.getElementById('genreSelectionText');
    
    selectionText.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
    });

    // Setup Observer
    setupMangaInfiniteScroll();

    // Event Listeners for Sources
    section.querySelectorAll('.source-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            
            section.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentMangaSource = btn.dataset.source;
            document.getElementById('mangaGenreDropdown').style.display = currentMangaSource === 'comix' ? 'block' : 'none';
            
            resetMangaGrid();
            initialMangaLoad();
        });
    });

    // Search
    const searchInput = document.getElementById('mangaSearch');
    const searchBtn = document.getElementById('mangaSearchBtn');
    
    const triggerSearch = () => {
        currentMangaQuery = searchInput.value.trim();
        resetMangaGrid();
        initialMangaLoad();
    };

    searchBtn.addEventListener('click', triggerSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerSearch();
    });

    // Saved Button
    document.getElementById('mangaSavedBtn').addEventListener('click', () => {
        showSavedManga();
    });

    // Load Comix Genres initially
    loadComixGenres();
}

// Initial Multi-page Load
async function initialMangaLoad() {
    await loadManga(); // Page 1
    if (hasMoreManga && !currentMangaQuery) {
        await loadManga(); // Page 2
        await loadManga(); // Page 3
    }
}

// Setup Intersection Observer for infinite scroll
function setupMangaInfiniteScroll() {
    const sentinel = document.getElementById('mangaSentinel');
    if (!sentinel) return;
    
    const observer = new IntersectionObserver((entries) => {
        const mangaSection = document.getElementById('mangaSection');
        if (entries[0].isIntersecting && 
            !isLoadingManga && 
            hasMoreManga && 
            mangaSection && 
            window.getComputedStyle(mangaSection).display !== 'none') {
            loadManga();
        }
    }, {
        root: null,
        rootMargin: '500px',
        threshold: 0.1
    });
    
    observer.observe(sentinel);
}

function resetMangaGrid() {
    currentMangaPage = 1;
    hasMoreManga = true;
    document.getElementById('mangaGrid').innerHTML = '';
}

// Load Comix Genres
async function loadComixGenres() {
    try {
        const response = await fetch(`${MANGA_API_BASE}/comix/genres`);
        const data = await response.json();
        if (data.status === 'success') {
            const list = document.getElementById('mangaGenreList');
            const selectionText = document.getElementById('genreSelectionText');
            
            Object.entries(data.genres).forEach(([id, name]) => {
                const item = document.createElement('div');
                item.className = 'custom-dropdown-item';
                item.dataset.value = id;
                item.textContent = name;
                
                item.addEventListener('click', () => {
                    list.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    selectionText.textContent = name;
                    
                    currentMangaGenre = id;
                    resetMangaGrid();
                    initialMangaLoad();
                });
                
                list.appendChild(item);
            });

            const allGenresItem = list.querySelector('[data-value=""]');
            if (allGenresItem) {
                allGenresItem.addEventListener('click', () => {
                    list.querySelectorAll('.custom-dropdown-item').forEach(i => i.classList.remove('active'));
                    allGenresItem.classList.add('active');
                    selectionText.textContent = 'All Genres';
                    currentMangaGenre = '';
                    resetMangaGrid();
                    initialMangaLoad();
                });
            }
        }
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

// Load Manga Data
async function loadManga() {
    if (isLoadingManga || !hasMoreManga) return;
    
    isLoadingManga = true;
    document.getElementById('mangaLoader').style.display = 'flex';

    let url = '';
    
    if (currentMangaSource === 'comix') {
        if (currentMangaQuery) {
            url = `${MANGA_API_BASE}/comix/manga/search/${encodeURIComponent(currentMangaQuery)}?page=${currentMangaPage}`;
        } else if (currentMangaGenre) {
            url = `${MANGA_API_BASE}/comix/manga/genre/${currentMangaGenre}?page=${currentMangaPage}`;
        } else {
            url = `${MANGA_API_BASE}/comix/manga/all?page=${currentMangaPage}`;
        }
    } else { // WeebCentral
        if (currentMangaQuery) {
            url = `${MANGA_API_BASE}/manga/search?q=${encodeURIComponent(currentMangaQuery)}`;
            hasMoreManga = false; // WeebCentral search URL provided doesn't show page param
        } else {
            url = `${MANGA_API_BASE}/manga/all?page=${currentMangaPage}`;
        }
    }

    try {
        const response = await fetch(url);
        const res = await response.json();
        
        let results = [];
        results = res.data || [];

        if (results.length === 0) {
            hasMoreManga = false;
            if (currentMangaPage === 1) {
                document.getElementById('mangaGrid').innerHTML = '<p class="no-results">No manga found.</p>';
            }
        } else {
            renderMangaGrid(results);
            currentMangaPage++;
        }
    } catch (error) {
        console.error('Error loading manga:', error);
        if (currentMangaPage === 1) {
            document.getElementById('mangaGrid').innerHTML = '<p class="no-results">Error loading data.</p>';
        }
    } finally {
        isLoadingManga = false;
        document.getElementById('mangaLoader').style.display = 'none';
    }
}

// Render Grid
function renderMangaGrid(mangas, isSavedView = false) {
    const grid = document.getElementById('mangaGrid');
    
    mangas.forEach(manga => {
        const card = document.createElement('div');
        card.className = 'manga-card';
        
        // Use provider from manga if available (for saved items), else use current source
        const provider = manga.provider || currentMangaSource;
        const uniqueId = getMangaUniqueId(manga, provider);
        const isSaved = isMangaSaved(uniqueId);
        
        const posterUrl = `http://localhost:6987/comics-proxy?url=${encodeURIComponent(manga.poster)}`;

        card.innerHTML = `
            <div class="manga-poster">
                <img src="${posterUrl}" alt="${manga.name}" loading="lazy">
                <button class="manga-save-btn" style="position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.3s; ${isSaved ? 'background: #8b5cf6; color: #fff;' : 'background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.7);'}" title="${isSaved ? 'Remove from saved' : 'Save manga'}">
                    <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
            </div>
            <div class="manga-info">
                <h3 class="manga-title">${manga.name}</h3>
            </div>
        `;
        
        // Save button click
        const saveBtn = card.querySelector('.manga-save-btn');
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasAdded = toggleSaveManga(manga, provider);
            
            if (wasAdded) {
                saveBtn.style.background = '#8b5cf6';
                saveBtn.style.color = '#fff';
                saveBtn.title = 'Remove from saved';
            } else {
                saveBtn.style.background = 'rgba(0,0,0,0.6)';
                saveBtn.style.color = 'rgba(255,255,255,0.7)';
                saveBtn.title = 'Save manga';
                
                // If in saved view, remove the card
                if (isSavedView) {
                    card.remove();
                    if (grid.children.length === 0) {
                        grid.innerHTML = '<p class="no-results">No saved manga yet.</p>';
                    }
                }
            }
        });
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.manga-save-btn')) {
                openMangaModal(manga, provider);
            }
        });
        grid.appendChild(card);
    });
}

// Open Manga Modal
async function openMangaModal(mangaData, provider) {
    // Use provider from parameter or manga object or current source
    const actualProvider = provider || mangaData.provider || currentMangaSource;
    const uniqueId = getMangaUniqueId(mangaData, actualProvider);
    
    let modal = document.getElementById('mangaModal');
    if (!modal) {
        createMangaModal();
        modal = document.getElementById('mangaModal');
    }
    
    // Set Modal Content
    const posterUrl = `http://localhost:6987/comics-proxy?url=${encodeURIComponent(mangaData.poster)}`;
    document.getElementById('modalMangaPoster').src = posterUrl;
    document.getElementById('modalMangaTitle').textContent = mangaData.name;
    document.getElementById('modalMangaChaptersList').innerHTML = '<div class="spinner"></div>';
    
    const readFirstBtn = document.getElementById('mangaReadFirstBtn');
    const saveBtn = document.getElementById('mangaSaveBtn');
    
    // Clone to remove old listeners
    const newReadFirst = readFirstBtn.cloneNode(true);
    const newSave = saveBtn.cloneNode(true);
    readFirstBtn.parentNode.replaceChild(newReadFirst, readFirstBtn);
    saveBtn.parentNode.replaceChild(newSave, saveBtn);
    
    // Update save button text
    newSave.textContent = isMangaSaved(uniqueId) ? 'Saved ✓' : 'Save';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Fetch Chapters
    let chaptersUrl = '';
    if (actualProvider === 'comix') {
        chaptersUrl = `${MANGA_API_BASE}/comix/chapters/${mangaData.hash_id}`;
    } else {
        chaptersUrl = `${MANGA_API_BASE}/manga/chapters?seriesId=${mangaData.seriesId}&latestChapterId=${mangaData.latestChapterId}`;
    }

    try {
        const response = await fetch(chaptersUrl);
        const data = await response.json();
        
        if (data.status === 'success' || data.success) {
            const chapters = data.data || [];
            renderMangaChapters(chapters, mangaData, actualProvider);
            
            newReadFirst.addEventListener('click', () => {
                const first = chapters[chapters.length - 1];
                if (first) {
                    if (actualProvider === 'comix') {
                        openMangaReader(mangaData.hash_id, first.chapter_id, actualProvider);
                    } else {
                        openMangaReader(null, first.id, actualProvider);
                    }
                }
            });

            newSave.addEventListener('click', () => {
                const wasAdded = toggleSaveManga(mangaData, actualProvider);
                newSave.textContent = wasAdded ? 'Saved ✓' : 'Save';
            });
        }
    } catch (error) {
        console.error('Error loading chapters:', error);
    }
}

function createMangaModal() {
    const modal = document.createElement('div');
    modal.id = 'mangaModal';
    modal.className = 'comic-modal'; // Reuse styles
    modal.innerHTML = `
        <div class="comic-modal-content">
            <button class="comic-modal-close" id="closeMangaModal">×</button>
            <div class="comic-modal-header">
                <img id="modalMangaPoster" class="modal-poster" src="" alt="">
                <div class="modal-info">
                    <h2 id="modalMangaTitle"></h2>
                    <div class="modal-actions">
                        <button class="action-btn primary" id="mangaReadFirstBtn">Read First</button>
                        <button class="action-btn secondary" id="mangaSaveBtn">Save</button>
                    </div>
                </div>
            </div>
            <div class="chapters-container">
                <h3>Chapters</h3>
                <div class="chapters-list" id="modalMangaChaptersList"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeMangaModal').addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

function renderMangaChapters(chapters, mangaData, provider) {
    const list = document.getElementById('modalMangaChaptersList');
    list.innerHTML = '';
    
    chapters.forEach(chapter => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        
        const name = chapter.name || `Chapter ${chapter.number}`;
        const number = chapter.number || chapter.name.replace('Chapter ', '');

        item.innerHTML = `
            <span class="chapter-name">${name}</span>
            <span class="chapter-number">#${number}</span>
        `;
        
        item.addEventListener('click', () => {
            if (provider === 'comix') {
                openMangaReader(mangaData.hash_id, chapter.chapter_id, provider);
            } else {
                openMangaReader(null, chapter.id, provider);
            }
        });
        list.appendChild(item);
    });
}

// Reader
async function openMangaReader(mangaId, chapterId, provider) {
    const actualProvider = provider || currentMangaSource;
    
    let reader = document.getElementById('comicReader');
    if (!reader) {
        // We reuse the comics reader if possible, but let's ensure it exists
        // Since comics.js is already included, we might just use it
        // but for safety, if it's not there:
        createReader(); // from comics.js if available, else we'd need it here
        reader = document.getElementById('comicReader');
    }

    const pagesContainer = document.getElementById('readerPages');
    pagesContainer.innerHTML = '<div class="spinner-large" style="margin: auto;"></div>';
    reader.classList.add('active');
    
    const mangaModal = document.getElementById('mangaModal');
    if (mangaModal) mangaModal.classList.remove('active');
    
    document.body.style.overflow = 'hidden';

    let pagesUrl = '';
    if (actualProvider === 'comix') {
        pagesUrl = `${MANGA_API_BASE}/comix/manga/chapters/${mangaId}/${chapterId}`;
    } else {
        pagesUrl = `${MANGA_API_BASE}/chapter/pages?chapterId=${chapterId}`;
    }

    try {
        const response = await fetch(pagesUrl);
        const data = await response.json();
        
        if (data.status === 'success' || data.success) {
            renderMangaPages(data.pages);
        }
    } catch (error) {
        console.error('Error loading pages:', error);
    }
}

function renderMangaPages(pages) {
    const container = document.getElementById('readerPages');
    container.innerHTML = '';
    
    pages.forEach(pageUrl => {
        const img = document.createElement('img');
        // Manga pages are strings in the array, load them directly
        img.src = pageUrl;
        img.className = 'reader-page';
        img.loading = 'lazy';
        img.draggable = false; // Prevent default browser drag behavior
        container.appendChild(img);
    });
}

// Saved Manga Functions - Shared with basicmode
const SAVED_MANGA_KEY = 'pt_saved_manga_v1';

function getSavedManga() {
    try {
        return JSON.parse(localStorage.getItem(SAVED_MANGA_KEY) || '[]');
    } catch {
        return [];
    }
}

function setSavedManga(list) {
    localStorage.setItem(SAVED_MANGA_KEY, JSON.stringify(list));
}

function getMangaUniqueId(manga, source) {
    if (source === 'comix') {
        return `comix_${manga.hash_id || manga.manga_id || manga.id}`;
    } else {
        return `weeb_${manga.seriesId || manga.id}`;
    }
}

function isMangaSaved(uniqueId) {
    return getSavedManga().some(m => String(m.uniqueId) === String(uniqueId));
}

function toggleSaveManga(mangaData, source) {
    const uniqueId = getMangaUniqueId(mangaData, source || currentMangaSource);
    const list = getSavedManga();
    const idx = list.findIndex(m => String(m.uniqueId) === String(uniqueId));
    
    if (idx >= 0) {
        list.splice(idx, 1);
        setSavedManga(list);
        return false; // Removed
    } else {
        const mangaToSave = { 
            ...mangaData, 
            uniqueId,
            provider: source || currentMangaSource 
        };
        list.unshift(mangaToSave);
        setSavedManga(list);
        return true; // Added
    }
}

function showSavedManga() {
    resetMangaGrid();
    hasMoreManga = false;
    
    const saved = getSavedManga();
    
    if (saved.length === 0) {
        document.getElementById('mangaGrid').innerHTML = '<p class="no-results">No saved manga yet.</p>';
    } else {
        renderMangaGrid(saved, true); // true = is saved view
    }
}

// Music Module for Advanced Mode (Redesigned UI)
// Uses the SAME localStorage keys as the main app for shared playlists

// Show Music Page function for AdvancedMode
function showMusicPage() {
    hideAllSections();
    
    let musicSection = document.getElementById('musicSection');
    if (!musicSection) {
        createMusicHTML();
        initMusic();
    } else {
        musicSection.style.setProperty('display', 'block', 'important');
    }
}

// Create Music HTML structure
function createMusicHTML() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // New Glassmorphism Design Structure
    const musicHTML = `
    <div id="musicSection" class="relative z-[70] min-h-screen pb-20 music-main-container">
        <!-- Header Section -->
        <div class="sticky top-0 z-50 glass-panel border-b-0 rounded-b-2xl mx-4 mt-2 px-6 py-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <!-- Title & Brand -->
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    </div>
                    <h2 class="text-3xl font-bold text-white tracking-tight">Music</h2>
                </div>

                <!-- Search Bar -->
                <div class="flex-1 max-w-2xl w-full mx-auto relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <input type="text" id="music-search-input" placeholder="Search for songs, artists, or albums..." 
                        style="background-color: #121212; color: #ffffff;"
                        class="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none placeholder-gray-500 text-sm font-medium shadow-lg">
                    <button id="music-search-btn" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div class="p-1.5 rounded-lg bg-gray-800/50 hover:bg-pink-600/20 text-gray-400 hover:text-pink-400 transition-colors cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </div>
                    </button>
                </div>

                <!-- Navigation Tabs -->
                <div class="flex items-center gap-2 bg-gray-900/40 p-1.5 rounded-xl border border-white/5">
                    <button id="music-my-btn" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span>Liked</span>
                    </button>
                    <button id="music-my-albums-btn" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                        <span>Albums</span>
                    </button>
                    <button id="music-playlists-btn" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                        <span>Playlists</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 max-w-[1600px] mx-auto">
            
            <!-- Loading State -->
            <div id="music-loading" class="hidden flex flex-col items-center justify-center py-32 animate-in">
                <div class="relative w-20 h-20">
                    <div class="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                    <div class="absolute inset-0 rounded-full border-4 border-t-pink-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
                </div>
                <p class="mt-4 text-gray-400 font-medium tracking-wide">Searching the universe...</p>
            </div>

            <!-- Empty State -->
            <div id="music-empty" class="flex flex-col items-center justify-center text-center py-32 animate-in">
                <div class="w-32 h-32 rounded-full bg-gradient-to-tr from-gray-800 to-gray-900 flex items-center justify-center shadow-2xl mb-8 border border-white/5 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-pink-500/10 blur-xl group-hover:bg-pink-500/20 transition-all duration-500"></div>
                    <svg class="w-16 h-16 text-gray-500 group-hover:text-pink-400 transition-colors duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                    </svg>
                </div>
                <h3 class="text-3xl font-bold text-white mb-3">Discover Music</h3>
                <p class="text-gray-400 max-w-md mx-auto text-lg">Search for your favorite songs, artists, and albums to start your journey.</p>
            </div>

            <!-- Search Results -->
            <div id="music-results" class="hidden animate-in">
                <div class="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
                    <div>
                        <h3 id="music-results-title" class="text-2xl font-bold text-white">Search Results</h3>
                        <p id="music-results-count" class="text-gray-400 text-sm mt-1">0 found</p>
                    </div>
                </div>
                <div id="music-results-grid" class="music-grid"></div>
            </div>

            <!-- My Music (Liked Songs) -->
            <div id="my-music-section" class="hidden animate-in">
                <div class="flex items-center justify-between mb-8 glass-panel p-6 rounded-2xl">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center shadow-lg">
                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                        <div>
                            <h3 class="text-3xl font-bold text-white">Liked Songs</h3>
                            <p class="text-gray-400 text-sm mt-1">Your personal collection</p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button id="my-music-play-all" class="music-btn-primary px-6 py-2.5 rounded-full text-white font-medium flex items-center gap-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Play All
                        </button>
                        <button id="my-music-shuffle" class="music-btn-secondary px-6 py-2.5 rounded-full text-white font-medium flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Shuffle
                        </button>
                    </div>
                </div>
                <div id="my-music-grid" class="music-grid"></div>
                <div id="my-music-empty" class="hidden text-center py-20">
                    <p class="text-xl text-gray-400">No liked songs yet. Go explore!</p>
                </div>
            </div>

            <!-- Playlists Section -->
            <div id="playlists-section" class="hidden animate-in">
                <div class="flex items-center justify-between mb-8 glass-panel p-6 rounded-2xl">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                        </div>
                        <div>
                            <h3 class="text-3xl font-bold text-white">Playlists</h3>
                            <p class="text-gray-400 text-sm mt-1">Your curated mixes</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <input id="new-playlist-name" type="text" placeholder="New Playlist..." class="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 w-48">
                        <button id="create-playlist-btn" class="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                </div>
                <div id="playlists-grid" class="music-grid"></div>
                <div id="playlists-empty" class="hidden text-center py-20">
                    <p class="text-xl text-gray-400">Create your first playlist above.</p>
                </div>
            </div>

            <!-- Playlist Detail View -->
            <div id="playlist-view" class="hidden animate-in">
                <div class="glass-panel p-6 rounded-2xl mb-8">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-6">
                            <button id="playlist-back-btn" class="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <div>
                                <h3 id="playlist-view-title" class="text-3xl font-bold text-white">Playlist Name</h3>
                                <p class="text-gray-400 text-sm mt-1">Custom Playlist</p>
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <button id="playlist-play-all" class="music-btn-primary px-6 py-2 rounded-full text-white text-sm font-medium">Play All</button>
                            <button id="playlist-shuffle" class="music-btn-secondary px-6 py-2 rounded-full text-white text-sm font-medium">Shuffle</button>
                            <button id="playlist-delete-btn" class="px-6 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
                <div id="playlist-tracks-grid" class="music-grid"></div>
                <div id="playlist-empty" class="hidden text-center py-20">
                    <p class="text-xl text-gray-400">This playlist is empty.</p>
                </div>
            </div>

            <!-- Album Detail View -->
            <div id="album-view" class="hidden animate-in">
                <div class="glass-panel p-8 rounded-3xl mb-8 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-0"></div>
                    <div class="relative z-10 flex flex-col md:flex-row gap-8 items-end">
                        <img id="album-view-cover" src="" alt="Album" class="w-52 h-52 rounded-2xl shadow-2xl object-cover bg-gray-800">
                        <div class="flex-1 mb-2">
                            <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 inline-block">Album</span>
                            <h3 id="album-view-title" class="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight"></h3>
                            <p id="album-view-artist" class="text-xl text-gray-300 mb-6"></p>
                            
                            <div class="flex items-center gap-4">
                                <button id="album-play-all" class="music-btn-primary w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform">
                                    <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </button>
                                <button id="album-shuffle" class="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                </button>
                                <button id="album-save-btn" class="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                    Save
                                </button>
                            </div>
                        </div>
                        <button id="album-back-btn" class="absolute top-0 right-0 p-3 text-gray-400 hover:text-white transition-colors">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
                <div class="glass-panel rounded-2xl overflow-hidden p-2">
                    <div id="album-tracks-grid" class="flex flex-col gap-1"></div>
                </div>
            </div>

            <!-- My Albums Section -->
            <div id="my-albums-section" class="hidden animate-in">
                <div class="flex items-center justify-between mb-8 glass-panel p-6 rounded-2xl">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                        </div>
                        <div>
                            <h3 class="text-3xl font-bold text-white">Saved Albums</h3>
                            <p class="text-gray-400 text-sm mt-1">Full collections you love</p>
                        </div>
                    </div>
                </div>
                <div id="my-albums-grid" class="music-grid"></div>
                <div id="my-albums-empty" class="hidden text-center py-20">
                    <p class="text-xl text-gray-400">No saved albums yet.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Redesigned Full Screen Player Modal -->
    <div id="music-player-modal" class="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-2xl hidden p-4 sm:p-8">
        <div class="w-full max-w-6xl h-full max-h-[800px] flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center relative">
            
            <button id="music-player-close" class="absolute top-0 right-0 p-4 text-gray-400 hover:text-white transition-colors z-50">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <button id="music-player-minimize" class="absolute top-0 right-14 p-4 text-gray-400 hover:text-white transition-colors z-50">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>

            <!-- Cover Art Section -->
            <div class="flex-1 flex justify-center items-center w-full max-w-md md:max-w-xl aspect-square relative group">
                <div class="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full animate-pulse"></div>
                <img id="music-player-cover" src="" alt="Album Cover" class="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10 relative z-10">
            </div>

            <!-- Controls Section -->
            <div class="flex-1 w-full max-w-md flex flex-col justify-center gap-8">
                <div class="text-center md:text-left">
                    <h2 id="music-player-title" class="text-4xl font-bold text-white mb-2 leading-tight"></h2>
                    <p id="music-player-artist" class="text-xl text-pink-400 font-medium"></p>
                </div>

                <!-- Progress -->
                <div class="w-full space-y-2">
                    <div id="music-progress-bar" class="slider-container h-2 bg-gray-800 rounded-full cursor-pointer relative group">
                        <div id="music-progress-fill" class="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full relative">
                            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100"></div>
                        </div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-400 font-medium font-mono">
                        <span id="music-current-time">0:00</span>
                        <span id="music-total-time">0:00</span>
                    </div>
                </div>

                <!-- Main Buttons -->
                <div class="flex items-center justify-center md:justify-start gap-8">
                    <button id="music-prev-btn" class="text-gray-400 hover:text-white transition-colors transform hover:scale-110">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button id="music-play-pause-btn" class="w-20 h-20 rounded-full bg-white text-black hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center">
                        <svg id="music-play-icon" class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <svg id="music-pause-icon" class="w-8 h-8 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                    <button id="music-next-btn" class="text-gray-400 hover:text-white transition-colors transform hover:scale-110">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                </div>

                <!-- Volume -->
                <div class="flex items-center gap-4 mt-4">
                    <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                    <div id="music-volume-bar" class="slider-container flex-1 h-1.5 bg-gray-800 rounded-full cursor-pointer">
                        <div id="music-volume-fill" class="h-full bg-gray-400 rounded-full" style="width: 100%"></div>
                    </div>
                </div>
            </div>
            
            <audio id="music-audio" preload="auto"></audio>
        </div>
    </div>

    <!-- Mini Player (Bottom Right Float) -->
    <div id="music-mini-player" class="fixed bottom-6 right-6 z-[600] glass-card w-80 rounded-2xl p-4 shadow-2xl hidden border-t border-white/10 flex flex-col gap-3">
        <div class="flex items-center gap-4">
            <!-- Cover Art with Expand Trigger -->
            <div class="relative group cursor-pointer flex-shrink-0" id="mini-player-expand-img">
                <img id="mini-player-cover" src="" alt="" class="w-14 h-14 rounded-xl object-cover bg-gray-800 shadow-md">
                <div class="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                </div>
            </div>
            
            <!-- Text Info (Click to Expand) -->
            <div class="flex-1 min-w-0 cursor-pointer group" id="mini-player-expand-text">
                <p id="mini-player-title" class="text-sm font-bold text-white truncate group-hover:text-pink-400 transition-colors"></p>
                <p id="mini-player-artist" class="text-xs text-pink-400 truncate"></p>
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-2">
                 <button id="mini-play-pause-btn" class="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                    <svg id="mini-play-icon" class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <svg id="mini-pause-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <!-- Explicit Expand Button -->
                <button id="mini-player-maximize-btn" class="text-gray-400 hover:text-white transition-colors p-1" title="Maximize">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                </button>
            </div>
        </div>
        <div id="mini-progress-bar" class="h-1 bg-gray-700 rounded-full cursor-pointer relative overflow-hidden">
            <div id="mini-progress-fill" class="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style="width: 0%"></div>
        </div>
    </div>

    <!-- Playlist Chooser Modal -->
    <div id="music-playlist-chooser" class="fixed inset-0 z-[550] flex items-center justify-center bg-black/80 backdrop-blur-sm hidden p-4">
        <div class="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-white/10">
            <div class="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <h3 class="text-xl font-bold text-white">Add to Playlist</h3>
                <button id="playlist-chooser-close" class="text-gray-400 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="space-y-4">
                <div class="flex gap-2">
                    <input id="chooser-new-playlist" type="text" placeholder="Create new playlist..." class="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                    <button id="chooser-create-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Create</button>
                </div>
                <div id="playlist-chooser-list" class="space-y-2 max-h-60 overflow-y-auto music-scroll pr-1"></div>
                <div id="playlist-chooser-empty" class="hidden text-center text-gray-500 py-4 text-sm">
                    No playlists found.
                </div>
            </div>
        </div>
    </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', musicHTML);
}

// Storage keys - MUST match main app for cross-compatibility
const MY_MUSIC_KEY = 'pt_my_music_v1';
const PLAYLISTS_KEY = 'pt_playlists_v1';
const MY_ALBUMS_KEY = 'pt_my_albums_v1';

// State
let currentView = 'empty'; // 'empty', 'results', 'my-music', 'playlists', 'playlist-view', 'album-view', 'my-albums'
let currentPlaylistId = null;
let currentAlbumData = null;
let currentAlbumTracks = [];
let musicQueue = [];
let currentQueueIndex = 0;
let isPlaying = false;

// Storage helpers - same as main app
function getMyMusic() {
    try { return JSON.parse(localStorage.getItem(MY_MUSIC_KEY) || '[]'); } catch(_) { return []; }
}

function setMyMusic(arr) {
    try { localStorage.setItem(MY_MUSIC_KEY, JSON.stringify(arr)); } catch(_) {}
}

function getPlaylists() {
    try { return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || '[]'); } catch(_) { return []; }
}

function setPlaylists(arr) {
    try { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(arr)); } catch(_) {}
}

function getMyAlbums() {
    try { return JSON.parse(localStorage.getItem(MY_ALBUMS_KEY) || '[]'); } catch(_) { return []; }
}

function setMyAlbums(arr) {
    try { localStorage.setItem(MY_ALBUMS_KEY, JSON.stringify(arr)); } catch(_) {}
}

function addTrackToPlaylist(playlistId, track) {
    const pls = getPlaylists();
    const pl = pls.find(p => p.id === playlistId);
    if (!pl) return false;
    if (!pl.tracks) pl.tracks = [];
    if (!pl.tracks.find(t => t.id === track.id)) {
        pl.tracks.push(track);
        setPlaylists(pls);
        return true;
    }
    return false;
}

// DOM Elements
let musicSection, musicLoading, musicEmpty, musicResults, musicResultsGrid;
let myMusicSection, myMusicGrid, myMusicEmpty;
let playlistsSection, playlistsGrid, playlistsEmpty;
let playlistView, playlistTracksGrid, playlistEmpty, playlistViewTitle;
let musicSearchInput, musicSearchBtn;
let musicPlayerModal, musicMiniPlayer, musicAudio;
let playlistChooser, playlistChooserList;

// Initialize DOM references
function initDOMRefs() {
    musicSection = document.getElementById('musicSection');
    musicLoading = document.getElementById('music-loading');
    musicEmpty = document.getElementById('music-empty');
    musicResults = document.getElementById('music-results');
    musicResultsGrid = document.getElementById('music-results-grid');
    myMusicSection = document.getElementById('my-music-section');
    myMusicGrid = document.getElementById('my-music-grid');
    myMusicEmpty = document.getElementById('my-music-empty');
    playlistsSection = document.getElementById('playlists-section');
    playlistsGrid = document.getElementById('playlists-grid');
    playlistsEmpty = document.getElementById('playlists-empty');
    playlistView = document.getElementById('playlist-view');
    playlistTracksGrid = document.getElementById('playlist-tracks-grid');
    playlistEmpty = document.getElementById('playlist-empty');
    playlistViewTitle = document.getElementById('playlist-view-title');
    musicSearchInput = document.getElementById('music-search-input');
    musicSearchBtn = document.getElementById('music-search-btn');
    musicPlayerModal = document.getElementById('music-player-modal');
    musicMiniPlayer = document.getElementById('music-mini-player');
    musicAudio = document.getElementById('music-audio');
    playlistChooser = document.getElementById('music-playlist-chooser');
    playlistChooserList = document.getElementById('playlist-chooser-list');
}

// Show notification
function showNotification(message, type = 'info') {
    // Prevent infinite recursion
    if (window._showingNotification) {
        console.log(`[${type}] ${message}`);
        return;
    }
    
    // Use existing notification system if available (but not ourselves)
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}

// Hide all sub-sections
function hideAllSubSections() {
    if (musicEmpty) musicEmpty.classList.add('hidden');
    if (musicResults) musicResults.classList.add('hidden');
    if (myMusicSection) myMusicSection.classList.add('hidden');
    if (playlistsSection) playlistsSection.classList.add('hidden');
    if (playlistView) playlistView.classList.add('hidden');
    if (musicLoading) musicLoading.classList.add('hidden');
    
    const albumView = document.getElementById('album-view');
    const myAlbumsSection = document.getElementById('my-albums-section');
    if (albumView) albumView.classList.add('hidden');
    if (myAlbumsSection) myAlbumsSection.classList.add('hidden');
}

// Show a specific view
function showView(view) {
    hideAllSubSections();
    currentView = view;
    
    switch(view) {
        case 'empty':
            if (musicEmpty) musicEmpty.classList.remove('hidden');
            break;
        case 'results':
            if (musicResults) musicResults.classList.remove('hidden');
            break;
        case 'my-music':
            if (myMusicSection) myMusicSection.classList.remove('hidden');
            renderMyMusic();
            break;
        case 'playlists':
            if (playlistsSection) playlistsSection.classList.remove('hidden');
            renderPlaylists();
            break;
        case 'playlist-view':
            if (playlistView) playlistView.classList.remove('hidden');
            break;
        case 'album-view':
            const albumView = document.getElementById('album-view');
            if (albumView) albumView.classList.remove('hidden');
            break;
        case 'my-albums':
            const myAlbumsSection = document.getElementById('my-albums-section');
            if (myAlbumsSection) myAlbumsSection.classList.remove('hidden');
            renderMyAlbums();
            break;
        case 'loading':
            if (musicLoading) musicLoading.classList.remove('hidden');
            break;
    }
}

// Search music via API (same as main app)
async function searchMusic(query) {
    if (!query.trim()) return;
    
    showView('loading');
    
    try {
        const [tracksRes, albumsRes] = await Promise.all([
            fetch(`/api/search?q=${encodeURIComponent(query)}&type=track&limit=30`),
            fetch(`/api/search?q=${encodeURIComponent(query)}&type=album&limit=20`)
        ]);
        
        let tracks = [];
        let albums = [];
        
        if (tracksRes.ok) {
            const tracksData = await tracksRes.json();
            const items = Array.isArray(tracksData?.results) ? tracksData.results : [];
            tracks = items.map(it => ({
                id: it.id,
                title: it.title || it.name || 'Unknown Title',
                artist: it.artists || 'Unknown Artist',
                cover: it.albumArt || ''
            }));
        }
        
        if (albumsRes.ok) {
            const albumsData = await albumsRes.json();
            const items = Array.isArray(albumsData?.results) ? albumsData.results : [];
            albums = items.map(it => ({
                id: it.id,
                name: it.title || it.name || 'Unknown Album',
                artist: it.artists || 'Unknown Artist',
                cover: it.albumArt || '',
                totalTracks: it.totalTracks || 0,
                releaseDate: it.releaseDate || ''
            }));
        }
        
        renderSearchResults(tracks, albums, query);
        showView('results');
    } catch (err) {
        console.error('Music search error:', err);
        showNotification('Failed to search music', 'error');
        showView('empty');
    }
}

// Render search results
function renderSearchResults(tracks, albums = [], query = '') {
    if (!musicResultsGrid) return;
    
    const resultsTitle = document.getElementById('music-results-title');
    const resultsCount = document.getElementById('music-results-count');
    
    if (resultsTitle) resultsTitle.textContent = query ? `Results for "${query}"` : 'Search Results';
    if (resultsCount) resultsCount.textContent = `${tracks.length} songs, ${albums.length} albums`;
    
    musicResultsGrid.innerHTML = '';
    
    // Tracks Header
    if (tracks.length > 0) {
        const tracksHeader = document.createElement('div');
        tracksHeader.className = 'col-span-full mb-4 mt-2 flex items-center gap-3 pb-2 border-b border-white/5';
        tracksHeader.innerHTML = `
            <div class="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
            </div>
            <h4 class="text-xl font-semibold text-white">Songs</h4>
        `;
        musicResultsGrid.appendChild(tracksHeader);
        
        tracks.forEach(track => {
            const card = createTrackCard(track);
            musicResultsGrid.appendChild(card);
        });
    }
    
    // Albums Header
    if (albums.length > 0) {
        const albumsHeader = document.createElement('div');
        albumsHeader.className = 'col-span-full mb-4 mt-8 flex items-center gap-3 pb-2 border-b border-white/5';
        albumsHeader.innerHTML = `
             <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
            </div>
            <h4 class="text-xl font-semibold text-white">Albums</h4>
        `;
        musicResultsGrid.appendChild(albumsHeader);
        
        albums.forEach(album => {
            const card = createAlbumCard(album);
            musicResultsGrid.appendChild(card);
        });
    }
    
    if (albums.length === 0 && tracks.length === 0) {
        musicResultsGrid.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-20 flex flex-col items-center">
                <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <p class="text-xl">No results found</p>
                <p class="text-sm mt-2">Try checking your spelling or use different keywords.</p>
            </div>
        `;
    }
}

// Create a track card element (New Glass Style)
function createTrackCard(track) {
    const isSaved = getMyMusic().some(t => t.id === track.id);
    
    const card = document.createElement('div');
    card.className = 'glass-card rounded-2xl p-3 relative group';
    
    const coverUrl = track.cover || track.album?.images?.[0]?.url || 'https://via.placeholder.com/200x200/1a1a2e/ec4899?text=♪';
    const title = track.title || track.name || 'Unknown';
    const artist = track.artist || track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
    
    card.innerHTML = `
        <div class="relative aspect-square rounded-xl overflow-hidden mb-3">
            <img src="${coverUrl}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <button class="play-btn w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg" data-id="${track.id}" data-title="${title.replace(/"/g, '&quot;')}" data-artist="${artist.replace(/"/g, '&quot;')}" data-cover="${coverUrl}">
                    <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
            </div>
        </div>
        <div>
            <p class="text-sm font-bold text-white truncate leading-tight mb-1" title="${title}">${title}</p>
            <p class="text-xs text-gray-400 truncate hover:text-gray-300 transition-colors">${artist}</p>
            
            <div class="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <button class="heart-btn w-8 h-8 rounded-full ${isSaved ? 'bg-pink-600 text-white' : 'bg-black/60 text-white hover:bg-pink-600'} backdrop-blur-md flex items-center justify-center transition-colors shadow-lg" data-id="${track.id}" data-title="${title.replace(/"/g, '&quot;')}" data-artist="${artist.replace(/"/g, '&quot;')}" data-cover="${coverUrl}">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <button class="add-playlist-btn w-8 h-8 rounded-full bg-black/60 text-white hover:bg-blue-600 backdrop-blur-md flex items-center justify-center transition-colors shadow-lg" data-id="${track.id}" data-title="${title.replace(/"/g, '&quot;')}" data-artist="${artist.replace(/"/g, '&quot;')}" data-cover="${coverUrl}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </button>
            </div>
        </div>
    `;
    
    // Event listeners
    card.querySelector('.play-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        playTrack({
            id: btn.dataset.id,
            title: btn.dataset.title,
            artist: btn.dataset.artist,
            cover: btn.dataset.cover
        });
    });
    
    card.querySelector('.heart-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        toggleSaveTrack({
            id: btn.dataset.id,
            title: btn.dataset.title,
            artist: btn.dataset.artist,
            cover: btn.dataset.cover
        }, btn);
    });
    
    card.querySelector('.add-playlist-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        openPlaylistChooser({
            id: btn.dataset.id,
            title: btn.dataset.title,
            artist: btn.dataset.artist,
            cover: btn.dataset.cover
        });
    });
    
    return card;
}

// Create an album card element (New Glass Style)
function createAlbumCard(album) {
    const isSaved = getMyAlbums().some(a => String(a.id) === String(album.id));
    
    const card = document.createElement('div');
    card.className = 'glass-card rounded-2xl p-3 relative group cursor-pointer';
    
    const coverUrl = album.cover || album.albumArt || 'https://via.placeholder.com/200x200/1a1a2e/3b82f6?text=♪';
    const name = album.name || album.title || 'Unknown Album';
    const artist = album.artist || album.artists || 'Unknown Artist';
    
    card.innerHTML = `
        <div class="relative aspect-square rounded-xl overflow-hidden mb-3">
            <img src="${coverUrl}" alt="${name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <button class="open-album-btn w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                    <svg class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
            </div>
            <div class="absolute top-2 left-2">
                <span class="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">Album</span>
            </div>
        </div>
        <div>
            <p class="text-sm font-bold text-white truncate leading-tight mb-1">${name}</p>
            <p class="text-xs text-gray-400 truncate">${artist}</p>
            
             <button class="album-heart-btn absolute top-5 right-5 w-8 h-8 rounded-full ${isSaved ? 'bg-blue-600 text-white' : 'bg-black/60 text-white hover:bg-blue-600'} backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg" data-id="${album.id}">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
        </div>
    `;
    
    const normalizedAlbum = {
        id: album.id,
        name: name,
        artist: artist,
        cover: coverUrl,
        totalTracks: album.totalTracks,
        releaseDate: album.releaseDate || ''
    };
    
    // Open album on click
    card.querySelector('.open-album-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openAlbum(normalizedAlbum);
    });
    
    card.addEventListener('click', () => openAlbum(normalizedAlbum));
    
    // Save album
    card.querySelector('.album-heart-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSaveAlbum(normalizedAlbum, e.currentTarget);
    });
    
    return card;
}

// Toggle save album
function toggleSaveAlbum(album, btn) {
    const saved = getMyAlbums();
    const exists = saved.find(a => String(a.id) === String(album.id));
    
    if (exists) {
        const filtered = saved.filter(a => String(a.id) !== String(album.id));
        setMyAlbums(filtered);
        
        // Update button visual state if it's the main save button (has text)
        if (btn.id === 'album-save-btn') {
            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg> Save`;
            btn.classList.add('bg-white/10', 'hover:bg-white/20');
            btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
        } else {
            // It's a card button (icon only)
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-black/60', 'text-white', 'hover:bg-blue-600');
        }
        
        showNotification('Removed from Saved Albums', 'info');
        
        if (currentView === 'my-albums') renderMyAlbums();
    } else {
        saved.push(album);
        setMyAlbums(saved);
        
        if (btn.id === 'album-save-btn') {
            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Saved`;
            btn.classList.remove('bg-white/10', 'hover:bg-white/20');
            btn.classList.add('bg-blue-600', 'hover:bg-blue-500');
        } else {
            btn.classList.add('bg-blue-600', 'text-white');
            btn.classList.remove('bg-black/60', 'hover:bg-blue-600');
        }
        
        showNotification(`Added "${album.name}" to Saved Albums`, 'success');
    }
}

// Open album
async function openAlbum(album) {
    currentAlbumData = album;
    currentAlbumTracks = [];
    
    showView('album-view');
    
    const albumViewTitle = document.getElementById('album-view-title');
    const albumViewArtist = document.getElementById('album-view-artist');
    const albumViewCover = document.getElementById('album-view-cover');
    const albumTracksGrid = document.getElementById('album-tracks-grid');
    
    if (albumViewTitle) albumViewTitle.textContent = album.name || 'Album';
    if (albumViewArtist) albumViewArtist.textContent = album.artist || 'Unknown Artist';
    if (albumViewCover) albumViewCover.src = album.cover || 'https://via.placeholder.com/200x200/1a1a2e/3b82f6?text=♪';
    if (albumTracksGrid) albumTracksGrid.innerHTML = '<div class="text-center py-20 flex flex-col items-center"><div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-gray-400">Loading tracks...</p></div>';
    
    try {
        const res = await fetch(`/api/album/${encodeURIComponent(album.id)}/tracks`);
        if (!res.ok) throw new Error('Failed to load album');
        const data = await res.json();
        
        const tracks = Array.isArray(data.tracks) ? data.tracks : [];
        const albumMeta = data.album || {};
        
        if (albumMeta.name && albumViewTitle) albumViewTitle.textContent = albumMeta.name;
        if (albumMeta.artists && albumViewArtist) albumViewArtist.textContent = albumMeta.artists;
        if (albumMeta.albumArt && albumViewCover) albumViewCover.src = albumMeta.albumArt;
        
        // Update Save Button State
        const savedAlbums = getMyAlbums();
        const isSaved = savedAlbums.some(a => String(a.id) === String(album.id));
        const saveBtn = document.getElementById('album-save-btn');
        if (saveBtn) {
            if (isSaved) {
                saveBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Saved`;
                saveBtn.classList.remove('bg-white/10', 'hover:bg-white/20');
                saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-500');
            } else {
                saveBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg> Save`;
                saveBtn.classList.add('bg-white/10', 'hover:bg-white/20');
                saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
            }
        }

        currentAlbumTracks = tracks.map((t, idx) => ({
            id: t.id || idx + 1,
            title: t.title || t.name || `Track ${idx + 1}`,
            artist: t.artists || albumMeta.artists || album.artist || 'Unknown Artist',
            cover: albumMeta.albumArt || album.cover || ''
        }));
        
        renderAlbumTracks(tracks, albumMeta.albumArt || album.cover, albumMeta.artists || album.artist);
    } catch (err) {
        console.error('Failed to load album:', err);
        if (albumTracksGrid) albumTracksGrid.innerHTML = '<div class="text-center text-red-400 py-20">Failed to load album tracks</div>';
    }
}

// Render album tracks (List Style)
function renderAlbumTracks(tracks, coverUrl, artistName) {
    const albumTracksGrid = document.getElementById('album-tracks-grid');
    if (!albumTracksGrid) return;
    
    if (tracks.length === 0) {
        albumTracksGrid.innerHTML = '<div class="text-center text-gray-400 py-20 font-light">No tracks found in this album</div>';
        return;
    }
    
    albumTracksGrid.innerHTML = '';
    
    // Header for the track list
    const header = document.createElement('div');
    header.className = 'gap-4 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/10 mb-2';
    header.style.cssText = 'display: grid; grid-template-columns: 50px 2fr 1fr 100px;';
    header.innerHTML = `
        <div class="text-center">#</div>
        <div>Title</div>
        <div>Artist</div>
        <div class="text-right">Actions</div>
    `;
    albumTracksGrid.appendChild(header);
    
    tracks.forEach((track, idx) => {
        const trackId = track.id || idx + 1;
        const title = track.title || track.name || `Track ${idx + 1}`;
        const artist = track.artists || artistName || 'Unknown Artist';
        const isSaved = getMyMusic().some(t => String(t.id) === String(trackId));
        
        const row = document.createElement('div');
        row.className = 'group gap-4 items-center px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer border border-transparent hover:border-white/5';
        row.style.cssText = 'display: grid; grid-template-columns: 50px 2fr 1fr 100px;';
        
        row.innerHTML = `
            <div class="flex justify-center">
                <span class="text-gray-500 font-mono text-sm group-hover:hidden transition-none">${idx + 1}</span>
                <button class="track-play-btn hidden group-hover:flex w-8 h-8 items-center justify-center rounded-full bg-pink-500 text-white shadow-md hover:scale-110 transition-transform" data-idx="${idx}">
                    <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
            </div>
            
            <div class="min-w-0 pr-4">
                <p class="text-sm font-bold text-white truncate group-hover:text-pink-400 transition-colors">${title}</p>
            </div>

            <div class="min-w-0">
                <p class="text-sm text-gray-400 truncate">${artist}</p>
            </div>
            
            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="track-heart-btn p-2 rounded-full ${isSaved ? 'text-pink-500 bg-pink-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'} transition-all" data-id="${trackId}" data-title="${title.replace(/"/g, '&quot;')}" data-artist="${artist.replace(/"/g, '&quot;')}" data-cover="${coverUrl || ''}" title="${isSaved ? 'Remove from Liked' : 'Save to Liked'}">
                     <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <button class="add-playlist-btn p-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all" data-id="${trackId}" data-title="${title.replace(/"/g, '&quot;')}" data-artist="${artist.replace(/"/g, '&quot;')}" data-cover="${coverUrl || ''}" title="Add to Playlist">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </button>
            </div>
        `;
        
        // Play track on row click (unless clicking a button)
        row.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                const playBtn = row.querySelector('.track-play-btn');
                if (playBtn) playBtn.click();
            }
        });

        row.querySelector('.track-play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.dataset.idx);
            if (currentAlbumTracks.length > 0) {
                playTrack(currentAlbumTracks[idx], currentAlbumTracks, idx);
            }
        });
        
        row.querySelector('.track-heart-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const btn = e.currentTarget;
            toggleSaveTrack({
                id: btn.dataset.id,
                title: btn.dataset.title,
                artist: btn.dataset.artist,
                cover: btn.dataset.cover
            }, btn);
        });

        row.querySelector('.add-playlist-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const btn = e.currentTarget;
            openPlaylistChooser({
                id: btn.dataset.id,
                title: btn.dataset.title,
                artist: btn.dataset.artist,
                cover: btn.dataset.cover
            });
        });
        
        albumTracksGrid.appendChild(row);
    });
}

// Render My Albums
function renderMyAlbums() {
    const myAlbumsGrid = document.getElementById('my-albums-grid');
    const myAlbumsEmpty = document.getElementById('my-albums-empty');
    if (!myAlbumsGrid) return;
    
    const albums = getMyAlbums();
    myAlbumsGrid.innerHTML = '';
    
    if (albums.length === 0) {
        if (myAlbumsEmpty) myAlbumsEmpty.classList.remove('hidden');
        return;
    }
    
    if (myAlbumsEmpty) myAlbumsEmpty.classList.add('hidden');
    
    albums.forEach(album => {
        const card = createAlbumCard(album);
        myAlbumsGrid.appendChild(card);
    });
}

// Toggle save track
function toggleSaveTrack(track, btn) {
    const saved = getMyMusic();
    const exists = saved.find(t => t.id === track.id);
    
    if (exists) {
        const filtered = saved.filter(t => t.id !== track.id);
        setMyMusic(filtered);
        
        // Update button style
        if (btn.classList.contains('bg-pink-600')) { // Card style button
             btn.classList.remove('bg-pink-600', 'text-white');
             btn.classList.add('bg-black/60', 'text-white', 'hover:bg-pink-600');
        } else { // List style button
             btn.classList.remove('text-pink-500');
             btn.classList.add('text-gray-400');
        }
       
        showNotification('Removed from Liked Songs', 'info');
        
        if (currentView === 'my-music') renderMyMusic();
    } else {
        saved.push(track);
        setMyMusic(saved);
        
        if (btn.classList.contains('bg-black/60')) { // Card style button
             btn.classList.add('bg-pink-600', 'text-white');
             btn.classList.remove('bg-black/60', 'hover:bg-pink-600');
        } else { // List style button
             btn.classList.add('text-pink-500');
             btn.classList.remove('text-gray-400');
        }

        showNotification(`Added "${track.title}" to Liked Songs`, 'success');
    }
}

// Render My Music
function renderMyMusic() {
    if (!myMusicGrid) return;
    
    const tracks = getMyMusic();
    myMusicGrid.innerHTML = '';
    
    if (tracks.length === 0) {
        if (myMusicEmpty) myMusicEmpty.classList.remove('hidden');
        return;
    }
    
    if (myMusicEmpty) myMusicEmpty.classList.add('hidden');
    
    tracks.forEach(track => {
        const card = createTrackCard(track);
        myMusicGrid.appendChild(card);
    });
}

// Render Playlists
function renderPlaylists() {
    if (!playlistsGrid) return;
    
    const playlists = getPlaylists();
    playlistsGrid.innerHTML = '';
    
    if (playlists.length === 0) {
        if (playlistsEmpty) playlistsEmpty.classList.remove('hidden');
        return;
    }
    
    if (playlistsEmpty) playlistsEmpty.classList.add('hidden');
    
    playlists.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-2xl overflow-hidden cursor-pointer group relative';
        
        const trackCount = pl.tracks ? pl.tracks.length : 0;
        const coverUrl = pl.tracks?.[0]?.cover || 'https://via.placeholder.com/200x200/1a1a2e/3b82f6?text=♪';
        
        card.innerHTML = `
            <div class="aspect-square relative">
                <img src="${coverUrl}" alt="${pl.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-4 w-full">
                    <p class="text-lg font-bold text-white truncate shadow-black drop-shadow-md">${pl.name}</p>
                    <p class="text-xs text-gray-300">${trackCount} tracks</p>
                </div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                     <svg class="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openPlaylist(pl.id));
        playlistsGrid.appendChild(card);
    });
}

// Open a specific playlist
function openPlaylist(playlistId) {
    const playlists = getPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;
    
    currentPlaylistId = playlistId;
    
    if (playlistViewTitle) playlistViewTitle.textContent = pl.name;
    if (playlistTracksGrid) playlistTracksGrid.innerHTML = '';
    
    if (!pl.tracks || pl.tracks.length === 0) {
        if (playlistEmpty) playlistEmpty.classList.remove('hidden');
    } else {
        if (playlistEmpty) playlistEmpty.classList.add('hidden');
        pl.tracks.forEach(track => {
            const card = createTrackCard(track);
            // Add remove button overlay
            const removeBtn = document.createElement('button');
            removeBtn.className = 'absolute top-2 left-2 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-20';
            removeBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
            removeBtn.title = "Remove from playlist";
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeTrackFromPlaylist(playlistId, track.id);
            });
            
            card.appendChild(removeBtn);
            playlistTracksGrid.appendChild(card);
        });
    }
    
    showView('playlist-view');
}

// Remove track from playlist
function removeTrackFromPlaylist(playlistId, trackId) {
    const playlists = getPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl || !pl.tracks) return;
    
    pl.tracks = pl.tracks.filter(t => t.id !== trackId);
    setPlaylists(playlists);
    openPlaylist(playlistId);
    showNotification('Removed from playlist', 'info');
}

// Create new playlist
function createPlaylist(name) {
    if (!name.trim()) return;
    
    const playlists = getPlaylists();
    const newPlaylist = {
        id: 'pl_' + Date.now(),
        name: name.trim(),
        tracks: [],
        createdAt: new Date().toISOString()
    };
    
    playlists.push(newPlaylist);
    setPlaylists(playlists);
    showNotification(`Created "${name}"`, 'success');
    renderPlaylists();
    
    return newPlaylist;
}

// Delete playlist
function deletePlaylist(playlistId) {
    const playlists = getPlaylists().filter(p => p.id !== playlistId);
    setPlaylists(playlists);
    showNotification('Playlist deleted', 'info');
    showView('playlists');
}

// Open playlist chooser modal
let pendingTrackForPlaylist = null;

function openPlaylistChooser(track) {
    pendingTrackForPlaylist = track;
    
    if (!playlistChooser) return;
    
    const playlists = getPlaylists();
    const chooserEmpty = document.getElementById('playlist-chooser-empty');
    
    if (playlistChooserList) {
        playlistChooserList.innerHTML = '';
        
        if (playlists.length === 0) {
            if (chooserEmpty) chooserEmpty.classList.remove('hidden');
        } else {
            if (chooserEmpty) chooserEmpty.classList.add('hidden');
            
            playlists.forEach(pl => {
                const item = document.createElement('button');
                item.className = 'w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left transition-colors flex items-center justify-between group';
                item.innerHTML = `
                    <span class="text-white font-medium">${pl.name}</span>
                    <span class="text-xs text-gray-400 group-hover:text-white transition-colors">${pl.tracks?.length || 0} tracks</span>
                `;
                item.addEventListener('click', () => {
                    if (pendingTrackForPlaylist) {
                        const added = addTrackToPlaylist(pl.id, pendingTrackForPlaylist);
                        if (added) {
                            showNotification(`Added to "${pl.name}"`, 'success');
                        } else {
                            showNotification('Already in playlist', 'info');
                        }
                    }
                    closePlaylistChooser();
                });
                playlistChooserList.appendChild(item);
            });
        }
    }
    
    playlistChooser.classList.remove('hidden');
}

function closePlaylistChooser() {
    if (playlistChooser) playlistChooser.classList.add('hidden');
    pendingTrackForPlaylist = null;
}

// Music Player Functions
let currentTrack = null;

async function playTrack(track, queue = null, index = 0) {
    currentTrack = track;
    
    if (queue) {
        musicQueue = queue;
        currentQueueIndex = index;
    } else {
        musicQueue = [track];
        currentQueueIndex = 0;
    }
    
    // Update player UI
    const playerCover = document.getElementById('music-player-cover');
    const playerTitle = document.getElementById('music-player-title');
    const playerArtist = document.getElementById('music-player-artist');
    const miniCover = document.getElementById('mini-player-cover');
    const miniTitle = document.getElementById('mini-player-title');
    const miniArtist = document.getElementById('mini-player-artist');
    const playPauseBtn = document.getElementById('music-play-pause-btn');
    
    const defaultCover = 'https://via.placeholder.com/200x200/1a1a2e/ec4899?text=♪';
    const cover = track.cover || defaultCover;
    
    if (playerCover) playerCover.src = cover;
    if (playerTitle) playerTitle.textContent = track.title || 'Unknown';
    if (playerArtist) playerArtist.textContent = track.artist || 'Unknown Artist';
    if (miniCover) miniCover.src = cover;
    if (miniTitle) miniTitle.textContent = track.title || 'Unknown';
    if (miniArtist) miniArtist.textContent = track.artist || 'Unknown Artist';
    
    if (playPauseBtn) {
        playPauseBtn.innerHTML = '<div class="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>';
    }
    
    showMusicPlayer();
    
    const progressFill = document.getElementById('music-progress-fill');
    const miniProgressFill = document.getElementById('mini-progress-fill');
    const currentTime = document.getElementById('music-current-time');
    const totalTime = document.getElementById('music-total-time');
    if (progressFill) progressFill.style.width = '0%';
    if (miniProgressFill) miniProgressFill.style.width = '0%';
    if (currentTime) currentTime.textContent = '0:00';
    if (totalTime) totalTime.textContent = '0:00';
    
    try {
        const res = await fetch(`/api/direct-stream-url?trackId=${encodeURIComponent(track.id)}`);
        if (!res.ok) throw new Error('Failed to get stream URL');
        const data = await res.json();
        
        const streamUrl = data?.streamUrl;
        if (!streamUrl) throw new Error('No stream URL returned');
        
        if (musicAudio) {
            musicAudio.src = streamUrl;
            musicAudio.load();
            await musicAudio.play();
            isPlaying = true;
            updatePlayPauseUI();
        }
    } catch (err) {
        console.error('Play error:', err);
        showNotification('Failed to play track', 'error');
        updatePlayPauseUI();
    }
}

function togglePlayPause() {
    if (!musicAudio) return;
    
    if (musicAudio.paused) {
        musicAudio.play();
        isPlaying = true;
    } else {
        musicAudio.pause();
        isPlaying = false;
    }
    updatePlayPauseUI();
}

function updatePlayPauseUI() {
    const playPauseBtn = document.getElementById('music-play-pause-btn');
    const miniPlayPauseBtn = document.getElementById('mini-play-pause-btn');
    
    if (playPauseBtn) {
        if (isPlaying) {
            playPauseBtn.innerHTML = '<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        } else {
            playPauseBtn.innerHTML = '<svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        }
    }
    
    if (miniPlayPauseBtn) {
         if (isPlaying) {
            miniPlayPauseBtn.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        } else {
            miniPlayPauseBtn.innerHTML = '<svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        }
    }
}

function playNext() {
    if (musicQueue.length === 0) return;
    currentQueueIndex = (currentQueueIndex + 1) % musicQueue.length;
    playTrack(musicQueue[currentQueueIndex], musicQueue, currentQueueIndex);
}

function playPrev() {
    if (musicQueue.length === 0) return;
    currentQueueIndex = (currentQueueIndex - 1 + musicQueue.length) % musicQueue.length;
    playTrack(musicQueue[currentQueueIndex], musicQueue, currentQueueIndex);
}

function showMusicPlayer() {
    if (musicPlayerModal) musicPlayerModal.classList.remove('hidden');
    if (musicMiniPlayer) musicMiniPlayer.classList.add('hidden');
}

function hideMusicPlayer() {
    if (musicPlayerModal) musicPlayerModal.classList.add('hidden');
    if (musicMiniPlayer) musicMiniPlayer.classList.add('hidden');
    if (musicAudio) {
        musicAudio.pause();
        musicAudio.currentTime = 0;
        musicAudio.src = '';
    }
    isPlaying = false;
    updatePlayPauseUI();
}

function minimizeMusicPlayer() {
    if (musicPlayerModal) musicPlayerModal.classList.add('hidden');
    if (musicMiniPlayer) musicMiniPlayer.classList.remove('hidden');
}

function expandMusicPlayer() {
    if (musicMiniPlayer) musicMiniPlayer.classList.add('hidden');
    if (musicPlayerModal) musicPlayerModal.classList.remove('hidden');
}

// Format time helper
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update progress bar
function updateProgress() {
    if (!musicAudio) return;
    
    const currentTimeEl = document.getElementById('music-current-time');
    const totalTime = document.getElementById('music-total-time');
    const progressFill = document.getElementById('music-progress-fill');
    const miniProgressFill = document.getElementById('mini-progress-fill');
    
    const current = musicAudio.currentTime;
    const duration = musicAudio.duration || 0;
    const percent = duration > 0 ? (current / duration) * 100 : 0;
    
    if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
    if (totalTime) totalTime.textContent = formatTime(duration);
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (miniProgressFill) miniProgressFill.style.width = `${percent}%`;
    
    if (current > 0.1 && isPlaying) updatePlayPauseUI();
}

// Seek to position
function seekTo(e, progressBar) {
    if (!musicAudio || !progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    musicAudio.currentTime = percent * musicAudio.duration;
}

// Set volume
function setVolume(e, volumeBar) {
    if (!musicAudio || !volumeBar) return;
    
    const rect = volumeBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    musicAudio.volume = percent;
    
    const volumeFill = document.getElementById('music-volume-fill');
    if (volumeFill) volumeFill.style.width = `${percent * 100}%`;
}

// Play all tracks from a list
function playAll(tracks, shuffle = false) {
    if (!tracks || tracks.length === 0) {
        showNotification('No tracks to play', 'info');
        return;
    }
    
    let queue = [...tracks];
    if (shuffle) {
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }
    }
    
    playTrack(queue[0], queue, 0);
}


// Initialize Music Module
function initMusic() {
    initDOMRefs();
    
    if (!musicSection) return;
    
    // Search functionality
    if (musicSearchBtn) {
        musicSearchBtn.addEventListener('click', () => {
            const query = musicSearchInput?.value || '';
            searchMusic(query);
        });
    }
    
    if (musicSearchInput) {
        musicSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchMusic(musicSearchInput.value);
            }
        });
    }
    
    // Header buttons
    const myMusicBtn = document.getElementById('music-my-btn');
    if (myMusicBtn) myMusicBtn.addEventListener('click', () => showView('my-music'));
    
    const myAlbumsBtn = document.getElementById('music-my-albums-btn');
    if (myAlbumsBtn) myAlbumsBtn.addEventListener('click', () => showView('my-albums'));
    
    const playlistsBtn = document.getElementById('music-playlists-btn');
    if (playlistsBtn) playlistsBtn.addEventListener('click', () => showView('playlists'));
    
    // Create playlist
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const newPlaylistInput = document.getElementById('new-playlist-name');
    if (createPlaylistBtn && newPlaylistInput) {
        createPlaylistBtn.addEventListener('click', () => {
            createPlaylist(newPlaylistInput.value);
            newPlaylistInput.value = '';
        });
    }
    
    // Playlist controls
    const playlistBackBtn = document.getElementById('playlist-back-btn');
    if (playlistBackBtn) playlistBackBtn.addEventListener('click', () => showView('playlists'));
    
    const playlistDeleteBtn = document.getElementById('playlist-delete-btn');
    if (playlistDeleteBtn) {
        playlistDeleteBtn.addEventListener('click', () => {
            if (currentPlaylistId && confirm('Delete this playlist?')) {
                deletePlaylist(currentPlaylistId);
            }
        });
    }
    
    // Action buttons
    const myMusicPlayAll = document.getElementById('my-music-play-all');
    if (myMusicPlayAll) myMusicPlayAll.addEventListener('click', () => playAll(getMyMusic()));
    
    const myMusicShuffle = document.getElementById('my-music-shuffle');
    if (myMusicShuffle) myMusicShuffle.addEventListener('click', () => playAll(getMyMusic(), true));
    
    const playlistPlayAll = document.getElementById('playlist-play-all');
    if (playlistPlayAll) {
        playlistPlayAll.addEventListener('click', () => {
            const pl = getPlaylists().find(p => p.id === currentPlaylistId);
            if (pl) playAll(pl.tracks || []);
        });
    }
    
    const playlistShuffle = document.getElementById('playlist-shuffle');
    if (playlistShuffle) {
        playlistShuffle.addEventListener('click', () => {
            const pl = getPlaylists().find(p => p.id === currentPlaylistId);
            if (pl) playAll(pl.tracks || [], true);
        });
    }
    
    // Player controls
    const playPauseBtn = document.getElementById('music-play-pause-btn');
    const miniPlayPauseBtn = document.getElementById('mini-play-pause-btn');
    const prevBtn = document.getElementById('music-prev-btn');
    const nextBtn = document.getElementById('music-next-btn');
    const playerClose = document.getElementById('music-player-close');
    const playerMinimize = document.getElementById('music-player-minimize');
    
    // Mini Player Expand Triggers
    const miniExpandImg = document.getElementById('mini-player-expand-img');
    const miniExpandText = document.getElementById('mini-player-expand-text');
    const miniMaximizeBtn = document.getElementById('mini-player-maximize-btn');
    
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
    if (miniPlayPauseBtn) miniPlayPauseBtn.addEventListener('click', togglePlayPause);
    if (prevBtn) prevBtn.addEventListener('click', playPrev);
    if (nextBtn) nextBtn.addEventListener('click', playNext);
    if (playerClose) playerClose.addEventListener('click', hideMusicPlayer);
    if (playerMinimize) playerMinimize.addEventListener('click', minimizeMusicPlayer);
    
    // Attach expand listeners
    if (miniExpandImg) miniExpandImg.addEventListener('click', expandMusicPlayer);
    if (miniExpandText) miniExpandText.addEventListener('click', expandMusicPlayer);
    if (miniMaximizeBtn) miniMaximizeBtn.addEventListener('click', expandMusicPlayer);
    
    // Progress & Volume
    const progressBar = document.getElementById('music-progress-bar');
    if (progressBar) progressBar.addEventListener('click', (e) => seekTo(e, progressBar));
    
    const miniProgressBar = document.getElementById('mini-progress-bar');
    if (miniProgressBar) miniProgressBar.addEventListener('click', (e) => seekTo(e, miniProgressBar));
    
    const volumeBar = document.getElementById('music-volume-bar');
    if (volumeBar) volumeBar.addEventListener('click', (e) => setVolume(e, volumeBar));
    
    // Audio events
    if (musicAudio) {
        musicAudio.addEventListener('timeupdate', updateProgress);
        musicAudio.addEventListener('ended', playNext);
        musicAudio.addEventListener('play', () => { isPlaying = true; updatePlayPauseUI(); });
        musicAudio.addEventListener('pause', () => { isPlaying = false; updatePlayPauseUI(); });
    }
    
    // Playlist chooser
    const chooserClose = document.getElementById('playlist-chooser-close');
    if (chooserClose) chooserClose.addEventListener('click', closePlaylistChooser);
    
    const chooserCreateBtn = document.getElementById('chooser-create-btn');
    const chooserNewPlaylist = document.getElementById('chooser-new-playlist');
    if (chooserCreateBtn && chooserNewPlaylist) {
        chooserCreateBtn.addEventListener('click', () => {
            const pl = createPlaylist(chooserNewPlaylist.value);
            chooserNewPlaylist.value = '';
            if (pl && pendingTrackForPlaylist) {
                addTrackToPlaylist(pl.id, pendingTrackForPlaylist);
                showNotification(`Added to "${pl.name}"`, 'success');
                closePlaylistChooser();
            } else {
                openPlaylistChooser(pendingTrackForPlaylist);
            }
        });
    }
    
    // Album view controls
    const albumBackBtn = document.getElementById('album-back-btn');
    if (albumBackBtn) albumBackBtn.addEventListener('click', () => showView('results'));
    
    const albumPlayAll = document.getElementById('album-play-all');
    if (albumPlayAll) albumPlayAll.addEventListener('click', () => { if (currentAlbumTracks.length) playAll(currentAlbumTracks); });
    
    const albumShuffle = document.getElementById('album-shuffle');
    if (albumShuffle) albumShuffle.addEventListener('click', () => { if (currentAlbumTracks.length) playAll(currentAlbumTracks, true); });
    
    const albumSaveBtn = document.getElementById('album-save-btn');
    if (albumSaveBtn) {
        albumSaveBtn.addEventListener('click', (e) => {
            if (currentAlbumData) toggleSaveAlbum(currentAlbumData, e.currentTarget);
        });
    }
    
    showView('empty');
}
// My List functionality
let myListData = [];

// Show My List Page
function showMyListPage() {
    hideAllSections();
    
    // Check if my list section exists, if not create it
    let myListSection = document.getElementById('myListSection');
    if (!myListSection) {
        createMyListSection();
        loadMyList();
    } else {
        myListSection.style.setProperty('display', 'block', 'important');
    }
}

// Create My List Section Structure
function createMyListSection() {
    const mainContent = document.getElementById('mainContent');
    const section = document.createElement('div');
    section.id = 'myListSection';
    section.className = 'mylist-section';
    section.innerHTML = `
        <div class="mylist-container" style="padding: 80px 40px 40px 40px;">
            <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 30px; color: #fff;">My List</h1>
            
            <div id="mylist-loading" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
                <div style="width: 50px; height: 50px; border: 4px solid rgba(139, 92, 246, 0.2); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            
            <div id="mylist-empty" style="display: none; text-align: center; padding: 100px 20px;">
                <svg style="width: 100px; height: 100px; margin: 0 auto 20px; opacity: 0.3;" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
                <h2 style="font-size: 1.5rem; color: rgba(255,255,255,0.7); margin-bottom: 10px;">Your list is empty</h2>
                <p style="color: rgba(255,255,255,0.5);">Add movies and TV shows to your list to watch them later</p>
            </div>
            
            <div id="mylist-grid" class="movie-grid" style="display: none; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;">
                <!-- My list items will be inserted here -->
            </div>
        </div>
    `;
    mainContent.appendChild(section);
}

// Load My List from file
async function loadMyList() {
    const loadingEl = document.getElementById('mylist-loading');
    const emptyEl = document.getElementById('mylist-empty');
    const gridEl = document.getElementById('mylist-grid');
    
    try {
        const response = await fetch('/api/my-list');
        if (!response.ok) throw new Error('Failed to load my list');
        
        myListData = await response.json();
        
        if (loadingEl) loadingEl.style.display = 'none';
        
        if (myListData.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            if (gridEl) gridEl.style.display = 'none';
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
            if (gridEl) gridEl.style.display = 'grid';
            renderMyList();
        }
    } catch (error) {
        console.error('[MyList] Error loading:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.innerHTML = `
                <h2 style="font-size: 1.5rem; color: rgba(255,255,255,0.7);">Failed to load list</h2>
                <p style="color: rgba(255,255,255,0.5);">${error.message}</p>
            `;
        }
    }
}

// Render My List items
function renderMyList() {
    const gridEl = document.getElementById('mylist-grid');
    if (!gridEl) return;
    
    gridEl.innerHTML = '';
    
    // Sort by added_date descending (newest first)
    const sortedList = [...myListData].sort((a, b) => 
        new Date(b.added_date) - new Date(a.added_date)
    );
    
    sortedList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.cssText = 'cursor: pointer; transition: transform 0.2s; position: relative;';
        
        const posterUrl = item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster';
        
        card.innerHTML = `
            <div style="position: relative; aspect-ratio: 2/3; overflow: hidden; border-radius: 8px;">
                <img src="${posterUrl}" 
                     alt="${item.title}" 
                     style="width: 100%; height: 100%; object-fit: cover;"
                     loading="lazy">
                <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                    ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                </div>
            </div>
            <div style="padding: 8px 0;">
                <h3 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.title}</h3>
                <p style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">${item.year || 'N/A'}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            sessionStorage.setItem('skipIntro', 'true');
            window.location.href = `details.html?type=${item.media_type}&id=${item.id}`;
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
        
        gridEl.appendChild(card);
    });
}

// Check if item is in my list
async function isInMyList(id) {
    try {
        const response = await fetch('/api/my-list');
        if (!response.ok) return false;
        const list = await response.json();
        return list.some(item => item.id === parseInt(id));
    } catch (error) {
        console.error('[MyList] Error checking:', error);
        return false;
    }
}

// Add item to my list
async function addToMyList(item) {
    try {
        const response = await fetch('/api/my-list/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        
        if (!response.ok) throw new Error('Failed to add to list');
        
        const result = await response.json();
        console.log('[MyList] Added:', result);
        return true;
    } catch (error) {
        console.error('[MyList] Error adding:', error);
        return false;
    }
}

// Remove item from my list
async function removeFromMyList(id) {
    try {
        const response = await fetch('/api/my-list/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: parseInt(id) })
        });
        
        if (!response.ok) throw new Error('Failed to remove from list');
        
        const result = await response.json();
        console.log('[MyList] Removed:', result);
        return true;
    } catch (error) {
        console.error('[MyList] Error removing:', error);
        return false;
    }
}

// Navbar functionality
const navbar = document.getElementById('navbar');
const contextMenu = document.getElementById('contextMenu');
const contextMenuList = document.getElementById('contextMenuList');
const navbarMenu = document.getElementById('navbarMenu');

// Store navbar item visibility state
let navbarState = {};

// Initialize navbar state
function initNavbarState() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const id = item.getAttribute('data-id');
        const iconEl = item.querySelector('.nav-icon svg');
        navbarState[id] = {
            visible: true,
            label: item.querySelector('.nav-label').textContent,
            iconSvg: iconEl ? iconEl.outerHTML : ''
        };
    });
    
    // Load saved state from localStorage and merge
    const savedState = localStorage.getItem('navbarState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.keys(parsed).forEach(id => {
            // Only apply saved state if the item still exists in the navbar
            if (navbarState[id]) {
                navbarState[id].visible = parsed[id].visible;
            }
        });
    }
    
    // Apply the state (this will show new items that weren't in saved state)
    applyNavbarState();
}

// Apply navbar state (show/hide items)
function applyNavbarState() {
    Object.keys(navbarState).forEach(id => {
        const item = document.querySelector(`.nav-item[data-id="${id}"]`);
        if (item) {
            item.style.display = navbarState[id].visible ? 'block' : 'none';
        }
    });
}

// Save navbar state to localStorage
function saveNavbarState() {
    localStorage.setItem('navbarState', JSON.stringify(navbarState));
}

// Build context menu
function buildContextMenu() {
    contextMenuList.innerHTML = '';
    
    Object.keys(navbarState).forEach(id => {
        const item = navbarState[id];
        const li = document.createElement('li');
        li.className = 'context-menu-item';
        li.innerHTML = `
            <span class="context-menu-icon">${item.iconSvg || ''}</span>
            <span class="context-menu-label">${item.label}</span>
            <span class="context-menu-check">${item.visible ? '✓' : ''}</span>
        `;
        
        li.addEventListener('click', () => {
            toggleNavbarItem(id);
        });
        
        contextMenuList.appendChild(li);
    });
}

// Toggle navbar item visibility
function toggleNavbarItem(id) {
    navbarState[id].visible = !navbarState[id].visible;
    applyNavbarState();
    buildContextMenu();
    saveNavbarState();
}

// Show context menu
function showContextMenu(x, y) {
    buildContextMenu();
    contextMenu.style.display = 'block';
    
    // Get dimensions after showing
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Adjust horizontal position
    let finalX = x;
    if (x + menuWidth > windowWidth) {
        finalX = windowWidth - menuWidth - 10;
    }
    
    // Adjust vertical position
    let finalY = y;
    if (y + menuHeight > windowHeight) {
        finalY = windowHeight - menuHeight - 10;
    }
    
    contextMenu.style.left = finalX + 'px';
    contextMenu.style.top = finalY + 'px';
}

// Hide context menu
function hideContextMenu() {
    contextMenu.style.display = 'none';
}

// Right-click on navbar items
navbar.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
});

// Click outside to close context menu
document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target) && !navbar.contains(e.target)) {
        hideContextMenu();
    }
});

// Refresh button functionality
document.getElementById('refreshBtn').addEventListener('click', () => {
    location.reload();
});

// Clear Cache button functionality
document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('.nav-btn');
    if (navBtn) {
        const navItem = navBtn.closest('.nav-item');
        const itemId = navItem?.getAttribute('data-id');
        
        if (itemId === 'clear-cache') {
            e.preventDefault();
            e.stopPropagation();
            clearCache();
            return;
        }
    }
});

async function clearCache() {
    if (window.electronAPI?.clearCache) {
        try {
            const result = await window.electronAPI.clearCache();
            showNotification(result.message || 'Cache cleared successfully!', result.success ? 'success' : 'error');
            if (result.success) {
                setTimeout(() => location.reload(), 1000);
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            showNotification('Failed to clear cache', 'error');
        }
    } else {
        showNotification('Cache clearing not available in browser mode', 'info');
    }
}

function showNotification(message, type = 'success') {
    // Prevent recursion - check if we're already showing a notification
    if (window._showingNotification) return;
    window._showingNotification = true;
    
    try {
        // Add keyframes if not already added
        if (!document.getElementById('notification-keyframes')) {
            const style = document.createElement('style');
            style.id = 'notification-keyframes';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
                window._showingNotification = false;
            }, 300);
        }, 3000);
    } catch (e) {
        console.error('[Notification] Error:', e);
        window._showingNotification = false;
    }
}

// Hide all main content sections
function hideAllSections() {
    // TMDB / Home related
    const hero = document.getElementById('heroSection');
    const content = document.querySelector('.content-wrapper');
    const spotlight = document.getElementById('spotlightSection');
    if (hero) hero.style.setProperty('display', 'none', 'important');
    if (content) content.style.setProperty('display', 'none', 'important');
    if (spotlight) spotlight.style.setProperty('display', 'none', 'important');

    // Search Page
    const searchPage = document.getElementById('searchPageContainer');
    if (searchPage) searchPage.style.setProperty('display', 'none', 'important');

    // Genres Page
    const genresPage = document.getElementById('genresPageContainer');
    const genreBrowse = document.getElementById('genreBrowsePageContainer');
    if (genresPage) genresPage.style.setProperty('display', 'none', 'important');
    if (genreBrowse) genreBrowse.style.setProperty('display', 'none', 'important');

    // Comics
    const comics = document.getElementById('comicsSection');
    if (comics) comics.style.setProperty('display', 'none', 'important');

    // Manga
    const manga = document.getElementById('mangaSection');
    const mangaWarning = document.getElementById('mangaWarningModal');
    if (manga) manga.style.setProperty('display', 'none', 'important');
    if (mangaWarning) mangaWarning.classList.remove('active');

    // Live Sports
    const liveSports = document.getElementById('liveSportsSection');
    if (liveSports) liveSports.style.setProperty('display', 'none', 'important');

    // Downloader
    const downloader = document.getElementById('downloaderSection');
    if (downloader) downloader.style.setProperty('display', 'none', 'important');
    
    // Music
    const music = document.getElementById('musicSection');
    if (music) music.style.setProperty('display', 'none', 'important');
    
    // Audiobooks
    const audiobooks = document.getElementById('audiobooksSection');
    if (audiobooks) audiobooks.style.setProperty('display', 'none', 'important');
    
    // Books
    const books = document.getElementById('booksSection');
    if (books) books.style.setProperty('display', 'none', 'important');
    
    // My List
    const myList = document.getElementById('myListSection');
    if (myList) myList.style.setProperty('display', 'none', 'important');
    
    // Live TV
    const liveTv = document.getElementById('liveTvSection');
    if (liveTv) liveTv.style.setProperty('display', 'none', 'important');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Show Home Page
function showHomePage() {
    hideAllSections();
    const hero = document.getElementById('heroSection');
    const content = document.querySelector('.content-wrapper');
    const spotlight = document.getElementById('spotlightSection');
    if (hero) hero.style.setProperty('display', 'block', 'important');
    if (content) content.style.setProperty('display', 'block', 'important');
    if (spotlight) spotlight.style.setProperty('display', 'block', 'important');
}

// Navigation handlers
document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('.nav-btn');
    if (navBtn) {
        const navItem = navBtn.closest('.nav-item');
        const itemId = navItem?.getAttribute('data-id');
        
        // Skip navigation for action buttons
        if (itemId === 'clear-cache' || itemId === 'refresh') {
            return;
        }
        
        // Handle Play Magnet button
        if (itemId === 'play-magnet') {
            showPlayMagnetModal();
            return;
        }
        
        // Show coming soon for games downloader
        if (itemId === 'games-downloader') {
            showNotification('Games Downloader - Coming Soon!', 'info');
            return;
        }
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        if (navItem) navItem.classList.add('active');
        
        // Clear hash when navigating via navbar to prevent sticky genre views
        if (window.location.hash) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
        
        if (itemId === 'search') {
            showSearchPage();
        } else if (itemId === 'home') {
            showHomePage();
        } else if (itemId === 'genres') {
            showGenresPage();
        } else if (itemId === 'comics') {
            showComicsPage();
        } else if (itemId === 'manga') {
            showMangaPage();
        } else if (itemId === 'live-sports') {
            showLiveSportsPage();
        } else if (itemId === 'my-list') {
            showMyListPage();
        } else if (itemId === 'media-downloader') {
            showMediaDownloaderPage();
        } else if (itemId === 'music') {
            showMusicPage();
        } else if (itemId === 'audiobooks') {
            showAudiobooksPage();
        } else if (itemId === 'books') {
            showBooksPage();
        } else if (itemId === 'live-tv') {
            showLiveTvPage();
        } else if (itemId === 'iptv') {
            window.location.href = 'iptv.html';
        } else if (itemId === 'settings') {
            // Navigate to settings page
            window.location.href = 'settings.html';
        }
    }
});

// Set initial active state
function setInitialActive() {
    const homeItem = document.querySelector('.nav-item[data-id="home"]');
    if (homeItem) homeItem.classList.add('active');
}

// Initialize
initNavbarState();
setInitialActive();

// Settings Modal Functions
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Settings Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-settings-modal');
    const modal = document.getElementById('settings-modal');
    const streamingToggle = document.getElementById('streaming-mode-toggle');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSettingsModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSettingsModal();
            }
        });
    }
    
    if (streamingToggle && window.streamingMode) {
        // Load current setting
        streamingToggle.checked = window.streamingMode.enabled();
        
        // Save on change
        streamingToggle.addEventListener('change', (e) => {
            window.streamingMode.setEnabled(e.target.checked);
        });
    }
    
    // Initialize streaming mode UI
    if (window.streamingMode && window.streamingMode.init) {
        window.streamingMode.init();
    }
});

// Play Magnet Modal State
let currentMagnetLink = null;
let currentTorrentFiles = null;
let selectedFileIndex = null;
let magnetStreamUrl = null; // Renamed to avoid conflicts with other modules
let currentInfoHash = null;
let isDebridMode = false;

// Play Magnet Modal Functions
function showPlayMagnetModal() {
    const modal = document.getElementById('play-magnet-modal');
    const input = document.getElementById('magnet-link-input');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0, 0, 0, 0.8)';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '10000';
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
    }
}

function hidePlayMagnetModal() {
    const modal = document.getElementById('play-magnet-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showFileSelectionModal() {
    const modal = document.getElementById('file-selection-modal');
    const loadingState = document.getElementById('file-loading-state');
    const fileList = document.getElementById('file-list-container');
    const actions = document.getElementById('file-modal-actions');
    
    if (modal) {
        // Show modal immediately with loading state
        modal.style.display = 'flex';
        if (loadingState) loadingState.style.display = 'flex';
        if (fileList) fileList.style.display = 'none';
        if (actions) actions.style.display = 'none';
    }
}

function showFileList() {
    const loadingState = document.getElementById('file-loading-state');
    const fileList = document.getElementById('file-list-container');
    
    if (loadingState) loadingState.style.display = 'none';
    if (fileList) fileList.style.display = 'block';
}

async function hideFileSelectionModal() {
    const modal = document.getElementById('file-selection-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Clear cache when exiting file selection
    await clearCacheAfterMagnet();
}

async function clearCacheAfterMagnet() {
    try {
        console.log('[Magnet] Clearing cache...');
        // Stop all torrent engines
        await fetch('http://localhost:6987/api/alt-stop-all', { method: 'POST' });
        
        // Clear cache via electron API if available
        if (window.electronAPI?.clearCache) {
            await window.electronAPI.clearCache();
        }
        console.log('[Magnet] Cache cleared');
    } catch (e) {
        console.warn('[Magnet] Failed to clear cache:', e);
    }
}

async function getDebridSettings() {
    try {
        const response = await fetch('/api/settings');
        if (!response.ok) return { useDebrid: false };
        const settings = await response.json();
        return {
            useDebrid: !!settings.useDebrid,
            debridProvider: settings.debridProvider || 'realdebrid',
            debridAuth: settings.debridAuth || null
        };
    } catch (e) {
        console.error('[Debrid] Failed to get settings:', e);
        return { useDebrid: false };
    }
}

// Resolve torrent URL to magnet link (same as play.html)
async function resolveTorrent(url, title) {
    if (!url || !url.startsWith('http')) return url;
    // If it's already a magnet, no need to resolve
    if (url.startsWith('magnet:')) return url;
    try {
        const res = await fetch(`/api/resolve-torrent-file?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error('[resolveTorrent] Server error:', errData.error || res.status);
            return null;
        }
        const data = await res.json();
        if (data.error) {
            console.error('[resolveTorrent] Resolution error:', data.error);
            return null;
        }
        if (data.magnet) {
            return data.magnet;
        }
        console.warn('[resolveTorrent] No magnet returned from resolution');
        return null;
    } catch (err) {
        console.error('[resolveTorrent] Failed to resolve torrent:', err);
        return null;
    }
}

async function handleMagnetPlay() {
    const input = document.getElementById('magnet-link-input');
    let magnetLink = input?.value.trim();
    
    if (!magnetLink) {
        showNotification('Please enter a magnet link', 'error');
        return;
    }
    
    hidePlayMagnetModal();
    
    // Resolve torrent if it's a download URL (same logic as play.html)
    const needsResolution = magnetLink.startsWith('http') && !magnetLink.startsWith('magnet:') && (
        magnetLink.includes('.torrent') ||
        magnetLink.includes('jackett') ||
        magnetLink.includes('prowlarr') ||
        magnetLink.includes('/download/') ||
        magnetLink.includes('/torrent/')
    );
    
    if (needsResolution) {
        showNotification('Resolving torrent...', 'info');
        console.log('[Torrent] Resolving download URL:', magnetLink.substring(0, 100) + '...');
        magnetLink = await resolveTorrent(magnetLink, 'Manual Torrent');
        
        if (!magnetLink) {
            showNotification('Failed to resolve torrent link', 'error');
            return;
        }
        
        if (!magnetLink.startsWith('magnet:')) {
            console.error('[Torrent] Resolution failed to return a magnet link:', magnetLink.substring(0, 100));
            showNotification('Could not extract magnet link from this torrent', 'error');
            return;
        }
        
        console.log('[Torrent] Resolved to magnet:', magnetLink.substring(0, 80) + '...');
    }
    
    // Final validation: ensure we have a magnet link
    if (!magnetLink.startsWith('magnet:')) {
        console.error('[Torrent] Not a magnet link:', magnetLink.substring(0, 100));
        showNotification('Invalid torrent link. Expected a magnet link.', 'error');
        return;
    }
    
    currentMagnetLink = magnetLink;
    
    // Check debrid settings
    const debridSettings = await getDebridSettings();
    
    if (debridSettings.useDebrid && debridSettings.debridAuth) {
        // Use Debrid
        await handleDebridMagnet(magnetLink, debridSettings);
    } else {
        // Use Torrent Engine
        await handleTorrentEngineMagnet(magnetLink);
    }
}

async function handleDebridMagnet(magnetLink, debridSettings) {
    try {
        // Show modal immediately with loading state
        showFileSelectionModal();
        
        console.log('[Debrid] Preparing magnet with provider:', debridSettings.debridProvider);
        
        // Add magnet to debrid using the correct endpoint
        const prepareResponse = await fetch('/api/debrid/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ magnet: magnetLink })
        });
        
        if (!prepareResponse.ok) {
            throw new Error('Failed to prepare magnet with debrid');
        }
        
        const data = await prepareResponse.json();
        console.log('[Debrid] Prepare response:', data);
        
        if (!data || !data.info) {
            throw new Error('Invalid response from debrid service');
        }
        
        const info = data.info;
        const files = info.files || [];
        
        console.log('[Debrid] Found', files.length, 'files');
        
        currentTorrentFiles = files.map((file, index) => ({
            name: file.path || file.filename || file.name || `File ${file.id || index + 1}`,
            size: file.bytes || file.size || 0,
            index: index,
            id: file.id,
            links: file.links,
            selected: file.selected
        }));
        
        // Store info for later unrestrict
        window._debridInfo = info;
        currentInfoHash = info.id || data.id;
        isDebridMode = true;
        
        if (currentTorrentFiles.length === 0) {
            hideFileSelectionModal();
            showNotification('No files found in torrent', 'error');
            return;
        }
        
        // Display files
        displayFileList(currentTorrentFiles, true);
        showFileList();
        
    } catch (error) {
        console.error('[Debrid] Error:', error);
        hideFileSelectionModal();
        showNotification('Debrid error: ' + error.message, 'error');
    }
}

async function handleTorrentEngineMagnet(magnetLink) {
    try {
        // Show modal immediately with loading state
        showFileSelectionModal();
        
        console.log('[TorrentEngine] Starting with magnet:', magnetLink.substring(0, 80));
        
        // Check which engine is configured
        let engineConfig = { engine: 'stremio' };
        try {
            const configRes = await fetch('/api/torrent-engine/config');
            if (configRes.ok) {
                engineConfig = await configRes.json();
            }
        } catch (e) {
            console.warn('[TorrentEngine] Failed to get engine config, defaulting to stremio');
        }
        
        const isAltEngine = engineConfig.engine !== 'stremio';
        const apiEndpoint = isAltEngine ? '/api/alt-torrent-files' : '/api/torrent-files';
        
        console.log('[TorrentEngine] Using', engineConfig.engine, 'engine via', apiEndpoint);
        
        const response = await fetch(`${apiEndpoint}?magnet=${encodeURIComponent(magnetLink)}`);
        
        console.log('[TorrentEngine] Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TorrentEngine] Server error:', errorText);
            throw new Error('Failed to fetch torrent metadata: ' + response.status);
        }
        
        const data = await response.json();
        console.log('[TorrentEngine] Response data:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        currentTorrentFiles = data.videoFiles || [];
        currentInfoHash = data.infoHash;
        isDebridMode = false;
        
        console.log('[TorrentEngine] Found', currentTorrentFiles.length, 'video files');
        
        if (currentTorrentFiles.length === 0) {
            hideFileSelectionModal();
            showNotification('No video files found in torrent', 'error');
            return;
        }
        
        // Display files
        displayFileList(currentTorrentFiles, false);
        showFileList();
        
    } catch (error) {
        console.error('[TorrentEngine] Error:', error);
        hideFileSelectionModal();
        showNotification('Torrent error: ' + error.message, 'error');
    }
}

function displayFileList(files, isDebrid) {
    const container = document.getElementById('file-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileDiv = document.createElement('div');
        fileDiv.style.cssText = `
            padding: 16px;
            margin-bottom: 12px;
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        const fileName = file.name || file.path || `File ${index + 1}`;
        const fileSize = file.size ? formatFileSize(file.size) : 'Unknown size';
        
        fileDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="color: #fff; font-size: 15px; margin-bottom: 4px;">${fileName}</div>
                    <div style="color: rgba(255,255,255,0.6); font-size: 13px;">${fileSize}</div>
                </div>
                <div style="width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <div class="file-check" style="width: 14px; height: 14px; background: #667eea; border-radius: 50%; display: none;"></div>
                </div>
            </div>
        `;
        
        fileDiv.addEventListener('click', () => selectFile(index, fileDiv));
        fileDiv.addEventListener('mouseenter', () => {
            if (selectedFileIndex !== index) {
                fileDiv.style.background = 'rgba(255,255,255,0.08)';
                fileDiv.style.borderColor = 'rgba(255,255,255,0.2)';
            }
        });
        fileDiv.addEventListener('mouseleave', () => {
            if (selectedFileIndex !== index) {
                fileDiv.style.background = 'rgba(255,255,255,0.05)';
                fileDiv.style.borderColor = 'rgba(255,255,255,0.1)';
            }
        });
        
        container.appendChild(fileDiv);
    });
}

async function selectFile(index, fileDiv) {
    // Remove previous selection
    document.querySelectorAll('#file-list-container > div').forEach(div => {
        div.style.background = 'rgba(255,255,255,0.05)';
        div.style.borderColor = 'rgba(255,255,255,0.1)';
        const check = div.querySelector('.file-check');
        if (check) check.style.display = 'none';
    });
    
    // Highlight selected
    fileDiv.style.background = 'rgba(102, 126, 234, 0.2)';
    fileDiv.style.borderColor = 'rgba(102, 126, 234, 0.6)';
    const check = fileDiv.querySelector('.file-check');
    if (check) check.style.display = 'block';
    
    selectedFileIndex = index;
    
    // Get stream link
    if (isDebridMode) {
        await getDebridStreamLink(index);
    } else {
        await getTorrentStreamLink(index);
    }
    
    // Show action buttons
    const actions = document.getElementById('file-modal-actions');
    if (actions) actions.style.display = 'flex';
}

async function getDebridStreamLink(fileIndex) {
    try {
        const debridSettings = await getDebridSettings();
        const file = currentTorrentFiles[fileIndex];
        const info = window._debridInfo;
        
        console.log('[Debrid] Getting stream link for file:', file.name);
        
        // Get the file link (same logic as play.js)
        let fileLink = (file.links && file.links[0]) || null;
        
        // Real-Debrid Fallback: links are in info.links, not per-file
        if (!fileLink && debridSettings.debridProvider === 'realdebrid' && info.links && info.links.length > 0) {
            const selectedFiles = currentTorrentFiles.filter(f => f.selected === 1);
            const linkIndex = selectedFiles.findIndex(f => f.index === fileIndex);
            
            if (linkIndex !== -1 && info.links[linkIndex]) {
                fileLink = info.links[linkIndex];
                console.log(`[Debrid] RD Link matched via selected-index [${linkIndex}]: ${fileLink}`);
            } else {
                console.warn('[Debrid] Target file not found in selected files list or link missing.');
            }
        }
        
        if (!fileLink) {
            throw new Error('No direct link available for this file yet');
        }
        
        // Unrestrict the link
        console.log('[Debrid] Unrestricting link...');
        const response = await fetch('/api/debrid/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link: fileLink })
        });
        
        if (!response.ok) {
            throw new Error('Failed to unrestrict link from debrid');
        }
        
        const data = await response.json();
        
        if (!data.url) {
            throw new Error(data.error || 'No stream URL returned from debrid');
        }
        
        magnetStreamUrl = data.url;
        console.log('[Debrid] Stream URL:', magnetStreamUrl);
        
    } catch (error) {
        console.error('[Debrid] Error getting stream link:', error);
        showNotification('Failed to get stream link: ' + error.message, 'error');
    }
}

async function getTorrentStreamLink(fileIndex) {
    try {
        // Check which engine is configured
        let engineConfig = { engine: 'stremio' };
        try {
            const configRes = await fetch('/api/torrent-engine/config');
            if (configRes.ok) {
                engineConfig = await configRes.json();
            }
        } catch (e) {}
        
        const isAltEngine = engineConfig.engine !== 'stremio';
        const streamEndpoint = isAltEngine ? '/api/alt-stream-file' : '/api/stream-file';
        const prepareEndpoint = isAltEngine ? '/api/alt-prepare-file' : '/api/prepare-file';
        
        const file = currentTorrentFiles[fileIndex];
        magnetStreamUrl = `${window.location.origin}${streamEndpoint}?hash=${currentInfoHash}&file=${file.index}`;
        
        // Prepare the file for streaming
        fetch(`${prepareEndpoint}?hash=${currentInfoHash}&file=${file.index}`).catch(() => {});
        
        console.log('[TorrentEngine] Stream URL:', magnetStreamUrl);
        
    } catch (error) {
        console.error('[TorrentEngine] Error getting stream link:', error);
        showNotification('Failed to get stream link', 'error');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function copyStreamLink() {
    if (!magnetStreamUrl) {
        showNotification('No stream link available', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(magnetStreamUrl);
        showNotification('Stream link copied to clipboard!', 'success');
    } catch (error) {
        console.error('[Copy] Error:', error);
        showNotification('Failed to copy link', 'error');
    }
}

async function playSelectedFile() {
    if (!magnetStreamUrl) {
        showNotification('No stream link available', 'error');
        return;
    }
    
    try {
        console.log('[Play] Opening stream:', magnetStreamUrl);
        
        // Use PlayTorrioPlayer just like IPTV does
        const response = await fetch('/api/playtorrioplayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: magnetStreamUrl,
                stopOnClose: !isDebridMode // Only stop torrent engine streams, not debrid
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Playing...', 'success');
            // Don't close the modal - let user close it manually with back button
        } else {
            throw new Error(result.error || 'Failed to open player');
        }
        
    } catch (error) {
        console.error('[Play] Error:', error);
        showNotification('Failed to play: ' + error.message, 'error');
    }
}

// Play Magnet Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const cancelBtn = document.getElementById('magnet-cancel-btn');
    const playBtn = document.getElementById('magnet-play-btn');
    const modal = document.getElementById('play-magnet-modal');
    const input = document.getElementById('magnet-link-input');
    
    // File selection modal elements
    const fileModal = document.getElementById('file-selection-modal');
    const fileModalBackBtn = document.getElementById('file-modal-back-btn');
    const fileCopyLinkBtn = document.getElementById('file-copy-link-btn');
    const filePlayBtn = document.getElementById('file-play-btn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hidePlayMagnetModal);
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', handleMagnetPlay);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hidePlayMagnetModal();
            }
        });
    }
    
    if (fileModalBackBtn) {
        fileModalBackBtn.addEventListener('click', hideFileSelectionModal);
    }
    
    if (fileModal) {
        // Don't close on background click - force user to use back button
        fileModal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    if (fileCopyLinkBtn) {
        fileCopyLinkBtn.addEventListener('click', copyStreamLink);
    }
    
    if (filePlayBtn) {
        filePlayBtn.addEventListener('click', playSelectedFile);
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal?.style.display === 'flex') {
                hidePlayMagnetModal();
            }
            if (fileModal?.style.display === 'flex') {
                hideFileSelectionModal();
            }
        }
    });
});


// Person/Actor Details Page JavaScript
const API_KEY = 'c3515fdc674ea2bd7b514f4bc3616a4a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

let currentPersonId = null;
let personPhotos = [];
let currentPhotoIndex = 0;
let allCredits = [];
let currentFilter = 'all';

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id')
    };
}

// Initialize page
async function initPersonPage() {
    const params = getUrlParams();
    currentPersonId = params.id;
    
    if (!currentPersonId) {
        showError('No person ID provided');
        return;
    }
    
    await loadPersonDetails();
}

// Load person details
async function loadPersonDetails() {
    try {
        showLoading();
        
        // Fetch person details and credits
        const [detailsResponse, creditsResponse, imagesResponse] = await Promise.all([
            fetch(`${BASE_URL}/person/${currentPersonId}?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/person/${currentPersonId}/combined_credits?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/person/${currentPersonId}/images?api_key=${API_KEY}`)
        ]);
        
        const details = await detailsResponse.json();
        const credits = await creditsResponse.json();
        const images = await imagesResponse.json();
        
        displayPersonInfo(details);
        displayPhotos(details, images);
        displayFilmography(credits);
        
        hideLoading();
    } catch (error) {
        console.error('Error loading person details:', error);
        showError('Failed to load person details');
    }
}

// Display person info
function displayPersonInfo(person) {
    document.getElementById('personName').textContent = person.name;
    document.getElementById('knownFor').textContent = person.known_for_department || 'N/A';
    
    const birthday = person.birthday ? new Date(person.birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'N/A';
    document.getElementById('birthday').textContent = birthday;
    
    document.getElementById('birthplace').textContent = person.place_of_birth || 'N/A';
    document.getElementById('personBio').textContent = person.biography || 'No biography available.';
}

// Display photos
function displayPhotos(person, images) {
    personPhotos = [];
    
    // Add main profile photo first
    if (person.profile_path) {
        personPhotos.push(person.profile_path);
    }
    
    // Add additional photos
    if (images.profiles && images.profiles.length > 0) {
        images.profiles.forEach(photo => {
            if (photo.file_path && photo.file_path !== person.profile_path) {
                personPhotos.push(photo.file_path);
            }
        });
    }
    
    // Limit to 10 photos
    personPhotos = personPhotos.slice(0, 10);
    
    if (personPhotos.length > 0) {
        showPhoto(0);
    } else {
        document.getElementById('mainPhoto').src = 'https://via.placeholder.com/450x600?text=No+Photo';
        document.getElementById('photoCounter').textContent = '0 / 0';
    }
}

// Show specific photo
function showPhoto(index) {
    if (personPhotos.length === 0) return;
    
    currentPhotoIndex = index;
    const photoPath = `${IMG_BASE_URL}/h632${personPhotos[index]}`;
    document.getElementById('mainPhoto').src = photoPath;
    document.getElementById('photoCounter').textContent = `${index + 1} / ${personPhotos.length}`;
}

// Next photo
function nextPhoto() {
    if (personPhotos.length === 0) return;
    currentPhotoIndex = (currentPhotoIndex + 1) % personPhotos.length;
    showPhoto(currentPhotoIndex);
}

// Previous photo
function prevPhoto() {
    if (personPhotos.length === 0) return;
    currentPhotoIndex = (currentPhotoIndex - 1 + personPhotos.length) % personPhotos.length;
    showPhoto(currentPhotoIndex);
}

// Display filmography
function displayFilmography(credits) {
    // Combine cast credits from movies and TV
    allCredits = [];
    
    if (credits.cast) {
        credits.cast.forEach(credit => {
            allCredits.push({
                ...credit,
                media_type: credit.media_type || 'movie'
            });
        });
    }
    
    // Sort by popularity and release date
    allCredits.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
        const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
        return dateB - dateA;
    });
    
    filterFilmography('all');
}

// Filter filmography
function filterFilmography(filter) {
    currentFilter = filter;
    
    let filteredCredits = allCredits;
    if (filter === 'movie') {
        filteredCredits = allCredits.filter(c => c.media_type === 'movie');
    } else if (filter === 'tv') {
        filteredCredits = allCredits.filter(c => c.media_type === 'tv');
    }
    
    const grid = document.getElementById('filmographyGrid');
    grid.innerHTML = '';
    
    if (filteredCredits.length === 0) {
        grid.innerHTML = '<p style="color: rgba(255,255,255,0.5); grid-column: 1/-1;">No items found</p>';
        return;
    }
    
    filteredCredits.forEach(credit => {
        const card = createFilmographyCard(credit);
        grid.appendChild(card);
    });
}

// Create filmography card
function createFilmographyCard(credit) {
    const card = document.createElement('div');
    card.className = 'filmography-card';
    
    const title = credit.title || credit.name;
    const releaseDate = credit.release_date || credit.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
    const rating = credit.vote_average ? credit.vote_average.toFixed(1) : 'N/A';
    const posterPath = credit.poster_path 
        ? `${IMG_BASE_URL}/w342${credit.poster_path}` 
        : 'https://via.placeholder.com/342x513?text=No+Image';
    const character = credit.character || credit.role || '';
    
    card.innerHTML = `
        <div class="filmography-poster">
            <img src="${posterPath}" alt="${title}">
        </div>
        <div class="filmography-info">
            <div class="filmography-title">${title}</div>
            <div class="filmography-meta">
                <span class="filmography-year">${year}</span>
                <span class="filmography-rating">⭐ ${rating}</span>
            </div>
            ${character ? `<div class="filmography-character">as ${character}</div>` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => {
        sessionStorage.setItem('skipIntro', 'true');
        window.location.href = `details.html?id=${credit.id}&type=${credit.media_type}`;
    });
    
    return card;
}

// Loading states
function showLoading() {
    document.getElementById('personLoading').style.display = 'flex';
    document.getElementById('personContent').style.display = 'none';
}

function hideLoading() {
    document.getElementById('personLoading').style.display = 'none';
    document.getElementById('personContent').style.display = 'block';
}

function showError(message) {
    document.getElementById('personLoading').innerHTML = `
        <div style="text-align: center;">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 60px; height: 60px; color: #ef4444; margin-bottom: 20px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p style="font-size: 18px; color: rgba(255,255,255,0.7);">${message}</p>
            <button onclick="window.history.back()" style="margin-top: 20px; padding: 12px 24px; background: #8b5cf6; border: none; border-radius: 25px; color: white; cursor: pointer; font-size: 16px;">Go Back</button>
        </div>
    `;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
    
    // Photo navigation
    const photoPrev = document.getElementById('photoPrev');
    const photoNext = document.getElementById('photoNext');
    
    if (photoPrev) photoPrev.addEventListener('click', prevPhoto);
    if (photoNext) photoNext.addEventListener('click', nextPhoto);
    
    // Keyboard navigation for photos
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevPhoto();
        if (e.key === 'ArrowRight') nextPhoto();
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterFilmography(btn.dataset.filter);
        });
    });
    
    // Initialize page
    initPersonPage();
});

import { 
    getMovieDetails, 
    getTVShowDetails, 
    getSeasonEpisodes, 
    getImageUrl,
    getMovieImages,
    getTVShowImages,
    getMovieVideos,
    getTVShowVideos,
    getEpisodeImages,
    getExternalIds,
    findByExternalId,
    searchMulti
} from './api.js';
import { searchJackett, getJackettKey, setJackettKey, getJackettSettings } from './jackett.js';
import { searchProwlarr, getProwlarrKey, setProwlarrKey, getProwlarrSettings } from './prowlarr.js';
import { getInstalledAddons, installAddon, removeAddon, fetchAddonStreams, parseAddonStream } from './addons.js';
import { initDebridUI, initNodeMPVUI, getDebridSettings } from './debrid.js';
import { 
    fetchStremioMeta, 
    fetchStremioStreams, 
    parseStremioStream, 
    isStremioAddonId,
    extractAddonUrl,
    formatStremioMeta,
    getVideoId
} from './stremio-addon.js';
import { filterTorrents, parseSceneInfo } from './torrent_filter.js';

// Helper functions for parsing torrent/stream info
const detectQuality = (title) => {
    const t = title.toLowerCase();
    if (t.includes('2160p') || t.includes('4k')) return '4K';
    if (t.includes('1080p')) return '1080p';
    if (t.includes('720p')) return '720p';
    if (t.includes('480p')) return '480p';
    return 'Unknown';
};

const detectCodec = (title) => {
    const t = title.toLowerCase();
    if (t.includes('x265') || t.includes('hevc')) return 'HEVC';
    if (t.includes('x264') || t.includes('avc')) return 'x264';
    if (t.includes('av1')) return 'AV1';
    return 'h264';
};

const detectHDR = (title) => {
    const t = title.toLowerCase();
    if (t.includes('dv') || t.includes('dolby vision')) return 'Dolby Vision';
    if (t.includes('hdr10+')) return 'HDR10+';
    if (t.includes('hdr')) return 'HDR';
    return null;
};

const parseSize = (sizeStr) => {
    if (!sizeStr || sizeStr === 'Unknown') return 0;
    const str = sizeStr.toLowerCase();
    const match = str.match(/([\d.]+)\s*(gb|mb|kb|tb)/i);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    switch (unit) {
        case 'tb': return num * 1024 * 1024 * 1024 * 1024;
        case 'gb': return num * 1024 * 1024 * 1024;
        case 'mb': return num * 1024 * 1024;
        case 'kb': return num * 1024;
        default: return num;
    }
};

const params = new URLSearchParams(window.location.search);
const type = params.get('type');
const id = params.get('id');
const addonId = params.get('addonId');
const urlSeason = params.get('season');
const urlEpisode = params.get('episode');

// Track both TMDB ID and IMDB ID separately for proper subtitle loading
let currentTmdbId = null;

if (!type || !id) {
    window.location.href = 'index.html';
}

const isTV = type === 'tv' || type === 'series';
let currentDetails = null;
let currentSeason = urlSeason ? parseInt(urlSeason) : 1;
let currentEpisode = urlEpisode ? parseInt(urlEpisode) : null;
let currentImdbId = null;
let allSources = [];
// Set default provider - if addonId is in URL, use that, otherwise default to PlayTorrio
let currentProvider = addonId || 'torrentless';

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const contentContainer = document.getElementById('content-container');
const backdropImage = document.getElementById('backdrop-image');
const addonTabsContainer = document.getElementById('addon-tabs');
const mediaContainer = document.getElementById('media-container');
const screenshotsSection = document.getElementById('screenshots-section');
const screenshotsGrid = document.getElementById('screenshots-grid');
const trailerSection = document.getElementById('trailer-section');
const trailerContainer = document.getElementById('trailer-container');
const trailerPlaceholder = document.getElementById('trailer-placeholder');
const screenshotsTab = document.getElementById('screenshots-tab');
const trailerTab = document.getElementById('trailer-tab');
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeImageModal = document.getElementById('close-image-modal');

// Trailer data storage
let currentTrailerKey = null;

// Play Loading Overlay functions
const playLoadingOverlay = document.getElementById('play-loading-overlay');
const playLoadingText = document.getElementById('play-loading-text');
let playOperationCancelled = false; // Flag to track if user cancelled

function showPlayLoading(text = 'Preparing stream...') {
    if (playLoadingOverlay) {
        playLoadingText.textContent = text;
        playLoadingOverlay.classList.remove('hidden');
        playOperationCancelled = false; // Reset cancellation flag
    }
}

function hidePlayLoading() {
    if (playLoadingOverlay) {
        playLoadingOverlay.classList.add('hidden');
    }
}

// Check if operation was cancelled
function checkCancelled() {
    if (playOperationCancelled) {
        console.log('[PlayLoading] Operation cancelled by user');
        throw new Error('CANCELLED');
    }
}

// Setup cancel button for play loading overlay
const cancelLoadingBtn = document.getElementById('cancel-loading-btn');
if (cancelLoadingBtn) {
    cancelLoadingBtn.addEventListener('click', () => {
        console.log('[PlayLoading] User cancelled operation');
        playOperationCancelled = true; // Set cancellation flag
        hidePlayLoading();
    });
}

// Fetch subtitles for PlayTorrioPlayer with 5 second timeout
async function fetchSubtitlesForPlayer(tmdbId, imdbId, seasonNum, episodeNum, mediaType) {
    const subtitles = [];
    const TIMEOUT = 5000; // 5 seconds max
    
    // Create a promise that resolves with current subtitles after timeout
    const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
            console.log('[Subtitles] Timeout reached, returning what we have');
            resolve('timeout');
        }, TIMEOUT);
    });
    
    // Fetch subtitles with timeout
    const fetchPromise = (async () => {
        const fetchPromises = [];
        
        // 1. Fetch from Wyzie
        if (tmdbId) {
            fetchPromises.push((async () => {
                try {
                    let wyzieUrl = `https://sub.wyzie.ru/search?id=${tmdbId}`;
                    if (seasonNum && episodeNum) wyzieUrl += `&season=${seasonNum}&episode=${episodeNum}`;
                    
                    const res = await fetch(wyzieUrl);
                    const wyzieData = await res.json();
                    
                    if (wyzieData && wyzieData.length > 0) {
                        wyzieData.forEach(sub => {
                            if (sub.url) {
                                subtitles.push({
                                    provider: 'Wyzie',
                                    name: sub.display || sub.languageName || 'Unknown',
                                    url: sub.url
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.warn('[Subtitles] Wyzie fetch error:', e);
                }
            })());
        }
        
        // 2. Fetch from installed Stremio addons
        fetchPromises.push((async () => {
            try {
                const { getInstalledAddons } = await import('./addons.js');
                const addons = await getInstalledAddons();
                
                const addonPromises = addons.map(async (addon) => {
                    const resources = addon.manifest?.resources || [];
                    const hasSubtitles = resources.some(r => 
                        (typeof r === 'string' && r === 'subtitles') ||
                        (typeof r === 'object' && r?.name === 'subtitles')
                    );
                    
                    if (!hasSubtitles) return;
                    
                    try {
                        let baseUrl = addon.url.replace('/manifest.json', '');
                        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
                        
                        const resourceId = mediaType === 'tv' && seasonNum && episodeNum
                            ? `${imdbId}:${seasonNum}:${episodeNum}`
                            : imdbId;
                        
                        const endpoint = `${baseUrl}/subtitles/${mediaType}/${encodeURIComponent(resourceId)}.json`;
                        const res = await fetch(endpoint);
                        
                        if (res.ok) {
                            const data = await res.json();
                            const addonSubs = data.subtitles || [];
                            const addonName = addon.manifest?.name || 'Addon';
                            
                            addonSubs.forEach(sub => {
                                if (sub.url) {
                                    subtitles.push({
                                        provider: addonName,
                                        name: sub.lang || sub.language || 'Unknown',
                                        url: sub.url
                                    });
                                }
                            });
                        }
                    } catch (e) {
                        // Addon doesn't support subtitles for this content
                    }
                });
                
                await Promise.allSettled(addonPromises);
            } catch (e) {
                console.warn('[Subtitles] Addon fetch error:', e);
            }
        })());
        
        await Promise.allSettled(fetchPromises);
        return 'done';
    })();
    
    // Race between fetch and timeout
    await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log(`[Subtitles] Returning ${subtitles.length} subtitles`);
    return subtitles;
}

// Open player in iframe overlay instead of separate window
async function openPlayerInIframe(options) {
    const {
        url,
        tmdbId,
        imdbId,
        seasonNum,
        episodeNum,
        type,
        isDebrid,
        isBasicMode,
        showName,
        provider,
        providerUrl,
        quality,
        sourceInfo // New: source info for replay
    } = options;
    
    // Save to Continue Watching with source info
    try {
        const resumeKey = `${type || (isTV ? 'tv' : 'movie')}_${tmdbId || id}${seasonNum ? `_s${seasonNum}` : ''}${episodeNum ? `_e${episodeNum}` : ''}`;
        const resumeData = {
            key: resumeKey,
            position: 0,
            duration: 1, // Will be updated by player
            title: showName || currentDetails?.title || currentDetails?.name || 'Unknown',
            poster_path: currentDetails?.poster_path || null,
            tmdb_id: tmdbId || id,
            media_type: type || (isTV ? 'tv' : 'movie'),
            season: seasonNum || null,
            episode: episodeNum || null,
            sourceInfo: sourceInfo || {
                provider: provider || currentProvider || null,
                url: url || null,
                magnet: options.magnet || null,
                torrentTitle: options.torrentTitle || null,
                streamUrl: url || null
            }
        };
        
        fetch('/api/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumeData)
        }).catch(e => console.warn('[Resume] Failed to save:', e));
    } catch (e) {
        console.warn('[Resume] Error preparing save:', e);
    }
    
    // Check player settings
    try {
        const settingsRes = await fetch('/api/settings');
        const settings = await settingsRes.json();
        
        // Determine player type (default to builtin/HTML5)
        const playerType = settings.playerType || (settings.useNodeMPV ? 'nodempv' : 'builtin');
        
        if (playerType === 'nodempv') {
            // Use NodeMPV player via Electron IPC
            if (window.electronAPI?.spawnMpvjsPlayer) {
                console.log('[Player] Using NodeMPV player');
                window.electronAPI.spawnMpvjsPlayer(options);
                setTimeout(hidePlayLoading, 500);
                return { success: true };
            }
            // Fall through to HTML5 if electron API not available
        } else if (playerType === 'playtorrio') {
            // Use PlayTorrioPlayer (external player with IPC bridge and subtitle support)
            console.log('[Player] Using PlayTorrioPlayer with IPC bridge');
            try {
                const mediaType = type || (isTV ? 'tv' : 'movie');
                
                console.log(`[Player] Launching with TMDB:${tmdbId}, IMDB:${imdbId}, S${seasonNum}E${episodeNum}`);
                
                // BasicMode: stop torrent when player closes
                const response = await fetch('/api/playtorrioplayer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        url, 
                        tmdbId: tmdbId || currentTmdbId || id,
                        imdbId: imdbId || currentImdbId,
                        seasonNum,
                        episodeNum,
                        mediaType,
                        stopOnClose: true 
                    })
                });
                const result = await response.json();
                if (result.success) {
                    hidePlayLoading();
                    return { success: true, externalPlayer: true };
                } else {
                    console.warn('[Player] PlayTorrioPlayer failed:', result.error);
                    // Fall through to HTML5 player as fallback
                }
            } catch (e) {
                console.warn('[Player] PlayTorrioPlayer error:', e);
                // Fall through to HTML5 player as fallback
            }
        }
        // playerType === 'builtin' falls through to HTML5 player below
        
    } catch (e) {
        console.warn('[Player] Failed to check settings:', e);
    }
    
    // HTML5 Built-in Player (default fallback)
    console.log('[Player] Using Built-in HTML5 player');
    console.log('[Player] IDs being passed:', { tmdbId, imdbId, seasonNum, episodeNum, type });
    
    // Build player URL with query params for HTML5 player
    const params = new URLSearchParams();
    if (url) params.append('url', url);
    if (tmdbId) params.append('tmdbId', tmdbId);
    if (imdbId) params.append('imdbId', imdbId);
    if (seasonNum) params.append('season', seasonNum);
    if (episodeNum) params.append('episode', episodeNum);
    if (type) params.append('type', type);
    if (isDebrid) params.append('isDebrid', '1');
    if (isBasicMode) params.append('isBasicMode', '1');
    if (showName) params.append('showName', showName);
    if (provider) params.append('provider', provider);
    if (providerUrl) params.append('providerUrl', providerUrl);
    if (quality) params.append('quality', quality);
    
    const playerUrl = `http://localhost:6987/player.html?${params.toString()}`;
    console.log('[Player] Full player URL:', playerUrl);
    
    // Extract stream hash for cleanup (if local torrent stream)
    let streamHash = null;
    let isAltEngine = false;
    if (url && (url.includes('/api/stream-file') || url.includes('/api/alt-stream-file'))) {
        try {
            const urlObj = new URL(url);
            streamHash = urlObj.searchParams.get('hash');
            isAltEngine = url.includes('/api/alt-stream-file');
        } catch (e) {}
    }
    
    // Store alt engine flag for cleanup
    if (streamHash && isAltEngine) {
        window._altEngineStreamHash = streamHash;
    }
    
    // Use the playerOverlay from the parent page (HTML5 player)
    if (window.playerOverlay) {
        window.playerOverlay.open(playerUrl, streamHash, isAltEngine);
        hidePlayLoading();
        return { success: true };
    }
    
    // Fallback to electron API
    if (window.electronAPI?.spawnMpvjsPlayer) {
        window.electronAPI.spawnMpvjsPlayer(options);
        setTimeout(hidePlayLoading, 500);
        return { success: true };
    }
    
    // Last resort: open in new tab
    window.open(playerUrl, '_blank');
    hidePlayLoading();
    return { success: true };
}

// Listen for player window opening to hide the loading overlay
if (window.electronAPI) {
    // When player opens successfully, hide the loading
    window.electronAPI.onPlayerOpened?.(() => {
        hidePlayLoading();
    });
}

const hideImageModal = () => {
    imageModal.classList.add('opacity-0');
    setTimeout(() => {
        imageModal.classList.add('hidden');
        modalImage.src = '';
    }, 300);
};

if (closeImageModal) {
    closeImageModal.addEventListener('click', hideImageModal);
}

if (imageModal) {
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal || e.target.closest('.relative') === null) {
            hideImageModal();
        }
    });
}

const sortSelect = document.getElementById('sort-select');
const qualityFilter = document.getElementById('quality-filter');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsContent = document.getElementById('settings-content');
const closeSettingsBtn = document.getElementById('close-settings');
const saveSettingsBtn = document.getElementById('save-settings');
const toggleConsoleBtn = document.getElementById('toggle-console-btn');
const jackettApiInput = document.getElementById('jackett-api-input');
const jackettUrlInput = document.getElementById('jackett-url-input');
const defaultSortInput = document.getElementById('default-sort-input');
const addonManifestInput = document.getElementById('addon-manifest-input');
const installAddonBtn = document.getElementById('install-addon-btn');
const installedAddonsList = document.getElementById('installed-addons-list');
const addonItemTemplate = document.getElementById('addon-item-template');
// Removed: Season/episode selectors (no longer in UI)
// const seasonSection = document.getElementById('season-section');
// const seasonList = document.getElementById('season-list');
// const episodeSection = document.getElementById('episode-section');
// const episodeGrid = document.getElementById('episode-grid');
const episodesTitle = document.getElementById('episodes-title');
const sourcesSection = document.getElementById('sources-section');
const sourcesList = document.getElementById('sources-list');
// const selectEpisodeMsg = document.getElementById('select-episode-msg');
const sourcesTitle = document.getElementById('sources-title');
// const seasonBtnTemplate = document.getElementById('season-btn-template');
// const episodeCardTemplate = document.getElementById('episode-card-template');
const sourceCardTemplate = document.getElementById('source-card-template');

const renderAddonTabs = async () => {
    if (!addonTabsContainer) return;
    addonTabsContainer.innerHTML = '';
    
    const allAddons = await getInstalledAddons();
    
    // Filter to only show addons that provide 'stream' resources.
    // Metadata-only addons (like AIOMetadata) should NOT appear here.
    const addons = allAddons.filter(addon => {
        const resources = addon.manifest?.resources || [];
        // Check if 'stream' is in resources array (can be string or object with name property)
        const hasStream = resources.some(r => {
            if (typeof r === 'string') return r === 'stream';
            if (typeof r === 'object' && r !== null) return r.name === 'stream';
            return false;
        });
        // Also check if resources array includes 'stream' directly (some manifests use simple string arrays)
        const hasStreamDirect = Array.isArray(resources) && resources.includes('stream');
        return hasStream || hasStreamDirect;
    });
    
    // Jackett tab
    const jackettTab = document.createElement('button');
    jackettTab.className = `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentProvider === 'jackett' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`;
    jackettTab.textContent = 'Jackett';
    jackettTab.onclick = async () => {
        console.log('[AddonTabs] Jackett clicked');
        currentProvider = 'jackett';
        document.querySelectorAll('#addon-tabs button').forEach(btn => {
            btn.classList.remove('bg-purple-600', 'text-white', 'shadow-lg');
            btn.classList.add('bg-gray-800', 'text-gray-400');
        });
        jackettTab.classList.remove('bg-gray-800', 'text-gray-400');
        jackettTab.classList.add('bg-purple-600', 'text-white', 'shadow-lg');
        await renderSources();
    };
    addonTabsContainer.appendChild(jackettTab);

    // Prowlarr tab
    const prowlarrTab = document.createElement('button');
    prowlarrTab.className = `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentProvider === 'prowlarr' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`;
    prowlarrTab.textContent = 'Prowlarr';
    prowlarrTab.onclick = async () => {
        console.log('[AddonTabs] Prowlarr clicked');
        currentProvider = 'prowlarr';
        document.querySelectorAll('#addon-tabs button').forEach(btn => {
            btn.classList.remove('bg-purple-600', 'text-white', 'shadow-lg');
            btn.classList.add('bg-gray-800', 'text-gray-400');
        });
        prowlarrTab.classList.remove('bg-gray-800', 'text-gray-400');
        prowlarrTab.classList.add('bg-purple-600', 'text-white', 'shadow-lg');
        await renderSources();
    };
    addonTabsContainer.appendChild(prowlarrTab);

    // 111477 tab (native source)
    const tab111477 = document.createElement('button');
    tab111477.className = `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentProvider === '111477' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`;
    tab111477.textContent = '111477';
    tab111477.onclick = async () => {
        console.log('[AddonTabs] 111477 clicked');
        currentProvider = '111477';
        document.querySelectorAll('#addon-tabs button').forEach(btn => {
            btn.classList.remove('bg-purple-600', 'text-white', 'shadow-lg');
            btn.classList.add('bg-gray-800', 'text-gray-400');
        });
        tab111477.classList.remove('bg-gray-800', 'text-gray-400');
        tab111477.classList.add('bg-purple-600', 'text-white', 'shadow-lg');
        await renderSources();
    };
    addonTabsContainer.appendChild(tab111477);

    // PlayTorrio (Torrentless) tab (native source)
    const torrentlessTab = document.createElement('button');
    torrentlessTab.className = `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentProvider === 'torrentless' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`;
    torrentlessTab.textContent = 'PlayTorrio';
    torrentlessTab.onclick = async () => {
        console.log('[AddonTabs] PlayTorrio clicked');
        currentProvider = 'torrentless';
        document.querySelectorAll('#addon-tabs button').forEach(btn => {
            btn.classList.remove('bg-purple-600', 'text-white', 'shadow-lg');
            btn.classList.add('bg-gray-800', 'text-gray-400');
        });
        torrentlessTab.classList.remove('bg-gray-800', 'text-gray-400');
        torrentlessTab.classList.add('bg-purple-600', 'text-white', 'shadow-lg');
        await renderSources();
    };
    addonTabsContainer.appendChild(torrentlessTab);

    addons.forEach(addon => {
        const tab = document.createElement('button');
        const addonId = addon.manifest?.id || addon.id;
        const addonName = addon.manifest?.name || addon.name;
        const addonLogo = addon.manifest?.logo || addon.logo;

        tab.className = `px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${currentProvider === addonId ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`;
        if (addonLogo) {
            const img = document.createElement('img');
            img.src = addonLogo;
            img.className = 'w-3 h-3 object-contain';
            tab.appendChild(img);
        }
        const nameSpan = document.createElement('span');
        nameSpan.textContent = addonName;
        tab.appendChild(nameSpan);

        tab.onclick = async () => {
            console.log('[AddonTabs] Addon clicked:', addonId);
            currentProvider = addonId;
            document.querySelectorAll('#addon-tabs button').forEach(btn => {
                btn.classList.remove('bg-purple-600', 'text-white', 'shadow-lg');
                btn.classList.add('bg-gray-800', 'text-gray-400');
            });
            tab.classList.remove('bg-gray-800', 'text-gray-400');
            tab.classList.add('bg-purple-600', 'text-white', 'shadow-lg');
            await renderSources();
        };
        addonTabsContainer.appendChild(tab);
    });
};

const renderDetails = (data) => {
    if (data.backdrop_path) {
        backdropImage.style.backgroundImage = `url(${getImageUrl(data.backdrop_path, 'w1280')})`;
        backdropImage.classList.remove('opacity-0');
    }
    const poster = document.getElementById('detail-poster');
    if (poster) poster.src = getImageUrl(data.poster_path, 'w500');
    
    const title = document.getElementById('detail-title');
    if (title) title.textContent = data.title || data.name;
    
    const date = data.release_date || data.first_air_date;
    const yearEl = document.getElementById('detail-year');
    if (yearEl) yearEl.textContent = date ? date.split('-')[0] : '';
    
    const runtime = data.runtime || (data.episode_run_time ? data.episode_run_time[0] : 0);
    const runtimeEl = document.getElementById('detail-runtime');
    if (runtime && runtimeEl) {
        runtimeEl.textContent = `${runtime} min`;
        const sep = document.querySelector('.separator');
        if (sep) sep.classList.remove('hidden');
    }
    
    const ratingEl = document.getElementById('detail-rating');
    if (ratingEl) ratingEl.textContent = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
    
    const genresEl = document.getElementById('detail-genres');
    if (data.genres && genresEl) {
        genresEl.innerHTML = '';
        data.genres.forEach(genre => {
            const span = document.createElement('span');
            span.className = 'px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30';
            span.textContent = genre.name;
            genresEl.appendChild(span);
        });
    }
    const director = data.credits?.crew?.find(c => c.job === 'Director')?.name;
    const dirEl = document.getElementById('detail-director');
    if (director && dirEl) {
        dirEl.textContent = director;
        const dirContainer = document.getElementById('detail-director-container');
        if (dirContainer) dirContainer.classList.remove('hidden');
    }
    const overviewEl = document.getElementById('detail-overview');
    if (overviewEl) overviewEl.textContent = data.overview || 'No description available.';
    
    const castEl = document.getElementById('detail-cast');
    if (data.credits?.cast && castEl) {
        castEl.innerHTML = '';
        data.credits.cast.slice(0, 8).forEach(member => {
            const span = document.createElement('span');
            span.className = 'px-3 py-1.5 bg-gray-800/60 text-gray-300 rounded-full text-sm';
            span.textContent = member.name;
            castEl.appendChild(span);
        });
    }
};

const loadScreenshots = async () => {
    try {
        const fetchFn = isTV ? getTVShowImages : getMovieImages;
        const data = await fetchFn(id);
        const images = data.backdrops || [];
        
        if (images.length > 0) {
            mediaContainer.classList.remove('hidden');
            screenshotsGrid.innerHTML = '';
            
            images.slice(0, 4).forEach((img) => {
                const url = getImageUrl(img.file_path, 'w500');
                const fullUrl = getImageUrl(img.file_path, 'original');
                
                const div = document.createElement('div');
                div.className = 'aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all transform hover:scale-[1.02] bg-gray-800';
                div.innerHTML = `<img src="${url}" class="w-full h-full object-cover" loading="lazy">`;
                
                div.onclick = () => {
                    modalImage.src = fullUrl;
                    imageModal.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        imageModal.classList.remove('opacity-0');
                    });
                };
                
                screenshotsGrid.appendChild(div);
            });
        }
    } catch (e) {
        console.warn('Failed to load screenshots:', e);
    }
};

const loadTrailer = async () => {
    try {
        const fetchFn = isTV ? getTVShowVideos : getMovieVideos;
        const data = await fetchFn(id);
        const videos = data.results || [];
        
        // Find the best trailer (prefer official YouTube trailers)
        const trailer = videos.find(v => 
            v.site === 'YouTube' && 
            v.type === 'Trailer' && 
            v.official === true
        ) || videos.find(v => 
            v.site === 'YouTube' && 
            v.type === 'Trailer'
        ) || videos.find(v => 
            v.site === 'YouTube' && 
            (v.type === 'Teaser' || v.type === 'Clip')
        );
        
        if (trailer) {
            currentTrailerKey = trailer.key;
            // Show trailer tab as available
            trailerTab.classList.remove('opacity-50', 'cursor-not-allowed');
            trailerTab.disabled = false;
        } else {
            currentTrailerKey = null;
            // Dim the trailer tab if no trailer available
            trailerTab.classList.add('opacity-50');
        }
    } catch (e) {
        console.warn('Failed to load trailer:', e);
        currentTrailerKey = null;
    }
};

// Tab switching logic
const switchToScreenshots = () => {
    screenshotsTab.classList.remove('bg-gray-800', 'text-gray-400');
    screenshotsTab.classList.add('bg-purple-600', 'text-white');
    trailerTab.classList.remove('bg-purple-600', 'text-white');
    trailerTab.classList.add('bg-gray-800', 'text-gray-400');
    
    screenshotsSection.classList.remove('hidden');
    trailerSection.classList.add('hidden');
    
    // Stop trailer playback when switching away
    const iframe = trailerContainer.querySelector('iframe');
    if (iframe) {
        iframe.src = '';
    }
};

const switchToTrailer = () => {
    if (!currentTrailerKey) {
        // No trailer available, show placeholder
        trailerPlaceholder.classList.remove('hidden');
        const iframe = trailerContainer.querySelector('iframe');
        if (iframe) iframe.remove();
    } else {
        trailerPlaceholder.classList.add('hidden');
        
        // Create or update iframe
        let iframe = trailerContainer.querySelector('iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.className = 'w-full h-full';
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('frameborder', '0');
            trailerContainer.appendChild(iframe);
        }
        iframe.src = `https://www.youtube.com/embed/${currentTrailerKey}?autoplay=1&rel=0`;
    }
    
    trailerTab.classList.remove('bg-gray-800', 'text-gray-400');
    trailerTab.classList.add('bg-purple-600', 'text-white');
    screenshotsTab.classList.remove('bg-purple-600', 'text-white');
    screenshotsTab.classList.add('bg-gray-800', 'text-gray-400');
    
    trailerSection.classList.remove('hidden');
    screenshotsSection.classList.add('hidden');
};

// Initialize tab click handlers
if (screenshotsTab) {
    screenshotsTab.addEventListener('click', switchToScreenshots);
}
if (trailerTab) {
    trailerTab.addEventListener('click', switchToTrailer);
}

// ============================================
// EMBEDDED SERVERS FUNCTIONALITY
// ============================================

const embeddedServers = {
    'CinemaOS': (type, id, season, episode) =>
        type === 'movie'
            ? `https://cinemaos.tech/player/${id}`
            : `https://cinemaos.tech/player/${id}/${season}/${episode}`,
    'Videasy': (type, id, season, episode) =>
        type === 'movie'
            ? `https://player.videasy.net/movie/${id}`
            : `https://player.videasy.net/tv/${id}/${season}/${episode}`,
    'Vidlink': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidlink.pro/movie/${id}`
            : `https://vidlink.pro/tv/${id}/${season}/${episode}`,
    'LunaStream': (type, id, season, episode) =>
        type === 'movie'
            ? `https://lunastream.fun/watch/movie/${id}`
            : `https://lunastream.fun/watch/tv/${id}/${season}/${episode}`,
    'VidRock': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidrock.net/movie/${id}`
            : `https://vidrock.net/tv/${id}/${season}/${episode}`,
    'HexaWatch': (type, id, season, episode) =>
        type === 'movie'
            ? `https://hexa.watch/watch/movie/${id}`
            : `https://hexa.watch/watch/tv/${id}/${season}/${episode}`,
    'FMovies': (type, id, season, episode) =>
        type === 'movie'
            ? `https://www.fmovies.gd/watch/movie/${id}`
            : `https://www.fmovies.gd/watch/tv/${id}/${season}/${episode}`,
    'Xprime': (type, id, season, episode) =>
        type === 'movie'
            ? `https://xprime.tv/watch/${id}`
            : `https://xprime.tv/watch/${id}/${season}/${episode}`,
    'Vidnest': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidnest.fun/movie/${id}`
            : `https://vidnest.fun/tv/${id}/${season}/${episode}`,
    'VeloraTV': (type, id, season, episode) =>
        type === 'movie'
            ? `https://veloratv.ru/watch/movie/${id}`
            : `https://veloratv.ru/watch/tv/${id}/${season}/${episode}`,
    'Vidfast 1': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidfast.pro/movie/${id}`
            : `https://vidfast.pro/tv/${id}/${season}/${episode}`,
    'Vidfast 2': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidfast.to/embed/movie/${id}`
            : `https://vidfast.to/embed/tv/${id}/${season}/${episode}`,
    '111Movies': (type, id, season, episode) =>
        type === 'movie'
            ? `https://111movies.com/movie/${id}`
            : `https://111movies.com/tv/${id}/${season}/${episode}`,
    'VidSrc 1': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.wtf/api/1/movie/?id=${id}&color=e01621`
            : `https://vidsrc.wtf/api/1/tv/?id=${id}&s=${season}&e=${episode}&color=e01621`,
    'VidSrc 2': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.wtf/api/2/movie/?id=${id}&color=e01621`
            : `https://vidsrc.wtf/api/2/tv/?id=${id}&s=${season}&e=${episode}&color=e01621`,
    'VidSrc 3': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.wtf/api/3/movie/?id=${id}&color=e01621`
            : `https://vidsrc.wtf/api/3/tv/?id=${id}&s=${season}&e=${episode}&color=e01621`,
    'VidSrc 4': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.wtf/api/4/movie/?id=${id}&color=e01621`
            : `https://vidsrc.wtf/api/4/tv/?id=${id}&s=${season}&e=${episode}&color=e01621`,
    'PrimeSrc': (type, id, season, episode) =>
        type === 'movie'
            ? `https://primesrc.me/embed/movie?tmdb=${id}`
            : `https://primesrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
    'MovieClub': (type, id, season, episode) =>
        type === 'movie'
            ? `https://moviesapi.club/movie/${id}`
            : `https://moviesapi.club/tv/${id}-${season}-${episode}`,
    'MapleTV': (type, id, season, episode) =>
        type === 'movie'
            ? `https://mapple.uk/watch/movie/${id}`
            : `https://mapple.uk/watch/tv/${id}-${season}-${episode}`,
    '2Embed': (type, id, season, episode) =>
        `https://multiembed.mov/?video_id=${id}&tmdb=1&media_type=${type}${type === 'tv' ? `&season=${season}&episode=${episode}` : ''}`,
    'SmashyStream': (type, id, season, episode) =>
        type === 'movie'
            ? `https://player.smashy.stream/movie/${id}`
            : `https://player.smashy.stream/tv/${id}?s=${season}&e=${episode}`,
    'Autoembed': (type, id, season, episode) =>
        type === 'movie'
            ? `https://player.autoembed.cc/embed/movie/${id}`
            : `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
    'GoDrivePlayer': (type, id, season, episode) =>
        type === 'movie'
            ? `https://godriveplayer.com/player.php?imdb=${id}`
            : `https://godriveplayer.com/player.php?type=tv&tmdb=${id}&season=${season}&episode=${episode}`,
    'VidWTF Premium': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.wtf/api/4/movie/?id=${id}&color=e01621`
            : `https://vidsrc.wtf/api/4/tv/?id=${id}&s=${season}&e=${episode}&color=e01621`,
    'CinemaOS Embed': (type, id, season, episode) =>
        type === 'movie'
            ? `https://cinemaos.tech/embed/movie/${id}`
            : `https://cinemaos.tech/embed/tv/${id}/${season}/${episode}`,
    'GDrivePlayer API': (type, id, season, episode) =>
        type === 'movie'
            ? `https://databasegdriveplayer.xyz/player.php?tmdb=${id}`
            : `https://database.gdriveplayer.us/player.php?type=series&tmdb=${id}&season=${season}&episode=${episode}`,
    'Nontongo': (type, id, season, episode) =>
        type === 'movie'
            ? `https://nontongo.win/embed/movie/${id}`
            : `https://nontongo.win/embed/tv/${id}/${season}/${episode}`,
    'SpencerDevs': (type, id, season, episode) =>
        type === 'movie'
            ? `https://spencerdevs.xyz/movie/${id}`
            : `https://spencerdevs.xyz/tv/${id}/${season}/${episode}`,
    'VidAPI': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidapi.xyz/embed/movie/${id}`
            : `https://vidapi.xyz/embed/tv/${id}/${season}/${episode}`,
    'Vidify': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidify.top/embed/movie/${id}`
            : `https://vidify.top/embed/tv/${id}/${season}/${episode}`,
    'VidSrc CX': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.cx/embed/movie/${id}`
            : `https://vidsrc.cx/embed/tv/${id}/${season}/${episode}`,
    'VidSrc ME': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.me/embed/movie/${id}`
            : `https://vidsrc.me/embed/tv/${id}/${season}/${episode}`,
    'VidSrc TO': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.to/embed/movie/${id}`
            : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
    'VidSrc VIP': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.vip/embed/movie/${id}`
            : `https://vidsrc.vip/embed/tv/${id}/${season}/${episode}`,
    'VidSrc CC': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidsrc.cc/v2/embed/movie/${id}`
            : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`,
    'VidNest': (type, id, season, episode) =>
        type === 'movie'
            ? `https://vidnest.fun/movie/${id}`
            : `https://vidnest.fun/tv/${id}/${season}/${episode}`
};

// DOM elements for embedded servers
const embeddedServersTab = document.getElementById('embedded-servers-tab');
const torrentSourcesTab = document.getElementById('torrent-sources-tab');
const embeddedServersSection = document.getElementById('embedded-servers-section');
const torrentSourcesSection = document.getElementById('torrent-sources-section');
const embeddedServerSelect = document.getElementById('embedded-server-select');
const embeddedWatchBtn = document.getElementById('embedded-watch-btn');
const embeddedEpisodeWarning = document.getElementById('embedded-episode-warning');
const embeddedPlayerContainer = document.getElementById('embedded-player-container');
const embeddedPlayerIframe = document.getElementById('embedded-player-iframe');

// Populate server dropdown
if (embeddedServerSelect) {
    Object.keys(embeddedServers).forEach(serverName => {
        const option = document.createElement('option');
        option.value = serverName;
        option.textContent = serverName;
        embeddedServerSelect.appendChild(option);
    });
}

// Tab switching for embedded servers vs torrent sources
if (embeddedServersTab) {
    embeddedServersTab.addEventListener('click', () => {
        embeddedServersTab.classList.remove('bg-gray-800', 'text-gray-400');
        embeddedServersTab.classList.add('bg-purple-600', 'text-white');
        torrentSourcesTab.classList.remove('bg-purple-600', 'text-white');
        torrentSourcesTab.classList.add('bg-gray-800', 'text-gray-400');
        
        embeddedServersSection.classList.remove('hidden');
        torrentSourcesSection.classList.add('hidden');
        
        // Update warning visibility for TV shows
        if (isTV && !currentEpisode) {
            embeddedEpisodeWarning.classList.remove('hidden');
        } else {
            embeddedEpisodeWarning.classList.add('hidden');
        }
    });
}

if (torrentSourcesTab) {
    torrentSourcesTab.addEventListener('click', () => {
        torrentSourcesTab.classList.remove('bg-gray-800', 'text-gray-400');
        torrentSourcesTab.classList.add('bg-purple-600', 'text-white');
        embeddedServersTab.classList.remove('bg-purple-600', 'text-white');
        embeddedServersTab.classList.add('bg-gray-800', 'text-gray-400');
        
        torrentSourcesSection.classList.remove('hidden');
        embeddedServersSection.classList.add('hidden');
        
        // Stop any playing embedded video
        if (embeddedPlayerIframe) {
            embeddedPlayerIframe.src = '';
        }
        embeddedPlayerContainer.classList.add('hidden');
    });
}

// Watch button for embedded servers
if (embeddedWatchBtn) {
    embeddedWatchBtn.addEventListener('click', () => {
        // Check if TV show and no episode selected
        if (isTV && !currentEpisode) {
            embeddedEpisodeWarning.classList.remove('hidden');
            return;
        }
        
        const selectedServer = embeddedServerSelect.value;
        const serverFn = embeddedServers[selectedServer];
        
        if (!serverFn) {
            console.error('Server not found:', selectedServer);
            return;
        }
        
        const mediaType = isTV ? 'tv' : 'movie';
        const tmdbId = id;
        const season = currentSeason || 1;
        const episode = currentEpisode || 1;
        
        const embedUrl = serverFn(mediaType, tmdbId, season, episode);
        console.log('[Embedded Server] Loading:', selectedServer, embedUrl);
        
        // Save to Continue Watching with embedded server info
        try {
            const resumeKey = `${mediaType}_${tmdbId}${isTV ? `_s${season}_e${episode}` : ''}`;
            const resumeData = {
                key: resumeKey,
                position: 0,
                duration: 1,
                title: currentDetails?.title || currentDetails?.name || 'Unknown',
                poster_path: currentDetails?.poster_path || null,
                tmdb_id: tmdbId,
                media_type: mediaType,
                season: isTV ? season : null,
                episode: isTV ? episode : null,
                sourceInfo: {
                    provider: 'embedded',
                    embeddedServer: selectedServer,
                    url: embedUrl
                }
            };
            
            fetch('/api/resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumeData)
            }).catch(e => console.warn('[Resume] Failed to save:', e));
        } catch (e) {
            console.warn('[Resume] Error:', e);
        }
        
        // Show player and load iframe
        embeddedPlayerContainer.classList.remove('hidden');
        embeddedPlayerIframe.src = embedUrl;
        
        // Scroll player into view but keep it centered, not at the very top
        embeddedPlayerContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

// Function to update embedded player when episode changes (if player is visible)
const updateEmbeddedPlayerForEpisode = () => {
    // Only update if embedded servers section is visible and player is already showing
    if (embeddedServersSection && 
        !embeddedServersSection.classList.contains('hidden') && 
        embeddedPlayerContainer && 
        !embeddedPlayerContainer.classList.contains('hidden') &&
        currentEpisode) {
        
        const selectedServer = embeddedServerSelect.value;
        const serverFn = embeddedServers[selectedServer];
        
        if (!serverFn) return;
        
        const mediaType = isTV ? 'tv' : 'movie';
        const tmdbId = id;
        const season = currentSeason || 1;
        const episode = currentEpisode;
        
        const embedUrl = serverFn(mediaType, tmdbId, season, episode);
        console.log('[Embedded Server] Auto-updating for episode:', selectedServer, embedUrl);
        
        embeddedPlayerIframe.src = embedUrl;
        
        // Save to Continue Watching
        try {
            const resumeKey = `${mediaType}_${tmdbId}_s${season}_e${episode}`;
            const resumeData = {
                key: resumeKey,
                position: 0,
                duration: 1,
                title: currentDetails?.title || currentDetails?.name || 'Unknown',
                poster_path: currentDetails?.poster_path || null,
                tmdb_id: tmdbId,
                media_type: mediaType,
                season: season,
                episode: episode,
                sourceInfo: {
                    provider: 'embedded',
                    embeddedServer: selectedServer,
                    url: embedUrl
                }
            };
            
            fetch('/api/resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumeData)
            }).catch(e => console.warn('[Resume] Failed to save:', e));
        } catch (e) {
            console.warn('[Resume] Error:', e);
        }
    }
};

// Update embedded warning when episode changes
const updateEmbeddedWarning = () => {
    if (embeddedEpisodeWarning && !embeddedServersSection.classList.contains('hidden')) {
        if (isTV && !currentEpisode) {
            embeddedEpisodeWarning.classList.remove('hidden');
        } else {
            embeddedEpisodeWarning.classList.add('hidden');
        }
    }
};

// ============================================
// END EMBEDDED SERVERS
// ============================================

const renderSources = async () => {
    // Update embedded warning when sources are rendered
    updateEmbeddedWarning();
    
    if (isTV && !currentEpisode) {
        sourcesList.innerHTML = '';
        sourcesList.classList.add('hidden');
        // Removed: selectEpisodeMsg (no longer in UI)
        return;
    }
    sourcesList.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div><p class="text-gray-500 text-sm mt-4">Searching for sources...</p></div>';
    sourcesList.classList.remove('hidden');
    // Removed: selectEpisodeMsg (no longer in UI)
    if (isTV) {
        sourcesTitle.innerHTML = currentEpisode ? `Available Sources <span class="text-gray-500 text-sm font-normal">— S${String(currentSeason).padStart(2, '0')}E${String(currentEpisode).padStart(2, '0')}</span>` : `Available Sources <span class="text-gray-500 text-sm font-normal">— Season ${currentSeason} Pack</span>`;
    }
    try {
        if (currentProvider === 'jackett') {
            let queries = [];
            const title = currentDetails.title || currentDetails.name;
            
            // Extract year from release_date or first_air_date
            let year = '';
            if (currentDetails.release_date) {
                year = String(currentDetails.release_date).split('-')[0];
            } else if (currentDetails.first_air_date) {
                year = String(currentDetails.first_air_date).split('-')[0];
            } else if (currentDetails.releaseInfo) {
                // For custom addon items that might have releaseInfo
                year = String(currentDetails.releaseInfo).match(/\d{4}/)?.[0] || '';
            }
            
            const metadata = { 
                title: title, 
                type: type, 
                year: year 
            };
            
            console.log('[Jackett] Searching for:', { title, year, type, isTV });
            
            if (isTV) {
                const s = String(currentSeason).padStart(2, '0');
                metadata.season = currentSeason;
                if (currentEpisode) {
                    const e = String(currentEpisode).padStart(2, '0');
                    queries.push(`${title} S${s}E${e}`);
                    queries.push(`${title} S${s}`);
                    metadata.episode = currentEpisode;
                } else {
                    queries.push(`${title} S${s}`);
                    metadata.episode = null;
                }
            } else {
                // For movies, try with and without year
                if (year) {
                    queries.push(`${title} ${year}`);
                }
                queries.push(title); // Also try without year
            }
            
            console.log('[Jackett] Queries:', queries);
            
            try {
                allSources = await searchJackett(queries, metadata);
                console.log('[Jackett] Found sources:', allSources.length);
            } catch (err) {
                if (err.message === 'JACKETT_CONNECTION_ERROR') {
                    sourcesList.innerHTML = `
                        <div class="col-span-full text-center py-12 px-6">
                            <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 class="text-white font-bold text-lg mb-2">Jackett Connection Failed</h3>
                            <p class="text-gray-400 text-sm max-w-md mx-auto">
                                Jackett is not installed, turned off, or the API key is incorrect. 
                                Please ensure Jackett is running and configured correctly in Settings.
                            </p>
                        </div>`;
                    return;
                }
                throw err; // Re-throw if it's a different error
            }
        } else if (currentProvider === 'prowlarr') {
            let queries = [];
            const title = currentDetails.title || currentDetails.name;
            
            // Extract year from release_date or first_air_date
            let year = '';
            if (currentDetails.release_date) {
                year = String(currentDetails.release_date).split('-')[0];
            } else if (currentDetails.first_air_date) {
                year = String(currentDetails.first_air_date).split('-')[0];
            } else if (currentDetails.releaseInfo) {
                year = String(currentDetails.releaseInfo).match(/\d{4}/)?.[0] || '';
            }
            
            const metadata = { 
                title: title, 
                type: type, 
                year: year 
            };
            
            console.log('[Prowlarr] Searching for:', { title, year, type, isTV });
            
            if (isTV) {
                const s = String(currentSeason).padStart(2, '0');
                metadata.season = currentSeason;
                if (currentEpisode) {
                    const e = String(currentEpisode).padStart(2, '0');
                    queries.push(`${title} S${s}E${e}`);
                    queries.push(`${title} S${s}`);
                    metadata.episode = currentEpisode;
                } else {
                    queries.push(`${title} S${s}`);
                    metadata.episode = null;
                }
            } else {
                // For movies, try with and without year
                if (year) {
                    queries.push(`${title} ${year}`);
                }
                queries.push(title); // Also try without year
            }
            
            console.log('[Prowlarr] Queries:', queries);
            
            try {
                allSources = await searchProwlarr(queries, metadata);
                console.log('[Prowlarr] Found sources:', allSources.length);
            } catch (err) {
                if (err.message === 'PROWLARR_CONNECTION_ERROR') {
                    sourcesList.innerHTML = `
                        <div class="col-span-full text-center py-12 px-6">
                            <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 class="text-white font-bold text-lg mb-2">Prowlarr Connection Failed</h3>
                            <p class="text-gray-400 text-sm max-w-md mx-auto">
                                Prowlarr is not installed, turned off, or the API key is incorrect. 
                                Please ensure Prowlarr is running and configured correctly in Settings.
                            </p>
                        </div>`;
                    return;
                }
                throw err; // Re-throw if it's a different error
            }
        } else if (currentProvider === '111477') {
            // 111477 native source - direct streaming links
            console.log('[Sources] Fetching from 111477...');
            
            try {
                const tmdbId = id;
                
                if (!tmdbId) {
                    sourcesList.innerHTML = '<div class="text-center py-12 text-gray-500">No TMDB ID available.</div>';
                    return;
                }
                
                let apiUrl;
                
                if (isTV) {
                    if (currentEpisode) {
                        apiUrl = `http://localhost:6987/111477/api/tmdb/tv/${encodeURIComponent(tmdbId)}/season/${encodeURIComponent(currentSeason)}/episode/${encodeURIComponent(currentEpisode)}`;
                    } else {
                        sourcesList.innerHTML = '<div class="text-center py-12 text-gray-500">Please select an episode to view sources.</div>';
                        return;
                    }
                } else {
                    apiUrl = `http://localhost:6987/111477/api/tmdb/movie/${encodeURIComponent(tmdbId)}`;
                }
                
                console.log('[111477] Fetching from:', apiUrl);
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    console.error('[111477] API returned error:', response.status, response.statusText);
                    sourcesList.innerHTML = `<div class="text-center py-12 text-red-400">111477 search failed (${response.status}). Try again later.</div>`;
                    return;
                }
                
                const data = await response.json();
                
                if (data.error) {
                    console.error('[111477] API error:', data.error);
                    sourcesList.innerHTML = `<div class="text-center py-12 text-red-400">111477: ${data.error}</div>`;
                    return;
                }
                
                // Handle multi-result format from 111477 API
                let allFiles = [];
                if (Array.isArray(data?.results)) {
                    data.results.forEach(result => {
                        if (result.files && Array.isArray(result.files)) {
                            allFiles = allFiles.concat(result.files.map(f => ({ ...f, source: result.source || '111477' })));
                        }
                    });
                } else if (data?.files && Array.isArray(data.files)) {
                    allFiles = data.files.map(f => ({ ...f, source: '111477' }));
                }
                
                console.log('[111477] Found', allFiles.length, 'files');
                
                if (allFiles.length === 0) {
                    allSources = [];
                } else {
                    // Convert 111477 files to standard source format
                    allSources = allFiles.map(file => {
                        const fileTitle = file.filename || file.name || 'Unknown';
                        const quality = detectQuality(fileTitle);
                        const codec = detectCodec(fileTitle);
                        const size = file.size || 'Unknown';
                        
                        return {
                            title: fileTitle,
                            quality: quality,
                            codec: codec,
                            size: size,
                            sizeBytes: parseSize(size),
                            seeders: 0, // Direct links don't have seeders
                            indexer: file.source || '111477',
                            link: file.url || file.link,
                            magnet: null,
                            hdr: detectHDR(fileTitle)
                        };
                    });
                }
            } catch (err) {
                console.error('[111477] Error:', err);
                allSources = [];
                sourcesList.innerHTML = `<div class="text-center py-12 text-red-400">111477 connection failed. Make sure the app server is running.</div>`;
                return;
            }
        } else if (currentProvider === 'torrentless') {
            // PlayTorrio (Ultimate) native source - aggregates 12 torrent sources
            console.log('[Sources] Fetching from PlayTorrio Ultimate...');
            
            try {
                const title = currentDetails?.title || currentDetails?.name || '';
                const year = (currentDetails?.release_date || currentDetails?.first_air_date || '').split('-')[0];
                
                if (!title) {
                    sourcesList.innerHTML = '<div class="text-center py-12 text-gray-500">No title available for search.</div>';
                    return;
                }
                
                let queries = [];
                if (isTV && currentEpisode) {
                    const s = String(currentSeason).padStart(2, '0');
                    const e = String(currentEpisode).padStart(2, '0');
                    // Search for both season pack AND specific episode (like Jackett)
                    queries.push(`${title} S${s}`);           // Season pack
                    queries.push(`${title} S${s}E${e}`);      // Specific episode
                } else if (isTV) {
                    const s = String(currentSeason).padStart(2, '0');
                    queries.push(`${title} S${s}`);
                } else {
                    queries.push(`${title} ${year}`);
                }
                
                console.log('[PlayTorrio Ultimate] Searching with queries:', queries);
                
                // Fetch results for all queries in parallel using the new ultimate endpoint
                const results = await Promise.all(
                    queries.map(async (query) => {
                        const ultimateUrl = `http://localhost:6987/api/ultimate?query=${encodeURIComponent(query)}`;
                        console.log('[PlayTorrio Ultimate] Fetching:', ultimateUrl);
                        
                        const response = await fetch(ultimateUrl);
                        
                        if (!response.ok) {
                            console.error(`[PlayTorrio Ultimate] API Error for query "${query}":`, response.status);
                            return [];
                        }
                        
                        const data = await response.json();
                        
                        if (data.error) {
                            console.error(`[PlayTorrio Ultimate] Error for query "${query}":`, data.error);
                            return [];
                        }
                        
                        return data.results || [];
                    })
                );
                
                // Flatten and deduplicate results
                const allItems = results.flat();
                const seen = new Set();
                const uniqueItems = [];
                
                allItems.forEach(item => {
                    const id = item.magnet || item.name;
                    if (id && !seen.has(id)) {
                        seen.add(id);
                        uniqueItems.push(item);
                    }
                });
                
                console.log('[PlayTorrio Ultimate] Found', uniqueItems.length, 'unique results from', queries.length, 'queries');
                
                if (uniqueItems.length === 0) {
                    allSources = [];
                } else {
                    // Convert ultimate items to standard format for filtering
                    const convertedItems = uniqueItems.map(item => {
                        const itemTitle = item.name || 'Unknown';
                        const seeders = parseInt((item.seeders || '0').toString().replace(/,/g, ''), 10) || 0;
                        const sizeStr = item.size || 'Unknown';
                        
                        return {
                            Title: itemTitle,
                            Size: sizeStr,  // Keep original size string
                            SizeBytes: parseSize(sizeStr),  // Add bytes for sorting
                            Seeders: seeders,
                            Peers: 0,
                            Tracker: item.source || 'PlayTorrio',
                            Link: null,
                            MagnetUri: item.magnet,
                            Guid: item.magnet
                        };
                    });
                    
                    // Apply same filters as Jackett/Prowlarr
                    const metadata = {
                        title: title,
                        type: type,
                        season: isTV ? currentSeason : null,
                        episode: isTV && currentEpisode ? currentEpisode : null,
                        year: year
                    };
                    
                    console.log('[PlayTorrio Ultimate] Applying filters with metadata:', metadata);
                    allSources = filterTorrents(convertedItems, metadata);
                    console.log('[PlayTorrio Ultimate] After filtering:', allSources.length, 'results');
                }
            } catch (err) {
                console.error('[PlayTorrio Ultimate] Error:', err);
                allSources = [];
                sourcesList.innerHTML = `<div class="text-center py-12 text-red-400">PlayTorrio connection failed. Make sure the app server is running.</div>`;
                return;
            }
        } else {
            console.log(`[Sources] Fetching for addon provider: ${currentProvider}`);
            console.log('[Sources] currentDetails:', { 
                hasStremioMeta: !!currentDetails._stremioMeta, 
                hasAddonUrl: !!currentDetails._addonUrl,
                addonId: currentDetails._addonId,
                id: currentDetails.id
            });
            
            const addons = await getInstalledAddons();
            const addon = addons.find(a => (a.manifest?.id || a.id) === currentProvider);
            
            if (!addon) {
                 console.error('[Sources] Addon not found in installed list:', currentProvider);
                 console.log('[Sources] Available addons:', addons.map(a => a.manifest?.id || a.id));
                 sourcesList.innerHTML = '<div class="text-center py-12 text-red-500">Addon not found (check console).</div>';
                 return;
            }

            console.log('[Sources] Found addon:', addon.manifest?.name || addon.name);

            try {
                // Check if this is a custom Stremio addon ID (not TMDB/IMDB)
                const isCustomId = isStremioAddonId(id);
                
                if (isCustomId || (currentDetails._stremioMeta && currentDetails._addonUrl)) {
                    console.log('[Sources] Using Stremio protocol for custom ID...');
                    
                    // Get addon URL
                    let addonBaseUrl = currentDetails._addonUrl;
                    if (!addonBaseUrl) {
                        addonBaseUrl = addon.url.replace('/manifest.json', '');
                        if (addonBaseUrl.endsWith('/')) addonBaseUrl = addonBaseUrl.slice(0, -1);
                    }
                    
                    // Get or construct video ID
                    let videoId;
                    if (currentDetails._stremioMeta) {
                        videoId = getVideoId(
                            currentDetails._stremioMeta,
                            isTV ? currentSeason : null,
                            isTV ? currentEpisode : null
                        );
                    } else {
                        // Construct video ID from current state
                        if (isTV && currentEpisode) {
                            videoId = `${id}:${currentSeason}:${currentEpisode}`;
                        } else {
                            videoId = id;
                        }
                    }
                    
                    console.log('[Sources] Video ID:', videoId);
                    console.log('[Sources] Addon URL:', addonBaseUrl);
                    
                    // Use the stored Stremio type or convert from current type
                    const stremioType = currentDetails._stremioType || (type === 'tv' ? 'series' : type);
                    console.log('[Sources] Stremio type:', stremioType);
                    console.log('[Sources] Full stream URL will be:', `${addonBaseUrl}/stream/${stremioType}/${videoId}.json`);
                    
                    try {
                        const streams = await fetchStremioStreams(
                            addonBaseUrl,
                            stremioType,
                            videoId
                        );
                        
                        console.log('[Sources] Got Stremio streams:', streams.length);
                        
                        allSources = streams.map(stream => {
                            const parsed = parseStremioStream(stream);
                            const addonName = addon.manifest?.name || addon.name;
                            
                            console.log('[StreamMapping]', {
                                streamTitle: stream.name || stream.title,
                                parsedType: parsed.type,
                                parsedUrl: parsed.url,
                                externalUrl: stream.externalUrl
                            });
                            
                            return {
                                title: parsed.title,
                                fullTitle: stream.description || stream.title || parsed.title, // Store full description
                                quality: parsed.quality || 'Unknown',
                                codec: 'Unknown',
                                size: 'N/A',
                                sizeBytes: 0,
                                seeders: 0,
                                indexer: addonName,
                                link: parsed.type === 'url' ? parsed.url : (parsed.type === 'external' ? parsed.url : null),
                                magnet: parsed.type === 'torrent' ? parsed.url : null,
                                url: parsed.url,
                                streamType: parsed.type,
                                hdr: false,
                                description: stream.description, // Keep original description for externalUrl parsing
                                externalUrl: stream.externalUrl // Keep original externalUrl
                            };
                        }).filter(source => {
                            // Filter out web.stremio.com links
                            if (source.externalUrl && source.externalUrl.startsWith('https://web.stremio.com')) {
                                console.log('[StreamMapping] Filtering out web.stremio.com link:', source.title);
                                return false;
                            }
                            return true;
                        });
                        
                        if (allSources.length === 0) {
                            console.warn('[Sources] No streams found from Stremio addon.');
                        }
                    } catch (streamError) {
                        console.error('[Sources] Stream fetch error:', streamError);
                        
                        // Check if it's an authentication error
                        if (streamError.message.includes('500') || streamError.message.includes('handler error')) {
                            sourcesList.innerHTML = `
                                <div class="col-span-full text-center py-12 px-6">
                                    <div class="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 class="text-white font-bold text-lg mb-2">Addon Configuration Required</h3>
                                    <p class="text-gray-400 text-sm max-w-md mx-auto mb-4">
                                        This addon requires authentication or configuration to access streams. 
                                        Please configure the addon in Stremio with your credentials.
                                    </p>
                                    <p class="text-gray-500 text-xs">
                                        Some addons (like Hanime) require you to enter your account credentials 
                                        in the addon settings before streams can be accessed.
                                    </p>
                                </div>`;
                            return;
                        }
                        
                        throw streamError; // Re-throw other errors
                    }
                } else {
                    // Standard IMDB-based addon stream fetching
                    const imdbId = currentImdbId;
                    
                    if (imdbId) {
                        let stremioId = isTV 
                            ? (currentEpisode ? `${imdbId}:${currentSeason}:${currentEpisode}` : `${imdbId}:${currentSeason}:1`) 
                            : imdbId;
                            
                        console.log(`[Sources] Constructed Stremio ID: ${stremioId} (isTV: ${isTV})`);
                        
                        const resourceType = isTV ? 'series' : 'movie';
                        console.log(`[Sources] Calling fetchAddonStreams with type=${resourceType}, id=${stremioId}`);
                        
                        const streams = await fetchAddonStreams(addon, resourceType, stremioId);
                        console.log(`[Sources] fetchAddonStreams returned ${streams.length} items`);
                        
                        const addonName = addon.manifest?.name || addon.name;
                        allSources = streams
                            .map(s => parseAddonStream(s, addonName))
                            .filter(source => {
                                // Filter out web.stremio.com links
                                if (source.externalUrl && source.externalUrl.startsWith('https://web.stremio.com')) {
                                    console.log('[Sources] Filtering out web.stremio.com link:', source.title);
                                    return false;
                                }
                                return true;
                            });
                        
                        if (allSources.length === 0) {
                            console.warn('[Sources] No streams found from addon.');
                        }
                    } else {
                        console.warn('[Sources] No IMDB ID found in external_ids response for this TMDB ID.');
                        sourcesList.innerHTML = '<div class="text-center py-12 text-gray-500">No IMDB ID found. Cannot fetch from Stremio addons.</div>';
                        return;
                    }
                }
            } catch (err) {
                console.error('[Sources] Error in addon fetch loop:', err);
                sourcesList.innerHTML = `<div class="text-center py-12 text-red-500">Error: ${err.message}</div>`;
                return;
            }
        }
        displaySources(allSources);
        handleSortAndFilter();
    } catch (e) {
        console.error('Error fetching sources:', e);
        sourcesList.innerHTML = `<div class="text-center py-12 text-red-500">Error: ${e.message}</div>`;
    }
};

const handleSortAndFilter = () => {
    if (!allSources.length) return;

    let filtered = [...allSources];

    // Quality Filter
    const quality = qualityFilter.value;
    if (quality !== 'all') {
        filtered = filtered.filter(s => s.quality === quality);
    }

    // Sort
    const sort = sortSelect.value;
    filtered.sort((a, b) => {
        // Cached Priority (contains ⚡ emoji)
        const aCached = a.indexer.includes('⚡') || a.title.includes('⚡');
        const bCached = b.indexer.includes('⚡') || b.title.includes('⚡');
        
        if (aCached && !bCached) return -1;
        if (!aCached && bCached) return 1;

        if (sort === 'seeders') return b.seeders - a.seeders;
        if (sort === 'size-desc') return b.sizeBytes - a.sizeBytes;
        if (sort === 'size-asc') return a.sizeBytes - b.sizeBytes;
        if (sort === 'quality') {
            const qMap = { '4K': 4, '1080p': 3, '720p': 2, '480p': 1, 'Unknown': 0 };
            return qMap[b.quality] - qMap[a.quality] || b.seeders - a.seeders;
        }
        return 0;
    });

    displaySources(filtered);
};

sortSelect?.addEventListener('change', () => {
    localStorage.setItem('basic_default_sort', sortSelect.value);
    handleSortAndFilter();
});
qualityFilter?.addEventListener('change', handleSortAndFilter);

const matchEpisodeFile = (files, season, episode) => {
    if (!files || !files.length) return null;
    const s = parseInt(season);
    const e = parseInt(episode);
    
    console.log(`[Matching] TARGET: S${s}E${e}`);

    const scoredFiles = files.map(file => {
        const fullPath = (file.path || file.filename || file.name || '').toLowerCase();
        const fileName = fullPath.split('/').pop();
        let score = 0;
        
        // Disqualify non-video/junk immediately - Expanded formats
        if (!fullPath.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|mpg|mpeg)$/i) || fullPath.includes('sample') || fullPath.includes('trailer')) {
            return { file, score: -1000000, reason: 'Invalid type or sample' };
        }

        // --- PHASE 1: Filename Analysis (Ultra High Priority) ---
        
        // Exact SxxExx or XxXX patterns
        const exactPatterns = [
            { p: new RegExp(`s0*${s}e0*${e}\\b`, 'i'), b: 50000 },
            { p: new RegExp(`\\b${s}x0*${e}\\b`, 'i'), b: 50000 },
            { p: new RegExp(`season\\s*${s}\\s*episode\\s*${e}\\b`, 'i'), b: 50000 },
            { p: new RegExp(`\\b0*${s}x0*${e}\\b`, 'i'), b: 50000 },
            { p: new RegExp(`s0*${s}\\.e0*${e}\\b`, 'i'), b: 50000 }, // S02.E01
            { p: new RegExp(`\\[${s}x${e}\\]`, 'i'), b: 50000 },       // [2x01]
            { p: new RegExp(`\\b${s}${String(e).padStart(2, '0')}\\b`, 'i'), b: 10000 } // 201 for S02E01
        ];

        for (const item of exactPatterns) {
            if (item.p.test(fileName)) score += item.b;
        }

        // Catch-all Episode markers in filename
        const epMarkers = [
            { p: new RegExp(`e0*${e}\\b`, 'i'), b: 5000 },
            { p: new RegExp(`ep\\.?\\s*0*${e}\\b`, 'i'), b: 5000 },
            { p: new RegExp(`episode\\s*0*${e}\\b`, 'i'), b: 5000 },
            { p: new RegExp(`#\\s*0*${e}\\b`, 'i'), b: 5000 },
            { p: new RegExp(`\\-\\s*0*${e}\\b`, 'i'), b: 5000 },
            { p: new RegExp(`\\b0*${e}\\b`, 'i'), b: 2000 },
            { p: new RegExp(`\\[0*${e}\\]`, 'i'), b: 5000 },
            { p: new RegExp(`_0*${e}_`, 'i'), b: 5000 }, // episode in underscores
            { p: new RegExp(`\\s0*${e}\\s`, 'i'), b: 2000 } // standalone number with spaces
        ];

        for (const item of epMarkers) {
            if (item.p.test(fileName)) score += item.b;
        }

        // Season boost (if season is present and matches)
        const seasonMarkers = [
            new RegExp(`s0*${s}\\b`, 'i'),
            new RegExp(`season\\s*${s}\\b`, 'i'),
            new RegExp(`\\[s0*${s}\\]`, 'i')
        ];
        for (const p of seasonMarkers) {
            if (p.test(fileName)) score += 1000;
        }

        // --- PHASE 2: Path Analysis (Low Priority) ---
        if (new RegExp(`s0*${s}e0*${e}\\b`, 'i').test(fullPath)) score += 100;
        if (new RegExp(`season\\s*${s}`, 'i').test(fullPath)) score += 50;

        // --- PHASE 3: THE "ABSOLUTE ZERO" DISQUALIFIER ---
        
        // Disqualify if it has an explicit WRONG episode marker in filename
        // Regex looks for E01, Ep 01, 2x01, Episode 01
        const allEpTags = fileName.match(/e(\d+)|ep\s*(\d+)|\b(\d+)x(\d+)\b|episode\s*(\d+)/gi);
        if (allEpTags) {
            const hasCorrectEp = allEpTags.some(tag => {
                const nums = tag.match(/\d+/g);
                const foundEp = parseInt(nums[nums.length - 1]);
                return foundEp === e;
            });
            const hasWrongEp = allEpTags.some(tag => {
                const nums = tag.match(/\d+/g);
                const foundEp = parseInt(nums[nums.length - 1]);
                return foundEp !== e;
            });

            if (hasWrongEp && !hasCorrectEp) {
                score -= 1000000;
                return { file, score, name: fileName, reason: 'Wrong episode tag' };
            }
        }

        // Disqualify if it has an explicit WRONG season marker anywhere
        const allSeasonTags = fullPath.match(/s(\d+)|season\s*(\d+)/gi);
        if (allSeasonTags) {
            const hasCorrectSeason = allSeasonTags.some(tag => {
                const num = parseInt(tag.replace(/\D/g, ''));
                return num === s;
            });
            const hasWrongSeason = allSeasonTags.some(tag => {
                const num = parseInt(tag.replace(/\D/g, ''));
                return num !== s;
            });
            if (hasWrongSeason && !hasCorrectSeason) {
                score -= 1000000;
                return { file, score, name: fileName, reason: 'Wrong season tag' };
            }
        }

        return { file, score, name: fileName };
    });

    scoredFiles.sort((a, b) => b.score - a.score);
    
    // Log top 3 for debugging
    console.log('[Matching] Top Candidates:');
    scoredFiles.slice(0, 3).forEach((cand, idx) => {
        console.log(`  ${idx+1}. ${cand.name} (Score: ${cand.score})${cand.reason ? ' - ' + cand.reason : ''}`);
    });

    const best = scoredFiles[0];

    if (best && best.score > 0) {
        console.log(`[Matching] SUCCESS: Picked "${best.name}" (Score: ${best.score})`);
        return best.file;
    }

    console.warn(`[Matching] FAILED: No accurate match found for S${s}E${e}`);
    return null;
};

const resolveTorrent = async (url, title) => {
    if (!url || !url.startsWith('http')) return url;
    // If it's already a magnet, no need to resolve
    if (url.startsWith('magnet:')) return url;
    try {
        const res = await fetch(`/api/resolve-torrent-file?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error('[resolveTorrent] Server error:', errData.error || res.status);
            return null;
        }
        const data = await res.json();
        if (data.error) {
            console.error('[resolveTorrent] Resolution error:', data.error);
            return null;
        }
        if (data.magnet && data.magnet.startsWith('magnet:')) {
            return data.magnet;
        }
        console.warn('[resolveTorrent] No magnet returned from resolution');
        return null;
    } catch (err) {
        console.error('[resolveTorrent] Failed to resolve torrent:', err);
        return null;
    }
};

const displaySources = (sources) => {
    sourcesList.innerHTML = '';
    if (sources.length === 0) {
        sourcesList.innerHTML = '<div class="text-center py-12 text-gray-500">No sources found matching your criteria.</div>';
        return;
    }
    
    sources.forEach((source, index) => {
        const clone = sourceCardTemplate.content.cloneNode(true);
        const card = clone.querySelector('.source-card');
        
        // Resolution color logic
        let resColor = 'from-gray-500 to-gray-600';
        if (source.quality === '4K') resColor = 'from-yellow-500 to-orange-500';
        else if (source.quality === '1080p') resColor = 'from-purple-500 to-pink-500';
        else if (source.quality === '720p') resColor = 'from-blue-500 to-cyan-500';

        const resBadge = clone.querySelector('.res-badge');
        resBadge.className = `res-badge text-white text-sm px-3 py-1 rounded-full font-bold bg-gradient-to-r ${resColor}`;
        resBadge.textContent = source.quality;

        clone.querySelector('.codec-badge').textContent = source.codec;

        if (source.hdr) {
            const hdrBadge = clone.querySelector('.hdr-badge');
            hdrBadge.textContent = source.hdr;
            hdrBadge.classList.remove('hidden');
            const hdrColors = source.hdr.includes('Dolby') ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500';
            hdrBadge.className = `hdr-badge text-white text-xs px-2 py-0.5 rounded-full font-medium ${hdrColors}`;
        }

        clone.querySelector('.release-name').textContent = source.title;
        clone.querySelector('.seeders-count').textContent = source.seeders;
        clone.querySelector('.file-size').textContent = source.size;
        clone.querySelector('.provider-name').textContent = source.indexer;

        const link = source.magnet || source.link || source.url || source.externalUrl;

        // Copy button logic
        const copyBtn = clone.querySelector('.copy-btn');
        copyBtn.onclick = async (e) => {
            e.stopPropagation();
            if (link) {
                let finalLink = link;
                // Resolve torrent if it's a download URL (Jackett, .torrent, etc.)
                const needsResolution = link.startsWith('http') && !link.startsWith('magnet:') && (
                    link.includes('.torrent') ||
                    link.includes('/dl/') ||
                    link.includes('/download') ||
                    link.includes('jackett_apikey') ||
                    link.includes('apikey=')
                );
                if (needsResolution) {
                    const originalIcon = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<div class="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>';
                    finalLink = await resolveTorrent(link, source.title);
                    copyBtn.innerHTML = originalIcon;
                    if (!finalLink) {
                        alert('Failed to resolve torrent link');
                        return;
                    }
                }
                
                const showSuccess = () => {
                    const originalIcon = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                    setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
                };

                if (window.electronAPI?.copyToClipboard) {
                    await window.electronAPI.copyToClipboard(finalLink);
                    showSuccess();
                } else {
                    navigator.clipboard.writeText(finalLink).then(showSuccess);
                }
            }
        };

        // Play button logic
        const playBtn = clone.querySelector('.play-btn');
        playBtn.onclick = async () => {
            console.log('[PlayButton] Clicked! Link:', link);
            console.log('[PlayButton] Source:', source);
            
            // Get the URL to work with (prioritize externalUrl for addon streams)
            const externalUrl = source.externalUrl || link || source.url;
            
            if (!externalUrl) {
                console.warn('[PlayButton] No link or externalUrl available');
                return;
            }

            // Check if this is a stremio:///detail external URL
            // These URLs indicate we should search TMDB and navigate to the details page
            if (externalUrl.includes('stremio:///detail') || externalUrl.includes('stremio:///search')) {
                console.log('[ExternalURL] Detected stremio external link:', externalUrl);
                
                // Check if it's a detail URL with IMDB ID (e.g., stremio:///detail/movie/tt32642706)
                const detailMatch = externalUrl.match(/stremio:\/\/\/detail\/(movie|series|tv)\/(.+)/);
                if (detailMatch) {
                    const mediaType = detailMatch[1] === 'series' ? 'tv' : detailMatch[1];
                    const contentId = detailMatch[2];
                    
                    // Check if it's a recommendation ID (e.g., mlt-rec-tt0295701)
                    if (contentId.startsWith('mlt-rec-')) {
                        const imdbId = contentId.replace('mlt-rec-', '');
                        console.log('[ExternalURL] Recommendation URL detected, IMDB ID:', imdbId);
                        
                        // Navigate to grid page with addon catalog for recommendations
                        // The addon should have a catalog like: /catalog/movie/mlt-tmdb-movie-rec/search=tt0295701.json
                        const addonId = currentProvider || 'community.morelikethis';
                        const catalogId = mediaType === 'movie' ? 'mlt-tmdb-movie-rec' : 'mlt-tmdb-series-rec';
                        
                        hidePlayLoading();
                        window.location.href = `grid.html?type=addon&addonId=${addonId}&catalogId=${catalogId}&catalogType=${mediaType}&search=${imdbId}&name=Similar to this`;
                        return;
                    }
                    
                    // Regular IMDB ID (e.g., tt32642706)
                    const imdbId = contentId;
                    
                    console.log('[ExternalURL] Found IMDB ID in detail URL:', imdbId);
                    showPlayLoading('Looking up on TMDB...');
                    
                    try {
                        // Use TMDB's find API to get TMDB data from IMDB ID
                        const findResults = await findByExternalId(imdbId, 'imdb_id');
                        console.log('[ExternalURL] TMDB find results:', findResults);
                        
                        // Find the result based on media type
                        let tmdbResult = null;
                        if (mediaType === 'movie' && findResults.movie_results && findResults.movie_results.length > 0) {
                            tmdbResult = findResults.movie_results[0];
                        } else if (mediaType === 'tv' && findResults.tv_results && findResults.tv_results.length > 0) {
                            tmdbResult = findResults.tv_results[0];
                        }
                        
                        if (tmdbResult) {
                            console.log('[ExternalURL] Found TMDB match:', tmdbResult.title || tmdbResult.name, tmdbResult.id);
                            hidePlayLoading();
                            
                            // Navigate to details page
                            window.location.href = `details.html?type=${mediaType}&id=${tmdbResult.id}`;
                            return;
                        } else {
                            console.warn('[ExternalURL] No TMDB match found for IMDB ID:', imdbId);
                            hidePlayLoading();
                            alert('Could not find this content on TMDB.');
                            return;
                        }
                    } catch (error) {
                        console.error('[ExternalURL] TMDB find error:', error);
                        hidePlayLoading();
                        alert('Failed to lookup on TMDB: ' + error.message);
                        return;
                    }
                }
                
                // Check if it's a search URL (e.g., stremio:///search?search=tt32642706)
                const searchMatch = externalUrl.match(/stremio:\/\/\/search\?search=(.+)/);
                if (searchMatch) {
                    const searchQuery = decodeURIComponent(searchMatch[1]);
                    console.log('[ExternalURL] Search URL detected, query:', searchQuery);
                    
                    // Navigate to grid page with addon catalog search to display the results
                    // Use the current provider that's generating these streams
                    const addonId = currentProvider;
                    
                    // Determine media type from current page
                    const mediaType = type === 'tv' ? 'series' : 'movie';
                    const catalogId = mediaType === 'movie' ? 'mlt-tmdb-movie-rec' : 'mlt-tmdb-series-rec';
                    
                    hidePlayLoading();
                    window.location.href = `grid.html?type=addon&addonId=${addonId}&catalogId=${catalogId}&catalogType=${mediaType}&search=${searchQuery}&name=More Like This`;
                    return;
                }
                
                // If it's just a generic stremio:/// URL without specific handling, try name-based search
                console.log('[ExternalURL] Generic stremio URL, checking for metadata...');
                
                // Check if we have metadata (name and year) to search TMDB
                if (source.fullTitle && source.fullTitle.includes('📆 Release:')) {
                    console.log('[ExternalURL] Has metadata, searching TMDB...');
                    
                    // Extract name and year from fullTitle/description
                    const description = source.fullTitle || source.description || '';
                    
                    // Parse release date from description (format: 📆 Release: 2009-12-19)
                    const releaseMatch = description.match(/📆\s*Release:\s*(\d{4})-\d{2}-\d{2}/);
                    const year = releaseMatch ? releaseMatch[1] : null;
                    
                    // Get the name from source.title
                    const name = source.title || '';
                    
                    console.log('[ExternalURL] Extracted:', { name, year });
                    
                    if (name) {
                        showPlayLoading('Searching TMDB...');
                        
                        try {
                            // Search TMDB with just the name (don't include year in search query)
                            console.log('[ExternalURL] Searching TMDB for:', name);
                            
                            const searchResults = await searchMulti(name);
                            const results = searchResults.results || [];
                            
                            console.log('[ExternalURL] Found', results.length, 'results');
                            
                            // Filter to only movies and TV shows
                            const validResults = results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
                            
                            // Try to match by name and year
                            let match = null;
                            
                            if (year) {
                                // Match by name and year
                                match = validResults.find(r => {
                                    const resultYear = (r.release_date || r.first_air_date || '').split('-')[0];
                                    const resultName = (r.title || r.name || '').toLowerCase();
                                    const searchName = name.toLowerCase();
                                    
                                    return resultYear === year && resultName === searchName;
                                });
                            }
                            
                            // If no exact match, try fuzzy match by name only
                            if (!match && validResults.length > 0) {
                                const searchNameLower = name.toLowerCase();
                                match = validResults.find(r => {
                                    const resultName = (r.title || r.name || '').toLowerCase();
                                    return resultName === searchNameLower;
                                });
                            }
                            
                            // If still no match, take the first result
                            if (!match && validResults.length > 0) {
                                match = validResults[0];
                                console.log('[ExternalURL] No exact match, using first result');
                            }
                            
                            if (match) {
                                console.log('[ExternalURL] Matched:', match.title || match.name, match.id);
                                hidePlayLoading();
                                
                                // Navigate to details page
                                const mediaType = match.media_type === 'tv' ? 'tv' : 'movie';
                                window.location.href = `details.html?type=${mediaType}&id=${match.id}`;
                                return;
                            } else {
                                console.warn('[ExternalURL] No match found on TMDB');
                                hidePlayLoading();
                                alert('Could not find this content on TMDB. Please try searching manually.');
                                return;
                            }
                        } catch (error) {
                            console.error('[ExternalURL] TMDB search error:', error);
                            hidePlayLoading();
                            alert('Failed to search TMDB: ' + error.message);
                            return;
                        }
                    }
                }
                
                // If we get here, it's a stremio URL but we can't handle it
                console.warn('[ExternalURL] Cannot handle this stremio URL');
                hidePlayLoading();
                alert('This stream type is not supported.');
                return;
            }

            // Show loading overlay immediately
            showPlayLoading('Preparing stream...');

            try {
                // Check if cancelled
                checkCancelled();
                // Check if this is a Jackett/torrent download URL that needs resolution
                // Jackett URLs look like: http://127.0.0.1:9117/dl/...?jackett_apikey=...
                const isJackettUrl = externalUrl.includes('jackett') ||      // jackett_apikey or jackett in URL
                                     externalUrl.includes(':9117') ||        // Default Jackett port
                                     externalUrl.includes('/dl/') ||         // Jackett download path
                                     externalUrl.includes('/download');      // Generic download path
                
                console.log(`[Play] Link: ${externalUrl.substring(0, 100)}...`);
                console.log(`[Play] isJackettUrl: ${isJackettUrl}`);
                
                // Check if this is a direct streaming URL (not a magnet, torrent file, or Jackett URL)
                const isDirectUrl = externalUrl.startsWith('http') && 
                                    !externalUrl.includes('.torrent') && 
                                    !externalUrl.startsWith('magnet:') &&
                                    !isJackettUrl;
                const isMagnet = externalUrl.startsWith('magnet:');
                
                console.log(`[Play] isDirectUrl: ${isDirectUrl}, isMagnet: ${isMagnet}`);
                
                // For direct URLs from addons like Nuvio, play directly through transcoder
                if (isDirectUrl && !isMagnet) {
                    console.log(`[Direct Stream] Playing direct URL: ${externalUrl.substring(0, 80)}...`);
                
                // Get provider info for Next Episode feature
                let providerUrl = '';
                if (currentProvider !== 'jackett') {
                    try {
                        const addons = await getInstalledAddons();
                        const addon = addons.find(a => (a.manifest?.id || a.id) === currentProvider);
                        if (addon) {
                            providerUrl = addon.url || addon.manifestUrl || '';
                            if (providerUrl.endsWith('/manifest.json')) {
                                providerUrl = providerUrl.replace('/manifest.json', '');
                            }
                        }
                    } catch (e) {}
                }
                
                // Save provider info
                try {
                    localStorage.setItem('basicmode_last_provider', JSON.stringify({
                        provider: currentProvider,
                        quality: source.quality,
                        showName: currentDetails?.name || currentDetails?.title || ''
                    }));
                } catch (e) {}
                
                // Extract target season/episode
                let targetS = currentSeason;
                let targetE = currentEpisode;
                const sourcesTitle = document.getElementById('sources-title');
                if (sourcesTitle && isTV) {
                    const titleText = sourcesTitle.innerText;
                    const match = titleText.match(/S(\d+)E(\d+)/i);
                    if (match) {
                        targetS = parseInt(match[1]);
                        targetE = parseInt(match[2]);
                    }
                }
                
                // Launch player with direct URL using iframe overlay
                openPlayerInIframe({
                    url: externalUrl,
                    tmdbId: currentTmdbId || id,
                    imdbId: currentImdbId,
                    seasonNum: targetS,
                    episodeNum: targetE,
                    type: type,
                    isDebrid: false,  // Not debrid, direct stream
                    isBasicMode: true,
                    showName: currentDetails?.name || currentDetails?.title || '',
                    provider: currentProvider,
                    providerUrl: providerUrl,
                    quality: source.quality
                });
                return;
            }

            // For torrent files or magnets, continue with existing logic
            let activeLink = externalUrl;
            
            // Check if this is a torrent download URL that needs resolution
            // This includes: .torrent files, Jackett /dl/ URLs, and other torrent download endpoints
            const needsResolution = externalUrl.startsWith('http') && !externalUrl.startsWith('magnet:') && (
                externalUrl.includes('.torrent') ||
                externalUrl.includes('/dl/') ||           // Jackett download URLs
                externalUrl.includes('/download') ||      // Common torrent download paths
                externalUrl.includes('jackett_apikey') || // Jackett API key in URL
                externalUrl.includes('apikey=')           // Generic API key patterns
            );
            
            if (needsResolution) {
                showPlayLoading('Resolving torrent...');
                console.log(`[Torrent] Resolving download URL: ${externalUrl.substring(0, 100)}...`);
                activeLink = await resolveTorrent(externalUrl, source.title);
                checkCancelled(); // Check if cancelled after resolution
                if (!activeLink) {
                    hidePlayLoading();
                    alert('Failed to resolve torrent link. Please try another source.');
                    return;
                }
                if (!activeLink.startsWith('magnet:')) {
                    // Resolution didn't return a magnet - this is a problem for debrid/webtorrent
                    console.error('[Torrent] Resolution failed to return a magnet link:', activeLink.substring(0, 100));
                    hidePlayLoading();
                    alert('Could not extract magnet link from this torrent. The source may be unavailable or require manual download.');
                    return;
                }
                console.log(`[Torrent] Resolved to magnet: ${activeLink.substring(0, 80)}...`);
            }

            // Check if we should use Debrid or WebTorrent
            const debridSettings = await getDebridSettings();
            
            // Final validation: ensure we have a magnet link for debrid/webtorrent
            if (!activeLink.startsWith('magnet:')) {
                console.error('[Torrent] activeLink is not a magnet:', activeLink.substring(0, 100));
                hidePlayLoading();
                alert('Invalid torrent link. Expected a magnet link but got: ' + activeLink.substring(0, 50) + '...');
                return;
            }
            
            // Extract Target S/E from UI text as requested by user
            let targetS = currentSeason;
            let targetE = currentEpisode;
            const sourcesTitle = document.getElementById('sources-title');
            if (sourcesTitle && isTV) {
                const titleText = sourcesTitle.innerText;
                const match = titleText.match(/S(\d+)E(\d+)/i);
                if (match) {
                    targetS = parseInt(match[1]);
                    targetE = parseInt(match[2]);
                    console.log(`[UI-MATCH] Found target from UI: S${targetS}E${targetE}`);
                }
            }

            // Save provider info for Next Episode feature
            // Get addon URL if using a Stremio addon
            let providerUrl = '';
            if (currentProvider !== 'jackett') {
                try {
                    const addons = await getInstalledAddons();
                    const addon = addons.find(a => (a.manifest?.id || a.id) === currentProvider);
                    if (addon) {
                        providerUrl = addon.url || addon.manifestUrl || '';
                        if (providerUrl.endsWith('/manifest.json')) {
                            providerUrl = providerUrl.replace('/manifest.json', '');
                        }
                    }
                } catch (e) {}
            }
            
            try {
                localStorage.setItem('basicmode_last_provider', JSON.stringify({
                    provider: currentProvider,
                    quality: source.quality,
                    showName: currentDetails?.name || currentDetails?.title || ''
                }));
            } catch (e) {}

            if (debridSettings.useDebrid && debridSettings.debridAuth) {
                console.log(`[Debrid] Preparing magnet: ${source.title}`);
                showPlayLoading('Preparing debrid...');
                try {
                    checkCancelled(); // Check before starting debrid
                    const res = await fetch('/api/debrid/prepare', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ magnet: activeLink })
                    });
                    const data = await res.json();
                    checkCancelled(); // Check after debrid prepare
                    
                    if (data && data.info) {
                        const info = data.info;
                        const files = info.files || [];
                        
                        console.log(`--- DEBRID FILE LIST (${debridSettings.debridProvider}): ${info.filename || data.name || 'Torrent'} ---`);
                        
                        let targetFile = null;
                        if (isTV && targetE) {
                            targetFile = matchEpisodeFile(files, targetS, targetE);
                        } else {
                            // For movies, pick the largest file
                            targetFile = files.sort((a, b) => (b.bytes || b.size || 0) - (a.bytes || a.size || 0))[0];
                        }

                        if (targetFile) {
                            const fileName = targetFile.path || targetFile.filename || targetFile.name || `File ${targetFile.id}`;
                            const fileSize = targetFile.bytes || targetFile.size || 0;
                            console.log(`[TARGET MATCHED] ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
                            
                            // Unrestrict the specific file link
                            let fileLink = (targetFile.links && targetFile.links[0]) || null;
                            
                            // Real-Debrid Fallback: links are in info.links, not per-file
                            if (!fileLink && debridSettings.debridProvider === 'realdebrid' && info.links && info.links.length > 0) {
                                const selectedFiles = files.filter(f => f.selected === 1);
                                const linkIndex = selectedFiles.indexOf(targetFile);
                                
                                if (linkIndex !== -1 && info.links[linkIndex]) {
                                    fileLink = info.links[linkIndex];
                                    console.log(`[Debrid] RD Link matched via selected-index [${linkIndex}]: ${fileLink}`);
                                } else {
                                    console.warn('[Debrid] Target file not found in selected files list or link missing.');
                                }
                            }

                            if (fileLink) {
                                showPlayLoading('Getting stream link...');
                                console.log('[Debrid] Unrestricting target file link...');
                                checkCancelled(); // Check before unrestricting
                                const unres = await fetch('/api/debrid/link', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ link: fileLink })
                                });
                                const unresData = await unres.json();
                                checkCancelled(); // Check after unrestricting
                                if (unresData.url) {
                                    console.log(`[FINAL STREAM LINK] ${unresData.url}`);
                                    openPlayerInIframe({
                                        url: unresData.url,
                                        tmdbId: currentTmdbId || id,
                                        imdbId: currentImdbId,
                                        seasonNum: targetS,
                                        episodeNum: targetE,
                                        type: type,
                                        isDebrid: true,
                                        isBasicMode: true,
                                        showName: currentDetails?.name || currentDetails?.title || '',
                                        provider: currentProvider,
                                        providerUrl: providerUrl,
                                        quality: source.quality
                                    });
                                } else {
                                    console.error('[Debrid] Failed to unrestrict link:', unresData.error);
                                    hidePlayLoading();
                                    alert('Failed to get stream link: ' + (unresData.error || 'Unknown error'));
                                }
                            } else {
                                console.warn('[Debrid] No direct link available for this file yet.');
                                hidePlayLoading();
                                alert('This file is not yet ready for streaming on the debrid provider.');
                            }
                        } else {
                            console.error('[Debrid] No matching file found in torrent.');
                            hidePlayLoading();
                            alert('Could not find the correct episode in this torrent.');
                        }

                        // List all files anyway for console visibility
                        files.forEach((file, i) => {
                            const fileName = file.path || file.filename || file.name || `File ${file.id || i+1}`;
                            const fileSize = file.bytes || file.size || 0;
                            console.log(`  [File ${i+1}] ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
                        });
                        console.log(`-------------------------------------------`);
                    } else if (data.error) {
                        console.error('[Debrid] Error:', data.error);
                        hidePlayLoading();
                        alert('Debrid error: ' + data.error);
                    }
                } catch (err) {
                    console.error('[Debrid] Error preparing torrent:', err);
                    if (err.message === 'CANCELLED') return; // Silent return on cancel
                    hidePlayLoading();
                    alert('Error preparing torrent: ' + err.message);
                }
            } else {
                // Torrent Engine Path: Fetch metadata and list files
                showPlayLoading('Fetching torrent metadata...');
                console.log(`[TorrentEngine] Fetching metadata for: ${source.title}`);
                try {
                    checkCancelled(); // Check before fetching metadata
                    // Check which engine is configured
                    let engineConfig = { engine: 'stremio' };
                    try {
                        const configRes = await fetch('/api/torrent-engine/config');
                        if (configRes.ok) {
                            engineConfig = await configRes.json();
                        }
                    } catch (e) {
                        console.warn('[TorrentEngine] Failed to get engine config, defaulting to stremio');
                    }
                    
                    const isAltEngine = engineConfig.engine !== 'stremio';
                    console.log(`[TorrentEngine] Engine config: ${engineConfig.engine}, isAltEngine: ${isAltEngine}`);
                    
                    // Use appropriate API endpoint based on engine
                    const apiEndpoint = isAltEngine ? '/api/alt-torrent-files' : '/api/torrent-files';
                    console.log(`[TorrentEngine] Using ${engineConfig.engine} engine via ${apiEndpoint}`);
                    
                    const res = await fetch(`${apiEndpoint}?magnet=${encodeURIComponent(activeLink)}`);
                    
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                    }
                    
                    const data = await res.json();
                    
                    console.log('[TorrentEngine] Response data:', data);
                    
                    if (data && !data.error) {
                        console.log(`--- TORRENT DATA RECEIVED: ${data.name} ---`);
                        const allFiles = [...(data.videoFiles || []), ...(data.subtitleFiles || [])];
                        
                        console.log(`[TorrentEngine] Total files: ${allFiles.length}, Video files: ${data.videoFiles?.length || 0}`);
                        
                        if (allFiles.length === 0 || !data.videoFiles || data.videoFiles.length === 0) {
                            hidePlayLoading();
                            alert('No video files found in this torrent. The torrent may still be loading metadata. Please try again in a few seconds.');
                            return;
                        }
                        
                        let targetFile = null;
                        if (isTV && targetE) {
                            targetFile = matchEpisodeFile(allFiles, targetS, targetE);
                        } else {
                            targetFile = data.videoFiles && data.videoFiles[0];
                        }

                        if (targetFile) {
                            showPlayLoading('Starting stream...');
                            console.log(`[TARGET MATCHED] ${targetFile.name} (${(targetFile.size / 1024 / 1024).toFixed(2)} MB)`);
                            console.log(`[TorrentEngine] Starting stream for file index: ${targetFile.index}`);
                            
                            // Use appropriate stream endpoint based on engine
                            const streamEndpoint = isAltEngine ? '/api/alt-stream-file' : '/api/stream-file';
                            const prepareEndpoint = isAltEngine ? '/api/alt-prepare-file' : '/api/prepare-file';
                            
                            console.log(`[TorrentEngine] Stream endpoint: ${streamEndpoint}`);
                            
                            const streamUrl = `${window.location.origin}${streamEndpoint}?hash=${data.infoHash}&file=${targetFile.index}`;
                            console.log(`[TorrentEngine] Stream URL: ${streamUrl}`);
                            
                            fetch(`${prepareEndpoint}?hash=${data.infoHash}&file=${targetFile.index}`);
                            
                            // Launch player using iframe overlay
                            openPlayerInIframe({
                                url: streamUrl,
                                tmdbId: currentTmdbId || id,
                                imdbId: currentImdbId,
                                seasonNum: targetS,
                                episodeNum: targetE,
                                type: type,
                                isDebrid: false,
                                isBasicMode: true,
                                showName: currentDetails?.name || currentDetails?.title || '',
                                provider: currentProvider,
                                providerUrl: providerUrl,
                                quality: source.quality
                            });
                        } else {
                            // No matching file found
                            hidePlayLoading();
                            alert('Could not find a matching video file in this torrent.');
                        }

                        if (data.videoFiles) {
                            data.videoFiles.forEach((file, i) => {
                                console.log(`  [Video ${i+1}] ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                            });
                        }
                        console.log(`-------------------------------------------`);
                    } else {
                        hidePlayLoading();
                        alert('Failed to get torrent info: ' + (data?.error || 'Unknown error'));
                    }
                } catch (err) {
                    console.error('[TorrentEngine] Error fetching torrent info:', err);
                    if (err.message === 'CANCELLED') return; // Silent return on cancel
                    hidePlayLoading();
                    alert('Error fetching torrent: ' + err.message);
                }
            }
        } catch (err) {
            // Catch-all for any unexpected errors
            if (err.message === 'CANCELLED') {
                console.log('[Play] Operation cancelled by user');
                return; // Silent return on cancel
            }
            console.error('[Play] Unexpected error:', err);
            hidePlayLoading();
        }
    };

    // Animation delay
    setTimeout(() => {
        if(card) card.classList.remove('opacity-0', 'translate-x-4');
    }, index * 50);

    sourcesList.appendChild(clone);
});
};

// Removed: loadEpisodes function (no longer needed - episodes selected from details page)
const loadEpisodes = async (seasonNum) => {
    // No-op: Episodes are selected from the details page
    console.log('[Episodes] Skipping episode loading - using URL params:', { season: currentSeason, episode: currentEpisode });
};

const init = async () => {
    // Load Default Sort Preference
    if (sortSelect) {
        const savedSort = localStorage.getItem('basic_default_sort');
        if (savedSort) {
            sortSelect.value = savedSort;
        }
    }

    // Settings Modal
    if (settingsBtn) {
        settingsBtn.onclick = async () => {
            jackettApiInput.value = await getJackettKey() || '';
            const settings = await getJackettSettings();
            if (jackettUrlInput) jackettUrlInput.value = settings.jackettUrl || '';
            
            // Load Default Sort
            if (defaultSortInput) {
                defaultSortInput.value = localStorage.getItem('basic_default_sort') || 'seeders';
            }

            settingsModal.classList.remove('hidden');
            setTimeout(() => settingsModal.classList.remove('opacity-0'), 10);
        };
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.onclick = () => {
            settingsModal.classList.add('opacity-0');
            setTimeout(() => settingsModal.classList.add('hidden'), 300);
        };
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.onclick = async () => {
            const key = jackettApiInput.value.trim();
            const url = jackettUrlInput ? jackettUrlInput.value.trim() : null;

            if (key && !key.includes('*')) {
                await setJackettKey(key);
            }

            if (url !== null) {
                try {
                    await fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jackettUrl: url })
                    });
                } catch (e) {
                    console.error("Failed to save Jackett URL", e);
                }
            }

            // Save Default Sort
            if (defaultSortInput) {
                localStorage.setItem('basic_default_sort', defaultSortInput.value);
                if (sortSelect) {
                    sortSelect.value = defaultSortInput.value;
                    handleSortAndFilter();
                }
            }

            settingsModal.classList.add('opacity-0');
            setTimeout(() => settingsModal.classList.add('hidden'), 300);
        };
    }

    // Console Toggle
    if (toggleConsoleBtn) {
        toggleConsoleBtn.onclick = () => {
            if (window.electronAPI?.toggleDevTools) window.electronAPI.toggleDevTools();
        };
    }

    try {
        if (addonId) {
            // Check if this is a custom Stremio addon ID (not TMDB/IMDB)
            const isCustomId = isStremioAddonId(id);
            
            if (isCustomId) {
                console.log('[Details] Custom Stremio addon ID detected:', id);
                
                const addons = await getInstalledAddons();
                const addon = addons.find(a => a.manifest.id === addonId);
                if (!addon) throw new Error('Addon not found');
                
                let addonBaseUrl = addon.url.replace('/manifest.json', '');
                if (addonBaseUrl.endsWith('/')) addonBaseUrl = addonBaseUrl.slice(0, -1);
                
                // Convert type to Stremio format (tv -> series)
                const stremioType = type === 'tv' ? 'series' : type;
                
                let stremioMeta = null;
                let formattedMeta = null;
                
                // Try to fetch meta from addon endpoint
                try {
                    stremioMeta = await fetchStremioMeta(addonBaseUrl, stremioType, id);
                    formattedMeta = formatStremioMeta(stremioMeta);
                    console.log('[Details] Successfully fetched meta from addon endpoint');
                } catch (metaError) {
                    console.warn('[Details] Meta endpoint failed, trying sessionStorage fallback:', metaError.message);
                    
                    // Fallback to catalog metadata from sessionStorage
                    const cachedMeta = sessionStorage.getItem(`addon_meta_${addonId}_${id}`);
                    if (cachedMeta) {
                        stremioMeta = JSON.parse(cachedMeta);
                        formattedMeta = formatStremioMeta(stremioMeta);
                        console.log('[Details] Using cached catalog metadata');
                    } else {
                        throw new Error('Meta endpoint failed and no cached metadata available');
                    }
                }
                
                currentDetails = {
                    id: formattedMeta.id,
                    title: formattedMeta.title,
                    name: formattedMeta.title,
                    poster_path: formattedMeta.poster,
                    backdrop_path: formattedMeta.background,
                    overview: formattedMeta.description,
                    vote_average: formattedMeta.rating,
                    runtime: formattedMeta.runtime,
                    genres: formattedMeta.genres ? formattedMeta.genres.map(g => typeof g === 'string' ? { name: g } : g) : [],
                    release_date: formattedMeta.year ? `${formattedMeta.year}-01-01` : null,
                    // Store original Stremio meta for stream fetching
                    _stremioMeta: stremioMeta,
                    _addonUrl: addonBaseUrl,
                    _addonId: addonId,
                    _stremioType: stremioType
                };

                
                if (formattedMeta.cast) {
                    currentDetails.credits = { 
                        cast: formattedMeta.cast.map(c => typeof c === 'string' ? { name: c, id: '' } : c) 
                    };
                }
                
                renderDetails(currentDetails);
                await renderAddonTabs();
                
                // Removed: Season/episode selector UI (now handled in details page)
                // Just render sources directly
                console.log('[Stremio Addon] Using season/episode from URL:', { currentSeason, currentEpisode });
                renderSources();
                
                // Finish loading
                loadingOverlay.classList.add('opacity-0');
                setTimeout(() => loadingOverlay.remove(), 300);
                contentContainer.classList.remove('hidden');
                requestAnimationFrame(() => {
                    contentContainer.classList.remove('opacity-0');
                    document.querySelectorAll('#poster-anim-target, #info-anim-target, #right-panel-anim-target, #detail-overview, #cast-container, #media-container').forEach(el => {
                        el?.classList.remove('opacity-0', 'translate-y-4');
                    });
                });
                return; // Exit early - custom ID handled
            }
            
            // Check if the ID is an IMDB ID - if so, try TMDB first for richer metadata
            const isImdbId = id.startsWith('tt');
            let tmdbId = null;
            let tmdbType = isTV ? 'tv' : 'movie';
            
            if (isImdbId) {
                try {
                    console.log('[Details] ID is IMDB, looking up TMDB...');
                    const findResult = await findByExternalId(id, 'imdb_id');
                    
                    // Check movie_results and tv_results
                    if (findResult.movie_results && findResult.movie_results.length > 0) {
                        tmdbId = findResult.movie_results[0].id;
                        tmdbType = 'movie';
                    } else if (findResult.tv_results && findResult.tv_results.length > 0) {
                        tmdbId = findResult.tv_results[0].id;
                        tmdbType = 'tv';
                    }
                    
                    if (tmdbId) {
                        console.log(`[Details] Found TMDB ID: ${tmdbId} (${tmdbType})`);
                    }
                } catch (e) {
                    console.warn('[Details] TMDB lookup failed:', e.message);
                }
            }
            
            // If we found a TMDB ID, use TMDB for details
            if (tmdbId) {
                currentTmdbId = tmdbId; // Store the actual TMDB ID
                const fetchFn = tmdbType === 'tv' ? getTVShowDetails : getMovieDetails;
                const data = await fetchFn(tmdbId);
                currentDetails = data;
                currentImdbId = id; // We already have the IMDB ID
                
                renderDetails(data);
                loadScreenshots();
                loadTrailer();
                await renderAddonTabs();

                if (tmdbType === 'tv') {
                    seasonSection.classList.remove('hidden');
                    episodeSection.classList.remove('hidden');
                    const regularSeasons = data.seasons.filter(s => s.season_number > 0);
                    regularSeasons.forEach(season => {
                        const clone = seasonBtnTemplate.content.cloneNode(true);
                        const btn = clone.querySelector('.season-btn');
                        btn.textContent = `Season ${season.season_number}`;
                        btn.onclick = () => {
                            document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('bg-purple-600', 'text-white'));
                            btn.classList.add('bg-purple-600', 'text-white');
                            currentSeason = season.season_number;
                            currentEpisode = null;
                            sourcesList.classList.add('hidden');
                            selectEpisodeMsg.classList.remove('hidden');
                            loadEpisodes(currentSeason);
                        };
                        if (season.season_number === (regularSeasons[0]?.season_number || 1)) {
                            btn.classList.add('bg-purple-600', 'text-white');
                            currentSeason = season.season_number;
                            loadEpisodes(currentSeason);
                        }
                        seasonList.appendChild(clone);
                    });
                } else {
                    renderSources();
                }
            } else {
                // Fallback to addon meta endpoint
                const addons = await getInstalledAddons();
                const addon = addons.find(a => a.manifest.id === addonId);
                if (!addon) throw new Error('Addon not found');
                
                let url = addon.url.replace('/manifest.json', '');
                if (url.endsWith('/')) url = url.slice(0, -1);
                
                const metaUrl = `${url}/meta/${type}/${id}.json`;
                console.log('Fetching addon meta:', metaUrl);
                const res = await fetch(metaUrl);
                const data = await res.json();
                
                if (!data.meta) throw new Error('Metadata not found');
                
                currentDetails = data.meta;
                currentDetails.title = currentDetails.name;
                currentDetails.name = currentDetails.name;
                currentDetails.poster_path = currentDetails.poster;
                currentDetails.backdrop_path = currentDetails.background;
                currentDetails.overview = currentDetails.description;
                currentDetails.vote_average = currentDetails.imdbRating ? parseFloat(currentDetails.imdbRating) : null;
                
                if (currentDetails.runtime) {
                     // Format usually "120 min" or similar
                     currentDetails.runtime = parseInt(currentDetails.runtime);
                }

                if (currentDetails.cast) {
                    currentDetails.credits = { cast: currentDetails.cast.map(c => ({ name: c, id: '' })) };
                }

                currentImdbId = currentDetails.imdb_id || currentDetails.imdb_id || (id.startsWith('tt') ? id : null);
                
                // Check if addon meta includes moviedb_id (TMDB ID) - use it for richer metadata
                const addonTmdbId = currentDetails.moviedb_id || currentDetails.tmdb_id;
                if (addonTmdbId) {
                    console.log('[Details] Addon meta includes TMDB ID:', addonTmdbId);
                    currentTmdbId = addonTmdbId;
                    
                    // Fetch full TMDB data for better metadata and episodes
                    try {
                        const tmdbFetchFn = isTV ? getTVShowDetails : getMovieDetails;
                        const tmdbData = await tmdbFetchFn(addonTmdbId);
                        
                        // Merge TMDB data with addon data (prefer TMDB for most fields)
                        currentDetails = {
                            ...currentDetails,
                            ...tmdbData,
                            // Keep addon-specific fields
                            id: currentDetails.id,
                            imdb_id: currentImdbId
                        };
                        
                        renderDetails(currentDetails);
                        loadScreenshots();
                        loadTrailer();
                        await renderAddonTabs();
                        
                        if (isTV && tmdbData.seasons) {
                            seasonSection.classList.remove('hidden');
                            episodeSection.classList.remove('hidden');
                            const regularSeasons = tmdbData.seasons.filter(s => s.season_number > 0);
                            regularSeasons.forEach(season => {
                                const clone = seasonBtnTemplate.content.cloneNode(true);
                                const btn = clone.querySelector('.season-btn');
                                btn.textContent = `Season ${season.season_number}`;
                                btn.onclick = () => {
                                    document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('bg-purple-600', 'text-white'));
                                    btn.classList.add('bg-purple-600', 'text-white');
                                    currentSeason = season.season_number;
                                    currentEpisode = null;
                                    sourcesList.classList.add('hidden');
                                    selectEpisodeMsg.classList.remove('hidden');
                                    loadEpisodes(currentSeason);
                                };
                                if (season.season_number === (regularSeasons[0]?.season_number || 1)) {
                                    btn.classList.add('bg-purple-600', 'text-white');
                                    currentSeason = season.season_number;
                                    loadEpisodes(currentSeason);
                                }
                                seasonList.appendChild(clone);
                            });
                        } else {
                            renderSources();
                        }
                        
                        // Skip the rest of addon meta handling since we used TMDB
                        loadingOverlay.classList.add('opacity-0');
                        setTimeout(() => loadingOverlay.remove(), 300);
                        contentContainer.classList.remove('hidden');
                        requestAnimationFrame(() => {
                            contentContainer.classList.remove('opacity-0');
                            document.querySelectorAll('#poster-anim-target, #info-anim-target, #right-panel-anim-target, #detail-overview, #cast-container, #media-container').forEach(el => {
                                el?.classList.remove('opacity-0', 'translate-y-4');
                            });
                        });
                        return; // Exit early since we handled everything with TMDB data
                    } catch (e) {
                        console.warn('[Details] Failed to fetch TMDB data using moviedb_id:', e);
                        // Continue with addon meta fallback
                    }
                }
            
                renderDetails(currentDetails);
                await renderAddonTabs();
                
                if (isTV && currentDetails.videos && currentDetails.videos.length > 0) {
                    seasonSection.classList.remove('hidden');
                    episodeSection.classList.remove('hidden');
                    
                    const seasons = {};
                    currentDetails.videos.forEach(v => {
                        if (!seasons[v.season]) seasons[v.season] = [];
                        seasons[v.season].push({
                            episode_number: v.episode,
                            name: v.title || `Episode ${v.episode}`,
                            still_path: v.thumbnail,
                            overview: v.overview,
                            id: v.id
                        });
                    });
                    
                    Object.keys(seasons).sort((a,b) => a - b).forEach(sNum => {
                        const clone = seasonBtnTemplate.content.cloneNode(true);
                        const btn = clone.querySelector('.season-btn');
                        btn.textContent = `Season ${sNum}`;
                        btn.onclick = () => {
                            document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('bg-purple-600', 'text-white'));
                            btn.classList.add('bg-purple-600', 'text-white');
                            currentSeason = parseInt(sNum);
                            currentEpisode = null;
                            sourcesList.classList.add('hidden');
                            selectEpisodeMsg.classList.remove('hidden');
                            
                            episodeGrid.innerHTML = '';
                            episodesTitle.textContent = `Episodes (${seasons[sNum].length})`;
                            seasons[sNum].sort((a,b) => a.episode_number - b.episode_number).forEach(ep => {
                                const epClone = episodeCardTemplate.content.cloneNode(true);
                                const epBtn = epClone.querySelector('.episode-btn');
                                if (ep.still_path) {
                                    const img = epClone.querySelector('.episode-img');
                                    img.src = ep.still_path;
                                    img.classList.remove('hidden');
                                    epClone.querySelector('.episode-placeholder').classList.add('hidden');
                                }
                                epClone.querySelector('.episode-number').textContent = ep.episode_number;
                                epClone.querySelector('.episode-name').textContent = ep.name;
                                epBtn.onclick = () => {
                                    document.querySelectorAll('.episode-btn').forEach(b => {
                                        b.classList.remove('ring-2', 'ring-purple-500');
                                        b.querySelector('.episode-overlay').classList.remove('opacity-100');
                                    });
                                    epBtn.classList.add('ring-2', 'ring-purple-500');
                                    epBtn.querySelector('.episode-overlay').classList.add('opacity-100');
                                    currentEpisode = ep.episode_number;
                                    renderSources();
                                    // Auto-update embedded player if it's visible
                                    updateEmbeddedPlayerForEpisode();
                                };
                                episodeGrid.appendChild(epClone);
                            });
                        };
                        if (parseInt(sNum) === 1) {
                             btn.click();
                        }
                        seasonList.appendChild(clone);
                    });
                } else if (isTV) {
                    // Addon meta doesn't have videos array - try to get episode info from TMDB using IMDB ID
                    let tmdbData = null;
                    if (currentImdbId) {
                        try {
                            const findResult = await findByExternalId(currentImdbId, 'imdb_id');
                            const tvResult = findResult.tv_results?.[0];
                            if (tvResult) {
                                currentTmdbId = tvResult.id;
                                tmdbData = await getTVShowDetails(tvResult.id);
                            }
                        } catch (e) {
                            console.warn('[Details] TMDB lookup for episodes failed:', e);
                        }
                    }
                    
                    if (tmdbData && tmdbData.seasons) {
                        seasonSection.classList.remove('hidden');
                        episodeSection.classList.remove('hidden');
                        const regularSeasons = tmdbData.seasons.filter(s => s.season_number > 0);
                        regularSeasons.forEach(season => {
                            const clone = seasonBtnTemplate.content.cloneNode(true);
                            const btn = clone.querySelector('.season-btn');
                            btn.textContent = `Season ${season.season_number}`;
                            btn.onclick = () => {
                                document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('bg-purple-600', 'text-white'));
                                btn.classList.add('bg-purple-600', 'text-white');
                                currentSeason = season.season_number;
                                currentEpisode = null;
                                sourcesList.classList.add('hidden');
                                selectEpisodeMsg.classList.remove('hidden');
                                loadEpisodes(currentSeason);
                            };
                            if (season.season_number === (regularSeasons[0]?.season_number || 1)) {
                                btn.classList.add('bg-purple-600', 'text-white');
                                currentSeason = season.season_number;
                                loadEpisodes(currentSeason);
                            }
                            seasonList.appendChild(clone);
                        });
                    } else {
                        // No episode info available - show message
                        seasonSection.classList.remove('hidden');
                        episodeSection.classList.remove('hidden');
                        episodeGrid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Episode information not available. Select a season and episode manually when searching for sources.</div>';
                        renderSources();
                    }
                } else {
                    renderSources();
                }
            } // Close the else block for addon meta fallback

        } else {
            currentTmdbId = id; // For non-addon items, id IS the TMDB ID
            const fetchFn = isTV ? getTVShowDetails : getMovieDetails;
            const data = await fetchFn(id);
            currentDetails = data;
            
            try {
                const extIds = await getExternalIds(id, type);
                currentImdbId = extIds.imdb_id;
                console.log('[Details] Fetched IMDB ID:', currentImdbId);
            } catch (e) {
                console.warn('[Details] Failed to fetch external IDs:', e.message);
            }

            renderDetails(data);
            loadScreenshots();
            loadTrailer();
            await renderAddonTabs();

            // Removed: Season/episode selector UI (now handled in details page)
            // Just render sources directly with season/episode from URL
            if (isTV) {
                console.log('[Init] TV show - using season/episode from URL:', { currentSeason, currentEpisode });
                renderSources();
            } else {
                renderSources();
            }
        }

        loadingOverlay.classList.add('opacity-0');
        setTimeout(() => loadingOverlay.remove(), 300);
        contentContainer.classList.remove('hidden');
        requestAnimationFrame(() => {
            contentContainer.classList.remove('opacity-0');
            document.querySelectorAll('#poster-anim-target, #info-anim-target, #right-panel-anim-target, #detail-overview, #cast-container, #media-container').forEach(el => {
               el.classList.remove('opacity-0', 'translate-y-4', 'translate-x-4'); 
            });
        });
    } catch (error) {
        console.error("[DETAILS] Init failed:", error);
        loadingOverlay.innerHTML = '<p class="text-red-500">Failed to load content. Please try again.</p>';
    }
};

// Back button handler - go to details page instead of home
const backButton = document.getElementById('back-button');
if (backButton) {
    backButton.addEventListener('click', () => {
        // If we have type and id, go to details page
        if (type && id) {
            window.location.href = `details.html?type=${type}&id=${id}`;
        } else {
            // Fallback to home
            window.location.href = 'index.html';
        }
    });
}

document.addEventListener('DOMContentLoaded', init);

// Torrent fetching for play page
import { filterTorrents } from './torrent_filter.js';

// ============================================================================
// Helper Functions
// ============================================================================

const detectQuality = (title) => {
    const t = title.toLowerCase();
    if (t.includes('2160p') || t.includes('4k')) return '4K';
    if (t.includes('1080p')) return '1080p';
    if (t.includes('720p')) return '720p';
    if (t.includes('480p')) return '480p';
    return 'Unknown';
};

const detectCodec = (title) => {
    const t = title.toLowerCase();
    if (t.includes('x265') || t.includes('hevc')) return 'HEVC';
    if (t.includes('x264') || t.includes('avc')) return 'x264';
    if (t.includes('av1')) return 'AV1';
    return 'h264';
};

const detectHDR = (title) => {
    const t = title.toLowerCase();
    if (t.includes('dv') || t.includes('dolby vision')) return 'Dolby Vision';
    if (t.includes('hdr10+')) return 'HDR10+';
    if (t.includes('hdr')) return 'HDR';
    return null;
};

const parseSize = (sizeStr) => {
    if (!sizeStr || sizeStr === 'Unknown') return 0;
    const str = sizeStr.toLowerCase();
    const match = str.match(/([\d.]+)\s*(gb|mb|kb|tb)/i);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    switch (unit) {
        case 'tb': return num * 1024 * 1024 * 1024 * 1024;
        case 'gb': return num * 1024 * 1024 * 1024;
        case 'mb': return num * 1024 * 1024;
        case 'kb': return num * 1024;
        default: return num;
    }
};

// ============================================================================
// API Helper Functions
// ============================================================================

async function getSettings() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error('[Play] Failed to fetch settings', e);
    }
    return {};
}

async function getJackettKey() {
    try {
        const response = await fetch('/api/get-api-key');
        if (response.ok) {
            const data = await response.json();
            return data.apiKey || '';
        }
    } catch (e) {
        console.error('[Play] Failed to fetch Jackett key', e);
    }
    return '';
}

async function getProwlarrKey() {
    try {
        const response = await fetch('/api/get-prowlarr-api-key');
        if (response.ok) {
            const data = await response.json();
            return data.apiKey || '';
        }
    } catch (e) {
        console.error('[Play] Failed to fetch Prowlarr key', e);
    }
    return '';
}

// ============================================================================
// Jackett Search
// ============================================================================

const fetchFromJackett = async (query) => {
    const apiKey = await getJackettKey();
    const settings = await getSettings();
    const jackettUrl = settings.jackettUrl || 'http://127.0.0.1:9117/api/v2.0/indexers/all/results/torznab';
    
    if (!apiKey) return [];

    const url = new URL(`${window.location.origin}/api/jackett`);
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('t', 'search');
    url.searchParams.append('q', query);
    url.searchParams.append('jackettUrl', jackettUrl);
    
    try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Jackett API Error: ${response.status}`);
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        return Array.from(xmlDoc.querySelectorAll('item')).map(item => {
            const torznabAttrs = {};
            const attrs = item.getElementsByTagName('torznab:attr');
            for (let i = 0; i < attrs.length; i++) {
                const name = attrs[i].getAttribute('name');
                const value = attrs[i].getAttribute('value');
                if (name) torznabAttrs[name] = value;
            }

            const title = item.querySelector('title')?.textContent;
            let link = item.querySelector('link')?.textContent;
            let magnet = torznabAttrs['magneturl'] || null;

            if (!magnet && link && link.startsWith('magnet:')) {
                magnet = link;
            }

            return {
                Title: title,
                Guid: item.querySelector('guid')?.textContent,
                Link: link,
                Size: item.querySelector('size')?.textContent || item.querySelector('enclosure')?.getAttribute('length'),
                MagnetUri: magnet,
                Seeders: parseInt(torznabAttrs['seeders']) || 0,
                Peers: parseInt(torznabAttrs['peers']) || 0,
                Tracker: item.querySelector('jackettindexer')?.textContent || 'Jackett'
            };
        });
    } catch (error) {
        console.error('Jackett Fetch Failed:', error);
        throw new Error('JACKETT_CONNECTION_ERROR');
    }
};

export const searchJackett = async (queries, metadata = {}) => {
    const queryList = Array.isArray(queries) ? queries : [queries];
    const results = await Promise.all(queryList.map(q => fetchFromJackett(q)));
    
    const seen = new Set();
    const merged = [];
    
    results.flat().forEach(item => {
        const id = item.Guid || item.MagnetUri || item.Link;
        if (id && !seen.has(id)) {
            seen.add(id);
            merged.push(item);
        }
    });

    return filterTorrents(merged, metadata);
};

// ============================================================================
// Prowlarr Search
// ============================================================================

const fetchFromProwlarr = async (query) => {
    const apiKey = await getProwlarrKey();
    const settings = await getSettings();
    const prowlarrUrl = settings.prowlarrUrl || 'http://127.0.0.1:9696';
    
    if (!apiKey) return [];

    // Use the proxy through server
    const url = new URL(`${window.location.origin}/api/prowlarr`);
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('q', query);
    url.searchParams.append('prowlarrUrl', prowlarrUrl);
    
    try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Prowlarr API Error: ${response.status}`);
        
        const results = await response.json();
        
        return results.map(item => ({
            Title: item.title,
            Guid: item.guid,
            Link: item.downloadUrl || item.magnetUrl,
            Size: item.size,
            MagnetUri: item.magnetUrl || (item.downloadUrl?.startsWith('magnet:') ? item.downloadUrl : null),
            Seeders: parseInt(item.seeders) || 0,
            Peers: parseInt(item.leechers) || 0,
            Tracker: item.indexer || 'Prowlarr'
        }));
    } catch (error) {
        console.error('Prowlarr Fetch Failed:', error);
        throw new Error('PROWLARR_CONNECTION_ERROR');
    }
};

export const searchProwlarr = async (queries, metadata = {}) => {
    const queryList = Array.isArray(queries) ? queries : [queries];
    const results = await Promise.all(queryList.map(q => fetchFromProwlarr(q)));
    
    const seen = new Set();
    const merged = [];
    
    results.flat().forEach(item => {
        const id = item.Guid || item.MagnetUri || item.Link;
        if (id && !seen.has(id)) {
            seen.add(id);
            merged.push(item);
        }
    });

    return filterTorrents(merged, metadata);
};

// ============================================================================
// Build Search Queries
// ============================================================================

export function buildSearchQueries(mediaData) {
    const { title, type, season, episode, year } = mediaData;
    const queries = [];
    const metadata = { title, type, year };
    
    if (type === 'tv' && season) {
        const s = String(season).padStart(2, '0');
        metadata.season = season;
        
        if (episode) {
            const e = String(episode).padStart(2, '0');
            queries.push(`${title} S${s}E${e}`);
            queries.push(`${title} S${s}`); // Also search for season pack
            metadata.episode = episode;
        } else {
            queries.push(`${title} S${s}`);
            metadata.episode = null;
        }
    } else {
        // For movies
        if (year) {
            queries.push(`${title} ${year}`);
        }
        queries.push(title);
    }
    
    return { queries, metadata };
}

// ============================================================================
// 111477 Search
// ============================================================================

export const search111477 = async (mediaData) => {
    const { type, season, episode } = mediaData;
    
    try {
        // Get TMDB ID from URL params
        const params = new URLSearchParams(window.location.search);
        const tmdbId = params.get('id');
        
        if (!tmdbId) {
            throw new Error('No TMDB ID available');
        }
        
        let apiUrl;
        
        if (type === 'tv') {
            if (!episode) {
                throw new Error('Please select an episode');
            }
            apiUrl = `http://localhost:6987/111477/api/tmdb/tv/${encodeURIComponent(tmdbId)}/season/${encodeURIComponent(season)}/episode/${encodeURIComponent(episode)}`;
        } else {
            apiUrl = `http://localhost:6987/111477/api/tmdb/movie/${encodeURIComponent(tmdbId)}`;
        }
        
        console.log('[111477] Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`111477 API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Handle multi-result format from 111477 API
        let allFiles = [];
        if (Array.isArray(data?.results)) {
            data.results.forEach(result => {
                if (result.files && Array.isArray(result.files)) {
                    allFiles = allFiles.concat(result.files.map(f => ({ ...f, source: result.source || '111477' })));
                }
            });
        } else if (data?.files && Array.isArray(data.files)) {
            allFiles = data.files.map(f => ({ ...f, source: '111477' }));
        }
        
        console.log('[111477] Found', allFiles.length, 'files');
        
        // Convert 111477 files to standard source format
        return allFiles.map(file => {
            const fileTitle = file.filename || file.name || 'Unknown';
            const quality = detectQuality(fileTitle);
            const codec = detectCodec(fileTitle);
            const size = file.size || 'Unknown';
            
            return {
                Title: fileTitle,
                title: fileTitle,
                quality: quality,
                codec: codec,
                Size: size,
                size: size,
                sizeBytes: parseSize(size),
                Seeders: 0,
                seeders: 0,
                Tracker: file.source || '111477',
                indexer: file.source || '111477',
                Link: file.url || file.link,
                link: file.url || file.link,
                MagnetUri: null,
                magnet: null,
                hdr: detectHDR(fileTitle)
            };
        });
    } catch (error) {
        console.error('[111477] Error:', error);
        throw new Error('111477_CONNECTION_ERROR');
    }
};

// ============================================================================
// PlayTorrio (Torrentless) Search
// ============================================================================

export const searchPlayTorrio = async (mediaData) => {
    const { title, type, season, episode, year } = mediaData;
    
    try {
        if (!title) {
            throw new Error('No title available for search');
        }
        
        let queries = [];
        if (type === 'tv' && episode) {
            const s = String(season).padStart(2, '0');
            const e = String(episode).padStart(2, '0');
            // Search for both season pack AND specific episode (like Jackett)
            queries.push(`${title} S${s}`);           // Season pack
            queries.push(`${title} S${s}E${e}`);      // Specific episode
        } else if (type === 'tv') {
            const s = String(season).padStart(2, '0');
            queries.push(`${title} S${s}`);
        } else {
            queries.push(`${title} ${year}`);
        }
        
        console.log('[PlayTorrio] Searching with queries:', queries);
        
        // Fetch results for all queries in parallel
        const results = await Promise.all(
            queries.map(async (query) => {
                const torrentlessUrl = `http://localhost:6987/torrentless/api/search?q=${encodeURIComponent(query)}&page=1`;
                console.log('[PlayTorrio] Fetching:', torrentlessUrl);
                
                const response = await fetch(torrentlessUrl);
                
                if (!response.ok) {
                    console.error(`[PlayTorrio] API Error for query "${query}":`, response.status);
                    return [];
                }
                
                const data = await response.json();
                
                if (data.error) {
                    console.error(`[PlayTorrio] Error for query "${query}":`, data.error);
                    return [];
                }
                
                return data.items || [];
            })
        );
        
        // Flatten and deduplicate results
        const allItems = results.flat();
        const seen = new Set();
        const uniqueItems = [];
        
        allItems.forEach(item => {
            const id = item.magnet || item.title;
            if (id && !seen.has(id)) {
                seen.add(id);
                uniqueItems.push(item);
            }
        });
        
        console.log('[PlayTorrio] Found', uniqueItems.length, 'unique results from', queries.length, 'queries');
        
        // Convert torrentless items to standard format for filtering
        const convertedItems = uniqueItems.map(item => {
            const itemTitle = item.name || item.title || 'Unknown';
            const quality = detectQuality(itemTitle);
            const codec = detectCodec(itemTitle);
            // Parse seeds - API returns formatted string like "1,234"
            const seeders = parseInt((item.seeds || '0').toString().replace(/,/g, ''), 10) || 0;
            
            return {
                Title: itemTitle,
                Size: parseSize(item.size || '0'),
                Seeders: seeders,
                Peers: 0,
                Tracker: 'PlayTorrio',
                Link: null,
                MagnetUri: item.magnet,
                Guid: item.magnet
            };
        });
        
        // Apply same filters as Jackett/Prowlarr
        const metadata = {
            title: title,
            type: type,
            season: season,
            episode: episode,
            year: year
        };
        
        console.log('[PlayTorrio] Applying filters with metadata:', metadata);
        const filtered = filterTorrents(convertedItems, metadata);
        console.log('[PlayTorrio] After filtering:', filtered.length, 'results');
        
        return filtered;
    } catch (error) {
        console.error('[PlayTorrio] Error:', error);
        throw new Error('PLAYTORRIO_CONNECTION_ERROR');
    }
};

// Basic Mode Prowlarr Logic - Following Jackett pattern

import { filterTorrents } from './torrent_filter.js';

// Base URL for main application API
const API_BASE = '/api';

export const getProwlarrKey = async () => {
    try {
        const response = await fetch(`${API_BASE}/get-prowlarr-api-key`);
        const data = await response.json();
        return data.apiKey || '';
    } catch (e) {
        console.error("Failed to fetch Prowlarr key from server", e);
        return localStorage.getItem('prowlarr_api_key') || '';
    }
};

export const setProwlarrKey = async (key) => {
    try {
        const response = await fetch(`${API_BASE}/set-prowlarr-api-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: key })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('prowlarr_api_key', key);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Failed to save Prowlarr key to server", e);
        localStorage.setItem('prowlarr_api_key', key);
        return true;
    }
};

export const getProwlarrSettings = async () => {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error("Failed to fetch settings from server", e);
    }
    return {};
};

const fetchFromProwlarr = async (query) => {
    const apiKey = await getProwlarrKey();
    const settings = await getProwlarrSettings();
    const prowlarrUrl = settings.prowlarrUrl || 'http://127.0.0.1:9696';
    
    if (!apiKey) return [];

    // Use the proxy we added to server.mjs
    const url = new URL(`${window.location.origin}/api/prowlarr`);
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('q', query);
    url.searchParams.append('prowlarrUrl', prowlarrUrl);
    
    console.log(`[Prowlarr] Searching with URL: ${prowlarrUrl}`);
    
    try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Prowlarr API Error: ${response.status}`);
        
        const results = await response.json();
        
        // Prowlarr returns JSON array directly
        return results.map(item => {
            return {
                Title: item.title,
                Guid: item.guid,
                Link: item.downloadUrl || item.magnetUrl,
                PublishDate: item.publishDate,
                Size: item.size,
                Description: item.title,
                Category: item.categories?.join(', ') || 'Unknown',
                Tracker: item.indexer || 'Unknown',
                MagnetUri: item.magnetUrl || (item.downloadUrl?.startsWith('magnet:') ? item.downloadUrl : null),
                Seeders: parseInt(item.seeders) || 0,
                Peers: parseInt(item.leechers) || 0,
            };
        });
    } catch (error) {
        console.error('Prowlarr Fetch Failed:', error);
        // Throw a specific error so the UI can detect it
        throw new Error('PROWLARR_CONNECTION_ERROR');
    }
};

export const searchProwlarr = async (queries, metadata = {}) => {
    const queryList = Array.isArray(queries) ? queries : [queries];
    const results = await Promise.all(queryList.map(q => fetchFromProwlarr(q)));
    
    const seen = new Set();
    const merged = [];
    
    results.flat().forEach(item => {
        const id = item.Guid || item.MagnetUri || item.Link;
        if (id && !seen.has(id)) {
            seen.add(id);
            merged.push(item);
        }
    });

    return filterTorrents(merged, metadata);
};

// Playtorrio Intro Animation Script

document.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.getElementById('introContainer');
    
    if (!introContainer) return;

    // Check if intro should be skipped
    if (sessionStorage.getItem('skipIntro') === 'true') {
        introContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Show main content immediately
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.style.opacity = '1';
        
        console.log('⏩ Intro skipped');
        
        // Consume the flag so it plays again on refresh
        sessionStorage.removeItem('skipIntro');
        return;
    }

    // Always show intro if not skipped
    introContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Play intro music from DOM element
    const introMusic = document.getElementById('introMusic');
    if (introMusic) {
        introMusic.volume = 1.0;
        
        const playAudio = () => {
            introMusic.play().then(() => {
                console.log('🔊 Intro music started');
                // Clean up all trigger listeners
                events.forEach(event => window.removeEventListener(event, playAudio));
            }).catch(() => {
                // Keep trying silently
            });
        };

        // Aggressive trigger list
        const events = ['mousedown', 'keydown', 'touchstart', 'mousemove', 'wheel', 'scroll'];
        events.forEach(event => window.addEventListener(event, playAudio, { once: true }));

        // Initial attempt
        playAudio();

        // Sync music fade-out with CSS animation (starts at 4s)
        setTimeout(() => {
            const fadeOutInterval = setInterval(() => {
                if (introMusic.volume > 0.05) {
                    introMusic.volume -= 0.05;
                } else {
                    introMusic.pause();
                    clearInterval(fadeOutInterval);
                }
            }, 50);
        }, 4000);
    }

    // After intro animation (5s total), hide intro
    setTimeout(() => {
        introContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Show main content
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.style.opacity = '1';
    }, 5000);
    
    // Add particle effect on mouse move during intro
    let particles = [];
    const maxParticles = 50;
    
    function createParticle(x, y) {
        if (particles.length >= maxParticles) {
            const oldParticle = particles.shift();
            oldParticle.remove();
        }
        
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.borderRadius = '50%';
        particle.style.background = `rgba(${Math.random() * 100 + 139}, ${Math.random() * 50 + 92}, 246, 0.8)`;
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9998';
        particle.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.8)';
        
        introContainer.appendChild(particle);
        particles.push(particle);
        
        // Animate particle
        let opacity = 1;
        let scale = 1;
        const interval = setInterval(() => {
            opacity -= 0.02;
            scale += 0.05;
            particle.style.opacity = opacity;
            particle.style.transform = `scale(${scale})`;
            
            if (opacity <= 0) {
                clearInterval(interval);
                particle.remove();
                particles = particles.filter(p => p !== particle);
            }
        }, 30);
    }
    
    let mouseTimeout;
    introContainer.addEventListener('mousemove', (e) => {
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            createParticle(e.clientX, e.clientY);
        }, 50);
    });
    
    console.log('🎬 Playtorrio - Your Cinema Universe');
});

// Search Page Functionality
const searchState = {
    query: '',
    selectedYears: [],
    selectedGenres: [],
    mediaType: 'all', // all, movie, tv
    results: []
};

// Make searchState globally accessible
window.searchState = searchState;

// Genre list from TMDB
const genres = {
    movie: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Sci-Fi' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
    ]
};

// Generate year options (current year back to 1900)
const currentYear = new Date().getFullYear();
const years = [];
for (let year = currentYear; year >= 1900; year--) {
    years.push(year);
}

// Show search page
function showSearchPage() {
    hideAllSections();
    
    // Check if search page already exists
    let searchPage = document.getElementById('searchPageContainer');
    if (!searchPage) {
        searchPage = document.createElement('div');
        searchPage.id = 'searchPageContainer';
        searchPage.innerHTML = `
            <div class="search-page">
                <div class="search-header">
                    <div class="search-bar-container">
                        <input type="text" id="searchInput" class="search-input" placeholder="Search for movies and TV shows...">
                        <button class="search-btn" id="searchBtn">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="filter-bar">
                        <div class="filter-dropdown">
                            <button class="filter-dropdown-btn" id="typeFilterBtn">
                                <span>Type: All</span>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </button>
                            <div class="filter-dropdown-menu" id="typeFilterMenu">
                                <label class="filter-option">
                                    <input type="radio" name="mediaType" value="all" checked>
                                    <span>All</span>
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="mediaType" value="movie">
                                    <span>Movies</span>
                                </label>
                                <label class="filter-option">
                                    <input type="radio" name="mediaType" value="tv">
                                    <span>TV Shows</span>
                                </label>
                            </div>
                        </div>

                        <div class="filter-dropdown">
                            <button class="filter-dropdown-btn" id="genreFilterBtn">
                                <span>Genres</span>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </button>
                            <div class="filter-dropdown-menu genre-menu" id="genreFilterMenu"></div>
                        </div>

                        <div class="filter-dropdown">
                            <button class="filter-dropdown-btn" id="yearFilterBtn">
                                <span>Year</span>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </button>
                            <div class="filter-dropdown-menu year-menu" id="yearFilterMenu"></div>
                        </div>

                        <button class="clear-filters-btn" id="clearFilters">Clear Filters</button>
                    </div>
                </div>

                <div class="search-results">
                    <div class="results-header">
                        <h2 class="results-title">Search Results</h2>
                        <span class="results-count" id="resultsCount">0 results</span>
                    </div>
                    <div class="results-grid" id="resultsGrid">
                        <div class="search-placeholder">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <p>Start searching for your favorite movies and TV shows</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('mainContent').appendChild(searchPage);
        initializeSearchPage();
    } else {
        searchPage.style.setProperty('display', 'block', 'important');
    }
}

// Initialize search page
function initializeSearchPage() {
    // Populate genre filters
    const genreFilterMenu = document.getElementById('genreFilterMenu');
    genreFilterMenu.innerHTML = ''; // Clear first
    genres.movie.forEach(genre => {
        const label = document.createElement('label');
        label.className = 'filter-option';
        label.innerHTML = `
            <input type="checkbox" value="${genre.id}" data-genre="${genre.name}">
            <span>${genre.name}</span>
        `;
        genreFilterMenu.appendChild(label);
    });

    // Populate year filters (last 50 years)
    const yearFilterMenu = document.getElementById('yearFilterMenu');
    yearFilterMenu.innerHTML = ''; // Clear first
    const recentYears = years.slice(0, 50); // Get last 50 years
    recentYears.forEach(year => {
        const label = document.createElement('label');
        label.className = 'filter-option';
        label.innerHTML = `
            <input type="checkbox" value="${year}">
            <span>${year}</span>
        `;
        yearFilterMenu.appendChild(label);
    });

    // Dropdown toggle functionality
    setupDropdowns();

    // Event listeners
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    document.querySelectorAll('input[name="mediaType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateFilterLabel('typeFilterBtn', `Type: ${radio.nextElementSibling.textContent}`);
            performSearch();
        });
    });

    document.querySelectorAll('#genreFilterMenu input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateGenreLabel();
            performSearch();
        });
    });

    document.querySelectorAll('#yearFilterMenu input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateYearLabel();
            performSearch();
        });
    });

    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Check if we need to restore search results
    const shouldRestore = sessionStorage.getItem('restoreSearch');
    if (shouldRestore === 'true') {
        sessionStorage.removeItem('restoreSearch');
        const savedSearchState = sessionStorage.getItem('searchState');
        if (savedSearchState) {
            try {
                const searchState = JSON.parse(savedSearchState);
                if (searchState.results && searchState.results.length > 0) {
                    // Restore search state
                    window.searchState = searchState;
                    
                    // Show search page and restore results
                    setTimeout(() => {
                        showSearchPage();
                        setTimeout(() => {
                            renderSearchResults(searchState.results);
                            
                            // Restore search input and filters
                            if (searchState.query) {
                                document.getElementById('searchInput').value = searchState.query;
                            }
                        }, 100);
                    }, 50);
                }
            } catch (e) {
                console.error('Error restoring search state:', e);
            }
        }
    }
}

// Update filter button labels
function updateFilterLabel(btnId, text) {
    const btn = document.getElementById(btnId);
    btn.querySelector('span').textContent = text;
}

function updateGenreLabel() {
    const selected = document.querySelectorAll('#genreFilterMenu input:checked');
    const text = selected.length > 0 ? `Genres (${selected.length})` : 'Genres';
    updateFilterLabel('genreFilterBtn', text);
}

function updateYearLabel() {
    const selected = document.querySelectorAll('#yearFilterMenu input:checked');
    const text = selected.length > 0 ? `Year (${selected.length})` : 'Year';
    updateFilterLabel('yearFilterBtn', text);
}

// Setup dropdown menus
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.filter-dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.filter-dropdown-btn');
        const menu = dropdown.querySelector('.filter-dropdown-menu');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('.filter-dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('active');
            });
            
            menu.classList.toggle('active');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.filter-dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    });
    
    // Prevent dropdown from closing when clicking inside
    document.querySelectorAll('.filter-dropdown-menu').forEach(menu => {
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

// Perform search
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const mediaType = document.querySelector('input[name="mediaType"]:checked').value;
    const selectedGenres = Array.from(document.querySelectorAll('#genreFilterMenu input:checked')).map(cb => cb.value);
    const selectedYears = Array.from(document.querySelectorAll('#yearFilterMenu input:checked')).map(cb => cb.value);

    if (!query && selectedGenres.length === 0 && selectedYears.length === 0) {
        return;
    }

    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '<div class="loading">Searching...</div>';

    try {
        let results = [];

        if (query) {
            // Search by query
            const searchUrl = mediaType === 'all' 
                ? `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
                : `${BASE_URL}/search/${mediaType}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
            
            const response = await fetch(searchUrl);
            const data = await response.json();
            results = data.results || [];
        } else {
            // Discover by filters
            const discoverUrl = mediaType === 'tv' 
                ? `${BASE_URL}/discover/tv?api_key=${API_KEY}`
                : `${BASE_URL}/discover/movie?api_key=${API_KEY}`;
            
            let url = discoverUrl;
            if (selectedGenres.length > 0) {
                url += `&with_genres=${selectedGenres.join(',')}`;
            }
            if (selectedYears.length > 0) {
                // Use the first selected year for filtering
                const year = selectedYears[0];
                url += mediaType === 'tv' ? `&first_air_date_year=${year}` : `&primary_release_year=${year}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            results = data.results || [];
        }

        // Filter results by selected years if multiple
        if (selectedYears.length > 0) {
            results = results.filter(item => {
                const releaseDate = item.release_date || item.first_air_date;
                if (!releaseDate) return false;
                const year = new Date(releaseDate).getFullYear().toString();
                return selectedYears.includes(year);
            });
        }

        // Filter results by media type
        if (mediaType !== 'all') {
            results = results.filter(item => {
                if (mediaType === 'movie') return item.media_type === 'movie' || item.title;
                if (mediaType === 'tv') return item.media_type === 'tv' || item.name;
                return true;
            });
        }

        displayResults(results);
        
        // Save search state globally and to sessionStorage
        window.searchState.results = results;
        window.searchState.query = query;
        window.searchState.selectedGenres = selectedGenres;
        window.searchState.selectedYears = selectedYears;
        window.searchState.mediaType = mediaType;
        
        // Persist to sessionStorage for cross-page access
        sessionStorage.setItem('searchState', JSON.stringify(window.searchState));
    } catch (error) {
        console.error('Search error:', error);
        resultsGrid.innerHTML = '<div class="error">Error performing search. Please try again.</div>';
    }
}

// Render search results (for restoring from details page)
function renderSearchResults(results) {
    displayResults(results);
}

// Make renderSearchResults globally accessible
window.renderSearchResults = renderSearchResults;

// Display search results
function displayResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCount = document.getElementById('resultsCount');

    resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;

    if (results.length === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>No results found</p>
            </div>
        `;
        return;
    }

    resultsGrid.innerHTML = '';
    results.forEach(item => {
        const card = createSearchResultCard(item);
        resultsGrid.appendChild(card);
    });
}

// Create search result card
function createSearchResultCard(item) {
    const card = document.createElement('div');
    card.className = 'search-result-card';

    const title = item.title || item.name;
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    
    // Handle image path based on media type
    let imagePath = item.poster_path || item.profile_path;
    const posterPath = imagePath 
        ? `${IMG_BASE_URL}/w500${imagePath}` 
        : 'https://via.placeholder.com/500x750?text=No+Image';

    // Metadata based on media type
    let metaHTML = '';
    if (mediaType === 'person') {
        const knownFor = item.known_for_department || 'Acting';
        metaHTML = `
            <span class="search-card-type">${knownFor}</span>
            <span class="search-card-type">PERSON</span>
        `;
    } else {
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        metaHTML = `
            <span class="search-card-year">${year}</span>
            <span class="search-card-rating">⭐ ${rating}</span>
            <span class="search-card-type">${mediaType.toUpperCase()}</span>
        `;
    }

    card.innerHTML = `
        <div class="search-card-poster">
            <img src="${posterPath}" alt="${title}" loading="lazy">
            <div class="search-card-overlay">
                <button class="search-card-btn">More Info</button>
            </div>
        </div>
        <div class="search-card-info">
            <h3 class="search-card-title">${title}</h3>
            <div class="search-card-meta">
                ${metaHTML}
            </div>
        </div>
    `;

    // Add click handler to navigate to the correct page
    card.addEventListener('click', () => {
        sessionStorage.setItem('skipIntro', 'true');
        if (mediaType === 'person') {
            window.location.href = `person.html?id=${item.id}`;
        } else {
            window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
        }
    });

    return card;
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.querySelector('input[name="mediaType"][value="all"]').checked = true;
    document.querySelectorAll('#genreFilterMenu input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#yearFilterMenu input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // Reset labels
    updateFilterLabel('typeFilterBtn', 'Type: All');
    updateFilterLabel('genreFilterBtn', 'Genres');
    updateFilterLabel('yearFilterBtn', 'Year');
    
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = `
        <div class="search-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <p>Start searching for your favorite movies and TV shows</p>
        </div>
    `;
    document.getElementById('resultsCount').textContent = '0 results';
}


// Check on page load if we need to restore search
document.addEventListener('DOMContentLoaded', () => {
    const shouldRestore = sessionStorage.getItem('restoreSearch');
    if (shouldRestore === 'true') {
        sessionStorage.removeItem('restoreSearch');
        const savedSearchState = sessionStorage.getItem('searchState');
        if (savedSearchState) {
            try {
                const searchState = JSON.parse(savedSearchState);
                if (searchState.results && searchState.results.length > 0) {
                    // Restore search state
                    window.searchState = searchState;
                    
                    // Show search page and restore results immediately
                    showSearchPage();
                    
                    // Wait for page to be fully rendered
                    setTimeout(() => {
                        // Restore search input
                        const searchInput = document.getElementById('searchInput');
                        if (searchInput && searchState.query) {
                            searchInput.value = searchState.query;
                        }
                        
                        // Display results immediately
                        renderSearchResults(searchState.results);
                        
                        console.log('[Search] Restored search results:', searchState.results.length, 'items');
                    }, 100);
                }
            } catch (e) {
                console.error('Error restoring search state:', e);
            }
        }
    }
});

// Settings Page Logic
const API_BASE = '/api';

// ============================================================================
// Utility Functions
// ============================================================================

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================================================
// API Functions
// ============================================================================

async function getSettings() {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error('[Settings] Failed to fetch settings', e);
    }
    return {};
}

async function saveSettings(settings) {
    try {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        return response.ok;
    } catch (e) {
        console.error('[Settings] Failed to save settings', e);
        return false;
    }
}

async function getJackettKey() {
    try {
        const response = await fetch(`${API_BASE}/get-jackett-api-key`);
        if (response.ok) {
            const data = await response.json();
            return data.apiKey || '';
        }
    } catch (e) {
        console.error('[Settings] Failed to fetch Jackett key', e);
    }
    return '';
}

async function setJackettKey(apiKey) {
    try {
        const response = await fetch(`${API_BASE}/set-jackett-api-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey })
        });
        return response.ok;
    } catch (e) {
        console.error('[Settings] Failed to save Jackett key', e);
        return false;
    }
}

async function getProwlarrKey() {
    try {
        const response = await fetch(`${API_BASE}/get-prowlarr-api-key`);
        if (response.ok) {
            const data = await response.json();
            return data.apiKey || '';
        }
    } catch (e) {
        console.error('[Settings] Failed to fetch Prowlarr key', e);
    }
    return '';
}

async function setProwlarrKey(apiKey) {
    try {
        const response = await fetch(`${API_BASE}/set-prowlarr-api-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey })
        });
        return response.ok;
    } catch (e) {
        console.error('[Settings] Failed to save Prowlarr key', e);
        return false;
    }
}

// ============================================================================
// Stremio Addons
// ============================================================================

async function getStremioAddons() {
    if (window.electronAPI?.addonList) {
        const res = await window.electronAPI.addonList();
        return res.success ? res.addons : [];
    } else {
        // Fallback
        const stored = localStorage.getItem('stremio_addons');
        return stored ? JSON.parse(stored) : [];
    }
}

async function addStremioAddon(url) {
    if (window.electronAPI?.addonInstall) {
        const res = await window.electronAPI.addonInstall(url);
        if (!res.success) throw new Error(res.message);
        return res.addon;
    } else {
        // Fallback: fetch manifest, validate, save to localStorage
        const response = await fetch(url);
        const manifest = await response.json();
        const newAddon = {
            manifestUrl: url,
            url: url,
            id: manifest.id || url,
            name: manifest.name || 'Unknown Addon',
            manifest: manifest,
            baseUrl: url.replace('/manifest.json', ''),
            transportUrl: manifest.transportUrl || url.replace('/manifest.json', '')
        };
        const addons = await getStremioAddons();
        addons.push(newAddon);
        localStorage.setItem('stremio_addons', JSON.stringify(addons));
        return newAddon;
    }
}

async function removeStremioAddon(addonId) {
    if (window.electronAPI?.addonRemove) {
        await window.electronAPI.addonRemove(addonId);
    } else {
        // Fallback: remove from localStorage by ID
        const addons = await getStremioAddons();
        const filtered = addons.filter(a => (a.manifest?.id || a.id) !== addonId);
        localStorage.setItem('stremio_addons', JSON.stringify(filtered));
    }
}

async function renderStremioAddons() {
    const list = document.getElementById('installed-addons-list');
    list.innerHTML = '';
    
    const addons = await getStremioAddons();
    console.log('[Settings] Loaded Stremio addons:', addons);
    
    if (addons.length === 0) {
        list.innerHTML = '<div class="no-addons">No addons installed</div>';
        return;
    }
    
    addons.forEach(addon => {
        const name = addon.name || addon.manifest?.name || 'Unknown Addon';
        const addonId = addon.manifest?.id || addon.id;
        
        const item = document.createElement('div');
        item.className = 'addon-item';
        item.innerHTML = `
            <span class="addon-name">${name}</span>
            <button class="addon-remove-btn" data-id="${addonId}">Remove</button>
        `;
        
        list.appendChild(item);
    });
    
    // Add event listeners to remove buttons
    list.querySelectorAll('.addon-remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const addonId = e.target.getAttribute('data-id');
            try {
                await removeStremioAddon(addonId);
                await renderStremioAddons();
                showNotification('Addon removed successfully', 'success');
            } catch (error) {
                console.error('[Settings] Failed to remove addon', error);
                showNotification('Failed to remove addon', 'error');
            }
        });
    });
}

// ============================================================================
// Debrid Settings
// ============================================================================

let debridSettings = {};

async function initDebridUI() {
    const useDebridToggle = document.getElementById('use-debrid-toggle');
    const debridConfigContainer = document.getElementById('debrid-config-container');
    const providerSelect = document.getElementById('debrid-provider-select');
    const rdAuthSection = document.getElementById('rd-auth-section');
    const apiKeySection = document.getElementById('api-key-section');
    const rdLoginBtn = document.getElementById('rd-login-btn');
    const rdStatus = document.getElementById('rd-status');
    const debridApiInput = document.getElementById('debrid-api-input');

    // Load initial state
    debridSettings = await getSettings();
    const useDebrid = !!debridSettings.useDebrid;
    useDebridToggle.checked = useDebrid;
    
    if (useDebrid) {
        debridConfigContainer.classList.add('active');
    }

    if (debridSettings.debridProvider) {
        providerSelect.value = debridSettings.debridProvider;
    }

    const updateUI = (provider) => {
        // Reset specific UI elements
        rdAuthSection.style.display = 'none';
        apiKeySection.style.display = 'none';
        rdStatus.textContent = 'Not logged in';
        rdStatus.className = 'status-badge status-error';
        debridApiInput.value = '';

        if (provider === 'realdebrid') {
            rdAuthSection.style.display = 'block';
            if (debridSettings.debridAuth && debridSettings.debridProvider === 'realdebrid') {
                rdStatus.textContent = 'Logged in';
                rdStatus.className = 'status-badge status-success';
                rdLoginBtn.textContent = 'Logout';
                rdLoginBtn.classList.remove('btn-success');
                rdLoginBtn.style.background = 'rgba(239, 68, 68, 0.2)';
                rdLoginBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                rdLoginBtn.style.color = 'rgba(239, 68, 68, 0.9)';
            } else {
                rdLoginBtn.textContent = 'Login with Real-Debrid';
                rdLoginBtn.classList.add('btn-success');
                rdLoginBtn.style.background = '';
                rdLoginBtn.style.borderColor = '';
                rdLoginBtn.style.color = '';
            }
        } else {
            apiKeySection.style.display = 'block';
            if (debridSettings.debridAuth && debridSettings.debridProvider === provider) {
                debridApiInput.placeholder = 'Saved (Enter new to overwrite)';
            } else {
                debridApiInput.placeholder = 'Enter API Key';
            }
        }
    };

    // Event Listeners
    useDebridToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            debridConfigContainer.classList.add('active');
        } else {
            debridConfigContainer.classList.remove('active');
        }
        saveSettings({ useDebrid: e.target.checked });
    });

    providerSelect.addEventListener('change', async (e) => {
        const provider = e.target.value;
        debridSettings.debridProvider = provider;
        debridSettings.debridAuth = false;
        updateUI(provider);
        await saveSettings({ debridProvider: provider });
        
        // Refresh settings
        debridSettings = await getSettings();
        updateUI(provider);
    });

    debridApiInput.addEventListener('change', async (e) => {
        const provider = providerSelect.value;
        const key = e.target.value.trim();
        if (!key) return;

        let endpoint = '';
        let body = {};

        if (provider === 'alldebrid') {
            endpoint = '/api/debrid/ad/apikey';
            body = { apikey: key };
        } else if (provider === 'torbox') {
            endpoint = '/api/debrid/tb/token';
            body = { token: key };
        } else if (provider === 'premiumize') {
            endpoint = '/api/debrid/pm/apikey';
            body = { apikey: key };
        }

        if (endpoint) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    debridApiInput.value = '';
                    debridApiInput.placeholder = 'Saved!';
                    showNotification('API key saved successfully', 'success');
                    debridSettings = await getSettings();
                } else {
                    showNotification('Failed to save API key', 'error');
                }
            } catch (err) {
                console.error(err);
                showNotification('Error saving API key', 'error');
            }
        }
    });

    rdLoginBtn.addEventListener('click', async () => {
        if (rdLoginBtn.textContent === 'Logout') {
            await fetch('/api/debrid/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '' })
            });
            
            debridSettings.debridAuth = false;
            updateUI('realdebrid');
            showNotification('Logged out successfully', 'success');
        } else {
            startRDDeviceFlow();
        }
    });

    const startRDDeviceFlow = async () => {
        rdLoginBtn.disabled = true;
        rdLoginBtn.textContent = 'Connecting...';
        try {
            const res = await fetch(`${API_BASE}/debrid/rd/device-code`);
            const data = await res.json();
            
            if (data.user_code) {
                // Copy code to clipboard
                if (window.electronAPI?.copyToClipboard) {
                    window.electronAPI.copyToClipboard(data.user_code);
                } else {
                    navigator.clipboard.writeText(data.user_code);
                }
                
                // Open verification URL
                if (window.electronAPI?.openExternal) {
                    window.electronAPI.openExternal(`https://real-debrid.com/device?code=${data.user_code}`);
                } else {
                    window.open(`https://real-debrid.com/device?code=${data.user_code}`, '_blank');
                }

                rdStatus.textContent = `Code: ${data.user_code} (Copied)`;
                rdLoginBtn.textContent = 'Waiting...';

                // Poll for token
                pollRDToken(data.device_code, data.interval);
            }
        } catch (e) {
            console.error('[Settings] RD Login failed', e);
            rdLoginBtn.textContent = 'Error';
            rdLoginBtn.disabled = false;
            showNotification('Failed to start login flow', 'error');
        }
    };

    const pollRDToken = async (deviceCode, interval) => {
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/debrid/rd/poll`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ device_code: deviceCode })
                });
                
                let data = {};
                try {
                    data = await res.json();
                } catch (e) {
                    return;
                }
                
                if (data.success || (res.ok && !data.error)) {
                    clearInterval(pollInterval);
                    debridSettings = await getSettings();
                    updateUI('realdebrid');
                    rdLoginBtn.disabled = false;
                    showNotification('Logged in successfully', 'success');
                } else if (data.error) {
                    const errStr = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
                    if (/expired|invalid|access_denied/i.test(errStr)) {
                        clearInterval(pollInterval);
                        rdLoginBtn.textContent = 'Login Failed';
                        rdLoginBtn.disabled = false;
                        rdStatus.textContent = 'Code expired or invalid';
                        rdStatus.className = 'status-badge status-error';
                        showNotification('Login failed', 'error');
                    }
                }
            } catch (e) {
                // Network error, keep polling
            }
        }, interval * 1000);
    };

    // Initial UI Setup
    updateUI(debridSettings.debridProvider || 'realdebrid');
}

// ============================================================================
// Player Settings
// ============================================================================

async function initPlayerUI() {
    const playerTypeSelect = document.getElementById('player-type-select');
    const mpvPathSection = document.getElementById('mpv-path-section');
    const mpvPathInput = document.getElementById('mpv-path-input');
    const browseMpvBtn = document.getElementById('browse-mpv-btn');
    const downloadMpvBtn = document.getElementById('download-mpv-btn');
    
    // Check platform
    let isWindows = false;
    try {
        const platformRes = await fetch('/api/platform');
        const platformData = await platformRes.json();
        isWindows = platformData.platform === 'win32';
    } catch(e) {
        isWindows = false;
    }
    
    // Remove Node MPV option on non-Windows platforms
    if (!isWindows) {
        const nodempvOption = playerTypeSelect.querySelector('option[value="nodempv"]');
        if (nodempvOption) {
            nodempvOption.remove();
        }
    }
    
    // Load initial state
    const settings = await getSettings();
    
    let currentPlayerType = 'html';
    if (settings.playerType) {
        currentPlayerType = settings.playerType;
        if (!isWindows && currentPlayerType === 'nodempv') {
            currentPlayerType = 'html';
        }
    } else if (settings.useNodeMPV && isWindows) {
        currentPlayerType = 'nodempv';
    }
    
    playerTypeSelect.value = currentPlayerType;
    
    const updateMpvPathVisibility = () => {
        if (isWindows && playerTypeSelect.value === 'nodempv') {
            mpvPathSection.style.display = 'block';
        } else {
            mpvPathSection.style.display = 'none';
        }
    };
    updateMpvPathVisibility();
    
    if (mpvPathInput) {
        mpvPathInput.value = settings.mpvPath || '';
    }
    
    playerTypeSelect.addEventListener('change', (e) => {
        const playerType = e.target.value;
        saveSettings({ 
            playerType: playerType,
            useNodeMPV: playerType === 'nodempv'
        });
        updateMpvPathVisibility();
    });
    
    if (mpvPathInput) {
        mpvPathInput.addEventListener('blur', () => {
            saveSettings({ mpvPath: mpvPathInput.value.trim() || null });
        });
        mpvPathInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                mpvPathInput.blur();
            }
        });
    }
    
    if (browseMpvBtn) {
        browseMpvBtn.addEventListener('click', async () => {
            if (window.electronAPI?.pickFile) {
                const result = await window.electronAPI.pickFile({
                    filters: [{ name: 'Executable', extensions: ['exe'] }],
                    title: 'Select mpv.exe'
                });
                if (result && mpvPathInput) {
                    mpvPathInput.value = result;
                    saveSettings({ mpvPath: result });
                }
            } else {
                showNotification('File browser not available', 'error');
            }
        });
    }
    
    if (downloadMpvBtn) {
        downloadMpvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mpvUrl = 'https://mpv.io/installation/';
            if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(mpvUrl);
            } else {
                window.open(mpvUrl, '_blank');
            }
        });
    }
}

// ============================================================================
// Torrent Engine Settings
// ============================================================================

async function initTorrentEngineUI() {
    const engineSelect = document.getElementById('torrent-engine-select');
    const instancesContainer = document.getElementById('engine-instances-container');
    const instancesSlider = document.getElementById('engine-instances-slider');
    const instanceCountLabel = document.getElementById('instance-count-label');
    const engineDescription = document.getElementById('engine-description');
    
    const descriptions = {
        stremio: "Stremio's engine provides reliable streaming with built-in transcoding support.",
        webtorrent: "WebTorrent uses WebRTC for browser-compatible P2P streaming.",
        torrentstream: "TorrentStream is a lightweight engine optimized for video streaming.",
        hybrid: "Hybrid mode uses BOTH WebTorrent and TorrentStream for maximum speed!"
    };
    
    let currentEngine = 'torrentstream'; // DEFAULT TO TORRENTSTREAM
    let currentInstances = 5; // DEFAULT TO 5 INSTANCES
    
    try {
        const engineConfig = await fetch('/api/torrent-engine/config').then(r => r.json());
        if (engineConfig && engineConfig.engine) {
            currentEngine = engineConfig.engine;
            currentInstances = engineConfig.instances || 5;
            console.log(`[Settings] Loaded engine: ${currentEngine}, instances: ${currentInstances}`);
        }
    } catch (e) {
        console.warn('[Settings] Failed to load engine config:', e);
        try {
            const settings = await getSettings();
            if (settings.torrentEngine) {
                currentEngine = settings.torrentEngine;
            } else {
                // Force save the new default
                await saveSettings({ torrentEngine: 'torrentstream', torrentEngineInstances: 5 });
            }
            if (settings.torrentEngineInstances) {
                currentInstances = settings.torrentEngineInstances;
            }
        } catch (settingsError) {
            console.warn('[Settings] Using default torrentstream with 5 instances');
        }
    }
    
    engineSelect.value = currentEngine;
    instancesSlider.value = currentInstances;
    instanceCountLabel.textContent = currentInstances;
    
    const updateUI = (engine) => {
        engineDescription.textContent = descriptions[engine] || descriptions.stremio;
        
        if (engine === 'stremio' || engine === 'webtorrent') {
            instancesContainer.style.display = 'none';
        } else {
            instancesContainer.style.display = 'block';
        }
    };
    
    updateUI(engineSelect.value);
    
    engineSelect.addEventListener('change', async (e) => {
        const engine = e.target.value;
        updateUI(engine);
        await saveSettings({ torrentEngine: engine });
        
        try {
            await fetch('/api/torrent-engine/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    engine, 
                    instances: parseInt(instancesSlider.value, 10) 
                })
            });
        } catch (e) {
            console.error('[Settings] Failed to update engine:', e);
        }
    });
    
    instancesSlider.addEventListener('input', (e) => {
        instanceCountLabel.textContent = e.target.value;
    });
    
    instancesSlider.addEventListener('change', async (e) => {
        const instances = parseInt(e.target.value, 10);
        await saveSettings({ torrentEngineInstances: instances });
        
        try {
            await fetch('/api/torrent-engine/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    engine: engineSelect.value, 
                    instances 
                })
            });
        } catch (e) {
            console.error('[Settings] Failed to update instances:', e);
        }
    });
}

// ============================================================================
// Main Initialization
// ============================================================================

async function init() {
    // Load Streaming Mode setting
    const settings = await getSettings();
    const streamingModeToggle = document.getElementById('streaming-mode-toggle');
    
    console.log('[Settings] Full settings object:', settings);
    console.log('[Settings] streamingMode value:', settings.streamingMode);
    
    // Default to true if not set
    const streamingMode = settings.streamingMode !== undefined ? settings.streamingMode : true;
    streamingModeToggle.checked = streamingMode;
    
    console.log('[Settings] Loaded Streaming Mode:', streamingMode, 'Toggle checked:', streamingModeToggle.checked);
    
    // Event listener for streaming mode
    streamingModeToggle.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        console.log('[Settings] Streaming Mode toggle changed to:', enabled);
        const saved = await saveSettings({ streamingMode: enabled });
        console.log('[Settings] Save result:', saved);
        
        // Verify it was saved
        const verifySettings = await getSettings();
        console.log('[Settings] Verified streamingMode after save:', verifySettings.streamingMode);
        
        showNotification(`Streaming Mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
        
        // Reload streaming mode in the main app if available
        if (window.streamingMode && window.streamingMode.reload) {
            await window.streamingMode.reload();
        }
    });
    
    // Load Jackett settings
    const jackettKey = await getJackettKey();
    
    const jackettApiInput = document.getElementById('jackett-api-input');
    const jackettUrlInput = document.getElementById('jackett-url-input');
    
    jackettApiInput.value = jackettKey || '';
    if (jackettKey) {
        jackettApiInput.placeholder = 'API Key saved (hidden)';
    }
    jackettUrlInput.value = settings.jackettUrl || '';
    
    console.log('[Settings] Loaded Jackett key:', jackettKey ? '***' + jackettKey.slice(-4) : 'none');
    
    // Load Prowlarr settings
    const prowlarrKey = await getProwlarrKey();
    const prowlarrApiInput = document.getElementById('prowlarr-api-input');
    const prowlarrUrlInput = document.getElementById('prowlarr-url-input');
    
    prowlarrApiInput.value = prowlarrKey || '';
    if (prowlarrKey) {
        prowlarrApiInput.placeholder = 'API Key saved (hidden)';
    }
    prowlarrUrlInput.value = settings.prowlarrUrl || '';
    
    console.log('[Settings] Loaded Prowlarr key:', prowlarrKey ? '***' + prowlarrKey.slice(-4) : 'none');
    
    // Load Stremio addons
    await renderStremioAddons();
    
    // Initialize Debrid UI
    await initDebridUI();
    
    // Initialize Player UI
    await initPlayerUI();
    
    // Initialize Torrent Engine UI
    await initTorrentEngineUI();
    
    // Event Listeners
    document.getElementById('back-btn').addEventListener('click', () => {
        sessionStorage.setItem('skipIntro', 'true');
        window.location.href = 'index.html';
    });
    
    document.getElementById('install-addon-btn').addEventListener('click', async () => {
        const input = document.getElementById('addon-manifest-input');
        const url = input.value.trim();
        
        if (!url) {
            showNotification('Please enter an addon URL', 'error');
            return;
        }
        
        try {
            await addStremioAddon(url);
            await renderStremioAddons();
            input.value = '';
            showNotification('Addon installed successfully', 'success');
        } catch (error) {
            console.error('[Settings] Failed to install addon', error);
            showNotification('Failed to install addon: ' + error.message, 'error');
        }
    });
    
    document.getElementById('save-settings-btn').addEventListener('click', async () => {
        try {
            // Save Jackett
            const jackettKey = jackettApiInput.value.trim();
            const jackettUrl = jackettUrlInput.value.trim();
            
            if (jackettKey) {
                await setJackettKey(jackettKey);
            }
            
            // Save Prowlarr
            const prowlarrKey = prowlarrApiInput.value.trim();
            const prowlarrUrl = prowlarrUrlInput.value.trim();
            
            if (prowlarrKey) {
                await setProwlarrKey(prowlarrKey);
            }
            
            // Save URLs
            await saveSettings({
                jackettUrl: jackettUrl || null,
                prowlarrUrl: prowlarrUrl || null
            });
            
            showNotification('Settings saved successfully', 'success');
        } catch (error) {
            console.error('[Settings] Failed to save settings', error);
            showNotification('Failed to save settings', 'error');
        }
    });
    
    document.getElementById('switch-mode-btn').addEventListener('click', () => {
        if (window.electronAPI?.setPreferredMode) {
            window.electronAPI.setPreferredMode('basic');
        }
        sessionStorage.setItem('skipIntro', 'true');
        window.location.href = '../basicmode/index.html';
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Streaming Mode - Stream Extraction & Player (HLS.js based)
let streamingModeEnabled = true;
let streamingModeLoaded = false; // Track if setting has been loaded
let currentProvider = 'vidfast';
let currentStreamUrl = null;
let previousStreamUrl = null; // Store previous stream for cancel fallback
let previousProvider = null; // Store previous provider for cancel fallback
let previousPlaybackTime = 0; // Store playback time for cancel fallback
let currentSubtitles = [];
let isLoadingStream = false;
let streamHls = null;
let streamDash = null;
let activeSub = null;
let subDelay = 0;
let subSize = 150; // percentage
let subPos = 130; // pixels from bottom
let introData = null; // Store intro/recap/credits data
let currentSegmentType = null; // Track which segment we're in
let nextEpisodeInfo = null; // Store next episode info for TV shows

// Load streaming mode setting from API
async function loadStreamingModeSetting() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            const settings = await response.json();
            // Default to true if not set
            streamingModeEnabled = settings.streamingMode !== undefined ? settings.streamingMode : true;
            streamingModeLoaded = true;
            console.log('[StreamingMode] Loaded setting from API:', streamingModeEnabled);
        } else {
            // Fallback to localStorage
            const localSettings = JSON.parse(localStorage.getItem('streamingModeSettings') || '{}');
            streamingModeEnabled = localSettings.enabled !== false;
            streamingModeLoaded = true;
            console.log('[StreamingMode] Loaded setting from localStorage:', streamingModeEnabled);
        }
    } catch (e) {
        console.warn('[StreamingMode] Failed to load from API, using default:', e);
        streamingModeEnabled = true;
        streamingModeLoaded = true;
    }
    return streamingModeEnabled;
}

// Save streaming mode setting to API
async function saveStreamingModeSetting(enabled) {
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ streamingMode: enabled })
        });
        
        if (response.ok) {
            streamingModeEnabled = enabled;
            console.log('[StreamingMode] Saved setting to API:', enabled);
        } else {
            // Fallback to localStorage
            localStorage.setItem('streamingModeSettings', JSON.stringify({ enabled }));
            streamingModeEnabled = enabled;
            console.log('[StreamingMode] Saved setting to localStorage:', enabled);
        }
    } catch (e) {
        console.error('[StreamingMode] Failed to save setting:', e);
        // Fallback to localStorage
        localStorage.setItem('streamingModeSettings', JSON.stringify({ enabled }));
        streamingModeEnabled = enabled;
    }
}

// Initialize streaming mode (async) - await this before checking enabled()
const streamingModeReady = loadStreamingModeSetting();

// Provider URLs (ordered by priority: vidfast first)
const PROVIDERS = {
    vidfast: {
        name: 'Vidfast',
        movie: (tmdbId) => `https://vidfast.pro/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`
    },
    vixsrc: {
        name: 'VixSrc',
        movie: (tmdbId) => `https://vixsrc.to/movie/${tmdbId}/`,
        tv: (tmdbId, season, episode) => `https://vixsrc.to/tv/${tmdbId}/${season}/${episode}/`
    },
    vidlink: {
        name: 'Vidlink',
        movie: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
    },
    videasy: {
        name: 'Videasy',
        movie: (tmdbId) => `https://player.videasy.net/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`
    },
    anitaro: {
        name: 'Anitaro (4K)',
        movie: (tmdbId) => `https://api.anitaro.live/cdn/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://api.anitaro.live/cdn/tv/${tmdbId}/${season}/${episode}`
    },
    cinesrc: {
        name: 'CineSrc',
        movie: (tmdbId) => `https://cinesrc.st/embed/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`
    },
    flixer: {
        name: 'Flixer',
        movie: (tmdbId) => `https://flixer.sh/watch/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://flixer.sh/watch/tv/${tmdbId}/${season}/${episode}`
    },
    vidsrc: {
        name: 'VidSrc',
        movie: (tmdbId) => `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`
    },
    vidnest: {
        name: 'VidNest',
        movie: (tmdbId) => `https://vidnest.fun/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}`
    },
    fmovies: {
        name: 'FMovies',
        movie: (tmdbId) => `https://www.fmovies.gd/watch/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://www.fmovies.gd/watch/tv/${tmdbId}/${season}/${episode}`
    },
    movies111: {
        name: '111Movies',
        movie: (tmdbId) => `https://111movies.com/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://111movies.com/tv/${tmdbId}/${season}/${episode}`
    },
    vidzee: {
        name: 'Vidzee',
        movie: (tmdbId) => `https://player.vidzee.wtf/embed/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://player.vidzee.wtf/embed/tv/${tmdbId}/${season}/${episode}`
    },
    rayflix: {
        name: 'Rayflix',
        movie: (tmdbId) => `https://mov-web.cometclient.dev/movie/watch/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://mov-web.cometclient.dev/tv/watch/${tmdbId}/${season}/${episode}`
    }
};

// Get provider URL
function getProviderUrl(provider, type, tmdbId, season = null, episode = null) {
    const prov = PROVIDERS[provider];
    if (!prov) return null;
    
    if (type === 'movie') {
        return prov.movie(tmdbId);
    } else {
        return prov.tv(tmdbId, season, episode);
    }
}

// Extract stream from URL
async function extractStream(url, provider = currentProvider) {
    try {
        console.log('[StreamExtractor] Extracting from:', url);
        console.log('[StreamExtractor] Provider:', provider);
        console.log('[StreamExtractor] electronAPI available:', typeof window.electronAPI !== 'undefined');
        console.log('[StreamExtractor] extractStream method:', typeof window.electronAPI?.extractStream);
        
        // Add delay for Flixer (it's slower)
        if (provider === 'flixer') {
            console.log('[StreamExtractor] Waiting 3 seconds for Flixer...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        console.log('[StreamExtractor] Calling electronAPI.extractStream...');
        await window.electronAPI.extractStream(url);
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.error('[StreamExtractor] ❌ Timeout waiting for stream');
                window.electronAPI.removeStreamListener(handler);
                reject(new Error('Stream extraction timeout'));
            }, 45000);
            
            const handler = (data) => {
                clearTimeout(timeout);
                window.electronAPI.removeStreamListener(handler);
                console.log('[StreamExtractor] ✅ Stream detected:', data);
                console.log('[StreamExtractor] Proxy URL:', data.proxyUrl);
                resolve(data.proxyUrl);
            };
            
            console.log('[StreamExtractor] Waiting for stream-detected event...');
            window.electronAPI.onStreamDetected(handler);
        });
    } catch (error) {
        console.error('[StreamExtractor] ❌ Error:', error);
        throw error;
    }
}

// Load intro/recap/credits data from IntroDB
async function loadIntroData(tmdbId, season = null, episode = null) {
    try {
        let url = `https://api.theintrodb.org/v1/media?tmdb_id=${tmdbId}`;
        if (season && episode) {
            url += `&season=${season}&episode=${episode}`;
        }
        
        console.log('[IntroDB] Loading intro data from:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('[IntroDB] Loaded intro data:', data);
        return data;
    } catch (error) {
        console.error('[IntroDB] Error loading intro data:', error);
        return null;
    }
}
async function loadSubtitles(tmdbId, imdbId, season = null, episode = null, mediaType = 'movie') {
    const subtitles = [];
    const TIMEOUT = 5000; // 5 seconds max
    
    // Create a promise that resolves with current subtitles after timeout
    const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
            console.log('[Subtitles] Timeout reached, returning what we have');
            resolve('timeout');
        }, TIMEOUT);
    });
    
    // Fetch subtitles with timeout
    const fetchPromise = (async () => {
        const fetchPromises = [];
        
        // 1. Fetch from Wyzie
        if (tmdbId) {
            fetchPromises.push((async () => {
                try {
                    let url = `https://sub.wyzie.ru/search?id=${tmdbId}`;
                    if (season && episode) {
                        url += `&season=${season}&episode=${episode}`;
                    }
                    
                    console.log('[Subtitles] Loading from Wyzie:', url);
                    
                    const response = await fetch(url);
                    const subs = await response.json();
                    
                    if (subs && subs.length > 0) {
                        subs.forEach(sub => {
                            if (sub.url) {
                                subtitles.push({
                                    provider: 'Wyzie',
                                    display: sub.display || sub.languageName || 'Unknown',
                                    language: sub.language || 'unknown',
                                    url: sub.url
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.warn('[Subtitles] Wyzie fetch error:', e);
                }
            })());
        }
        
        // 2. Fetch from Stremio Addons
        fetchPromises.push((async () => {
            try {
                const { getInstalledAddons } = await import('./addons.js');
                const addons = await getInstalledAddons();
                
                if (!addons || addons.length === 0) return;
                
                const addonPromises = addons.map(async (addon) => {
                    const resources = addon.manifest?.resources || [];
                    const hasSubtitles = resources.some(r => 
                        (typeof r === 'string' && r === 'subtitles') ||
                        (typeof r === 'object' && r?.name === 'subtitles')
                    );
                    
                    if (!hasSubtitles) return;
                    
                    try {
                        let baseUrl = addon.url ? addon.url.replace('/manifest.json', '') : addon.baseUrl;
                        if (baseUrl && baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
                        
                        if (!baseUrl) return;
                        
                        const resourceId = mediaType === 'tv' && season && episode
                            ? `${imdbId}:${season}:${episode}`
                            : imdbId;
                        
                        if (!resourceId) return;
                        
                        const endpoint = `${baseUrl}/subtitles/${mediaType}/${encodeURIComponent(resourceId)}.json`;
                        const res = await fetch(endpoint);
                        
                        if (res.ok) {
                            const data = await res.json();
                            const addonSubs = data.subtitles || [];
                            const addonName = addon.manifest?.name || 'Addon';
                            
                            addonSubs.forEach(sub => {
                                if (sub.url) {
                                    subtitles.push({
                                        provider: addonName,
                                        display: `${sub.lang || sub.language || 'Unknown'}`,
                                        language: sub.lang || sub.language || 'unknown',
                                        url: sub.url
                                    });
                                }
                            });
                        }
                    } catch (e) {
                        // Addon doesn't support subtitles for this content
                    }
                });
                
                await Promise.allSettled(addonPromises);
            } catch (e) {
                console.warn('[Subtitles] Addon fetch error:', e);
            }
        })());
        
        await Promise.allSettled(fetchPromises);
    })();
    
    await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log('[Subtitles] Loaded:', subtitles.length, 'subtitles');
    return subtitles || [];
}

// Show loading screen
function showLoadingScreen(posterUrl, title) {
    const loadingScreen = document.getElementById('stream-loading-screen');
    if (!loadingScreen) return;
    
    const poster = loadingScreen.querySelector('.loading-poster');
    const titleEl = loadingScreen.querySelector('.loading-title');
    const statusEl = loadingScreen.querySelector('.loading-status');
    
    if (poster) poster.style.backgroundImage = `url(${posterUrl})`;
    if (titleEl) titleEl.textContent = title;
    if (statusEl) statusEl.textContent = 'Getting streams...';
    
    loadingScreen.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('stream-loading-screen');
    if (!loadingScreen) return;
    
    loadingScreen.classList.remove('active');
    document.body.style.overflow = '';
}

// Update loading status
function updateLoadingStatus(status) {
    const statusEl = document.querySelector('.loading-status');
    if (statusEl) statusEl.textContent = status;
}

// Show stream player
function showStreamPlayer() {
    const player = document.getElementById('stream-player-container');
    if (!player) return;
    
    player.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize player controls after showing
    initPlayerControls();
}

// Hide stream player
function hideStreamPlayer() {
    // Exit fullscreen first if in fullscreen mode
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        console.log('[Player] Exiting fullscreen before closing...');
        
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        // Wait for fullscreen to exit before closing
        setTimeout(() => {
            actuallyHidePlayer();
        }, 300);
    } else {
        // Not in fullscreen, close immediately
        actuallyHidePlayer();
    }
}

// Actually hide the player (separated for fullscreen handling)
function actuallyHidePlayer() {
    const player = document.getElementById('stream-player-container');
    if (!player) return;
    
    // Save playback position before closing
    const video = document.getElementById('stream-video');
    if (video && window.currentMediaInfo) {
        savePlaybackPosition(video.currentTime);
    }
    
    player.classList.remove('active');
    document.body.style.overflow = '';
    
    // Stop video and cleanup
    if (video) {
        video.pause();
        video.src = '';
        video.load();
    }
    
    // Destroy HLS instance if exists
    if (streamHls) {
        streamHls.destroy();
        streamHls = null;
    }
    
    // Destroy DASH instance if exists
    if (streamDash) {
        streamDash.reset();
        streamDash = null;
    }
    
    // Clear subtitle overlay
    const subOverlay = document.getElementById('subtitle-overlay');
    if (subOverlay) subOverlay.textContent = '';
    
    // Hide skip button
    const skipBtn = document.getElementById('skip-segment-btn');
    if (skipBtn) skipBtn.style.display = 'none';
    
    // Hide next episode button
    const nextEpBtn = document.getElementById('next-episode-btn');
    if (nextEpBtn) nextEpBtn.style.display = 'none';
    
    // Reset current stream data
    currentStreamUrl = null;
    currentSubtitles = [];
    activeSub = null;
    introData = null;
    currentSegmentType = null;
    nextEpisodeInfo = null;
}

// Save playback position to localStorage
function savePlaybackPosition(time) {
    if (!window.currentMediaInfo) return;
    
    const { type, tmdbId, season, episode, posterUrl, title } = window.currentMediaInfo;
    const key = type === 'movie' 
        ? `playback_${type}_${tmdbId}`
        : `playback_${type}_${tmdbId}_${season}_${episode}`;
    
    try {
        // Save playback position
        localStorage.setItem(key, time.toString());
        console.log('[Playback] Saved position:', time, 'for', key);
        
        // Save to continue watching list
        const continueWatching = getContinueWatchingList();
        const itemKey = type === 'movie' ? `${type}_${tmdbId}` : `${type}_${tmdbId}`;
        
        // Remove existing entry if present
        const filtered = continueWatching.filter(item => item.key !== itemKey);
        
        // Add new entry at the beginning
        filtered.unshift({
            key: itemKey,
            type,
            tmdbId,
            season: season || null,
            episode: episode || null,
            posterUrl,
            title,
            time,
            timestamp: Date.now()
        });
        
        // Keep only last 20 items
        const limited = filtered.slice(0, 20);
        localStorage.setItem('continueWatching', JSON.stringify(limited));
        
    } catch (e) {
        console.error('[Playback] Failed to save position:', e);
    }
}

// Get saved playback position from localStorage
function getSavedPlaybackPosition() {
    if (!window.currentMediaInfo) return 0;
    
    const { type, tmdbId, season, episode } = window.currentMediaInfo;
    const key = type === 'movie' 
        ? `playback_${type}_${tmdbId}`
        : `playback_${type}_${tmdbId}_${season}_${episode}`;
    
    try {
        const saved = localStorage.getItem(key);
        const time = saved ? parseFloat(saved) : 0;
        console.log('[Playback] Retrieved position:', time, 'for', key);
        return time;
    } catch (e) {
        console.error('[Playback] Failed to retrieve position:', e);
        return 0;
    }
}

// Get continue watching list
function getContinueWatchingList() {
    try {
        const saved = localStorage.getItem('continueWatching');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('[ContinueWatching] Failed to retrieve list:', e);
        return [];
    }
}

// Remove item from continue watching
function removeFromContinueWatching(itemKey) {
    try {
        const continueWatching = getContinueWatchingList();
        const filtered = continueWatching.filter(item => item.key !== itemKey);
        localStorage.setItem('continueWatching', JSON.stringify(filtered));
        
        // Also remove the playback position
        const item = continueWatching.find(i => i.key === itemKey);
        if (item) {
            const posKey = item.type === 'movie' 
                ? `playback_${item.type}_${item.tmdbId}`
                : `playback_${item.type}_${item.tmdbId}_${item.season}_${item.episode}`;
            localStorage.removeItem(posKey);
        }
        
        console.log('[ContinueWatching] Removed item:', itemKey);
        return true;
    } catch (e) {
        console.error('[ContinueWatching] Failed to remove item:', e);
        return false;
    }
}

// Make functions globally accessible
window.getContinueWatchingList = getContinueWatchingList;
window.removeFromContinueWatching = removeFromContinueWatching;

// Play stream
async function playStream(type, tmdbId, posterUrl, title, season = null, episode = null, providerOrder = null) {
    console.log('[StreamingMode] ========================================');
    console.log('[StreamingMode] playStream called');
    console.log('[StreamingMode] Type:', type);
    console.log('[StreamingMode] TMDB ID:', tmdbId);
    console.log('[StreamingMode] Title:', title);
    console.log('[StreamingMode] Season:', season, 'Episode:', episode);
    console.log('[StreamingMode] Enabled:', streamingModeEnabled);
    console.log('[StreamingMode] Already loading:', isLoadingStream);
    console.log('[StreamingMode] ========================================');
    
    if (!streamingModeEnabled) {
        console.log('[StreamingMode] Disabled, using default player');
        return false;
    }
    
    if (isLoadingStream) {
        console.log('[StreamingMode] Already loading a stream');
        return true;
    }
    
    isLoadingStream = true;
    
    // Define provider priority order: videasy, vidlink, vidfast, then others, anitaro last
    if (!providerOrder) {
        const allProviders = Object.keys(PROVIDERS);
        providerOrder = ['vidfast', 'vixsrc', 'vidlink', 'videasy'];
        
        // Add remaining providers except anitaro
        allProviders.forEach(p => {
            if (!providerOrder.includes(p) && p !== 'anitaro') {
                providerOrder.push(p);
            }
        });
        
        // Add anitaro last
        if (allProviders.includes('anitaro')) {
            providerOrder.push('anitaro');
        }
        
        console.log('[StreamingMode] Provider order:', providerOrder);
    }
    
    // Get backdrop image instead of poster
    let backdropUrl = posterUrl;
    try {
        const API_KEY = 'c3515fdc674ea2bd7b514f4bc3616a4a';
        const BASE_URL = 'https://api.themoviedb.org/3';
        const IMG_BASE_URL = 'https://image.tmdb.org/t/p';
        
        const detailsUrl = `${BASE_URL}/${type}/${tmdbId}?api_key=${API_KEY}`;
        const response = await fetch(detailsUrl);
        const data = await response.json();
        
        if (data.backdrop_path) {
            backdropUrl = `${IMG_BASE_URL}/original${data.backdrop_path}`;
            console.log('[StreamingMode] Got backdrop URL:', backdropUrl);
        }
    } catch (error) {
        console.log('[StreamingMode] Could not fetch backdrop, using poster');
    }
    
    // Store media info for provider switching
    window.currentMediaInfo = { type, tmdbId, posterUrl: backdropUrl, title, season, episode };
    
    // For TV shows, calculate next episode info
    if (type === 'tv' && season && episode) {
        nextEpisodeInfo = {
            type: 'tv',
            tmdbId,
            season: parseInt(season),
            episode: parseInt(episode) + 1,
            posterUrl: backdropUrl,
            title
        };
        console.log('[StreamingMode] Next episode info:', nextEpisodeInfo);
    } else {
        nextEpisodeInfo = null;
    }
    
    // Show loading screen with backdrop
    console.log('[StreamingMode] Showing loading screen...');
    showLoadingScreen(backdropUrl, title);
    
    // Try each provider in order until one succeeds
    let lastError = null;
    for (let i = 0; i < providerOrder.length; i++) {
        const provider = providerOrder[i];
        currentProvider = provider;
        
        try {
            console.log(`[StreamingMode] Trying provider ${i + 1}/${providerOrder.length}: ${provider}`);
            updateLoadingStatus(`Extracting from ${PROVIDERS[provider].name}... (${i + 1}/${providerOrder.length})`);
            
            // Get provider URL
            const providerUrl = getProviderUrl(provider, type, tmdbId, season, episode);
            if (!providerUrl) {
                console.warn(`[StreamingMode] Invalid provider URL for ${provider}, skipping...`);
                continue;
            }
            
            console.log('[StreamingMode] Provider URL:', providerUrl);
            
            // Extract stream with timeout
            console.log('[StreamingMode] Starting stream extraction...');
            const streamUrl = await extractStream(providerUrl, provider);
            console.log('[StreamingMode] ✅ Stream extracted:', streamUrl);
            
            currentStreamUrl = streamUrl;
            
            updateLoadingStatus('Loading subtitles...');
            
            // Load subtitles
            console.log('[StreamingMode] Loading subtitles...');
            
            // Fetch IMDB ID for Stremio addons
            let imdbId = null;
            try {
                const API_KEY = 'c3515fdc674ea2bd7b514f4bc3616a4a';
                const BASE_URL = 'https://api.themoviedb.org/3';
                const externalIdsUrl = `${BASE_URL}/${type}/${tmdbId}/external_ids?api_key=${API_KEY}`;
                const externalIdsResponse = await fetch(externalIdsUrl);
                const externalIdsData = await externalIdsResponse.json();
                imdbId = externalIdsData.imdb_id;
                console.log('[StreamingMode] IMDB ID:', imdbId);
            } catch (error) {
                console.warn('[StreamingMode] Could not fetch IMDB ID:', error);
            }
            
            currentSubtitles = await loadSubtitles(tmdbId, imdbId, season, episode, type);
            console.log('[StreamingMode] Loaded', currentSubtitles.length, 'subtitles');
            
            // Load intro/recap/credits data
            console.log('[StreamingMode] Loading intro data...');
            introData = await loadIntroData(tmdbId, season, episode);
            console.log('[StreamingMode] Intro data:', introData);
            
            // Hide loading, show player
            console.log('[StreamingMode] Hiding loading screen...');
            hideLoadingScreen();
            
            console.log('[StreamingMode] Showing player...');
            showStreamPlayer();
            
            // Load stream into player
            console.log('[StreamingMode] Loading stream into player...');
            loadStreamIntoPlayer(streamUrl, title);
            
            // Load subtitles into player
            console.log('[StreamingMode] Loading subtitles into player...');
            loadSubtitlesIntoPlayer(currentSubtitles);
            
            console.log(`[StreamingMode] ✅ Stream playback initiated successfully with ${provider}`);
            
            isLoadingStream = false;
            return true;
            
        } catch (error) {
            console.error(`[StreamingMode] ❌ Provider ${provider} failed:`, error.message);
            lastError = error;
            
            // If this is not the last provider, continue to next one
            if (i < providerOrder.length - 1) {
                console.log(`[StreamingMode] Retrying with next provider...`);
                continue;
            }
        }
    }
    
    // All providers failed
    console.error('[StreamingMode] ❌ All providers failed');
    console.error('[StreamingMode] Last error:', lastError);
    hideLoadingScreen();
    isLoadingStream = false;
    alert(`Failed to load stream from all providers. Last error: ${lastError?.message || 'Unknown error'}`);
    return false;
}

// Load stream into video player using HLS.js or dash.js
function loadStreamIntoPlayer(streamUrl, title) {
    const video = document.getElementById('stream-video');
    const titleEl = document.getElementById('stream-player-title');
    
    console.log('[Player] loadStreamIntoPlayer called with:', streamUrl);
    console.log('[Player] Video element:', video);
    console.log('[Player] HLS available:', typeof Hls !== 'undefined');
    console.log('[Player] DASH available:', typeof dashjs !== 'undefined');
    
    if (!video) {
        console.error('[Player] Video element not found!');
        return;
    }
    
    if (titleEl) titleEl.textContent = title;
    
    // Destroy old instances
    if (streamHls) {
        try {
            console.log('[Player] Destroying old HLS instance');
            streamHls.destroy();
        } catch (e) {
            console.log('[Player] Error destroying HLS:', e);
        }
        streamHls = null;
    }
    
    if (streamDash) {
        try {
            console.log('[Player] Destroying old DASH instance');
            streamDash.reset();
        } catch (e) {
            console.log('[Player] Error destroying DASH:', e);
        }
        streamDash = null;
    }
    
    // Check if this is DASH (.mpd) or HLS (.m3u8)
    const isDash = streamUrl.includes('.mpd') || streamUrl.includes('manifest');
    const isM3U8 = streamUrl.includes('.m3u8') || streamUrl.includes('playlist');
    
    console.log('[Player] Is DASH stream:', isDash);
    console.log('[Player] Is M3U8 stream:', isM3U8);
    
    if (isDash && typeof dashjs !== 'undefined') {
        console.log('[Player] Using dash.js for DASH stream');
        
        streamDash = dashjs.MediaPlayer().create();
        streamDash.initialize(video, streamUrl, true);
        
        streamDash.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED, () => {
            console.log('[Player] ✅ DASH playback started');
            
            // Restore saved playback position
            const savedTime = getSavedPlaybackPosition();
            if (savedTime > 0) {
                console.log('[Player] Restoring playback position:', savedTime);
                video.currentTime = savedTime;
            }
        });
        
        streamDash.on(dashjs.MediaPlayer.events.ERROR, (e) => {
            console.error('[Player] ❌ DASH Error:', e);
        });
        
        console.log('[Player] DASH stream loading initiated');
        
    } else if (isM3U8 && typeof Hls !== 'undefined' && Hls.isSupported()) {
        console.log('[Player] Using HLS.js for m3u8 stream');
        
        streamHls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false,
            // Optimized buffer settings for smooth playback
            maxBufferLength: 60,           // Buffer 60 seconds ahead (increased from 30)
            maxMaxBufferLength: 120,       // Max buffer cap at 120 seconds (reduced from 600)
            maxBufferSize: 60 * 1000 * 1000, // 60 MB max buffer size
            maxBufferHole: 0.5,            // Tolerate 0.5s gaps without stalling
            highBufferWatchdogPeriod: 2,   // Check buffer health every 2 seconds
            nudgeOffset: 0.1,              // Small nudge for smoother playback
            nudgeMaxRetry: 3,              // Retry nudging 3 times
            maxFragLookUpTolerance: 0.25,  // Fragment lookup tolerance
            liveSyncDurationCount: 3,      // For live streams
            liveMaxLatencyDurationCount: 10,
            liveDurationInfinity: false,
            // Loader settings for better network handling
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 2,
            manifestLoadingRetryDelay: 1000,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 4,
            levelLoadingRetryDelay: 1000,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 1000,
            // ABR (Adaptive Bitrate) settings
            startLevel: -1,                // Auto-select quality
            abrEwmaDefaultEstimate: 500000, // Initial bandwidth estimate (500 kbps)
            abrEwmaFastLive: 3.0,
            abrEwmaSlowLive: 9.0,
            abrEwmaFastVoD: 3.0,
            abrEwmaSlowVoD: 9.0,
            abrBandWidthFactor: 0.95,      // Use 95% of estimated bandwidth
            abrBandWidthUpFactor: 0.7,     // More conservative when upgrading quality
            abrMaxWithRealBitrate: false,
            maxStarvationDelay: 4,         // Max starvation before quality drop
            maxLoadingDelay: 4,
            minAutoBitrate: 0,
            // Progressive loading
            progressive: true,
            // Backbuffer management
            backBufferLength: 30,          // Keep only 30 seconds behind (reduced from 90)
            // Other optimizations
            stretchShortVideoTrack: false,
            maxAudioFramesDrift: 1,
            forceKeyFrameOnDiscontinuity: true,
            testBandwidth: true
        });
        
        // Filter out subtitle tracks before loading
        streamHls.on(Hls.Events.MANIFEST_LOADING, () => {
            console.log('[Player] Manifest loading...');
        });
        
        streamHls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
            console.log('[Player] Manifest loaded, filtering subtitle tracks...');
            // Remove subtitle tracks from the manifest
            if (data.subtitleTracks) {
                console.log('[Player] Removing', data.subtitleTracks.length, 'subtitle tracks');
                data.subtitleTracks = [];
            }
            if (data.subtitles) {
                console.log('[Player] Removing subtitle data');
                data.subtitles = [];
            }
        });
        
        console.log('[Player] Loading source:', streamUrl);
        streamHls.loadSource(streamUrl);
        
        console.log('[Player] Attaching media to video element');
        streamHls.attachMedia(video);
        
        streamHls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('[Player] ✅ HLS manifest parsed, ready to play');
            console.log('[Player] Available levels:', streamHls.levels);
            
            // Populate quality selector
            populateQualityLevels();
            
            // Restore saved playback position
            const savedTime = getSavedPlaybackPosition();
            if (savedTime > 0) {
                console.log('[Player] Restoring playback position:', savedTime);
                video.currentTime = savedTime;
            }
            
            video.play().then(() => {
                console.log('[Player] ✅ Video playback started');
            }).catch(e => {
                console.error('[Player] ❌ Autoplay prevented:', e);
            });
        });
        
        streamHls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            console.log('[Player] Level loaded:', data.level, 'details:', data.details);
        });
        
        streamHls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            console.log('[Player] Fragment loaded:', data.frag.sn);
        });
        
        streamHls.on(Hls.Events.ERROR, (event, data) => {
            console.error('[Player] ❌ HLS Error:', data);
            if (data.fatal) {
                console.error('[Player] Fatal error type:', data.type);
                console.error('[Player] Fatal error details:', data.details);
                
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    console.log('[Player] Network error, trying to recover...');
                    streamHls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    console.log('[Player] Media error, trying to recover...');
                    streamHls.recoverMediaError();
                } else {
                    console.error('[Player] Unrecoverable error, destroying HLS');
                    streamHls.destroy();
                    streamHls = null;
                }
            }
        });
    } else if (isM3U8 && video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('[Player] Using native HLS support (Safari)');
        video.src = streamUrl;
        video.load();
        
        // Restore saved playback position
        video.addEventListener('loadedmetadata', () => {
            const savedTime = getSavedPlaybackPosition();
            if (savedTime > 0) {
                console.log('[Player] Restoring playback position:', savedTime);
                video.currentTime = savedTime;
            }
        }, { once: true });
        
        video.play().then(() => {
            console.log('[Player] ✅ Video playback started (native)');
        }).catch(e => {
            console.error('[Player] ❌ Autoplay prevented:', e);
        });
    } else {
        console.log('[Player] Using native video for direct stream');
        
        video.src = streamUrl;
        video.load();
        
        // Restore saved playback position
        video.addEventListener('loadedmetadata', () => {
            const savedTime = getSavedPlaybackPosition();
            if (savedTime > 0) {
                console.log('[Player] Restoring playback position:', savedTime);
                video.currentTime = savedTime;
            }
        }, { once: true });
        video.play().then(() => {
            console.log('[Player] ✅ Video playback started (direct)');
        }).catch(e => {
            console.error('[Player] ❌ Autoplay prevented:', e);
        });
    }
    
    console.log('[Player] Stream loading initiated');
}

// Parse SRT subtitle format (like player.html)
function parseSRT(srtText) {
    const lines = srtText.trim().split('\n');
    const cues = [];
    let i = 0;
    
    while (i < lines.length) {
        // Skip empty lines
        if (!lines[i].trim()) {
            i++;
            continue;
        }
        
        // Skip index line
        if (/^\d+$/.test(lines[i].trim())) {
            i++;
        }
        
        // Parse timestamp line
        if (i < lines.length && lines[i].includes('-->')) {
            const timeLine = lines[i];
            const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
            
            const start = parseTimestamp(startStr);
            const end = parseTimestamp(endStr);
            
            i++;
            
            // Collect text lines until empty line or next cue
            let text = '';
            while (i < lines.length && lines[i].trim() && !/^\d+$/.test(lines[i].trim())) {
                text += (text ? '\n' : '') + lines[i].trim();
                i++;
            }
            
            if (text) {
                cues.push({ start, end, text });
            }
        } else {
            i++;
        }
    }
    
    return cues;
}

// Parse SRT timestamp to seconds
function parseTimestamp(timestamp) {
    const parts = timestamp.replace(',', '.').split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
}

// Update subtitle display based on current time
function updateSubtitleDisplay() {
    const video = document.getElementById('stream-video');
    const overlay = document.getElementById('subtitle-overlay');
    
    if (!video || !overlay || !activeSub) {
        return;
    }
    
    const currentTime = video.currentTime + subDelay;
    
    // Find current cue
    const cue = activeSub.cues.find(c => currentTime >= c.start && currentTime <= c.end);
    
    if (cue) {
        overlay.textContent = cue.text;
        overlay.style.display = 'block';
    } else {
        overlay.textContent = '';
        overlay.style.display = 'none';
    }
}

// Check if we're in a skippable segment and show button
function checkSkippableSegment() {
    const video = document.getElementById('stream-video');
    const skipBtn = document.getElementById('skip-segment-btn');
    
    if (!video || !skipBtn || !introData) return;
    
    const currentTimeMs = video.currentTime * 1000;
    let inSegment = false;
    let segmentType = null;
    let segmentEnd = null;
    
    // Lower confidence threshold to 0.2 (20%) to catch more segments
    const CONFIDENCE_THRESHOLD = 0.2;
    
    // Check intro
    if (introData.intro && introData.intro.confidence >= CONFIDENCE_THRESHOLD) {
        const start = introData.intro.start_ms || 0;
        const end = introData.intro.end_ms;
        if (end && currentTimeMs >= start && currentTimeMs <= end) {
            inSegment = true;
            segmentType = 'intro';
            segmentEnd = end;
            console.log('[IntroDB] In intro segment:', currentTimeMs, 'ms');
        }
    }
    
    // Check recap
    if (!inSegment && introData.recap && introData.recap.confidence >= CONFIDENCE_THRESHOLD) {
        const start = introData.recap.start_ms;
        const end = introData.recap.end_ms;
        if (start && end && currentTimeMs >= start && currentTimeMs <= end) {
            inSegment = true;
            segmentType = 'recap';
            segmentEnd = end;
            console.log('[IntroDB] In recap segment:', currentTimeMs, 'ms');
        }
    }
    
    // Check credits
    if (!inSegment && introData.credits && introData.credits.confidence >= CONFIDENCE_THRESHOLD) {
        const start = introData.credits.start_ms;
        const end = introData.credits.end_ms || (video.duration * 1000);
        if (start && currentTimeMs >= start && currentTimeMs <= end) {
            inSegment = true;
            segmentType = 'credits';
            segmentEnd = end;
            console.log('[IntroDB] In credits segment:', currentTimeMs, 'ms');
        }
    }
    
    // Check preview
    if (!inSegment && introData.preview && introData.preview.confidence >= CONFIDENCE_THRESHOLD) {
        const start = introData.preview.start_ms;
        const end = introData.preview.end_ms;
        if (start && end && currentTimeMs >= start && currentTimeMs <= end) {
            inSegment = true;
            segmentType = 'preview';
            segmentEnd = end;
            console.log('[IntroDB] In preview segment:', currentTimeMs, 'ms');
        }
    }
    
    if (inSegment && segmentType) {
        // Show skip button
        const skipText = skipBtn.querySelector('.skip-text');
        if (skipText) {
            const labels = {
                intro: 'Skip Intro',
                recap: 'Skip Recap',
                credits: 'Skip Credits',
                preview: 'Skip Preview'
            };
            skipText.textContent = labels[segmentType] || 'Skip';
        }
        
        skipBtn.style.display = 'flex';
        currentSegmentType = segmentType;
        
        // Store segment end for skip action
        skipBtn.dataset.skipTo = (segmentEnd / 1000).toString();
    } else {
        // Hide skip button
        if (skipBtn.style.display === 'flex') {
            skipBtn.style.display = 'none';
            currentSegmentType = null;
        }
    }
}

// Skip to end of current segment
function skipSegment() {
    const video = document.getElementById('stream-video');
    const skipBtn = document.getElementById('skip-segment-btn');
    
    if (!video || !skipBtn) return;
    
    const skipTo = parseFloat(skipBtn.dataset.skipTo);
    if (skipTo && !isNaN(skipTo)) {
        video.currentTime = skipTo;
        skipBtn.style.display = 'none';
        console.log('[IntroDB] Skipped to:', skipTo);
    }
}

// Check if we should show next episode button (last 2 minutes of TV show)
function checkNextEpisodeButton() {
    const video = document.getElementById('stream-video');
    const nextEpBtn = document.getElementById('next-episode-btn');
    
    if (!video || !nextEpBtn || !nextEpisodeInfo) return;
    
    const timeRemaining = video.duration - video.currentTime;
    
    // Show button in last 2 minutes (120 seconds)
    if (timeRemaining <= 120 && timeRemaining > 0) {
        nextEpBtn.style.display = 'flex';
    } else {
        nextEpBtn.style.display = 'none';
    }
}

// Play next episode
async function playNextEpisode() {
    if (!nextEpisodeInfo) {
        console.log('[StreamingMode] No next episode info available');
        return;
    }
    
    const nextEpBtn = document.getElementById('next-episode-btn');
    if (nextEpBtn) {
        nextEpBtn.disabled = true;
        nextEpBtn.classList.add('loading');
    }
    
    console.log('[StreamingMode] Playing next episode:', nextEpisodeInfo);
    
    // Close current player
    const playerContainer = document.getElementById('stream-player-container');
    if (playerContainer) {
        playerContainer.classList.remove('active');
    }
    
    // Play next episode
    await playStream(
        nextEpisodeInfo.type,
        nextEpisodeInfo.tmdbId,
        nextEpisodeInfo.posterUrl,
        nextEpisodeInfo.title,
        nextEpisodeInfo.season,
        nextEpisodeInfo.episode
    );
    
    if (nextEpBtn) {
        nextEpBtn.disabled = false;
        nextEpBtn.classList.remove('loading');
    }
}

// Load subtitles into player
function loadSubtitlesIntoPlayer(subtitles) {
    const subsList = document.getElementById('stream-subs-list');
    if (!subsList) return;
    
    subsList.innerHTML = '';
    
    if (subtitles.length === 0) {
        subsList.innerHTML = '<div class="no-subs">No subtitles available</div>';
        return;
    }
    
    // Add "No Subtitles" option
    const noSubItem = document.createElement('div');
    noSubItem.className = 'sub-item';
    noSubItem.innerHTML = `
        <i class="material-icons sub-icon">subtitles_off</i>
        <div class="sub-info">
            <div class="sub-title">No Subtitles</div>
        </div>
    `;
    noSubItem.onclick = () => disableSubtitles();
    subsList.appendChild(noSubItem);
    
    // Add search box
    const searchBox = document.createElement('div');
    searchBox.className = 'sub-search-box';
    searchBox.innerHTML = `
        <input type="text" class="sub-search-input" placeholder="Search subtitles..." />
    `;
    subsList.appendChild(searchBox);
    
    // Group subtitles by language
    const grouped = {};
    subtitles.forEach((sub, originalIndex) => {
        const lang = sub.language || 'unknown';
        if (!grouped[lang]) {
            grouped[lang] = [];
        }
        // Store original index with the subtitle
        grouped[lang].push({ ...sub, originalIndex });
    });
    
    // Sort languages: English first, then alphabetically
    const sortedLangs = Object.keys(grouped).sort((a, b) => {
        if (a === 'en') return -1;
        if (b === 'en') return 1;
        return a.localeCompare(b);
    });
    
    // Create subtitle items grouped by language
    sortedLangs.forEach(lang => {
        const subs = grouped[lang];
        
        // Language header
        const langHeader = document.createElement('div');
        langHeader.className = 'sub-lang-header';
        langHeader.textContent = subs[0].display || lang.toUpperCase();
        subsList.appendChild(langHeader);
        
        // Subtitle items
        subs.forEach((sub, index) => {
            const item = document.createElement('div');
            item.className = 'sub-item';
            item.dataset.language = sub.language;
            item.dataset.display = sub.display || '';
            item.dataset.release = sub.release || '';
            item.dataset.url = sub.url;
            item.dataset.provider = sub.provider || '';
            
            const hiLabel = sub.isHearingImpaired ? '<span class="sub-hi-badge">HI</span>' : '';
            const downloads = sub.downloadCount ? `<span class="sub-downloads">${formatDownloads(sub.downloadCount)} downloads</span>` : '';
            const providerBadge = sub.provider ? `<span class="sub-provider-badge">${sub.provider}</span>` : '';
            
            item.innerHTML = `
                <i class="material-icons sub-icon">subtitles</i>
                <div class="sub-info">
                    <div class="sub-title">${sub.display || sub.language} ${hiLabel} ${providerBadge}</div>
                    ${downloads}
                </div>
                <i class="material-icons sub-check-icon">check_circle</i>
            `;
            item.onclick = () => selectSubtitle(sub, item, sub.originalIndex);
            subsList.appendChild(item);
        });
    });
    
    // Add search functionality
    const searchInput = subsList.querySelector('.sub-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = subsList.querySelectorAll('.sub-item');
            const headers = subsList.querySelectorAll('.sub-lang-header');
            
            items.forEach(item => {
                const display = (item.dataset.display || '').toLowerCase();
                const release = (item.dataset.release || '').toLowerCase();
                const matches = display.includes(query) || release.includes(query);
                item.style.display = matches ? 'flex' : 'none';
            });
            
            // Hide headers if no items visible in that language
            headers.forEach(header => {
                const nextItems = [];
                let next = header.nextElementSibling;
                while (next && next.classList.contains('sub-item')) {
                    nextItems.push(next);
                    next = next.nextElementSibling;
                }
                const hasVisible = nextItems.some(item => item.style.display !== 'none');
                header.style.display = hasVisible ? 'block' : 'none';
            });
        });
    }
}

// Select subtitle and load it
async function selectSubtitle(sub, itemElement, subIndex) {
    if (!sub) return;
    
    console.log('[Subtitles] Selecting:', sub.display, sub.url, 'Index:', subIndex);
    
    // Remove active state from all items
    document.querySelectorAll('.sub-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active state to selected item
    if (itemElement) {
        itemElement.classList.add('active');
    }
    
    try {
        // Fetch and parse subtitle
        const response = await fetch(sub.url);
        const srtText = await response.text();
        
        console.log('[Subtitles] Downloaded subtitle, parsing...');
        
        const cues = parseSRT(srtText);
        
        console.log('[Subtitles] Parsed', cues.length, 'cues');
        
        activeSub = { cues, info: sub, index: subIndex };
        
        // Start updating subtitle display
        const video = document.getElementById('stream-video');
        if (video) {
            video.addEventListener('timeupdate', updateSubtitleDisplay);
        }
        
        console.log('[Subtitles] Subtitle loaded successfully');
    } catch (error) {
        console.error('[Subtitles] Error loading subtitle:', error);
        alert('Failed to load subtitle');
    }
    
    // Close menu
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsMenu) subsMenu.classList.remove('visible');
}

// Disable subtitles
function disableSubtitles() {
    console.log('[Subtitles] Disabling subtitles');
    
    activeSub = null;
    
    const overlay = document.getElementById('subtitle-overlay');
    if (overlay) {
        overlay.textContent = '';
        overlay.style.display = 'none';
    }
    
    // Remove active state from all subtitle items
    document.querySelectorAll('.sub-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Close menu
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsMenu) subsMenu.classList.remove('visible');
}

// Format download count
function formatDownloads(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Apply subtitle customization
function applySubtitleCustomization() {
    const overlay = document.getElementById('subtitle-overlay');
    if (!overlay) return;
    
    overlay.style.fontSize = `${subSize}%`;
    overlay.style.bottom = `${subPos}px`;
    
    console.log('[Subtitles] Applied customization - Size:', subSize + '%, Position:', subPos + 'px');
}

// Populate quality levels from HLS.js
function populateQualityLevels() {
    if (!streamHls || !streamHls.levels) return;
    
    const container = document.getElementById('quality-levels-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort levels by height (quality) descending
    const sortedLevels = streamHls.levels
        .map((level, index) => ({ level, index }))
        .sort((a, b) => b.level.height - a.level.height);
    
    sortedLevels.forEach(({ level, index }) => {
        const btn = document.createElement('button');
        btn.className = 'quality-btn';
        btn.dataset.quality = index;
        
        // Format quality label
        const height = level.height;
        const bitrate = Math.round(level.bitrate / 1000);
        btn.textContent = `${height}p (${bitrate} kbps)`;
        
        btn.addEventListener('click', () => {
            setQuality(index);
        });
        
        container.appendChild(btn);
    });
    
    // Show quality button for all providers except anitaro
    const qualityBtn = document.getElementById('stream-quality-btn');
    if (qualityBtn && currentProvider !== 'anitaro') {
        qualityBtn.style.display = 'flex';
    }
    
    console.log('[Player] Populated', sortedLevels.length, 'quality levels');
}

// Set quality level
function setQuality(levelIndex) {
    if (!streamHls) return;
    
    const qualityBtns = document.querySelectorAll('.quality-btn');
    qualityBtns.forEach(btn => btn.classList.remove('active'));
    
    if (levelIndex === -1) {
        // Auto quality
        streamHls.currentLevel = -1;
        document.querySelector('.quality-btn[data-quality="-1"]')?.classList.add('active');
        console.log('[Player] Set quality to Auto');
    } else {
        // Manual quality
        streamHls.currentLevel = levelIndex;
        document.querySelector(`.quality-btn[data-quality="${levelIndex}"]`)?.classList.add('active');
        const level = streamHls.levels[levelIndex];
        console.log('[Player] Set quality to', level.height + 'p');
    }
    
    // Close quality menu
    const qualityMenu = document.getElementById('stream-quality-menu');
    if (qualityMenu) qualityMenu.classList.remove('visible');
}

// Show/hide quality button based on provider
function updateQualityButtonVisibility() {
    const qualityBtn = document.getElementById('stream-quality-btn');
    if (qualityBtn) {
        if (currentProvider !== 'anitaro' && streamHls && streamHls.levels && streamHls.levels.length > 0) {
            qualityBtn.style.display = 'flex';
        } else {
            qualityBtn.style.display = 'none';
        }
    }
}

// Change provider
async function changeProvider(provider) {
    if (provider === currentProvider) return;
    
    // Validate provider exists
    if (!PROVIDERS[provider]) {
        console.error('[StreamingMode] Invalid provider:', provider);
        alert(`Provider "${provider}" is not available`);
        return;
    }
    
    const oldProvider = currentProvider;
    const oldStreamUrl = currentStreamUrl;
    
    // Save current playback time
    const video = document.getElementById('stream-video');
    const oldPlaybackTime = video ? video.currentTime : 0;
    
    // Save to localStorage for persistence
    if (video && window.currentMediaInfo) {
        savePlaybackPosition(video.currentTime);
    }
    
    // CLEANUP: Destroy HLS/DASH instances and close extraction window
    console.log('[StreamingMode] Cleaning up before provider switch...');
    
    // Pause and clear video
    if (video) {
        video.pause();
        video.src = '';
        video.load();
    }
    
    // Destroy HLS instance
    if (streamHls) {
        try {
            console.log('[StreamingMode] Destroying HLS instance');
            streamHls.destroy();
        } catch (e) {
            console.log('[StreamingMode] Error destroying HLS:', e);
        }
        streamHls = null;
    }
    
    // Destroy DASH instance
    if (streamDash) {
        try {
            console.log('[StreamingMode] Destroying DASH instance');
            streamDash.reset();
        } catch (e) {
            console.log('[StreamingMode] Error destroying DASH:', e);
        }
        streamDash = null;
    }
    
    // Close extraction window
    if (window.electronAPI && window.electronAPI.closeStreamExtraction) {
        console.log('[StreamingMode] Closing extraction window');
        window.electronAPI.closeStreamExtraction();
    }
    
    currentProvider = provider;
    console.log('[StreamingMode] Changed provider from', oldProvider, 'to:', provider);
    
    // Update quality button visibility
    updateQualityButtonVisibility();
    
    // If player is active, reload stream with new provider
    const playerContainer = document.getElementById('stream-player-container');
    if (playerContainer && playerContainer.classList.contains('active')) {
        // Store previous stream for cancel fallback
        previousStreamUrl = oldStreamUrl;
        previousProvider = oldProvider;
        previousPlaybackTime = oldPlaybackTime;
        
        console.log('[StreamingMode] Saved previous stream state:', {
            provider: previousProvider,
            time: previousPlaybackTime
        });
        
        // Store current media info
        if (!window.currentMediaInfo) {
            console.error('[StreamingMode] No media info stored, cannot reload');
            return;
        }
        
        const { type, tmdbId, posterUrl, title, season, episode } = window.currentMediaInfo;
        
        console.log('[StreamingMode] Reloading stream with new provider...');
        
        // Hide player, show loading
        playerContainer.classList.remove('active');
        showLoadingScreen(posterUrl, title);
        updateLoadingStatus(`Extracting from ${PROVIDERS[provider].name}...`);
        
        try {
            // Get provider URL
            const providerUrl = getProviderUrl(provider, type, tmdbId, season, episode);
            if (!providerUrl) {
                throw new Error('Invalid provider or parameters');
            }
            
            // Extract stream
            const streamUrl = await extractStream(providerUrl, provider);
            currentStreamUrl = streamUrl;
            
            // Hide loading, show player
            hideLoadingScreen();
            playerContainer.classList.add('active');
            
            // Load stream into player
            loadStreamIntoPlayer(streamUrl, title);
            
            // Re-initialize controls
            initPlayerControls();
            
            console.log('[StreamingMode] Stream reloaded successfully');
        } catch (error) {
            console.error('[StreamingMode] Error reloading stream:', error);
            hideLoadingScreen();
            alert(`Failed to load stream from ${PROVIDERS[provider].name}: ${error.message}`);
            // Revert provider
            currentProvider = oldProvider;
        }
    }
}

// Initialize player controls (called when player is shown)
function initPlayerControls() {
    console.log('[StreamingMode] Initializing player controls...');
    
    const video = document.getElementById('stream-video');
    
    // Back button
    const playerBackBtn = document.getElementById('stream-player-back');
    if (playerBackBtn) {
        const newBackBtn = playerBackBtn.cloneNode(true);
        playerBackBtn.parentNode.replaceChild(newBackBtn, playerBackBtn);
        
        newBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Back button clicked');
            hideStreamPlayer();
        });
    }
    
    // Play/pause button
    const playPauseBtn = document.getElementById('stream-play-pause');
    
    if (playPauseBtn && video) {
        const newPlayPauseBtn = playPauseBtn.cloneNode(true);
        playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
        
        newPlayPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
        
        video.addEventListener('play', () => {
            newPlayPauseBtn.innerHTML = '<i class="material-icons">pause</i>';
        });
        
        video.addEventListener('pause', () => {
            newPlayPauseBtn.innerHTML = '<i class="material-icons">play_arrow</i>';
        });
    }
    
    // Fullscreen button
    const fullscreenBtn = document.getElementById('stream-fullscreen');
    if (fullscreenBtn) {
        const newFullscreenBtn = fullscreenBtn.cloneNode(true);
        fullscreenBtn.parentNode.replaceChild(newFullscreenBtn, fullscreenBtn);
        
        newFullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const playerContainer = document.getElementById('stream-player-container');
            if (!document.fullscreenElement) {
                playerContainer.requestFullscreen().catch(err => {
                    console.error('[StreamingMode] Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    // Volume button and slider
    const volumeBtn = document.getElementById('stream-volume');
    const volumeSlider = document.getElementById('stream-volume-slider');
    if (volumeBtn && volumeSlider && video) {
        const newVolumeBtn = volumeBtn.cloneNode(true);
        volumeBtn.parentNode.replaceChild(newVolumeBtn, volumeBtn);
        
        const newVolumeSlider = volumeSlider.cloneNode(true);
        volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
        
        // Load saved volume
        const savedVolume = localStorage.getItem('playerVolume') || '100';
        video.volume = parseInt(savedVolume) / 100;
        newVolumeSlider.value = savedVolume;
        
        // Update icon based on volume
        const updateVolumeIcon = (volume) => {
            const icon = newVolumeBtn.querySelector('.material-icons');
            if (volume === 0) {
                icon.textContent = 'volume_off';
            } else if (volume < 50) {
                icon.textContent = 'volume_down';
            } else {
                icon.textContent = 'volume_up';
            }
        };
        
        updateVolumeIcon(parseInt(savedVolume));
        
        // Volume slider
        newVolumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            video.volume = volume / 100;
            updateVolumeIcon(volume);
            localStorage.setItem('playerVolume', volume.toString());
        });
        
        // Volume button (mute/unmute)
        let lastVolume = parseInt(savedVolume);
        newVolumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (video.volume > 0) {
                lastVolume = Math.round(video.volume * 100);
                video.volume = 0;
                newVolumeSlider.value = '0';
                updateVolumeIcon(0);
            } else {
                video.volume = lastVolume / 100;
                newVolumeSlider.value = lastVolume.toString();
                updateVolumeIcon(lastVolume);
            }
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('stream-settings');
    const settingsMenu = document.getElementById('stream-settings-menu');
    if (settingsBtn && settingsMenu) {
        const newSettingsBtn = settingsBtn.cloneNode(true);
        settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);
        
        newSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            settingsMenu.classList.toggle('visible');
            const subsMenu = document.getElementById('stream-subs-menu');
            if (subsMenu) subsMenu.classList.remove('visible');
            const qualityMenu = document.getElementById('stream-quality-menu');
            if (qualityMenu) qualityMenu.classList.remove('visible');
        });
    }
    
    // Quality button (all providers except anitaro)
    const qualityBtn = document.getElementById('stream-quality-btn');
    const qualityMenu = document.getElementById('stream-quality-menu');
    if (qualityBtn && qualityMenu) {
        const newQualityBtn = qualityBtn.cloneNode(true);
        qualityBtn.parentNode.replaceChild(newQualityBtn, qualityBtn);
        
        newQualityBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            qualityMenu.classList.toggle('visible');
            const subsMenu = document.getElementById('stream-subs-menu');
            if (subsMenu) subsMenu.classList.remove('visible');
            if (settingsMenu) settingsMenu.classList.remove('visible');
        });
    }
    
    // Subtitles button
    const subsBtn = document.getElementById('stream-subs');
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsBtn && subsMenu) {
        const newSubsBtn = subsBtn.cloneNode(true);
        subsBtn.parentNode.replaceChild(newSubsBtn, subsBtn);
        
        newSubsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            subsMenu.classList.toggle('visible');
            if (settingsMenu) settingsMenu.classList.remove('visible');
            if (qualityMenu) qualityMenu.classList.remove('visible');
        });
    }
    
    // Cast button
    const castBtn = document.getElementById('stream-cast-btn');
    if (castBtn) {
        const newCastBtn = castBtn.cloneNode(true);
        castBtn.parentNode.replaceChild(newCastBtn, castBtn);
        
        newCastBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!currentStreamUrl) {
                alert('No stream loaded');
                return;
            }
            
            console.log('[Cast] Starting cast process...');
            console.log('[Cast] Current stream URL:', currentStreamUrl);
            
            // Show cast modal with subtitle info
            const modal = document.getElementById('castDeviceModal');
            const subtitleInfo = document.getElementById('castSubtitleInfo');
            const deviceSelection = document.getElementById('castDeviceSelection');
            const currentSubtitleDisplay = document.getElementById('castCurrentSubtitle');
            const continueBtn = document.getElementById('castContinueBtn');
            const skipBtn = document.getElementById('castSkipBtn');
            const cancelBtn1 = document.getElementById('castCancelBtn1');
            const cancelBtn2 = document.getElementById('castCancelBtn2');
            
            if (!modal || !subtitleInfo || !deviceSelection) return;
            
            // Get currently active subtitle
            let currentSubtitleIndex = -1;
            let currentSubtitleName = 'None';
            
            // Check if there's an active subtitle
            if (activeSub && activeSub.index !== undefined) {
                // Use the stored index from when subtitle was selected
                currentSubtitleIndex = activeSub.index;
                currentSubtitleName = activeSub.info.display || activeSub.info.language || 'Active Subtitle';
            }
            
            console.log('[Cast] Current subtitle index:', currentSubtitleIndex);
            console.log('[Cast] Current subtitle name:', currentSubtitleName);
            console.log('[Cast] Active sub:', activeSub);
            
            // Show modal with subtitle info
            modal.style.display = 'flex';
            subtitleInfo.style.display = 'block';
            deviceSelection.style.display = 'none';
            currentSubtitleDisplay.textContent = currentSubtitleName;
            
            // Close modal function
            const closeModal = () => {
                modal.style.display = 'none';
                subtitleInfo.style.display = 'none';
                deviceSelection.style.display = 'none';
            };
            
            // Cancel buttons
            cancelBtn1.onclick = closeModal;
            cancelBtn2.onclick = closeModal;
            modal.onclick = (e) => {
                if (e.target === modal) closeModal();
            };
            
            // Continue button - use current subtitle
            continueBtn.onclick = async () => {
                await proceedToDeviceSelection(currentSubtitleIndex);
            };
            
            // Skip button - no subtitles
            skipBtn.onclick = async () => {
                await proceedToDeviceSelection(-1);
            };
            
            // Function to proceed to device selection
            async function proceedToDeviceSelection(selectedIndex) {
                console.log('[Cast] Selected subtitle index:', selectedIndex);
                
                // Show device selection
                subtitleInfo.style.display = 'none';
                deviceSelection.style.display = 'block';
                
                const deviceList = document.getElementById('castDeviceList');
                deviceList.innerHTML = '<div class="cast-loading">Searching for Chromecast devices...</div>';
                
                try {
                    // Discover Chromecast devices
                    const discovery = await window.electronAPI.discoverChromecastDevices();
                    
                    if (!discovery.success || !discovery.devices || discovery.devices.length === 0) {
                        deviceList.innerHTML = '<div class="cast-loading">No Chromecast devices found.<br><br>Make sure your Chromecast is on the same WiFi network.</div>';
                        return;
                    }
                    
                    console.log('[Cast] Found devices:', discovery.devices);
                    
                    // Show device list
                    deviceList.innerHTML = '';
                    discovery.devices.forEach((device, index) => {
                        const deviceItem = document.createElement('div');
                        deviceItem.className = 'cast-device-item';
                        deviceItem.innerHTML = `
                            <div class="cast-device-name">${device.name || `Device ${index + 1}`}</div>
                            <div class="cast-device-host">${device.host}</div>
                        `;
                        
                        deviceItem.onclick = async () => {
                            closeModal();
                            await castToDevice(device.host, device.name, selectedIndex);
                        };
                        
                        deviceList.appendChild(deviceItem);
                    });
                    
                } catch (error) {
                    console.error('[Cast] Discovery error:', error);
                    deviceList.innerHTML = `<div class="cast-loading">Error discovering devices:<br>${error.message}</div>`;
                }
            }
        });
    }
    
    // Cast to device function
    async function castToDevice(deviceHost, deviceName, selectedSubtitleIndex = -1) {
        try {
            console.log('[Cast] Casting to:', deviceName, deviceHost);
            console.log('[Cast] Selected subtitle index:', selectedSubtitleIndex);
            
            // Extract the actual stream URL (remove localhost proxy)
            let actualStreamUrl = currentStreamUrl;
            if (currentStreamUrl.includes('localhost:8765/stream-proxy?url=')) {
                const urlMatch = currentStreamUrl.match(/url=([^&]+)/);
                if (urlMatch) {
                    actualStreamUrl = decodeURIComponent(urlMatch[1]);
                }
            }
            
            console.log('[Cast] Actual stream URL:', actualStreamUrl);
            
            // Prepare metadata
            const metadata = {
                title: window.currentMediaInfo?.title || 'PlayTorrio Stream',
                contentType: actualStreamUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
                images: window.currentMediaInfo?.posterUrl ? [
                    { url: window.currentMediaInfo.posterUrl }
                ] : []
            };
            
            // Prepare subtitle options
            const subtitleOptions = {};
            if (window.currentMediaInfo) {
                subtitleOptions.tmdbId = window.currentMediaInfo.tmdbId;
                subtitleOptions.type = window.currentMediaInfo.type;
                if (window.currentMediaInfo.season) {
                    subtitleOptions.season = window.currentMediaInfo.season;
                    subtitleOptions.episode = window.currentMediaInfo.episode;
                }
            }
            
            // Add selected subtitle or all subtitles
            if (selectedSubtitleIndex >= 0 && currentSubtitles && currentSubtitles[selectedSubtitleIndex]) {
                // Send only the selected subtitle
                const selectedSub = currentSubtitles[selectedSubtitleIndex];
                subtitleOptions.subtitles = [{
                    url: selectedSub.url,
                    language: selectedSub.language,
                    display: selectedSub.display
                }];
                console.log('[Cast] Sending selected subtitle:', selectedSub.display);
            } else if (selectedSubtitleIndex === -1) {
                // No subtitles selected
                subtitleOptions.subtitles = [];
                console.log('[Cast] No subtitles selected');
            }
            
            console.log('[Cast] Metadata:', metadata);
            console.log('[Cast] Subtitle options:', subtitleOptions);
            console.log('[Cast] Sending to device:', deviceHost);
            
            // Cast to device
            const result = await window.electronAPI.castToChromecast({
                streamUrl: actualStreamUrl,
                metadata: metadata,
                deviceHost: deviceHost,
                subtitleOptions: subtitleOptions
            });
            
            console.log('[Cast] Result:', result);
            
            if (!result.success) {
                alert(`Failed to cast: ${result.message}`);
            }
        } catch (error) {
            console.error('[Cast] Error:', error);
            alert(`Cast error: ${error.message}`);
        }
    }
    
    // Provider buttons inside settings menu
    document.querySelectorAll('.provider-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const provider = btn.dataset.provider;
            changeProvider(provider);
            
            // Update active state
            document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Close menu
            if (settingsMenu) settingsMenu.classList.remove('visible');
        });
    });
    
    // Quality buttons - Auto button
    const autoQualityBtn = document.querySelector('.quality-btn[data-quality="-1"]');
    if (autoQualityBtn) {
        autoQualityBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuality(-1);
        });
    }
    
    console.log('[StreamingMode] Player controls initialized');
}

// Video time display update
function updateTimeDisplay() {
    const video = document.getElementById('stream-video');
    const timeDisplay = document.getElementById('stream-time-display');
    
    if (!video || !timeDisplay) return;
    
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    
    const current = formatTime(video.currentTime);
    const duration = formatTime(video.duration || 0);
    
    timeDisplay.textContent = `${current} / ${duration}`;
}

// Progress bar update
function updateProgressBar() {
    const video = document.getElementById('stream-video');
    const progressBar = document.getElementById('stream-progress-bar');
    
    if (!video || !progressBar) return;
    
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${percent}%`;
}

// Initialize subtitle customization controls
function initSubtitleCustomization() {
    const sizeSlider = document.getElementById('subtitle-size-slider');
    const sizeValue = document.getElementById('subtitle-size-value');
    const positionSlider = document.getElementById('subtitle-position-slider');
    const positionValue = document.getElementById('subtitle-position-value');
    const delaySlider = document.getElementById('subtitle-delay-slider');
    const delayValue = document.getElementById('subtitle-delay-value');
    
    if (!sizeSlider || !positionSlider || !delaySlider) return;
    
    // Load saved settings
    const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
    subSize = settings.fontSize || 150;
    subPos = settings.position || 130;
    subDelay = settings.delay || 0;
    
    sizeSlider.value = subSize;
    sizeValue.textContent = subSize + '%';
    positionSlider.value = subPos;
    positionValue.textContent = subPos + 'px';
    delaySlider.value = subDelay;
    delayValue.textContent = subDelay + 's';
    
    // Apply initial customization
    applySubtitleCustomization();
    
    // Font size slider
    sizeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        sizeValue.textContent = value + '%';
        subSize = value;
        
        const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
        settings.fontSize = value;
        localStorage.setItem('subtitleSettings', JSON.stringify(settings));
        
        applySubtitleCustomization();
    });
    
    // Position slider
    positionSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        positionValue.textContent = value + 'px';
        subPos = value;
        
        const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
        settings.position = value;
        localStorage.setItem('subtitleSettings', JSON.stringify(settings));
        
        applySubtitleCustomization();
    });
    
    // Delay slider
    delaySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        delayValue.textContent = value + 's';
        subDelay = value;
        
        const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
        settings.delay = value;
        localStorage.setItem('subtitleSettings', JSON.stringify(settings));
    });
    
    console.log('[Subtitles] Customization controls initialized');
}

// Initialize streaming mode UI
function initStreamingModeUI() {
    console.log('[StreamingMode] Initializing UI...');
    
    // Auto-hide controls and cursor when idle
    let idleTimeout;
    const playerContainer = document.getElementById('stream-player-container');
    const controls = document.querySelector('.stream-controls');
    const playerTitle = document.getElementById('stream-player-title');
    const backBtn = document.getElementById('stream-player-back');
    
    function showControls() {
        if (playerContainer) playerContainer.classList.remove('idle');
        if (controls) controls.style.opacity = '1';
        if (playerTitle) playerTitle.style.opacity = '1';
        if (backBtn) backBtn.style.opacity = '1';
    }
    
    function hideControls() {
        if (playerContainer) playerContainer.classList.add('idle');
        if (controls) controls.style.opacity = '0';
        if (playerTitle) playerTitle.style.opacity = '0';
        if (backBtn) backBtn.style.opacity = '0';
    }
    
    function resetIdleTimer() {
        showControls();
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            const video = document.getElementById('stream-video');
            // Only hide if video is playing
            if (video && !video.paused) {
                hideControls();
            }
        }, 3000); // Hide after 3 seconds of inactivity
    }
    
    // Add event listeners for user activity
    if (playerContainer) {
        playerContainer.addEventListener('mousemove', resetIdleTimer);
        playerContainer.addEventListener('mousedown', resetIdleTimer);
        playerContainer.addEventListener('keydown', resetIdleTimer);
        playerContainer.addEventListener('touchstart', resetIdleTimer);
    }
    
    // Show controls when video is paused
    const video = document.getElementById('stream-video');
    if (video) {
        video.addEventListener('play', () => {
            resetIdleTimer();
        });
        
        video.addEventListener('pause', () => {
            clearTimeout(idleTimeout);
            showControls();
        });
    }
    
    // Back button in loading screen - direct handler
    const cancelBtn = document.querySelector('.loading-back-btn');
    if (cancelBtn) {
        // Remove any existing listeners by cloning
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newCancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Cancel button clicked - checking for previous stream');
            
            // Cancel extraction
            hideLoadingScreen();
            isLoadingStream = false;
            if (window.electronAPI && window.electronAPI.closeStreamExtraction) {
                window.electronAPI.closeStreamExtraction();
            }
            
            // If we have a previous stream (from provider switch), restore it
            if (previousStreamUrl && previousProvider) {
                console.log('[StreamingMode] Restoring previous stream from', previousProvider, 'at time', previousPlaybackTime);
                
                // Restore previous provider
                currentProvider = previousProvider;
                currentStreamUrl = previousStreamUrl;
                
                // Update provider button states
                document.querySelectorAll('.provider-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.provider === previousProvider);
                });
                
                // Show player and reload previous stream
                const playerContainer = document.getElementById('stream-player-container');
                if (playerContainer) {
                    playerContainer.classList.add('active');
                    
                    const title = window.currentMediaInfo?.title || 'Video';
                    loadStreamIntoPlayer(previousStreamUrl, title);
                    
                    // Restore playback position after video loads
                    const video = document.getElementById('stream-video');
                    if (video && previousPlaybackTime > 0) {
                        const restoreTime = () => {
                            video.currentTime = previousPlaybackTime;
                            video.play().catch(e => console.log('[StreamingMode] Autoplay prevented:', e));
                            video.removeEventListener('loadedmetadata', restoreTime);
                        };
                        video.addEventListener('loadedmetadata', restoreTime);
                    }
                    
                    initPlayerControls();
                }
                
                // Clear previous stream data
                previousStreamUrl = null;
                previousProvider = null;
                previousPlaybackTime = 0;
            }
            // Otherwise just stay on details page (don't navigate)
        });
    }
    
    // Also use event delegation as fallback
    document.addEventListener('click', (e) => {
        if (e.target.closest('.loading-back-btn')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Cancel button clicked (delegation) - checking for previous stream');
            
            // Cancel extraction
            hideLoadingScreen();
            isLoadingStream = false;
            if (window.electronAPI && window.electronAPI.closeStreamExtraction) {
                window.electronAPI.closeStreamExtraction();
            }
            
            // If we have a previous stream (from provider switch), restore it
            if (previousStreamUrl && previousProvider) {
                console.log('[StreamingMode] Restoring previous stream from', previousProvider, 'at time', previousPlaybackTime);
                
                // Restore previous provider
                currentProvider = previousProvider;
                currentStreamUrl = previousStreamUrl;
                
                // Update provider button states
                document.querySelectorAll('.provider-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.provider === previousProvider);
                });
                
                // Show player and reload previous stream
                const playerContainer = document.getElementById('stream-player-container');
                if (playerContainer) {
                    playerContainer.classList.add('active');
                    
                    const title = window.currentMediaInfo?.title || 'Video';
                    loadStreamIntoPlayer(previousStreamUrl, title);
                    
                    // Restore playback position after video loads
                    const video = document.getElementById('stream-video');
                    if (video && previousPlaybackTime > 0) {
                        const restoreTime = () => {
                            video.currentTime = previousPlaybackTime;
                            video.play().catch(e => console.log('[StreamingMode] Autoplay prevented:', e));
                            video.removeEventListener('loadedmetadata', restoreTime);
                        };
                        video.addEventListener('loadedmetadata', restoreTime);
                    }
                    
                    initPlayerControls();
                }
                
                // Clear previous stream data
                previousStreamUrl = null;
                previousProvider = null;
                previousPlaybackTime = 0;
            }
            // Otherwise just stay on details page (don't navigate)
        }
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        const settingsBtn = document.getElementById('stream-settings');
        const settingsMenu = document.getElementById('stream-settings-menu');
        const subsBtn = document.getElementById('stream-subs');
        const subsMenu = document.getElementById('stream-subs-menu');
        const qualityBtn = document.getElementById('stream-quality-btn');
        const qualityMenu = document.getElementById('stream-quality-menu');
        
        if (settingsMenu && settingsBtn && !settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.classList.remove('visible');
        }
        
        if (subsMenu && subsBtn && !subsBtn.contains(e.target) && !subsMenu.contains(e.target)) {
            subsMenu.classList.remove('visible');
        }
        
        if (qualityMenu && qualityBtn && !qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) {
            qualityMenu.classList.remove('visible');
        }
    });
    
    console.log('[StreamingMode] UI initialized');
}

// Add video event listeners for time and progress
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('stream-video');
    
    if (video) {
        video.addEventListener('timeupdate', () => {
            updateTimeDisplay();
            updateProgressBar();
            checkSkippableSegment(); // Check for intro/recap/credits
            checkNextEpisodeButton(); // Check for next episode button (TV shows)
        });
        
        video.addEventListener('loadedmetadata', () => {
            updateTimeDisplay();
        });
        
        // Progress bar click to seek
        const progressWrapper = document.querySelector('.stream-progress-wrapper');
        if (progressWrapper) {
            progressWrapper.style.cursor = 'pointer';
            
            const seekPreviewTooltip = document.getElementById('seek-preview-tooltip');
            const seekPreviewTime = seekPreviewTooltip?.querySelector('.seek-preview-time');
            const progressContainer = progressWrapper.querySelector('.stream-progress-container');
            
            // Show seek preview on hover
            progressWrapper.addEventListener('mousemove', (e) => {
                if (!progressContainer || !seekPreviewTooltip || !video.duration) return;
                
                const rect = progressContainer.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const seekTime = percent * video.duration;
                
                // Position tooltip centered above mouse cursor
                const mouseX = e.clientX - rect.left;
                seekPreviewTooltip.style.left = mouseX + 'px';
                seekPreviewTooltip.style.transform = 'translateX(-50%)';
                seekPreviewTooltip.style.display = 'block';
                
                // Update time display
                if (seekPreviewTime) {
                    const formatTime = (seconds) => {
                        const h = Math.floor(seconds / 3600);
                        const m = Math.floor((seconds % 3600) / 60);
                        const s = Math.floor(seconds % 60);
                        if (h > 0) {
                            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                        }
                        return `${m}:${s.toString().padStart(2, '0')}`;
                    };
                    seekPreviewTime.textContent = formatTime(seekTime);
                }
            });
            
            // Hide tooltip when mouse leaves
            progressWrapper.addEventListener('mouseleave', () => {
                if (seekPreviewTooltip) {
                    seekPreviewTooltip.style.display = 'none';
                }
            });
            
            // Seek on click
            progressWrapper.addEventListener('click', (e) => {
                if (!progressContainer) return;
                
                const rect = progressContainer.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                
                if (percent >= 0 && percent <= 1 && video.duration) {
                    video.currentTime = percent * video.duration;
                    console.log('[Player] Seeked to', Math.floor(percent * 100) + '%');
                }
            });
        }
    }
    
    // Skip button click handler
    const skipBtn = document.getElementById('skip-segment-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            skipSegment();
        });
    }
    
    // Next episode button click handler
    const nextEpBtn = document.getElementById('next-episode-btn');
    if (nextEpBtn) {
        nextEpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            playNextEpisode();
        });
    }
    
    // Initialize subtitle customization
    setTimeout(() => {
        initSubtitleCustomization();
    }, 1000);
    
    // Add keyboard shortcuts (global - no need to focus on player)
    document.addEventListener('keydown', (e) => {
        const playerContainer = document.getElementById('stream-player-container');
        const video = document.getElementById('stream-video');
        
        // Only handle shortcuts when player is active
        if (!playerContainer || !playerContainer.classList.contains('active') || !video) {
            return;
        }
        
        // Don't handle shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case ' ':
            case 'k':
                // Space or K: Play/Pause
                e.preventDefault();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
                break;
                
            case 'arrowleft':
                // Left arrow: Rewind 5 seconds
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 5);
                break;
                
            case 'arrowright':
                // Right arrow: Forward 5 seconds
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
                break;
                
            case 'j':
                // J: Rewind 10 seconds
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 10);
                break;
                
            case 'l':
                // L: Forward 10 seconds
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                break;
                
            case 'arrowup':
                // Up arrow: Volume up 5%
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.05);
                const volumeSlider = document.getElementById('stream-volume-slider');
                if (volumeSlider) volumeSlider.value = Math.round(video.volume * 100);
                localStorage.setItem('playerVolume', Math.round(video.volume * 100).toString());
                break;
                
            case 'arrowdown':
                // Down arrow: Volume down 5%
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.05);
                const volumeSlider2 = document.getElementById('stream-volume-slider');
                if (volumeSlider2) volumeSlider2.value = Math.round(video.volume * 100);
                localStorage.setItem('playerVolume', Math.round(video.volume * 100).toString());
                break;
                
            case 'm':
                // M: Mute/Unmute
                e.preventDefault();
                const volumeBtn = document.getElementById('stream-volume');
                if (volumeBtn) volumeBtn.click();
                break;
                
            case 'f':
                // F: Fullscreen
                e.preventDefault();
                const fullscreenBtn = document.getElementById('stream-fullscreen');
                if (fullscreenBtn) fullscreenBtn.click();
                break;
                
            case 'escape':
                // Escape: Exit fullscreen or close player
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    hideStreamPlayer();
                }
                break;
                
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                // Number keys: Jump to percentage (0 = 0%, 1 = 10%, etc.)
                e.preventDefault();
                const percent = parseInt(e.key) / 10;
                video.currentTime = video.duration * percent;
                break;
        }
    });
});

// Export functions
window.streamingMode = {
    enabled: () => streamingModeEnabled,
    isReady: () => streamingModeLoaded,
    waitForReady: () => streamingModeReady, // Returns promise
    setEnabled: saveStreamingModeSetting,
    playStream,
    changeProvider,
    init: initStreamingModeUI,
    reload: loadStreamingModeSetting // Add reload function for settings page
};

// Initialize UI immediately
initStreamingModeUI();

console.log('[StreamingMode] Module loaded with HLS.js support');

// Streaming Mode - Stream Extraction & Player
let streamingModeEnabled = true;
let currentProvider = 'videasy';
let currentStreamUrl = null;
let currentSubtitles = [];
let isLoadingStream = false;

// Load streaming mode setting
function loadStreamingModeSetting() {
    try {
        const settings = JSON.parse(localStorage.getItem('streamingModeSettings') || '{}');
        streamingModeEnabled = settings.enabled !== false; // Default ON
        console.log('[StreamingMode] Loaded setting:', streamingModeEnabled);
    } catch (e) {
        streamingModeEnabled = true;
    }
}

// Save streaming mode setting
function saveStreamingModeSetting(enabled) {
    try {
        localStorage.setItem('streamingModeSettings', JSON.stringify({ enabled }));
        streamingModeEnabled = enabled;
        console.log('[StreamingMode] Saved setting:', enabled);
    } catch (e) {
        console.error('[StreamingMode] Failed to save setting:', e);
    }
}

// Initialize streaming mode
loadStreamingModeSetting();

// Provider URLs
const PROVIDERS = {
    videasy: {
        name: 'Videasy',
        movie: (tmdbId) => `https://player.videasy.net/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`
    },
    vidfast: {
        name: 'Vidfast',
        movie: (tmdbId) => `https://vidfast.pro/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`
    },
    vidlink: {
        name: 'Vidlink',
        movie: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
    },
    flixer: {
        name: 'Flixer',
        movie: (tmdbId) => `https://flixer.sh/watch/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://flixer.sh/watch/tv/${tmdbId}/${season}/${episode}`
    }
};

// Get provider URL
function getProviderUrl(provider, type, tmdbId, season = null, episode = null) {
    const prov = PROVIDERS[provider];
    if (!prov) return null;
    
    if (type === 'movie') {
        return prov.movie(tmdbId);
    } else {
        return prov.tv(tmdbId, season, episode);
    }
}

// Extract stream from URL
async function extractStream(url, provider = currentProvider) {
    try {
        console.log('[StreamExtractor] Extracting from:', url);
        
        // Add delay for Flixer (it's slower)
        if (provider === 'flixer') {
            console.log('[StreamExtractor] Waiting 3 seconds for Flixer...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        await window.electronAPI.extractStream(url);
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                window.electronAPI.removeStreamListener(handler);
                reject(new Error('Stream extraction timeout'));
            }, 45000);
            
            const handler = (data) => {
                clearTimeout(timeout);
                window.electronAPI.removeStreamListener(handler);
                console.log('[StreamExtractor] Stream detected:', data);
                resolve(data.proxyUrl);
            };
            
            window.electronAPI.onStreamDetected(handler);
        });
    } catch (error) {
        console.error('[StreamExtractor] Error:', error);
        throw error;
    }
}

// Load subtitles from wyzie.ru
async function loadSubtitles(tmdbId, season = null, episode = null) {
    try {
        let url = `https://sub.wyzie.ru/search?id=${tmdbId}`;
        if (season && episode) {
            url += `&season=${season}&episode=${episode}`;
        }
        
        console.log('[Subtitles] Loading from:', url);
        
        const response = await fetch(url);
        const subs = await response.json();
        
        console.log('[Subtitles] Loaded:', subs.length, 'subtitles');
        return subs || [];
    } catch (error) {
        console.error('[Subtitles] Error loading:', error);
        return [];
    }
}

// Show loading screen
function showLoadingScreen(posterUrl, title) {
    const loadingScreen = document.getElementById('stream-loading-screen');
    if (!loadingScreen) return;
    
    const poster = loadingScreen.querySelector('.loading-poster');
    const titleEl = loadingScreen.querySelector('.loading-title');
    const statusEl = loadingScreen.querySelector('.loading-status');
    
    if (poster) poster.style.backgroundImage = `url(${posterUrl})`;
    if (titleEl) titleEl.textContent = title;
    if (statusEl) statusEl.textContent = 'Getting streams...';
    
    loadingScreen.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('stream-loading-screen');
    if (!loadingScreen) return;
    
    loadingScreen.classList.remove('active');
    document.body.style.overflow = '';
}

// Update loading status
function updateLoadingStatus(status) {
    const statusEl = document.querySelector('.loading-status');
    if (statusEl) statusEl.textContent = status;
}

// Show stream player
function showStreamPlayer() {
    const player = document.getElementById('stream-player-container');
    if (!player) return;
    
    player.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize player controls after showing
    initPlayerControls();
}

// Initialize player controls (called when player is shown)
function initPlayerControls() {
    console.log('[StreamingMode] Initializing player controls...');
    
    // Back button
    const playerBackBtn = document.getElementById('stream-player-back');
    if (playerBackBtn) {
        // Remove old listeners by cloning
        const newBackBtn = playerBackBtn.cloneNode(true);
        playerBackBtn.parentNode.replaceChild(newBackBtn, playerBackBtn);
        
        newBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Back button clicked');
            hideStreamPlayer();
        });
    }
    
    // Play/pause button
    const playPauseBtn = document.getElementById('stream-play-pause');
    const video = document.getElementById('stream-video');
    
    if (playPauseBtn && video) {
        // Remove old listeners by cloning
        const newPlayPauseBtn = playPauseBtn.cloneNode(true);
        playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
        
        newPlayPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Play/pause clicked, paused:', video.paused);
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
        
        video.addEventListener('play', () => {
            newPlayPauseBtn.innerHTML = '<i class="material-icons">pause</i>';
        });
        
        video.addEventListener('pause', () => {
            newPlayPauseBtn.innerHTML = '<i class="material-icons">play_arrow</i>';
        });
    }
    
    // Fullscreen button
    const fullscreenBtn = document.getElementById('stream-fullscreen');
    if (fullscreenBtn) {
        // Remove old listeners by cloning
        const newFullscreenBtn = fullscreenBtn.cloneNode(true);
        fullscreenBtn.parentNode.replaceChild(newFullscreenBtn, fullscreenBtn);
        
        newFullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Fullscreen clicked');
            const playerContainer = document.getElementById('stream-player-container');
            if (!document.fullscreenElement) {
                playerContainer.requestFullscreen().catch(err => {
                    console.error('[StreamingMode] Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    // Volume button and slider
    const volumeBtn = document.getElementById('stream-volume');
    const volumeSlider = document.getElementById('stream-volume-slider');
    if (volumeBtn && volumeSlider && video) {
        // Remove old listeners by cloning
        const newVolumeBtn = volumeBtn.cloneNode(true);
        volumeBtn.parentNode.replaceChild(newVolumeBtn, volumeBtn);
        
        const newVolumeSlider = volumeSlider.cloneNode(true);
        volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
        
        // Load saved volume
        const savedVolume = localStorage.getItem('playerVolume') || '100';
        video.volume = parseInt(savedVolume) / 100;
        newVolumeSlider.value = savedVolume;
        
        // Update icon based on volume
        const updateVolumeIcon = (volume) => {
            const icon = newVolumeBtn.querySelector('.material-icons');
            if (volume === 0) {
                icon.textContent = 'volume_off';
            } else if (volume < 50) {
                icon.textContent = 'volume_down';
            } else {
                icon.textContent = 'volume_up';
            }
        };
        
        updateVolumeIcon(parseInt(savedVolume));
        
        // Volume slider
        newVolumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            video.volume = volume / 100;
            updateVolumeIcon(volume);
            localStorage.setItem('playerVolume', volume.toString());
        });
        
        // Volume button (mute/unmute)
        let lastVolume = parseInt(savedVolume);
        newVolumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (video.volume > 0) {
                lastVolume = Math.round(video.volume * 100);
                video.volume = 0;
                newVolumeSlider.value = '0';
                updateVolumeIcon(0);
            } else {
                video.volume = lastVolume / 100;
                newVolumeSlider.value = lastVolume.toString();
                updateVolumeIcon(lastVolume);
            }
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('stream-settings');
    const settingsMenu = document.getElementById('stream-settings-menu');
    if (settingsBtn && settingsMenu) {
        // Remove old listeners by cloning
        const newSettingsBtn = settingsBtn.cloneNode(true);
        settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);
        
        newSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Settings clicked');
            settingsMenu.classList.toggle('visible');
            // Close subs menu if open
            const subsMenu = document.getElementById('stream-subs-menu');
            if (subsMenu) subsMenu.classList.remove('visible');
        });
    }
    
    // Subtitles button
    const subsBtn = document.getElementById('stream-subs');
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsBtn && subsMenu) {
        // Remove old listeners by cloning
        const newSubsBtn = subsBtn.cloneNode(true);
        subsBtn.parentNode.replaceChild(newSubsBtn, subsBtn);
        
        newSubsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Subtitles clicked');
            subsMenu.classList.toggle('visible');
            // Close settings menu if open
            const settingsMenu = document.getElementById('stream-settings-menu');
            if (settingsMenu) settingsMenu.classList.remove('visible');
        });
    }
    
    // Provider buttons inside settings menu
    document.querySelectorAll('.provider-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const provider = btn.dataset.provider;
            console.log('[StreamingMode] Provider clicked:', provider);
            changeProvider(provider);
            
            // Update active state
            document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Close menu
            if (settingsMenu) settingsMenu.classList.remove('visible');
        });
    });
    
    console.log('[StreamingMode] Player controls initialized');
}

// Hide stream player
function hideStreamPlayer() {
    const player = document.getElementById('stream-player-container');
    if (!player) return;
    
    player.classList.remove('active');
    document.body.style.overflow = '';
    
    // Stop video and cleanup
    const video = document.getElementById('stream-video');
    if (video) {
        video.pause();
        
        // Cleanup HLS instance if exists
        if (video.hlsInstance) {
            video.hlsInstance.destroy();
            video.hlsInstance = null;
        }
        
        video.src = '';
        video.load(); // Reset video element
    }
    
    // Reset current stream data
    currentStreamUrl = null;
    currentSubtitles = [];
}

// Play stream
async function playStream(type, tmdbId, posterUrl, title, season = null, episode = null) {
    if (!streamingModeEnabled) {
        console.log('[StreamingMode] Disabled, using default player');
        return false;
    }
    
    if (isLoadingStream) {
        console.log('[StreamingMode] Already loading a stream');
        return true;
    }
    
    isLoadingStream = true;
    
    // Get backdrop image instead of poster
    let backdropUrl = posterUrl;
    try {
        const API_KEY = 'c3515fdc674ea2bd7b514f4bc3616a4a';
        const BASE_URL = 'https://api.themoviedb.org/3';
        const IMG_BASE_URL = 'https://image.tmdb.org/t/p';
        
        const detailsUrl = `${BASE_URL}/${type}/${tmdbId}?api_key=${API_KEY}`;
        const response = await fetch(detailsUrl);
        const data = await response.json();
        
        if (data.backdrop_path) {
            backdropUrl = `${IMG_BASE_URL}/original${data.backdrop_path}`;
        }
    } catch (error) {
        console.log('[StreamingMode] Could not fetch backdrop, using poster');
    }
    
    // Store media info for provider switching
    window.currentMediaInfo = { type, tmdbId, posterUrl: backdropUrl, title, season, episode };
    
    try {
        // Show loading screen with backdrop
        showLoadingScreen(backdropUrl, title);
        
        // Get provider URL
        const providerUrl = getProviderUrl(currentProvider, type, tmdbId, season, episode);
        if (!providerUrl) {
            throw new Error('Invalid provider or parameters');
        }
        
        updateLoadingStatus(`Extracting from ${PROVIDERS[currentProvider].name}...`);
        
        // Extract stream
        const streamUrl = await extractStream(providerUrl, currentProvider);
        currentStreamUrl = streamUrl;
        
        updateLoadingStatus('Loading subtitles...');
        
        // Load subtitles
        currentSubtitles = await loadSubtitles(tmdbId, season, episode);
        
        // Hide loading, show player
        hideLoadingScreen();
        showStreamPlayer();
        
        // Load stream into player
        loadStreamIntoPlayer(streamUrl, title);
        
        // Load subtitles into player
        loadSubtitlesIntoPlayer(currentSubtitles);
        
        return true;
    } catch (error) {
        console.error('[StreamingMode] Error:', error);
        hideLoadingScreen();
        isLoadingStream = false;
        alert(`Failed to load stream: ${error.message}`);
        return false;
    } finally {
        isLoadingStream = false;
    }
}

// Load stream into video player using Plyr
function loadStreamIntoPlayer(streamUrl, title) {
    const video = document.getElementById('stream-video');
    const titleEl = document.getElementById('stream-player-title');
    
    if (titleEl) titleEl.textContent = title;
    
    // Cleanup old HLS instance
    if (video.hlsInstance) {
        video.hlsInstance.destroy();
        video.hlsInstance = null;
    }
    
    // Destroy old Plyr instance if exists
    if (window.plyrInstance) {
        window.plyrInstance.destroy();
        window.plyrInstance = null;
    }
    
    if (streamUrl.includes('.m3u8')) {
        // HLS stream
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('[Player] HLS manifest parsed');
                
                // Initialize Plyr after HLS is ready
                initPlyrPlayer(video);
                
                video.play().catch(e => console.log('[Player] Autoplay prevented:', e));
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('[Player] HLS fatal error:', data.type, data.details);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('[Player] Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('[Player] Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('[Player] Unrecoverable error');
                            break;
                    }
                }
            });
            
            video.hlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            initPlyrPlayer(video);
            video.play().catch(e => console.log('[Player] Autoplay prevented:', e));
        }
    } else {
        video.src = streamUrl;
        initPlyrPlayer(video);
        video.play().catch(e => console.log('[Player] Autoplay prevented:', e));
    }
}

// Initialize Plyr player
function initPlyrPlayer(video) {
    const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
    const fontSize = settings.fontSize || 150;
    
    window.plyrInstance = new Plyr(video, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
        settings: ['captions', 'quality', 'speed'],
        captions: {
            active: true,
            update: true,
            language: 'auto'
        },
        fullscreen: {
            enabled: true,
            fallback: true,
            iosNative: true
        },
        ratio: '16:9',
        storage: { enabled: true, key: 'plyr' }
    });
    
    // Apply subtitle size
    const style = document.createElement('style');
    style.id = 'plyr-subtitle-style';
    const existingStyle = document.getElementById('plyr-subtitle-style');
    if (existingStyle) existingStyle.remove();
    
    style.textContent = `
        .plyr__captions {
            font-size: ${fontSize}% !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('[Player] Plyr initialized');
}

// Load subtitles into player
function loadSubtitlesIntoPlayer(subtitles) {
    const subsList = document.getElementById('stream-subs-list');
    if (!subsList) return;
    
    subsList.innerHTML = '';
    
    if (subtitles.length === 0) {
        subsList.innerHTML = '<div class="no-subs">No subtitles available</div>';
        return;
    }
    
    // Add "No Subtitles" option
    const noSubItem = document.createElement('div');
    noSubItem.className = 'sub-item';
    noSubItem.innerHTML = `
        <i class="material-icons sub-icon">subtitles_off</i>
        <div class="sub-info">
            <div class="sub-title">No Subtitles</div>
        </div>
    `;
    noSubItem.onclick = () => disableSubtitles();
    subsList.appendChild(noSubItem);
    
    // Add search box
    const searchBox = document.createElement('div');
    searchBox.className = 'sub-search-box';
    searchBox.innerHTML = `
        <input type="text" class="sub-search-input" placeholder="Search subtitles..." />
    `;
    subsList.appendChild(searchBox);
    
    // Group subtitles by language
    const grouped = {};
    subtitles.forEach(sub => {
        const lang = sub.language || 'unknown';
        if (!grouped[lang]) {
            grouped[lang] = [];
        }
        grouped[lang].push(sub);
    });
    
    // Sort languages: English first, then alphabetically
    const sortedLangs = Object.keys(grouped).sort((a, b) => {
        if (a === 'en') return -1;
        if (b === 'en') return 1;
        return a.localeCompare(b);
    });
    
    // Create subtitle items grouped by language
    sortedLangs.forEach(lang => {
        const subs = grouped[lang];
        
        // Language header
        const langHeader = document.createElement('div');
        langHeader.className = 'sub-lang-header';
        langHeader.textContent = subs[0].display || lang.toUpperCase();
        subsList.appendChild(langHeader);
        
        // Subtitle items
        subs.forEach((sub, index) => {
            const item = document.createElement('div');
            item.className = 'sub-item';
            item.dataset.language = sub.language;
            item.dataset.display = sub.display || '';
            item.dataset.release = sub.release || '';
            item.dataset.url = sub.url;
            
            const hiLabel = sub.isHearingImpaired ? '<span class="sub-hi-badge">HI</span>' : '';
            const downloads = sub.downloadCount ? `<span class="sub-downloads">${formatDownloads(sub.downloadCount)} downloads</span>` : '';
            
            item.innerHTML = `
                <img src="${sub.flagUrl}" alt="${sub.language}" class="sub-flag">
                <div class="sub-info">
                    <div class="sub-title">${sub.display || sub.language} ${hiLabel}</div>
                    ${downloads}
                </div>
                <i class="material-icons sub-check-icon">check_circle</i>
            `;
            item.onclick = () => selectSubtitle(sub, item);
            subsList.appendChild(item);
        });
    });
    
    // Add search functionality
    const searchInput = subsList.querySelector('.sub-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = subsList.querySelectorAll('.sub-item');
            const headers = subsList.querySelectorAll('.sub-lang-header');
            
            items.forEach(item => {
                const display = (item.dataset.display || '').toLowerCase();
                const release = (item.dataset.release || '').toLowerCase();
                const matches = display.includes(query) || release.includes(query);
                item.style.display = matches ? 'flex' : 'none';
            });
            
            // Hide headers if no items visible in that language
            headers.forEach(header => {
                const nextItems = [];
                let next = header.nextElementSibling;
                while (next && next.classList.contains('sub-item')) {
                    nextItems.push(next);
                    next = next.nextElementSibling;
                }
                const hasVisible = nextItems.some(item => item.style.display !== 'none');
                header.style.display = hasVisible ? 'block' : 'none';
            });
        });
    }
}

// Disable subtitles
function disableSubtitles() {
    const video = document.getElementById('stream-video');
    if (!video) return;
    
    // Remove all subtitle tracks
    const existingTracks = video.querySelectorAll('track');
    existingTracks.forEach(track => track.remove());
    
    // Disable all text tracks
    if (video.textTracks) {
        for (let i = 0; i < video.textTracks.length; i++) {
            video.textTracks[i].mode = 'disabled';
        }
    }
    
    // Remove active state from all subtitle items
    document.querySelectorAll('.sub-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Close menu
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsMenu) subsMenu.classList.remove('visible');
    
    console.log('[Subtitles] Disabled');
}

// Format download count
function formatDownloads(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Select subtitle
function selectSubtitle(sub, itemElement) {
    const video = document.getElementById('stream-video');
    
    if (!sub || !video) return;
    
    console.log('[Subtitles] Selecting:', sub.display, sub.url);
    
    // Remove active state from all items
    document.querySelectorAll('.sub-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active state to selected item
    if (itemElement) {
        itemElement.classList.add('active');
    }
    
    // Remove existing tracks
    const existingTracks = video.querySelectorAll('track');
    existingTracks.forEach(track => track.remove());
    
    // Disable all existing text tracks
    if (video.textTracks) {
        for (let i = 0; i < video.textTracks.length; i++) {
            video.textTracks[i].mode = 'disabled';
        }
    }
    
    // Create and add new track
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = sub.display || sub.language;
    track.srclang = sub.language || 'en';
    track.src = sub.url;
    track.default = true;
    
    video.appendChild(track);
    
    // Force the video to recognize the new track
    video.load();
    const currentTime = video.currentTime;
    video.currentTime = currentTime;
    
    // Wait for track to load and enable it
    track.addEventListener('load', () => {
        console.log('[Subtitles] Track loaded, enabling...');
        if (track.track) {
            track.track.mode = 'showing';
            console.log('[Subtitles] Track enabled via load event');
        }
    });
    
    // Also try to enable after delays
    setTimeout(() => {
        if (video.textTracks && video.textTracks.length > 0) {
            for (let i = 0; i < video.textTracks.length; i++) {
                video.textTracks[i].mode = 'showing';
            }
            console.log('[Subtitles] Track mode set to showing via timeout 1');
        }
    }, 100);
    
    setTimeout(() => {
        if (video.textTracks && video.textTracks.length > 0) {
            for (let i = 0; i < video.textTracks.length; i++) {
                video.textTracks[i].mode = 'showing';
            }
            console.log('[Subtitles] Track mode set to showing via timeout 2');
            
            // Apply subtitle customization
            applySubtitleCustomization();
        }
    }, 500);
    
    // Close menu
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsMenu) subsMenu.classList.remove('visible');
    
    console.log('[Subtitles] Subtitle selected and loaded');
}

// Apply subtitle customization
function applySubtitleCustomization() {
    const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
    const fontSize = settings.fontSize || 150;
    const delay = settings.delay || 0;
    
    const video = document.getElementById('stream-video');
    if (!video || !video.textTracks || video.textTracks.length === 0) return;
    
    // Apply font size via CSS
    const style = document.createElement('style');
    style.id = 'subtitle-custom-style';
    const existingStyle = document.getElementById('subtitle-custom-style');
    if (existingStyle) existingStyle.remove();
    
    style.textContent = `
        #stream-video::cue {
            font-size: ${fontSize}% !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('[Subtitles] Applied customization - Size:', fontSize + '%', 'Delay:', delay + 's');
}

// Change provider
async function changeProvider(provider) {
    if (provider === currentProvider) return;
    
    const oldProvider = currentProvider;
    currentProvider = provider;
    console.log('[StreamingMode] Changed provider from', oldProvider, 'to:', provider);
    
    // If player is active, reload stream with new provider
    const playerContainer = document.getElementById('stream-player-container');
    if (playerContainer && playerContainer.classList.contains('active')) {
        // Store current media info
        if (!window.currentMediaInfo) {
            console.error('[StreamingMode] No media info stored, cannot reload');
            return;
        }
        
        const { type, tmdbId, posterUrl, title, season, episode } = window.currentMediaInfo;
        
        console.log('[StreamingMode] Reloading stream with new provider...');
        
        // Pause video first
        const video = document.getElementById('stream-video');
        if (video) {
            video.pause();
        }
        
        // Hide player, show loading
        playerContainer.classList.remove('active');
        showLoadingScreen(posterUrl, title);
        updateLoadingStatus(`Extracting from ${PROVIDERS[provider].name}...`);
        
        try {
            // Get provider URL
            const providerUrl = getProviderUrl(provider, type, tmdbId, season, episode);
            if (!providerUrl) {
                throw new Error('Invalid provider or parameters');
            }
            
            // Extract stream
            const streamUrl = await extractStream(providerUrl, provider);
            currentStreamUrl = streamUrl;
            
            // Hide loading, show player
            hideLoadingScreen();
            playerContainer.classList.add('active');
            
            // Load stream into player
            loadStreamIntoPlayer(streamUrl, title);
            
            // Re-initialize controls
            initPlayerControls();
            
            console.log('[StreamingMode] Stream reloaded successfully');
        } catch (error) {
            console.error('[StreamingMode] Error reloading stream:', error);
            hideLoadingScreen();
            alert(`Failed to load stream from ${PROVIDERS[provider].name}: ${error.message}`);
            // Revert provider
            currentProvider = oldProvider;
        }
    }
}

// Initialize streaming mode UI
function initStreamingModeUI() {
    console.log('[StreamingMode] Initializing UI...');
    
    // Back button in loading screen - use event delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.loading-back-btn')) {
            e.stopPropagation();
            console.log('[StreamingMode] Cancel button clicked');
            hideLoadingScreen();
            isLoadingStream = false;
            if (window.electronAPI && window.electronAPI.closeStreamExtraction) {
                window.electronAPI.closeStreamExtraction();
            }
            // Go back to details page
            window.history.back();
        }
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        const settingsBtn = document.getElementById('stream-settings');
        const settingsMenu = document.getElementById('stream-settings-menu');
        const subsBtn = document.getElementById('stream-subs');
        const subsMenu = document.getElementById('stream-subs-menu');
        
        if (settingsMenu && settingsBtn && !settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.classList.remove('visible');
        }
        
        if (subsMenu && subsBtn && !subsBtn.contains(e.target) && !subsMenu.contains(e.target)) {
            subsMenu.classList.remove('visible');
        }
    });
    
    console.log('[StreamingMode] UI initialized');
}

// Export functions
window.streamingMode = {
    enabled: () => streamingModeEnabled,
    setEnabled: saveStreamingModeSetting,
    playStream,
    changeProvider,
    init: initStreamingModeUI
};


// Video time display update
function updateTimeDisplay() {
    const video = document.getElementById('stream-video');
    const timeDisplay = document.getElementById('stream-time-display');
    
    if (!video || !timeDisplay) return;
    
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    
    const current = formatTime(video.currentTime);
    const duration = formatTime(video.duration || 0);
    
    timeDisplay.textContent = `${current} / ${duration}`;
}

// Progress bar update
function updateProgressBar() {
    const video = document.getElementById('stream-video');
    const progressBar = document.getElementById('stream-progress-bar');
    
    if (!video || !progressBar) return;
    
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${percent}%`;
}

// Add video event listeners for time and progress
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('stream-video');
    
    if (video) {
        video.addEventListener('timeupdate', () => {
            updateTimeDisplay();
            updateProgressBar();
        });
        
        video.addEventListener('loadedmetadata', () => {
            updateTimeDisplay();
        });
        
        // Progress bar click to seek - improved hit detection
        const progressWrapper = document.querySelector('.stream-progress-wrapper');
        if (progressWrapper) {
            progressWrapper.style.cursor = 'pointer';
            
            progressWrapper.addEventListener('click', (e) => {
                const progressContainer = progressWrapper.querySelector('.stream-progress-container');
                if (!progressContainer) return;
                
                const rect = progressContainer.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                
                if (percent >= 0 && percent <= 1 && video.duration) {
                    video.currentTime = percent * video.duration;
                    console.log('[Player] Seeked to', Math.floor(percent * 100) + '%');
                }
            });
        }
    }
});


// Auto-hide controls after inactivity
let controlsHideTimeout = null;

function showControls() {
    const playerContainer = document.getElementById('stream-player-container');
    if (playerContainer) {
        playerContainer.classList.remove('hide-controls');
        
        // Clear existing timeout
        if (controlsHideTimeout) {
            clearTimeout(controlsHideTimeout);
        }
        
        // Set new timeout to hide controls after 3 seconds
        controlsHideTimeout = setTimeout(() => {
            const video = document.getElementById('stream-video');
            // Only hide if video is playing
            if (video && !video.paused) {
                playerContainer.classList.add('hide-controls');
            }
        }, 3000);
    }
}

// Add mouse move listener to show controls
document.addEventListener('DOMContentLoaded', () => {
    const playerContainer = document.getElementById('stream-player-container');
    const video = document.getElementById('stream-video');
    
    if (playerContainer) {
        playerContainer.addEventListener('mousemove', showControls);
        playerContainer.addEventListener('click', showControls);
    }
    
    if (video) {
        // Show controls when video is paused
        video.addEventListener('pause', () => {
            if (playerContainer) {
                playerContainer.classList.remove('hide-controls');
                if (controlsHideTimeout) {
                    clearTimeout(controlsHideTimeout);
                }
            }
        });
        
        // Start auto-hide when video plays
        video.addEventListener('play', () => {
            showControls();
        });
    }
});


// Initialize subtitle customization controls
function initSubtitleCustomization() {
    const sizeSlider = document.getElementById('subtitle-size-slider');
    const sizeValue = document.getElementById('subtitle-size-value');
    const delaySlider = document.getElementById('subtitle-delay-slider');
    const delayValue = document.getElementById('subtitle-delay-value');
    
    if (!sizeSlider || !delaySlider) return;
    
    // Load saved settings
    const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
    const fontSize = settings.fontSize || 150;
    const delay = settings.delay || 0;
    
    sizeSlider.value = fontSize;
    sizeValue.textContent = fontSize + '%';
    delaySlider.value = delay;
    delayValue.textContent = delay + 's';
    
    // Font size slider
    sizeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        sizeValue.textContent = value + '%';
        
        const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
        settings.fontSize = value;
        localStorage.setItem('subtitleSettings', JSON.stringify(settings));
        
        applySubtitleCustomization();
    });
    
    // Delay slider
    delaySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        delayValue.textContent = value + 's';
        
        const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
        settings.delay = value;
        localStorage.setItem('subtitleSettings', JSON.stringify(settings));
        
        // Note: Delay would need to be implemented by adjusting cue timings
        // This is complex and may require subtitle file manipulation
        console.log('[Subtitles] Delay set to:', value);
    });
    
    console.log('[Subtitles] Customization controls initialized');
}

// Call this when player controls are initialized
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initSubtitleCustomization();
    }, 1000);
});

// Streaming Mode - Stream Extraction & Player
let streamingModeEnabled = true;
let currentProvider = 'videasy';
let currentStreamUrl = null;
let currentSubtitles = [];
let isLoadingStream = false;

// Load streaming mode setting
function loadStreamingModeSetting() {
    try {
        const settings = JSON.parse(localStorage.getItem('streamingModeSettings') || '{}');
        streamingModeEnabled = settings.enabled !== false; // Default ON
        console.log('[StreamingMode] Loaded setting:', streamingModeEnabled);
    } catch (e) {
        streamingModeEnabled = true;
    }
}

// Save streaming mode setting
function saveStreamingModeSetting(enabled) {
    try {
        localStorage.setItem('streamingModeSettings', JSON.stringify({ enabled }));
        streamingModeEnabled = enabled;
        console.log('[StreamingMode] Saved setting:', enabled);
    } catch (e) {
        console.error('[StreamingMode] Failed to save setting:', e);
    }
}

// Initialize streaming mode
loadStreamingModeSetting();

// Provider URLs
const PROVIDERS = {
    videasy: {
        name: 'Videasy',
        movie: (tmdbId) => `https://player.videasy.net/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`
    },
    vidfast: {
        name: 'Vidfast',
        movie: (tmdbId) => `https://vidfast.pro/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`
    },
    vidlink: {
        name: 'Vidlink',
        movie: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
    },
    flixer: {
        name: 'Flixer',
        movie: (tmdbId) => `https://flixer.sh/watch/movie/${tmdbId}`,
        tv: (tmdbId, season, episode) => `https://flixer.sh/watch/tv/${tmdbId}/${season}/${episode}`
    }
};

// Get provider URL
function getProviderUrl(provider, type, tmdbId, season = null, episode = null) {
    const prov = PROVIDERS[provider];
    if (!prov) return null;
    
    if (type === 'movie') {
        return prov.movie(tmdbId);
    } else {
        return prov.tv(tmdbId, season, episode);
    }
}

// Extract stream from URL
async function extractStream(url, provider = currentProvider) {
    try {
        console.log('[StreamExtractor] Extracting from:', url);
        
        // Add delay for Flixer (it's slower)
        if (provider === 'flixer') {
            console.log('[StreamExtractor] Waiting 3 seconds for Flixer...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        await window.electronAPI.extractStream(url);
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                window.electronAPI.removeStreamListener(handler);
                reject(new Error('Stream extraction timeout'));
            }, 45000);
            
            const handler = (data) => {
                clearTimeout(timeout);
                window.electronAPI.removeStreamListener(handler);
                console.log('[StreamExtractor] Stream detected:', data);
                resolve(data.proxyUrl);
            };
            
            window.electronAPI.onStreamDetected(handler);
        });
    } catch (error) {
        console.error('[StreamExtractor] Error:', error);
        throw error;
    }
}

// Load subtitles from wyzie.ru
async function loadSubtitles(tmdbId, season = null, episode = null) {
    try {
        let url = `https://sub.wyzie.ru/search?id=${tmdbId}`;
        if (season && episode) {
            url += `&season=${season}&episode=${episode}`;
        }
        
        console.log('[Subtitles] Loading from:', url);
        
        const response = await fetch(url);
        const subs = await response.json();
        
        console.log('[Subtitles] Loaded:', subs.length, 'subtitles');
        return subs || [];
    } catch (error) {
        console.error('[Subtitles] Error loading:', error);
        return [];
    }
}

// Show loading screen
function showLoadingScreen(posterUrl, title) {
    const loadingScreen = document.getElementById('stream-loading-screen');
    if (!loadingScreen) return;
    
    const poster = loadingScreen.querySelector('.loading-poster');
    const titleEl = loadingScreen.querySelector('.loading-title');
    const statusEl = loadingScreen.querySelector('.loading-status');
    
    if (poster) poster.style.backgroundImage = `url(${posterUrl})`;
    if (titleEl) titleEl.textContent = title;
    if (statusEl) statusEl.textContent = 'Getting streams...';
    
    loadingScreen.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('stream-loading-screen');
    if (!loadingScreen) return;
    
    loadingScreen.classList.remove('active');
    document.body.style.overflow = '';
}

// Update loading status
function updateLoadingStatus(status) {
    const statusEl = document.querySelector('.loading-status');
    if (statusEl) statusEl.textContent = status;
}

// Show stream player
function showStreamPlayer() {
    const player = document.getElementById('stream-player-container');
    if (!player) return;
    
    player.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize player controls after showing
    initPlayerControls();
}

// Initialize player controls (called when player is shown)
function initPlayerControls() {
    console.log('[StreamingMode] Initializing player controls...');
    
    // Back button
    const playerBackBtn = document.getElementById('stream-player-back');
    if (playerBackBtn) {
        // Remove old listeners by cloning
        const newBackBtn = playerBackBtn.cloneNode(true);
        playerBackBtn.parentNode.replaceChild(newBackBtn, playerBackBtn);
        
        newBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Back button clicked');
            hideStreamPlayer();
        });
    }
    
    // Play/pause button
    const playPauseBtn = document.getElementById('stream-play-pause');
    const video = document.getElementById('stream-video');
    
    if (playPauseBtn && video) {
        // Remove old listeners by cloning
        const newPlayPauseBtn = playPauseBtn.cloneNode(true);
        playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
        
        newPlayPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Play/pause clicked, paused:', video.paused);
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
        
        video.addEventListener('play', () => {
            newPlayPauseBtn.innerHTML = '<i class="material-icons">pause</i>';
        });
        
        video.addEventListener('pause', () => {
            newPlayPauseBtn.innerHTML = '<i class="material-icons">play_arrow</i>';
        });
    }
    
    // Fullscreen button
    const fullscreenBtn = document.getElementById('stream-fullscreen');
    if (fullscreenBtn) {
        // Remove old listeners by cloning
        const newFullscreenBtn = fullscreenBtn.cloneNode(true);
        fullscreenBtn.parentNode.replaceChild(newFullscreenBtn, fullscreenBtn);
        
        newFullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Fullscreen clicked');
            const playerContainer = document.getElementById('stream-player-container');
            if (!document.fullscreenElement) {
                playerContainer.requestFullscreen().catch(err => {
                    console.error('[StreamingMode] Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    // Volume button and slider
    const volumeBtn = document.getElementById('stream-volume');
    const volumeSlider = document.getElementById('stream-volume-slider');
    if (volumeBtn && volumeSlider && video) {
        // Remove old listeners by cloning
        const newVolumeBtn = volumeBtn.cloneNode(true);
        volumeBtn.parentNode.replaceChild(newVolumeBtn, volumeBtn);
        
        const newVolumeSlider = volumeSlider.cloneNode(true);
        volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
        
        // Load saved volume
        const savedVolume = localStorage.getItem('playerVolume') || '100';
        video.volume = parseInt(savedVolume) / 100;
        newVolumeSlider.value = savedVolume;
        
        // Update icon based on volume
        const updateVolumeIcon = (volume) => {
            const icon = newVolumeBtn.querySelector('.material-icons');
            if (volume === 0) {
                icon.textContent = 'volume_off';
            } else if (volume < 50) {
                icon.textContent = 'volume_down';
            } else {
                icon.textContent = 'volume_up';
            }
        };
        
        updateVolumeIcon(parseInt(savedVolume));
        
        // Volume slider
        newVolumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            video.volume = volume / 100;
            updateVolumeIcon(volume);
            localStorage.setItem('playerVolume', volume.toString());
        });
        
        // Volume button (mute/unmute)
        let lastVolume = parseInt(savedVolume);
        newVolumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (video.volume > 0) {
                lastVolume = Math.round(video.volume * 100);
                video.volume = 0;
                newVolumeSlider.value = '0';
                updateVolumeIcon(0);
            } else {
                video.volume = lastVolume / 100;
                newVolumeSlider.value = lastVolume.toString();
                updateVolumeIcon(lastVolume);
            }
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('stream-settings');
    const settingsMenu = document.getElementById('stream-settings-menu');
    if (settingsBtn && settingsMenu) {
        // Remove old listeners by cloning
        const newSettingsBtn = settingsBtn.cloneNode(true);
        settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);
        
        newSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Settings clicked');
            settingsMenu.classList.toggle('visible');
            // Close subs menu if open
            const subsMenu = document.getElementById('stream-subs-menu');
            if (subsMenu) subsMenu.classList.remove('visible');
        });
    }
    
    // Subtitles button
    const subsBtn = document.getElementById('stream-subs');
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsBtn && subsMenu) {
        // Remove old listeners by cloning
        const newSubsBtn = subsBtn.cloneNode(true);
        subsBtn.parentNode.replaceChild(newSubsBtn, subsBtn);
        
        newSubsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[StreamingMode] Subtitles clicked');
            subsMenu.classList.toggle('visible');
            // Close settings menu if open
            const settingsMenu = document.getElementById('stream-settings-menu');
            if (settingsMenu) settingsMenu.classList.remove('visible');
        });
    }
    
    // Provider buttons inside settings menu
    document.querySelectorAll('.provider-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const provider = btn.dataset.provider;
            console.log('[StreamingMode] Provider clicked:', provider);
            changeProvider(provider);
            
            // Update active state
            document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Close menu
            if (settingsMenu) settingsMenu.classList.remove('visible');
        });
    });
    
    console.log('[StreamingMode] Player controls initialized');
}

// Hide stream player
function hideStreamPlayer() {
    const player = document.getElementById('stream-player-container');
    if (!player) return;
    
    player.classList.remove('active');
    document.body.style.overflow = '';
    
    // Stop video and cleanup
    const video = document.getElementById('stream-video');
    if (video) {
        video.pause();
        
        // Cleanup HLS instance if exists
        if (video.hlsInstance) {
            video.hlsInstance.destroy();
            video.hlsInstance = null;
        }
        
        video.src = '';
        video.load(); // Reset video element
    }
    
    // Reset current stream data
    currentStreamUrl = null;
    currentSubtitles = [];
}

// Play stream
async function playStream(type, tmdbId, posterUrl, title, season = null, episode = null) {
    if (!streamingModeEnabled) {
        console.log('[StreamingMode] Disabled, using default player');
        return false;
    }
    
    if (isLoadingStream) {
        console.log('[StreamingMode] Already loading a stream');
        return true;
    }
    
    isLoadingStream = true;
    
    // Get backdrop image instead of poster
    let backdropUrl = posterUrl;
    try {
        const API_KEY = 'c3515fdc674ea2bd7b514f4bc3616a4a';
        const BASE_URL = 'https://api.themoviedb.org/3';
        const IMG_BASE_URL = 'https://image.tmdb.org/t/p';
        
        const detailsUrl = `${BASE_URL}/${type}/${tmdbId}?api_key=${API_KEY}`;
        const response = await fetch(detailsUrl);
        const data = await response.json();
        
        if (data.backdrop_path) {
            backdropUrl = `${IMG_BASE_URL}/original${data.backdrop_path}`;
        }
    } catch (error) {
        console.log('[StreamingMode] Could not fetch backdrop, using poster');
    }
    
    // Store media info for provider switching
    window.currentMediaInfo = { type, tmdbId, posterUrl: backdropUrl, title, season, episode };
    
    try {
        // Show loading screen with backdrop
        showLoadingScreen(backdropUrl, title);
        
        // Get provider URL
        const providerUrl = getProviderUrl(currentProvider, type, tmdbId, season, episode);
        if (!providerUrl) {
            throw new Error('Invalid provider or parameters');
        }
        
        updateLoadingStatus(`Extracting from ${PROVIDERS[currentProvider].name}...`);
        
        // Extract stream
        const streamUrl = await extractStream(providerUrl, currentProvider);
        currentStreamUrl = streamUrl;
        
        updateLoadingStatus('Loading subtitles...');
        
        // Load subtitles
        currentSubtitles = await loadSubtitles(tmdbId, season, episode);
        
        // Hide loading, show player
        hideLoadingScreen();
        showStreamPlayer();
        
        // Load stream into player
        loadStreamIntoPlayer(streamUrl, title);
        
        // Load subtitles into player
        loadSubtitlesIntoPlayer(currentSubtitles);
        
        return true;
    } catch (error) {
        console.error('[StreamingMode] Error:', error);
        hideLoadingScreen();
        isLoadingStream = false;
        alert(`Failed to load stream: ${error.message}`);
        return false;
    } finally {
        isLoadingStream = false;
    }
}

// Load stream into video player using Video.js
function loadStreamIntoPlayer(streamUrl, title) {
    const video = document.getElementById('stream-video');
    const titleEl = document.getElementById('stream-player-title');
    
    if (titleEl) titleEl.textContent = title;
    
    // Destroy old Video.js instance if exists
    if (window.vjsPlayer) {
        try {
            window.vjsPlayer.dispose();
        } catch (e) {
            console.log('[Player] Error disposing player:', e);
        }
        window.vjsPlayer = null;
    }
    
    // Initialize Video.js with proper text track settings but NO controls
    window.vjsPlayer = videojs(video, {
        controls: false,  // Disable Video.js controls, use custom ones
        autoplay: false,
        preload: 'auto',
        fluid: false,
        responsive: false,
        fill: true,
        html5: {
            vhs: {
                overrideNative: true
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false
        },
        textTrackSettings: false,  // Disable settings dialog
        textTrackDisplay: {
            allowMultipleShowingTracks: false
        }
    });
    
    // Set source
    window.vjsPlayer.src({
        src: streamUrl,
        type: streamUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
    });
    
    // Apply subtitle customization
    const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
    const fontSize = settings.fontSize || 150;
    
    const style = document.createElement('style');
    style.id = 'videojs-subtitle-style';
    const existingStyle = document.getElementById('videojs-subtitle-style');
    if (existingStyle) existingStyle.remove();
    
    style.textContent = `
        .video-js .vjs-text-track-display {
            font-size: ${fontSize}% !important;
        }
        .vjs-text-track-cue {
            font-size: ${fontSize}% !important;
        }
    `;
    document.head.appendChild(style);
    
    // Play
    window.vjsPlayer.ready(function() {
        console.log('[Player] Video.js ready');
        this.play().catch(e => console.log('[Player] Autoplay prevented:', e));
    });
    
    console.log('[Player] Video.js initialized with source:', streamUrl);
}

// Load subtitles into player
function loadSubtitlesIntoPlayer(subtitles) {
    const subsList = document.getElementById('stream-subs-list');
    if (!subsList) return;
    
    subsList.innerHTML = '';
    
    if (subtitles.length === 0) {
        subsList.innerHTML = '<div class="no-subs">No subtitles available</div>';
        return;
    }
    
    // Add "No Subtitles" option
    const noSubItem = document.createElement('div');
    noSubItem.className = 'sub-item';
    noSubItem.innerHTML = `
        <i class="material-icons sub-icon">subtitles_off</i>
        <div class="sub-info">
            <div class="sub-title">No Subtitles</div>
        </div>
    `;
    noSubItem.onclick = () => disableSubtitles();
    subsList.appendChild(noSubItem);
    
    // Add search box
    const searchBox = document.createElement('div');
    searchBox.className = 'sub-search-box';
    searchBox.innerHTML = `
        <input type="text" class="sub-search-input" placeholder="Search subtitles..." />
    `;
    subsList.appendChild(searchBox);
    
    // Group subtitles by language
    const grouped = {};
    subtitles.forEach(sub => {
        const lang = sub.language || 'unknown';
        if (!grouped[lang]) {
            grouped[lang] = [];
        }
        grouped[lang].push(sub);
    });
    
    // Sort languages: English first, then alphabetically
    const sortedLangs = Object.keys(grouped).sort((a, b) => {
        if (a === 'en') return -1;
        if (b === 'en') return 1;
        return a.localeCompare(b);
    });
    
    // Create subtitle items grouped by language
    sortedLangs.forEach(lang => {
        const subs = grouped[lang];
        
        // Language header
        const langHeader = document.createElement('div');
        langHeader.className = 'sub-lang-header';
        langHeader.textContent = subs[0].display || lang.toUpperCase();
        subsList.appendChild(langHeader);
        
        // Subtitle items
        subs.forEach((sub, index) => {
            const item = document.createElement('div');
            item.className = 'sub-item';
            item.dataset.language = sub.language;
            item.dataset.display = sub.display || '';
            item.dataset.release = sub.release || '';
            item.dataset.url = sub.url;
            
            const hiLabel = sub.isHearingImpaired ? '<span class="sub-hi-badge">HI</span>' : '';
            const downloads = sub.downloadCount ? `<span class="sub-downloads">${formatDownloads(sub.downloadCount)} downloads</span>` : '';
            
            item.innerHTML = `
                <img src="${sub.flagUrl}" alt="${sub.language}" class="sub-flag">
                <div class="sub-info">
                    <div class="sub-title">${sub.display || sub.language} ${hiLabel}</div>
                    ${downloads}
                </div>
                <i class="material-icons sub-check-icon">check_circle</i>
            `;
            item.onclick = () => selectSubtitle(sub, item);
            subsList.appendChild(item);
        });
    });
    
    // Add search functionality
    const searchInput = subsList.querySelector('.sub-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = subsList.querySelectorAll('.sub-item');
            const headers = subsList.querySelectorAll('.sub-lang-header');
            
            items.forEach(item => {
                const display = (item.dataset.display || '').toLowerCase();
                const release = (item.dataset.release || '').toLowerCase();
                const matches = display.includes(query) || release.includes(query);
                item.style.display = matches ? 'flex' : 'none';
            });
            
            // Hide headers if no items visible in that language
            headers.forEach(header => {
                const nextItems = [];
                let next = header.nextElementSibling;
                while (next && next.classList.contains('sub-item')) {
                    nextItems.push(next);
                    next = next.nextElementSibling;
                }
                const hasVisible = nextItems.some(item => item.style.display !== 'none');
                header.style.display = hasVisible ? 'block' : 'none';
            });
        });
    }
}

// Disable subtitles with Video.js
function disableSubtitles() {
    console.log('[Subtitles] Disabling all subtitles');
    
    if (window.vjsPlayer) {
        // Remove all remote text tracks
        const existingTracks = window.vjsPlayer.remoteTextTracks();
        const tracksToRemove = [];
        for (let i = 0; i < existingTracks.length; i++) {
            tracksToRemove.push(existingTracks[i]);
        }
        tracksToRemove.forEach(track => {
            window.vjsPlayer.removeRemoteTextTrack(track);
        });
        
        // Also disable all text tracks
        const tracks = window.vjsPlayer.textTracks();
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = 'disabled';
        }
        
        console.log('[Subtitles] All tracks removed/disabled');
    }
    
    // Remove active state from all subtitle items
    document.querySelectorAll('.sub-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Close menu
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsMenu) subsMenu.classList.remove('visible');
    
    console.log('[Subtitles] Disabled');
}

// Format download count
function formatDownloads(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Select subtitle with Video.js
function selectSubtitle(sub, itemElement) {
    if (!sub || !window.vjsPlayer) {
        console.error('[Subtitles] Cannot select subtitle - player not ready');
        return;
    }
    
    console.log('[Subtitles] Selecting:', sub.display, sub.url);
    
    // Remove active state from all items
    document.querySelectorAll('.sub-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active state to selected item
    if (itemElement) {
        itemElement.classList.add('active');
    }
    
    // Remove all existing text tracks first
    const existingTracks = window.vjsPlayer.remoteTextTracks();
    const tracksToRemove = [];
    for (let i = 0; i < existingTracks.length; i++) {
        tracksToRemove.push(existingTracks[i]);
    }
    tracksToRemove.forEach(track => {
        window.vjsPlayer.removeRemoteTextTrack(track);
    });
    
    console.log('[Subtitles] Removed existing tracks, adding new track...');
    
    // Add new subtitle track
    const trackElement = window.vjsPlayer.addRemoteTextTrack({
        kind: 'subtitles',
        label: sub.display || sub.language,
        srclang: sub.language || 'en',
        src: sub.url,
        mode: 'showing'
    }, false);
    
    console.log('[Subtitles] Track added:', trackElement);
    
    // Force enable the track after a short delay
    setTimeout(() => {
        const tracks = window.vjsPlayer.textTracks();
        console.log('[Subtitles] Total tracks:', tracks.length);
        
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            console.log('[Subtitles] Track', i, ':', track.label, 'mode:', track.mode);
            
            // Enable only the last track (the one we just added)
            if (i === tracks.length - 1) {
                track.mode = 'showing';
                console.log('[Subtitles] Enabled track:', track.label);
            } else {
                track.mode = 'disabled';
            }
        }
        
        console.log('[Subtitles] Subtitle track should now be visible');
    }, 200);
    
    // Close menu
    const subsMenu = document.getElementById('stream-subs-menu');
    if (subsMenu) subsMenu.classList.remove('visible');
    
    console.log('[Subtitles] Subtitle selection complete');
}

// Apply subtitle customization with Video.js
function applySubtitleCustomization() {
    const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
    const fontSize = settings.fontSize || 150;
    
    const style = document.createElement('style');
    style.id = 'videojs-subtitle-style';
    const existingStyle = document.getElementById('videojs-subtitle-style');
    if (existingStyle) existingStyle.remove();
    
    style.textContent = `
        .video-js .vjs-text-track-display {
            font-size: ${fontSize}% !important;
            bottom: 80px !important;
        }
        .vjs-text-track-cue {
            font-size: ${fontSize}% !important;
        }
        .video-js .vjs-text-track-cue > div {
            font-size: ${fontSize}% !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('[Subtitles] Applied customization - Size:', fontSize + '%');
}

// Change provider
async function changeProvider(provider) {
    if (provider === currentProvider) return;
    
    const oldProvider = currentProvider;
    currentProvider = provider;
    console.log('[StreamingMode] Changed provider from', oldProvider, 'to:', provider);
    
    // If player is active, reload stream with new provider
    const playerContainer = document.getElementById('stream-player-container');
    if (playerContainer && playerContainer.classList.contains('active')) {
        // Store current media info
        if (!window.currentMediaInfo) {
            console.error('[StreamingMode] No media info stored, cannot reload');
            return;
        }
        
        const { type, tmdbId, posterUrl, title, season, episode } = window.currentMediaInfo;
        
        console.log('[StreamingMode] Reloading stream with new provider...');
        
        // Pause video first
        const video = document.getElementById('stream-video');
        if (video) {
            video.pause();
        }
        
        // Hide player, show loading
        playerContainer.classList.remove('active');
        showLoadingScreen(posterUrl, title);
        updateLoadingStatus(`Extracting from ${PROVIDERS[provider].name}...`);
        
        try {
            // Get provider URL
            const providerUrl = getProviderUrl(provider, type, tmdbId, season, episode);
            if (!providerUrl) {
                throw new Error('Invalid provider or parameters');
            }
            
            // Extract stream
            const streamUrl = await extractStream(providerUrl, provider);
            currentStreamUrl = streamUrl;
            
            // Hide loading, show player
            hideLoadingScreen();
            playerContainer.classList.add('active');
            
            // Load stream into player
            loadStreamIntoPlayer(streamUrl, title);
            
            // Re-initialize controls
            initPlayerControls();
            
            console.log('[StreamingMode] Stream reloaded successfully');
        } catch (error) {
            console.error('[StreamingMode] Error reloading stream:', error);
            hideLoadingScreen();
            alert(`Failed to load stream from ${PROVIDERS[provider].name}: ${error.message}`);
            // Revert provider
            currentProvider = oldProvider;
        }
    }
}

// Initialize streaming mode UI
function initStreamingModeUI() {
    console.log('[StreamingMode] Initializing UI...');
    
    // Back button in loading screen - use event delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.loading-back-btn')) {
            e.stopPropagation();
            console.log('[StreamingMode] Cancel button clicked');
            hideLoadingScreen();
            isLoadingStream = false;
            if (window.electronAPI && window.electronAPI.closeStreamExtraction) {
                window.electronAPI.closeStreamExtraction();
            }
            // Go back to details page
            window.history.back();
        }
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        const settingsBtn = document.getElementById('stream-settings');
        const settingsMenu = document.getElementById('stream-settings-menu');
        const subsBtn = document.getElementById('stream-subs');
        const subsMenu = document.getElementById('stream-subs-menu');
        
        if (settingsMenu && settingsBtn && !settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.classList.remove('visible');
        }
        
        if (subsMenu && subsBtn && !subsBtn.contains(e.target) && !subsMenu.contains(e.target)) {
            subsMenu.classList.remove('visible');
        }
    });
    
    console.log('[StreamingMode] UI initialized');
}

// Export functions
window.streamingMode = {
    enabled: () => streamingModeEnabled,
    setEnabled: saveStreamingModeSetting,
    playStream,
    changeProvider,
    init: initStreamingModeUI
};


// Video time display update
function updateTimeDisplay() {
    const video = document.getElementById('stream-video');
    const timeDisplay = document.getElementById('stream-time-display');
    
    if (!video || !timeDisplay) return;
    
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    
    const current = formatTime(video.currentTime);
    const duration = formatTime(video.duration || 0);
    
    timeDisplay.textContent = `${current} / ${duration}`;
}

// Progress bar update
function updateProgressBar() {
    const video = document.getElementById('stream-video');
    const progressBar = document.getElementById('stream-progress-bar');
    
    if (!video || !progressBar) return;
    
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${percent}%`;
}

// Add video event listeners for time and progress
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('stream-video');
    
    if (video) {
        video.addEventListener('timeupdate', () => {
            updateTimeDisplay();
            updateProgressBar();
        });
        
        video.addEventListener('loadedmetadata', () => {
            updateTimeDisplay();
        });
        
        // Progress bar click to seek - improved hit detection
        const progressWrapper = document.querySelector('.stream-progress-wrapper');
        if (progressWrapper) {
            progressWrapper.style.cursor = 'pointer';
            
            progressWrapper.addEventListener('click', (e) => {
                const progressContainer = progressWrapper.querySelector('.stream-progress-container');
                if (!progressContainer) return;
                
                const rect = progressContainer.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                
                if (percent >= 0 && percent <= 1 && video.duration) {
                    video.currentTime = percent * video.duration;
                    console.log('[Player] Seeked to', Math.floor(percent * 100) + '%');
                }
            });
        }
    }
});


// Auto-hide controls after inactivity
let controlsHideTimeout = null;

function showControls() {
    const playerContainer = document.getElementById('stream-player-container');
    if (playerContainer) {
        playerContainer.classList.remove('hide-controls');
        
        // Clear existing timeout
        if (controlsHideTimeout) {
            clearTimeout(controlsHideTimeout);
        }
        
        // Set new timeout to hide controls after 3 seconds
        controlsHideTimeout = setTimeout(() => {
            const video = document.getElementById('stream-video');
            // Only hide if video is playing
            if (video && !video.paused) {
                playerContainer.classList.add('hide-controls');
            }
        }, 3000);
    }
}

// Add mouse move listener to show controls
document.addEventListener('DOMContentLoaded', () => {
    const playerContainer = document.getElementById('stream-player-container');
    const video = document.getElementById('stream-video');
    
    if (playerContainer) {
        playerContainer.addEventListener('mousemove', showControls);
        playerContainer.addEventListener('click', showControls);
    }
    
    if (video) {
        // Show controls when video is paused
        video.addEventListener('pause', () => {
            if (playerContainer) {
                playerContainer.classList.remove('hide-controls');
                if (controlsHideTimeout) {
                    clearTimeout(controlsHideTimeout);
                }
            }
        });
        
        // Start auto-hide when video plays
        video.addEventListener('play', () => {
            showControls();
        });
    }
});


// Initialize subtitle customization controls
function initSubtitleCustomization() {
    const sizeSlider = document.getElementById('subtitle-size-slider');
    const sizeValue = document.getElementById('subtitle-size-value');
    const delaySlider = document.getElementById('subtitle-delay-slider');
    const delayValue = document.getElementById('subtitle-delay-value');
    
    if (!sizeSlider || !delaySlider) return;
    
    // Load saved settings
    const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
    const fontSize = settings.fontSize || 150;
    const delay = settings.delay || 0;
    
    sizeSlider.value = fontSize;
    sizeValue.textContent = fontSize + '%';
    delaySlider.value = delay;
    delayValue.textContent = delay + 's';
    
    // Font size slider
    sizeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        sizeValue.textContent = value + '%';
        
        const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
        settings.fontSize = value;
        localStorage.setItem('subtitleSettings', JSON.stringify(settings));
        
        applySubtitleCustomization();
    });
    
    // Delay slider
    delaySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        delayValue.textContent = value + 's';
        
        const settings = JSON.parse(localStorage.getItem('subtitleSettings') || '{}');
        settings.delay = value;
        localStorage.setItem('subtitleSettings', JSON.stringify(settings));
        
        // Note: Delay would need to be implemented by adjusting cue timings
        // This is complex and may require subtitle file manipulation
        console.log('[Subtitles] Delay set to:', value);
    });
    
    console.log('[Subtitles] Customization controls initialized');
}

// Call this when player controls are initialized
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initSubtitleCustomization();
    }, 1000);
});

/**
 * Stremio Addon Protocol Handler
 * Handles addons that don't use TMDB IDs
 */

/**
 * Fetch meta from Stremio addon
 * @param {string} addonUrl - Base URL of the addon (e.g., "https://addon.com")
 * @param {string} type - Content type (movie, series, etc.)
 * @param {string} id - Content ID from the addon
 * @returns {Promise<Object>} Meta object
 */
export async function fetchStremioMeta(addonUrl, type, id) {
    try {
        // Remove trailing slash
        const baseUrl = addonUrl.replace(/\/$/, '');
        // URL encode the ID to handle IDs with special characters (like URLs)
        const encodedId = encodeURIComponent(id);
        const metaUrl = `${baseUrl}/meta/${type}/${encodedId}.json`;
        
        console.log('[StremioAddon] Fetching meta:', metaUrl);
        console.log('[StremioAddon] Original ID:', id);
        console.log('[StremioAddon] Encoded ID:', encodedId);
        
        const response = await fetch(metaUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[StremioAddon] Meta response:', data);
        
        return data.meta || data;
    } catch (error) {
        console.error('[StremioAddon] Meta fetch error:', error);
        throw error;
    }
}

/**
 * Fetch streams from Stremio addon
 * @param {string} addonUrl - Base URL of the addon
 * @param {string} type - Content type (movie, series, etc.)
 * @param {string} videoId - Video ID (for movies, same as meta ID; for series, includes season/episode)
 * @returns {Promise<Array>} Array of stream objects
 */
export async function fetchStremioStreams(addonUrl, type, videoId) {
    try {
        // Remove trailing slash
        const baseUrl = addonUrl.replace(/\/$/, '');
        // URL encode the video ID to handle IDs with special characters (like URLs)
        const encodedVideoId = encodeURIComponent(videoId);
        const streamUrl = `${baseUrl}/stream/${type}/${encodedVideoId}.json`;
        
        console.log('[StremioAddon] Fetching streams:', streamUrl);
        console.log('[StremioAddon] Original video ID:', videoId);
        console.log('[StremioAddon] Encoded video ID:', encodedVideoId);
        
        const response = await fetch(streamUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[StremioAddon] Streams response:', data);
        
        return data.streams || [];
    } catch (error) {
        console.error('[StremioAddon] Streams fetch error:', error);
        throw error;
    }
}

/**
 * Parse Stremio stream object and convert to playable URL
 * @param {Object} stream - Stream object from addon
 * @returns {Object} Parsed stream with URL and metadata
 */
export function parseStremioStream(stream) {
    const parsed = {
        title: stream.title || stream.name || 'Unknown',
        url: null,
        type: null,
        quality: null,
        source: 'stremio-addon'
    };
    
    // Direct URL
    if (stream.url) {
        parsed.url = stream.url;
        parsed.type = 'url';
    }
    // YouTube
    else if (stream.ytId) {
        parsed.url = `https://www.youtube.com/watch?v=${stream.ytId}`;
        parsed.type = 'youtube';
    }
    // Torrent info hash
    else if (stream.infoHash) {
        // Build magnet link
        const trackers = [
            'udp://tracker.opentrackr.org:1337/announce',
            'udp://open.stealth.si:80/announce',
            'udp://tracker.torrent.eu.org:451/announce'
        ];
        const trackerParams = trackers.map(t => `&tr=${encodeURIComponent(t)}`).join('');
        parsed.url = `magnet:?xt=urn:btih:${stream.infoHash}${trackerParams}`;
        parsed.type = 'torrent';
    }
    // External URL (some addons use this)
    else if (stream.externalUrl) {
        parsed.url = stream.externalUrl;
        parsed.type = 'external';
    }
    
    // Extract quality from title if present
    const qualityMatch = stream.title?.match(/(\d+p|4K|HD|SD|CAM|TS)/i);
    if (qualityMatch) {
        parsed.quality = qualityMatch[1];
    }
    
    return parsed;
}

/**
 * Check if an ID is from a Stremio addon (not TMDB)
 * @param {string} id - Content ID
 * @returns {boolean}
 */
export function isStremioAddonId(id) {
    // TMDB IDs are numeric or start with 'tt' (IMDB)
    // Stremio addon IDs are usually custom strings
    return id && !id.match(/^(tt)?\d+$/);
}

/**
 * Extract addon URL from catalog URL
 * @param {string} catalogUrl - Full catalog URL
 * @returns {string} Base addon URL
 */
export function extractAddonUrl(catalogUrl) {
    try {
        const url = new URL(catalogUrl);
        // Remove /catalog/... path
        return `${url.protocol}//${url.host}`;
    } catch (e) {
        console.error('[StremioAddon] Invalid catalog URL:', catalogUrl);
        return null;
    }
}

/**
 * Format Stremio meta for display
 * @param {Object} meta - Meta object from addon
 * @returns {Object} Formatted meta for details page
 */
export function formatStremioMeta(meta) {
    return {
        id: meta.id,
        title: meta.name || meta.title,
        poster: meta.poster,
        background: meta.background || meta.poster,
        logo: meta.logo,
        description: meta.description || meta.overview,
        genres: meta.genre || meta.genres || [],
        type: meta.type,
        year: meta.releaseInfo ? parseInt(meta.releaseInfo) : null,
        rating: meta.imdbRating || meta.rating,
        runtime: meta.runtime,
        director: meta.director,
        cast: meta.cast,
        trailer: meta.trailerStreams?.[0]?.ytId,
        // Stremio-specific fields
        behaviorHints: meta.behaviorHints || {},
        links: meta.links || [],
        posterShape: meta.posterShape || 'poster'
    };
}

/**
 * Get video ID for stream request
 * For movies: same as meta ID
 * For series: meta ID + season + episode (e.g., "id:1:1")
 * @param {Object} meta - Meta object
 * @param {number} season - Season number (for series)
 * @param {number} episode - Episode number (for series)
 * @returns {string} Video ID
 */
export function getVideoId(meta, season = null, episode = null) {
    // Check behaviorHints for default video ID
    if (meta.behaviorHints?.defaultVideoId) {
        return meta.behaviorHints.defaultVideoId;
    }
    
    // For series with season/episode
    if (meta.type === 'series' && season !== null && episode !== null) {
        return `${meta.id}:${season}:${episode}`;
    }
    
    // For movies or single-video items
    return meta.id;
}

// Title Bar Controls
(function() {
    'use strict';

    // Check if we're in Electron
    const isElectron = typeof window.electronAPI !== 'undefined';
    
    if (!isElectron) {
        console.log('[TitleBar] Not running in Electron, hiding custom titlebar');
        const titlebar = document.getElementById('customTitlebar');
        if (titlebar) titlebar.style.display = 'none';
        return;
    }

    // Add platform class to body for platform-specific styling
    if (window.electronAPI.platform) {
        document.body.classList.add(`platform-${window.electronAPI.platform}`);
    }

    console.log('[TitleBar] Initializing custom titlebar controls');

    // Get button elements
    const minimizeBtn = document.getElementById('minimizeBtn');
    const maximizeBtn = document.getElementById('maximizeBtn');
    const closeBtn = document.getElementById('closeBtn');
    const titlebar = document.getElementById('customTitlebar');

    // Window control handlers
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', async () => {
            try {
                await window.electronAPI.minimizeWindow();
            } catch (err) {
                console.error('[TitleBar] Minimize error:', err);
            }
        });
    }

    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', async () => {
            try {
                await window.electronAPI.maximizeWindow();
            } catch (err) {
                console.error('[TitleBar] Maximize error:', err);
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', async () => {
            try {
                await window.electronAPI.closeWindow();
            } catch (err) {
                console.error('[TitleBar] Close error:', err);
            }
        });
    }

    // Listen for maximize state changes
    if (window.electronAPI.onMaximizeChanged) {
        window.electronAPI.onMaximizeChanged((payload) => {
            if (titlebar) {
                if (payload.isMaximized) {
                    titlebar.classList.add('maximized');
                } else {
                    titlebar.classList.remove('maximized');
                }
            }
        });
    }

    // Add hover effects
    const buttons = [minimizeBtn, maximizeBtn, closeBtn];
    buttons.forEach(btn => {
        if (!btn) return;
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
    });

    console.log('[TitleBar] Custom titlebar initialized successfully');
})();

// Helper to parse quality from title
const parseQuality = (title) => {
    const t = title.toLowerCase();
    if (t.includes('2160p') || t.includes('4k')) return '4K';
    if (t.includes('1080p')) return '1080p';
    if (t.includes('720p')) return '720p';
    if (t.includes('480p')) return '480p';
    return 'Unknown';
};

// Helper to parse codec
const parseCodec = (title) => {
    const t = title.toLowerCase();
    if (t.includes('x265') || t.includes('hevc')) return 'HEVC';
    if (t.includes('x264') || t.includes('avc')) return 'x264';
    if (t.includes('av1')) return 'AV1';
    return 'h264';
};

// Helper to parse HDR info
const parseHDR = (title) => {
    const t = title.toLowerCase();
    if (t.includes('dv') || t.includes('dolby vision')) return 'Dolby Vision';
    if (t.includes('hdr10+')) return 'HDR10+';
    if (t.includes('hdr')) return 'HDR';
    return null;
};

export function normalizeTitle(title) {
    if (!title) return '';
    return title.toLowerCase()
        .replace(/['":.!?,_+\-\[\]\(\)]/g, ' ') 
        .replace(/\s+/g, ' ')                  
        .trim();
}

export function parseSceneInfo(title) {
    const t = title.toLowerCase();
    
    let season = null;
    let episode = null;
    let isMultiEpisode = false;
    let isSeasonPack = false;
    let isMultiSeason = false;
    let matchIndex = -1;

    if (/s(\d+)\s*-\s*s?(\d+)/i.test(t) || /season\s*\d+\s*-\s*\d+/i.test(t) || /complete\s+series/i.test(t) || /collection/i.test(t) || /anthology/i.test(t)) {
        isMultiSeason = true;
    }

    const multiSxE = /s(\d{1,2})[ ._-]*e(\d{1,3})[ ._-]*-[ ._-]*e?(\d{1,3})/i;
    const multiX = /(\d{1,2})x(\d{1,3})[ ._-]*-[ ._-]*x?(\d{1,3})/i;

    if (multiSxE.test(t) || multiX.test(t)) {
        isMultiEpisode = true;
    }
    
    const sXe = /s(\d{1,2})[ ._-]*e(\d{1,3})/i;
    const x = /\b(\d{1,2})x(\d{1,3})\b/i;
    const written = /season\s*(\d{1,2})\s*episode\s*(\d{1,3})/i;

    let match = t.match(sXe);
    if (match) {
        season = parseInt(match[1], 10);
        episode = parseInt(match[2], 10);
        matchIndex = match.index;
    } else {
        match = t.match(x);
        if (match) {
            season = parseInt(match[1], 10);
            episode = parseInt(match[2], 10);
            matchIndex = match.index;
        } else {
            match = t.match(written);
            if (match) {
                season = parseInt(match[1], 10);
                episode = parseInt(match[2], 10);
                matchIndex = match.index;
            }
        }
    }

    if (season === null) {
        const sOnly = /\bs(\d{1,2})\b/i;
        const sWritten = /season\s*(\d{1,2})\b/i;
        
        let sMatch = t.match(sOnly);
        if (sMatch) {
            season = parseInt(sMatch[1], 10);
            isSeasonPack = true;
            matchIndex = sMatch.index;
        } else {
            sMatch = t.match(sWritten);
            if (sMatch) {
                season = parseInt(sMatch[1], 10);
                isSeasonPack = true;
                matchIndex = sMatch.index;
            }
        }
    }

    if (t.includes('complete') || t.includes('season pack') || t.includes('batch')) {
        if (season !== null && episode === null) isSeasonPack = true;
        if (season !== null && episode !== null) isMultiEpisode = true; 
    }
    
    if (season !== null && episode === null && !isSeasonPack) {
         isSeasonPack = true;
    }

    return { season, episode, isSeasonPack, isMultiEpisode, isMultiSeason, matchIndex };
}

export const filterTorrents = (torrents, metadata) => {
    if (!torrents || !Array.isArray(torrents)) return [];

    const { title: showTitle, type, season: requiredSeason, episode: requiredEpisode, year } = metadata;
    
    if (!showTitle) return torrents;

    const normShowTitle = normalizeTitle(showTitle);
    
    const filtered = torrents.filter(item => {
        if (item.Seeders === 0) return false;

        let cleanTitle = item.Title.replace(/^\[[^\]]+\]\s*/, '');
        const info = parseSceneInfo(cleanTitle); 
        
        // 1. Title matching logic
        if (info.matchIndex > -1) {
            const titlePart = cleanTitle.substring(0, info.matchIndex);
            const normTitlePart = normalizeTitle(titlePart);
            if (!normTitlePart.startsWith(normShowTitle)) return false;
            const suffix = normTitlePart.substring(normShowTitle.length).trim();
            if (suffix.length > 0) return false;
        } else {
             const normItemTitle = normalizeTitle(cleanTitle);
             if (!normItemTitle.startsWith(normShowTitle)) return false;
        }

        // 2. Type specific filtering
        if (type === 'tv') {
            if (requiredSeason && requiredEpisode) {
                const reqS = parseInt(requiredSeason, 10);
                const reqE = parseInt(requiredEpisode, 10);
                
                // Matches exact episode
                if (info.season === reqS && info.episode === reqE && !info.isMultiEpisode && !info.isMultiSeason && !info.isSeasonPack) {
                    return true;
                }
                
                // Matches season pack for the required season
                if (info.season === reqS && info.isSeasonPack && !info.isMultiSeason) {
                    return true;
                }

                return false;
            }
            
            if (requiredSeason && !requiredEpisode) {
                const reqS = parseInt(requiredSeason, 10);
                
                // If only season is required, we want ONLY season packs for that season
                if (info.season !== reqS) return false;
                if (info.isMultiSeason) return false;
                if (info.episode !== null) return false;
                
                return info.isSeasonPack || (info.season !== null && info.episode === null);
            }
        } else {
            // Movie filtering
            if (year) {
                const t = item.Title.toLowerCase();
                if (!t.includes(year)) return false;
            }
        }
        
        return true;
    });

    return filtered.map(t => ({
        id: t.Guid || t.Link,
        title: t.Title,
        size: typeof t.Size === 'string' ? t.Size : (t.Size ? (t.Size / 1024 / 1024 / 1024).toFixed(2) + ' GB' : 'N/A'),
        sizeBytes: t.SizeBytes || parseInt(t.Size) || 0,
        seeders: t.Seeders,
        peers: t.Peers,
        publishDate: t.PublishDate,
        indexer: t.Tracker,
        link: t.Link,
        magnet: t.MagnetUri,
        quality: parseQuality(t.Title),
        codec: parseCodec(t.Title),
        hdr: parseHDR(t.Title)
    })).sort((a, b) => b.seeders - a.seeders);
};
// Basic Mode Addons - Bridged to Main App via ElectronAPI

export const getInstalledAddons = async () => {
    try {
        let addons = [];
        if (window.electronAPI?.addonList) {
            const res = await window.electronAPI.addonList();
            addons = res.success ? res.addons : [];
        } else {
            // Fallback for non-electron env (testing)
            const stored = localStorage.getItem('stremio_addons');
            addons = stored ? JSON.parse(stored) : [];
        }
        
        // Ensure every addon has a baseUrl (Critical for fetchAddonStreams)
        return addons.map(addon => {
            // Normalize 'url' to 'manifestUrl' if 'url' exists (Main App structure)
            if (addon.url && !addon.manifestUrl) {
                addon.manifestUrl = addon.url;
            }

            if (!addon.baseUrl) {
                // Try transportUrl
                if (addon.transportUrl) {
                    addon.baseUrl = addon.transportUrl;
                } else if (addon.manifest?.transportUrl) {
                    addon.baseUrl = addon.manifest.transportUrl;
                } else if (addon.manifestUrl) {
                    // Derive from manifestUrl - try standard replace first
                    if (addon.manifestUrl.endsWith('/manifest.json')) {
                         addon.baseUrl = addon.manifestUrl.slice(0, -14);
                    } else {
                         addon.baseUrl = addon.manifestUrl.replace('/manifest.json', '').replace('manifest.json', '');
                    }
                }
                
                // Cleanup trailing slash
                if (addon.baseUrl && addon.baseUrl.endsWith('/')) {
                    addon.baseUrl = addon.baseUrl.slice(0, -1);
                }
            }
            return addon;
        });
    } catch (e) {
        console.error("Failed to fetch addons", e);
        return [];
    }
};

export const installAddon = async (manifestUrl) => {
    try {
        if (window.electronAPI?.addonInstall) {
            const res = await window.electronAPI.addonInstall(manifestUrl);
            if (!res.success) throw new Error(res.message);
            return res.addon;
        }
        throw new Error("Electron API not available");
    } catch (error) {
        console.error("Installation failed", error);
        throw error;
    }
};

export const removeAddon = async (id) => {
    if (window.electronAPI?.addonRemove) {
        await window.electronAPI.addonRemove(id);
        return;
    }
};

export const fetchAddonStreams = async (addon, type, id) => {
    try {
        const name = addon.name || addon.manifest?.name || 'Unknown Addon';
        console.log(`[Addons] Fetching streams for ${type}/${id} from ${name}`);
        
        // 1. Try to get the base URL from standard properties
        let targetUrl = addon.baseUrl || addon.transportUrl || addon.manifest?.transportUrl;
        
        // Handle 'url' property from Main App structure
        if (!targetUrl && addon.url) {
             if (addon.url.endsWith('/manifest.json')) {
                 targetUrl = addon.url.replace('/manifest.json', '');
             } else {
                 targetUrl = addon.url;
             }
        }
        
        // 2. If no explicit transportUrl, try to derive from manifestUrl
        if (!targetUrl && addon.manifestUrl) {
            // Remove /manifest.json suffix to get base
            targetUrl = addon.manifestUrl.replace('/manifest.json', '');
        }

        if (!targetUrl) {
            console.error(`[Addons] No transport/base URL found for ${name}. Addon object:`, addon);
            return [];
        }
        
        // Ensure no trailing slash
        if (targetUrl.endsWith('/')) targetUrl = targetUrl.slice(0, -1);

        // Construct stream URL
        const url = `${targetUrl}/stream/${type}/${id}.json`;
        console.log(`[Addons] Requesting URL: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[Addons] HTTP Error ${response.status} fetching streams from ${name}: ${response.statusText}`);
            return [];
        }
        
        const data = await response.json();
        if (!data.streams) {
            console.warn(`[Addons] No 'streams' property in response from ${name}:`, data);
        }
        
        console.log(`[Addons] Received ${data.streams?.length || 0} streams from ${name}`);
        return data.streams || [];
    } catch (e) {
        console.error(`[Addons] Exception fetching from ${addon?.name || 'addon'}`, e);
        return [];
    }
};

export const parseAddonStream = (stream, addonName) => {
    const fullText = (stream.name + ' ' + (stream.title || '') + ' ' + (stream.description || '')).toLowerCase();

    // Extract seeders: 👤 100 or 👥 1
    const seederMatch = (stream.title || '' + stream.description || '').match(/[👤👥]\s*(\d+)/);
    const seeders = seederMatch ? parseInt(seederMatch[1]) : 0;

    // Extract size: 💾 6.91 GB or 📦 92.9 GB or behaviorHints.videoSize
    let size = 'N/A';
    let sizeBytes = 0;

    if (stream.behaviorHints?.videoSize) {
        sizeBytes = stream.behaviorHints.videoSize;
        size = (sizeBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else {
        const sizeMatch = (stream.title || '' + stream.description || '').match(/[💾📦]\s*([\d.]+)\s*([GM]B)/i);
        if (sizeMatch) {
            const val = parseFloat(sizeMatch[1]);
            const unit = sizeMatch[2].toUpperCase();
            size = `${val} ${unit}`;
            sizeBytes = val * (unit === 'GB' ? 1024 * 1024 * 1024 : 1024 * 1024);
        }
    }

    // Resolution parsing
    let quality = 'Unknown';
    if (fullText.includes('2160p') || fullText.includes('4k')) quality = '4K';
    else if (fullText.includes('1080p')) quality = '1080p';
    else if (fullText.includes('720p')) quality = '720p';
    else if (fullText.includes('480p')) quality = '480p';

    // Magnet or URL construction
    let playUrl = stream.url; // Direct URL support
    if (!playUrl && stream.infoHash) {
        const trackers = (stream.sources || []).filter(s => s.startsWith('tracker:')).map(s => `&tr=${encodeURIComponent(s.replace('tracker:', ''))}`).join('');
        playUrl = `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(stream.behaviorHints?.filename || 'stream')}${trackers}`;
    }

    // Title construction: use filename or behaviorHints if title is messy
    let displayTitle = (stream.title || '').split('\n')[0] || stream.behaviorHints?.filename || stream.name;
    if (displayTitle.length < 5 && stream.behaviorHints?.filename) {
        displayTitle = stream.behaviorHints.filename;
    }

    // Capture cached icon (⚡) if present in the stream name or title
    const streamName = stream.name || '';
    const cachedIcon = streamName.includes('⚡') ? '⚡ ' : '';

    return {
        id: stream.infoHash || stream.url || Math.random().toString(),
        title: displayTitle,
        fullTitle: stream.title || stream.description || '',
        size: size,
        sizeBytes: sizeBytes,
        seeders: seeders,
        peers: 0,
        indexer: `${cachedIcon}${addonName}`, // Include emoji in indexer for the filter to see
        magnet: playUrl,
        quality: quality,
        codec: fullText.includes('x265') || fullText.includes('hevc') ? 'HEVC' : 'x264',
        hdr: fullText.includes('hdr') ? 'HDR' : (fullText.includes('dv') ? 'Dolby Vision' : null),
        externalUrl: stream.externalUrl, // Preserve externalUrl for stremio:/// links
        url: stream.url || stream.externalUrl // Also set url property
    };
};
const BASE_URL = '/api/tmdb';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=No+Image';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const fetchFromTMDB = async (endpoint, params = {}) => {
  const url = new URL(`${window.location.origin}${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status}`);
  }
  return response.json();
};

export const getPopularMovies = () => fetchFromTMDB('/movie/popular');
export const getTrendingMovies = () => fetchFromTMDB('/trending/movie/week');
export const getTopRatedMovies = () => fetchFromTMDB('/movie/top_rated');
export const getPopularTVShows = () => fetchFromTMDB('/tv/popular');
export const getTrendingTVShows = () => fetchFromTMDB('/trending/tv/week');
export const getTopRatedTVShows = () => fetchFromTMDB('/tv/top_rated');

export const getMovieDetails = (id) => 
  fetchFromTMDB(`/movie/${id}`, { append_to_response: 'credits' });

export const getTVShowDetails = (id) => 
  fetchFromTMDB(`/tv/${id}`, { append_to_response: 'credits' });

export const getExternalIds = (id, type) =>
  fetchFromTMDB(`/${type}/${id}/external_ids`);

export const getMovieImages = (id) =>
  fetchFromTMDB(`/movie/${id}/images`);

export const getTVShowImages = (id) =>
  fetchFromTMDB(`/tv/${id}/images`);

export const getEpisodeImages = (tvId, seasonNumber, episodeNumber) =>
  fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/images`);

export const getMovieVideos = (id) =>
  fetchFromTMDB(`/movie/${id}/videos`);

export const getTVShowVideos = (id) =>
  fetchFromTMDB(`/tv/${id}/videos`);

export const getSeasonEpisodes = (tvId, seasonNumber) =>
  fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);

export const searchMulti = (query) => 
  fetchFromTMDB('/search/multi', { query, include_adult: false });

export const getDiscover = (type, params = {}) => 
  fetchFromTMDB(`/discover/${type}`, { include_adult: false, sort_by: 'popularity.desc', ...params });

export const getPersonDetails = (id) => 
  fetchFromTMDB(`/person/${id}`);

export const getPersonCredits = (id) => 
  fetchFromTMDB(`/person/${id}/combined_credits`);

export const getGenresList = async () => {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchFromTMDB('/genre/movie/list'),
    fetchFromTMDB('/genre/tv/list')
  ]);
  
  // Merge and dedup by ID
  const map = new Map();
  movieGenres.genres.forEach(g => map.set(g.id, g));
  tvGenres.genres.forEach(g => map.set(g.id, g));
  
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};

// Find TMDB ID from external ID (like IMDB)
export const findByExternalId = (externalId, externalSource = 'imdb_id') => 
  fetchFromTMDB(`/find/${externalId}`, { external_source: externalSource });

// TMDB API Configuration
const API_KEY = 'c3515fdc674ea2bd7b514f4bc3616a4a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// API Endpoints
const endpoints = {
    trending: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
    popular: `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
    topRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
    upcoming: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}`
};

// Cache for preloaded data
let cachedMovies = {
    trending: [],
    popular: [],
    topRated: [],
    upcoming: []
};

// Load cached data from localStorage
function loadCachedData() {
    try {
        const cached = localStorage.getItem('playtorrio_movies');
        if (cached) {
            const data = JSON.parse(cached);
            // Check if cache is less than 1 hour old
            if (data.timestamp && (Date.now() - data.timestamp < 3600000)) {
                cachedMovies = data.movies;
                console.log('✅ Loaded movies from cache');
                return true;
            }
        }
    } catch (error) {
        console.error('Error loading cache:', error);
    }
    return false;
}

// Save data to localStorage
function saveCachedData() {
    try {
        const data = {
            movies: cachedMovies,
            timestamp: Date.now()
        };
        localStorage.setItem('playtorrio_movies', JSON.stringify(data));
        console.log('✅ Saved movies to cache');
    } catch (error) {
        console.error('Error saving cache:', error);
    }
}

// Fetch movies from API
async function fetchMovies(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

// Preload image
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(url); // Resolve anyway to not block
        img.src = url;
    });
}

// Preload all movie data and images during intro
async function preloadMovieData() {
    console.log('🎬 Preloading movies...');
    
    // Try to load from cache first
    if (loadCachedData() && cachedMovies.trending.length > 0) {
        console.log('✅ Using cached movie data');
        return;
    }
    
    try {
        // Fetch all movie data in parallel
        const [trending, popular, topRated, upcoming] = await Promise.all([
            fetchMovies(endpoints.trending),
            fetchMovies(endpoints.popular),
            fetchMovies(endpoints.topRated),
            fetchMovies(endpoints.upcoming)
        ]);
        
        cachedMovies.trending = trending;
        cachedMovies.popular = popular;
        cachedMovies.topRated = topRated;
        cachedMovies.upcoming = upcoming;
        
        // Save to localStorage
        saveCachedData();
        
        console.log('✅ All movies preloaded!');
        
        // Preload images in background (don't wait for them)
        preloadImagesInBackground();
    } catch (error) {
        console.error('Error preloading movies:', error);
    }
}

// Preload images in background without blocking
function preloadImagesInBackground() {
    const allMovies = [...cachedMovies.trending, ...cachedMovies.popular, ...cachedMovies.topRated, ...cachedMovies.upcoming];
    const imageUrls = [];
    
    allMovies.forEach(movie => {
        if (movie.poster_path) {
            imageUrls.push(`${IMG_BASE_URL}/w500${movie.poster_path}`);
        }
        if (movie.backdrop_path) {
            imageUrls.push(`${IMG_BASE_URL}/original${movie.backdrop_path}`);
        }
    });
    
    console.log(`📸 Preloading ${imageUrls.length} images in background...`);
    
    // Preload images without waiting
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Create hero slide
function createHeroSlide(movie) {
    const slide = document.createElement('div');
    slide.className = 'hero-slide';
    slide.style.backgroundImage = `url(${IMG_BASE_URL}/original${movie.backdrop_path})`;
    
    slide.innerHTML = `
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <h1 class="hero-title">${movie.title}</h1>
            <div class="hero-meta">
                <span class="hero-rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                <span class="hero-year">${new Date(movie.release_date).getFullYear()}</span>
            </div>
            <p class="hero-overview">${movie.overview}</p>
            <div class="hero-buttons">
                <button class="hero-btn primary" onclick="sessionStorage.setItem('skipIntro', 'true'); window.location.href='details.html?id=${movie.id}&type=movie'">▶ Play Now</button>
                <button class="hero-btn secondary">+ My List</button>
            </div>
        </div>
    `;
    
    return slide;
}

// Create movie card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const posterPath = movie.poster_path 
        ? `${IMG_BASE_URL}/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Image';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${posterPath}" alt="${movie.title}" loading="lazy">
            <div class="movie-overlay">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                        <span class="movie-year">${new Date(movie.release_date).getFullYear()}</span>
                    </div>
                    <p class="movie-description">${movie.overview.substring(0, 150)}${movie.overview.length > 150 ? '...' : ''}</p>
                    <button class="movie-btn">More Info</button>
                </div>
            </div>
        </div>
    `;
    
    // Add click handler to navigate to details page
    card.addEventListener('click', () => {
        sessionStorage.setItem('skipIntro', 'true');
        window.location.href = `details.html?id=${movie.id}&type=movie`;
    });
    
    return card;
}

// Initialize hero slider
let currentHeroIndex = 0;
let heroMovies = [];

async function initHeroSlider() {
    const heroSlider = document.getElementById('heroSlider');
    const heroDots = document.getElementById('heroDots');
    const heroLoading = document.querySelector('.hero-loading');
    
    if (!heroSlider || !heroDots) {
        console.error('❌ Hero elements not found!');
        return;
    }
    
    // Hide loading indicator
    if (heroLoading) heroLoading.style.display = 'none';
    
    // Use cached data
    heroMovies = cachedMovies.trending.slice(0, 5); // Get top 5 for hero
    
    console.log('🎬 Creating hero slides for', heroMovies.length, 'movies');
    
    heroMovies.forEach((movie, index) => {
        const slide = createHeroSlide(movie);
        heroSlider.appendChild(slide);
        
        const dot = document.createElement('span');
        dot.className = 'hero-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToHeroSlide(index));
        heroDots.appendChild(dot);
    });
    
    showHeroSlide(0);
    console.log('✅ Hero slider initialized');
}

function showHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    currentHeroIndex = index;
}

function goToHeroSlide(index) {
    showHeroSlide(index);
}

function nextHeroSlide() {
    const nextIndex = (currentHeroIndex + 1) % heroMovies.length;
    showHeroSlide(nextIndex);
}

function prevHeroSlide() {
    const prevIndex = (currentHeroIndex - 1 + heroMovies.length) % heroMovies.length;
    showHeroSlide(prevIndex);
}

// Initialize category sliders
async function initCategorySlider(sliderId, cachedData) {
    const slider = document.getElementById(sliderId);
    
    cachedData.forEach(movie => {
        const card = createMovieCard(movie);
        slider.appendChild(card);
    });
    
    // Add scroll buttons
    addScrollButtons(slider);
}

function addScrollButtons(slider) {
    const container = slider.parentElement;
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'slider-btn prev';
    prevBtn.innerHTML = '‹';
    prevBtn.addEventListener('click', () => {
        slider.scrollBy({ left: -slider.offsetWidth * 0.8, behavior: 'smooth' });
    });
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'slider-btn next';
    nextBtn.innerHTML = '›';
    nextBtn.addEventListener('click', () => {
        slider.scrollBy({ left: slider.offsetWidth * 0.8, behavior: 'smooth' });
    });
    
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
}

// Create Spotlight Section
function createSpotlight(movie) {
    const section = document.getElementById('spotlightSection');
    if (!section || !movie) return;

    const backdropPath = movie.backdrop_path 
        ? `${IMG_BASE_URL}/original${movie.backdrop_path}` 
        : 'https://via.placeholder.com/1200x600?text=No+Image';

    section.innerHTML = `
        <div class="spotlight-card">
            <div class="spotlight-image">
                <img src="${backdropPath}" alt="${movie.title}">
            </div>
            <div class="spotlight-content">
                <span class="spotlight-label">Editor's Pick</span>
                <h2 class="spotlight-title">${movie.title}</h2>
                <div class="movie-meta" style="justify-content: flex-start; gap: 20px;">
                    <span class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                    <span class="movie-year">${new Date(movie.release_date).getFullYear()}</span>
                </div>
                <p class="spotlight-desc">${movie.overview}</p>
                <div class="spotlight-actions">
                    <button class="hero-btn primary" onclick="sessionStorage.setItem('skipIntro', 'true'); window.location.href='details.html?id=${movie.id}&type=movie'">▶ Watch Now</button>
                    <button class="hero-btn secondary">+ Add to List</button>
                </div>
            </div>
        </div>
    `;
}

// Initialize app
async function initApp() {
    console.log('🎬 Initializing app...');
    
    await initHeroSlider();
    await initCategorySlider('trendingSlider', cachedMovies.trending);
    
    // Initialize Originals with exactly 4 movies to make them stand out
    await initCategorySlider('originalsSlider', cachedMovies.popular.slice(10, 14));

    // Initialize Spotlight with a random top-rated movie
    if (cachedMovies.topRated && cachedMovies.topRated.length > 0) {
        const randomSpotlight = cachedMovies.topRated[Math.floor(Math.random() * cachedMovies.topRated.length)];
        createSpotlight(randomSpotlight);
    }

    await initCategorySlider('popularSlider', cachedMovies.popular);
    await initCategorySlider('topRatedSlider', cachedMovies.topRated);
    await initCategorySlider('upcomingSlider', cachedMovies.upcoming);
    
    // Hero navigation
    const heroNext = document.getElementById('heroNext');
    const heroPrev = document.getElementById('heroPrev');
    
    if (heroNext && heroPrev) {
        heroNext.addEventListener('click', nextHeroSlide);
        heroPrev.addEventListener('click', prevHeroSlide);
    }
    
    // Auto-advance hero slider
    setInterval(nextHeroSlide, 5000);
    
    console.log('✅ App initialized!');
}

// Update Listener
if (window.electronAPI && window.electronAPI.onUpdateAvailable) {
    window.electronAPI.onUpdateAvailable((info) => {
        console.log('Update available:', info);
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-[#14141f] border border-blue-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform scale-100 transition-transform duration-300">
                <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-white text-center mb-2">Update Available!</h2>
                <p class="text-gray-400 text-center mb-6">Version <span class="text-white font-bold">${info.version}</span> is ready to download.</p>
                <div class="flex flex-col gap-3">
                    <button id="update-download-btn" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                        <span>Download Now</span>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </button>
                    <button id="update-later-btn" class="w-full py-2 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">
                        Remind Me Later
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('update-download-btn').onclick = () => {
             if (window.electronAPI.openExternal) {
                 window.electronAPI.openExternal(info.downloadUrl);
             }
             modal.remove();
        };
        
        document.getElementById('update-later-btn').onclick = () => {
            modal.remove();
        };
    });
}

// Start preloading and initializing
preloadMovieData().then(() => {
    initApp();
});

// Audiobooks Functionality for Advanced Mode
const AUDIOBOOKS_API = window.location.origin;

let currentAudiobooksPage = 1;
let isLoadingAudiobooks = false;
let hasMoreAudiobooks = true;
let isAudiobooksSearchMode = false;
let currentAudiobook = null;
let currentChapter = null;
let currentStreamUrl = null;

// Audiobooks to filter out
const FILTERED_AUDIOBOOKS = [
    '1001 nights',
    'the fox and the wolf'
];

const shouldFilterAudiobook = (audiobook) => {
    const title = (audiobook.title || '').toLowerCase();
    return FILTERED_AUDIOBOOKS.some(filter => title.includes(filter.toLowerCase()));
};

// Show Audiobooks Page
function showAudiobooksPage() {
    hideAllSections();
    
    let audiobooksSection = document.getElementById('audiobooksSection');
    if (!audiobooksSection) {
        createAudiobooksSection();
        initialAudiobooksLoad();
    } else {
        audiobooksSection.style.setProperty('display', 'block', 'important');
    }
}

// Initial Load
async function initialAudiobooksLoad() {
    await loadAudiobooks();
}

// Create Audiobooks Section
function createAudiobooksSection() {
    const mainContent = document.getElementById('mainContent');
    const section = document.createElement('div');
    section.id = 'audiobooksSection';
    section.className = 'audiobooks-section';
    section.innerHTML = `
        <div class="audiobooks-header">
            <div class="search-container-audiobooks">
                <input type="text" id="audiobooksSearch" placeholder="Search audiobooks...">
                <button id="audiobooksSearchBtn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </button>
            </div>
        </div>
        <div class="audiobooks-grid" id="audiobooksGrid"></div>
        <div class="audiobooks-loader" id="audiobooksLoader">
            <div class="spinner"></div>
        </div>
        <div class="audiobooks-load-more" id="audiobooksLoadMore" style="display: none;">
            <button class="load-more-btn" id="audiobooksLoadMoreBtn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Load More
            </button>
        </div>
    `;
    mainContent.appendChild(section);

    const searchInput = document.getElementById('audiobooksSearch');
    const searchBtn = document.getElementById('audiobooksSearchBtn');
    const loadMoreBtn = document.getElementById('audiobooksLoadMoreBtn');

    searchBtn.addEventListener('click', () => {
        performAudiobooksSearch(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performAudiobooksSearch(searchInput.value);
        }
    });

    loadMoreBtn.addEventListener('click', () => {
        loadMoreAudiobooks();
    });
}

// Fetch all audiobooks
async function fetchAllAudiobooks() {
    try {
        const res = await fetch(`${AUDIOBOOKS_API}/api/audiobooks/all`);
        const data = await res.json();
        if (data.success) return data.data || [];
        return [];
    } catch (e) {
        console.error('[Audiobooks] Fetch all failed:', e);
        return [];
    }
}

// Fetch more audiobooks
async function fetchMoreAudiobooks(page) {
    try {
        const res = await fetch(`${AUDIOBOOKS_API}/api/audiobooks/more/${page}`);
        const data = await res.json();
        if (data.success) return data.data || [];
        return [];
    } catch (e) {
        console.error('[Audiobooks] Fetch more failed:', e);
        return [];
    }
}

// Search audiobooks
async function searchAudiobooks(query) {
    try {
        const res = await fetch(`${AUDIOBOOKS_API}/api/audiobooks/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) return data.data || [];
        return [];
    } catch (e) {
        console.error('[Audiobooks] Search failed:', e);
        return [];
    }
}

// Perform Search
async function performAudiobooksSearch(query) {
    if (!query.trim()) {
        currentAudiobooksPage = 1;
        hasMoreAudiobooks = true;
        isAudiobooksSearchMode = false;
        document.getElementById('audiobooksGrid').innerHTML = '';
        document.getElementById('audiobooksLoadMore').style.display = 'none';
        loadAudiobooks();
        return;
    }

    isLoadingAudiobooks = true;
    isAudiobooksSearchMode = true;
    hasMoreAudiobooks = false;
    document.getElementById('audiobooksGrid').innerHTML = '';
    document.getElementById('audiobooksLoader').style.display = 'flex';
    document.getElementById('audiobooksLoadMore').style.display = 'none';

    try {
        const results = await searchAudiobooks(query);
        if (results.length === 0) {
            document.getElementById('audiobooksGrid').innerHTML = '<p class="no-results">No audiobooks found matching your search.</p>';
        } else {
            renderAudiobooks(results);
        }
    } catch (error) {
        console.error('Error searching audiobooks:', error);
        document.getElementById('audiobooksGrid').innerHTML = '<p class="no-results">Error performing search.</p>';
    } finally {
        isLoadingAudiobooks = false;
        document.getElementById('audiobooksLoader').style.display = 'none';
    }
}

// Remove infinite scroll setup
// setupAudiobooksInfiniteScroll function removed

// Load Audiobooks
async function loadAudiobooks() {
    if (isLoadingAudiobooks || !hasMoreAudiobooks || isAudiobooksSearchMode) return;
    
    isLoadingAudiobooks = true;
    document.getElementById('audiobooksLoader').style.display = 'flex';

    try {
        let audiobooks;
        if (currentAudiobooksPage === 1) {
            // First load - get initial batch
            audiobooks = await fetchAllAudiobooks();
        } else {
            // Subsequent loads - get more pages
            audiobooks = await fetchMoreAudiobooks(currentAudiobooksPage);
        }

        if (audiobooks.length === 0) {
            hasMoreAudiobooks = false;
            document.getElementById('audiobooksLoadMore').style.display = 'none';
        } else {
            renderAudiobooks(audiobooks);
            currentAudiobooksPage++;
            // Show load more button if we got results
            if (!isAudiobooksSearchMode) {
                document.getElementById('audiobooksLoadMore').style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Error loading audiobooks:', error);
    } finally {
        isLoadingAudiobooks = false;
        document.getElementById('audiobooksLoader').style.display = 'none';
    }
}

// Load More Button Handler
async function loadMoreAudiobooks() {
    if (isAudiobooksSearchMode) return;
    
    const btn = document.getElementById('audiobooksLoadMoreBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> Loading...';
    
    await loadAudiobooks();
    
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> Load More';
}

// Render Audiobooks
function renderAudiobooks(audiobooks) {
    const grid = document.getElementById('audiobooksGrid');
    const filteredAudiobooks = audiobooks.filter(ab => !shouldFilterAudiobook(ab));
    
    filteredAudiobooks.forEach(audiobook => {
        const card = document.createElement('div');
        card.className = 'audiobook-card';
        
        card.innerHTML = `
            <div class="audiobook-poster">
                <img src="${audiobook.image || ''}" alt="${audiobook.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231f2937%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%236b7280%22 font-size=%2210%22>No Cover</text></svg>'">
                <div class="audiobook-overlay"></div>
                <div class="audiobook-badge">
                    <div class="badge-content">
                        <div class="badge-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7zm-1.5 16c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </div>
                        <span class="badge-title">PlayTorrio</span>
                        <span class="badge-subtitle">Audiobooks</span>
                    </div>
                </div>
            </div>
            <div class="audiobook-info">
                <h3 class="audiobook-title">${audiobook.title}</h3>
            </div>
        `;
        
        card.addEventListener('click', () => openAudiobookModal(audiobook));
        grid.appendChild(card);
    });
}

// Fetch chapters
async function fetchChapters(postName) {
    try {
        const res = await fetch(`${AUDIOBOOKS_API}/api/audiobooks/chapters/${postName}`);
        const data = await res.json();
        if (data.success) return data.data || [];
        return [];
    } catch (e) {
        console.error('[Audiobooks] Fetch chapters failed:', e);
        return [];
    }
}

// Open Audiobook Modal
async function openAudiobookModal(audiobook) {
    currentAudiobook = audiobook;
    
    let modal = document.getElementById('audiobookModal');
    if (!modal) {
        createAudiobookModal();
        modal = document.getElementById('audiobookModal');
    }
    
    document.getElementById('modalAudiobookPoster').src = audiobook.image || '';
    document.getElementById('modalAudiobookTitle').textContent = audiobook.title;
    document.getElementById('modalChaptersList').innerHTML = '<div class="spinner"></div>';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
        const chapters = await fetchChapters(audiobook.post_name);
        renderAudiobookChapters(chapters);
    } catch (error) {
        console.error('Error loading chapters:', error);
        document.getElementById('modalChaptersList').innerHTML = '<p>Error loading chapters.</p>';
    }
}

// Create Audiobook Modal
function createAudiobookModal() {
    const modal = document.createElement('div');
    modal.id = 'audiobookModal';
    modal.className = 'audiobook-modal';
    modal.innerHTML = `
        <div class="audiobook-modal-content">
            <button class="audiobook-modal-close" id="closeAudiobookModal">×</button>
            <div class="audiobook-modal-header">
                <img id="modalAudiobookPoster" class="modal-poster" src="" alt="">
                <div class="modal-info">
                    <h2 id="modalAudiobookTitle"></h2>
                </div>
            </div>
            <div class="chapters-container">
                <h3>Chapters</h3>
                <div class="chapters-list" id="modalChaptersList"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeAudiobookModal').addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Render Audiobook Chapters
function renderAudiobookChapters(chapters) {
    const list = document.getElementById('modalChaptersList');
    if (!list) {
        console.error('[Audiobooks] modalChaptersList element not found!');
        return;
    }
    
    list.innerHTML = '';
    
    console.log('[Audiobooks] Total chapters received:', chapters.length);
    
    const filteredChapters = chapters.filter(ch => !(ch.name === 'welcome' && ch.chapter_id === '0'));
    
    console.log('[Audiobooks] Filtered chapters:', filteredChapters.length);
    
    if (filteredChapters.length === 0) {
        list.innerHTML = '<p class="no-results">No chapters available</p>';
        return;
    }
    
    filteredChapters.forEach((chapter, index) => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        
        // Display the chapter name prominently, duration is secondary
        const chapterName = chapter.name || `Chapter ${chapter.track || index + 1}`;
        const chapterDuration = chapter.duration && chapter.duration !== 'Unknown' ? chapter.duration : '';
        
        console.log(`[Audiobooks] Rendering chapter ${index + 1}:`, chapterName);
        
        item.innerHTML = `
            <div class="chapter-number">${chapter.track || index + 1}</div>
            <div class="chapter-name">${chapterName}</div>
            ${chapterDuration ? `<div class="chapter-duration">${chapterDuration}</div>` : ''}
        `;
        item.addEventListener('click', () => playAudiobookChapter(chapter));
        list.appendChild(item);
    });
    
    console.log('[Audiobooks] Finished rendering chapters. List innerHTML length:', list.innerHTML.length);
}

// Get stream URL
async function getStreamUrl(chapterId, serverType = 1) {
    try {
        const res = await fetch(`${AUDIOBOOKS_API}/api/audiobooks/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapterId, serverType })
        });
        const data = await res.json();
        if (data.success && data.data) return data.data;
        return null;
    } catch (e) {
        console.error('[Audiobooks] Get stream failed:', e);
        return null;
    }
}

// Play Audiobook Chapter
async function playAudiobookChapter(chapter) {
    currentChapter = chapter;
    
    let player = document.getElementById('audiobookPlayer');
    if (!player) {
        createAudiobookPlayer();
        player = document.getElementById('audiobookPlayer');
    }

    document.getElementById('playerAudiobookTitle').textContent = currentAudiobook?.title || 'Audiobook';
    document.getElementById('playerChapterName').textContent = chapter.name || `Chapter ${chapter.track}`;
    document.getElementById('playerAudiobookCover').src = currentAudiobook?.image || '';
    
    player.classList.add('active');
    document.getElementById('audiobookModal').classList.remove('active');
    
    const audioElement = document.getElementById('audiobookAudio');
    audioElement.pause();
    
    document.getElementById('playerCurrentTime').textContent = '0:00';
    document.getElementById('playerDuration').textContent = '0:00';
    document.getElementById('playerProgress').style.width = '0%';
    
    const streamData = await getStreamUrl(chapter.chapter_id);
    if (!streamData || !streamData.link_mp3) {
        alert('Failed to get audio stream');
        return;
    }
    
    currentStreamUrl = streamData.link_mp3;
    audioElement.src = currentStreamUrl;
    audioElement.load();
    
    audioElement.addEventListener('canplay', () => {
        audioElement.play();
        updatePlayPauseIcon(true);
    }, { once: true });
    
    audioElement.addEventListener('loadedmetadata', () => {
        document.getElementById('playerDuration').textContent = formatDuration(audioElement.duration);
    }, { once: true });
}

// Create Audiobook Player
function createAudiobookPlayer() {
    const player = document.createElement('div');
    player.id = 'audiobookPlayer';
    player.className = 'audiobook-player';
    player.innerHTML = `
        <div class="player-content">
            <button class="player-close" id="playerCloseBtn">×</button>
            <div class="player-cover-container">
                <img id="playerAudiobookCover" class="player-cover" src="" alt="">
            </div>
            <div class="player-info">
                <h2 id="playerAudiobookTitle"></h2>
                <p id="playerChapterName"></p>
            </div>
            <div class="player-progress-container">
                <div class="player-progress-bar" id="playerProgressBar">
                    <div class="player-progress" id="playerProgress"></div>
                </div>
                <div class="player-time">
                    <span id="playerCurrentTime">0:00</span>
                    <span id="playerDuration">0:00</span>
                </div>
            </div>
            <div class="player-controls">
                <button class="player-btn" id="playerRewind" title="Rewind 10s">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
                </button>
                <button class="player-btn player-btn-large" id="playerPlayPause" title="Play/Pause">
                    <svg id="playerPlayIcon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg id="playerPauseIcon" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <button class="player-btn" id="playerForward" title="Forward 10s">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                </button>
            </div>
            <div class="player-volume-container">
                <button class="player-btn player-btn-small" id="playerMute" title="Mute/Unmute">
                    <svg id="playerVolumeIcon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    <svg id="playerMutedIcon" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                </button>
                <input type="range" id="playerVolume" class="player-volume-slider" min="0" max="100" value="100" title="Volume">
            </div>
            <div class="player-options">
                <select id="playerSpeed" class="player-speed" title="Playback Speed">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1" selected>1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
                <button class="player-btn player-btn-small" id="playerDownload" title="Download">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/></svg>
                </button>
            </div>
        </div>
        <audio id="audiobookAudio" preload="metadata"></audio>
    `;
    document.body.appendChild(player);

    initPlayerControls();
}

// Format Duration
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update Play/Pause Icon
function updatePlayPauseIcon(isPlaying) {
    const playIcon = document.getElementById('playerPlayIcon');
    const pauseIcon = document.getElementById('playerPauseIcon');
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// Initialize Player Controls
function initPlayerControls() {
    const audioElement = document.getElementById('audiobookAudio');
    const playerPlayPause = document.getElementById('playerPlayPause');
    const playerRewind = document.getElementById('playerRewind');
    const playerForward = document.getElementById('playerForward');
    const playerSpeed = document.getElementById('playerSpeed');
    const playerDownload = document.getElementById('playerDownload');
    const playerProgressBar = document.getElementById('playerProgressBar');
    const playerCloseBtn = document.getElementById('playerCloseBtn');
    const playerMute = document.getElementById('playerMute');
    const playerVolume = document.getElementById('playerVolume');
    const playerVolumeIcon = document.getElementById('playerVolumeIcon');
    const playerMutedIcon = document.getElementById('playerMutedIcon');

    playerPlayPause.addEventListener('click', () => {
        if (audioElement.paused) {
            audioElement.play();
            updatePlayPauseIcon(true);
        } else {
            audioElement.pause();
            updatePlayPauseIcon(false);
        }
    });

    playerRewind.addEventListener('click', () => {
        audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
    });

    playerForward.addEventListener('click', () => {
        audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + 10);
    });

    playerSpeed.addEventListener('change', () => {
        audioElement.playbackRate = parseFloat(playerSpeed.value);
    });

    // Volume controls
    playerMute.addEventListener('click', () => {
        if (audioElement.muted) {
            audioElement.muted = false;
            playerVolumeIcon.style.display = 'block';
            playerMutedIcon.style.display = 'none';
            playerVolume.value = audioElement.volume * 100;
        } else {
            audioElement.muted = true;
            playerVolumeIcon.style.display = 'none';
            playerMutedIcon.style.display = 'block';
        }
    });

    playerVolume.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        audioElement.volume = volume;
        audioElement.muted = false;
        
        if (volume === 0) {
            playerVolumeIcon.style.display = 'none';
            playerMutedIcon.style.display = 'block';
        } else {
            playerVolumeIcon.style.display = 'block';
            playerMutedIcon.style.display = 'none';
        }
    });

    playerDownload.addEventListener('click', () => {
        if (currentStreamUrl) {
            if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(currentStreamUrl);
            } else {
                window.open(currentStreamUrl, '_blank');
            }
        }
    });

    playerProgressBar.addEventListener('click', (e) => {
        const rect = playerProgressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = percent * audioElement.duration;
    });

    audioElement.addEventListener('timeupdate', () => {
        if (!audioElement.duration) return;
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        document.getElementById('playerProgress').style.width = `${percent}%`;
        document.getElementById('playerCurrentTime').textContent = formatDuration(audioElement.currentTime);
    });

    audioElement.addEventListener('ended', () => {
        updatePlayPauseIcon(false);
    });

    playerCloseBtn.addEventListener('click', () => {
        audioElement.pause();
        audioElement.src = '';
        document.getElementById('audiobookPlayer').classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}
