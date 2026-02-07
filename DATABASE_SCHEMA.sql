-- =====================================================
-- LOOPWAR MULTI-RESTAURANT DATABASE SCHEMA
-- =====================================================

-- 1. RESTAURANTS TABLE
CREATE TABLE restaurants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    logo VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    currency VARCHAR(10) DEFAULT 'USD',
    tax_rate DECIMAL(5,2) DEFAULT 0,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);

-- 2. MENU CATEGORIES (Multi-tenant)
CREATE TABLE menu_categories (
    id VARCHAR(36) PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_active (is_active)
);

-- 3. MENU ITEMS (Multi-tenant)
CREATE TABLE menu_items (
    id VARCHAR(36) PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    is_vegetarian BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    preparation_time INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_category (category_id),
    INDEX idx_available (is_available)
);

-- 4. MENU ITEM VARIATIONS (Small, Medium, Large)
CREATE TABLE menu_item_variations (
    id VARCHAR(36) PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_menu_item (menu_item_id)
);

-- 5. MENU ITEM ADDONS (Extra Cheese, Sauces, etc)
CREATE TABLE menu_item_addons (
    id VARCHAR(36) PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_menu_item (menu_item_id)
);

-- 6. RESTAURANT TABLES
CREATE TABLE restaurant_tables (
    id VARCHAR(36) PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL,
    table_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(100),
    qr_code VARCHAR(500),
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_table (restaurant_id, table_number)
);

-- 7. ORDERS (Multi-tenant)
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL,
    restaurant_slug VARCHAR(255) NOT NULL,
    table_id VARCHAR(36),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    order_type ENUM('dine-in', 'takeaway', 'delivery') NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'wallet') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- 8. ORDER ITEMS
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    menu_item_id VARCHAR(36) NOT NULL,
    menu_item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    variation_id VARCHAR(36),
    variation_name VARCHAR(100),
    variation_price DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_order (order_id)
);

-- 9. ORDER ITEM ADDONS
CREATE TABLE order_item_addons (
    id VARCHAR(36) PRIMARY KEY,
    order_item_id VARCHAR(36) NOT NULL,
    addon_id VARCHAR(36) NOT NULL,
    addon_name VARCHAR(100) NOT NULL,
    addon_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    INDEX idx_order_item (order_item_id)
);

-- 10. INVENTORY (Multi-tenant)
CREATE TABLE inventory (
    id VARCHAR(36) PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    min_quantity DECIMAL(10,2) DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_low_stock (restaurant_id, quantity, min_quantity)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_orders_restaurant_date ON orders(restaurant_id, created_at DESC);
CREATE INDEX idx_menu_items_restaurant_category ON menu_items(restaurant_id, category_id);
CREATE INDEX idx_tables_restaurant_status ON restaurant_tables(restaurant_id, status);

-- =====================================================
-- SAMPLE DATA INSERT
-- =====================================================

-- Insert first restaurant: MTS
INSERT INTO restaurants (id, name, slug, email, phone, address, currency, tax_rate, timezone) VALUES
('mts-001', 'MTS Restaurant', 'mts-123', 'contact@mts.com', '+1234567890', '123 Main Street, City', 'USD', 10.00, 'America/New_York');

-- Sample category for MTS
INSERT INTO menu_categories (id, restaurant_id, name, description, display_order) VALUES
('cat-001', 'mts-001', 'Starters', 'Delicious appetizers', 1),
('cat-002', 'mts-001', 'Main Course', 'Main dishes', 2),
('cat-003', 'mts-001', 'Beverages', 'Drinks and refreshments', 3);

-- Sample menu item with variations
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, base_price, is_vegetarian, is_popular) VALUES
('item-001', 'mts-001', 'cat-002', 'Classic Burger', 'Juicy beef burger with fresh veggies', 8.99, false, true);

-- Variations for Classic Burger
INSERT INTO menu_item_variations (id, menu_item_id, name, price, is_default) VALUES
('var-001', 'item-001', 'Small', 8.99, true),
('var-002', 'item-001', 'Medium', 11.99, false),
('var-003', 'item-001', 'Large', 14.99, false);

-- Addons for Classic Burger
INSERT INTO menu_item_addons (id, menu_item_id, name, price, category) VALUES
('addon-001', 'item-001', 'Extra Cheese', 1.50, 'Toppings'),
('addon-002', 'item-001', 'Bacon', 2.00, 'Toppings'),
('addon-003', 'item-001', 'Spicy Sauce', 0.50, 'Sauces');

-- Sample tables for MTS
INSERT INTO restaurant_tables (id, restaurant_id, table_number, capacity, location) VALUES
('table-001', 'mts-001', 'T1', 4, 'Indoor'),
('table-002', 'mts-001', 'T2', 2, 'Indoor'),
('table-003', 'mts-001', 'T3', 6, 'Outdoor');
