/* ============================================================
   FAQ ACCORDION — details.html only
   - Smooth open/close animation
   - Only one answer open at a time
   Kept separate from script.js so the nav code is never touched.
   ============================================================ */
(function () {
  var list = document.querySelector('.faq-list');
  if (!list) return;

  var items = Array.prototype.slice.call(list.querySelectorAll('.faq-item'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURATION = 350; // ms

  // Tell the CSS that JS is handling the open/closed look
  list.classList.add('faq-js');
  items.forEach(function (el) {
    if (el.open) el.classList.add('is-open');
  });

  function setOpen(el, open) {
    var startHeight = el.offsetHeight; // measure first (works mid-animation too)

    if (el._anim) { el._anim.cancel(); el._anim = null; }

    el.classList.toggle('is-open', open);
    if (open) el.open = true;

    if (reduceMotion || !el.animate) {
      if (!open) el.open = false;
      return;
    }

    var border = el.offsetHeight - el.clientHeight;
    var endHeight = open
      ? el.offsetHeight
      : el.querySelector('summary').offsetHeight + border;

    el.style.overflow = 'hidden';
    el._anim = el.animate(
      { height: [startHeight + 'px', endHeight + 'px'] },
      { duration: DURATION, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
    );

    el._anim.onfinish = function () {
      el._anim = null;
      el.style.overflow = '';
      if (!open) {
        el.open = false;
      } else {
        // If closing the one above pushed this question off the top of the screen, bring it back into view
        var top = el.getBoundingClientRect().top;
        if (top < 80) window.scrollBy({ top: top - 90, behavior: 'smooth' });
      }
    };
    el._anim.oncancel = function () { el.style.overflow = ''; };
  }

  items.forEach(function (el) {
    el.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !el.classList.contains('is-open');

      if (willOpen) {
        items.forEach(function (other) {
          if (other !== el && other.classList.contains('is-open')) setOpen(other, false);
        });
      }
      setOpen(el, willOpen);
    });
  });
})();
