// ============================================
// TODAY - Search Module
// Full-text search and tag filtering
// ============================================

const Search = {
    searchInput: null,
    activeTagsContainer: null,
    activeFilters: new Set(),
    currentPeriodFilter: 'all',

    init() {
        this.searchInput = document.getElementById('search-input');
        this.activeTagsContainer = document.getElementById('active-tags');

        this.attachEventListeners();
        this.setupQuickFilters();
    },

    attachEventListeners() {
        // Search on input with debounce
        let searchTimeout;
        this.searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 300);
        });

        // Clear search on Escape
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.searchInput.value = '';
                this.performSearch();
            }
        });
    },

    setupQuickFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Apply filter
                const filterType = btn.dataset.filter;
                this.currentPeriodFilter = filterType;
                this.performSearch();
            });
        });
    },

    performSearch() {
        const query = this.searchInput.value.trim();
        let results = Storage.getAllEntries();

        // Apply period filter
        if (this.currentPeriodFilter !== 'all') {
            const now = new Date();
            let startDate;

            switch (this.currentPeriodFilter) {
                case 'today':
                    startDate = new Date(now);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now);
                    startDate.setDate(startDate.getDate() - 30);
                    break;
            }

            if (startDate) {
                results = results.filter(entry => {
                    return new Date(entry.timestamp) >= startDate;
                });
            }
        }

        // Apply text search
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(entry =>
                (entry.text && entry.text.toLowerCase().includes(lowerQuery)) ||
                (entry.title && entry.title.toLowerCase().includes(lowerQuery)) ||
                entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }

        // Apply tag filters
        if (this.activeFilters.size > 0) {
            results = results.filter(entry => {
                return Array.from(this.activeFilters).every(tag =>
                    entry.tags.includes(tag)
                );
            });
        }

        // Update appropriate view with filtered results
        if (window.Timeline && window.App) {
            if (App.currentView === 'today') {
                Timeline.renderToday();
            } else {
                Timeline.render(results);
            }
        }
    },

    addTagFilter(tag) {
        this.activeFilters.add(tag);
        this.renderActiveFilters();
        this.performSearch();
    },

    removeTagFilter(tag) {
        this.activeFilters.delete(tag);
        this.renderActiveFilters();
        this.performSearch();
    },

    clearAllFilters() {
        this.activeFilters.clear();
        this.searchInput.value = '';
        this.renderActiveFilters();
        this.performSearch();
    },

    renderActiveFilters() {
        this.activeTagsContainer.innerHTML = '';

        if (this.activeFilters.size === 0) {
            return;
        }

        this.activeFilters.forEach(tag => {
            const filterEl = document.createElement('button');
            filterEl.className = 'tag-filter';
            filterEl.innerHTML = `#${tag} <span>×</span>`;

            filterEl.addEventListener('click', () => {
                this.removeTagFilter(tag);
            });

            this.activeTagsContainer.appendChild(filterEl);
        });

        // Add clear all button
        if (this.activeFilters.size > 1) {
            const clearBtn = document.createElement('button');
            clearBtn.className = 'tag-filter';
            clearBtn.textContent = 'Tout effacer';
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
            this.activeTagsContainer.appendChild(clearBtn);
        }
    }
};
