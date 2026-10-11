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
      // [x, y, size, colorIndex]
      var spots = [
        [title.l + 40, top + 46, 9, 1], [title.l + 170, top + 28, 8, 2], [title.r - 70, top + 72, 10, 3], [gap - 40, top + 70, 13, 0],
        [gap + 30, title.t + 30, 8, 2], [gap - 10, title.b + 10, 10, 3], [links.r + 70, links.b + 34, 8, 1], [title.l + 150, links.b + 86, 11, 2],
        [gap + 20, links.b + 110, 8, 0],
        [W * .4 - 46, faq.t - 34, 10, 1], [fp.l + 18, fp.t + 34, 12, 0], [fp.r - 10, fp.t + fh * .42, 10, 1], [fp.l - 28, fp.t + fh * .5, 8, 2],
        [fp.r + 34, faq.t + fh * .3, 8, 3], [fp.l + 40, fp.b - 6, 9, 1],
        [travH.l - 150, travH.t + 20, 10, 2], [travH.r + 130, soon.b + 4, 12, 0], [travH.l - 60, soon.b + 40, 8, 1],
        [(rt.r + rp.l) / 2, rp.t + 40, 9, 3], [btn.r + 60, btn.t + 10, 8, 1], [btn.l + 50, btn.b + 46, 9, 0], [btn.r - 40, btn.b + 84, 8, 2],
        [btn.l + 150, btn.b + 120, 8, 3], [rp.r - 30, rp.t - 22, 11, 0], [rp.l + 90, rp.b + 30, 8, 2]
      ];
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
