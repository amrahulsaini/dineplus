// Local Storage Utility Functions

const STORAGE_KEYS = {
  USER: 'dineplus_user',
  CART: 'dineplus_cart',
  ORDERS: 'dineplus_orders',
  MENU_ITEMS: 'dineplus_menu_items',
  CATEGORIES: 'dineplus_categories',
  TABLES: 'dineplus_tables',
  INVENTORY: 'dineplus_inventory',
  RESTAURANT: 'dineplus_restaurant',
  COOKIE_CONSENT: 'dineplus_cookie_consent',
} as const;

export const storage = {
  // Generic get/set functions
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Cookie management functions
export const cookies = {
  set: (name: string, value: string, days: number = 30): void => {
    if (typeof window === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  get: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  remove: (name: string): void => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },

  // Cookie consent management
  setCookieConsent: (accepted: boolean): void => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const consent = {
      accepted,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    storage.set(STORAGE_KEYS.COOKIE_CONSENT, consent);
    cookies.set('cookie_consent', accepted ? 'accepted' : 'declined', 30);
  },

  getCookieConsent: () => {
    return storage.get<{
      accepted: boolean;
      timestamp: string;
      expiresAt: string;
    }>(STORAGE_KEYS.COOKIE_CONSENT);
  },
};

export { STORAGE_KEYS };
