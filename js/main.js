(function () {
  var root = document.body;
  if (!root) return;
  // after "show less", bring the section back into view if the reader was scrolled past its top
  function back(el) {
    var sec = el.closest('section');
    if (sec && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ block: 'start' });
  }
  // reviews: "see more" reveals a few at a time, "show less" goes back to the first ones
  root.querySelectorAll('[data-more]').forEach(function (b) {
    var wall = document.getElementById(b.dataset.more);
    var less = root.querySelector('[data-less="' + b.dataset.more + '"]');
    var items = Array.prototype.slice.call(wall.children);
    var keep = items.filter(function (el) { return !el.hidden; }).length;
    b.addEventListener('click', function () {
      var next = wall.querySelectorAll(':scope > [hidden]');
      for (var i = 0; i < Math.min(+b.dataset.step, next.length); i++) next[i].hidden = false;
      b.hidden = !wall.querySelector(':scope > [hidden]');
      less.hidden = false;
    });
    less.addEventListener('click', function () {
      items.forEach(function (el, i) { el.hidden = i >= keep; });
      b.hidden = false; less.hidden = true;
      back(wall);
      b.focus({ preventScroll: true });
    });
  });
  // photos: on phones only the first ones show until "show all"
  root.querySelectorAll('[data-grow]').forEach(function (b) {
    var list = document.getElementById(b.dataset.grow);
    var less = root.querySelector('[data-shrink="' + b.dataset.grow + '"]');
    b.addEventListener('click', function () { list.classList.add('all'); b.hidden = true; less.hidden = false; });
    less.addEventListener('click', function () {
      list.classList.remove('all'); b.hidden = false; less.hidden = true;
      back(list);
      b.focus({ preventScroll: true });
    });
  });
  var dlg = document.getElementById('dlg');
  if (!dlg || !dlg.showModal) return;
  var cards = root.querySelectorAll('#ba .ba-card');
  var cap = document.getElementById('dlg-cap'), num = document.getElementById('dlg-n');
  var imgB = document.getElementById('dlg-b'), imgA = document.getElementById('dlg-a');
  var cur = 0;
  function show(i) {
    cur = (i + cards.length) % cards.length;
    var c = cards[cur], im = c.querySelectorAll('.ph-img');
    imgB.src = im[0].src; imgB.alt = im[0].alt;
    imgA.src = im[1].src; imgA.alt = im[1].alt;
    cap.innerHTML = c.querySelector('figcaption').innerHTML;
    num.textContent = (cur + 1) + ' / ' + cards.length;
  }
  root.querySelectorAll('.ba-zoom').forEach(function (b) {
    b.addEventListener('click', function () { show(+b.dataset.i); dlg.showModal(); });
  });
  document.getElementById('dlg-x').addEventListener('click', function () { dlg.close(); });
  document.getElementById('dlg-prev').addEventListener('click', function () { show(cur - 1); });
  document.getElementById('dlg-next').addEventListener('click', function () { show(cur + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.stopPropagation(); show(cur - 1); }
    if (e.key === 'ArrowRight') { e.stopPropagation(); show(cur + 1); }
  });
  var x0 = null;
  dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
})();

(function () {
  var more = document.getElementById('more');
  if (!more) return;
  more.addEventListener('click', function () {
    var page = more.closest('.page');
    var open = page.classList.toggle('open');
    more.setAttribute('aria-expanded', String(open));
    if (!open) back(page);
  });
  function back(el) {
    var sec = el.closest('section');
    if (sec && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ block: 'start' });
  }
})();

