// ============================================
// TODAY - Input Module
// Handles quick input with auto-save and smart parsing
// ============================================

const Input = {
    inputField: null,
    datePickerBtn: null,
    manualPicker: null,
    manualDate: null,
    manualTime: null,
    applyBtn: null,
    cancelBtn: null,

    manualTimestamp: null,
    saveTimeout: null,

    init() {
        this.inputField = document.getElementById('quick-input');
        this.datePickerBtn = document.getElementById('date-picker-btn');
        this.manualPicker = document.getElementById('manual-picker');
        this.manualDate = document.getElementById('manual-date');
        this.manualTime = document.getElementById('manual-time');
        this.applyBtn = document.getElementById('apply-manual-date');
        this.cancelBtn = document.getElementById('cancel-manual-date');

        this.attachEventListeners();
    },

    attachEventListeners() {
        // Auto-save on Enter key
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveEntry();
            }
            // Shift+Enter for new line (default behavior)
        });

        // Escape to clear
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.inputField.value = '';
                this.manualTimestamp = null;
                this.hideManualPicker();
            }
        });

        // Auto-save on blur (after a delay)
        this.inputField.addEventListener('blur', () => {
            if (this.inputField.value.trim()) {
                clearTimeout(this.saveTimeout);
                this.saveTimeout = setTimeout(() => {
                    this.saveEntry();
                }, 500);
            }
        });

        // Date picker toggle
        this.datePickerBtn.addEventListener('click', () => {
            this.toggleManualPicker();
        });

        // Apply manual date
        this.applyBtn.addEventListener('click', () => {
            this.applyManualDate();
        });

        // Cancel manual date
        this.cancelBtn.addEventListener('click', () => {
            this.hideManualPicker();
        });

        // Focus input on load
        this.inputField.focus();
    },

    saveEntry() {
        const text = this.inputField.value.trim();

        if (!text) {
            return;
        }

        // Parse the text for date/time and hashtags
        const parsed = DateParser.parse(text);
        const tags = DateParser.extractHashtags(text);

        // Use manual timestamp if set, otherwise use parsed date
        const timestamp = this.manualTimestamp || parsed.date;

        // Clean the text (remove date info and hashtags)
        let cleanText = parsed.cleanedText;
        cleanText = DateParser.removeHashtags(cleanText);

        // Save to storage
        const entry = Storage.addEntry(cleanText, timestamp, tags);

        // Clear input
        this.inputField.value = '';
        this.manualTimestamp = null;
        this.hideManualPicker();

        // Refresh appropriate view
        if (window.Timeline && window.App) {
            if (App.currentView === 'today') {
                Timeline.renderToday();
            } else {
                Timeline.render();
            }
        }

        // Show feedback (subtle animation with sound)
        this.showSaveFeedback();

        // Re-focus input
        this.inputField.focus();
    },

    toggleManualPicker() {
        if (this.manualPicker.classList.contains('hidden')) {
            this.showManualPicker();
        } else {
            this.hideManualPicker();
        }
    },

    showManualPicker() {
        // Set default values to now
        const now = new Date();

        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().substring(0, 5);

        this.manualDate.value = dateStr;
        this.manualTime.value = timeStr;

        this.manualPicker.classList.remove('hidden');
    },

    hideManualPicker() {
        this.manualPicker.classList.add('hidden');
        this.manualTimestamp = null;
    },

    applyManualDate() {
        const dateValue = this.manualDate.value;
        const timeValue = this.manualTime.value;

        if (dateValue && timeValue) {
            const [hours, minutes] = timeValue.split(':');
            const date = new Date(dateValue);
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            this.manualTimestamp = date;
            this.hideManualPicker();

            // Visual feedback
            this.datePickerBtn.style.borderColor = 'var(--color-accent)';
            setTimeout(() => {
                this.datePickerBtn.style.borderColor = '';
            }, 1000);

            this.inputField.focus();
        }
    },

    showSaveFeedback() {
        // Subtle border flash
        this.inputField.style.borderColor = 'var(--color-accent)';
        setTimeout(() => {
            this.inputField.style.borderColor = '';
        }, 300);

        // Show toast notification
        this.showToast('Entrée sauvegardée !');
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.remove('hidden');
            
            // Trigger reflow for animation
            toast.offsetHeight;
            toast.classList.add('show');

            // Hide after 2 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 250);
            }, 2000);
        }
    }
};
