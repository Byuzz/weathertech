class TransceiverPage {
    constructor() {
        this.n8nWebhook = 'https://your-n8n-domain.com/webhook/transceiver';
        this.performanceHistory = [];
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadTransceiverData();
        this.initializeCharts();
        this.setupRealTimeUpdates();
        this.setupEventListeners();
    }

    async loadTransceiverData() {
        try {
            const response = await fetch(this.n8nWebhook);
            const data = await response.json();
            
            if (data && data.system) {
                this.updateTransceiverDisplay(data.system);
                this.addToPerformanceHistory(data.system);
                this.updatePerformanceCharts();
            }
            
            // Update last update time
            document.getElementById('last-update').textContent = 
                `Terakhir update: ${new Date().toLocaleTimeString('id-ID')}`;
                
        } catch (error) {
            console.error('Error loading transceiver data:', error);
            this.showError('Gagal memuat data transceiver');
        }
    }

    updateTransceiverDisplay(systemData) {
        // Update basic system information
        const elements = {
            'cpu-value': { value: systemData.cpu_freq, suffix: ' MHz' },
            'ram-value': { value: Math.round(systemData.ram_used / 1000), suffix: ' KB' },
            'uptime-value': { value: this.formatUptime(systemData.uptime_sec), suffix: '' },
            'cpu-freq': { value: systemData.cpu_freq, suffix: ' MHz' },
            'ram-total': { value: '240', suffix: ' KB' },
            'ram-used-detail': { value: Math.round(systemData.ram_used / 1000), suffix: ' KB' },
            'ram-free-detail': { value: 240 - Math.round(systemData.ram_used / 1000), suffix: ' KB' },
            'last-tx': { value: new Date().toLocaleTimeString('id-ID'), suffix: '' },
            'packets-sent': { value: systemData.eeprom_count || 1245, suffix: '' }
        };

        for (const [id, config] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `${config.value}${config.suffix}`;
            }
        }

        // Update progress bars
        this.updateProgressBars(systemData);
        
        // Update status indicators
        this.updateStatusIndicators(systemData);
    }

    updateProgressBars(systemData) {
        // CPU Usage (simulated based on frequency)
        const cpuUsage = Math.min((systemData.cpu_freq / 240) * 100, 100);
        const cpuElement = document.getElementById('transceiver-cpu');
        if (cpuElement) {
            cpuElement.style.width = `${cpuUsage}%`;
        }

        // RAM Usage
        const ramUsage = Math.min((systemData.ram_used / 240000) * 100, 100);
        const ramElement = document.getElementById('transceiver-ram');
        if (ramElement) {
            ramElement.style.width = `${ramUsage}%`;
        }

        // Update usage percentages
        document.getElementById('cpu-usage').textContent = `${Math.round(cpuUsage)}%`;
        document.getElementById('ram-used').textContent = `${Math.round(systemData.ram_used / 1000)} KB`;
        document.getElementById('ram-free').textContent = `${240 - Math.round(systemData.ram_used / 1000)} KB`;
    }

    updateStatusIndicators(systemData) {
        // Determine system health based on metrics
        const cpuHealth = systemData.cpu_freq > 200 ? 'healthy' : 'warning';
        const ramHealth = systemData.ram_used < 200000 ? 'healthy' : 'warning';
        const overallHealth = cpuHealth === 'healthy' && ramHealth === 'healthy' ? 'healthy' : 'warning';

        // Update alert display
        this.updateAlerts(overallHealth, systemData);
    }

    updateAlerts(healthStatus, systemData) {
        const alertsContainer = document.getElementById('transceiver-alerts');
        if (!alertsContainer) return;

        let alertMessage = '';
        let alertType = 'info';

        if (healthStatus === 'healthy') {
            alertMessage = '🟢 System berjalan normal';
            alertType = 'info';
        } else {
            if (systemData.cpu_freq <= 200) {
                alertMessage = '🟡 CPU frequency rendah - Periksa power supply';
                alertType = 'warning';
            }
            if (systemData.ram_used >= 200000) {
                alertMessage = '🟡 RAM usage tinggi - Monitor memory leaks';
                alertType = 'warning';
            }
        }

        alertsContainer.innerHTML = `
            <div class="alert-item ${alertType}">
                <span>${alertMessage}</span>
                <span class="alert-time">${new Date().toLocaleTimeString('id-ID')}</span>
            </div>
        `;
    }

    initializeCharts() {
        // CPU Performance Chart
        const cpuCtx = document.getElementById('cpu-chart');
        if (cpuCtx) {
            this.charts.cpu = new Chart(cpuCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'CPU Frequency',
                        data: [],
                        borderColor: '#ff6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'CPU Frequency (MHz)' }
                    },
                    scales: {
                        y: { 
                            beginAtZero: false,
                            min: 0,
                            max: 240,
                            title: { display: true, text: 'MHz' }
                        }
                    }
                }
            });
        }

        // RAM Usage Chart
        const ramCtx = document.getElementById('ram-chart');
        if (ramCtx) {
            this.charts.ram = new Chart(ramCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'RAM Used',
                        data: [],
                        borderColor: '#36a2eb',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'RAM Usage (KB)' }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            max: 240,
                            title: { display: true, text: 'KB' }
                        }
                    }
                }
            });
        }

        // Performance History Chart
        const historyCtx = document.getElementById('performance-history-chart');
        if (historyCtx) {
            this.charts.history = new Chart(historyCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'CPU (MHz)',
                            data: [],
                            borderColor: '#ff6384',
                            yAxisID: 'y',
                            tension: 0.4
                        },
                        {
                            label: 'RAM (KB)',
                            data: [],
                            borderColor: '#36a2eb',
                            yAxisID: 'y1',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'CPU (MHz)' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'RAM (KB)' },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });
        }
    }

    addToPerformanceHistory(systemData) {
        const timestamp = new Date();
        const historyPoint = {
            timestamp: timestamp,
            timeLabel: timestamp.toLocaleTimeString('id-ID'),
            cpu: systemData.cpu_freq,
            ram: Math.round(systemData.ram_used / 1000),
            uptime: systemData.uptime_sec
        };

        this.performanceHistory.push(historyPoint);
        
        // Keep only last 20 data points
        if (this.performanceHistory.length > 20) {
            this.performanceHistory = this.performanceHistory.slice(-20);
        }
    }

    updatePerformanceCharts() {
        if (this.performanceHistory.length === 0) return;

        const labels = this.performanceHistory.map(point => point.timeLabel);
        const cpuData = this.performanceHistory.map(point => point.cpu);
        const ramData = this.performanceHistory.map(point => point.ram);

        // Update CPU chart
        if (this.charts.cpu) {
            this.charts.cpu.data.labels = labels;
            this.charts.cpu.data.datasets[0].data = cpuData;
            this.charts.cpu.update('none');
        }

        // Update RAM chart
        if (this.charts.ram) {
            this.charts.ram.data.labels = labels;
            this.charts.ram.data.datasets[0].data = ramData;
            this.charts.ram.update('none');
        }

        // Update history chart
        if (this.charts.history) {
            this.charts.history.data.labels = labels;
            this.charts.history.data.datasets[0].data = cpuData;
            this.charts.history.data.datasets[1].data = ramData;
            this.charts.history.update('none');
        }
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days} hari ${hours} jam ${minutes} menit`;
        } else if (hours > 0) {
            return `${hours} jam ${minutes} menit`;
        } else {
            return `${minutes} menit`;
        }
    }

    setupRealTimeUpdates() {
        // Update data every 4 seconds
        setInterval(() => {
            this.loadTransceiverData();
        }, 4000);
    }

    setupEventListeners() {
        // Manual refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = '🔄 Refresh';
        refreshBtn.className = 'btn-primary';
        refreshBtn.style.marginLeft = '1rem';
        refreshBtn.addEventListener('click', () => {
            this.loadTransceiverData();
        });

        // Add refresh button to header
        const header = document.querySelector('.page-header');
        if (header) {
            header.appendChild(refreshBtn);
        }

        // Handle window focus for data refresh
        window.addEventListener('focus', () => {
            this.loadTransceiverData();
        });
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'alert-item error';
        notification.innerHTML = `
            <span>❌ ${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.querySelector('.container').prepend(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize transceiver page
document.addEventListener('DOMContentLoaded', () => {
    new TransceiverPage();
});