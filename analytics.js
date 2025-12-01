// ============================================
// TODAY - Analytics Module
// Monthly statistics and visualizations
// ============================================

const Analytics = {
    volumeStat: null,
    heatmapContainer: null,
    distributionChart: null,
    distributionLegend: null,
    topHighlights: null,
    monthSelector: null,

    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),

    monthNames: [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],

    init() {
        this.volumeStat = document.getElementById('volume-stat');
        this.heatmapContainer = document.getElementById('heatmap-container');
        this.distributionChart = document.getElementById('distribution-chart');
        this.distributionLegend = document.getElementById('distribution-legend');
        this.topHighlights = document.getElementById('top-highlights');
        this.monthSelector = document.getElementById('stats-month-selector');

        this.populateMonthSelector();
        this.attachEventListeners();
        this.render();
    },

    attachEventListeners() {
        this.monthSelector.addEventListener('change', (e) => {
            const [year, month] = e.target.value.split('-');
            this.currentYear = parseInt(year);
            this.currentMonth = parseInt(month);
            this.render();
        });
    },

    populateMonthSelector() {
        const entries = Storage.getAllEntries();

        if (entries.length === 0) {
            return;
        }

        // Get unique months from entries
        const months = new Set();
        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            months.add(key);
        });

        // Add current month if not present
        const currentKey = `${this.currentYear}-${this.currentMonth}`;
        months.add(currentKey);

        // Sort and populate
        const sortedMonths = Array.from(months).sort().reverse();

        sortedMonths.forEach(key => {
            const [year, month] = key.split('-');
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${this.monthNames[parseInt(month)]} ${year}`;

            if (key === currentKey) {
                option.selected = true;
            }

            this.monthSelector.appendChild(option);
        });
    },

    render() {
        const entries = Storage.getEntriesByMonth(this.currentYear, this.currentMonth);

        this.renderVolume(entries);
        this.renderHeatmap(entries);
        this.renderDistribution(entries);
        this.renderTopHighlights(entries);
    },

    renderVolume(entries) {
        this.volumeStat.textContent = entries.length;
    },

    renderHeatmap(entries) {
        this.heatmapContainer.innerHTML = '';

        // Get days in month
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Count entries per day
        const entriesPerDay = {};
        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const day = date.getDate();

            if (!entriesPerDay[day]) {
                entriesPerDay[day] = 0;
            }
            entriesPerDay[day]++;
        });

        // Find max for scaling
        const maxEntries = Math.max(...Object.values(entriesPerDay), 1);

        // Render heatmap
        for (let day = 1; day <= daysInMonth; day++) {
            const count = entriesPerDay[day] || 0;
            const level = this.getHeatLevel(count, maxEntries);

            const dayEl = document.createElement('div');
            dayEl.className = 'heatmap-day';
            dayEl.dataset.level = level;
            dayEl.title = `${day}: ${count} entrée(s)`;

            this.heatmapContainer.appendChild(dayEl);
        }
    },

    getHeatLevel(count, max) {
        if (count === 0) return 0;

        const ratio = count / max;

        if (ratio >= 0.8) return 5;
        if (ratio >= 0.6) return 4;
        if (ratio >= 0.4) return 3;
        if (ratio >= 0.2) return 2;
        return 1;
    },

    renderDistribution(entries) {
        // Count entries by tag
        const tagCounts = {};
        let untaggedCount = 0;

        entries.forEach(entry => {
            if (entry.tags.length === 0) {
                untaggedCount++;
            } else {
                entry.tags.forEach(tag => {
                    if (!tagCounts[tag]) {
                        tagCounts[tag] = 0;
                    }
                    tagCounts[tag]++;
                });
            }
        });

        // Sort tags by count
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Top 5 tags

        // Add untagged if present
        if (untaggedCount > 0) {
            sortedTags.push(['Sans tag', untaggedCount]);
        }

        // Draw pie chart
        this.drawPieChart(sortedTags);
        this.renderLegend(sortedTags);
    },

    drawPieChart(data) {
        const canvas = this.distributionChart;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        if (data.length === 0) {
            ctx.clearRect(0, 0, size, size);
            return;
        }

        const total = data.reduce((sum, [, count]) => sum + count, 0);
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 10;

        // Colors
        const colors = this.generateColors(data.length);

        let currentAngle = -Math.PI / 2; // Start at top

        data.forEach(([tag, count], index) => {
            const sliceAngle = (count / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();

            ctx.fillStyle = colors[index];
            ctx.fill();

            ctx.strokeStyle = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-bg').trim();
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });
    },

    generateColors(count) {
        const colors = [];
        const baseHue = 220; // Blue

        for (let i = 0; i < count; i++) {
            const hue = (baseHue + (i * 360 / count)) % 360;
            const saturation = 70;
            const lightness = 50 + (i % 2) * 10;
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }

        return colors;
    },

    renderLegend(data) {
        this.distributionLegend.innerHTML = '';

        if (data.length === 0) {
            this.distributionLegend.textContent = 'Aucune donnée';
            return;
        }

        const colors = this.generateColors(data.length);

        data.forEach(([tag, count], index) => {
            const item = document.createElement('div');
            item.className = 'legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = colors[index];

            const label = document.createElement('span');
            label.textContent = `${tag} (${count})`;

            item.appendChild(colorBox);
            item.appendChild(label);

            this.distributionLegend.appendChild(item);
        });
    },

    renderTopHighlights(entries) {
        this.topHighlights.innerHTML = '';

        // Get highlighted entries
        const highlighted = entries.filter(e => e.highlighted);

        // If less than 3 highlighted, add random ones
        const remaining = 3 - highlighted.length;
        if (remaining > 0 && entries.length > highlighted.length) {
            const nonHighlighted = entries.filter(e => !e.highlighted);
            const shuffled = nonHighlighted.sort(() => Math.random() - 0.5);
            highlighted.push(...shuffled.slice(0, remaining));
        }

        // Take top 3
        const top3 = highlighted.slice(0, 3);

        if (top3.length === 0) {
            this.topHighlights.innerHTML = '<p class="empty-hint">Aucun accomplissement ce mois</p>';
            return;
        }

        top3.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'highlight-item';

            const text = document.createElement('div');
            text.className = 'highlight-text';
            text.textContent = entry.text;

            const date = document.createElement('div');
            date.className = 'highlight-date';
            date.textContent = DateParser.formatDate(entry.timestamp, 'datetime');

            item.appendChild(text);
            item.appendChild(date);

            this.topHighlights.appendChild(item);
        });
    }
};
