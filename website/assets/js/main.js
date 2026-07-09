(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav: solid background after scrolling past the hero
  var nav = document.getElementById('site-nav');
  var onScroll = function () {
    if (window.scrollY > 40) nav.classList.add('nav--solid');
    else nav.classList.remove('nav--solid');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  var toggle = document.getElementById('nav-toggle');
  var panel = document.getElementById('mobile-panel');
  toggle.addEventListener('click', function () {
    var open = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Negocio slides: play the "coming to life" clip on view, toggle on click
  var mediaButtons = document.querySelectorAll('.slider__media[data-video]');
  mediaButtons.forEach(function (btn) {
    var video = btn.querySelector('video');
    var hint = btn.querySelector('.slider__media-hint');

    var play = function () {
      if (reduceMotion) return;
      video.play().catch(function () {});
      btn.classList.add('is-playing');
      btn.setAttribute('aria-pressed', 'true');
      if (hint) hint.textContent = 'Toca para pausar';
    };

    var pause = function () {
      video.pause();
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-pressed', 'false');
      if (hint) hint.textContent = 'Toca para animar';
    };

    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-playing')) pause();
      else play();
    });

    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) play();
        });
      }, { threshold: 0.6 });
      io.observe(btn);
    }
  });

  // Negocios slider: arrows + dots drive the native scroll-snap track
  document.querySelectorAll('[data-slider]').forEach(function (root) {
    var track = root.querySelector('[data-slider-track]');
    var prevBtn = root.querySelector('[data-slider-prev]');
    var nextBtn = root.querySelector('[data-slider-next]');
    var dotsWrap = root.querySelector('[data-slider-dots]');
    var slides = track ? Array.prototype.slice.call(track.children) : [];
    if (!track || slides.length === 0) return;

    var dots = slides.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', 'Ir al negocio ' + (i + 1));
      dot.addEventListener('click', function () { scrollToSlide(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function activeIndex() {
      var pos = track.scrollLeft;
      var closest = 0;
      var min = Infinity;
      slides.forEach(function (slide, i) {
        var d = Math.abs(slide.offsetLeft - track.offsetLeft - pos);
        if (d < min) { min = d; closest = i; }
      });
      return closest;
    }

    function refresh() {
      var idx = activeIndex();
      dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === idx); });
      prevBtn.disabled = track.scrollLeft <= 4;
      nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    }

    function scrollToSlide(i) {
      var target = slides[Math.max(0, Math.min(slides.length - 1, i))];
      track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    prevBtn.addEventListener('click', function () { scrollToSlide(activeIndex() - 1); });
    nextBtn.addEventListener('click', function () { scrollToSlide(activeIndex() + 1); });

    var scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(refresh, 100);
    }, { passive: true });

    refresh();
  });

  // Contact form: compose a mailto (no backend on this static site)
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var phone = form.phone.value.trim();
      var message = form.message.value.trim();

      var subject = 'Mensaje desde onceuponatimepr.com — ' + name;
      var bodyLines = [
        'Nombre: ' + name,
        'Correo: ' + email,
        phone ? 'Teléfono: ' + phone : null,
        '',
        message
      ].filter(function (l) { return l !== null; });

      var mailto = 'mailto:info@onceuponatimepr.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(bodyLines.join('\n'));

      window.location.href = mailto;
    });
  }
})();
