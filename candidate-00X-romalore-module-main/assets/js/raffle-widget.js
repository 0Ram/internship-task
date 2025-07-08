class RaffleWidget {
  constructor() {
    this.isExpanded = false;
    this.userId = null;
    this.ticketCount = 3; // Initialize mock ticket count
    this.init();
  }

  init() {
    this.createWidget();
    this.fetchUserStatus();
    this.setupEventListeners();
  }

  createWidget() {
    this.widgetContainer = document.createElement('div');
    this.widgetContainer.id = 'raffle-widget';
    this.widgetContainer.className = 'collapsed';
    
    this.icon = document.createElement('div');
    this.icon.className = 'raffle-icon';
    this.icon.innerHTML = '🎫';
    
    this.panel = document.createElement('div');
    this.panel.className = 'raffle-panel';
    this.panel.innerHTML = `
      <h3>RomeLore Raffle</h3>
      <div class="ticket-count">Loading...</div>
      <button class="join-raffle">Join the Raffle</button>
      <div class="error-message"></div>
    `;
    
    this.widgetContainer.appendChild(this.icon);
    this.widgetContainer.appendChild(this.panel);
    document.body.appendChild(this.widgetContainer);
  }

  async fetchUserStatus() {
    try {
      // Mock implementation - replace API call
      const ticketCountEl = this.panel.querySelector('.ticket-count');
      ticketCountEl.innerHTML = `
        <span style="color: var(--primary-gold); margin-right: 5px;">🎫</span>
        You have ${this.ticketCount} tickets
      `;
      this.panel.querySelector('.error-message').textContent = '';
      
      // Original API call (commented out for reference)
      // const response = await fetch(`/api/raffle-status?userId=${this.userId || '123'}`);
      // const data = await response.json();
      // ticketCountEl.textContent = `You have ${data.tickets || 0} tickets`;
    } catch (error) {
      this.showError("Failed to load raffle status");
    }
  }

  async joinRaffle() {
    try {
      // Mock implementation - replace API call
      this.ticketCount += 1;
      const ticketCountEl = this.panel.querySelector('.ticket-count');
      ticketCountEl.innerHTML = `
        <span style="color: var(--primary-gold);">✓</span>
        Success! You now have ${this.ticketCount} tickets
      `;
      
      // Optional: Simple confetti effect (no library needed)
      this.createConfettiEffect();
      
      // Original API call (commented out for reference)
      // const response = await fetch('/api/raffle-entry', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ userId: this.userId || '123' })
      // });
      // const data = await response.json();
      // if (data.success) {
      //   this.fetchUserStatus();
      // } else {
      //   this.showError(data.message || "Error joining raffle");
      // }
    } catch (error) {
      this.showError("Error, try again.");
    }
  }

  createConfettiEffect() {
    // Simple CSS-based confetti effect
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = 'var(--primary-gold)';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '1000';
    
    // Create multiple confetti pieces
    for (let i = 0; i < 20; i++) {
      const clone = confetti.cloneNode();
      clone.style.left = `${50 + Math.random() * 20 - 10}%`;
      clone.style.top = '60%';
      clone.style.opacity = '0';
      
      document.body.appendChild(clone);
      
      // Animate
      const animation = clone.animate([
        { opacity: 1, transform: 'translateY(0) rotate(0deg)' },
        { opacity: 0, transform: `translateY(-${100 + Math.random() * 100}px) rotate(${360 * Math.random()}deg)` }
      ], {
        duration: 1000 + Math.random() * 1000,
        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
      });
      
      animation.onfinish = () => clone.remove();
    }
  }

  showError(message) {
    const errorEl = this.panel.querySelector('.error-message');
    errorEl.textContent = message;
    setTimeout(() => errorEl.textContent = '', 3000);
  }

  setupEventListeners() {
    this.icon.addEventListener('click', () => this.toggleWidget());
    this.panel.querySelector('.join-raffle').addEventListener('click', () => this.joinRaffle());
  }

  toggleWidget() {
    this.isExpanded = !this.isExpanded;
    this.widgetContainer.className = this.isExpanded ? 'expanded' : 'collapsed';
  }
}

// Initialize widget
document.addEventListener('DOMContentLoaded', () => {
  new RaffleWidget();
});