(function () {
  var form = document.getElementById('form');
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var lines = $('lines'), empty = $('empty'), hello = $('hello');
  var statusEl = $('status'), dateEl = $('date');
  var note = $('note'), nameIn = $('name'), phoneIn = $('phone'), startIn = $('start');
  var sent = $('sent'), submitBtn = $('submit');
  var copyBtn = $('copy'), viberNext = $('viber-next'), fallback = $('fallback');
  var sending = false;
  var copying = false, revision = 0;

  var T = {
    bg: {
      hello: { once: 'Здравейте! Моля за оглед и оферта.', sub: 'Здравейте! Искам редовна грижа за имота. Моля, обадете се да уговорим оглед и оферта.' },
      rows: { mode: 'Вид', prop: 'Имоти', svc: 'Услуги', place: 'Места', freq: 'Честота', day: 'Дни', start: 'Начало', note: 'Бележка', name: 'Име', phone: 'Телефон' },
      modes: { once: 'Еднократно посещение', sub: 'Абонамент (редовна грижа)' },
      blank: 'не е отбелязано',
      needs: 'Първо попълнете поръчката или изберете услуга.',
      copied: 'Поръчката е копирана. Отворете Viber, поставете текста в чата и натиснете „Изпрати“.',
      copyError: 'Копирайте избрания текст (Ctrl+C или със задържане върху него), после го поставете и изпратете във Viber.',
      sending: 'Изпращане…',
      sendError: 'Запитването не беше изпратено. Опитайте отново или се обадете на 0885 661 311. Попълненото е запазено.',
      nameError: 'Моля, въведете името си.',
      phoneError: 'Моля, въведете валиден телефон за връзка.',
      locale: 'bg-BG'
    },
    en: {
      hello: { once: 'Hello! I would like a visit and a quote.', sub: 'Hello! I would like regular care for my property. Please call me to arrange a visit and a quote.' },
      rows: { mode: 'Type', prop: 'Properties', svc: 'Services', place: 'Places', freq: 'How often', day: 'Days', start: 'Start', note: 'Note', name: 'Name', phone: 'Phone' },
      modes: { once: 'One-off visit', sub: 'Subscription (regular care)' },
      blank: 'not ticked',
      needs: 'Fill in the order or choose a service first.',
      copied: 'Order copied. Open Viber, paste the text into the chat and press Send.',
      copyError: 'Copy the selected text (Ctrl+C or press and hold), then paste and send it in Viber.',
      sending: 'Sending…',
      sendError: 'Your inquiry was not sent. Try again or call +359 885 661 311. Your entries have been kept.',
      nameError: 'Please enter your name.',
      phoneError: 'Please enter a valid contact phone number.',
      locale: 'en-GB'
    }
  };
  var MULTI = ['prop', 'svc', 'place'];
  var last = {};

  function lang() { return document.documentElement.dataset.lang === 'en' ? 'en' : 'bg'; }
  function mode() { var r = form.querySelector('input[name="mode"]:checked'); return r ? r.value : 'sub'; }
  function picked(name) { return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')); }
  function labels(name) { var l = lang(); return picked(name).map(function (i) { return i.getAttribute('data-' + l); }); }

  function startDate() {
    var p = startIn.value.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function fmtDate(d) { return d.toLocaleDateString(T[lang()].locale, { day: 'numeric', month: 'long', year: 'numeric' }); }

  /* values that go onto the work order, in order */
  function values() {
    var l = lang(), m = mode(), out = [];
    out.push({ k: 'mode', v: [T[l].modes[m]], always: true });
    MULTI.forEach(function (n) { out.push({ k: n, v: labels(n), always: n !== 'prop' }); });
    if (m === 'sub') {
      out.push({ k: 'freq', v: labels('freq'), always: true });
      out.push({ k: 'day', v: labels('day') });
      if (startIn.value) out.push({ k: 'start', v: [fmtDate(startDate())] });
    }
    var nt = note.value.trim().replace(/\s+/g, ' ');
    if (nt) out.push({ k: 'note', v: [nt] });
    if (nameIn.value.trim()) out.push({ k: 'name', v: [nameIn.value.trim()] });
    if (phoneIn.value.trim()) out.push({ k: 'phone', v: [phoneIn.value.trim()] });
    return out;
  }
  function filledCount() {
    var n = form.querySelectorAll('input[type="checkbox"]:checked').length;
    if (mode() === 'sub') { n += form.querySelectorAll('input[name="freq"]:checked').length; if (startIn.value) n++; }
    [note, nameIn, phoneIn].forEach(function (i) { if (i.value.trim()) n++; });
    return n;
  }

  function compose() {
    var t = T[lang()];
    if (!filledCount()) return '';
    var out = [t.hello[mode()]];
    values().forEach(function (r) { if (r.v.length) out.push(t.rows[r.k] + ': ' + r.v.join(', ')); });
    return out.join('\n');
  }

  function renderTicket() {
    var t = T[lang()], any = filledCount() > 0, vals = values(), now = {};
    empty.hidden = any; hello.hidden = !any;
    hello.textContent = t.hello[mode()];
    lines.textContent = '';
    vals.forEach(function (r) {
      if (!r.always && !r.v.length) return;
      var row = document.createElement('div'); row.className = 't-row';
      var dt = document.createElement('dt'); dt.textContent = t.rows[r.k];
      var dd = document.createElement('dd');
      if (!r.v.length) { dd.textContent = t.blank; dd.className = 'blank'; }
      else if (r.v.length === 1) dd.textContent = r.v[0];
      else {
        var ul = document.createElement('ul'); ul.className = 't-list';
        r.v.forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ul.appendChild(li); });
        dd.appendChild(ul);
      }
      var key = r.v.join('|'); now[r.k] = key;
      if (r.v.length && last[r.k] !== undefined && last[r.k] !== key) dd.classList.add('fresh');
      row.appendChild(dt); row.appendChild(dd); lines.appendChild(row);
    });
    last = now;
    dateEl.textContent = new Date().toLocaleDateString(t.locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /* ---------- mode switch ---------- */
  function applyMode() {
    var m = mode();
    form.querySelectorAll('[data-only]').forEach(function (f) { f.hidden = f.getAttribute('data-only') !== m; });
  }
  function setMode(m) {
    var r = form.querySelector('input[name="mode"][value="' + m + '"]');
    if (r && !r.checked) { r.checked = true; applyMode(); refresh(); }
  }

  function refresh() {
    revision++;
    viberNext.hidden = true; fallback.hidden = true; fallback.value = '';
    renderTicket();
  }
  function say(msg) { statusEl.textContent = msg; }

  copyBtn.addEventListener('click', async function () {
    if (sending || copying) return;
    var text = compose(), version = revision;
    sent.hidden = true; say(''); viberNext.hidden = true; fallback.hidden = true;
    if (!text) { say(T[lang()].needs); return; }
    copying = true; copyBtn.disabled = true;
    try {
      // Keep opening Viber as a separate tap so browsers retain the user gesture.
      await navigator.clipboard.writeText(text);
      if (version !== revision) return;
      viberNext.hidden = false;
      say(T[lang()].copied);
    } catch (err) {
      if (version !== revision) return;
      viberNext.hidden = false; fallback.hidden = false; fallback.value = text;
      fallback.focus(); fallback.select(); fallback.setSelectionRange(0, text.length);
      say(T[lang()].copyError);
    } finally {
      copying = false; copyBtn.disabled = sending;
    }
  });

  $('clear').addEventListener('click', function () {
    if (sending) return;
    form.reset(); last = {}; sent.hidden = true;
    [nameIn, phoneIn].forEach(function (i) { i.removeAttribute('aria-invalid'); });
    say(''); applyMode(); refresh();
  });

  form.addEventListener('change', function (e) {
    var el = e.target;
    if (el.name === 'day' && el.checked) {
      if (el.value === 'any') picked('day').forEach(function (i) { if (i !== el) i.checked = false; });
      else { var a = form.querySelector('input[name="day"][value="any"]'); if (a) a.checked = false; }
    }
    if (el.name === 'mode') applyMode();
    sent.hidden = true; say(''); refresh();
  });
  [note, nameIn, phoneIn].forEach(function (i) { i.addEventListener('input', function () {
    sent.hidden = true; say(''); i.removeAttribute('aria-invalid'); refresh();
  }); });
  startIn.addEventListener('input', function () { say(''); refresh(); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (sending) return;
    sent.hidden = true; say(''); refresh();
    [nameIn, phoneIn].forEach(function (i) { i.removeAttribute('aria-invalid'); });
    var invalid = !nameIn.value.trim() ? nameIn :
      (!/^[+\d\s().-]+$/.test(phoneIn.value) || phoneIn.value.replace(/\D/g, '').length < 7 || phoneIn.value.replace(/\D/g, '').length > 15 ? phoneIn : null);
    if (invalid) {
      invalid.setAttribute('aria-invalid', 'true');
      invalid.setAttribute('aria-describedby', 'status');
      say(T[lang()][invalid === nameIn ? 'nameError' : 'phoneError']);
      invalid.focus(); return;
    }
    var payload = { name: nameIn.value.trim(), phone: phoneIn.value.trim(), message: compose(), website: $('website').value };
    sending = true; submitBtn.disabled = true; copyBtn.disabled = true;
    form.setAttribute('aria-busy', 'true');
    say(T[lang()].sending);
    // Freeze the submitted selections until the mail service responds.
    var controls = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));
    controls.forEach(function (i) { i.disabled = true; });
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 60000);
    try {
      var response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      var result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('Inquiry rejected');
      say(''); sent.hidden = false;
      sent.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (err) {
      say(T[lang()].sendError);
    } finally {
      clearTimeout(timeout); sending = false; submitBtn.disabled = false; copyBtn.disabled = copying;
      form.removeAttribute('aria-busy');
      controls.forEach(function (i) { i.disabled = false; });
    }
  });

  document.querySelectorAll('[data-mode-go]').forEach(function (a) {
    a.addEventListener('click', function () { setMode(a.getAttribute('data-mode-go')); });
  });

  document.addEventListener('snb:lang', function () {
    last = {}; say(''); refresh();
  });

  // links from the service pages (/?svc=bath#order) tick that service and pick a one-off job
  try {
    var qs = new URLSearchParams(location.search), want = qs.get('svc');
    if (want) {
      want.split(',').forEach(function (v) {
        var box = form.querySelector('input[name="svc"][value="' + v.replace(/[^a-z]/g, '') + '"]');
        if (box) box.checked = true;
      });
      var m = qs.get('mode') === 'sub' ? 'sub' : 'once';
      var r = form.querySelector('input[name="mode"][value="' + m + '"]');
      if (r) r.checked = true;
    }
  } catch (e) {}

  applyMode();
  refresh();
})();

