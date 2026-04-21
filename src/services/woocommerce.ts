/**
 * WooCommerce API service
 * This service handles communication with the WordPress/WooCommerce backend.
 * 
 * CORS Strategy:
 * - Development: Vite dev server proxies /wp-json/* to the WC backend
 * - Production: Vercel rewrites proxy /api/wc/* to the WC backend's /wp-json/wc/v3/*
 * Both approaches avoid CORS issues by making the browser see same-origin requests.
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
 * - Dev:  /wp-json/wc/v3/products  (Vite proxy handles it)
 * - Prod: /api/wc/products          (Vercel rewrite handles it)
 */
const buildWcUrl = (endpoint: string) => {
  if (isDev) {
    // Vite proxy: /wp-json/* → WooCommerce backend
    return `/wp-json/wc/v3/${endpoint}`;
  }
  // Production: Vercel rewrite /api/wc/* → WooCommerce /wp-json/wc/v3/*
  return `/api/wc/${endpoint}`;
};

/**
 * Build a non-WC WordPress REST API URL (e.g., JWT auth).
 * - Dev:  /wp-json/jwt-auth/v1/token
 * - Prod: /api/wp/jwt-auth/v1/token
 */
const buildWpUrl = (endpoint: string) => {
  if (isDev) {
    return `/wp-json/${endpoint}`;
  }
  return `/api/wp/${endpoint}`;
};

// ========================
// Helper: attach auth params
// ========================

const authParams = () => new URLSearchParams({
  consumer_key: WC_CONSUMER_KEY,
  consumer_secret: WC_CONSUMER_SECRET,
});

// ========================
// Product Methods
// ========================

export async function getProducts(params: Record<string, any> = {}) {
  const qp = authParams();
  Object.entries(params).forEach(([k, v]) => qp.set(k, String(v)));

  try {
    const url = `${buildWcUrl('products')}?${qp.toString()}`;
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
  try {
    const url = `${buildWcUrl(`products/${id}`)}?${qp.toString()}`;
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
  qp.set('per_page', '100');
  try {
    const url = `${buildWcUrl('products/categories')}?${qp.toString()}`;
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
    const url = buildWpUrl('jwt-auth/v1/token');
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
    const url = `${buildWcUrl('orders')}?${qp.toString()}`;
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
    qp.set('customer', customerId.toString());
    const url = `${buildWcUrl('orders')}?${qp.toString()}`;
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
    const url = `${buildWcUrl('products/reviews')}?${qp.toString()}`;
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
    const url = `${buildWcUrl(`orders/${orderId}/notes`)}?${qp.toString()}`;
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
    const url = `${buildWcUrl(`orders/${orderId}`)}?${qp.toString()}`;
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
