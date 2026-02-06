import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import store from '../store/store';
import { setOrderType, setBranchName, setAddress } from '../store/slices/userSlice';
import { setCartOrderType, setCartBranchName } from '../store/slices/cartSlice';
import { RootStackParamList } from '../navigation/NavigationStack';

/**
 * ============================================================
 * NavigationHelper - Handles deep linking & push notifications
 * ============================================================
 *
 * RECEIVED FROM BACKEND (notification payload or deep link params):
 * {
 *   screen: "orders",        // Required - which screen to open
 *   order_type: "delivery",  // Required - delivery | takeaway | dine-in
 *   menu_type: "delivery",   // Required - matches order_type
 *   id: 123                  // Optional - used for order_details, track_order, offer_details
 * }
 *
 * This object comes from:
 * - Push notification data (when user taps a notification)
 * - Deep link URL (when user opens crepaway://delivery/orders)
 */

// Valid values for order_type and menu_type (from backend)
export type OrderFlowType = 'delivery' | 'takeaway' | 'dine-in';

// Params received from backend - same shape whether from notification or deep link
export interface NavParams {
  screen: string;
  order_type?: OrderFlowType | string;
  menu_type?: OrderFlowType | string;
  id?: number;
  [key: string]: unknown;
}

// Backend sends "Orders" or "order_details" - we map to our internal screen types
export type DeepLinkScreen =
  | 'home' | 'offers' | 'offer_details' | 'cart' | 'checkout'
  | 'orders' | 'order_details' | 'track_order'
  | 'favorites' | 'profile' | 'wallet' | 'notifications' | 'search'
  | 'dine_in_table' | 'dine_in_checkout' | 'dine_in_pending' | 'dine_in_order';

const SCREEN_MAP: Record<string, DeepLinkScreen> = {
  'home': 'home', 'Home': 'home',
  'offers': 'offers', 'Offers': 'offers',
  'offer_details': 'offer_details', 'OfferDetails': 'offer_details',
  'cart': 'cart', 'Cart': 'cart',
  'checkout': 'checkout', 'Checkout': 'checkout',
  'orders': 'orders', 'Orders': 'orders',
  'order_details': 'order_details', 'OrderDetails': 'order_details',
  'track_order': 'track_order', 'TrackOrder': 'track_order',
  'favorites': 'favorites', 'Favorites': 'favorites',
  'profile': 'profile', 'Profile': 'profile',
  'wallet': 'wallet', 'Wallet': 'wallet',
  'notifications': 'notifications', 'Notifications': 'notifications',
  'search': 'search', 'Search': 'search',
  'dine_in_table': 'dine_in_table', 'Table': 'dine_in_table', 'table': 'dine_in_table',
  'dine_in_checkout': 'dine_in_checkout', 'DineInCheckout': 'dine_in_checkout',
  'dine_in_pending': 'dine_in_pending', 'Pending': 'dine_in_pending', 'pending': 'dine_in_pending',
  'dine_in_order': 'dine_in_order', 'DineInOrder': 'dine_in_order',
};

class NavigationHelper {
  private navRef: NavigationContainerRef<RootStackParamList> | null = null;
  private static instance: NavigationHelper | null = null;
  private pending: NavParams | null = null;  // Store navigation to retry after switching flow

  private constructor() {}

  static getInstance(): NavigationHelper {
    if (!NavigationHelper.instance) {
      NavigationHelper.instance = new NavigationHelper();
    }
    return NavigationHelper.instance;
  }

  /** NavigationStack calls this - gives us access to navigate */
  setNavigationRef(ref: NavigationContainerRef<RootStackParamList>) {
    this.navRef = ref;
  }

  /** Converts backend screen name ("Orders") to our internal type ("orders") */
  mapScreen(name: string): DeepLinkScreen | null {
    return SCREEN_MAP[name] || null;
  }

