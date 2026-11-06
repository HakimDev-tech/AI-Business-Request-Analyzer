# Veyra — Signal Ledger design system

## Design thesis

Signal Ledger treats commercial operations as a record-keeping and decision discipline, not as an AI showcase. The interface borrows its visual grammar from a precision instrument panel, a modern dispatch ledger and technical publishing: aligned columns, strong typographic hierarchy, rule-based separators and deliberate signal colors.

The system is intentionally not built from soft floating cards, pastel gradients, oversized rounded corners or decorative AI motifs. Dense information should remain scannable; every status must have an operational meaning.

## Brand character

- **Precise:** labels, units, identifiers and timestamps are explicit.
- **Decisive:** cobalt marks primary actions and active navigation.
- **Auditable:** each analysis links to its source message and saved record.
- **Restrained:** coral is reserved for exceptions and critical visual punctuation.
- **Operational:** tables and forms take precedence over ornamental dashboard widgets.

## Color tokens

| Token | Value | Role |
|---|---|---|
| Ink | #171923 | Primary text, navigation, high-contrast controls |
| Ink soft | #242735 | Secondary dark surfaces |
| Canvas | #F0F1F4 | Application canvas |
| Surface | #FBFBFC | Main working surface |
| Surface alt | #F6F7FA | Table headers and secondary areas |
| Line | #DFE1E7 | Structural rules and separators |
| Line strong | #C9CCD5 | Input borders |
| Signal blue | #365DFF | Primary actions, links, active work |
| Signal blue soft | #E9EDFF | Decision summaries and selected states |
| Signal coral | #FF795C | Brand punctuation and exception emphasis |
| Success | #27875A | Verified positive outcomes |
| Warning | #B77B2D | Clarification or review states |
| Danger | #C4514E | Stock or catalog failures |

Color is never the sole carrier of status: a written label always accompanies status color.

## Typography

- **Space Grotesk:** page titles, key figures and high-level hierarchy.
- **DM Sans:** application text, form labels, explanatory copy and tables.
- **IBM Plex Mono:** identifiers, SKU values, quantities, technical labels and system metadata.

Use tabular numerals for quantities. Keep metadata compact, but never below a readable 8–9 px visual size on desktop; core interface text should normally be 10–12 px or larger.

## Layout and geometry

- Desktop navigation rail: 232 px.
- Global top bar: 65 px.
- Content maximum width: 1600 px.
- Spacing follows a 4 px base rhythm, with 8 px increments preferred for major grouping.
- Structural corners are square. Small controls may use no more than a 2–3 px radius where needed for focus clarity.
- Separators are 1 px. Avoid soft shadows; use contrast and alignment to establish hierarchy.
- Tables remain horizontally scrollable on narrow viewports.

## Component rules

### Navigation
The sidebar contains real routes only. The active route is indicated by a coral edge and a blue icon. The database indicator must be backed by the health endpoint and must not display a permanently green state.

### Buttons
Primary buttons are cobalt with white text. Secondary actions are white with a structural border. Ghost actions remain visually quiet. Destructive actions use danger styling. Every button has hover, focus-visible, active and disabled states.

### Forms
Inputs have square geometry, explicit labels and visible focus treatment. Validation errors appear next to the relevant interaction. Submit buttons indicate in-progress states and prevent duplicate submissions.

### Tables
Operational data uses tables before cards. Use concise column names, aligned numeric data and written outcome labels. Row actions must navigate to a real record.

### Statuses
- Ready for quotation: success.
- Clarification required / manual review: warning.
- Insufficient stock / no catalog match: danger.
Unknown statuses use a neutral treatment; never silently map unknown states to success.

### Empty and loading states
An empty database is represented honestly. Do not preload sample messages, fake requests, simulated charts or invented usage metrics. Loading and error states must reflect actual network operations.

## Motion and accessibility

- Keep transitions short and functional (roughly 120–180 ms).
- Respect the reduced-motion preference.
- Use semantic headings, landmarks, labels and table structures.
- All icon-only controls require accessible names.
- Maintain visible keyboard focus.
- Ensure text contrast remains strong across neutral and signal surfaces.

## Product integrity rules

1. The dashboard reads its metrics from PostgreSQL-backed APIs.
2. Request history contains only persisted analyses.
3. A request record preserves the original customer message and the structured result.
4. Product quantities are read from and written to the inventory table.
5. Knowledge documents display actual ingestion status and chunk counts.
6. A disconnected database is shown as unavailable, never as connected.
7. Do not add non-functional navigation items or buttons.
8. Do not label the application production-ready until authentication, tenant isolation, authorization, rate limiting, operational monitoring and end-to-end tests are complete.

## Implementation

- Global tokens and layout primitives: src/app/globals.css
- Typography, metadata and application shell: src/app/layout.tsx, src/components/workspace-shell.tsx
- Brand mark and browser icon: src/components/workspace-shell.tsx, src/app/icon.svg
- Shared buttons: src/components/ui/button.tsx
- Operational overview: src/components/workspace-dashboard.tsx
- Request analysis: src/components/analyzer-workspace.tsx
- Request archive and records: src/components/request-history.tsx, src/components/request-detail.tsx
- Product and inventory register: src/components/product-catalog-panel.tsx
- Document ingestion: src/components/catalog-ingest-panel.tsx
