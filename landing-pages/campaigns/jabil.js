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

const COMPANY_NAME = 'Jabil';
const TICKER = 'JBL';

module.exports = {
  COMPANY_NAME,
  TICKER,

  // Webinar session options. Format: 'Day, Month D, YYYY · H:MM PM ET'
  // >>> DATES TBD. While any session contains "TBD", the webinar page is
  // >>> built on previews but SKIPPED in production, so it can't go live
  // >>> with placeholder dates.
  SESSIONS: [
    'Session 1 · Date and time TBD',
    'Session 2 · Date and time TBD',
    'Session 3 · Date and time TBD',
  ],

  // One Formspree form per page, so submissions arrive already segmented.
  FORMSPREE: {
    webinar: 'mljdbgbl', // "Webinar LP - Jabil"
    guide: 'xdekgeor',   // "Guide LP - Jabil"
  },
};
