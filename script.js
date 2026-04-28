/* Skyview Financial Group — Site Interactions */
(function () {
  'use strict';

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav-close');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (closeBtn && mobileNav) {
    closeBtn.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }
  // Close drawer when a link is tapped
  document.querySelectorAll('.mobile-nav a').forEach((a) => {
    a.addEventListener('click', () => {
      mobileNav && mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  // Scroll reveal animation
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // Contact form: honeypot + placeholder handler
  // NOTE: To make this form functional, point it at a real backend
  // (Formspree, Basin, Netlify Forms, or your own endpoint) and remove the e.preventDefault()
  const form = document.querySelector('form[data-form="contact"]');
  const status = document.querySelector('[data-form-status]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const honey = form.querySelector('input[name="website_url"]');
      if (honey && honey.value) { return; } // bot detected, silently drop

      if (status) {
        status.textContent = 'Thank you. We will be in touch within one business day.';
        status.style.display = 'block';
        status.style.color = '#0099FF';
      }
      form.reset();
    });
  }
})();
