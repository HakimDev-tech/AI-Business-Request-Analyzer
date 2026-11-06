# Veyra — Exchange Atelier design system

## Design thesis

Exchange Atelier takes its cues from the working language of international trade: annotated order sheets, freight documents, account books and editorial business journals. The interface should feel like a carefully built commercial instrument, not an AI playground or a generic admin template.

The visual signature is a meeting of three elements:
- a **route mark** that represents the path from an incoming message to a verified decision;
- **editorial typography** for hierarchy and clear reading;
- **operational typography and tables** for identifiers, quantities, evidence and traceability.

Do not introduce gradients, glowing AI orbs, decorative assistant avatars, fake activity charts, placeholder KPIs or demo requests.

## Brand character

- **Grounded:** real business records take priority over abstract AI features.
- **Legible:** hierarchy is created through type, spacing and structure rather than decoration.
- **Traceable:** source messages, extracted fields and evidence remain connected.
- **Human-controlled:** AI interprets; database-backed logic verifies; an operator owns commercial approval.
- **Distinctive:** asymmetrical corners, editorial display type, oxide accents and the paired route-line mark create a consistent identity.

## Color tokens

| Token | Value | Role |
|---|---|---|
| Deep tide | #193738 | Sidebar, brand anchor and high-contrast surfaces |
| Tide ink | #203A39 | Primary text |
| Canvas mist | #EDF2EF | Workspace background |
| Porcelain | #FFFDF9 | Main working surfaces |
| Mist surface | #F3F7F4 | Table headers and secondary surfaces |
| Structural line | #D6E1DC | Dividers and panel edges |
| Line strong | #BBCEC7 | Input borders |
| Oxide | #BC5034 | Primary action, active links and key emphasis |
| Oxide deep | #943D2B | Pressed/hover primary action |
| Brass | #E2AD69 | Brand punctuation and secondary emphasis |
| Sea glass | #4E8279 | Supporting accent and selected informational states |
| Success | #2E7858 | Verified positive outcomes |
| Warning | #A8753C | Clarification and manual review |
| Danger | #AD4E41 | Stock or catalog failures |

Color must never be the sole carrier of status. Every status includes a written label and, where useful, an icon.

## Typography

- **Newsreader:** page headlines, editorial statements and selected high-level figures. Use moderate weights and avoid oversized, all-caps headings.
- **Manrope:** interface copy, forms, buttons, labels and navigation.
- **IBM Plex Mono:** SKUs, record IDs, quantities, technical labels, timestamps and system metadata.

Use tabular numerals for quantities. Secondary metadata may be compact, but core interface text must remain comfortably readable. Do not use mono for paragraphs.

## Geometry and composition

- Desktop navigation: 248 px fixed rail, dark tidal surface.
- Header: 68 px, persistent and restrained.
- Main content: max-width 1580 px with responsive gutters.
- Panels use a subtle asymmetrical corner pair (15 px / 3 px); controls use smaller, related geometry.
- Primary actions use oxide fill, modest corner asymmetry and clear pressed/disabled states.
- The page canvas uses a faint point field only as a quiet structural texture. It must never interfere with text or data.
- Tables remain horizontally scrollable on narrow screens.
- Do not put every individual datum in a floating card. Prefer grouped fields, tables and clear section dividers.

## Navigation and shell

The sidebar only contains real routes:
- Operations overview
- Request archive
- New request
- Products & knowledge

Active navigation uses a brass marker and a restrained tinted surface. The database state in the header must be sourced from the health endpoint and must distinguish checking, connected and unavailable states. Sign-out must call the real logout endpoint.

Mobile navigation becomes a full-height overlay with an accessible close control. Do not render hidden desktop navigation items as dead mobile buttons.

## Components

### Buttons
- Primary: oxide fill and white text.
- Secondary: porcelain surface and structural border.
- Ghost: quiet text action, with a visible hover surface.
- Danger: pale warm surface and danger text.
Every button has hover, focus-visible, active and disabled states. An action must correspond to a real operation.

### Forms
Inputs use explicit labels, a visible focus ring and the same asymmetrical geometry as buttons. Validation errors appear near the relevant field or form. Submit controls prevent duplicate submissions and communicate in-progress state.

### Tables
Operational records use semantic tables before decorative charts. Use concise column labels, aligned numeric values and text-based outcomes. Row links must navigate to the correct saved record.

### Statuses
- Ready for quotation: success.
- Clarification required / manual review: warning.
- Insufficient stock / no catalog match: danger.
- Unknown states: neutral.
Never silently map an unknown status to success.

### Empty, loading and error states
An empty database is represented honestly. No sample customer messages, fake records, synthetic metrics or illustrative inventory are loaded automatically. Loading and error states must correspond to actual network operations and expose a recovery action when available.

## Product integrity

1. The overview reads metrics from the PostgreSQL-backed workspace API.
2. Request history displays only persisted analyses.
3. A saved request keeps the original customer message, extracted structure and decision payload.
4. Catalog items and stock quantities are read from and written to the product/inventory APIs.
5. Knowledge documents display actual ingestion state and chunk counts.
6. Database connectivity is based on the health endpoint; never show a permanent green state.
7. The analyzer starts empty. The operator supplies the real customer message.
8. No UI control should imply that a workflow exists when there is no server-side implementation.
9. The current shared-password gate is a private-instance access control, not a substitute for individual accounts, roles or tenant isolation.
10. Do not claim public multi-customer SaaS readiness until tenant isolation, authorization, rate limiting, monitoring, recovery and end-to-end tests are in place.

## Accessibility and responsive behavior

- Use semantic landmarks, headings, labels and table structures.
- All icon-only controls require accessible names.
- Maintain visible keyboard focus and strong contrast.
- Respect reduced-motion preferences.
- Sidebar, tables, long IDs and forms must remain usable on small screens.

## Implementation map

- Tokens, layout primitives and responsive rules: `src/app/globals.css`
- Fonts, metadata and viewport: `src/app/layout.tsx`
- Application navigation and access state: `src/components/workspace-shell.tsx`
- Brand mark and favicon: `src/components/workspace-shell.tsx`, `src/app/icon.svg`
- Buttons: `src/components/ui/button.tsx`
- Overview: `src/components/workspace-dashboard.tsx`
- Request analysis: `src/components/analyzer-workspace.tsx`
- Request archive and saved records: `src/components/request-history.tsx`, `src/components/request-detail.tsx`
- Product/inventory and knowledge sources: `src/components/product-catalog-panel.tsx`, `src/components/catalog-ingest-panel.tsx`
- Public product page: `src/app/product/page.tsx`
- Private access: `src/components/workspace-login.tsx`
