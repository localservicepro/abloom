/* Abloom Tree Care — shared behaviour */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');

  /* Sticky header state */
  function onScroll() {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile burger */
  var burger = document.querySelector('.nav-burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      header.classList.add('scrolled');
      if (!open) onScroll();
    });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        onScroll();
      });
    });
  }

  /* Services dropdown (hover + keyboard/touch) */
  document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
    var trigger = dd.querySelector('.nav-link');
    dd.addEventListener('mouseenter', function () { dd.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); });
    dd.addEventListener('mouseleave', function () { dd.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); });
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var open = dd.classList.toggle('open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) { dd.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
    });
  });

  /* Scroll-reveal animations */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealed = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add('in'); });
  }

  /* Animated counters */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* Quote forms submit natively (GET → /thank-you/) so the GHL
     external-tracking script can capture the submission and sync the
     contact. Do not preventDefault() the submit event here. */

  /* Quote popup — any .js-open-quote trigger opens the modal.
     Without JS (or on pages without the modal) triggers fall back to
     their href (/contact/). */
  var quoteModal = document.getElementById('quote-modal');
  if (quoteModal) {
    var lastTrigger = null;
    var openQuote = function (e) {
      e.preventDefault();
      lastTrigger = e.currentTarget;
      quoteModal.classList.add('open');
      quoteModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var first = quoteModal.querySelector('input');
      if (first) first.focus();
    };
    var closeQuote = function () {
      quoteModal.classList.remove('open');
      quoteModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastTrigger) lastTrigger.focus();
    };
    document.querySelectorAll('.js-open-quote').forEach(function (el) {
      el.addEventListener('click', openQuote);
    });
    quoteModal.querySelectorAll('[data-close-quote]').forEach(function (el) {
      el.addEventListener('click', closeQuote);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && quoteModal.classList.contains('open')) closeQuote();
    });
  }

  /* Current year in footer */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