  /**
   * MAIN ENTRY - Called with params received from backend
   * { screen, order_type, menu_type, id? }
   */
  navigate(params: NavParams): boolean {
    if (!this.navRef?.isReady()) return false;

    const { isLoggedIn, orderType: storeOrderType } = this.getState();
    if (!isLoggedIn) return false;

    // From backend object - defaults to delivery if not provided
    const orderType = params.order_type || storeOrderType || 'delivery';
    const menuType = params.menu_type || orderType;
    const screen = this.mapScreen(params.screen);

    if (!screen) return false;

    const currentRoute = this.getCurrentRoute();

    // User in delivery/takeaway flow - both use DeliveryTakeaway route
    if (currentRoute === 'DeliveryTakeaway' && orderType !== 'dine-in') {
      const needsSwitch = storeOrderType !== orderType;

      // Fallback: different service requested → go to ServiceSelectionScreen
      // User explicitly picks service + branch/address
      if (needsSwitch) {
        store.dispatch(setOrderType({ orderTypeAlias: null, menuType: null }));
        return true;
      }

      return this.goDelivery(screen, params);
    }

    // User in dine-in flow
    if (currentRoute === 'DineIn' && orderType === 'dine-in') {
      return this.goDineIn(screen, params);
    }

    // Fallback: different service (e.g. in delivery, link says dine-in) → ServiceSelectionScreen
    if ((currentRoute === 'DineIn' && orderType !== 'dine-in') ||
        (currentRoute === 'DeliveryTakeaway' && orderType === 'dine-in')) {
      store.dispatch(setOrderType({ orderTypeAlias: null, menuType: null }));
      return true;
    }

    // User on ServiceSelection or wrong flow - set orderType in Redux first, then retry
    return this.switchFlowAndNavigate(
      orderType as 'delivery' | 'takeaway' | 'dine-in',
      menuType,
      screen,
      params
    );
  }

  /** Set orderType in Redux, wait for re-render, then call navigate() again */
  private switchFlowAndNavigate(
    orderType: 'delivery' | 'takeaway' | 'dine-in',
    menuType: string,
    screen: DeepLinkScreen,
    params: NavParams
  ): boolean {
    // Dine-in screens always use dine-in flow
    const finalOrderType = screen.startsWith('dine_in_') ? 'dine-in' : orderType;
    const finalMenuType = screen.startsWith('dine_in_') ? 'dine-in' : menuType;

    this.pending = { ...params, screen };

    store.dispatch(setOrderType({
      orderTypeAlias: finalOrderType,
      menuType: finalMenuType as OrderFlowType,
    }));
    store.dispatch(setCartOrderType(finalOrderType as OrderFlowType));

    if (finalOrderType === 'delivery') {
      store.dispatch(setBranchName(null));
      store.dispatch(setCartBranchName(null));
    } else if (finalOrderType === 'takeaway') {
      store.dispatch(setAddress({ id: null, title: null, latitude: null, longitude: null }));
      store.dispatch(setBranchName(null));
      store.dispatch(setCartBranchName(null));
    }

    setTimeout(() => {
      if (this.pending) {
        const p = this.pending;
        this.pending = null;
        this.navigate(p);
      }
    }, 150);

    return true;
  }

