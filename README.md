# Redmine Emoji Picker

A [Linear](https://linear.app)-style **emoji experience** for Redmine's text
fields (issue description & notes, wiki, forums, comments):

- 😊 **Picker button** in the markdown toolbar — a searchable set with
  categories and a *recently used* row; click an emoji to insert it at the caret.
- **`:` autocomplete** — type `:roc` and pick 🚀 from a dropdown
  (arrow keys + Enter/Tab, or click).
- **Classic emoticon replacement** — type `:D`, `:)`, `;)`, `<3`, … followed by a
  space and it becomes 😄 🙂 😉 ❤️.

Emojis are just **Unicode characters**, so they render natively everywhere — in
the editor and in the rendered text — with **no changes to Redmine's rendering
pipeline**. It's a plain plugin: a bit of JavaScript/CSS injected via view
hooks, with the emoji set **bundled in the plugin** (no external CDN, works
offline). **No core changes, no migrations** → upgrades stay clean.

## Requirements

- Redmine **5.0+** (developed and tested on **6.1.3**).

## Installation

```bash
cd /path/to/redmine/plugins
git clone https://github.com/martinkopac19/redmine_emoji_picker.git
# restart Redmine (e.g. `touch tmp/restart.txt`, or restart the app server/container)
```

No database migrations. To update, `git pull` and restart Redmine.

## Usage

- Click the 😊 button in a content field's toolbar to open the picker; search or
  browse by category, click to insert.
- While typing, `:name` shows an autocomplete dropdown of matching emoji.
- Type a classic emoticon followed by a space to have it replaced automatically.

## How it works

- The picker/logic is injected on every page for logged-in users via
  `view_layouts_base_html_head` (CSS) and `view_layouts_base_body_bottom` (JS).
- It decorates `textarea.wiki-edit` (Redmine's rich-text content fields), adding
  the button to the native `.jstElements` toolbar. A `MutationObserver` catches
  editors added later (reply/inline edit).
- Emoji are inserted at the caret with `setRangeText` and an `input` event is
  dispatched so Redmine's live preview updates.

## Customizing the emoji set

The set and the emoticon map live in
`assets/javascripts/emoji_data.js` (`window.REP_EMOJI` and
`window.REP_EMOTICONS`). Add or remove entries there — no build step.

## Privacy

Everything runs client-side against your own Redmine session; the emoji set is
bundled. No data leaves the server and no third-party service is involved.

## License

GPL-2.0 — see [LICENSE](LICENSE).
