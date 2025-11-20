class GPSPage {
    constructor() {
        this.n8nWebhook = 'https://your-n8n-domain.com/webhook/gps';
        this.map = null;
        this.marker = null;
        this.positionHistory = [];
        this.init();
    }

    init() {
        this.initializeMap();
        this.loadGPSData();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
    }

    initializeMap() {
        // Initialize map with larger view
        this.map = L.map('gps-map').setView([-8.178842, 113.726170], 15);
        
        // Add base layers
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        });

        const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google Satellite'
        });

        // Add layers to map
        this.baseLayers = {
            "Street Map": osmLayer,
            "Satellite": satelliteLayer
        };

        osmLayer.addTo(this.map);

        // Add layer control
        L.control.layers(this.baseLayers).addTo(this.map);

        // Add scale control
        L.control.scale({ imperial: false }).addTo(this.map);

        // Initialize marker
        this.marker = L.marker([-8.178842, 113.726170])
            .addTo(this.map)
            .bindPopup('WeatherTech Device Location')
            .openPopup();

        // Track zoom level
        this.map.on('zoomend', () => {
            document.getElementById('zoom-level').textContent = this.map.getZoom();
        });
    }

    async loadGPSData() {
        try {
            const response = await fetch(this.n8nWebhook);
            const data = await response.json();
            this.updateGPSDisplay(data);
        } catch (error) {
            console.error('Error loading GPS data:', error);
            this.showError('Gagal memuat data GPS');
        }
    }

    updateGPSDisplay(data) {
        if (!data || !data.latitude || !data.longitude) return;

        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);

        // Update map position
        this.updateMapPosition(lat, lng);

        // Update coordinate displays
        document.getElementById('current-latitude').textContent = lat.toFixed(6);
        document.getElementById('current-longitude').textContent = lng.toFixed(6);

        // Update DMS coordinates
        document.getElementById('lat-dms').textContent = this.decimalToDMS(lat, true);
        document.getElementById('lng-dms').textContent = this.decimalToDMS(lng, false);

        // Update Google Maps link
        const mapsLink = document.getElementById('google-maps-link');
        mapsLink.href = `https://maps.google.com/?q=${lat},${lng}`;

        // Update last update time
        document.getElementById('gps-last-update').textContent = new Date().toLocaleString('id-ID');
        document.getElementById('last-update').textContent = 
            `Terakhir update: ${new Date().toLocaleTimeString('id-ID')}`;

        // Update position history
        this.addToHistory(lat, lng);

        // Update GPS status
        this.updateGPSStatus(true);
    }

    updateMapPosition(lat, lng) {
        if (this.marker && this.map) {
            // Smooth transition for marker
            this.marker.setLatLng([lat, lng]);
            
            // Pan map smoothly to new position
            this.map.panTo([lat, lng], {
                animate: true,
                duration: 1.0
            });

            // Update popup content
            this.marker.bindPopup(`
                <div class="map-popup">
                    <strong>WeatherTech Device</strong><br>
                    Lat: ${lat.toFixed(6)}<br>
                    Lng: ${lng.toFixed(6)}<br>
                    <small>${new Date().toLocaleTimeString('id-ID')}</small>
                </div>
            `);
        }
    }

    decimalToDMS(decimal, isLatitude) {
        const direction = isLatitude ? 
            (decimal >= 0 ? "N" : "S") : 
            (decimal >= 0 ? "E" : "W");
        
        const absDecimal = Math.abs(decimal);
        const degrees = Math.floor(absDecimal);
        const minutes = Math.floor((absDecimal - degrees) * 60);
        const seconds = ((absDecimal - degrees - minutes / 60) * 3600).toFixed(1);
        
        return `${degrees}°${minutes}'${seconds}"${direction}`;
    }

    addToHistory(lat, lng) {
        const now = new Date();
        const historyItem = {
            time: now.toLocaleTimeString('id-ID'),
            position: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            timestamp: now.getTime()
        };

        this.positionHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (this.positionHistory.length > 10) {
            this.positionHistory = this.positionHistory.slice(0, 10);
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyContainer = document.querySelector('.position-history');
        if (!historyContainer) return;

        historyContainer.innerHTML = this.positionHistory
            .map(item => `
                <div class="history-item">
                    <span class="time">${item.time}</span>
                    <span class="position">${item.position}</span>
                </div>
            `)
            .join('');
    }

    updateGPSStatus(isValid) {
        const statusElement = document.getElementById('gps-status');
        const accuracyElement = document.getElementById('gps-accuracy');
        
        if (statusElement) {
            if (isValid) {
                statusElement.textContent = 'Valid';
                statusElement.className = 'status-value online';
                accuracyElement.textContent = 'Tinggi';
            } else {
                statusElement.textContent = 'Invalid';
                statusElement.className = 'status-value offline';
                accuracyElement.textContent = 'Rendah';
            }
        }
    }

    setupEventListeners() {
        // Refresh map button
        const refreshBtn = document.getElementById('refresh-map');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadGPSData();
                this.showNotification('Memperbarui peta...', 'info');
            });
        }

        // Toggle satellite view
        const toggleSatellite = document.getElementById('toggle-satellite');
        if (toggleSatellite) {
            toggleSatellite.addEventListener('click', () => {
                this.toggleSatelliteView();
            });
        }

        // Map click event for debugging
        this.map.on('click', (e) => {
            console.log('Map clicked at:', e.latlng);
        });
    }

    toggleSatelliteView() {
        const toggleBtn = document.getElementById('toggle-satellite');
        const currentText = toggleBtn.textContent;
        
        if (currentText.includes('Satellite')) {
            this.baseLayers['Satellite'].addTo(this.map);
            toggleBtn.textContent = '🗺️ Street';
            toggleBtn.classList.add('active');
        } else {
            this.baseLayers['Street Map'].addTo(this.map);
            toggleBtn.textContent = '🛰️ Satellite';
            toggleBtn.classList.remove('active');
        }
    }

    setupRealTimeUpdates() {
        // Update GPS data every 5 seconds
        setInterval(() => {
            this.loadGPSData();
        }, 5000);
    }

    showError(message) {
        // Create error notification
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
            <span>${type === 'info' ? 'ℹ️' : '✅'} ${message}</span>
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

// Initialize GPS page
document.addEventListener('DOMContentLoaded', () => {
    new GPSPage();
});