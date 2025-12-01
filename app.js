// ============================================
// TODAY - Main App Module
// Application orchestrator
// ============================================

const App = {
    currentView: 'today',
    viewMode: 'detailed', // 'detailed' or 'compact'

    init() {
        // Initialize all modules
        Storage.init();
        Input.init();
        Timeline.init();
        Calendar.init();
        Search.init();
        Analytics.init();

        // Set up navigation tabs
        this.setupNavigation();

        // Set up view controls
        this.setupViewControls();

        // Set up export
        this.setupExport();

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();

        console.log('TODAY app initialized');
    },

    setupNavigation() {
        const tabs = document.querySelectorAll('.tab-btn');
        const views = {
            'today': document.getElementById('today-view'),
            'timeline': document.getElementById('timeline-view'),
            'stats': document.getElementById('stats-view')
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetView = tab.dataset.view;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active view
                Object.values(views).forEach(view => {
                    if (view) view.classList.remove('active');
                });
                
                if (views[targetView]) {
                    views[targetView].classList.add('active');
                    this.currentView = targetView;

                    // Render appropriate content
                    if (targetView === 'today') {
                        Timeline.renderToday();
                    } else if (targetView === 'timeline') {
                        Timeline.render();
                    } else if (targetView === 'stats') {
                        Analytics.render();
                    }
                }
            });
        });
    },

    setupViewControls() {
        // Toggle compact/detailed view
        const toggleBtn = document.getElementById('toggle-view-mode');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const container = document.getElementById('timeline-container');
                if (container.classList.contains('compact')) {
                    container.classList.remove('compact');
                    this.viewMode = 'detailed';
                } else {
                    container.classList.add('compact');
                    this.viewMode = 'compact';
                }
            });
        }

        // View options button
        const optionsBtn = document.getElementById('view-options');
        if (optionsBtn) {
            optionsBtn.addEventListener('click', () => {
                this.showOptionsMenu();
            });
        }
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K: Open date picker
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('date-picker-btn').click();
            }

            // Cmd/Ctrl + 1/2/3: Switch views
            if ((e.metaKey || e.ctrlKey) && ['1', '2', '3'].includes(e.key)) {
                e.preventDefault();
                const viewMap = { '1': 'today', '2': 'timeline', '3': 'stats' };
                const targetTab = document.querySelector(`[data-view="${viewMap[e.key]}"]`);
                if (targetTab) targetTab.click();
            }
        });
    },

    showOptionsMenu() {
        const options = [
            '1 - Effacer toutes les données',
            '2 - Importer des données',
            '3 - Voir l\'aide'
        ];

        const choice = prompt(options.join('\n\n'));

        switch (choice) {
            case '1':
                Storage.clearAll();
                Timeline.render();
                break;
            case '2':
                this.importData();
                break;
            case '3':
                this.showHelp();
                break;
        }
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (Storage.importFromJSON(event.target.result)) {
                        alert('Données importées avec succès');
                        Timeline.render();
                    } else {
                        alert('Erreur lors de l\'importation');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    },

    showHelp() {
        alert(
            'TODAY - Raccourcis clavier\n\n' +
            '⏎ Entrée : Sauvegarder l\'entrée\n' +
            '⌘K : Ouvrir le sélecteur de date\n' +
            '⌘1 : Vue Aujourd\'hui\n' +
            '⌘2 : Timeline complète\n' +
            '⌘3 : Statistiques\n\n' +
            'Format d\'entrée :\n' +
            'Titre | Description\n' +
            'Utilise #tags pour catégoriser'
        );
    },

    setupExport() {
        const exportBtn = document.getElementById('export-data');

        exportBtn.addEventListener('click', () => {
            this.showExportMenu();
        });
    },

    showExportMenu() {
        const format = prompt(
            'Choisir le format d\'export:\n\n' +
            '1 - JSON (complet)\n' +
            '2 - CSV (tableau)\n' +
            '3 - TXT (lisible)\n\n' +
            'Entrez 1, 2 ou 3:'
        );

        const timestamp = new Date().toISOString().split('T')[0];

        switch (format) {
            case '1':
                const json = Storage.exportAsJSON();
                Storage.downloadFile(json, `today-export-${timestamp}.json`, 'application/json');
                break;

            case '2':
                const csv = Storage.exportAsCSV();
                Storage.downloadFile(csv, `today-export-${timestamp}.csv`, 'text/csv');
                break;

            case '3':
                const txt = Storage.exportAsText();
                Storage.downloadFile(txt, `today-export-${timestamp}.txt`, 'text/plain');
                break;

            default:
                if (format !== null) {
                    alert('Format invalide. Veuillez choisir 1, 2 ou 3.');
                }
        }
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}
