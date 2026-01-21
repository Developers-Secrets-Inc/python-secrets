# Design System: Minimal & Monochromatic

## Design Philosophy

**Study: Vercel, Linear, GitHub**
**Aesthetic: Minimal, monochromatic, technical**

## Color Palette

### Primary Colors

#### Dark Mode (Default)
```
Background:
• bg-primary:    #000000  (pure black)
• bg-secondary:  #0A0A0A  (almost black)
• bg-tertiary:   #111111  (elevated surfaces)
• bg-border:     #222222  (borders, dividers)

Foreground:
• fg-primary:    #FFFFFF  (pure white)
• fg-secondary:  #A1A1AA  (muted text)
• fg-tertiary:   #71717A  (subtle text)

Accent (monochromatic emphasis):
• accent-primary:   #FFFFFF  (buttons, highlights)
• accent-secondary: #A1A1AA  (subtle accents)
• accent-muted:     #52525B  (disabled states)
```

#### Light Mode (Optional)
```
Background:
• bg-primary:    #FFFFFF  (pure white)
• bg-secondary:  #FAFAFA  (off-white)
• bg-tertiary:   #F5F5F5  (elevated surfaces)
• bg-border:     #E5E5E5  (borders, dividers)

Foreground:
• fg-primary:    #000000  (pure black)
• fg-secondary:  #737373  (muted text)
• fg-tertiary:   #A3A3A3  (subtle text)

Accent:
• accent-primary:   #000000  (buttons, highlights)
• accent-secondary: #52525B  (subtle accents)
• accent-muted:     #D4D4D8  (disabled states)
```

### Status Colors (Minimal Use)

Use sparingly, only when meaning is critical:

```
Success:  #10B981  (green)
Warning:  #F59E0B  (amber)
Error:    #EF4444  (red)
Info:     #3B82F6  (blue)

Usage:
• Checkmarks for completion
• Error states
• Code execution results
```

## Typography

### Font Stack

```css
/* Primary: Geist / Inter */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Code: JetBrains Mono / Geist Mono */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

```
Display:    48px / 1.1 - Page titles (rare)
Heading 1:  36px / 1.2 - Section titles
Heading 2:  30px / 1.3 - Subsection titles
Heading 3:  24px / 1.4 - Component titles
Body Large: 18px / 1.5 - Lead paragraphs
Body:       16px / 1.6 - Default text
Body Small: 14px / 1.6 - Secondary text
Caption:    12px / 1.5 - Labels, metadata
Code:       14px / 1.5 - Code blocks
```

### Font Weights

```
Light:     300  (rare, avoid)
Regular:   400  (body text)
Medium:    500  (headings, emphasis)
Semibold:  600  (buttons, navigation)
Bold:      700  (rare, strong emphasis)
```

## Spacing System

### Scale (Base unit: 4px)

```
0:  0px
1:  4px
2:  8px
3:  12px
4:  16px
5:  20px
6:  24px
8:  32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

### Usage

```
Component padding:   4 (16px)
Section spacing:     10 (40px)
Page margins:        6 (24px) mobile, 10 (40px) desktop
Gap between items:   4 (16px)
Tight spacing:       2 (8px)
```

## Components

### Buttons

#### Primary Button
```
Background: #FFFFFF
Text:       #000000
Hover:      Scale 1.02, subtle glow
Active:     Scale 0.98
Disabled:   #52525B

Minimal, sharp edges (no border radius or 2px max)
```

#### Secondary Button
```
Background: Transparent
Border:     1px solid #222222
Text:       #FFFFFF
Hover:      Background #111111
```

#### Ghost Button
```
Background: Transparent
Text:       #FFFFFF
Hover:      Background rgba(255,255,255,0.1)
```

### Cards

```
Background:   #0A0A0A
Border:       1px solid #222222
Border radius: 8px or 12px
Padding:      24px
Hover:        Border #333333, subtle translateY(-2px)
```

### Inputs

```
Background:   #000000
Border:       1px solid #222222
Text:         #FFFFFF
Placeholder:  #71717A
Focus:        Border #FFFFFF
```

### Code Blocks

```
Background:   #000000
Border:       1px solid #222222
Text:         #A1A1AA (syntax colored)
Font:         JetBrains Mono, 14px
Padding:      16px
Border radius: 8px
```

## Layout

### Grid System

```
Container max-width: 1200px
Grid columns: 12
Gutter: 24px

Breakpoints:
• Mobile:  < 640px
• Tablet:  640px - 1024px
• Desktop: > 1024px
```

### Page Structure

```
┌────────────────────────────────────────┐
│  Header (64px height)                  │
├────────────────────────────────────────┤
│                                        │
│  Main Content                          │
│  (min-height: calc(100vh - 64px))     │
│                                        │
└────────────────────────────────────────┘
```

## Animation Principles

### Motion Values

```
Duration:   150ms (fast), 300ms (default), 500ms (slow)
Easing:    ease-out (most), cubic-bezier(0.16, 1, 0.3, 1)
Scale:     0.98 - 1.02 (subtle)
```

### Transitions

```css
/* Default */
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

/* Fast (hover) */
transition: transform 0.15s ease-out;

/* Slow (page transitions) */
transition: opacity 0.5s ease-out;
```

### Loading States

