# 🌤️ WeatherTech Monitoring System

![WeatherTech Banner](https://img.shields.io/badge/WeatherTech-Monitoring%20System-blue)
![ESP32](https://img.shields.io/badge/ESP32-IoT%20Platform-green)
![LoRa](https://img.shields.io/badge/LoRa-Wireless%20Communication-purple)
![MQTT](https://img.shields.io/badge/MQTT-Message%20Broker-orange)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Hosting-brightgreen)

Real-time monitoring dashboard untuk sistem IoT WeatherTech dengan ESP32, LoRa, dan cloud integration.

## 🚀 Live Demo
**[https://byuzz.github.io/weathertech/](https://byuzz.github.io/weathertech/)**

## 📋 Features

### 🌡️ Sensor Monitoring
- **Real-time environmental data** - Suhu, kelembaban, tekanan, cahaya
- **Air quality monitoring** - Kualitas udara dengan sensor MQ-135
- **GPS tracking** - Pelacakan lokasi real-time dengan maps
- **RTC time synchronization** - Waktu presisi dengan DS3231

### 📊 System Performance
- **Transceiver monitoring** - CPU, RAM, uptime sensor nodes
- **Gateway system** - Performance gateway dan konektivitas
- **Communication status** - LoRa, MQTT, WiFi monitoring
- **Resource usage** - Memory dan CPU utilization

### 🎯 Advanced Features
- **Historical data analytics** - Trend analysis dan statistics
- **Real-time charts** - Interactive charts dengan Chart.js
- **Responsive design** - Optimized untuk mobile dan desktop
- **Export functionality** - Data export dalam format CSV

## 🏗️ System Architecture
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Sensor Nodes │ │ LoRa │ │ Gateway │ │ Cloud │
│ │ │ Wireless │ │ System │ │ Services │
│ ┌─────────────┐│ │ │ │ │ │ │
│ │ ESP32 ││◄──►│ 433MHz │◄──►│ ESP32 │◄──►│ HiveMQ │
│ │ Sensors ││ │ LoRa │ │ WiFi │ │ MQTT Broker│
│ │ BME280 ││ │ │ │ MQTT Client│ │ │
│ │ BH1750 ││ │ │ │ │ │ │
│ │ MQ-135 ││ └─────────────┘ └─────────────┘ └─────────────┘
│ │ GPS ││ │
│ └─────────────┘│ │
└─────────────────┘ ▼
┌─────────────┐
│ n8n │
│ Workflow │
│ Automation │
└─────────────┘
│
▼
┌─────────────┐
│ Web │
│ Dashboard │
│ GitHub Pages│
└─────────────┘

text

## 🛠️ Technology Stack

### 🔌 Hardware Components
- **Microcontroller**: ESP32 Dual-Core 240MHz
- **Sensors**: 
  - BME280 (Temperature, Humidity, Pressure)
  - BH1750 (Light Intensity) 
  - MQ-135 (Air Quality)
  - GPS NEO-6M (Location Tracking)
- **Communication**: LoRa SX1278 (433MHz)
- **Storage**: AT24C32 EEPROM (32KB)
- **RTC**: DS3231 Precision Timer

### 💻 Software & Services
- **Frontend**: HTML5, CSS3, JavaScript, Chart.js, Leaflet.js
- **Backend**: n8n Workflow Automation
- **Communication**: MQTT over TLS, LoRaWAN
- **Cloud**: HiveMQ Cloud Broker
- **Hosting**: GitHub Pages
- **Firmware**: Arduino C++ dengan FreeRTOS

### 🔄 Data Flow
- **Sampling Rate**: Sensor data setiap 2 detik
- **Transmission**: LoRa packet setiap 4 detik  
- **MQTT Publishing**: Real-time ke cloud
- **Web Updates**: Auto-refresh setiap 3-5 detik
- **Data Format**: JSON structured data

## 📁 Project Structure
weathertech-monitoring/
├── 📄 index.html # System Overview & Architecture
├── 📄 sensors.html # Real-time Sensor Data
├── 📄 gps.html # GPS Tracking & Maps
├── 📄 transceiver.html # Transceiver Performance
├── 📄 gateway.html # Gateway System Monitoring
├── 📄 history.html # Historical Data & Analytics
├── 📁 css/
│ └── 📄 style.css # Main Stylesheet
├── 📁 js/
│ ├── 📄 dashboard.js # Dashboard functionality
│ ├── 📄 sensors.js # Sensor data handling
│ ├── 📄 gps.js # Maps & GPS features
│ ├── 📄 transceiver.js # Transceiver monitoring
│ ├── 📄 gateway.js # Gateway system monitoring
│ ├── 📄 history.js # Historical data & charts
│ └── 📄 overview.js # System overview page
└── 📄 README.md # This documentation

text

## 🚀 Getting Started

### 📦 Prerequisites
- Web browser modern (Chrome, Firefox, Safari)
- Internet connection untuk real-time updates
- n8n instance untuk backend processing
- MQTT broker (HiveMQ Cloud)

### 🔧 Installation & Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/Byuzz/weathertech.git
   cd weathertech
Open in Browser

bash
# Buka file index.html di browser
open index.html
Configure Backend

Setup n8n workflow dengan MQTT trigger

Configure HiveMQ MQTT broker credentials

Update webhook URLs di JavaScript files

⚙️ Configuration
Update n8n webhook URLs di file JavaScript:

javascript
// Di semua .js files, update URL ini:
this.n8nWebhook = 'https://your-n8n-domain.com/webhook/endpoint';
🎮 Usage
📊 Monitoring Pages
Dashboard Overview (/)

System architecture explanation

Data flow visualization

Quick navigation to all features

Sensor Data (/sensors.html)

Real-time environmental readings

Interactive charts and gauges

Sensor status and alerts

GPS Tracking (/gps.html)

Live location mapping dengan Leaflet.js

Coordinate details dan history

Satellite dan street views

Transceiver Performance (/transceiver.html)

CPU dan RAM monitoring

LoRa communication status

System uptime dan health

Gateway System (/gateway.html)

Gateway performance metrics

MQTT connection status

Network connectivity monitoring

Historical Data (/history.html)

Data analytics dan trends

Statistical analysis

CSV export functionality

🔄 Real-time Features
Auto-refresh setiap 3-5 detik

Live charts dengan Chart.js

WebSocket-like updates via polling

Status indicators dengan color coding

🔌 API Integration
MQTT Topics
text
/weathertech/sensor_data     # Sensor readings
/weathertech/system_data     # System performance  
/weathertech/gateway_system  # Gateway metrics
n8n Webhook Endpoints
text
POST /webhook/dashboard      # Aggregate data
POST /webhook/sensors        # Sensor data only
POST /webhook/gps           # GPS coordinates
POST /webhook/transceiver   # Transceiver performance
POST /webhook/gateway       # Gateway system
POST /webhook/history       # Historical data
🐛 Troubleshooting
Common Issues
Data not updating

Check n8n workflow status

Verify MQTT broker connection

Check browser console for errors

Charts not loading

Ensure internet connection for CDN resources

Check Chart.js and Leaflet.js loading

GPS map not showing

Verify Leaflet.js CSS and JS loaded

Check internet connection for map tiles

Debug Mode
Enable console logging di browser Developer Tools untuk detailed debugging.

🤝 Contributing
Fork the project

Create feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add some AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

👥 Authors
Byuzz - Initial work - Byuzz

🙏 Acknowledgments
ESP32 - IoT Platform

LoRa - Long Range Communication

HiveMQ - MQTT Broker

n8n - Workflow Automation

Chart.js - Data Visualization

Leaflet - Maps Integration

<div align="center">
⭐ Don't forget to star this repository if you find it useful!

</div> ```