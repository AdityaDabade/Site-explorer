# VISUAL EXAMPLES & CODE SNIPPETS

## 🎨 Cost Prediction Component - Visual Flow

### Scenario 1: Initial Load (No Destinations)

```
┌───────────────────────────────────┐
│    💰 Trip Cost Breakdown         │
├───────────────────────────────────┤
│                                   │
│  ┌─────────────────────────────┐ │
│  │ Select places to estimate   │ │
│  │ cost                        │ │
│  └─────────────────────────────┘ │
│                                   │
└───────────────────────────────────┘
```

### Scenario 2: With 2 Destinations, 3 Travelers

```
┌──────────────────────────────────────┐
│    💰 Trip Cost Breakdown            │
├──────────────────────────────────────┤
│                                      │
│ 🚗 Travel              ₹2,000        │  ← 200km × ₹10
│ 🎫 Entry Fees          ₹0            │  ← No entry fees yet
│ 🍽️  Food & Meals       ₹1,800        │  ← ₹300 × 3 × 2 places
│                                      │
│ ─────────────────────────────────── │
│                                      │
│ Total Trip Cost        ₹3,800        │  ← Grand Total
│ Per Person             ₹1,267        │  ← ₹3,800 ÷ 3
│                                      │
│ 💡 Estimates based on: ₹10/km...    │
│                                      │
└──────────────────────────────────────┘
```

### Scenario 3: With Entry Fees

```
Input:
- Destinations: ['Delhi', 'Agra', 'Jaipur']  (3)
- Travelers: 2 (1 adult + 1 child)
- Places: [Taj Mahal: ₹250, Hawa Mahal: ₹200]

Calculation:
- Travel: 3 × 100km × ₹10 = ₹3,000
- Entry: (₹250 + ₹200) × 2 = ₹900
- Food: ₹300 × 2 × 3 = ₹1,800
- Total: ₹5,700
- Per Person: ₹2,850

Display:
┌──────────────────────────────────────┐
│    💰 Trip Cost Breakdown            │
├──────────────────────────────────────┤
│ 🚗 Travel              ₹3,000        │
│ 🎫 Entry Fees          ₹900          │
│ 🍽️  Food & Meals       ₹1,800        │
│ ─────────────────────────────────── │
│ Total Trip Cost        ₹5,700        │
│ Per Person             ₹2,850        │
└──────────────────────────────────────┘
```

---

## 🔧 Code Examples

### Example 1: Basic Usage

```jsx
import { useState } from "react";
import CostPrediction from "../components/trip/CostPrediction";

export default function TripForm() {
  const [form, setForm] = useState({
    destinations: ["Delhi"],
    adults: 2,
    children: 0,
  });

  const totalTravelers = form.adults + form.children;

  return (
    <div>
      {/* Form inputs... */}

      {/* Cost Prediction */}
      <CostPrediction
        travelers={totalTravelers}
        destinations={form.destinations}
        places={[]}
      />
    </div>
  );
}
```

### Example 2: With Places Data

```jsx
import CostPrediction from "../components/trip/CostPrediction";

export default function TripDetailsPage({ trip, places }) {
  return (
    <div>
      <h1>{trip.name}</h1>

      {/* Show cost breakdown with actual place fees */}
      <CostPrediction
        travelers={trip.group_size}
        destinations={trip.destinations}
        places={places} // [{name, entry_fee}, ...]
      />

      <div>{/* Rest of trip details */}</div>
    </div>
  );
}
```

### Example 3: Dynamic Updates

```jsx
import { useState } from "react";
import CostPrediction from "../components/trip/CostPrediction";

export default function CostEstimator() {
  const [travelers, setTravelers] = useState(1);
  const [destinations, setDestinations] = useState([]);

  const handleAddDestination = (dest) => {
    setDestinations([...destinations, dest]);
  };

  const handleRemoveDestination = (dest) => {
    setDestinations(destinations.filter((d) => d !== dest));
  };

  return (
    <>
      {/* Traveler selector */}
      <input
        type="number"
        value={travelers}
        onChange={(e) => setTravelers(Number(e.target.value))}
        min="1"
      />

      {/* Destination selector */}
      <button onClick={() => handleAddDestination("Delhi")}>Add Delhi</button>
      <button onClick={() => handleAddDestination("Jaipur")}>Add Jaipur</button>

      {/* Cost updates automatically! */}
      <CostPrediction
        travelers={travelers}
        destinations={destinations}
        places={[]}
      />
    </>
  );
}
```

---

## 🎨 Navbar Before & After

### BEFORE (Old Styling)

```jsx
<header className="sticky top-0 z-40 border-b border-slate-200 bg-white transition-shadow duration-300">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
    <Link to="/" className="flex items-center gap-2">
      <span className="text-2xl">🌍</span>
      <span className="hidden font-heading font-bold text-slate-900 sm:inline">
        TourVision
      </span>
    </Link>

    <button className="flex h-10 items-center gap-2 rounded-full border border-slate-200 px-3 hover:shadow-sm">
      <span className="text-lg">👤</span>
      <span className="hidden text-sm font-semibold text-slate-900 md:inline">
        Menu
      </span>
    </button>
  </div>
</header>
```

### AFTER (Theme-Aligned)

