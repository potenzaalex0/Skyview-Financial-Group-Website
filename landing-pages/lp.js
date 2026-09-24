/* Skyview landing pages — inlined into each generated page at build time.
   Posts the form to /api/lead (our own handler, which emails the visitor
   through Resend), then shows the confirmation in place. The contact page
   is separate and still posts to Formspree. */
(function () {
  'use strict';
  var wrap = document.querySelector('[data-lp-form]');
  if (!wrap) return;
  var form = wrap.querySelector('form');
  var status = wrap.querySelector('[data-form-status]');
  var button = form.querySelector('button[type="submit"]');
  var fallback = wrap.getAttribute('data-fallback-email');

  // Traffic source for attribution (utm_source / utm_medium / utm_campaign)
  try {
    var q = new URLSearchParams(window.location.search);
    var parts = ['utm_source', 'utm_medium', 'utm_campaign'].map(function (k) { return q.get(k); }).filter(Boolean);
    var src = form.querySelector('input[name="source"]');
    if (src) src.value = parts.length ? parts.join(' / ') : (document.referrer ? 'referral: ' + document.referrer.split('/')[2] : 'direct');
  } catch (e) {}

  function fail(message) {
    button.disabled = false;
    status.textContent = message || ('Something went wrong. Please email us at ' + fallback + ' and we will send it straight over.');
    status.classList.add('is-visible');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var honey = form.querySelector('input[name="website_url"]');
    if (honey && honey.value) return; // silently drop bots

    button.disabled = true;
    status.classList.remove('is-visible');

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok) return fail(body && body.error);
          var slot = wrap.querySelector('[data-selected-session]');
          if (slot) slot.textContent = data.session || '';
          var mail = wrap.querySelector('[data-submitted-email]');
          if (mail) mail.textContent = data.email || 'your inbox';
          wrap.classList.add('is-done');
          wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof gtag === 'function') {
            gtag('event', 'generate_lead', {
              lead_type: form.getAttribute('data-offer'),
              campaign_slug: data.campaign,
              session_choice: data.session || ''
            });
          }
        });
      })
      .catch(function () { fail(); });
  });
})();