(function () {
  var root = document.documentElement;
  var ATTRS = ['placeholder', 'alt', 'aria-label', 'title'];
  function load() { try { return localStorage.getItem('snb-lang'); } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem('snb-lang', l); } catch (e) {} }
  function setLang(l) {
    root.dataset.lang = l; root.lang = l;
    ATTRS.forEach(function (a) {
      document.querySelectorAll('[data-' + l + '-' + a + ']').forEach(function (el) { el.setAttribute(a, el.getAttribute('data-' + l + '-' + a)); });
    });
    // the one button shows the current language and switches to the other
    var other = l === 'bg' ? 'en' : 'bg', btn = document.getElementById('lang');
    if (btn) {
      btn.dataset.langSet = other; btn.textContent = l.toUpperCase();
      var name = other === 'en' ? 'English' : 'Български';
      btn.setAttribute('aria-label', name); btn.title = name;
    }
    // each language version is its own page for search engines
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.href = (canon.dataset.base || 'https://snbhomecare.bg/') + (l === 'en' ? '?lang=en' : '');
    save(l);
    document.dispatchEvent(new CustomEvent('snb:lang', { detail: l }));
  }
  var langBtn = document.getElementById('lang');
  if (langBtn) langBtn.addEventListener('click', function () { setLang(langBtn.dataset.langSet); });
  var q = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  setLang(q === 'en' || q === 'bg' ? q : (load() === 'en' ? 'en' : 'bg'));
})();

