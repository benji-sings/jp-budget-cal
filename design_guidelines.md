# Japan Travel Budget Calculator - Design Guidelines

## Design Approach

**Hybrid Approach**: Material Design foundation with Japanese minimalist aesthetic influences. Drawing inspiration from travel planning tools (Airbnb, Booking.com) for presenting complex data cleanly while incorporating subtle Japanese design principles (ma - negative space, kanso - simplicity).

**Core Principle**: Create a trustworthy, data-dense calculator interface that feels calm and organized despite handling multiple inputs and outputs.

---

## Typography

**Font Family**: 
- Primary: Inter or DM Sans (clean, modern, excellent readability for data)
- Accent: Noto Sans JP (for Japanese text elements and cultural touches)

**Hierarchy**:
- H1 (Page Title): text-4xl font-bold
- H2 (Section Headers): text-2xl font-semibold
- H3 (Category Labels): text-lg font-semibold
- Body Text: text-base font-normal
- Small Print/Helper Text: text-sm
- Data/Numbers: text-lg font-semibold (tabular-nums for alignment)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 for consistency (p-2, p-4, p-6, p-8, gap-4, etc.)

**Container Structure**:
- Max-width: max-w-7xl for main content
- Main padding: px-4 md:px-6 lg:px-8
- Section spacing: space-y-8 to space-y-12

**Grid Patterns**:
- Two-column desktop layout: Calculator inputs (left 60%) + Live summary/breakdown (right 40%, sticky)
- Mobile: Single column stack
- Form sections: Grid with responsive columns (grid-cols-1 md:grid-cols-2 gap-4)

---

## Component Library

### Header
- Clean horizontal layout with app logo/title (Japanese characters subtitle optional)
- Subtle border-bottom separator
- Minimal height: h-16
- Currency indicator badge showing SGD ↔ JPY rate

### Trip Configuration Card
- Prominent top section with rounded-lg border
- Date pickers side-by-side on desktop
- Duration auto-display badge
- Traveler counter with +/- buttons (large touch targets)
- City multi-select with chips/tags display
- Travel style toggle buttons (full-width on mobile, segmented control on desktop)

### Cost Category Sections
Each category (Flights, Accommodation, etc.) as expandable/collapsible cards:
- Card header with category icon (from Heroicons), title, and estimated total
- Expanded state shows detailed inputs
- Use radio groups, sliders, and number inputs appropriately
- Clear visual hierarchy: Category > Subcategory > Line items

### Flight Section
- Airline selector with logos/names
- City-specific pricing display
- Radio buttons for carrier tiers

### Accommodation Section
- Accommodation type cards with daily rate display
- City-specific pricing matrix (compact table)
- Night count auto-calculated from trip dates

### Transportation Section
- JR Pass calculator with break-even indicator (visual badge showing savings)
- IC Card budget slider
- Airport transfer dropdown selector

### Food Budget
- Three-tier cards (Budget/Mid-range/Splurge) with iconic examples
- Daily estimate slider or preset amounts
- Category icons (ramen bowl, izakaya lantern, fine dining)

### Activities Section
- Searchable/filterable attraction list
- Checkbox items with entrance fees
- Subtotal auto-calculation per checked item

### Breakdown Display (Sticky Sidebar on Desktop)
- Card with clear visual sections
- Category breakdowns with bar indicators showing % of total
- Prominent total in large text
- Per-person cost badge
- Daily average display
- Export button (primary CTA)

### Charts Section
- Pie chart for cost distribution by category
- Bar chart for daily cost projection
- Keep chart heights consistent: h-64 to h-80

### Tips & Recommendations
- Collapsible sections organized by city
- List items with subtle Japanese-inspired dividers
- Icon bullets for quick scanning
- Must-visit checklist with checkboxes (interactive but local state)

### Footer
- Centered text: "Made for Singaporeans, by Singaporeans 🇸🇬"
- Links to privacy, about (minimal)
- Copyright line
- Subtle top border separator

---

## Interaction Patterns

**Input Responsiveness**: All inputs update calculations immediately (debounced for performance)

**Visual Feedback**: 
- Subtle scale transforms on button clicks
- Loading states for exchange rate fetch
- Success/error toast notifications (top-right)

**Progressive Disclosure**: Start with basic inputs visible, advanced options revealed via "Show more options" toggles

**Mobile Navigation**: Sticky bottom bar with "Calculate" and "View Breakdown" buttons that scroll to relevant sections

---

## Japanese Aesthetic Elements

**Subtle Cultural Touches**:
- Thin, hairline borders (border width: 1px) throughout
- Generous whitespace between sections (ma principle)
- Minimalist iconography
- Clean card elevations (subtle shadows, no heavy drop-shadows)
- Rounded corners: rounded-lg (8px) for cards, rounded-md (6px) for inputs

**Visual Motifs** (Use sparingly):
- Subtle sakura blossom accent in header (small decorative element)
- Torii gate icon for Japan-specific sections
- Mount Fuji silhouette in footer background (extremely subtle, low opacity)

---

## Images

**Hero Section**: Yes - Include a hero banner
- Full-width hero image showing iconic Japanese scenery (blend of Tokyo skyline, traditional temple, cherry blossoms)
- Height: h-48 md:h-64
- Overlay: Dark gradient overlay for text readability
- Content: App title, subtitle ("Plan your perfect Japan trip from Singapore"), and brief value proposition
- CTA: "Start Planning" button with blurred background (backdrop-blur-md)

**Additional Images**:
- City selection: Small thumbnail images for each city option (80x80px, rounded)
- Activity cards: Thumbnail images for major attractions (optional, 120x80px)
- Keep image usage minimal to maintain calculator utility focus

---

## Accessibility

- All form inputs with visible labels
- ARIA labels for icon-only buttons
- Keyboard navigation support for all interactive elements
- Focus states with visible outline rings
- Sufficient contrast ratios for all text
- Touch targets minimum 44x44px on mobile

---

**Final Note**: The design balances functional density with calm, organized presentation. Japanese aesthetics inform the minimalist approach and generous spacing, while the layout prioritizes efficient data input and clear output visualization. Trust in Material Design patterns for complex inputs while layering subtle cultural elements for brand personality.