# Changelog

## 0.1.2

- Redesigned the picker to work like Linear: a single vertically scrolling list
  with per-category section headers (all emoji visible by default, not just
  recents), and the category icons act as quick-jump navigation.
- Fix: removed the stray horizontal/vertical scrollbars in the category bar
  (`overflow-x`) — the body now has a single clean vertical scroll and no
  horizontal overflow.

## 0.1.1

- Fix: the emoji grid could not be scrolled (the popup was opened with an inline
  `display:block` that overrode the flex layout, so the grid overflowed and was
  clipped).
- Fix: the popup and the `:` autocomplete now scroll with the page content
  (anchored to the button) instead of staying fixed in the viewport.

## 0.1.0

- Initial release: Linear-style emoji support for content fields
  (`textarea.wiki-edit`).
  - Toolbar **picker** with search, categories and recently-used.
  - **`:` shortcode autocomplete** (keyboard + click).
  - **Classic emoticon replacement** (`:D` → 😄, `:)` → 🙂, `;)` → 😉,
    `<3` → ❤️, …) on word boundary.
  - Unicode insertion (no render changes), bundled emoji set (offline),
    `MutationObserver` for dynamically added editors. No core changes, no
    migrations.
