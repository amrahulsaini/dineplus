import { MenuItem, Category, Order, Restaurant, Table, Inventory } from '@/types';

// Demo restaurant data
export const demoRestaurant: Restaurant = {
  id: 'rest-001',
  name: 'Loopwar Restaurant',
  address: '123 Food Street, Gourmet City, 400001',
  phone: '+91 98765 43210',
  email: 'contact@loopwar.com',
  openingTime: '09:00',
  closingTime: '23:00',
  isOpen: true,
  taxRate: 5, // 5% GST
  currency: '₹',
};

// Demo categories
export const demoCategories: Category[] = [
  {
    id: 'cat-001',
    name: 'Starters',
    description: 'Delicious appetizers to start your meal',
    isActive: true,
    order: 1,
  },
  {
    id: 'cat-002',
    name: 'Main Course',
    description: 'Hearty main dishes',
    isActive: true,
    order: 2,
  },
  {
    id: 'cat-003',
    name: 'Biryani & Rice',
    description: 'Aromatic rice dishes',
    isActive: true,
    order: 3,
  },
  {
    id: 'cat-004',
    name: 'Breads',
    description: 'Freshly baked breads',
    isActive: true,
    order: 4,
  },
  {
    id: 'cat-005',
    name: 'Desserts',
    description: 'Sweet treats to end your meal',
    isActive: true,
    order: 5,
  },
  {
    id: 'cat-006',
    name: 'Beverages',
    description: 'Refreshing drinks',
    isActive: true,
    order: 6,
  },
];

