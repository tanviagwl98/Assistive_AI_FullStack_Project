---
name: Warm Editorial Nuance
colors:
  surface: '#fff8f4'
  surface-dim: '#dfd9d5'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ef'
  surface-container: '#f3ede9'
  surface-container-high: '#ede7e3'
  surface-container-highest: '#e7e1de'
  on-surface: '#1d1b19'
  on-surface-variant: '#54433f'
  inverse-surface: '#32302e'
  inverse-on-surface: '#f6f0ec'
  outline: '#86736e'
  outline-variant: '#d9c1bb'
  surface-tint: '#914a37'
  primary: '#884430'
  on-primary: '#ffffff'
  primary-container: '#a65b46'
  on-primary-container: '#fff1ee'
  inverse-primary: '#ffb5a0'
  secondary: '#625e5a'
  on-secondary: '#ffffff'
  secondary-container: '#e6ded9'
  on-secondary-container: '#66625e'
  tertiary: '#595750'
  on-tertiary: '#ffffff'
  tertiary-container: '#726f68'
  on-tertiary-container: '#f8f3ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#743422'
  secondary-fixed: '#e8e1dc'
  secondary-fixed-dim: '#ccc5c0'
  on-secondary-fixed: '#1e1b18'
  on-secondary-fixed-variant: '#4a4642'
  tertiary-fixed: '#e7e2d9'
  tertiary-fixed-dim: '#cac6bd'
  on-tertiary-fixed: '#1d1c16'
  on-tertiary-fixed-variant: '#494740'
  background: '#fff8f4'
  on-background: '#1d1b19'
  surface-variant: '#e7e1de'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: '0'
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: '0'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses modern product design married with quiet luxury and warm human storytelling, subtly contextualized for contemporary Indian weddings. It purposefully steps away from conventional bridal clichés—avoiding loud marigolds, ornate gold filigree, heavy magenta, and chaotic multi-event noise—in favor of an architectural, editorial rhythm reminiscent of an art monograph or high-end archival publication.

The target audience includes design-conscious couples, high-end wedding planners, and multi-generational family coordinators who demand rigor, order, and visual poise across large-scale festivities. The UI must evoke composure, warmth, spatial generosity, and effortless control amidst complex planning workflows.

The visual style blends:
- **Editorial Modernism:** Distinct typographic hierarchy, generous negative space, purposeful hairline dividers, and deliberate text columns.
- **Warm Minimalist Tactility:** Rich, light-toned canvas layers (warm ivory, soft cream, and subtle warm beige) paired with deliberate deep charcoal and espresso accents rather than stark black and clinical white.
- **SaaS Precision:** Crisp micro-interactions, systematic density controls for complex logistical views (run-of-show, guest tiers, vendor agreements), and uncompromised legibility.

## Colors

The color system establishes a warm, tactile palette rooted in natural materials—cotton rag paper, sun-dried clay, and hand-ground espresso.

### Primary Palette & Roles
- **Primary Accent (`#A65B46` - Soft Clay Rose / Terracotta):** Used strictly as a focused call-to-action color, active state indicator, and key event marker. It brings deliberate human warmth without shouting or leaning into loud bridal reds.
- **Secondary (`#24211E` - Espresso Noir):** Applied for high-contrast contextual sections (such as editorial hero statements, evening run-of-show modes, or VIP seating matrices) and primary interactive elements when muted authority is required.
- **Tertiary (`#ECE7DE` - Warm Beige Surface):** Acts as container fills, subtle hover tokens, and foundational table headers that distinguish groupings without relying on harsh lines.
- **Neutral Foreground (`#1E1C1A` - Deep Charcoal):** The primary reading ink. Avoid `#000000` everywhere to preserve warmth.

### Functional Roles & Canvas Logic
- **Canvas Base:** `#FBF9F5` (Warm Ivory) as the root application background, paired with `#F5F2EB` (Soft Cream) for secondary panels and inner sections.
- **Card Surfaces:** Pure `#FFFFFF` elevated solely by subtle borders (`#E6E1D8`) and ambient warm shadows.
- **Secondary Ink:** `#6E6963` for subtitles, tabular metadata, and secondary labels; `#8C867F` for disabled or de-emphasized structural elements.
- **Semantic Feedback:** Muted ochre, sage, and dusky rust tones mapped strictly to low-saturation scales, avoiding discordant synthetic primary greens and blues.

## Typography

Typography establishes an immediate dialogue between poetic editorial ceremony and operational efficiency.

- **Headings (Playfair Display):** Conveys editorial elegance, refined romantic poise, and architectural order. Used in title casings for ceremony names, overview statistics, section titles, and key milestones. Kept at regular to medium weights (`400`-`500`) to let the character forms breathe.
- **Body & UI (Plus Jakarta Sans):** Chosen for its geometric clarity balanced by subtly rounded humanist terminals. It ensures dense tabular schedules, RSVPs, dietary matrices, and budget ledgers remain exceptionally legible on both desktop and mobile viewports.
- **Labels & Overlines:** Rendered in `Plus Jakarta Sans` with uppercase styling and expanded tracking (`0.06em` to `0.08em`) to mirror archival indexes and luxury stationery monograms.

