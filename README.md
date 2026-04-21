# Skyfab Overseas Worldwide

Global Textile Excellence. Connecting continents through quality, innovation, and trust.

## 🚀 Getting Started

This is a headless e-commerce frontend built with **React 19**, **Vite 6**, and **Tailwind CSS 4**, integrated with a WooCommerce backend.

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root (see [Environment Variables](#environment-variables))
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# WooCommerce API Configuration
VITE_WC_URL="https://your-wordpress-site.com/"
VITE_WC_CONSUMER_KEY="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VITE_WC_CONSUMER_SECRET="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
VITE_MERCHANT_NAME="Skyfab Overseas Worldwide"
```

## 📦 Deployment

### Production Build
To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Deployment Tips

> [!WARNING]
> **Windows Path Issue**: If you are developing on Windows, ensure the project folder name does not contain an ampersand (`&`). The current folder `loom-&-latitude` may cause build shell errors. Rename to `loom-and-latitude` if `npm run build` fails.

- **Vercel/Netlify**: Connect your GitHub repository and set the platform to "Vite". Add the environment variables in the project settings.
- **Base URL**: Ensure `VITE_WC_URL` includes the trailing slash.

## 📁 Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Main application pages (Home, Category, Auth, etc.)
- `src/services`: API services (WooCommerce integration).
- `src/context`: React context for cart and auth state.
- `public`: Static assets (favicon, images, etc.)
