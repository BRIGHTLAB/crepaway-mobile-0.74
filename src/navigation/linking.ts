import { LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';
import type { NavParams } from '../utils/NavigationHelper';
import NavigationHelper from '../utils/NavigationHelper';

/**
 * ============================================================
 * linking.ts - Deep Link URL Parser
 * ============================================================
 *
 * When user opens: crepaway://delivery/orders
 *
 * We parse the URL and convert it to the same shape as backend object:
 * {
 *   screen: "orders",
 *   order_type: "delivery",
 *   menu_type: "delivery"
 * }
 *
 * Then we call NavigationHelper.navigate() with that object.
 *
 * SUPPORTED URLS:
 * - crepaway://delivery/orders
 * - crepaway://delivery/orders/123/delivery     (order details)
 * - crepaway://delivery/orders/track/123        (track order)
 * - crepaway://delivery/home/cart
 * - crepaway://dine-in/table
 */

export const APP_SCHEME = 'crepaway';

/**
 * Parse deep link URL into NavParams (same shape as backend object)
 * crepaway://delivery/orders  →  { screen: "orders", order_type: "delivery", menu_type: "delivery" }
 */
function parseUrl(url: string): NavParams | null {
  try {
    // Remove scheme: crepaway:// or https://crepaway.com/
    const path = url
      .replace(`${APP_SCHEME}://`, '')
      .replace('https://crepaway.com/', '')
      .replace('https://app.crepaway.com/', '')
      .replace(/\/$/, '')  // trim trailing slash
      .trim();

    const segments = path.split('/').filter(Boolean);

    if (!segments.length) {
      return { screen: 'home', order_type: 'delivery', menu_type: 'delivery' };
    }

    const [flow, ...rest] = segments;

    // crepaway://delivery/... or crepaway://takeaway/...
    if (flow === 'delivery' || flow === 'takeaway') {
      const base: NavParams = { screen: 'home', order_type: flow, menu_type: flow };

      if (!rest.length) return base;

      const [section, ...args] = rest;

      // crepaway://delivery/orders
      if (section === 'orders') {
        if (!args.length) return { screen: 'orders', order_type: flow, menu_type: flow };
        if (args[0] === 'track') {
          return { screen: 'track_order', id: parseInt(args[1], 10), order_type: args[2] || flow, menu_type: flow };
        }
        return { screen: 'order_details', id: parseInt(args[0], 10), order_type: args[1] || flow, menu_type: flow };
      }

      // crepaway://delivery/home/cart, /home/checkout, /home/offers
      if (section === 'home') {
        if (!args.length) return base;
        if (args[0] === 'cart') return { screen: 'cart', order_type: flow, menu_type: flow };
        if (args[0] === 'checkout') return { screen: 'checkout', order_type: flow, menu_type: flow };
        if (args[0] === 'offers') {
          if (args[1]) return { screen: 'offer_details', id: parseInt(args[1], 10), order_type: flow, menu_type: flow };
          return { screen: 'offers', order_type: flow, menu_type: flow };
        }
        if (args[0] === 'notifications') return { screen: 'notifications', order_type: flow, menu_type: flow };
        return base;
      }

      // crepaway://delivery/profile, /profile/wallet
      if (section === 'profile') {
        if (args[0] === 'wallet') return { screen: 'wallet', order_type: flow, menu_type: flow };
        return { screen: 'profile', order_type: flow, menu_type: flow };
      }

      if (section === 'favorites') return { screen: 'favorites', order_type: flow, menu_type: flow };
      if (section === 'search') return { screen: 'search', order_type: flow, menu_type: flow };

      return base;
    }

    // crepaway://dine-in/...
    if (flow === 'dine-in') {
      const base: NavParams = { screen: 'dine_in_table', order_type: 'dine-in', menu_type: 'dine-in' };
      if (!rest.length) return base;

      if (rest[0] === 'table') return base;
      if (rest[0] === 'checkout') return { screen: 'dine_in_checkout', order_type: 'dine-in', menu_type: 'dine-in' };
      if (rest[0] === 'pending') return { screen: 'dine_in_pending', order_type: 'dine-in', menu_type: 'dine-in' };
      if (rest[0] === 'order') return { screen: 'dine_in_order', order_type: 'dine-in', menu_type: 'dine-in' };

      return base;
    }

    return { screen: 'home', order_type: 'delivery', menu_type: 'delivery' };
  } catch (e) {
    console.error('[linking] parseUrl error:', e);
    return null;
  }
}

// Store URL when app opened from closed state (nav not ready yet)
let pendingUrl: string | null = null;
export const setPendingDeepLink = (url: string | null) => { pendingUrl = url; };
export const clearPendingDeepLink = () => { pendingUrl = null; };

/** Process pending URL - call when NavigationContainer is ready */
export function processPendingDeepLink(): boolean {
  if (!pendingUrl) return false;
  const url = pendingUrl;
  clearPendingDeepLink();
  return handleDeepLink(url);
}

/** Parse URL and call NavigationHelper.navigate() */
function handleDeepLink(url: string): boolean {
  const params = parseUrl(url);
  if (!params) return false;
  return NavigationHelper.getInstance().navigate(params);
}

/** React Navigation linking config - pass to NavigationContainer */
export const linking: LinkingOptions<Record<string, unknown>> = {
  prefixes: [`${APP_SCHEME}://`, 'https://crepaway.com', 'https://app.crepaway.com'],

  // We handle navigation manually via handleDeepLink
  getStateFromPath: () => undefined,

  // App opened from deep link - store for later
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) setPendingDeepLink(url);
    return null;
  },

  // App already open - handle immediately
  subscribe(listener) {
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  },
};

export default linking;
