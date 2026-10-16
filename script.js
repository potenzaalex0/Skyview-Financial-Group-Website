/* Vercel Speed Insights (plain-HTML install) */
window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
(function () { var s = document.createElement('script'); s.defer = true; s.src = '/_vercel/speed-insights/script.js'; document.head.appendChild(s); })();

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

  // Services submenu: separate toggle button (desktop + mobile drawer).
  // Click/tap or Enter/Space toggles; Escape closes and returns focus;
  // clicking outside closes the desktop menu. Not hover-dependent.
  const subToggles = document.querySelectorAll('.nav-sub-toggle, .mnav-sub-toggle');
  const setOpen = (btn, open) => {
    const menu = document.getElementById(btn.getAttribute('aria-controls'));
    if (!menu) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.hidden = !open;
  };
  subToggles.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(btn, btn.getAttribute('aria-expanded') !== 'true');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    subToggles.forEach((btn) => {
      if (btn.getAttribute('aria-expanded') === 'true') {
        setOpen(btn, false);
        if (btn.closest('.has-sub') && btn.closest('.has-sub').contains(document.activeElement)) btn.focus();
      }
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-sub-toggle[aria-expanded="true"]').forEach((btn) => {
      if (!btn.closest('.has-sub').contains(e.target)) setOpen(btn, false);
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

  const form = document.querySelector('form[data-form="contact"]');
  const status = document.querySelector('[data-form-status]');
  const showFormError = () => {
    if (window.turnstile && typeof window.turnstile.reset === 'function') {
      window.turnstile.reset();
    }
    if (status) {
      status.textContent = 'Something went wrong. Please email us directly at ajpotenza@skyviewfg.com.';
      status.style.display = 'block';
      status.style.color = '#cc0000';
    }
  };
  if (form) {
    form.addEventListener('submit', (e) => {
      // Honeypot check — silently block bots
      const honey = form.querySelector('input[name="website_url"]');
      if (honey && honey.value) {
        e.preventDefault();
        return;
      }

      // Submit to Formspree via fetch, then redirect to thank-you page on success
      e.preventDefault();
      const data = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then((response) => {
        if (response.ok) {
          window.location.href = '/thank-you.html';
        } else {
          showFormError();
        }
      }).catch(() => {
        showFormError();
      });
    });
  }
})();

document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
  if (!link) return;
  if (typeof gtag !== 'function') return;
  var raw = link.getAttribute('href') || '';
  var isPhone = raw.indexOf('tel:') === 0;
  gtag('event', isPhone ? 'phone_click' : 'email_click', {
    contact_value: raw.replace(/^(tel:|mailto:)/, '').split('?')[0],
    page_path: window.location.pathname,
    link_text: (link.textContent || '').trim().slice(0, 100)
  });
});
