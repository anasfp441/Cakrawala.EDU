// Ebook Online JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentPage = 0;
    let fontSize = 16;
    let isDarkTheme = false;
    
    // DOM elements
    const bookContent = document.getElementById('book-content');
    const chapters = document.querySelectorAll('.chapter');
    const fontDecreaseBtn = document.getElementById('font-decrease');
    const fontIncreaseBtn = document.getElementById('font-increase');
    const fontSizeDisplay = document.querySelector('.font-size-display');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const fullscreenBtn = document.getElementById('fullscreen');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.querySelector('.page-info');
    
    // Initialize the page
    init();
    
    function init() {
        // Load saved preferences
        loadPreferences();
        
        // Set initial state
        updatePageDisplay();
        updateFontSize();
        updateTheme();
        
        // Add event listeners
        addEventListeners();
        
        // Show first page
        showPage(0);
    }
    
    function addEventListeners() {
        // Font size controls
        fontDecreaseBtn.addEventListener('click', decreaseFontSize);
        fontIncreaseBtn.addEventListener('click', increaseFontSize);
        
        // Theme toggle
        themeToggleBtn.addEventListener('click', toggleTheme);
        
        // Fullscreen
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        
        // Navigation
        prevPageBtn.addEventListener('click', previousPage);
        nextPageBtn.addEventListener('click', nextPage);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
        
        // Save preferences on change
        window.addEventListener('beforeunload', savePreferences);
    }
    
    // Font size controls
    function decreaseFontSize() {
        if (fontSize > 12) {
            fontSize -= 2;
            updateFontSize();
        }
    }
    
    function increaseFontSize() {
        if (fontSize < 24) {
            fontSize += 2;
            updateFontSize();
        }
    }
    
    function updateFontSize() {
        bookContent.style.fontSize = fontSize + 'px';
        fontSizeDisplay.textContent = fontSize + 'px';
        
        // Update chapter headings
        const chapterHeadings = document.querySelectorAll('.chapter h2');
        chapterHeadings.forEach(heading => {
            heading.style.fontSize = (fontSize * 1.2) + 'px';
        });
    }
    
    // Theme toggle
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        updateTheme();
        
        // Update icon
        const icon = themeToggleBtn.querySelector('i');
        if (isDarkTheme) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
    
    function updateTheme() {
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
    
    // Fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // Page navigation
    function showPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= chapters.length) return;
        
        // Hide all chapters
        chapters.forEach(chapter => {
            chapter.style.display = 'none';
        });
        
        // Show current chapter
        chapters[pageIndex].style.display = 'block';
        currentPage = pageIndex;
        
        // Update navigation
        updatePageDisplay();
        updateNavigationButtons();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function previousPage() {
        if (currentPage > 0) {
            showPage(currentPage - 1);
        }
    }
    
    function nextPage() {
        if (currentPage < chapters.length - 1) {
            showPage(currentPage + 1);
        }
    }
    
    function updatePageDisplay() {
        pageInfo.innerHTML = `<span>Halaman ${currentPage + 1} dari ${chapters.length}</span>`;
    }
    
    function updateNavigationButtons() {
        prevPageBtn.disabled = currentPage === 0;
        nextPageBtn.disabled = currentPage === chapters.length - 1;
    }
    
    // Keyboard shortcuts
    function handleKeyboard(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                previousPage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                nextPage();
                break;
            case 'f':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    toggleFullscreen();
                }
                break;
            case 't':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    toggleTheme();
                }
                break;
            case '+':
            case '=':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    increaseFontSize();
                }
                break;
            case '-':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    decreaseFontSize();
                }
                break;
        }
    }
    
    // Preferences management
    function savePreferences() {
        const preferences = {
            fontSize: fontSize,
            isDarkTheme: isDarkTheme,
            currentPage: currentPage
        };
        localStorage.setItem('ebook-preferences', JSON.stringify(preferences));
    }
    
    function loadPreferences() {
        const saved = localStorage.getItem('ebook-preferences');
        if (saved) {
            try {
                const preferences = JSON.parse(saved);
                fontSize = preferences.fontSize || 16;
                isDarkTheme = preferences.isDarkTheme || false;
                currentPage = preferences.currentPage || 0;
            } catch (e) {
                console.log('Error loading preferences:', e);
            }
        }
    }
    
    // Auto-save preferences
    setInterval(savePreferences, 5000);
    
    // Reading progress tracking
    function trackReadingProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // Save reading progress
        localStorage.setItem('reading-progress', scrollPercent);
    }
    
    // Track scroll for reading progress
    window.addEventListener('scroll', trackReadingProgress);
    
    // Bookmark functionality
    function addBookmark() {
        const bookmark = {
            page: currentPage,
            timestamp: new Date().toISOString(),
            scrollPosition: window.pageYOffset
        };
        
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        bookmarks.push(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        
        // Show success message
        showNotification('Bookmark berhasil ditambahkan!');
    }
    
    // Share functionality
    function shareBook() {
        if (navigator.share) {
            navigator.share({
                title: 'Petualangan di Dunia Digital',
                text: 'Baca ebook menarik tentang teknologi dan produktivitas digital',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                showNotification('Link berhasil disalin ke clipboard!');
            });
        }
    }
    
    // Notification system
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add bookmark and share functionality to buttons
    const bookmarkBtn = document.querySelector('.btn-primary');
    const shareBtn = document.querySelector('.btn-secondary');
    
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', addBookmark);
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', shareBook);
    }
    
    // Reading time estimation
    function estimateReadingTime() {
        const text = bookContent.textContent;
        const words = text.trim().split(/\s+/).length;
        const wordsPerMinute = 200; // Average reading speed
        const minutes = Math.ceil(words / wordsPerMinute);
        
        // Update the reading time display
        const readingTimeElement = document.querySelector('.meta-item:first-child');
        if (readingTimeElement) {
            readingTimeElement.innerHTML = `<i class="fas fa-clock"></i> ${minutes} menit baca`;
        }
    }
    
    // Calculate reading time after content loads
    setTimeout(estimateReadingTime, 1000);
    
    // Smooth page transitions
    function smoothPageTransition(direction) {
        const currentChapter = chapters[currentPage];
        const nextChapter = direction === 'next' ? chapters[currentPage + 1] : chapters[currentPage - 1];
        
        if (currentChapter && nextChapter) {
            currentChapter.style.opacity = '0';
            currentChapter.style.transform = `translateX(${direction === 'next' ? '-100%' : '100%'})`;
            
            setTimeout(() => {
                showPage(direction === 'next' ? currentPage + 1 : currentPage - 1);
                nextChapter.style.opacity = '1';
                nextChapter.style.transform = 'translateX(0)';
            }, 300);
        }
    }
    
    // Enhanced navigation with smooth transitions
    const originalNextPage = nextPage;
    const originalPrevPage = previousPage;
    
    nextPage = function() {
        if (currentPage < chapters.length - 1) {
            smoothPageTransition('next');
        }
    };
    
    previousPage = function() {
        if (currentPage > 0) {
            smoothPageTransition('prev');
        }
    };
    
    // Add CSS for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
        .chapter {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .notification {
            font-family: 'Inter', sans-serif;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize smooth transitions
    chapters.forEach(chapter => {
        chapter.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
    
    // Console welcome message
    console.log(`
    📚 Selamat datang di Ebook Online!
    
    Keyboard shortcuts:
    - ← → : Navigasi halaman
    - Ctrl/Cmd + F : Fullscreen
    - Ctrl/Cmd + T : Toggle tema
    - Ctrl/Cmd + +/- : Ubah ukuran font
    
    Happy reading! 🎉
    `);
});