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
    const response = await fetch(`${WC_URL}/wp-json/wc/v3/products?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
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
    const response = await fetch(`${WC_URL}/wp-json/wc/v3/products/${id}?${queryParams.toString()}`);
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
    const response = await fetch(`${WC_URL}/wp-json/wc/v3/products/categories?${queryParams.toString()}`);
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
