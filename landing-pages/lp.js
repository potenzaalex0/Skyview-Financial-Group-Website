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

  // Attribution. UTMs from the landing URL (our Instantly links carry
  // utm_source / utm_medium / utm_campaign / utm_content) are kept in
  // sessionStorage, so a reload or a visit that loses the query string
  // still attributes the registration to the email that produced it. They
  // ride in their own hidden fields and in the combined `source` string.
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  var STORE = 'skyview_utm:' + window.location.pathname;
  var utm = {};
  try {
    var q = new URLSearchParams(window.location.search);
    UTM.forEach(function (k) { if (q.get(k)) utm[k] = q.get(k).slice(0, 100); });
    if (Object.keys(utm).length) sessionStorage.setItem(STORE, JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem(STORE) || '{}') || {};
  } catch (e) {}
  UTM.forEach(function (k) {
    var el = form.querySelector('input[name="' + k + '"]');
    if (el && utm[k]) el.value = utm[k];
  });
  try {
    var parts = UTM.map(function (k) { return utm[k]; }).filter(Boolean);
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

    // Checkbox groups (e.g. holdings) send every ticked value as an array.
    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (form.querySelectorAll('input[type="checkbox"][name="' + k + '"]').length) (data[k] = data[k] || []).push(v);
      else data[k] = v;
    });

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
          var first = wrap.querySelector('[data-first-name]');
          if (first) first.textContent = data.first_name ? ', ' + data.first_name : '';
          var mail = wrap.querySelector('[data-submitted-email]');
          if (mail) mail.textContent = data.email || 'your inbox';
          wrap.classList.add('is-done');
          wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Conversion event: only reached when /api/lead returned 2xx.
          // company comes from the page (set by build.js); utm_content is
          // added by analytics.js. registrations / downloads = 1 feed the
          // GA4 custom metrics used by the Campaign Funnel report. No-op if the visitor declined cookies.
          if (typeof window.skyviewTrack === 'function') {
            var page = window.SKYVIEW_PAGE || {};
            var offer = form.getAttribute('data-offer');
            if (offer === 'webinar') {
              window.skyviewTrack('webinar_registration', { company: page.company, session: data.session, utm_content: data.utm_content, registrations: 1 });
            } else if (offer === 'guide') {
              window.skyviewTrack('guide_download', { company: page.company, utm_content: data.utm_content, downloads: 1 });
            }
          }
        });
      })
      .catch(function () { fail(); });
  });
})();
