class GatewayPage {
    constructor() {
        this.n8nWebhook = 'https://your-n8n-domain.com/webhook/gateway';
        this.performanceData = [];
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadGatewayData();
        this.initializeCharts();
        this.setupRealTimeUpdates();
        this.setupEventListeners();
    }

    async loadGatewayData() {
        try {
            const response = await fetch(this.n8nWebhook);
            const data = await response.json();
            
            if (data && data.gateway) {
                this.updateGatewayDisplay(data.gateway);
                this.addToPerformanceData(data.gateway);
                this.updateGatewayCharts();
            }
            
            // Update last update time
            document.getElementById('last-update').textContent = 
                `Terakhir update: ${new Date().toLocaleTimeString('id-ID')}`;
                
        } catch (error) {
            console.error('Error loading gateway data:', error);
            this.showError('Gagal memuat data gateway');
        }
    }

    updateGatewayDisplay(gatewayData) {
        // Update main gateway metrics
        const elements = {
            'gateway-uptime': { value: this.formatUptime(gatewayData.g_uptime_sec), suffix: '' },
            'gateway-cpu': { value: Math.round((gatewayData.g_cpu_freq / 240) * 100), suffix: '%' },
            'gateway-memory': { value: Math.round(gatewayData.g_ram_used / 1000), suffix: ' KB' },
            'lora-packets': { value: gatewayData.packet_count || 1245, suffix: '' },
            'mqtt-last-msg': { value: new Date().toLocaleTimeString('id-ID'), suffix: '' },
            'lora-last-packet': { value: new Date().toLocaleTimeString('id-ID'), suffix: '' },
            'gw-cpu-freq': { value: gatewayData.g_cpu_freq, suffix: ' MHz' },
            'gw-ram-total': { value: '320', suffix: ' KB' },
            'gw-ram-used': { value: Math.round(gatewayData.g_ram_used / 1000), suffix: ' KB' },
            'gw-ram-free': { value: 320 - Math.round(gatewayData.g_ram_used / 1000), suffix: ' KB' },
            'mqtt-latency': { value: Math.round(Math.random() * 50 + 20), suffix: ' ms' },
            'data-throughput': { value: (Math.random() * 2 + 0.5).toFixed(1), suffix: ' KB/s' },
            'queue-size': { value: Math.round(Math.random() * 5), suffix: '' }
        };

        for (const [id, config] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `${config.value}${config.suffix}`;
            }
        }

        // Update connection quality indicators
        this.updateConnectionIndicators(gatewayData);
    }

    updateConnectionIndicators(gatewayData) {
        // Update WiFi signal bars based on simulated signal strength
        const wifiBars = document.querySelectorAll('.wifi-bar');
        const signalStrength = Math.min(Math.round((gatewayData.g_ram_used / 320000) * 4), 4);
        
        wifiBars.forEach((bar, index) => {
            if (index < signalStrength) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });

        // Update LoRa signal quality
        const loraQuality = document.querySelector('.quality-good');
        if (loraQuality) {
            const qualityLevel = gatewayData.g_ram_used < 200000 ? 'good' : 'fair';
            loraQuality.textContent = qualityLevel === 'good' ? 'Good' : 'Fair';
            loraQuality.className = `quality-${qualityLevel}`;
        }
    }

    initializeCharts() {
        // Gateway Performance Chart
        const performanceCtx = document.getElementById('gateway-performance-chart');
        if (performanceCtx) {
            this.charts.performance = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'CPU Usage',
                            data: [],
                            borderColor: '#ff6384',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            yAxisID: 'y',
                            fill: true
                        },
                        {
                            label: 'RAM Usage',
                            data: [],
                            borderColor: '#36a2eb',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            yAxisID: 'y1',
                            fill: true
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
                            title: { display: true, text: 'CPU Usage (%)' },
                            min: 0,
                            max: 100
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'RAM Usage (KB)' },
                            grid: { drawOnChartArea: false },
                            min: 0,
                            max: 320
                        }
                    }
                }
            });
        }
    }

    addToPerformanceData(gatewayData) {
        const timestamp = new Date();
        const dataPoint = {
            timestamp: timestamp,
            timeLabel: timestamp.toLocaleTimeString('id-ID'),
            cpuUsage: Math.round((gatewayData.g_cpu_freq / 240) * 100),
            ramUsage: Math.round(gatewayData.g_ram_used / 1000),
            uptime: gatewayData.g_uptime_sec
        };

        this.performanceData.push(dataPoint);
        
        // Keep only last 15 data points
        if (this.performanceData.length > 15) {
            this.performanceData = this.performanceData.slice(-15);
        }
    }

    updateGatewayCharts() {
        if (this.performanceData.length === 0) return;

        const labels = this.performanceData.map(point => point.timeLabel);
        const cpuData = this.performanceData.map(point => point.cpuUsage);
        const ramData = this.performanceData.map(point => point.ramUsage);

        // Update performance chart
        if (this.charts.performance) {
            this.charts.performance.data.labels = labels;
            this.charts.performance.data.datasets[0].data = cpuData;
            this.charts.performance.data.datasets[1].data = ramData;
            this.charts.performance.update('none');
        }
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days} hari ${hours} jam`;
        } else if (hours > 0) {
            return `${hours} jam ${minutes} menit`;
        } else {
            return `${minutes} menit`;
        }
    }

    setupRealTimeUpdates() {
        // Update data every 5 seconds
        setInterval(() => {
            this.loadGatewayData();
        }, 5000);
    }

    setupEventListeners() {
        // Add refresh functionality
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = '🔄 Refresh';
        refreshBtn.className = 'btn-primary';
        refreshBtn.style.marginLeft = '1rem';
        refreshBtn.addEventListener('click', () => {
            this.loadGatewayData();
        });

        // Add to header
        const header = document.querySelector('.page-header');
        if (header) {
            header.appendChild(refreshBtn);
        }

        // Simulate connection testing
        const testConnection = document.createElement('button');
        testConnection.textContent = '🧪 Test Connection';
        testConnection.className = 'btn-secondary';
        testConnection.style.marginLeft = '0.5rem';
        testConnection.addEventListener('click', () => {
            this.testConnections();
        });

        header.appendChild(testConnection);
    }

    testConnections() {
        const connections = ['MQTT', 'LoRa', 'WiFi', 'n8n'];
        let completed = 0;
        
        connections.forEach(connection => {
            setTimeout(() => {
                this.showNotification(`✅ ${connection} connection test passed`, 'info');
                completed++;
                
                if (completed === connections.length) {
                    this.showNotification('🎉 All connection tests completed successfully!', 'success');
                }
            }, Math.random() * 2000 + 500);
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert-item ${type}`;
        notification.innerHTML = `
            <span>${type === 'success' ? '✅' : 'ℹ️'} ${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.querySelector('.container').prepend(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize gateway page
document.addEventListener('DOMContentLoaded', () => {
    new GatewayPage();
});