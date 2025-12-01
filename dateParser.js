// ============================================
// TODAY - Date Parser Module
// Natural language date/time parsing for French
// ============================================

const DateParser = {

    // Main parsing function
    parse(text) {
        const result = {
            date: new Date(),
            cleanedText: text,
            matched: false
        };

        // Try different parsing strategies
        const strategies = [
            this.parseRelativeDays,
            this.parseRelativeTime,
            this.parseWeekday,
            this.parseSpecificDate,
            this.parseTimeOnly
        ];

        for (const strategy of strategies) {
            const parsed = strategy.call(this, text);
            if (parsed.matched) {
                return parsed;
            }
        }

        return result;
    },

    // Parse relative days (hier, aujourd'hui, avant-hier)
    parseRelativeDays(text) {
        const patterns = [
            { regex: /\b(hier|yesterday)\s+(?:à\s+)?(\d{1,2})h?(\d{2})?\b/i, days: -1 },
            { regex: /\b(avant[-\s]?hier)\s+(?:à\s+)?(\d{1,2})h?(\d{2})?\b/i, days: -2 },
            { regex: /\b(aujourd'hui|today)\s+(?:à\s+)?(\d{1,2})h?(\d{2})?\b/i, days: 0 }
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                const hours = parseInt(match[2]);
                const minutes = match[3] ? parseInt(match[3]) : 0;

                const date = new Date();
                date.setDate(date.getDate() + pattern.days);
                date.setHours(hours, minutes, 0, 0);

                const cleanedText = text.replace(match[0], '').trim();

                return {
                    date: date,
                    cleanedText: cleanedText,
                    matched: true
                };
            }
        }

        // Also check for just "hier" or "avant-hier" without time
        const simplePatterns = [
            { regex: /\b(hier|yesterday)\b/i, days: -1 },
            { regex: /\b(avant[-\s]?hier)\b/i, days: -2 }
        ];

        for (const pattern of simplePatterns) {
            const match = text.match(pattern.regex);
            if (match) {
                const date = new Date();
                date.setDate(date.getDate() + pattern.days);
                date.setHours(12, 0, 0, 0); // Default to noon

                const cleanedText = text.replace(match[0], '').trim();

                return {
                    date: date,
                    cleanedText: cleanedText,
                    matched: true
                };
            }
        }

        return { matched: false };
    },

    // Parse relative time (il y a X heures/jours)
    parseRelativeTime(text) {
        const patterns = [
            { regex: /\bil\s+y\s+a\s+(\d+)\s+(heure|heures|h)\b/i, unit: 'hours' },
            { regex: /\bil\s+y\s+a\s+(\d+)\s+(jour|jours|j)\b/i, unit: 'days' },
            { regex: /\bil\s+y\s+a\s+(\d+)\s+(minute|minutes|min)\b/i, unit: 'minutes' }
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                const amount = parseInt(match[1]);
                const date = new Date();

                switch (pattern.unit) {
                    case 'hours':
                        date.setHours(date.getHours() - amount);
                        break;
                    case 'days':
                        date.setDate(date.getDate() - amount);
                        break;
                    case 'minutes':
                        date.setMinutes(date.getMinutes() - amount);
                        break;
                }

                const cleanedText = text.replace(match[0], '').trim();

                return {
                    date: date,
                    cleanedText: cleanedText,
                    matched: true
                };
            }
        }

        return { matched: false };
    },

    // Parse weekday (lundi, mardi, etc.)
    parseWeekday(text) {
        const weekdays = {
            'lundi': 1, 'monday': 1,
            'mardi': 2, 'tuesday': 2,
            'mercredi': 3, 'wednesday': 3,
            'jeudi': 4, 'thursday': 4,
            'vendredi': 5, 'friday': 5,
            'samedi': 6, 'saturday': 6,
            'dimanche': 0, 'sunday': 0
        };

        const pattern = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:à\s+)?(\d{1,2})h?(\d{2})?\b/i;
        const match = text.match(pattern);

        if (match) {
            const dayName = match[1].toLowerCase();
            const targetDay = weekdays[dayName];
            const hours = parseInt(match[2]);
            const minutes = match[3] ? parseInt(match[3]) : 0;

            const date = new Date();
            const currentDay = date.getDay();

            // Calculate days difference (always go back to last occurrence)
            let daysDiff = currentDay - targetDay;
            if (daysDiff <= 0) {
                daysDiff += 7;
            }

            date.setDate(date.getDate() - daysDiff);
            date.setHours(hours, minutes, 0, 0);

            const cleanedText = text.replace(match[0], '').trim();

            return {
                date: date,
                cleanedText: cleanedText,
                matched: true
            };
        }

        return { matched: false };
    },

    // Parse specific date (01/12/2024 or 1 décembre)
    parseSpecificDate(text) {
        // DD/MM/YYYY or DD/MM
        const datePattern = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\s+(?:à\s+)?(\d{1,2})h?(\d{2})?\b/;
        const match = text.match(datePattern);

        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // JS months are 0-indexed
            const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
            const hours = parseInt(match[4]);
            const minutes = match[5] ? parseInt(match[5]) : 0;

            const date = new Date(year, month, day, hours, minutes, 0, 0);
            const cleanedText = text.replace(match[0], '').trim();

            return {
                date: date,
                cleanedText: cleanedText,
                matched: true
            };
        }

        return { matched: false };
    },

    // Parse time only (15h30, 15h, 15:30)
    parseTimeOnly(text) {
        const patterns = [
            /\b(\d{1,2})h(\d{2})\b/,  // 15h30
            /\b(\d{1,2})h\b/,          // 15h
            /\b(\d{1,2}):(\d{2})\b/    // 15:30
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const hours = parseInt(match[1]);
                const minutes = match[2] ? parseInt(match[2]) : 0;

                const date = new Date();
                date.setHours(hours, minutes, 0, 0);

                // If the time is in the future, assume it's from today
                // If it's in the past, keep it as today (user is logging something from earlier)

                const cleanedText = text.replace(match[0], '').trim();

                return {
                    date: date,
                    cleanedText: cleanedText,
                    matched: true
                };
            }
        }

        return { matched: false };
    },

    // Extract hashtags from text
    extractHashtags(text) {
        const hashtagPattern = /#[\wÀ-ÿ]+/g;
        const matches = text.match(hashtagPattern);

        if (matches) {
            return matches.map(tag => tag.substring(1)); // Remove the # symbol
        }

        return [];
    },

    // Remove hashtags from text
    removeHashtags(text) {
        return text.replace(/#[\wÀ-ÿ]+/g, '').replace(/\s+/g, ' ').trim();
    },

    // Format date for display
    formatDate(date, format = 'full') {
        const d = new Date(date);

        switch (format) {
            case 'full':
                return d.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

            case 'short':
                return d.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

            case 'time':
                return d.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

            case 'datetime':
                return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}`;

            default:
                return d.toLocaleDateString('fr-FR');
        }
    },

    // Check if date is today
    isToday(date) {
        const d = new Date(date);
        const today = new Date();

        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    },

    // Check if date is this week
    isThisWeek(date) {
        const d = new Date(date);
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        return d >= weekStart && d < weekEnd;
    },

    // Get relative date label
    getRelativeLabel(date) {
        const d = new Date(date);
        const today = new Date();

        if (this.isToday(d)) {
            return "Aujourd'hui";
        }

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (d.getDate() === yesterday.getDate() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getFullYear() === yesterday.getFullYear()) {
            return "Hier";
        }

        return this.formatDate(d, 'full');
    }
};
