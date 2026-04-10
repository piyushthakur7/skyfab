/**
 * WooCommerce API service
 * This service handles communication with the WordPress/WooCommerce backend.
 * 
 * Documentation: https://woocommerce.github.io/woocommerce-rest-api-docs/
 */

const WC_URL = import.meta.env.VITE_WC_URL || 'https://your-wordpress-site.com';
const WC_CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || '';

/**
 * Interface for WooCommerce Product
 */
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
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
}

/**
 * Fetches products from WooCommerce
 */
export async function getProducts(params: Record<string, any> = {}) {
  const queryParams = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY,
    consumer_secret: WC_CONSUMER_SECRET,
    ...params,
  });

  try {
    const url = `${WC_URL.replace(/\/$/, '')}/wp-json/wc/v3/products?${queryParams.toString()}`;
    const response = await fetch(url);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but received:', text.substring(0, 200));
      throw new Error(`WooCommerce API returned non-JSON response (${response.status}). Check server configuration.`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WooCommerce API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data as WCProduct[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetches a single product by ID or Slug
 */
export async function getProduct(id: number | string) {
  const queryParams = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY,
    consumer_secret: WC_CONSUMER_SECRET,
  });

  try {
    const url = `${WC_URL.replace(/\/$/, '')}/wp-json/wc/v3/products/${id}?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as WCProduct;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Fetches categories from WooCommerce
 */
export async function getCategories() {
  const queryParams = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY,
    consumer_secret: WC_CONSUMER_SECRET,
  });

  try {
    const url = `${WC_URL.replace(/\/$/, '')}/wp-json/wc/v3/products/categories?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Validates the connection to WooCommerce
 */
export async function validateConnection() {
  try {
    const categories = await getCategories();
    return categories && Array.isArray(categories);
  } catch (e) {
    return false;
  }
}
