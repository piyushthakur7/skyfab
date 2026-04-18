/**
 * WooCommerce API service
 * This service handles communication with the WordPress/WooCommerce backend.
 */

const WC_URL = import.meta.env.VITE_WC_URL || 'https://your-wordpress-site.com';
const WC_CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || '';

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

const getBaseUrl = () => WC_URL.replace(/\/$/, '');

// ========================
// Existing Product Methods
// ========================

export async function getProducts(params: Record<string, any> = {}) {
  const queryParams = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY,
    consumer_secret: WC_CONSUMER_SECRET,
    ...params,
  });

  try {
    const url = `${getBaseUrl()}/wp-json/wc/v3/products?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`WooCommerce API Error`);
    return (await response.json()) as WCProduct[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProduct(id: number | string) {
  const queryParams = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY,
    consumer_secret: WC_CONSUMER_SECRET,
  });
  try {
    const url = `${getBaseUrl()}/wp-json/wc/v3/products/${id}?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch product`);
    return (await response.json()) as WCProduct;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function getCategories() {
  const queryParams = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY,
    consumer_secret: WC_CONSUMER_SECRET,
  });
  try {
    const url = `${getBaseUrl()}/wp-json/wc/v3/products/categories?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch categories`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
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
  // Uses JWT Authentication for WP REST API plugin
  try {
    const url = `${getBaseUrl()}/wp-json/jwt-auth/v1/token`;
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
    const queryParams = new URLSearchParams({
      consumer_key: WC_CONSUMER_KEY,
      consumer_secret: WC_CONSUMER_SECRET,
    });
    const url = `${getBaseUrl()}/wp-json/wc/v3/orders?${queryParams.toString()}`;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`; // Option to bind order to user
    
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
    const queryParams = new URLSearchParams({
      consumer_key: WC_CONSUMER_KEY,
      consumer_secret: WC_CONSUMER_SECRET,
      customer: customerId.toString()
    });
    const url = `${getBaseUrl()}/wp-json/wc/v3/orders?${queryParams.toString()}`;
    // Using consumer keys is sufficient since WC API handles filtering by customer
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch orders failed');
    return (await response.json()) as WCOrder[];
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

// ========================
// Post-Delivery Interactions
// ========================

export async function createProductReview(productId: number, review: string, rating: number, reviewerName: string, reviewerEmail: string) {
  try {
    const queryParams = new URLSearchParams({
      consumer_key: WC_CONSUMER_KEY,
      consumer_secret: WC_CONSUMER_SECRET,
    });
    const url = `${getBaseUrl()}/wp-json/wc/v3/products/reviews?${queryParams.toString()}`;
    const payload = {
      product_id: productId,
      review: review,
      reviewer: reviewerName,
      reviewer_email: reviewerEmail,
      rating: rating,
      status: 'approved' // Or 'hold' based on settings
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
  // Uses WooCommerce Order Notes to communicate return request to admin
  try {
    const queryParams = new URLSearchParams({
      consumer_key: WC_CONSUMER_KEY,
      consumer_secret: WC_CONSUMER_SECRET,
    });
    const url = `${getBaseUrl()}/wp-json/wc/v3/orders/${orderId}/notes?${queryParams.toString()}`;
    const payload = {
      note: `Customer Return Request: ${reason}`,
      customer_note: false // true if customer should see it, false means private to admin
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
