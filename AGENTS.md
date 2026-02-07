# souvenir — Конструктор гирлянд (Garland Constructor)

## Project Overview

**souvenir** is a single-page interactive web application for customizing and ordering decorative letter garlands (гирлянды). It allows users to:

- Choose an occasion (birthday, wedding, graduation, holidays, etc.)
- Enter custom text (up to 5 lines, 120 characters total)
- Select visual styles (minimal, cards, cosmos, chalk, contrast)
- Pick color palettes (classic, ocean, sunset, forest, berry, candy, custom)
- Preview the garland in realistic room settings
- Submit an order form

The application is designed in Russian language and targets customers looking for personalized party decorations.

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Language** | HTML5 (single-file application) |
| **Styling** | CSS3 with CSS Custom Properties (variables) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Fonts** | Google Fonts: Inter, Manrope, Unbounded |
| **External Assets** | Unsplash images for room backgrounds |
| **Build System** | None (static site) |
| **Package Manager** | None |
| **Framework** | None (vanilla JS) |

## Project Structure

```
souvenir/
├── index.html          # Main application (all HTML, CSS, JS in one file)
├── photo-1.jpg         # Static image assets (unused in current version)
├── photo-2.jpg
├── photo-3.jpg
├── photo-4.jpg
├── photo-5.jpg
├── .gitignore          # Git ignore rules
└── AGENTS.md           # This file
```

**Note:** This is intentionally a **single-file application**. All HTML markup, CSS styles, and JavaScript code are contained within `index.html`. There are no separate CSS or JS files.

## Architecture Details

### State Management
The application uses a simple centralized state object:

```javascript
const state = {
  occasion: null,           // Selected occasion type
  text: '',                 // Banner text content
  style: 'minimal',         // Visual style (minimal/cards/cosmos/chalk/contrast)
  palette: 'classic',       // Color palette
  customTextColor: '#1D1D1F',
  customCardColor: '#FFFFFF',
  name: '',                 // Order form: customer name
  contact: '',              // Order form: phone/Telegram
  comment: ''               // Order form: additional comments
};
```

### Key Constraints
- **Max lines:** 5
- **Max characters:** 120 total
- **Max characters per line:** 16 (auto-wrap for longer text)
- **Styles:** minimal, cards, cosmos, chalk, contrast
- **Palettes:** classic, ocean, sunset, forest, berry, candy, custom

### Visual Style System
Each style is implemented via CSS classes on the banner container:
- `.style-minimal` — Clean letters without backgrounds
- `.style-cards` — White card backgrounds with shadows
- `.style-cosmos` — Gradient purple/pink backgrounds
- `.style-chalk` — Dark card backgrounds (chalkboard style)
- `.style-contrast` — Alternating filled/white cards

### Room Backgrounds
The preview panel shows the garland against real interior photos fetched from Unsplash:
1. Гостиная (Living room)
2. Уютная (Cozy)
3. Светлая (Bright)
4. Модерн (Modern)

## Code Organization

The `index.html` file is organized as follows:

1. **`<head>`** — Meta tags, Google Fonts link, CSS styles (lines 10-1139)
2. **`<body>`** — HTML structure (lines 1141-1413)
   - Header with logo
   - Preview panel (sticky left side)
   - Configuration panel (scrollable right side)
   - Mobile preview modal
   - Success toast notification
   - Confetti container
3. **`<script>`** — JavaScript logic (lines 1415-2057)

### JavaScript Modules (within the script tag)

| Section | Lines | Description |
|---------|-------|-------------|
| State | 1418-1429 | Application state object |
| Constants | 1431-1499 | Configuration for rooms, palettes, suggestions, gradients |
| DOM References | 1501-1519 | Query selectors for elements |
| Text Processing | 1523-1558 | `splitIntoLines()` — handles line breaks and auto-wrap |
| Rendering | 1569-1773 | `renderBanner()`, `applyLetterStyle()`, `drawStringPath()` |
| UI Updates | 1775-1899 | Counters, price calculation, form validation, confetti |
| Event Handlers | 1891-1990 | Click and input event listeners |
| Initialization | 1992-2056 | Scroll reveal, resize handling, room setup, demo content |

## Build and Development

### No Build Step Required
This is a static HTML file. No build tools, bundlers, or package managers are used.

### Local Development

**Option 1: Direct file open**
```bash
# Simply open in browser (some features may not work due to CORS)
open index.html
```

**Option 2: Local server (recommended)**
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if npx is available)
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Deployment

The project can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web server (Apache, Nginx, etc.)

Simply upload the `index.html` file and image assets to the server root.

## Code Style Guidelines

### CSS Conventions
- Uses CSS Custom Properties (variables) for theming
- BEM-like naming for component classes (e.g., `.preview-panel`, `.banner-line`)
- CSS animations for entrance effects and hover states
- Mobile-first responsive design with media queries at 960px and 640px

### JavaScript Conventions
- ES6+ syntax (const/let, arrow functions, template literals)
- Helper functions: `$()` and `$$()` for DOM selection
- Event delegation pattern for dynamic elements
- Animation frame-based rendering for SVG string paths

### Naming Patterns
- State variables: camelCase
- CSS classes: kebab-case
- Constants: UPPER_SNAKE_CASE
- DOM element variables: descriptive names (e.g., `previewCanvas`, `bannerContainer`)

## Testing

There are no automated tests in this project. Testing is manual:

1. Open the page in different browsers (Chrome, Firefox, Safari)
2. Test responsive layout at various screen widths
3. Verify all interactive elements:
   - Occasion pills selection
   - Text input with line breaks
   - Style card selection
   - Color palette switching
   - Custom color pickers
   - Room background switching
   - Mobile preview modal
   - Form submission

## External Dependencies

| Resource | URL | Purpose |
|----------|-----|---------|
| Google Fonts | fonts.googleapis.com | Typography (Inter, Manrope, Unbounded) |
| Unsplash Images | images.unsplash.com | Room background photos |

**Note:** The application requires an internet connection to load fonts and room background images.

## Git Repository

- **Origin:** `https://github.com/ungattocinereo/souvenir`
- **Main branch:** `main` (or `master`)
- **Commit history:** Shows iterative development with descriptive messages

## Security Considerations

- No user data is persisted to any server (order submission logs to console only)
- No authentication or session management
- No sensitive data handling
- External resources loaded from trusted sources (Google, Unsplash)
- Form validation is client-side only

## Future Enhancement Areas

If extending this project, consider:
1. Adding a backend API for actual order processing
2. Implementing image export functionality for the preview
3. Adding more style variations and animations
4. Supporting multiple languages
5. Adding unit tests with Jest or Vitest
6. Implementing a build system (Vite, Webpack) for better code organization
