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
      // Pretend every answer is closed, so opening a question never moves the photo
      var extra = 0;
      list.querySelectorAll('.dp-faq-item[open]').forEach(function (it) { extra += it.offsetHeight - it.querySelector('summary').offsetHeight; });
      listR = { bottom: listR.bottom - extra };
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

  /* ---------- 3. FLOWER RAIN ----------
     A light, endless shower of flowers drifting down behind the page content.
     It's drawn on one fixed canvas, so scrolling never changes its speed, and each
     flower remembers its spot as a share of the window width, so resizing never
     makes them jump. Flowers are hidden inside the FAQ bubble and over the footer. */
  (function () {
    var canvas = document.querySelector('.dp-rain');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var COLORS = [['#e85c6a', '#ffd84a'], ['#d4466a', '#ffd84a'], ['#ec6f58', '#ffe08a'], ['#c95078', '#ffd84a']];
    var bubble = document.querySelector('.dp-faq-grid > div'), footer = document.querySelector('.site-footer');
    var W = 0, H = 0, dpr = 1, flowers = [], sprites = {}, last = null, running = false;
    var nav = document.querySelector('.navbar');
    function navLine() { return nav ? Math.max(nav.getBoundingClientRect().bottom, 0) : 0; }   // the bottom of the tan nav bar

    function seededRandom(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
    var rnd = seededRandom(7);

    // Pre-draw each flower once (per color and size) so the animation stays cheap
    function sprite(ci, r) {
      var key = ci + ':' + r; if (sprites[key]) return sprites[key];
      var s = document.createElement('canvas'), size = Math.ceil(r * 2.4), c = s.getContext('2d');
      s.width = s.height = Math.ceil(size * dpr);
      c.scale(dpr, dpr); c.translate(size / 2, size / 2);
      var col = COLORS[ci];
      c.globalAlpha = .9; c.fillStyle = col[0];
      for (var i = 0; i < 5; i++) {
        var a = i * 72 * Math.PI / 180;
        c.save(); c.rotate(a); c.translate(r * .46, 0);
        c.beginPath(); c.ellipse(0, 0, r * .42, r * .3, 0, 0, Math.PI * 2); c.fill(); c.restore();
      }
      c.globalAlpha = 1; c.fillStyle = col[1];
      c.beginPath(); c.arc(0, 0, r * .2, 0, Math.PI * 2); c.fill();
      return (sprites[key] = { img: s, size: size });
    }

    function scale() { return W <= 820 ? 1 : Math.min(Math.max(W / 1440, 1), 1.5); }
    function wanted() { return W <= 820 ? 9 : Math.round(Math.min(Math.max(W * H / 52000, 18), 40)); }

    function makeFlower(startAbove) {
      var depth = .55 + rnd() * .45;                         // smaller ones fall slower and look further away
      var r = Math.round((7 + rnd() * 5) * depth * 1.25 * scale());
      return {
        fx: rnd(),                                           // horizontal spot as a share of the width
        y: startAbove ? navLine() - 30 : navLine() + rnd() * (H - navLine()),
        r: r, ci: Math.floor(rnd() * 4), depth: depth,
        speed: (26 + rnd() * 22) * depth * (W <= 820 ? 1.9 : 1),   // px per second, steady (a bit quicker on phones' shorter screens)
        sway: 10 + rnd() * 22, swaySpeed: .35 + rnd() * .5, phase: rnd() * Math.PI * 2,
        rot: rnd() * Math.PI * 2, spin: (rnd() - .5) * .9, alpha: .55 + depth * .4
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var newW = window.innerWidth, newH = window.innerHeight, oldH = H || newH;
      var widthChanged = newW !== W;
      W = newW; H = newH;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!widthChanged && flowers.length) return;         // phone address bar showing/hiding: just resize the canvas, leave the flowers alone
      sprites = {};
      flowers.forEach(function (f) { f.y = f.y / oldH * H; });  // keep vertical spot too
      var n = wanted();
      while (flowers.length < n) flowers.push(makeFlower(flowers.length > 0 && last !== null));
      if (flowers.length > n) flowers.length = n;
    }

    function holeRects() {                                   // areas where flowers shouldn't show
      var holes = [];
      if (bubble) { var b = bubble.getBoundingClientRect(); if (b.bottom > 0 && b.top < H) holes.push(b); }
      return holes;
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var limit = H;
      if (footer) { var fr = footer.getBoundingClientRect(); limit = Math.min(H, fr.top); }
      ctx.save();
      var line = navLine();
      ctx.beginPath(); ctx.rect(0, line, W, Math.max(limit - line, 0));   // flowers only show below the nav line
      holeRects().forEach(function (b) {
        var rad = Math.min(parseFloat(getComputedStyle(bubble).borderTopLeftRadius) || 0, b.height / 2, b.width / 2);
        ctx.moveTo(b.left + rad, b.top); ctx.lineTo(b.right, b.top); ctx.lineTo(b.right, b.bottom); ctx.lineTo(b.left, b.bottom);
        ctx.lineTo(b.left, b.top + rad); ctx.arcTo(b.left, b.top, b.left + rad, b.top, rad); ctx.closePath();
      });
      ctx.clip('evenodd');
      flowers.forEach(function (f) {
        var sp = sprite(f.ci, f.r), x = f.fx * W + Math.sin(t * f.swaySpeed + f.phase) * f.sway;
        ctx.globalAlpha = f.alpha;
        ctx.save(); ctx.translate(x, f.y); ctx.rotate(f.rot);
        ctx.drawImage(sp.img, -sp.size / 2, -sp.size / 2, sp.size, sp.size);
        ctx.restore();
      });
      ctx.restore();
    }

    function tick(ts) {
      var dt = last === null ? 0 : Math.min((ts - last) / 1000, .05); last = ts;
      var t = ts / 1000;
      flowers.forEach(function (f) {
        f.rot += f.spin * dt;
        if (f.intro) {                                       // opening shower: drop quickly to a spot, then keep drifting
          var it = f.intro; it.age += dt;
          var a = it.age - it.delay;
          if (a <= 0) { f.y = it.y0; return; }
          var p = a / it.dur;
          if (p < 1) { f.y = it.y0 + it.dist * (1 - (1 - p) * (1 - p)) + f.speed * a; return; }   // ends at cruising speed, no hitch
          f.y = it.y0 + it.dist + f.speed * a; f.intro = null; return;
        }
        f.y += f.speed * dt;
        if (f.y - f.r * 2 > H) {                             // drifted off the bottom: start again at the top
          var nf = makeFlower(true); nf.y = navLine() - nf.r * 1.3 - rnd() * 40;
          for (var k in nf) f[k] = nf[k];
        }
      });
      draw(t);
      if (!document.hidden) requestAnimationFrame(tick); else { last = null; running = false; }
    }
    function start() { if (running) return; running = true; last = null; requestAnimationFrame(tick); }

    resize();
    // On load, every flower starts just under the nav line and showers down, filling the
    // screen within a couple of seconds, then settles into the slow steady rain.
    flowers = [];
    for (var i = 0, n = wanted(); i < n; i++) {
      var f0 = makeFlower(true), line0 = navLine(), y0 = line0 - f0.r * 1.3;   // fully tucked under the nav until its turn
      var target = line0 + 20 + rnd() * (H - line0 - 20);
      f0.y = y0;
      if (W > 820 && i % 2 === 0) {                        // laptops: half do the opening shower...
        f0.intro = { age: 0, delay: (i / n) * 0.9 + rnd() * 0.25, dur: 1.1 + rnd() * 1.1, y0: y0, dist: target - y0 };
      } else {                                             // ...the rest trickle out from under the nav one by one, so the top never empties
        // phones: every flower just falls from the nav line at the normal pace, the first ones right away
        var phone = W <= 820, k = phone ? i : (i - 1) / 2, streamN = phone ? n : Math.floor(n / 2);
        f0.intro = { age: 0, delay: (phone ? 0 : 0.5) + (k + (phone && k === 0 ? 0 : rnd() * .6)) / streamN * (H - line0) / (phone ? 60 : 32), dur: 0.001, y0: y0, dist: 0 };
      }
      flowers.push(f0);
    }

    if (reduceMotion) {                                      // still scatter, no motion
      flowers.forEach(function (f) { f.intro = null; f.y = navLine() + rnd() * (H - navLine()); });
      var still = function () { draw(0); };
      still(); window.addEventListener('scroll', still, { passive: true });
      window.addEventListener('resize', function () { resize(); still(); });
      return;
    }
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    start();
  })();
})();
