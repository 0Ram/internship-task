/**
 * RomeLore Mock API Service
 * Simulates backend responses for development/testing
 */

const MOCK_DELAY = 300; // milliseconds to simulate network latency

const mockApiEndpoints = {
  // Raffle Module Endpoints
  '/api/raffle-status': (params) => {
    const userId = params.get('userId') || 'default-user';
    return {
      success: true,
      userId,
      tickets: Math.floor(Math.random() * 5), // Random tickets between 0-4
      lastEntry: new Date().toISOString()
    };
  },

  '/api/raffle-entry': (_, body) => {
    if (body.userId === 'error-user') {
      throw new Error('Simulated API error');
    }
    return {
      success: true,
      message: "You've entered the weekly raffle!",
      newTickets: 1,
      nextDraw: new Date(Date.now() + 7 * 86400000).toISOString()
    };
  },

  // Stripe Payment Endpoints
  '/api/create-checkout-session': () => ({
    id: `mock_session_${Math.random().toString(36).substring(2, 10)}`,
    amount: 100,
    currency: 'usd',
    payment_url: 'https://checkout.stripe.com/mock-payment'
  }),

  '/api/stripe-webhook': () => ({
    received: true,
    status: 'payment_succeeded',
    receipt_url: 'https://receipt.stripe.com/mock-receipt'
  })
};

const errorResponses = {
  400: { error: "Bad Request", status: 400 },
  401: { error: "Unauthorized", status: 401 },
  500: { error: "Internal Server Error", status: 500 }
};

// Store mock data between page reloads
window.mockApiStore = window.mockApiStore || {
  payments: [],
  raffleEntries: []
};

// Main mock fetch implementation
window.mockFetch = async (url, options = {}) => {
  const { pathname, searchParams } = new URL(url, window.location.origin);
  const endpoint = mockApiEndpoints[pathname];
  
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    if (!endpoint) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: "Endpoint not found", status: 404 })
      };
    }

    // Parse request body if present
    let body = {};
    if (options.body) {
      body = JSON.parse(options.body);
    }

    // Generate response
    const response = endpoint(searchParams, body, options);
    
    // Store successful entries
    if (pathname === '/api/raffle-entry' && response.success) {
      window.mockApiStore.raffleEntries.push({
        timestamp: new Date().toISOString(),
        userId: body.userId || 'anonymous'
      });
    }

    return {
      ok: true,
      status: 200,
      json: async () => response,
      text: async () => JSON.stringify(response)
    };

  } catch (error) {
    return {
      ok: false,
      status: 500,
      json: async () => ({
        error: error.message,
        status: 500
      })
    };
  }
};

// Override the global fetch only in development
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  window.originalFetch = window.fetch;
  window.fetch = window.mockFetch;
}

// Debug utilities
window.mockApi = {
  reset: () => {
    window.mockApiStore = {
      payments: [],
      raffleEntries: []
    };
    console.log('Mock API store reset');
  },
  getStore: () => window.mockApiStore,
  simulateError: (endpoint, errorCode = 500) => {
    mockApiEndpoints[endpoint] = () => {
      throw new Error(`Simulated ${errorCode} error`);
    };
    console.log(`Mock API: ${endpoint} will now return ${errorCode} error`);
  },
  restoreEndpoint: (endpoint) => {
    if (endpoint === '/api/raffle-status') {
      mockApiEndpoints[endpoint] = (params) => ({
        success: true,
        userId: params.get('userId') || 'default-user',
        tickets: Math.floor(Math.random() * 5)
      });
    }
    // Add other endpoint restores as needed
    console.log(`Mock API: ${endpoint} restored to default`);
  }
};

console.log('Mock API service initialized. Available commands:');
console.log('- mockApi.reset()');
console.log('- mockApi.getStore()');
console.log('- mockApi.simulateError(endpoint, errorCode)');
console.log('- mockApi.restoreEndpoint(endpoint)');


