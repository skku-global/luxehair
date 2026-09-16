/**
 * API Service Layer
 * Centralized fetch client handling authentication headers,
 * JSON serialization, and error mapping.
 */

const BASE_URL = '/api';

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (includeAuth) {
    const token = localStorage.getItem('luxehair_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // Brand
  getBrandConfig: () => fetch(`${BASE_URL}/brand`).then(handleResponse),

  // Authentication
  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials)
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(userData)
    }).then(handleResponse),

  getCurrentUser: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(true)
    }).then(handleResponse),

  updateProfile: (profileData) =>
    fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(profileData)
    }).then(handleResponse),

  saveAddress: (addressData) =>
    fetch(`${BASE_URL}/auth/addresses`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(addressData)
    }).then(handleResponse),

  deleteAddress: (id) =>
    fetch(`${BASE_URL}/auth/addresses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    }).then(handleResponse),

  // Products
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    return fetch(`${BASE_URL}/products?${searchParams.toString()}`).then(handleResponse);
  },

  getFeaturedProducts: () =>
    fetch(`${BASE_URL}/products/featured`).then(handleResponse),

  getProductByIdOrSlug: (idOrSlug) =>
    fetch(`${BASE_URL}/products/${idOrSlug}`).then(handleResponse),

  // Admin Product CRUD
  createProduct: (productData) =>
    fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(productData)
    }).then(handleResponse),

  updateProduct: (id, productData) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(productData)
    }).then(handleResponse),

  deleteProduct: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    }).then(handleResponse),

  // Orders
  createOrder: (orderData) =>
    fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(orderData)
    }).then(handleResponse),

  getMyOrders: () =>
    fetch(`${BASE_URL}/orders/my-orders`, {
      headers: getHeaders(true)
    }).then(handleResponse),

  getOrderByNumber: (orderNumber) =>
    fetch(`${BASE_URL}/orders/${orderNumber}`).then(handleResponse),

  getAllOrders: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return fetch(`${BASE_URL}/orders?${searchParams.toString()}`, {
      headers: getHeaders(true)
    }).then(handleResponse);
  },

  updateOrderStatus: (orderId, statusData) =>
    fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(statusData)
    }).then(handleResponse),

  // Payment
  initializePaystack: (orderNumber, callbackUrl) =>
    fetch(`${BASE_URL}/payment/paystack/initialize`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ orderNumber, callbackUrl })
    }).then(handleResponse),

  verifyPaystackPayment: (reference, orderNumber) =>
    fetch(`${BASE_URL}/payment/paystack/verify/${reference}?orderNumber=${orderNumber || ''}`).then(handleResponse),

  submitBankTransferProof: (proofData) =>
    fetch(`${BASE_URL}/payment/bank-transfer/submit-proof`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(proofData)
    }).then(handleResponse),

  // Stripe Dual Payment (USD / International)
  createStripeSession: (orderNumber, callbackUrl) =>
    fetch(`${BASE_URL}/payment/stripe/create-checkout-session`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ orderNumber, callbackUrl })
    }).then(handleResponse),

  verifyStripePayment: (sessionId, orderNumber) =>
    fetch(`${BASE_URL}/payment/stripe/verify/${sessionId}?orderNumber=${orderNumber || ''}`).then(handleResponse)
};
