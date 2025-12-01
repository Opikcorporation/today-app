// ============================================
// TODAY - Timeline Module
// Renders chronological timeline of entries
// ============================================

const Timeline = {
    container: null,
    todayContainer: null,
    currentFilter: null,
    selectedDate: null, // New: track selected date from calendar

    init() {
        this.container = document.getElementById('timeline-container');
        this.todayContainer = document.getElementById('today-container');
        this.setupEditModal();
        this.renderToday(); // Start with today's view
    },

    setSelectedDate(date) {
        this.selectedDate = date;
        this.render();
    },

    clearSelectedDate() {
        this.selectedDate = null;
        this.render();
    },

    renderToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let entries = Storage.getEntriesByDateRange(today, tomorrow);
        
        // Sort by time (newest first)
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Update count
        const countEl = document.getElementById('today-count');
        if (countEl) {
            countEl.textContent = `${entries.length} entrée${entries.length !== 1 ? 's' : ''}`;
        }

        if (entries.length === 0) {
            this.todayContainer.innerHTML = `
                <div class="empty-state">
                    <p>Rien encore aujourd'hui.</p>
                    <p class="empty-hint">Commence par noter ce que tu as fait ↑</p>
                </div>
            `;
            return;
        }

        // Render entries without date groups
        this.todayContainer.innerHTML = '';
        entries.forEach(entry => {
            const entryEl = this.renderEntry(entry);
            this.todayContainer.appendChild(entryEl);
        });
    },

    render(entries = null) {
        if (!entries) {
            entries = Storage.getAllEntries();
        }

        // Filter by selected date if one is set
        if (this.selectedDate) {
            const selectedDateStr = new Date(this.selectedDate).toLocaleDateString('fr-FR');
            entries = entries.filter(entry => {
                const entryDateStr = new Date(entry.timestamp).toLocaleDateString('fr-FR');
                return entryDateStr === selectedDateStr;
            });
        }

        // Sort by date (newest first)
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Update count
        const countEl = document.getElementById('timeline-count');
        if (countEl) {
            countEl.textContent = `${entries.length} entrée${entries.length !== 1 ? 's' : ''}`;
        }

        if (entries.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Group by date
        const grouped = this.groupByDate(entries);

        // Render
        this.container.innerHTML = '';

        for (const [dateKey, dateEntries] of Object.entries(grouped)) {
            this.renderDateGroup(dateKey, dateEntries);
        }
    },

    groupByDate(entries) {
        const groups = {};

        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const dateKey = date.toLocaleDateString('fr-FR');

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push(entry);
        });

        return groups;
    },

    renderDateGroup(dateKey, entries) {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';

        // Date header
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';

        const firstEntry = entries[0];
        const date = new Date(firstEntry.timestamp);
        const isToday = DateParser.isToday(date);

        if (isToday) {
            dateHeader.classList.add('today');
        }

        dateHeader.textContent = DateParser.getRelativeLabel(date);

        dateGroup.appendChild(dateHeader);

        // Entries
        entries.forEach(entry => {
            const entryEl = this.renderEntry(entry);
            dateGroup.appendChild(entryEl);
        });

        this.container.appendChild(dateGroup);
    },

    renderEntry(entry) {
        const entryEl = document.createElement('div');
        entryEl.className = 'timeline-entry';
        if (entry.highlighted) {
            entryEl.classList.add('highlighted');
        }
        entryEl.dataset.id = entry.id;

        // Time
        const time = document.createElement('div');
        time.className = 'entry-time';
        const date = new Date(entry.timestamp);
        time.textContent = DateParser.formatDate(date, 'time');
        entryEl.appendChild(time);

        // Title (if exists)
        if (entry.title) {
            const title = document.createElement('div');
            title.className = 'entry-title';
            title.textContent = entry.title;
            entryEl.appendChild(title);
        }

        // Description/Text
        const text = document.createElement('div');
        text.className = 'entry-text';
        text.textContent = entry.text;
        entryEl.appendChild(text);

        // Tags
        if (entry.tags && entry.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'entry-tags';

            entry.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'entry-tag';
                tagEl.textContent = `#${tag}`;
                tagEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.Search) {
                        Search.addTagFilter(tag);
                    }
                });
                tagsContainer.appendChild(tagEl);
            });

            entryEl.appendChild(tagsContainer);
        }

        // Actions
        const actions = document.createElement('div');
        actions.className = 'entry-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'entry-action-btn';
        editBtn.textContent = 'Modifier';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editEntry(entry.id);
        });

        const highlightBtn = document.createElement('button');
        highlightBtn.className = 'entry-action-btn';
        highlightBtn.textContent = entry.highlighted ? '★' : '☆';
        highlightBtn.title = entry.highlighted ? 'Retirer l\'étoile' : 'Mettre en favoris';
        highlightBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleHighlight(entry.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'entry-action-btn';
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteEntry(entry.id);
        });

        actions.appendChild(editBtn);
        actions.appendChild(highlightBtn);
        actions.appendChild(deleteBtn);

        entryEl.appendChild(actions);

        return entryEl;
    },

    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <p>Aucune entrée pour le moment.</p>
                <p class="empty-hint">Commence par noter ce que tu as fait aujourd'hui ↑</p>
            </div>
        `;
    },

    setupEditModal() {
        this.modal = document.getElementById('edit-modal');
        this.modalOverlay = this.modal.querySelector('.modal-overlay');
        this.closeModalBtn = document.getElementById('close-modal');
        this.cancelEditBtn = document.getElementById('cancel-edit');
        this.saveEditBtn = document.getElementById('save-edit');
        this.editTitleInput = document.getElementById('edit-title');
        this.editDescriptionInput = document.getElementById('edit-description');

        this.currentEditId = null;

        // Close modal listeners
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', () => this.closeModal());

        // Save edit listener
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    },

    openModal(entry) {
        this.currentEditId = entry.id;
        this.editTitleInput.value = entry.title || '';
        this.editDescriptionInput.value = entry.text || '';
        this.modal.classList.remove('hidden');
        this.editTitleInput.focus();
    },

    closeModal() {
        this.modal.classList.add('hidden');
        this.currentEditId = null;
        this.editTitleInput.value = '';
        this.editDescriptionInput.value = '';
    },

    saveEdit() {
        if (!this.currentEditId) return;

        const title = this.editTitleInput.value.trim();
        const description = this.editDescriptionInput.value.trim();

        if (!description) {
            alert('La description ne peut pas être vide');
            return;
        }

        Storage.updateEntry(this.currentEditId, {
            title: title,
            text: description
        });

        this.closeModal();
        this.render();
    },

    editEntry(id) {
        const entry = Storage.getAllEntries().find(e => e.id === id);
        if (!entry) return;

        this.openModal(entry);
    },

    deleteEntry(id) {
        if (confirm('Supprimer cette entrée ?')) {
            Storage.deleteEntry(id);
            this.render();
        }
    },

    toggleHighlight(id) {
        Storage.toggleHighlight(id);
        // Refresh current view
        if (window.App && App.currentView === 'today') {
            this.renderToday();
        } else {
            this.render();
        }
    },

    scrollToDate(date) {
        const dateKey = new Date(date).toLocaleDateString('fr-FR');
        const dateHeaders = this.container.querySelectorAll('.date-header');

        for (const header of dateHeaders) {
            if (header.textContent.includes(dateKey) ||
                DateParser.getRelativeLabel(date) === header.textContent) {
                header.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Highlight briefly
                header.style.color = 'var(--color-accent)';
                setTimeout(() => {
                    header.style.color = '';
                }, 2000);

                break;
            }
        }
    }
};