// Demo menu items
export const demoMenuItems: MenuItem[] = [
  // Starters
  {
    id: 'item-001',
    name: 'Paneer Tikka',
    description: 'Marinated cottage cheese grilled to perfection',
    price: 249,
    categoryId: 'cat-001',
    isAvailable: true,
    isVeg: true,
    preparationTime: 15,
    tags: ['popular', 'spicy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-002',
    name: 'Chicken Wings',
    description: 'Crispy fried chicken wings with special sauce',
    price: 299,
    categoryId: 'cat-001',
    isAvailable: true,
    isVeg: false,
    preparationTime: 20,
    tags: ['popular', 'spicy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-003',
    name: 'Veg Spring Rolls',
    description: 'Crispy rolls filled with vegetables',
    price: 179,
    categoryId: 'cat-001',
    isAvailable: true,
    isVeg: true,
    preparationTime: 12,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-004',
    name: 'Fish Fingers',
    description: 'Crispy breaded fish strips',
    price: 329,
    categoryId: 'cat-001',
    isAvailable: true,
    isVeg: false,
    preparationTime: 18,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Main Course
  {
    id: 'item-005',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken',
    price: 349,
    categoryId: 'cat-002',
    isAvailable: true,
    isVeg: false,
    preparationTime: 25,
    tags: ['popular', 'chef-special'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-006',
    name: 'Paneer Butter Masala',
    description: 'Rich and creamy cottage cheese curry',
    price: 299,
    categoryId: 'cat-002',
    isAvailable: true,
    isVeg: true,
    preparationTime: 20,
    tags: ['popular'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-007',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils with butter and cream',
    price: 229,
    categoryId: 'cat-002',
    isAvailable: true,
    isVeg: true,
    preparationTime: 15,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-008',
    name: 'Mutton Rogan Josh',
    description: 'Aromatic lamb curry with spices',
    price: 449,
    categoryId: 'cat-002',
    isAvailable: true,
    isVeg: false,
    preparationTime: 30,
    tags: ['spicy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Biryani & Rice
  {
    id: 'item-009',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice layered with spiced chicken',
    price: 329,
    categoryId: 'cat-003',
    isAvailable: true,
    isVeg: false,
    preparationTime: 35,
    tags: ['popular', 'chef-special'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-010',
    name: 'Veg Biryani',
    description: 'Aromatic rice with mixed vegetables',
    price: 249,
    categoryId: 'cat-003',
    isAvailable: true,
    isVeg: true,
    preparationTime: 30,
    tags: ['popular'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-011',
    name: 'Jeera Rice',
    description: 'Basmati rice tempered with cumin',
    price: 149,
    categoryId: 'cat-003',
    isAvailable: true,
    isVeg: true,
    preparationTime: 12,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Breads
  {
    id: 'item-012',
    name: 'Butter Naan',
    description: 'Soft leavened bread with butter',
    price: 49,
    categoryId: 'cat-004',
    isAvailable: true,
    isVeg: true,
    preparationTime: 8,
    tags: ['popular'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-013',
    name: 'Garlic Naan',
    description: 'Naan topped with garlic and coriander',
    price: 59,
    categoryId: 'cat-004',
    isAvailable: true,
    isVeg: true,
    preparationTime: 8,
    tags: ['popular'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-014',
    name: 'Tandoori Roti',
    description: 'Whole wheat bread from tandoor',
    price: 29,
    categoryId: 'cat-004',
    isAvailable: true,
    isVeg: true,
    preparationTime: 6,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Desserts
  {
    id: 'item-015',
    name: 'Gulab Jamun',
    description: 'Sweet dumplings in sugar syrup (2 pcs)',
    price: 89,
    categoryId: 'cat-005',
    isAvailable: true,
    isVeg: true,
    preparationTime: 5,
    tags: ['popular'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-016',
    name: 'Rasmalai',
    description: 'Soft cheese patties in sweetened milk (2 pcs)',
    price: 99,
    categoryId: 'cat-005',
    isAvailable: true,
    isVeg: true,
    preparationTime: 5,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-017',
    name: 'Ice Cream',
    description: 'Choice of vanilla, chocolate, or mango',
    price: 79,
    categoryId: 'cat-005',
    isAvailable: true,
    isVeg: true,
    preparationTime: 3,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Beverages
  {
    id: 'item-018',
    name: 'Mango Lassi',
    description: 'Refreshing yogurt drink with mango',
    price: 89,
    categoryId: 'cat-006',
    isAvailable: true,
    isVeg: true,
    preparationTime: 5,
    tags: ['popular'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-019',
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea',
    price: 39,
    categoryId: 'cat-006',
    isAvailable: true,
    isVeg: true,
    preparationTime: 5,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-020',
    name: 'Fresh Lime Soda',
    description: 'Fizzy lime drink (Sweet/Salt)',
    price: 59,
    categoryId: 'cat-006',
    isAvailable: true,
    isVeg: true,
    preparationTime: 3,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-021',
    name: 'Soft Drinks',
    description: 'Coke, Pepsi, Sprite, Fanta',
    price: 49,
    categoryId: 'cat-006',
    isAvailable: true,
    isVeg: true,
    preparationTime: 2,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Demo tables
export const demoTables: Table[] = [
  { id: 'table-001', number: 1, capacity: 2, status: 'available' },
  { id: 'table-002', number: 2, capacity: 2, status: 'available' },
  { id: 'table-003', number: 3, capacity: 4, status: 'available' },
  { id: 'table-004', number: 4, capacity: 4, status: 'available' },
  { id: 'table-005', number: 5, capacity: 6, status: 'available' },
  { id: 'table-006', number: 6, capacity: 6, status: 'available' },
  { id: 'table-007', number: 7, capacity: 8, status: 'available' },
  { id: 'table-008', number: 8, capacity: 4, status: 'available' },
];

// Demo inventory
export const demoInventory: Inventory[] = [
  {
    id: 'inv-001',
    itemName: 'Chicken (kg)',
    quantity: 50,
    unit: 'kg',
    lowStockThreshold: 10,
    lastRestocked: new Date().toISOString(),
  },
  {
    id: 'inv-002',
    itemName: 'Paneer (kg)',
    quantity: 30,
    unit: 'kg',
    lowStockThreshold: 5,
    lastRestocked: new Date().toISOString(),
  },
  {
    id: 'inv-003',
    itemName: 'Rice (kg)',
    quantity: 100,
    unit: 'kg',
    lowStockThreshold: 20,
    lastRestocked: new Date().toISOString(),
  },
  {
    id: 'inv-004',
    itemName: 'Flour (kg)',
    quantity: 80,
    unit: 'kg',
    lowStockThreshold: 15,
    lastRestocked: new Date().toISOString(),
  },
  {
    id: 'inv-005',
    itemName: 'Tomatoes (kg)',
    quantity: 40,
    unit: 'kg',
    lowStockThreshold: 10,
    lastRestocked: new Date().toISOString(),
  },
];

// Function to initialize demo data
export const initializeDemoData = () => {
  if (typeof window === 'undefined') return;

  const { storage, STORAGE_KEYS } = require('./localStorage');

  // Only initialize if data doesn't exist
  if (!storage.get(STORAGE_KEYS.RESTAURANT)) {
    storage.set(STORAGE_KEYS.RESTAURANT, demoRestaurant);
  }
  if (!storage.get(STORAGE_KEYS.CATEGORIES)) {
    storage.set(STORAGE_KEYS.CATEGORIES, demoCategories);
  }
  if (!storage.get(STORAGE_KEYS.MENU_ITEMS)) {
    storage.set(STORAGE_KEYS.MENU_ITEMS, demoMenuItems);
  }
  if (!storage.get(STORAGE_KEYS.TABLES)) {
    storage.set(STORAGE_KEYS.TABLES, demoTables);
  }
  if (!storage.get(STORAGE_KEYS.INVENTORY)) {
    storage.set(STORAGE_KEYS.INVENTORY, demoInventory);
  }
  if (!storage.get(STORAGE_KEYS.ORDERS)) {
    storage.set(STORAGE_KEYS.ORDERS, []);
  }
  if (!storage.get(STORAGE_KEYS.CART)) {
    storage.set(STORAGE_KEYS.CART, []);
  }
};
