class SystemOverview {
    constructor() {
        this.init();
    }

    init() {
        this.updateSystemMetrics();
        this.setupRealTimeUpdates();
        this.setupPageInteractions();
    }

    updateSystemMetrics() {
        // Update real-time system metrics
        const now = new Date();
        document.getElementById('last-data-time').textContent = now.toLocaleTimeString('id-ID');
        document.getElementById('active-connections').textContent = '6/6';
        document.getElementById('system-uptime').textContent = '99.8%';
        document.getElementById('data-processed').textContent = '1,245 records';
    }

    setupRealTimeUpdates() {
        // Update metrics every 10 seconds
        setInterval(() => {
            this.updateSystemMetrics();
        }, 10000);

        // Simulate occasional status changes for demo
        setInterval(() => {
            this.simulateStatusChanges();
        }, 30000);
    }

    simulateStatusChanges() {
        // Randomly update one status for demo purposes
        const statusItems = document.querySelectorAll('.status-badge');
        if (statusItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * statusItems.length);
            const randomStatus = statusItems[randomIndex];
            
            // Temporarily show "updating" state
            const originalText = randomStatus.textContent;
            const originalClass = randomStatus.className;
            
            randomStatus.textContent = 'Updating...';
            randomStatus.className = 'status-badge warning';
            
            setTimeout(() => {
                randomStatus.textContent = originalText;
                randomStatus.className = originalClass;
            }, 2000);
        }
    }

    setupPageInteractions() {
        // Add click effects to page cards
        const pageCards = document.querySelectorAll('.page-card');
        pageCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Add ripple effect
                this.createRippleEffect(e);
            });
        });

        // Add animation to architecture flow
        this.animateArchitectureFlow();
    }

    createRippleEffect(event) {
        const card = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = card.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        card.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    animateArchitectureFlow() {
        const flowSteps = document.querySelectorAll('.flow-step');
        flowSteps.forEach((step, index) => {
            // Staggered animation
            step.style.opacity = '0';
            step.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                step.style.transition = 'all 0.6s ease';
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SystemOverview();
});