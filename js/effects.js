/**
 * Bootup India — Visual Effects Layer
 * Animated gradient mesh · Custom cursor · Scroll reveal · Ripple · Progress bar
 * Vigorlaunchpad × Reliance Digital
 */

'use strict';

/* Background gradient handled by CSS (background-attachment: fixed on html) */
/* Canvas disabled — #bg-canvas { display: none } in style.css */

/* ══════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ══════════════════════════════════════════════════ */
(function () {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const d   = document.documentElement;
    const pct = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;
    bar.style.width = (isNaN(pct) ? 0 : pct) + '%';
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════
   CUSTOM CURSOR  (pointer / mouse devices only)
   ══════════════════════════════════════════════════ */
(function () {
  if (!window.matchMedia('(pointer:fine)').matches) return;

  const dot  = Object.assign(document.createElement('div'), { id: 'cursor-dot'  });
  const ring = Object.assign(document.createElement('div'), { id: 'cursor-ring' });
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0, rafPending = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
    if (!rafPending) { rafPending = true; requestAnimationFrame(lerpRing); }
  }, { passive: true });

  function lerpRing() {
    rafPending = false;
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) {
      rafPending = true;
      requestAnimationFrame(lerpRing);
    }
  }

  document.addEventListener('mouseover', e => {
    const t = e.target;
    ring.className = '';
    dot.className  = '';
    if (t.closest('input,textarea,select')) {
      ring.className = 'ring--text';
      dot.className  = 'dot--text';
    } else if (t.closest('a,button,[onclick],.city-tab,.category-tab,.task-option,.poc-filter-btn,.action-btn,.view-leaderboard-btn')) {
      ring.className = 'ring--link';
      dot.className  = 'dot--link';
    } else if (t.closest('.ranking-row,.college-card,.hero-stat,.point-item,.podium-card,.queue-item,.poc-table-row,.stat-card,.admin-card')) {
      ring.className = 'ring--card';
    }
  }, { passive: true });

  document.addEventListener('mousedown', () => dot.classList.add('dot--click'),    { passive: true });
  document.addEventListener('mouseup',   () => dot.classList.remove('dot--click'), { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  }, { passive: true });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '';
    ring.style.opacity = '';
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════
   BUTTON RIPPLE
   ══════════════════════════════════════════════════ */
document.addEventListener('click', e => {
  const btn = e.target.closest(
    'button.btn, button.city-tab, button.category-tab, button.poc-filter-btn, button.view-leaderboard-btn, button.btn-publish'
  );
  if (!btn) return;
  const r   = document.createElement('span');
  const rec = btn.getBoundingClientRect();
  r.className = 'ripple-fx';
  r.style.cssText = `left:${e.clientX - rec.left}px;top:${e.clientY - rec.top}px`;
  btn.querySelectorAll('.ripple-fx').forEach(x => x.remove());
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}, true);

/* ══════════════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
});

/* ══════════════════════════════════════════════════
   MAGNETIC HOVER on hero stat cards
   ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-stat, .podium-card').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      el.style.transform = `translateY(-6px) scale(1.02) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.4s ease';
      setTimeout(() => el.style.transition = '', 400);
    });
  });
});
