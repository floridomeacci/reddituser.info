# Reddit Analyzer Design System

**Single source of truth for all visual styling**

---

## 🎨 Color Palette

### Primary Colors
```css
--color-primary-light-blue: #00d9ff;  /* Main accent - use for highlights, links, CTAs */
--color-primary-white: #ffffff;        /* Primary text */
--color-primary-red: #ff6b6b;          /* Secondary accent - warnings, errors */
```

### Backgrounds
```css
--color-bg-dark-grey: #0a0e27;         /* Main app background */
--color-bg-card: rgba(9, 16, 39, 0.9); /* Card background */
```

### Text Colors
```css
--color-text-white: #ffffff;                    /* Headlines, important text */
--color-text-light-grey: rgba(255, 255, 255, 0.7); /* Body text */
--color-text-muted: rgba(255, 255, 255, 0.5);   /* Secondary labels */
```

---

## 📝 Typography

### Headings
```html
<h1>48px - Bold - Page titles</h1>
<h2>36px - Bold - Section headers</h2>
<h3>24px - Semibold - Subsections (UPPERCASE)</h3>
<h4>20px - Semibold - Card titles</h4>
<h5>16px - Medium - Small headers</h5>
<h6>14px - Medium - Labels (UPPERCASE)</h6>
```

### Body Text
```css
Body: 14px - Normal weight
Small: 12px - Labels and meta info
Tiny: 10px - Captions
```

### Usage Example
```jsx
<h3>Hourly pulse</h3>  {/* Automatically styled */}
<p className="text-small text-muted">Last updated 5 min ago</p>
```

---

## 📦 Card System

### Card Properties
```css
Border radius: 12px (--radius-md)
Padding: 18px (--card-padding-md)
Border: 1px solid cyan (--card-border-color)
```

### Card States
- **Default**: Semi-transparent background
- **Hover**: Lifts -2px, border glows cyan
- **Focus**: Border becomes solid light blue

### Usage
```jsx
<div className="cell">  {/* Auto-applies all card styles */}
  <h3>Card Title</h3>
  <div className="chart-container">...</div>
</div>
```

---

## 📊 Chart System

### Chart Colors
```css
Primary line/bar: Light blue (#00d9ff)
Secondary: Red (#ff6b6b)
Tertiary: Cyan (#05d0d5)
```

### Chart Lines
```css
Grid lines: rgba(0, 217, 255, 0.1) - 1px
Axis lines: rgba(255, 255, 255, 0.2) - 1px
Data lines: 2px thickness
```

### Chart Text
```css
Font size: 9px
Color: rgba(255, 255, 255, 0.5)
```

### Recharts Integration
All Recharts components automatically inherit design tokens via CSS classes:
```jsx
<LineChart data={data}>  {/* Auto-styled */}
  <Line stroke="var(--chart-color-primary)" />
</LineChart>
```

---

## 📐 Spacing System

```css
--spacing-xs: 4px   /* Tight spacing */
--spacing-sm: 8px   /* Small gaps */
--spacing-md: 12px  /* Default gaps */
--spacing-lg: 18px  /* Large gaps (grid gap) */
--spacing-xl: 24px  /* Extra large (card padding) */
--spacing-2xl: 32px
--spacing-3xl: 48px
```

### Usage
```jsx
<div className="gap-lg">  {/* 18px gap */}
<div style={{ padding: 'var(--spacing-xl)' }}>  {/* 24px padding */}
```

---

## 🎯 Radar Chart Tokens

```css
--radar-bg: Dark gradient background
--radar-grid-color: rgba(0, 255, 255, 0.2)
--radar-data-color: rgba(0, 255, 203, 0.3)  /* Fill */
--radar-data-stroke: rgba(0, 255, 203, 0.8) /* Border */
--radar-point-color: #ffef5a                /* Data points */
--radar-label-color: rgba(255, 255, 255, 0.8)
```

---

## 🛠️ How to Update the Design System

### 1. Change Global Colors
Edit `/src/design-system.css`:
```css
:root {
  --color-primary-light-blue: #00d9ff;  /* Change this */
}
```
**Effect**: Updates ALL instances of light blue across the entire app.

### 2. Change Card Styling
```css
:root {
  --radius-md: 16px;        /* Rounder cards */
  --card-padding-md: 24px;  /* More spacious cards */
}
```

### 3. Change Chart Appearance
```css
:root {
  --chart-line-width-normal: 3px;  /* Thicker lines */
  --chart-grid-color: rgba(0, 255, 255, 0.2);  /* Lighter grid */
}
```

### 4. Change Typography
```css
:root {
  --font-size-h3: 28px;  /* Bigger subsection headers */
  --font-weight-bold: 800;  /* Bolder text */
}
```

---

## ✅ Design System Checklist

When building new components:

- [ ] Use `var(--color-*)` for all colors
- [ ] Use `var(--spacing-*)` for margins/padding/gaps
- [ ] Use `var(--radius-*)` for border-radius
- [ ] Use `var(--font-size-*)` for font sizes
- [ ] Use `.transition-normal` for hover effects
- [ ] Use semantic class names (`.stat-cell`, `.highlight-cell`)
- [ ] Test hover states
- [ ] Verify responsive behavior

---

## 🎨 Utility Classes

Quick styling shortcuts:

```html
<!-- Spacing -->
<div className="p-lg gap-md">...</div>

<!-- Typography -->
<p className="text-small text-muted">...</p>

<!-- Effects -->
<div className="hover-lift transition-normal">...</div>

<!-- Borders -->
<div className="border-default radius-md">...</div>
```

---

## 🔧 Customization Examples

### Example 1: Change App Theme to Darker Blue
```css
:root {
  --color-bg-dark-grey: #050a1f;
  --color-bg-card: rgba(5, 10, 31, 0.95);
  --color-primary-light-blue: #0099ff;
}
```

### Example 2: Make Cards More Compact
```css
:root {
  --card-padding-md: 12px;
  --grid-gap: 12px;
  --spacing-md: 8px;
}
```

### Example 3: Bolder Typography
```css
:root {
  --font-weight-normal: 500;
  --font-weight-semibold: 700;
  --font-weight-bold: 800;
}
```

---

## 📱 Responsive Design

Breakpoints are defined but components use CSS Grid's auto-responsive behavior by default.

```css
--breakpoint-sm: 640px
--breakpoint-md: 768px   /* Tablets */
--breakpoint-lg: 1024px  /* Laptops */
--breakpoint-xl: 1280px  /* Desktops */
```

---

## 🚀 Quick Reference

**File Location**: `/src/design-system.css`

**Import Order**:
```jsx
import './design-system.css';  // Always first
import './App.css';            // Then component styles
```

**Most Common Tokens**:
- Colors: `--color-primary-light-blue`, `--color-text-white`
- Spacing: `--spacing-lg`, `--spacing-xl`
- Radius: `--radius-md`
- Typography: `--font-size-h3`, `--font-weight-semibold`

---

**Need help?** All tokens are documented in `/src/design-system.css` with comments.
