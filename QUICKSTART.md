# 🚀 Quick Start Guide - DinePlus Restaurant Management System

## Step-by-Step Setup

### 1️⃣ Installation (First Time)

Open your terminal in the project directory and run:

```bash
npm install
```

Wait for all dependencies to install (this may take 2-3 minutes).

### 2️⃣ Start the Development Server

```bash
npm run dev
```

You should see output like:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

### 3️⃣ Open in Browser

Navigate to: **http://localhost:3000**

## 🎯 Your First Login

### Option 1: Admin Login (Full Management Access)
1. You'll see the login page
2. Use these credentials:
   - **Email**: `admin@dineplus.com`
   - **Password**: `admin123`
3. Click "Sign In"
4. You'll be redirected to the **Admin Dashboard**

### Option 2: Customer Login (Order Food)
1. On the login page, use:
   - **Email**: `user@example.com`
   - **Password**: `user123`
2. Click "Sign In"
3. You'll see the **Customer Menu**

## 🍪 Cookie Consent

When you first visit, you'll see a cookie consent banner at the bottom:
- Click **"Accept All"** to enable full functionality
- This stores your preferences for 30 days

## 📱 What You Can Do

### As an Admin 👨‍💼

1. **Dashboard** - View statistics and recent orders
2. **Orders** - Manage all customer orders
3. **Menu** - Add/edit menu items
4. **Categories** - Organize menu categories
5. **Tables** - Manage restaurant tables
6. **Inventory** - Track stock levels
7. **Reports** - View analytics
8. **Settings** - Configure restaurant info

### As a Customer 👥

1. **Browse Menu** - View all available dishes
2. **Filter by Category** - Find what you want quickly
3. **Add to Cart** - Click the "Add +" button
4. **View Cart** - Click the cart icon (top right)
5. **Checkout** - Select order type and payment
6. **Place Order** - Submit your order

## 🎮 Try These Features

### Quick Demo Flow

#### For Admin:
1. Login as admin
2. Go to **Menu** → Click **"+ Add Menu Item"**
3. Create a new dish
4. Go to **Orders** to see order management
5. Check **Reports** for analytics

#### For Customer:
1. Login as customer
2. Click on a category (e.g., "Starters")
3. Add a few items to cart
4. Click the cart icon
5. Proceed to checkout
6. Fill order details and place order
7. Logout and login as admin to see your order!

## 💡 Important Tips

### Data Storage
- All data is saved in your browser (LocalStorage)
- Data persists even after closing the browser
- Data lasts for 30 days
- No data is sent to any server

### Reset Everything
If you want to start fresh:
1. Login as admin
2. Go to **Settings**
3. Scroll to "Danger Zone"
4. Click **"Clear All Data"**
5. Refresh the page

### Multiple Users
- Open in **different browsers** to simulate admin + customer
- Or use **Incognito/Private mode** for the second user
- Example: Chrome for admin, Firefox for customer

## 🔧 Troubleshooting

### Problem: Port 3000 is already in use
**Solution**: Kill the process or use a different port:
```bash
npm run dev -- -p 3001
```
Then visit: http://localhost:3001

### Problem: Can't login
**Solution**: Make sure you're using the exact credentials:
- Admin: `admin@dineplus.com` / `admin123`
- User: `user@example.com` / `user123`

### Problem: Changes not showing
**Solution**: Hard refresh the browser:
- **Windows**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Problem: Page is blank
**Solution**:
1. Check the browser console for errors (F12)
2. Clear browser cache
3. Restart the development server

## 📊 Sample Data Included

The system comes with pre-loaded demo data:

- **21 Menu Items** (Starters, Main Course, Biryani, Breads, Desserts, Beverages)
- **6 Categories** organized by food type
- **8 Tables** with different capacities
- **5 Inventory Items** with stock tracking
- **Restaurant Information** pre-configured

## 🎨 Customization

### Change Restaurant Name
1. Login as admin
2. Go to **Settings**
3. Update "Restaurant Name"
4. Click "Save Settings"

### Add Your Own Menu Items
1. Go to **Menu**
2. Click **"+ Add Menu Item"**
3. Fill in the details:
   - Name
   - Description
   - Price
   - Category
   - Veg/Non-veg
   - Preparation time
4. Click "Add Item"

### Add New Categories
1. Go to **Categories**
2. Click **"+ Add Category"**
3. Enter name and description
4. Set display order
5. Click "Add Category"

## 📱 Testing Order Flow

Complete end-to-end test:

1. **Login as Customer**
2. Add 3-4 items to cart
3. Open cart and verify items
4. Proceed to checkout
5. Select "Dine-in" and "Cash"
6. Place order
7. **Logout**
8. **Login as Admin**
9. Go to Orders
10. See your order in "Pending"
11. Click on the order
12. Update status to "Confirmed"
13. Continue updating until "Delivered"

## 🌟 Pro Tips

1. **Use Multiple Tabs**: Open admin in one tab, customer in another
2. **Check Reports**: After placing orders, view analytics in Reports
3. **Manage Inventory**: Set low stock thresholds to get alerts
4. **Table Management**: Update table status based on orders
5. **Mobile View**: Resize browser to test responsive design

## 🎯 Next Steps

After exploring the demo:

1. **Customize the menu** with your own items
2. **Configure restaurant settings** with your info
3. **Test the full order workflow** from both sides
4. **Check analytics** to understand reporting
5. **Explore inventory management** for stock tracking

## 📞 Need Help?

Check these files for reference:
- `README.md` - Full documentation
- `/types/index.ts` - Data structure definitions
- `/lib/demoData.ts` - Sample data reference
- `/lib/localStorage.ts` - Storage utilities

## 🚀 You're Ready!

Start exploring the platform! Remember:
- **Admin login**: Full control of restaurant
- **Customer login**: Order placement experience
- All data is local and private
- No internet required after initial load

Enjoy building your restaurant management demo! 🍽️✨
