# Design Assets

This directory contains all design-related assets for the So Quotable project.

## Directory Structure

### mockups/

UI/UX mockups and wireframes

- **Purpose**: Visual designs and layouts before implementation
- **File types**: Figma exports, Sketch files, PNG/JPG mockups
- **Naming**: `[feature]-[view]-[version].png`
  - Example: `quote-editor-v1.png`

### screenshots/

Screenshots of the application at various stages

- **Purpose**: Document UI changes, bug reports, feature demonstrations
- **File types**: PNG, JPG
- **Naming**: `[feature]-[date].png`
  - Example: `quote-gallery-2025-10-22.png`

### color-schemes/

Color palette definitions and theme files

- **Purpose**: Maintain consistent branding and theme
- **File types**: JSON, CSS, color palette exports
- **Naming**: `[theme-name].json`
  - Example: `primary-palette.json`, `dark-theme.json`

Example color scheme JSON:

```json
{
  "primary": "#3B82F6",
  "secondary": "#8B5CF6",
  "accent": "#10B981",
  "background": "#FFFFFF",
  "text": "#1F2937",
  "error": "#EF4444",
  "warning": "#F59E0B",
  "success": "#10B981"
}
```

### assets/

General design assets (logos, icons, illustrations)

- **Purpose**: Reusable design elements
- **File types**: SVG, PNG (with transparency), AI, PSD
- **Naming**: `[asset-type]-[name].svg`
  - Example: `logo-primary.svg`, `icon-quote.svg`

## Design Process

1. **Ideation**: Sketch concepts, create wireframes
2. **Mockups**: Create high-fidelity mockups in design tool
3. **Review**: Share mockups for feedback
4. **Export**: Export assets to appropriate directories
5. **Implement**: Developers reference mockups during implementation
6. **Screenshots**: Capture screenshots of implemented features

## Design Tools

(Update as you choose your tools)

- **UI/UX Design**: Figma, Sketch, Adobe XD
- **Icons**: Heroicons, Font Awesome, custom SVGs
- **Illustrations**: [To be determined]
- **Prototyping**: [To be determined]

## Design System

For comprehensive design system documentation (components, patterns, typography, spacing), see design system documentation once established.

Key design principles for So Quotable:

- Clean, minimal interface
- Focus on quote readability
- Source verification prominence
- Intuitive image overlay controls

## Accessibility

Design with accessibility in mind:

- Sufficient color contrast (WCAG AA minimum)
- Clear typography
- Keyboard navigation support
- Screen reader compatibility
- Touch-friendly targets (minimum 44px)

## Responsive Design

Design for multiple breakpoints:

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## Brand Guidelines

(To be developed)

- Logo usage
- Color palette
- Typography
- Voice and tone
- Image style

---

_Keep design assets organized and up to date to maintain consistency across the project._
