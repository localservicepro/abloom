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

  /* Homepage video facade. The YouTube player is only created on click,
     so the page loads with no third-party requests or cookies. The
     privacy-enhanced youtube-nocookie host is used for playback. */
  var vTrigger = document.querySelector('.js-play-video');
  if (vTrigger) {
    var warmed = false;
    var warm = function () {
      if (warmed) return;
      warmed = true;
      ['https://www.youtube-nocookie.com', 'https://i.ytimg.com'].forEach(function (host) {
        var l = document.createElement('link');
        l.rel = 'preconnect'; l.href = host; l.crossOrigin = '';
        document.head.appendChild(l);
      });
    };
    vTrigger.addEventListener('pointerenter', warm);
    vTrigger.addEventListener('focus', warm);
    vTrigger.addEventListener('click', function () {
      var id = vTrigger.getAttribute('data-yt');
      var start = vTrigger.getAttribute('data-start') || '0';
      var frame = document.createElement('iframe');
      frame.className = 'vp-video';
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id +
                  '?autoplay=1&start=' + start + '&rel=0';
      frame.title = 'Abloom Tree Care arborists at work in Canberra';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.setAttribute('allowfullscreen', '');
      var shell = vTrigger.parentNode;
      shell.innerHTML = '';
      shell.appendChild(frame);
      frame.focus();
    });
  }

  /* Live Google reviews.
     /api/reviews reads the Google Places API server side and is cached hard
     at the CDN. Everything here is progressive enhancement: the rating,
     count and review cards written into the HTML stay exactly as they are
     if the endpoint is missing, unconfigured or slow, so the section can
     never end up empty. */
  var reviewList = document.querySelector('.js-review-list');
  var ratingEls = document.querySelectorAll('.js-rating');
  var countEls = document.querySelectorAll('.js-rating-count');

  if (reviewList || ratingEls.length) {
    var starRow = function (n) {
      var full = Math.round(n) || 5;
      return new Array(full + 1).join('\u2605');
    };

    var renderReview = function (r, i) {
      var card = document.createElement('div');
      card.className = 'review rv in' + (i % 2 ? ' rv-d1' : '');

      var stars = document.createElement('div');
      stars.className = 'stars';
      stars.setAttribute('aria-label', r.rating + ' stars');
      stars.textContent = starRow(r.rating);

      var quote = document.createElement('p');
      quote.textContent = '\u201c' + r.text + '\u201d';   // textContent keeps review text inert

      var who = document.createElement('div');
      who.className = 'who';
      who.appendChild(document.createTextNode(r.author));
      var meta = document.createElement('span');
      meta.textContent = (r.when ? r.when + ' \u00b7 ' : '') + 'Google review';
      who.appendChild(meta);

      card.appendChild(stars);
      card.appendChild(quote);
      card.appendChild(who);
      return card;
    };

    fetch('/api/reviews', { headers: { 'Accept': 'application/json' } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !data.ok) return;          // not configured yet, or upstream hiccup

        if (typeof data.rating === 'number') {
          var shown = data.rating.toFixed(1);
          ratingEls.forEach(function (el) { el.textContent = shown; });
        }
        if (typeof data.total === 'number') {
          countEls.forEach(function (el) { el.textContent = String(data.total); });
        }

        /* Keep the structured data honest: the visible rating and the
           AggregateRating in the JSON-LD must not disagree. */
        if (typeof data.rating === 'number' || typeof data.total === 'number') {
          document.querySelectorAll('script[type="application/ld+json"]').forEach(function (tag) {
            var json;
            try { json = JSON.parse(tag.textContent); } catch (e) { return; }
            if (!json || !json.aggregateRating) return;
            if (typeof data.rating === 'number') json.aggregateRating.ratingValue = data.rating.toFixed(1);
            if (typeof data.total === 'number') json.aggregateRating.reviewCount = String(data.total);
            tag.textContent = JSON.stringify(json);
          });
        }

        if (reviewList && data.reviews && data.reviews.length) {
          reviewList.textContent = '';
          data.reviews.forEach(function (r, i) { reviewList.appendChild(renderReview(r, i)); });
        }
      })
      .catch(function () { /* keep the reviews already on the page */ });
  }

  /* Current year in footer */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
