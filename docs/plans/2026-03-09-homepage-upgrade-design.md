# Homepage Upgrade Design: The Classic Exhibition

**Aesthetic Direction:** Organic Editorial / The Classic Exhibition
**Core Principles:** Visual Impact, Asymmetric Layouts, Polished Micro-interactions

## 1. Global Visual Effects & Layout (The "A" Element)

- **Smooth Scrolling (`@studio-freight/lenis`)**: Replace standard browser scroll with a buttery-smooth, inertia-based scroll experience. This is crucial for premium awarded sites.
- **Organic Aura Layer**: In `index.css` (or a global React component), underneath the textual content but above the base background, we will place a large, slowly rotating, hyper-blurred SVG/CSS radial gradient (using `var(--accent)` caramel tones). This light "aura" follows the user's scroll or mouse slightly, mimicking a reading spotlight on physical parchment.
- **Mix-Blend-Mode Typography**: We will continue and expand the use of `mix-blend-mode: difference` on fixed elements (like the Logo and Language Toggle) to ensure they look stunning regardless of the image or background color they pass over.

## 2. Editorial Layout Refactor (The "B" Element)

- **Hero Section (`HeroSection.tsx`)**:
  - Restructure to be full-height (`100vh`).
  - Introduce a **Staggered Text Reveal** for the main title: each word (or even character) smoothly rises from a masked bottom edge with staggered delays (`framer-motion` variants).
  - The hero image becomes a dramatic, large-scale abstract form that triggers a slight parallax on scroll.
- **Projects Section (`ProjectsSection.tsx`)**:
  - Move away from standard grids.
  - Implement a **"Magazine Spread" Layout**: Alternate project cards so one is large and left-aligned, the next is smaller, overlapping minimally, and right-aligned.
  - Introduce **Scroll Parallax** heavily here: images scroll at a different speed than their containing cards, creating a "window" effect.
- **Typography Adjustments**: Increase the size of Serifs (`Playfair Display`) on section headers dramatically (e.g., `8rem` on desktop), making them bleed off the screen or act as background texture.

## 3. Micro-Interactions (The "C" Element)

- **Magnetic Custom Cursor (`CustomCursor.tsx`)**:
  - Enhance the dot to smoothly trail the actual mouse position (using spring physics).
  - When hovering over a Project link, the cursor expands, turns white, and displays text like "View" (similar to a custom tooltip).
- **Hover Image Reveals**: For the `WritingsSection`, instead of static bullet points, hovering over an article title will reveal its cover image floating near the cursor (using `framer-motion` layout animations).

## Verification Strategy

- **Performance**: Ensure animations use `transform` and `opacity` exclusively to prevent layout thrashing.
- **Cross-device**: Fallback to simpler interactions on mobile where hover/custom cursors don't apply.
- **Aesthetic Check**: The site must feel like turning the pages of an expensive, tactile design magazine.
