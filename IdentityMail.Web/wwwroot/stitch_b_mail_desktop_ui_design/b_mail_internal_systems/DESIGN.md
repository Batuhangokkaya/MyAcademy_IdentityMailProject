---
name: B-Mail Internal Systems
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#1d4ed8'
  on-secondary: '#ffffff'
  secondary-container: '#4069f2'
  on-secondary-container: '#fffbff'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b5'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
  headline-sm-mobile:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar_width: 260px
  navbar_height: 64px
  gutter: 1.5rem
  margin_page: 2rem
  stack_sm: 0.5rem
  stack_md: 1rem
  stack_lg: 1.5rem
---

## Brand & Style
The design system focuses on a high-utility, professional corporate environment. It prioritizes clarity, efficiency, and a reduced cognitive load for internal employees. The aesthetic is **Modern Minimalist**, utilizing a white-label approach where the interface recedes to let the communication content stand out.

The emotional response is one of reliability and organized calm. By employing significant whitespace and a structured layout, the system avoids the "clutter" often associated with enterprise tools. Key visual hallmarks include soft elevation, subtle borders, and a disciplined adherence to a primary blue-centric palette.

## Colors
The color palette is anchored by a trustworthy Corporate Blue. 

- **Primary & Hover:** Used for primary actions, active navigation states, and key interactive elements.
- **Backgrounds:** A very light cool gray (#F8FAFC) is used for the main application canvas to provide subtle contrast against white cards and sidebars.
- **Surfaces:** Sidebars and cards utilize pure white (#FFFFFF) to signify depth and cleanliness.
- **Semantic Colors:** Green, Amber, and Red are reserved strictly for status indicators (online, away, busy) and destructive actions to ensure immediate user recognition.

## Typography
This design system utilizes **Inter** for its exceptional legibility at small sizes and its neutral, systematic feel. 

- **Hierarchy:** Headlines use tighter letter spacing and heavier weights to establish clear content sections.
- **Body Text:** Optimized at 14px and 16px for long-form internal communication. 
- **Labels:** Small caps or medium weights are used for UI metadata, such as timestamps in message threads or status badges.

## Layout & Spacing
The layout follows a **Fixed-Fluid** model tailored for desktop productivity. 

- **Sidebar:** A fixed 260px left-hand navigation allows for quick access to channels, folders, and direct messages.
- **Top Navigation:** A 64px persistent bar houses search and global profile settings.
- **Main Content:** The central area is a fluid fluid container that adjusts based on screen width, utilizing a standard 12-column grid for internal card layouts.
- **Spacing Rhythm:** Based on an 8px incremental scale (4, 8, 16, 24, 32, 48, 64) to ensure consistent alignment.

## Elevation & Depth
Depth is conveyed through **Tonal Separation** and **Ambient Shadows**.

1.  **Level 0 (Base):** The #F8FAFC background.
2.  **Level 1 (Sidebar/Cards):** White surfaces with a 1px border (#E5E7EB) and no shadow for a flat, organized look.
3.  **Level 2 (Active/Hover):** When a card or list item is hovered, it receives a soft, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.
4.  **Level 3 (Modals/Overlays):** Elevated with a more pronounced shadow to pull focus from the background blur: `0 20px 25px -5px rgb(0 0 0 / 0.1)`.

## Shapes
The design system uses a **Rounded** language to soften the corporate edge of the platform and make the UI feel approachable.

- **Buttons & Inputs:** 0.5rem (8px) corner radius.
- **Cards & Modals:** 1rem (16px) corner radius.
- **Badges/Chips:** Full pill-shape for high-contrast visibility.
- **Avatars:** Circular (clip-path: 50%) to distinguish people from objects/folders.

## Components
- **Buttons:** Primary buttons use #2563EB with white text. Hover states transition smoothly to #1D4ED8 over 200ms. Secondary buttons use a transparent background with a #E5E7EB border.
- **Search Boxes:** Situated in the top navigation, search boxes use a 0.5rem radius, a subtle left-aligned Font Awesome magnifying glass icon, and a light gray placeholder text.
- **Badges:** Small, high-contrast labels used for notification counts (Primary Blue) or status (Semantic Green/Red).
- **Modals:** Centered overlays with a 1rem radius, featuring a clear header, body, and footer section with right-aligned primary actions.
- **Profile Cards:** Used in the sidebar or message headers, featuring a 32px or 40px circular avatar, name in `label-md`, and status indicator in the bottom-right corner of the avatar.
- **Icons:** Use Font Awesome "Pro" or "Regular" weights. Icons should always be centered within a 20px or 24px bounding box to ensure perfect optical alignment with text.