```
Skeleton loaders:
• Background: linear-gradient(90deg, #111 0%, #222 50%, #111 100%)
• Animation: shimmer 1.5s infinite
• No spinners (feel dated)
```

## Iconography

### Style

```
Stroke:     2px (consistent)
Filled:     Rare, only for active states
Size:       16px, 20px, 24px
Color:      Current color (inherit)
```

### Icon Library

- Lucide icons (preferred)
- Heroicons (alternative)
- Custom icons when needed

## Visual Hierarchy

### Content Prioritization

```
1. Primary:   White text, regular weight, 16px
2. Secondary: Muted text (#A1A1AA), 14px
3. Tertiary:  Subtle text (#71717A), 14px or 12px
4. Disabled:  Very subtle (#52525B)
```

### Emphasis

```
• Use white, not color, for emphasis
• Use weight, not size, for importance
• Use spacing, not lines, for separation
• Use opacity, not gray, for subtlety
```

## Examples

### Lesson Card

```
┌─────────────────────────────────────┐
│  Python OOP Fundamentals            │ ← 24px semibold
│                                     │
│  Master object-oriented design      │ ← 16px regular #A1A1AA
│  patterns in Python                 │
│                                     │
│  Free • 12 lessons • 4 hours        │ ← 14px #71717A
│                                     │
│  [Continue]              [View →]   │ ← Buttons
└─────────────────────────────────────┘
```

### Challenge Card

```
┌─────────────────────────────────────┐
│  Two Sum                 Medium     │ ← Title + Badge
│                                     │
│  Find two numbers that add up...    │ ← Description
│                                     │
│  Arrays • Hash Table                │ ← Tags #71717A
│                                     │
│  Success rate: 78%                  │ ← Stats
│                                     │
│  [Solve Challenge]                 │ ← Button
└─────────────────────────────────────┘
```

### Code Editor

```
┌─────────────────────────────────────┐
│  main.py                   [×]      │ ← Tab bar
│  ├── solution.py                     │
│  ├── test_cases.py                   │
├─────────────────────────────────────┤
│                                     │
│  def two_sum(nums, target):         │ ← Code
│      # Your code here               │
│      pass                           │
│                                     │
├─────────────────────────────────────┤
│  [RUN]              [SUBMIT]        │ ← Actions
│                                     │
│  Output:                            │
│  ✓ Test case 1 passed               │
│  ✓ Test case 2 passed               │
└─────────────────────────────────────┘
```

## Dark Mode Implementation

### CSS Variables

```css
:root {
  /* Background */
  --bg-primary: #000000;
  --bg-secondary: #0A0A0A;
  --bg-tertiary: #111111;
  --bg-border: #222222;

  /* Foreground */
  --fg-primary: #FFFFFF;
  --fg-secondary: #A1A1AA;
  --fg-tertiary: #71717A;

  /* Accent */
  --accent-primary: #FFFFFF;
  --accent-secondary: #A1A1AA;
  --accent-muted: #52525B;

  /* Status */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}

@media (prefers-color-scheme: light) {
  /* Light mode overrides */
}
```

## Accessibility

### Contrast Ratios

```
• All text meets WCAG AA (4.5:1 minimum)
• Primary content meets AAA (7:1)
• Focus indicators are clear (2px white outline)
```

### Focus States

```
All interactive elements:
outline: 2px solid #FFFFFF;
outline-offset: 2px;
```

## Responsive Design

### Mobile-First

```
• Design for mobile first (< 640px)
• Progressive enhancement for tablet/desktop
• Touch targets minimum 44px
• Readable without zooming
```

## Performance Considerations

### Font Loading

```
• Self-host fonts for performance
• Use font-display: swap
• Preload critical fonts
• Subset fonts to reduce size
```

### CSS

```
• Minimal CSS (no bloat)
• CSS variables for theming
• No CSS-in-JS overhead
• PurgeCSS/tailwind for production
```

## Brand Applications

### Logo

```
• Monochromatic (black/white)
• Simple wordmark
• Minimal icon (optional)
• Works at any size
```

### Voice & Tone

```
• Minimal, direct, clear
• Technical but accessible
• Professional but not corporate
• Confident, not boastful
```

## Inspiration & References

### Study These

1. **Vercel** - vercel.com
   - Perfect dark mode
   - Minimal animations
   - Technical aesthetic

2. **Linear** - linear.app
   - Stunning micro-interactions
   - Monochromatic palette
   - Premium feel

3. **GitHub** - github.com
   - Developer-focused
   - Clean code presentation
   - Functional beauty

4. **Supabase** - supabase.com
   - Modern docs
   - Great dark mode
   - Technical credibility

## Implementation Priority

### Phase 1: Foundation
- [ ] Color system variables
- [ ] Typography scale
- [ ] Base components (Button, Card, Input)
- [ ] Layout grid

### Phase 2: Components
- [ ] Navigation
- [ ] Lesson/challenge cards
- [ ] Code editor styling
- [ ] Loading states

### Phase 3: Polish
- [ ] Micro-interactions
- [ ] Page transitions
- [ ] Hover states
- [ ] Focus states

---

**Design Goal:**

When users land on Python Secrets, they should immediately think:
"This is beautiful. This is fast. These people know what they're doing."

No clutter. No distractions. Just pure, premium quality.