## Layout & Spacing

The layout philosophy follows a relaxed 12-column modular rhythm structured to prevent logistical overcrowding while supporting rich document layouts.

- **Desktop (1200px+):** 12-column grid, 48px outer margins, and 24px column gutters. Complex workflows (like 3-day itinerary overviews or seating charts) employ an asymmetric 4/8 or 3/9 split, grouping operational filters on the left with expansive content cards on the right.
- **Tablet (768px – 1199px):** 8-column layout, 32px margins, 20px gutters. Sub-navigation collapses into inline segmented horizontal tabs.
- **Mobile (< 768px):** 4-column layout, 20px margins, 16px gutters. Itinerary timelines transition from horizontal multi-column tracks to an anchored, vertical chronological stream.
- **Spatial Rhythm:** Elements leverage a generous 8px base rhythm. High-level dashboard blocks are buffered by `space-xl` (40px) to maintain a serene, unhurried browsing pace.

## Elevation & Depth

Depth is treated with subtle restraint, prioritizing tonal layering and warm tactile borders over pronounced drop shadows.

- **Tonal Layering:** The primary depth mechanic uses surface stacking: `#FBF9F5` (base canvas) → `#F5F2EB` (sub-sections / grouping bays) → `#FFFFFF` (interactive cards and modules).
- **Hairline Framing:** Cards and elevated containers rely on a structural 1px border colored with `#E6E1D8`. This replaces the need for aggressive shadows and creates an editorial print quality.
- **Ambient Shadow (Soft Float):** When floating modals, date pickers, or active drag-and-drop seating nodes require elevation, utilize an extra-diffused warm umber drop: `0px 12px 32px -4px rgba(36, 33, 30, 0.05), 0px 4px 12px -2px rgba(36, 33, 30, 0.03)`.
- **Dark Contrast Inversion:** When rendering evening event timelines or premium feature highlights in `#24211E`, inner cards drop borders down to 10% opacity white (`rgba(255, 255, 255, 0.08)`) with zero shadows.

## Shapes

The geometric signature uses soft, architectural tailoring (`roundedness: 1`). Surfaces feel crafted rather than bubbly or toy-like.

- **Base Radius (0.25rem / 4px):** Applied to micro-components such as data table chips, status indicators, form inputs, and checkboxes.
- **Large Radius (0.5rem / 8px):** Applied to cards, modal sheets, and standard action buttons.
- **Extra-Large Radius (0.75rem / 12px):** Reserved for primary hero modules, media frames, and full-screen viewports.
- **Strict Exceptions:** Interactive pill tags and avatars may use full rounding (`9999px`), while event sequence indicators retain crisp 4px corners to align with linear timeline spines.

## Components

### Buttons
- **Primary:** `#A65B46` fill, `#FFFFFF` text, `0.5rem` radius, padding `12px 24px`. Subtle hover transition shifting to `#944F3C`.
- **Secondary (Editorial Dark):** `#24211E` fill, `#FBF9F5` text. Used for primary milestones or printable run-of-show exports.
- **Outline / Ghost:** 1px `#E6E1D8` border, transparent background, `#1E1C1A` text. Hover shifts background to `#ECE7DE`.

### Input Fields & Controls
- **Inputs & Selects:** `#FFFFFF` background, 1px `#E6E1D8` border, 8px radius, 12px 16px padding. Active focus state transitions border to `#A65B46` without harsh outer glow rings. Placeholder text set in `#8C867F`.
- **Checkboxes & Radios:** 18px custom square/circular controls. Unchecked: `#FFFFFF` with 1.5px `#E6E1D8` border. Checked: `#A65B46` fill with an off-white checkmark.

### Cards & Panels
- **Standard Card:** `#FFFFFF` fill, 1px `#E6E1D8` border, 8px radius, `space-lg` internal padding. No resting shadow. Hover states subtly lift the card with the ambient warm shadow and a border shift to `#D9D3C7`.
- **Ceremony / Milestone Card:** Split-panel layout with warm beige left boundary (`#ECE7DE`), an editorial serif title, and structured timestamp metadata.

### Chips & Badges
- **Status Badges (Confirmed, Pending, VIP):** Soft tinted backgrounds (`#F5F2EB`), 1px `#E6E1D8` border, uppercase `label-sm` typography with tracking. Positive confirmations adopt a desaturated sage tone; reminders use muted terracotta.

### Domain-Specific Components
- **Ceremony Timeline Spine:** A vertical 1px hairline in `#E6E1D8` linking multi-event schedules (e.g., Sangeet, Haldi, Vows, Reception). Active moments are marked with an 8px solid terracotta circular milestone node.
- **Guest Tier Grouping:** Modular matrix grouping guests by multi-event access, food choices, and familial ties, styled using subtle horizontal zebra stripping (`#FBF9F5` to `#FFFFFF`) and minimal column dividers.