(function () {
  var root = document.documentElement, btn = document.getElementById('theme');
  if (!btn) return;
  var ORDER = ['system', 'light', 'dark'];
  var LABEL = {
    bg: { system: 'Тема: автоматична (като устройството)', light: 'Тема: светла', dark: 'Тема: тъмна' },
    en: { system: 'Theme: automatic (follows your device)', light: 'Theme: light', dark: 'Theme: dark' }
  };
  function current() { return root.dataset.theme || 'system'; }
  function label() {
    var t = (LABEL[root.dataset.lang] || LABEL.bg)[current()];
    btn.setAttribute('aria-label', t); btn.title = t;
  }
  function set(m) {
    if (m === 'system') delete root.dataset.theme; else root.dataset.theme = m;
    btn.dataset.mode = m;
    try { if (m === 'system') localStorage.removeItem('snb-theme'); else localStorage.setItem('snb-theme', m); } catch (e) {}
    label();
  }
  btn.addEventListener('click', function () { set(ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length]); });
  document.addEventListener('snb:lang', label);
  btn.dataset.mode = current();
  label();
})();

// back to the top: shows up after a screen of scrolling, its ring fills with the page
(function () {
  var btn = document.querySelector('.to-top');
  if (!btn) return;
  var page = document.documentElement, queued = false;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update() {
    queued = false;
    var max = page.scrollHeight - window.innerHeight, y = window.scrollY;
    btn.classList.toggle('on', y > window.innerHeight * .8);
    btn.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
  }
  window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  btn.addEventListener('click', function () {
    btn.classList.add('fly');
    setTimeout(function () { window.scrollTo({ top: 0, behavior: still ? 'instant' : 'smooth' }); }, still ? 0 : 160);
    setTimeout(function () { btn.classList.remove('fly'); }, 900);
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  });
  update();
})();