```jsx
<header
  className={`sticky top-0 z-40 border-b border-[var(--c-border)] bg-gradient-to-r from-white to-[var(--c-surface)] transition-all duration-300 ${isScrolled ? "shadow-sm" : ""}`}
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
    <Link to="/" className="flex items-center gap-2">
      <span className="text-2xl">🌍</span>
      <span className="hidden font-heading font-bold text-[var(--c-text-primary)] sm:inline">
        TourVision
      </span>
    </Link>

    <button className="flex h-10 items-center gap-2 rounded-full border border-[var(--c-border)] px-3 transition-all hover:shadow-sm hover:border-[var(--c-border-focus)]">
      <span className="text-lg">👤</span>
      <span className="hidden text-sm font-semibold text-[var(--c-text-primary)] md:inline">
        Menu
      </span>
    </button>
  </div>
</header>
```

**Key Differences:**

- ✨ Added gradient background
- ✨ All colors use CSS variables
- ✨ Better hover states
- ✨ Improved transitions

---

## 🧮 Cost Calculation Examples

### Example 1: Budget Trip

```
Input:
- Destinations: 2 (Delhi, Jaipur)
- Travelers: 1
- No entry fees

Calculation:
- Travel: 2 × 100 × 10 = ₹2,000
- Entries: 0
- Food: 300 × 1 × 2 = ₹600
- Total: ₹2,600
- Per Person: ₹2,600

Output: "Budget-friendly trip estimate"
```

### Example 2: Family Trip

```
Input:
- Destinations: 3 (Delhi, Agra, Jaipur)
- Travelers: 4 (2 adults + 2 children)
- Entry Fees: Taj Mahal (₹250), Hawa Mahal (₹200)

Calculation:
- Travel: 3 × 100 × 10 = ₹3,000
- Entries: (250 + 200) × 4 = ₹1,800
- Food: 300 × 4 × 3 = ₹3,600
- Total: ₹8,400
- Per Person: ₹2,100

Output: "Family trip cost breakdown"
```

### Example 3: Luxury Trip

```
Input:
- Destinations: 5 (Delhi, Agra, Jaipur, Udaipur, Varanasi)
- Travelers: 2
- Entry Fees: Multiple premium entries

Calculation:
- Travel: 5 × 100 × 10 = ₹5,000
- Entries: ₹2,000 (for 2 people)
- Food: 300 × 2 × 5 = ₹3,000
- Total: ₹10,000
- Per Person: ₹5,000

Output: "Premium trip cost"
```

---

## 🎯 CSS Custom Properties Used

```css
/* In your index.css - these are already defined */

/* Colors */
--c-primary:
  #e8470a /* Warm orange - main theme */ --c-primary-hover: #c73d08
    /* Darker orange on hover */ --c-primary-light: #fef0eb
    /* Very light orange bg */ --c-text-primary: #222222 /* Main text color */
    --c-text-secondary: #717171 /* Secondary text color */
    --c-text-tertiary: #b0b0b0 /* Tertiary text color */ --c-border: #dddddd
    /* Border color */ --c-border-focus: #222222 /* Focused border color */
    --c-surface: #ffffff /* Main background */ --c-surface-inset: #f0efed
    /* Inset background */ /* Radius */ --r-md: 12px /* Medium radius */
    --r-lg: 16px /* Large radius */ --r-xl: 24px /* Extra large radius */
    /* Shadows */ --shadow-card: 0 2px 4px rgba(0, 0, 0, 0.08),
  ... /* Card shadow */;
```

---

## 📱 Responsive Behavior

### Mobile (< 768px)

```
┌─────────────────────┐
│ 🌍 TourVision  👤🔔 │  ← Compact navbar
├─────────────────────┤
│                     │
│  💰 Trip Cost...    │  ← Full width
│                     │
└─────────────────────┘
```

### Tablet (768px - 1024px)

```
┌─────────────────────────────────────────┐
│ 🌍 TourVision │ Search... │ 👤 🔔 Menu │
├─────────────────────────────────────────┤
│                                         │
│          💰 Trip Cost Breakdown         │  ← Centered
│                                         │
└─────────────────────────────────────────┘
```

### Desktop (> 1024px)

```
┌──────────────────────────────────────────────────────┐
│ 🌍 TourVision │ Search destinations... │ 👤 🔔 Menu │
├──────────────────────────────────────────────────────┤
│                                                      │
│          Left Side              Right Side          │
│        Itinerary             💰 Cost Breakdown      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔗 Integration Points

```
App.jsx
  ├── TripPlannerPage.jsx
  │   ├── CostPrediction.jsx  ← NEW
  │   └── MapView.jsx
  ├── Navbar.jsx  ← UPDATED
  ├── NavbarModern.jsx  ← UPDATED
  └── Other Pages...
```

---

## ✅ Validation Checklist

```
CostPrediction Component:
[ ] Renders without errors
[ ] Shows correct cost calculations
[ ] Updates when props change
[ ] Shows fallback when no data
[ ] Matches theme colors
[ ] Mobile responsive
[ ] PropTypes correct

Navbar Updates:
[ ] Colors match theme
[ ] Gradient visible
[ ] Scroll shadow appears
[ ] Hover states work
[ ] Mobile menu functional
[ ] All links work
[ ] No console errors

Trip Planner Integration:
[ ] Cost shows in form section
[ ] Cost shows in results section
[ ] No existing features broken
[ ] Form validation still works
[ ] Map rendering unaffected
```

---

**Created:** April 29, 2026  
**Status:** ✅ Complete & Ready
