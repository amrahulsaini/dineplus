# DinePlus Design System Quick Reference

## 🎨 Typography

### Fonts
```css
Primary: Inter (body, UI)
Display: Poppins (headings)
Weights: 300, 400, 500, 600, 700, 800
```

### Headings
```tsx
<h1 className="text-5xl font-bold tracking-tight">
<h2 className="text-4xl font-bold tracking-tight">
<h3 className="text-3xl font-bold tracking-tight">
```

## 🎯 Colors

```css
Orange 500: #f97316  /* Primary brand */
Orange 600: #ea580c  /* Hover states */
Red 600: #dc2626     /* Accent */
Orange 50: #fff7ed   /* Light backgrounds */
```

## 📦 Components

### Buttons
```tsx
// Primary
<button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95">

// Secondary  
<button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">

// Outline
<button className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-3 px-6 rounded-2xl transition-all duration-300">
```

### Cards
```tsx
// Basic
<div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">

// Hover
<div className="bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 border border-gray-100 hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1">

// Interactive
<div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl border-2 border-transparent hover:border-orange-500 transition-all duration-300 transform hover:scale-102 cursor-pointer">
```

### Inputs
```tsx
<input className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300" />

// With icon
<div className="relative group">
  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
  <input className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300" />
</div>
```

### Badges
```tsx
<span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">

// Animated
<span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-bounce-slow">
```

## 🎬 Animations

```tsx
animate-fadeIn      // Fade in + slide up (0.5s)
animate-slideIn     // Slide from right (0.4s)
animate-scaleIn     // Scale from 0.9 to 1 (0.4s)
animate-bounce-slow // Gentle bounce (2s infinite)
animate-shimmer     // Loading shimmer (2s infinite)
```

## 🎭 Effects

### Glass Morphism
```tsx
<div className="glass backdrop-blur-xl p-8 rounded-3xl">
```

### Gradients
```tsx
bg-gradient-to-r from-orange-500 to-red-600      // Primary
bg-gradient-to-br from-orange-50 to-red-50       // Light background
bg-gradient-to-r from-orange-600 to-red-600      // Text gradient
```

### Shadows
```tsx
shadow-lg          // Basic
shadow-xl          // Enhanced
shadow-2xl         // Maximum
hover:shadow-2xl   // Hover state
```

## 🔄 Transitions

### Standard
```tsx
transition-all duration-300              // General
transition-all duration-300 ease-out     // Smooth
```

### Transforms
```tsx
transform hover:-translate-y-1           // Lift up
transform hover:scale-105                // Scale up
transform hover:translate-x-1            // Slide right
active:scale-95                          // Press down
```

## 📱 Rounded Borders

```tsx
rounded-lg     // 0.5rem
rounded-xl     // 1rem
rounded-2xl    // 1.5rem (standard)
rounded-3xl    // 2rem (special)
rounded-full   // 9999px (circles)
```

## 🎨 Common Patterns

### Icon with Text
```tsx
<div className="flex items-center gap-2">
  <Icon className="w-5 h-5" />
  <span>Text</span>
</div>
```

### Loading State
```tsx
<div className="animate-shimmer h-8 rounded-2xl" />
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

### Sticky Header
```tsx
<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg">
```

## ✅ Checklist for New Components

- [ ] Use Inter/Poppins fonts
- [ ] 2xl rounded borders (standard)
- [ ] 300ms transitions
- [ ] Hover states with transforms
- [ ] Focus rings for inputs (4px orange-200)
- [ ] Proper shadows (lg → xl → 2xl)
- [ ] Orange-red gradient for primary actions
- [ ] Active states for buttons (scale-95)
- [ ] Proper spacing (p-6 for cards, py-3.5 px-6 for buttons)
- [ ] Icons from lucide-react

## 🚀 Pro Tips

1. Always add `transition-all duration-300` for smooth interactions
2. Use `transform hover:scale-105` for clickable items
3. Add `active:scale-95` for tactile button feedback
4. Combine shadows with transforms for depth
5. Use gradient backgrounds for primary actions
6. Add `backdrop-blur` for modern glass effects
7. Use `group` class for nested hover effects
8. Add loading states with shimmer animation

---

**Note**: This design system ensures consistency, professionalism, and excellent user experience throughout the DinePlus platform! 🎉
