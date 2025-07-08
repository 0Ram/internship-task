/**
 * Stripe Payment Integration Class
 * Handles Stripe Checkout integration with proper error handling and loading states
 */
class StripeIntegration {
  constructor() {
    this.config = {
      publishableKey: 'pk_test_51RiP7wQ6ITYEbVGwv7Et6VBBz3jPaHTgOWejnl588ExP0GdlLKSuNkdkqmRg85LoKBHzUOpuaH3Bf8W1NwI65lFH00ysFCkjbq',
      amount: 100,
      currency: 'usd',
      productName: 'RomeLore Ticket'
    };

    this.stripe = null;
    this.paymentButton = null;
    this.initStripe();
  }

  initStripe() {
    if (typeof Stripe === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        this.stripe = Stripe(this.config.publishableKey);
        this.initUI();
      };
      script.onerror = () => {
        console.error('Failed to load Stripe.js');
        this.showPaymentError('Payment system unavailable. Please try again later.');
      };
      document.head.appendChild(script);
    } else {
      this.stripe = Stripe(this.config.publishableKey);
      this.initUI();
    }
  }

  initUI() {
    const container = document.querySelector('.payment-container');
    if (!container) {
      console.error('Payment container element not found');
      return;
    }

    this.createPaymentButton(container);
    this.setupEventListeners();
  }

  createPaymentButton(container) {
    if (document.querySelector('.stripe-payment-btn')) return;

    this.paymentButton = document.createElement('button');
    this.paymentButton.className = 'stripe-payment-btn';
    this.paymentButton.textContent = `Proceed to Payment (USD ${(this.config.amount / 100).toFixed(2)})`;
    container.appendChild(this.paymentButton);
  }

  setupEventListeners() {
    if (!this.paymentButton) return;

    this.paymentButton.replaceWith(this.paymentButton.cloneNode(true));
    this.paymentButton = document.querySelector('.stripe-payment-btn');

    this.paymentButton.addEventListener('click', () => this.handlePayment());
  }

  async handlePayment() {
    try {
      this.showLoadingState(true);
      this.clearErrors();

      const session = await this.createCheckoutSession();

      if (session && session.id) {
        const result = await this.stripe.redirectToCheckout({
          sessionId: session.id
        });

        if (result.error) {
          throw new Error(result.error.message);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.showPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      this.showLoadingState(false);
    }
  }

  async createCheckoutSession() {
    try {
      const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: this.config.amount,
          currency: this.config.currency,
          product_name: this.config.productName,
          metadata: { user_id: '123' }
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  showLoadingState(isLoading) {
    if (!this.paymentButton) return;

    this.paymentButton.disabled = isLoading;
    this.paymentButton.innerHTML = isLoading
      ? '<span class="spinner"></span> Processing...'
      : `Proceed to Payment (USD ${(this.config.amount / 100).toFixed(2)})`;
  }

  showPaymentError(message) {
    this.clearErrors();

    const errorEl = document.createElement('div');
    errorEl.className = 'payment-error';
    errorEl.textContent = message;

    const container = document.querySelector('.payment-container');
    if (container) {
      container.appendChild(errorEl);
      setTimeout(() => errorEl.remove(), 5000);
    }
  }

  clearErrors() {
    const errors = document.querySelectorAll('.payment-error');
    errors.forEach(error => error.remove());
  }
}

if (!window.stripeIntegration) {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      window.stripeIntegration = new StripeIntegration();
    } catch (error) {
      console.error('Failed to initialize Stripe integration:', error);
    }
  });
}