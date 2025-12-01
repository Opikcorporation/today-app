// ============================================
// TODAY - Storage Module
// Handles all localStorage operations
// ============================================

const Storage = {
    STORAGE_KEY: 'today_entries',
    SETTINGS_KEY: 'today_settings',

    // Initialize storage
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.SETTINGS_KEY)) {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({
                theme: 'light',
                lastBackup: null
            }));
        }
    },

    // Get all entries
    getAllEntries() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return JSON.parse(data) || [];
        } catch (error) {
            console.error('Error reading entries:', error);
            return [];
        }
    },

    // Add new entry
    addEntry(text, timestamp = new Date(), tags = []) {
        const entries = this.getAllEntries();

        // Parse title and description from text (format: "Title | Description" or just "Description")
        let title = '';
        let description = text.trim();

        if (text.includes('|')) {
            const parts = text.split('|');
            title = parts[0].trim();
            description = parts.slice(1).join('|').trim();
        }

        const newEntry = {
            id: this.generateId(),
            title: title,
            text: description,
            timestamp: timestamp.toISOString(),
            tags: tags,
            createdAt: new Date().toISOString(),
            highlighted: false
        };

        entries.push(newEntry);
        this.saveEntries(entries);
        return newEntry;
    },

    // Update entry
    updateEntry(id, updates) {
        const entries = this.getAllEntries();
        const index = entries.findIndex(e => e.id === id);

        if (index !== -1) {
            entries[index] = { ...entries[index], ...updates };
            this.saveEntries(entries);
            return entries[index];
        }
        return null;
    },

    // Delete entry
    deleteEntry(id) {
        const entries = this.getAllEntries();
        const filtered = entries.filter(e => e.id !== id);
        this.saveEntries(filtered);
        return filtered.length < entries.length;
    },

    // Toggle highlight
    toggleHighlight(id) {
        const entries = this.getAllEntries();
        const entry = entries.find(e => e.id === id);

        if (entry) {
            entry.highlighted = !entry.highlighted;
            this.saveEntries(entries);
            return entry.highlighted;
        }
        return false;
    },

    // Save entries to localStorage
    saveEntries(entries) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
            return true;
        } catch (error) {
            console.error('Error saving entries:', error);
            return false;
        }
    },

    // Get entries by date range
    getEntriesByDateRange(startDate, endDate) {
        const entries = this.getAllEntries();
        return entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startDate && entryDate <= endDate;
        });
    },

    // Get entries by month
    getEntriesByMonth(year, month) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        return this.getEntriesByDateRange(startDate, endDate);
    },

    // Get entries by tag
    getEntriesByTag(tag) {
        const entries = this.getAllEntries();
        return entries.filter(entry => entry.tags.includes(tag));
    },

    // Search entries
    searchEntries(query) {
        const entries = this.getAllEntries();
        const lowerQuery = query.toLowerCase();

        return entries.filter(entry =>
            entry.text.toLowerCase().includes(lowerQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    },

    // Get all unique tags
    getAllTags() {
        const entries = this.getAllEntries();
        const tagsSet = new Set();

        entries.forEach(entry => {
            entry.tags.forEach(tag => tagsSet.add(tag));
        });

        return Array.from(tagsSet).sort();
    },

    // Get settings
    getSettings() {
        try {
            const data = localStorage.getItem(this.SETTINGS_KEY);
            return JSON.parse(data) || {};
        } catch (error) {
            console.error('Error reading settings:', error);
            return {};
        }
    },

    // Update settings
    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };

        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
            return newSettings;
        } catch (error) {
            console.error('Error saving settings:', error);
            return settings;
        }
    },

    // Export data as JSON
    exportAsJSON() {
        const data = {
            entries: this.getAllEntries(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(data, null, 2);
    },

    // Export data as CSV
    exportAsCSV() {
        const entries = this.getAllEntries();
        const headers = ['Date', 'Time', 'Text', 'Tags'];
        const rows = entries.map(entry => {
            const date = new Date(entry.timestamp);
            return [
                date.toLocaleDateString('fr-FR'),
                date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                `"${entry.text.replace(/"/g, '""')}"`,
                entry.tags.join(', ')
            ];
        });

        const csv = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        return csv;
    },

    // Export data as plain text
    exportAsText() {
        const entries = this.getAllEntries();
        const sortedEntries = entries.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        let text = 'TODAY - Mes Accomplissements\n';
        text += '================================\n\n';

        let currentDate = null;

        sortedEntries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const dateStr = date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (dateStr !== currentDate) {
                currentDate = dateStr;
                text += `\n${dateStr.toUpperCase()}\n`;
                text += '--------------------------------\n';
            }

            const timeStr = date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            text += `${timeStr} - ${entry.text}`;
            if (entry.tags.length > 0) {
                text += ` [${entry.tags.join(', ')}]`;
            }
            text += '\n';
        });

        return text;
    },

    // Download file
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Import data from JSON
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            if (data.entries && Array.isArray(data.entries)) {
                this.saveEntries(data.entries);
            }

            if (data.settings) {
                this.updateSettings(data.settings);
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    // Generate unique ID
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Clear all data (for testing)
    clearAll() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.SETTINGS_KEY);
            this.init();
            return true;
        }
        return false;
    }
};

// Initialize storage on load
Storage.init();