  /** Navigate within DeliveryTakeaway tab navigator with proper back stack */
  private goDelivery(screen: DeepLinkScreen, p: NavParams): boolean {
    const goWithStack = (
      tab: string,
      routes: Array<{ name: string; params?: Record<string, unknown> }>,
    ) => {
      if (routes.length === 1) {
        this.navRef?.dispatch(CommonActions.navigate('DeliveryTakeaway', {
          screen: tab,
          params: { screen: routes[0].name, ...(routes[0].params && { params: routes[0].params }) },
        }));
      } else {
        this.navRef?.dispatch(CommonActions.navigate('DeliveryTakeaway', {
          screen: tab,
          params: {
            state: { routes, index: routes.length - 1 },
          },
        }));
      }
    };

    switch (screen) {
      case 'home':
        goWithStack('HomeStack', [{ name: 'Home' }]);
        break;
      case 'offers':
        goWithStack('HomeStack', [{ name: 'Home' }, { name: 'Offers' }]);
        break;
      case 'offer_details':
        goWithStack('HomeStack', [
          { name: 'Home' },
          { name: 'Offers' },
          { name: 'OfferDetails', params: { itemId: p.id } },
        ]);
        break;
      case 'cart':
        goWithStack('HomeStack', [{ name: 'Home' }, { name: 'Cart' }]);
        break;
      case 'checkout':
        goWithStack('HomeStack', [
          { name: 'Home' },
          { name: 'Cart' },
          { name: 'Checkout' },
        ]);
        break;
      case 'notifications':
        goWithStack('HomeStack', [{ name: 'Home' }, { name: 'Notifications' }]);
        break;
      case 'orders':
        goWithStack('OrderStack', [{ name: 'Orders' }]);
        break;
      case 'order_details':
        goWithStack('OrderStack', [
          { name: 'Orders' },
          {
            name: 'OrderDetails',
            params: { id: p.id ?? 0, order_type: (p.order_type as string) || 'delivery' },
          },
        ]);
        break;
      case 'track_order':
        goWithStack('OrderStack', [
          { name: 'Orders' },
          {
            name: 'TrackOrder',
            params: {
              orderId: p.id ?? 0,
              order_type: (p.order_type as string) || 'delivery',
            },
          },
        ]);
        break;
      case 'favorites':
        goWithStack('FavoritesStack', [{ name: 'Favorites' }]);
        break;
      case 'profile':
        goWithStack('ProfileStack', [{ name: 'Profile' }]);
        break;
      case 'wallet':
        goWithStack('ProfileStack', [{ name: 'Profile' }, { name: 'Wallet' }]);
        break;
      case 'search':
        goWithStack('SearchStack', [{ name: 'Search' }]);
        break;
      default:
        goWithStack('HomeStack', [{ name: 'Home' }]);
        break;
    }
    return true;
  }

  /** Navigate within DineIn stack */
  private goDineIn(screen: DeepLinkScreen, p: NavParams): boolean {
    // Params for DineIn navigation: { screen, params?: { screen, params? } }
    type DineInParams = {
      screen: string;
      params?: { screen: string; params?: Record<string, unknown> };
    };

    const go = (scr: string, nested?: string, prm?: Record<string, unknown>) => {
      const params: DineInParams = { screen: scr };
      if (nested) {
        params.params = { screen: nested };
        if (prm) params.params.params = prm;
      }
      this.navRef?.dispatch(CommonActions.navigate({ name: 'DineIn', params }));
    };

    switch (screen) {
      case 'home':
      case 'dine_in_table': go('Table'); break;
      case 'checkout':
      case 'dine_in_checkout': go('Checkout'); break;
      case 'dine_in_pending': go('Pending'); break;
      case 'dine_in_order': go('OrderStack', 'Order'); break;
      case 'offers': go('OrderStack', 'OffersStack', { screen: 'Offers' }); break;
      case 'offer_details': go('OrderStack', 'OffersStack', { screen: 'OfferDetails', params: { itemId: p.id } }); break;
      case 'favorites': go('OrderStack', 'Favorites'); break;
      default: go('Table'); break;
    }
    return true;
  }

  /** Get current user state from Redux */
  private getState() {
    const state = store.getState();
    return {
      isLoggedIn: state.user.isLoggedIn,
      orderType: state.user.orderType,
    };
  }

  /** Get current root screen name (DeliveryTakeaway, DineIn, etc.) */
  private getCurrentRoute(): string | null {
    const state = this.navRef?.getRootState();
    return state?.routes?.[state.index ?? 0]?.name ?? null;
  }
}

export default NavigationHelper;
