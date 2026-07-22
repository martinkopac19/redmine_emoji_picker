# Changelog

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
