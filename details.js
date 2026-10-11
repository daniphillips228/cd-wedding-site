/* ============================================================
   DETAILS PAGE — details.html only
   1. FAQ accordion: smooth open/close, one answer at a time
   2. FAQ photo: glides down to line up with the last question
   3. Flowers: cascade down from under the nav on page load
   Kept separate from script.js so the nav code is never touched.
   ============================================================ */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. FAQ ACCORDION ---------- */
  var list = document.querySelector('.dp-faq-list');
  if (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll('.dp-faq-item'));
    list.classList.add('dp-js');
    items.forEach(function (el) { if (el.open) el.classList.add('is-open'); });

    var setOpen = function (el, open) {
      var start = el.offsetHeight;
      if (el._anim) { el._anim.cancel(); el._anim = null; }
      el.classList.toggle('is-open', open);
      if (open) el.open = true;
      if (reduceMotion || !el.animate) { if (!open) el.open = false; return; }
      var end = open ? el.offsetHeight : el.querySelector('summary').offsetHeight;
      el.style.overflow = 'hidden';
      el._anim = el.animate({ height: [start + 'px', end + 'px'] }, { duration: 350, easing: 'cubic-bezier(.4,0,.2,1)' });
      el._anim.onfinish = function () { el._anim = null; el.style.overflow = ''; if (!open) el.open = false; };
      el._anim.oncancel = function () { el.style.overflow = ''; };
    };

    items.forEach(function (el) {
      el.querySelector('summary').addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !el.classList.contains('is-open');
        if (willOpen) items.forEach(function (o) { if (o !== el && o.classList.contains('is-open')) setOpen(o, false); });
        setOpen(el, willOpen);
      });
    });
  }

  /* ---------- 2. FAQ PHOTO GLIDE (desktop only) ---------- */
  (function () {
    var fig = document.querySelector('.dp-faq-photo'), sec = document.querySelector('.dp-faq');
    if (!fig || !list || reduceMotion) return;
    var cur = 0, vel = 0, last = null, SMOOTH = 0.55;   // seconds to catch up; higher = floatier

    function target() {
      if (window.innerWidth <= 820) return 0;
      var vh = window.innerHeight, y = window.scrollY;
      var figR = fig.getBoundingClientRect(), listR = list.getBoundingClientRect();
      var maxShift = Math.max(listR.bottom - (figR.bottom - cur), 0);
      var start = sec.getBoundingClientRect().top + y - vh * 0.55;
      var end = listR.bottom + y - vh * 0.98;
      var p = end > start ? (y - start) / (end - start) : (y >= start ? 1 : 0);
      p = Math.min(Math.max(p, 0), 1);
      p = p * p * (3 - 2 * p);
      return p * maxShift;
    }
    function tick(ts) {
      var dt = last === null ? 0.016 : Math.min((ts - last) / 1000, 0.05); last = ts;
      var omega = 2 / SMOOTH, x = omega * dt, exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      var t = target(), change = cur - t, temp = (vel + omega * change) * dt;
      vel = (vel - omega * temp) * exp;
      cur = t + (change + temp) * exp;
      fig.style.transform = 'translate3d(0,' + cur.toFixed(2) + 'px,0)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- 3. FALLING FLOWERS (desktop only) ---------- */
  (function () {
    var layer = document.querySelector('.dp-petals');
    if (!layer) return;
    var NS = 'http://www.w3.org/2000/svg';
    var COLORS = [['#e85c6a', '#ffd84a'], ['#d4466a', '#ffd84a'], ['#ec6f58', '#ffe08a'], ['#c95078', '#ffd84a']];
    var flowers = [];

    function box(sel, textOnly) {
      var n = document.querySelector(sel); if (!n) return null;
      var r;
      if (textOnly) { var g = document.createRange(); g.selectNodeContents(n); r = g.getBoundingClientRect(); }
      else r = n.getBoundingClientRect();
      return { l: r.left + scrollX, r: r.right + scrollX, t: r.top + scrollY, b: r.bottom + scrollY };
    }
    function flower(size, c) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', size * 2); svg.setAttribute('height', size * 2);
      svg.setAttribute('viewBox', (-size) + ' ' + (-size) + ' ' + size * 2 + ' ' + size * 2);
      for (var i = 0; i < 5; i++) {
        var a = i * 72 * Math.PI / 180, x = Math.cos(a) * size * .46, y = Math.sin(a) * size * .46;
        var e = document.createElementNS(NS, 'ellipse');
        e.setAttribute('cx', x); e.setAttribute('cy', y); e.setAttribute('rx', size * .42); e.setAttribute('ry', size * .3);
        e.setAttribute('fill', c[0]); e.setAttribute('opacity', '.88');
        e.setAttribute('transform', 'rotate(' + (i * 72) + ' ' + x + ' ' + y + ')');
        svg.appendChild(e);
      }
      var d = document.createElementNS(NS, 'circle'); d.setAttribute('r', size * .2); d.setAttribute('fill', c[1]); svg.appendChild(d);
      return svg;
    }
    function navBottom() { var n = document.querySelector('.navbar'); return n ? n.getBoundingClientRect().bottom + scrollY : 64; }

    function place() {
      layer.innerHTML = ''; flowers = [];
      if (window.innerWidth <= 820) return;
      var top = navBottom();
      var title = box('.dp-hero-text h1', true), links = box('.dp-jump a:last-child'), arch = box('.dp-hero-photo');
      var fp = box('.dp-faq-photo img'), faq = box('.dp-faq'), travH = box('.dp-travel h2', true), soon = box('.dp-soon', true);
      var W = document.documentElement.clientWidth, rt = box('.dp-registry-text'), rp = box('.dp-registry-photo'), btn = box('.dp-btn');
      var gap = (title.r + arch.l) / 2, fh = faq.b - faq.t;
      // Spread flowers across the whole width: the open side margins get most of them,
      // the middle gets a few. Positions are relative to the content edges so they adapt to any screen.
      var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
      var spots = [];
      function band(xMin, xMax, yMin, yMax, count) {          // scatter `count` flowers in a zone, kept apart
        if (xMax - xMin < 36 || yMax - yMin < 30) return;
        var placed = [];
        for (var n = 0, tries = 0; n < count && tries < 60; tries++) {
          var x = xMin + rnd() * (xMax - xMin), y = yMin + rnd() * (yMax - yMin), ok = true;
          for (var k = 0; k < placed.length; k++) { var dx = placed[k][0] - x, dy = placed[k][1] - y; if (dx * dx + dy * dy < 120 * 120) { ok = false; break; } }
          if (!ok) continue;
          placed.push([x, y]); spots.push([x, y, 8 + Math.round(rnd() * 5), Math.floor(rnd() * 4)]); n++;
        }
      }
      var heroB = box('.dp-hero').b, faqList = box('.dp-faq-list'), regB = box('.dp-registry').b;
      var archR = arch.r + 16, edge = 28;
      // top section: outer margins + a light touch in the middle gap
      band(edge, title.l - 40, top + 30, heroB - 40, 3);
      band(archR + 40, W - edge, top + 30, heroB - 40, 3);
      band(title.l, title.r, top + 24, title.t - 10, 1);
      band(links.r + 40, arch.l - 40, title.t, heroB - 60, 2);
      // FAQs: left of the photo, between photo and bubble, right of the questions
      band(edge, fp.l - 30, faq.t + 20, faq.b - 40, 2);
      band(fp.r + 24, W * .4 - 30, faq.t - 30, faq.b - 60, 2);
      band(faqList.r + 40, W - edge, faq.t + 60, faq.b - 40, 2);
      // Travel: both sides of the heading
      band(edge, travH.l - 60, travH.t - 30, soon.b + 70, 3);
      band(travH.r + 60, W - edge, travH.t - 30, soon.b + 70, 3);
      // Registry: outer margins + under the button
      band(edge, rt.l - 30, rp.t, regB - 40, 2);
      band(rp.r + 30, W - edge, rp.t - 20, regB - 40, 2);
      band(rt.l, rp.l - 30, btn.b + 30, regB - 40, 2);
      spots.forEach(function (sp, i) {
        var size = Math.round(sp[2] * 1.3), f = flower(size, COLORS[sp[3]]);
        f.style.left = (sp[0] - size) + 'px'; f.style.top = (sp[1] - size) + 'px';
        layer.appendChild(f);
        flowers.push({ el: f, y: sp[1], i: i });
      });
    }
    function drop(fl, top) {
      var rot = (fl.i * 47) % 360, end = rot + ((fl.i % 2) ? 110 : -130);
      if (reduceMotion || !fl.el.animate) { fl.el.style.opacity = 1; fl.el.style.transform = 'rotate(' + end + 'deg)'; return; }
      var fall = Math.min(fl.y - top + 20, 230), sway = 10 + (fl.i * 7) % 12;
      var delay = (fl.y - top) * 1.5 + (fl.i * 137) % 260;   // the wave moves down the page
      var dur = 1900 + (fl.i * 211) % 700;
      fl.el.animate([
        { opacity: 0, transform: 'translate(0,' + (-fall) + 'px) rotate(' + rot + 'deg)' },
        { opacity: 1, offset: .2, transform: 'translate(' + sway + 'px,' + (-fall * .75) + 'px) rotate(' + (rot + (end - rot) * .25) + 'deg)' },
        { offset: .55, transform: 'translate(' + (-sway) + 'px,' + (-fall * .35) + 'px) rotate(' + (rot + (end - rot) * .6) + 'deg)' },
        { offset: .85, transform: 'translate(' + (sway * .35) + 'px,' + (-fall * .08) + 'px) rotate(' + (end - 6) + 'deg)' },
        { opacity: 1, transform: 'translate(0,0) rotate(' + end + 'deg)' }
      ], { duration: dur, delay: delay, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' });
    }
    function showAll() { flowers.forEach(function (fl) { fl.el.style.opacity = 1; fl.el.style.transform = 'rotate(' + ((fl.i * 47) % 360) + 'deg)'; }); }

    window.addEventListener('load', function () {
      place();
      var top = navBottom();
      setTimeout(function () { flowers.forEach(function (fl) { drop(fl, top); }); }, 300);
    });
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { place(); showAll(); }, 200); });
  })();
})();
