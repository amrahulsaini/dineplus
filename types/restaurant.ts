export interface Restaurant {
  id: string;
  name: string;
  slug: string; // URL-friendly: mts-123
  email: string;
  phone: string;
  address: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  settings: {
    currency: string;
    taxRate: number;
    timezone: string;
  };
}

export interface RestaurantMenuItem extends MenuItem {
  restaurantId: string;
  variations: MenuItemVariation[];
  addons: MenuItemAddon[];
}

export interface MenuItemVariation {
  id: string;
  name: string; // Small, Medium, Large
  price: number;
  isDefault: boolean;
}

export interface MenuItemAddon {
  id: string;
  name: string; // Extra Cheese, Extra Sauce
  price: number;
  category: string; // Toppings, Sides
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  location: string; // Indoor, Outdoor, VIP
  status: 'available' | 'occupied' | 'reserved';
}

export interface RestaurantCategory extends Category {
  restaurantId: string;
}

export interface RestaurantOrder extends Order {
  restaurantId: string;
  restaurantSlug: string;
}
