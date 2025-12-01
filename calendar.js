// ============================================
// TODAY - Calendar Module
// Monthly calendar with activity indicators
// ============================================

const Calendar = {
    container: null,
    monthYearDisplay: null,
    prevBtn: null,
    nextBtn: null,

    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDay: null,

    weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    monthNames: [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],

    init() {
        this.container = document.getElementById('calendar-grid');
        this.monthYearDisplay = document.getElementById('calendar-month-year');
        this.prevBtn = document.getElementById('prev-month');
        this.nextBtn = document.getElementById('next-month');
        this.clearFilterBtn = document.getElementById('clear-date-filter');

        this.attachEventListeners();
        this.render();
    },

    attachEventListeners() {
        this.prevBtn.addEventListener('click', () => {
            this.previousMonth();
        });

        this.nextBtn.addEventListener('click', () => {
            this.nextMonth();
        });

        // Clear date filter button
        if (this.clearFilterBtn) {
            this.clearFilterBtn.addEventListener('click', () => {
                this.clearSelection();
            });
        }
    },

    clearSelection() {
        this.selectedDay = null;
        this.render();
        
        // Hide clear button
        if (this.clearFilterBtn) {
            this.clearFilterBtn.classList.add('hidden');
        }

        // Clear timeline filter
        if (window.Timeline) {
            Timeline.clearSelectedDate();
        }
    },

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    },

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    },

    render() {
        this.updateHeader();
        this.renderGrid();
    },

    updateHeader() {
        this.monthYearDisplay.textContent =
            `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
    },

    renderGrid() {
        this.container.innerHTML = '';

        // Render weekday headers
        this.weekdaysShort.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            this.container.appendChild(header);
        });

        // Get entries for this month
        const entries = Storage.getEntriesByMonth(this.currentYear, this.currentMonth);
        const entriesByDay = this.groupEntriesByDay(entries);

        // Calculate first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

        const today = new Date();

        // Render previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayEl = this.createDayElement(day, true, false, 0);
            this.container.appendChild(dayEl);
        }

        // Render current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday =
                day === today.getDate() &&
                this.currentMonth === today.getMonth() &&
                this.currentYear === today.getFullYear();

            const entryCount = entriesByDay[day] || 0;
            const dayEl = this.createDayElement(day, false, isToday, entryCount);

            // Add click handler
            dayEl.addEventListener('click', () => {
                this.onDayClick(day);
            });

            this.container.appendChild(dayEl);
        }

        // Render next month's leading days
        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days

        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = this.createDayElement(day, true, false, 0);
            this.container.appendChild(dayEl);
        }
    },

    createDayElement(day, isOtherMonth, isToday, entryCount) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';

        if (isOtherMonth) {
            dayEl.classList.add('other-month');
        }

        if (isToday) {
            dayEl.classList.add('today');
        }

        if (this.selectedDay === day && !isOtherMonth) {
            dayEl.classList.add('selected');
        }

        if (entryCount > 0) {
            dayEl.classList.add('has-entries');
            dayEl.dataset.count = entryCount;
        }

        dayEl.textContent = day;

        return dayEl;
    },

    groupEntriesByDay(entries) {
        const grouped = {};

        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const day = date.getDate();

            if (!grouped[day]) {
                grouped[day] = 0;
            }

            grouped[day]++;
        });

        return grouped;
    },

    onDayClick(day) {
        const date = new Date(this.currentYear, this.currentMonth, day);

        // Update selected day
        this.selectedDay = day;
        this.render();

        // Show clear filter button
        if (this.clearFilterBtn) {
            this.clearFilterBtn.classList.remove('hidden');
        }

        // Switch to timeline view and filter by date
        if (window.Timeline && window.App) {
            // Switch to timeline tab
            const timelineTab = document.querySelector('[data-view="timeline"]');
            if (timelineTab) {
                timelineTab.click();
            }

            // Set selected date in Timeline to filter entries
            Timeline.setSelectedDate(date);
        }
    }
};
