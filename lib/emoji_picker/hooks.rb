module EmojiPicker
  class Hooks < Redmine::Hook::ViewListener
    # CSS do <head> (len pre prihlásených — needitujúci to nepotrebujú)
    def view_layouts_base_html_head(context = {})
      return '' unless User.current.logged?
      stylesheet_link_tag('emoji_picker', plugin: 'redmine_emoji_picker').html_safe
    end

    # Emoji dáta + logika na koniec <body>
    def view_layouts_base_body_bottom(context = {})
      return '' unless User.current.logged?
      out = +''
      out << javascript_include_tag('emoji_data', plugin: 'redmine_emoji_picker')
      out << javascript_include_tag('emoji_picker', plugin: 'redmine_emoji_picker')
      out.html_safe
    end
  end
end
