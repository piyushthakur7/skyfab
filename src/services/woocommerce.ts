/**
 * WooCommerce API service
 * This service handles communication with the WordPress/WooCommerce backend.
 * 
 * CORS & Security Strategy:
 * - Development: Vite dev server proxies /wp-json/* to the WC backend using local .env keys.
 * - Production: All calls go to /api/wc (Vercel Serverless Function) which securely 
 *   appends the API keys on the server side, keeping them hidden from the browser.
 */

const WC_CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || '';

const isDev = import.meta.env.DEV;

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: Array<{ id: number; src: string; name: string; alt: string; }>;
  categories: Array<{ id: number; name: string; slug: string; }>;
  attributes: Array<{ id: number; name: string; options: string[]; }>;
}

export interface WCOrder {
  id: number;
  status: string; // 'pending', 'processing', 'completed', 'cancelled'
  currency: string;
  total: string;
  date_created: string;
  billing: any;
  shipping: any;
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
  }>;
}

/**
 * Build the correct API URL based on environment.
 * - Dev:  /wp-json/wc/v3/...
 * - Prod: /api/wc
 */
const buildWcUrl = () => {
  if (isDev) {
    return `/wp-json/wc/v3`;
  }
  return `/api/wc`;
};

/**
 * Build a non-WC WordPress REST API URL.
 */
const buildWpUrl = () => {
  if (isDev) {
    return `/wp-json`;
  }
  return `/api/wp`;
};

/**
 * Helper: attach auth params.
 * In development, we attach them in the browser.
 * In production, the serverless proxy attaches them securely.
 */
const authParams = () => {
  if (isDev) {
    return new URLSearchParams({
      consumer_key: WC_CONSUMER_KEY,
      consumer_secret: WC_CONSUMER_SECRET,
    });
  }
  // In production, we send no keys from the browser. The proxy adds them.
  return new URLSearchParams();
};

// ========================
// Product Methods
// ========================

export async function getProducts(params: Record<string, any> = {}) {
  const qp = authParams();
  if (!isDev) qp.set('path', 'products'); // Add path for proxy
  Object.entries(params).forEach(([k, v]) => qp.set(k, String(v)));

  try {
    const url = `${buildWcUrl()}${isDev ? '/products' : ''}?${qp.toString()}`;
    console.log('[WC] Fetching products:', url.replace(/consumer_secret=[^&]+/, 'consumer_secret=***'));
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error('[WC] Products API error:', response.status, text.substring(0, 200));
      throw new Error(`WooCommerce API Error: ${response.status}`);
    }
    const data = await response.json();
    console.log('[WC] Products fetched:', Array.isArray(data) ? data.length : 'non-array response');
    return (Array.isArray(data) ? data : []) as WCProduct[];
  } catch (error) {
    console.error('[WC] Error fetching products:', error);
    return [];
  }
}

export async function getProduct(id: number | string) {
  const qp = authParams();
  if (!isDev) qp.set('path', `products/${id}`);
  try {
    const url = `${buildWcUrl()}${isDev ? `/products/${id}` : ''}?${qp.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch product ${id}: ${response.status}`);
    return (await response.json()) as WCProduct;
  } catch (error) {
    console.error(`[WC] Error fetching product ${id}:`, error);
    return null;
  }
}

export async function getCategories() {
  const qp = authParams();
  if (!isDev) qp.set('path', 'products/categories');
  qp.set('per_page', '100');
  try {
    const url = `${buildWcUrl()}${isDev ? '/products/categories' : ''}?${qp.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[WC] Error fetching categories:', error);
    return [];
  }
}

export async function validateConnection() {
  try {
    const categories = await getCategories();
    return categories && Array.isArray(categories);
  } catch (e) {
    return false;
  }
}

// ========================
// Auth Methods (JWT Plugin Required)
// ========================

export async function loginUser(username: string, password: string) {
  try {
    const qp = new URLSearchParams();
    if (!isDev) qp.set('path', 'jwt-auth/v1/token');
    const url = `${buildWpUrl()}${isDev ? '/jwt-auth/v1/token' : ''}${!isDev ? `?${qp.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok || !data.token) throw new Error(data.message || 'Login failed');
    return data; // { token, user_email, user_nicename, user_display_name }
  } catch (err: any) {
    throw new Error(err.message);
  }
}

// ========================
// Order & Profile Methods
// ========================

export async function createOrder(orderData: any, token: string = '') {
  try {
    const qp = authParams();
    if (!isDev) qp.set('path', 'orders');
    const url = `${buildWcUrl()}${isDev ? '/orders' : ''}?${qp.toString()}`;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Order failed');
    }
    return await response.json();
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function getCustomerOrders(customerId: number, token?: string) {
  try {
    const qp = authParams();
    if (!isDev) qp.set('path', 'orders');
    qp.set('customer', customerId.toString());
    const url = `${buildWcUrl()}${isDev ? '/orders' : ''}?${qp.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch orders failed');
    return (await response.json()) as WCOrder[];
  } catch (err: any) {
    console.error('[WC] Error fetching orders:', err);
    return [];
  }
}

// ========================
// Post-Delivery Interactions
// ========================

export async function createProductReview(productId: number, review: string, rating: number, reviewerName: string, reviewerEmail: string) {
  try {
    const qp = authParams();
    if (!isDev) qp.set('path', 'products/reviews');
    const url = `${buildWcUrl()}${isDev ? '/products/reviews' : ''}?${qp.toString()}`;
    const payload = {
      product_id: productId,
      review: review,
      reviewer: reviewerName,
      reviewer_email: reviewerEmail,
      rating: rating,
      status: 'approved'
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Review submission failed');
    return await response.json();
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function requestOrderReturn(orderId: number, reason: string) {
  try {
    const qp = authParams();
    if (!isDev) qp.set('path', `orders/${orderId}/notes`);
    const url = `${buildWcUrl()}${isDev ? `/orders/${orderId}/notes` : ''}?${qp.toString()}`;
    const payload = {
      note: `Customer Return Request: ${reason}`,
      customer_note: false
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Return request failed');
    return await response.json();
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export async function updateOrderPaymentStatus(orderId: number, paymentId: string, status: string = 'processing') {
  try {
    const qp = authParams();
    if (!isDev) qp.set('path', `orders/${orderId}`);
    const url = `${buildWcUrl()}${isDev ? `/orders/${orderId}` : ''}?${qp.toString()}`;
    const payload = {
      status: status,
      set_paid: true,
      transaction_id: paymentId,
      meta_data: [
        {
          key: '_razorpay_payment_id',
          value: paymentId
        }
      ]
    };
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Order status update failed');
    return await response.json();
  } catch (err: any) {
    throw new Error(err.message);
  }
}
