/* =====================================================================
   CAMPAIGN CONFIG — one file per company. Builds every page listed in
   FORMSPREE below (webinar registration and/or PDF guide).

   New company every cycle:
     1. Copy this file to campaigns/<company>.js
     2. Change COMPANY_NAME and TICKER
     3. Set SESSIONS once dates are confirmed
     4. Create two Formspree forms (webinar + guide), paste their IDs below
     5. Commit on a branch. Vercel builds the pages automatically.

   URLs:  skyviewfg.com/<slug>-equity-compensation-webinar
          skyviewfg.com/<slug>-equity-compensation-guide
   The slug comes from COMPANY_NAME ("Acme Corp" -> "acme-corp").
   Set SLUG to override it.
   ===================================================================== */

const COMPANY_NAME = 'Roper Technologies';
const TICKER = 'ROP';

module.exports = {
  COMPANY_NAME,
  TICKER,
  SLUG: 'roper', // shorter URL than 'roper-technologies'

  // Webinar session options. Format: 'Day, Month D, YYYY · H:MM PM ET'
  // Any session containing "TBD" keeps the webinar page off the live site.
  SESSIONS: [
    'Wednesday, October 28, 2026 · 12:00 PM ET',
    'Wednesday, October 28, 2026 · 6:30 PM ET',
    'Tuesday, November 3, 2026 · 12:00 PM ET',
  ],

  // One Formspree form per page, so submissions arrive already segmented.
  FORMSPREE: {
    webinar: 'mjykwyvd', // "Webinar LP - Roper Technologies"
    guide: 'xaenoeyr',   // "Guide LP - Roper Technologies"
  },
};
