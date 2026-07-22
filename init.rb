# Redmine Emoji Picker (Previo)
# Linear-style emoji picker do textových polí (wiki-edit): tlačidlo v toolbari
# + `:` autocomplete + náhrada klasických smajlíkov (:D → 😄).
# JS/CSS injektované cez view hooky, emoji dáta zabalené v plugine (offline, GDPR).
# Emoji sú Unicode → žiadna zmena renderu, žiadny zásah do jadra.

require_relative 'lib/emoji_picker/hooks'

Redmine::Plugin.register :redmine_emoji_picker do
  name 'Emoji Picker (Previo)'
  author 'Martin Kopáč'
  description 'Linear-style emoji picker for text fields: toolbar button, : autocomplete and classic emoticon replacement (:D → 😄).'
  version '0.2.0'
  url 'https://github.com/martinkopac19/redmine_emoji_picker'
  requires_redmine version_or_higher: '5.0'
end
