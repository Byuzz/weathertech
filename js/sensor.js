class SensorsPage {
    constructor() {
        this.n8nWebhook = 'https://your-n8n-domain.com/webhook/sensors';
        this.sensorData = [];
        this.charts = {};
        this.init();
    }

    init() {
        this.loadSensorData();
        this.initializeCharts();
        this.setupRealTimeUpdates();
    }

    async loadSensorData() {
        try {
            const response = await fetch(this.n8nWebhook);
            const data = await response.json();
            this.sensorData = Array.isArray(data) ? data : [data];
            this.updateSensorDisplay();
            this.updateCharts();
        } catch (error) {
            console.error('Error loading sensor data:', error);
        }
    }

    updateSensorDisplay() {
        if (this.sensorData.length === 0) return;

        const latest = this.sensorData[this.sensorData.length - 1];
        
        // Update basic values
        document.getElementById('lux-value').textContent = `${latest.lux?.toFixed(1) || '--'} lux`;
        document.getElementById('temp-value').textContent = `${latest.temp?.toFixed(1) || '--'} °C`;
        document.getElementById('hum-value').textContent = `${latest.hum?.toFixed(1) || '--'} %`;
        document.getElementById('pres-value').textContent = `${latest.pres?.toFixed(1) || '--'} hPa`;
        document.getElementById('air-value').textContent = `${latest.air_clean_perc || '--'} %`;
        document.getElementById('rtc-time').textContent = latest.rtc_time || '--';
        document.getElementById('eeprom-count').textContent = latest.eeprom_count || '--';
        
        // Update last update time
        document.getElementById('last-update-time').textContent = new Date().toLocaleString('id-ID');
        document.getElementById('last-update').textContent = 
            `Terakhir update: ${new Date().toLocaleTimeString('id-ID')}`;

        // Update gauges
        this.updateGauges(latest);
        this.updateSensorStatus(latest);
    }

    updateGauges(data) {
        // Temperature gauge (assume range 0-50°C)
        const tempGauge = document.getElementById('temp-gauge-fill');
        if (tempGauge && data.temp) {
            const percentage = (data.temp / 50) * 100;
            tempGauge.style.background = `conic-gradient(
                #4CAF50 0% ${percentage * 0.75}%, 
                #ff9800 ${percentage * 0.75}% ${percentage * 0.9}%, 
                #f44336 ${percentage * 0.9}% 100%
            )`;
        }

        // Humidity gauge
        const humGauge = document.getElementById('hum-gauge-fill');
        if (humGauge && data.hum) {
            const percentage = data.hum;
            humGauge.style.background = `conic-gradient(
                #4CAF50 0% ${percentage * 0.75}%, 
                #ff9800 ${percentage * 0.75}% ${percentage * 0.9}%, 
                #f44336 ${percentage * 0.9}% 100%
            )`;
        }

        // Air quality bar
        const airBar = document.getElementById('air-quality-fill');
        if (airBar && data.air_clean_perc) {
            airBar.style.width = `${data.air_clean_perc}%`;
            
            // Update color based on quality
            if (data.air_clean_perc > 80) {
                airBar.style.background = '#4CAF50';
            } else if (data.air_clean_perc > 60) {
                airBar.style.background = '#ff9800';
            } else {
                airBar.style.background = '#f44336';
            }
        }
    }

    updateSensorStatus(data) {
        // Update status badges
        const statusElements = {
            'lux-status': this.getLightStatus(data.lux),
            'air-status': this.getAirQualityStatus(data.air_clean_perc)
        };

        for (const [id, status] of Object.entries(statusElements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = status.text;
                element.className = `status-badge ${status.class}`;
            }
        }

        // Update min/max values (simulated)
        this.updateMinMaxValues(data);
    }

    getLightStatus(lux) {
        if (lux > 1000) return { text: 'Terang', class: 'warning' };
        if (lux > 500) return { text: 'Normal', class: 'online' };
        if (lux > 100) return { text: 'Redup', class: 'warning' };
        return { text: 'Gelap', class: 'offline' };
    }

    getAirQualityStatus(quality) {
        if (quality > 80) return { text: 'Bersih', class: 'online' };
        if (quality > 60) return { text: 'Sedang', class: 'warning' };
        return { text: 'Kotor', class: 'offline' };
    }

    updateMinMaxValues(data) {
        // Simulate min/max values based on current data
        const elements = {
            'temp-min': (data.temp - 2).toFixed(1),
            'temp-max': (data.temp + 3).toFixed(1),
            'hum-min': (data.hum - 5).toFixed(1),
            'hum-max': (data.hum + 7).toFixed(1)
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    }

    initializeCharts() {
        // Lux chart
        const luxCtx = document.getElementById('lux-chart');
        if (luxCtx) {
            this.charts.lux = new Chart(luxCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Cahaya (lux)',
                        data: [],
                        borderColor: '#ffeb3b',
                        backgroundColor: 'rgba(255, 235, 59, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Lux' } }
                    }
                }
            });
        }

        // Main trend chart
        const trendCtx = document.getElementById('sensor-trend-chart');
        if (trendCtx) {
            this.charts.trend = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Suhu (°C)',
                            data: [],
                            borderColor: '#ff6384',
                            yAxisID: 'y'
                        },
                        {
                            label: 'Kelembaban (%)',
                            data: [],
                            borderColor: '#36a2eb',
                            yAxisID: 'y1'
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
                            title: { display: true, text: 'Suhu (°C)' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'Kelembaban (%)' },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });
        }
    }

    updateCharts() {
        if (this.sensorData.length === 0) return;

        // Update lux chart
        if (this.charts.lux) {
            const luxData = this.sensorData.slice(-10).map(d => d.lux);
            const labels = this.sensorData.slice(-10).map((d, i) => `-${9 - i}m`);
            
            this.charts.lux.data.labels = labels;
            this.charts.lux.data.datasets[0].data = luxData;
            this.charts.lux.update();
        }

        // Update trend chart
        if (this.charts.trend) {
            const tempData = this.sensorData.slice(-15).map(d => d.temp);
            const humData = this.sensorData.slice(-15).map(d => d.hum);
            const labels = this.sensorData.slice(-15).map((d, i) => `-${14 - i}m`);
            
            this.charts.trend.data.labels = labels;
            this.charts.trend.data.datasets[0].data = tempData;
            this.charts.trend.data.datasets[1].data = humData;
            this.charts.trend.update();
        }
    }

    setupRealTimeUpdates() {
        // Update every 3 seconds
        setInterval(() => {
            this.loadSensorData();
        }, 3000);
    }
}

// Initialize sensors page
document.addEventListener('DOMContentLoaded', () => {
    new SensorsPage();
});