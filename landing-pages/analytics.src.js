/* =====================================================================
   SITE ANALYTICS + COOKIE CONSENT — source template.

   build.js copies this to /analytics.js on every deploy, replacing
   __GA4_MEASUREMENT_ID__ with the GA4_MEASUREMENT_ID environment variable
   set in Vercel. Every page (site pages and campaign pages) loads
   /analytics.js; nothing else on the site talks to Google directly.

   What it does:
   1. Shows a consent banner until the visitor chooses. Google Analytics
      (gtag.js) is NOT requested and NO cookies are set until they click
      Accept. Decline = nothing loads, ever, until they change their mind.
   2. Once accepted: loads GA4 with Google Signals and ad personalization
      off. The page context (company, page_type) rides on every event.
   3. Exposes window.skyviewTrack(name, params) for the campaign forms.
      It is a no-op without consent.

   Visitors can reopen the banner from any link to "#cookie-settings" or any
   element with a data-cookie-settings attribute. Withdrawing consent
   deletes the _ga cookies and stops collection.

   Add ?ga_debug=1 to any URL to send events to GA4 DebugView.
   ===================================================================== */
(function () {
  'use strict';
  var GA_ID = '__GA4_MEASUREMENT_ID__';
  var KEY = 'skyview_consent_v1';
  var MAX_AGE_DAYS = 365;                       // re-ask after a year
  var COOKIE_SECONDS = 60 * 60 * 24 * 395;      // _ga cookies: ~13 months
  var POLICY_URL = '/disclaimers.html#privacy-disclosures';

  var enabled = /^G-[A-Z0-9]+$/.test(GA_ID);
  var loaded = false;
  var page = window.SKYVIEW_PAGE || {};
  var query = {};
  try {
    var q = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { if (q.get(k)) query[k] = q.get(k); });
    query.debug = q.get('ga_debug') === '1';
  } catch (e) {}

  // ---- stored choice ------------------------------------------------
  function readChoice() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!v || (v.choice !== 'granted' && v.choice !== 'denied')) return null;
      if (Date.now() - v.ts > MAX_AGE_DAYS * 864e5) return null;
      return v.choice;
    } catch (e) { return null; }
  }
  function saveChoice(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, ts: Date.now() })); } catch (e) {}
  }

  // ---- GA4 ----------------------------------------------------------
  function loadGA() {
    if (loaded || !enabled) return;
    loaded = true;
    window['ga-disable-' + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    gtag('set', 'allow_google_signals', false);
    gtag('set', 'allow_ad_personalization_signals', false);
    gtag('js', new Date());
    var cfg = {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: COOKIE_SECONDS
    };
    if (page.company) cfg.company = page.company;
    if (page.page_type) cfg.page_type = page.page_type;
    if (query.debug) cfg.debug_mode = true;
    gtag('config', GA_ID, cfg);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function stopGA() {
    window['ga-disable-' + GA_ID] = true;
    // Remove _ga / _ga_XXXX cookies on this host and the parent domain.
    var host = window.location.hostname;
    var domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga(_|$)|^_gid$|^_gat/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  // Campaign forms call this on SUCCESSFUL submit only.
  window.skyviewTrack = function (name, params) {
    if (!loaded || typeof window.gtag !== 'function') return false;
    var p = {};
    for (var k in params) {
      var v = params[k];
      if (v === undefined || v === null || v === '') continue;
      p[k] = typeof v === 'number' ? v : String(v).slice(0, 100);
    }
    if (query.utm_content && !p.utm_content) p.utm_content = query.utm_content;
    window.gtag('event', name, p);
    return true;
  };

  // ---- banner -------------------------------------------------------
  var CSS = '' +
    '.sv-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:640px;margin:0 auto;background:#fff;color:#333;border:1px solid #d9e2ec;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.15);padding:18px 20px;font:14px/1.5 Manrope,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '.sv-consent p{margin:0 0 12px}' +
    '.sv-consent a{color:#0077cc;text-decoration:underline}' +
    '.sv-consent .sv-btns{display:flex;gap:10px;flex-wrap:wrap}' +
    '.sv-consent button{flex:1 1 140px;cursor:pointer;border-radius:6px;padding:10px 14px;font-family:inherit;font-size:14px;font-weight:600;line-height:1.2;border:2px solid #0099FF}' +
    '.sv-consent .sv-accept{background:#0099FF;color:#fff}' +
    '.sv-consent .sv-decline{background:#fff;color:#0077cc}' +
    '.sv-consent button:focus-visible{outline:3px solid #33CCFF;outline-offset:2px}';

  var bannerEl = null;
  function showBanner() {
    if (!enabled) return;
    if (bannerEl) { bannerEl.style.display = ''; return; }
    if (!document.getElementById('sv-consent-css')) {
      var st = document.createElement('style');
      st.id = 'sv-consent-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    bannerEl = document.createElement('div');
    bannerEl.className = 'sv-consent';
    bannerEl.setAttribute('role', 'region');
    bannerEl.setAttribute('aria-label', 'Cookie consent');
    bannerEl.innerHTML =
      '<p>We use Google Analytics cookies to understand how visitors find and use this site. ' +
      'They are only set if you accept. We do not use advertising cookies. ' +
      '<a href="' + POLICY_URL + '">Privacy Policy</a></p>' +
      '<div class="sv-btns"><button type="button" class="sv-decline" data-choice="denied">Decline</button>' +
      '<button type="button" class="sv-accept" data-choice="granted">Accept analytics</button></div>';
    bannerEl.addEventListener('click', function (e) {
      var choice = e.target && e.target.getAttribute && e.target.getAttribute('data-choice');
      if (!choice) return;
      saveChoice(choice);
      bannerEl.style.display = 'none';
      if (choice === 'granted') loadGA();
      else { var wasLoaded = loaded; stopGA(); if (wasLoaded) window.location.reload(); }
    });
    document.body.appendChild(bannerEl);
  }

  function init() {
    var choice = readChoice();
    if (choice === 'granted') loadGA();
    else if (choice === null) showBanner();
    if (window.location.hash === '#cookie-settings') showBanner();
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('a[href$="#cookie-settings"], [data-cookie-settings]');
      if (!t) return;
      e.preventDefault();
      showBanner();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