// phones: the menu button opens the header links as a panel; a link, Escape or a tap outside closes it
(function () {
  var btn = document.getElementById('menu'), top = btn && btn.closest('.top');
  if (!top) return;
  function set(open) { top.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); }
  btn.addEventListener('click', function () { set(!top.classList.contains('open')); });
  document.getElementById('nav').addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && top.classList.contains('open')) { set(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (!top.contains(e.target)) set(false); });
  window.addEventListener('resize', function () { if (getComputedStyle(btn).display === 'none') set(false); });
})();

// the header stays on screen; once the page scrolls it gets a line under it
(function () {
  var top = document.querySelector('.top');
  if (!top) return;
  function update() { top.classList.toggle('stuck', window.scrollY > 4); }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// in-page links: the section's heading (its [data-land] element, else the section itself)
// lands the same small gap under the sticky header on every page
(function () {
  var top = document.querySelector('.top');
  if (!top) return;
  var GAP = 20, still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function target(hash) {
    if (!hash || hash.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; }
  }
  function go(el, smooth) {
    if (el.id === 'hero') { window.scrollTo({ top: 0, behavior: smooth && !still ? 'smooth' : 'instant' }); return; }
    var land = el.querySelector('[data-land]') || el;
    var y = land.getBoundingClientRect().top + window.scrollY - top.offsetHeight - GAP;
    window.scrollTo({ top: Math.max(0, y), behavior: smooth && !still ? 'smooth' : 'instant' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || url.search !== location.search) return;
    var el = target(url.hash);
    if (!el) return;
    e.preventDefault();
    if (history.pushState) history.pushState(null, '', url.hash);
    go(el, true);
  });
  // arriving from another page with a hash (for example /ceni/ → /#order)
  function arrive() { var el = target(location.hash); if (el) go(el, false); }
  // after the browser's own jump to the hash, and again while fonts and images settle,
  // until the visitor scrolls on their own
  if (location.hash && target(location.hash)) {
    var touched = false, again = function () { if (!touched) arrive(); };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (t) { window.addEventListener(t, function () { touched = true; }, { once: true, passive: true }); });
    window.addEventListener('load', function () {
      setTimeout(again, 60);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(again, 30); });
      setTimeout(again, 700);
    });
  }
  window.addEventListener('popstate', arrive);
})();

// seasonal strips: hide once their data-until date has passed
document.querySelectorAll('[data-until]').forEach(function (el) {
  if (Date.now() >= Date.parse(el.dataset.until)) el.hidden = true;
});
