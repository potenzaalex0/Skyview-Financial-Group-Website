/* Skyview landing pages — inlined into each generated page at build time.
   Same Formspree pattern as script.js on the contact page: honeypot check,
   fetch with Accept: application/json, Turnstile reset on failure.
   Difference: success shows an in-page confirmation instead of redirecting
   to /thank-you.html (which carries the full site nav). */
(function () {
  'use strict';
  var wrap = document.querySelector('[data-lp-form]');
  if (!wrap) return;
  var form = wrap.querySelector('form');
  var status = wrap.querySelector('[data-form-status]');
  var button = form.querySelector('button[type="submit"]');

  // Traffic source for attribution (utm_source / utm_medium / utm_campaign)
  try {
    var q = new URLSearchParams(window.location.search);
    var parts = ['utm_source', 'utm_medium', 'utm_campaign'].map(function (k) { return q.get(k); }).filter(Boolean);
    var src = form.querySelector('input[name="source"]');
    if (src) src.value = parts.length ? parts.join(' / ') : (document.referrer ? 'referral: ' + document.referrer.split('/')[2] : 'direct');
  } catch (e) {}

  function fail() {
    if (window.turnstile && typeof window.turnstile.reset === 'function') window.turnstile.reset();
    button.disabled = false;
    status.textContent = 'Something went wrong. Please email us directly at ' + wrap.getAttribute('data-fallback-email') + '.';
    status.classList.add('is-visible');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var honey = form.querySelector('input[name="website_url"]');
    if (honey && honey.value) return; // silently drop bots

    button.disabled = true;
    status.classList.remove('is-visible');
    var data = new FormData(form);

    fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) return fail();
        var session = data.get('session') || '';
        var slot = wrap.querySelector('[data-selected-session]');
        if (slot) slot.textContent = session;
        var mail = wrap.querySelector('[data-submitted-email]');
        if (mail) mail.textContent = data.get('email') || 'your inbox';
        wrap.classList.add('is-done');
        wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (typeof gtag === 'function') {
          gtag('event', 'generate_lead', {
            lead_type: form.getAttribute('data-offer'),
            campaign_slug: data.get('campaign'),
            session_choice: session
          });
        }
      })
      .catch(fail);
  });
})();
