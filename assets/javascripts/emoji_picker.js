/* Redmine Emoji Picker — Linear-style picker + `:` autocomplete + emoticon replace.
   Vanilla JS, bez závislostí. Cieľ: textarea.wiki-edit (obsahové polia).
   Emoji sú Unicode → vkladajú sa priamo do textu, žiadna zmena renderu. */
(function () {
  'use strict';
  var EMOJI = window.REP_EMOJI || [];
  var CATS = window.REP_EMOJI_CATEGORIES || [];
  var EMOTICONS = window.REP_EMOTICONS || {};

  var active = null;                 // aktívna textarea
  var pop = null, popSearch = null, popTa = null;
  var popBody = null, popSections = null, popResults = null, popNav = null;
  var ac = null, acTa = null, acStart = 0, acSel = 0, acData = [];

  // ---------- utils ----------
  function readRecent() { try { return JSON.parse(localStorage.getItem('rep_recent') || '[]'); } catch (e) { return []; } }
  function pushRecent(c) {
    try { var a = readRecent().filter(function (x) { return x !== c; }); a.unshift(c); localStorage.setItem('rep_recent', JSON.stringify(a.slice(0, 40))); } catch (e) {}
  }
  function fireInput(ta) { try { ta.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {} }

  function insertInto(ta, text, start, end) {
    if (!ta) return;
    var s = (start == null ? ta.selectionStart : start);
    var e = (end == null ? ta.selectionEnd : end);
    ta.focus();
    try { ta.setRangeText(text, s, e, 'end'); }
    catch (err) { ta.value = ta.value.slice(0, s) + text + ta.value.slice(e); ta.selectionStart = ta.selectionEnd = s + text.length; }
    fireInput(ta);
  }

  function searchEmoji(q) {
    q = (q || '').toLowerCase();
    if (!q) return [];
    var starts = [], contains = [];
    for (var i = 0; i < EMOJI.length; i++) {
      var e = EMOJI[i], hitStart = false, hitContain = false;
      if (e.n.indexOf(q) === 0) hitStart = true; else if (e.n.indexOf(q) > 0) hitContain = true;
      var j;
      for (j = 0; j < e.sc.length; j++) { if (e.sc[j].toLowerCase().indexOf(q) === 0) hitStart = true; else if (e.sc[j].toLowerCase().indexOf(q) >= 0) hitContain = true; }
      for (j = 0; j < e.k.length; j++) { if (e.k[j].indexOf(q) === 0) hitStart = true; else if (e.k[j].indexOf(q) >= 0) hitContain = true; }
      if (hitStart) starts.push(e); else if (hitContain) contains.push(e);
    }
    return starts.concat(contains);
  }

  // ---------- picker popup (Linear-style: jeden zvislý zoznam so sekciami) ----------
  function buildPopup() {
    if (pop) return;
    pop = document.createElement('div'); pop.className = 'rep-pop'; pop.style.display = 'none';

    var head = document.createElement('div'); head.className = 'rep-head';
    popSearch = document.createElement('input'); popSearch.type = 'text'; popSearch.className = 'rep-search';
    popSearch.setAttribute('placeholder', 'Search emoji…'); popSearch.setAttribute('autocomplete', 'off');
    head.appendChild(popSearch);

    // navigačné ikony kategórií = rýchly skok (nie filter)
    popNav = document.createElement('div'); popNav.className = 'rep-nav';
    CATS.forEach(function (c) {
      if (c.id === 'recent') return;
      var t = document.createElement('button'); t.type = 'button'; t.className = 'rep-navbtn'; t.textContent = c.icon; t.title = c.name;
      t.addEventListener('mousedown', function (ev) { ev.preventDefault(); jumpTo(c.id); });
      popNav.appendChild(t);
    });

    popBody = document.createElement('div'); popBody.className = 'rep-body';
    popSections = document.createElement('div'); popSections.className = 'rep-sections';
    popResults = document.createElement('div'); popResults.className = 'rep-results rep-grid'; popResults.style.display = 'none';
    popBody.appendChild(popSections); popBody.appendChild(popResults);

    pop.appendChild(head); pop.appendChild(popNav); pop.appendChild(popBody);
    document.body.appendChild(pop);

    popSearch.addEventListener('input', function () {
      var q = popSearch.value.trim();
      if (q) showResults(searchEmoji(q)); else showSections();
    });
    popSearch.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closePopup(); } });
  }

  function emojiButton(e) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'rep-emoji'; b.textContent = e.c; b.title = e.n || '';
    b.addEventListener('mousedown', function (ev) { ev.preventDefault(); insertInto(popTa || active, e.c); pushRecent(e.c); });
    return b;
  }
  function addSection(id, title, list) {
    if (!list.length) return;
    var sec = document.createElement('div'); sec.className = 'rep-sec'; sec.dataset.sec = id;
    var h = document.createElement('div'); h.className = 'rep-sec-title'; h.textContent = title; sec.appendChild(h);
    var g = document.createElement('div'); g.className = 'rep-grid';
    list.forEach(function (e) { g.appendChild(emojiButton(e)); });
    sec.appendChild(g); popSections.appendChild(sec);
  }
  function buildSections() {
    popSections.textContent = '';
    var rc = readRecent();
    if (rc.length) addSection('recent', 'Recently used', rc.map(function (c) { return { c: c, n: '' }; }));
    CATS.forEach(function (c) {
      if (c.id === 'recent') return;
      addSection(c.id, c.name, EMOJI.filter(function (e) { return e.cat === c.id; }));
    });
  }
  function showSections() { popResults.style.display = 'none'; popSections.style.display = 'block'; }
  function showResults(list) {
    popResults.textContent = '';
    if (!list.length) { var em = document.createElement('div'); em.className = 'rep-empty'; em.textContent = 'No results'; popResults.appendChild(em); }
    else list.forEach(function (e) { popResults.appendChild(emojiButton(e)); });
    popSections.style.display = 'none'; popResults.style.display = 'grid';
  }
  function jumpTo(id) {
    var sec = popSections.querySelector('.rep-sec[data-sec="' + id + '"]');
    if (!sec) return;
    popBody.scrollTop += sec.getBoundingClientRect().top - popBody.getBoundingClientRect().top;
  }

  function openPicker(ta, anchor) {
    buildPopup();
    popTa = ta; active = ta;
    buildSections();
    popSearch.value = ''; showSections();
    pop.style.display = 'flex';   // musí byť flex (nie block), inak sa telo nescrolluje
    // pozícia pri tlačidle (dokumentové súradnice → popup ide s obsahom pri scrolle)
    var r = anchor.getBoundingClientRect();
    var sx = window.pageXOffset || 0, sy = window.pageYOffset || 0;
    var w = 320, h = 380;
    var vpLeft = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    var vpTop = r.bottom + 4;
    if (vpTop + h > window.innerHeight) vpTop = Math.max(8, r.top - h - 4);
    pop.style.left = (vpLeft + sx) + 'px';
    pop.style.top = (vpTop + sy) + 'px';
    popBody.scrollTop = 0;
    setTimeout(function () { popSearch.focus(); }, 0);
  }
  function closePopup() { if (pop) pop.style.display = 'none'; popTa = null; }

  document.addEventListener('mousedown', function (e) {
    if (pop && pop.style.display !== 'none' && !pop.contains(e.target) && !(e.target.classList && e.target.classList.contains('rep-btn'))) closePopup();
  });

  // ---------- `:` autocomplete ----------
  function buildAc() {
    if (ac) return;
    ac = document.createElement('div'); ac.className = 'rep-ac'; ac.style.display = 'none';
    document.body.appendChild(ac);
  }
  function closeAc() { if (ac) ac.style.display = 'none'; acTa = null; acData = []; }
  function showAc(ta, start, list) {
    buildAc();
    acTa = ta; acStart = start; acData = list; acSel = 0;
    ac.textContent = '';
    list.forEach(function (e, i) {
      var row = document.createElement('div'); row.className = 'rep-ac-row' + (i === 0 ? ' rep-ac-active' : '');
      var sp = document.createElement('span'); sp.className = 'rep-ac-c'; sp.textContent = e.c;
      var nm = document.createElement('span'); nm.className = 'rep-ac-n'; nm.textContent = ':' + (e.sc[0] || e.n.replace(/\s+/g, '_')) + ':';
      row.appendChild(sp); row.appendChild(nm);
      row.addEventListener('mousedown', function (ev) { ev.preventDefault(); acceptAc(i); });
      ac.appendChild(row);
    });
    var r = ta.getBoundingClientRect();
    var sx = window.pageXOffset || 0, sy = window.pageYOffset || 0;
    ac.style.left = (Math.max(8, r.left) + sx) + 'px';
    ac.style.top = (Math.min(r.bottom + 2, window.innerHeight - 8) + sy) + 'px';
    ac.style.display = 'block';
  }
  function moveAc(d) {
    if (!ac || ac.style.display === 'none') return;
    var rows = ac.children; if (!rows.length) return;
    rows[acSel].classList.remove('rep-ac-active');
    acSel = (acSel + d + rows.length) % rows.length;
    rows[acSel].classList.add('rep-ac-active');
    rows[acSel].scrollIntoView({ block: 'nearest' });
  }
  function acceptAc(i) {
    if (!acTa || !acData[i]) { closeAc(); return; }
    // Hodnoty odchytiť PRED vložením — insertInto vyvolá 'input' → closeAc()
    // vynuluje acData/acTa (re-entrancy), inak by nasledné čítanie padlo.
    var ta = acTa, em = acData[i].c, start = acStart, end = acTa.selectionStart;
    closeAc();
    insertInto(ta, em, start, end);
    pushRecent(em);
  }
  function updateAc(ta) {
    var pos = ta.selectionStart;
    if (pos !== ta.selectionEnd) { closeAc(); return; }
    var before = ta.value.slice(0, pos);
    var m = before.match(/(^|\s):([a-zA-Z0-9_+\-]{2,})$/);
    if (!m) { closeAc(); return; }
    var list = searchEmoji(m[2]).slice(0, 8);
    if (!list.length) { closeAc(); return; }
    showAc(ta, pos - m[2].length - 1, list);
  }

  // ---------- emoticon replace (:D → 😄) ----------
  function handleEmoticon(ta) {
    var pos = ta.selectionStart;
    if (pos !== ta.selectionEnd) return;
    var before = ta.value.slice(0, pos);
    var m = before.match(/(^|\s)(\S{1,4})(\s)$/);
    if (!m) return;
    var emoji = EMOTICONS[m[2]];
    if (!emoji) return;
    var tokenStart = pos - m[3].length - m[2].length;
    var tokenEnd = pos - m[3].length;
    ta.setRangeText(emoji, tokenStart, tokenEnd, 'end');
    ta.selectionStart = ta.selectionEnd = tokenStart + emoji.length + m[3].length;
    fireInput(ta);
  }

  // ---------- textarea decoration ----------
  function decorate(ta) {
    if (ta.dataset.repDone) return;
    ta.dataset.repDone = '1';

    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'rep-btn'; btn.textContent = '😊'; btn.title = 'Emoji';
    btn.addEventListener('click', function (ev) { ev.preventDefault(); openPicker(ta, btn); });

    var block = ta.closest('.jstBlock');
    var toolbar = block && block.querySelector('.jstElements');
    if (toolbar) { btn.classList.add('rep-btn-toolbar'); toolbar.appendChild(btn); }
    else { btn.classList.add('rep-btn-float'); ta.parentNode.insertBefore(btn, ta); }

    ta.addEventListener('focus', function () { active = ta; });
    ta.addEventListener('input', function () { active = ta; handleEmoticon(ta); updateAc(ta); });
    ta.addEventListener('blur', function () { setTimeout(closeAc, 150); });
    ta.addEventListener('keydown', function (e) {
      if (!ac || ac.style.display === 'none') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); moveAc(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveAc(-1); }
      else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); acceptAc(acSel); }
      else if (e.key === 'Escape') { e.preventDefault(); closeAc(); }
    }, true);
  }

  function scan() {
    var list = document.querySelectorAll('textarea.wiki-edit');
    for (var i = 0; i < list.length; i++) decorate(list[i]);
  }

  function init() {
    scan();
    var pending = null;
    var mo = new MutationObserver(function () { clearTimeout(pending); pending = setTimeout(scan, 120); });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
