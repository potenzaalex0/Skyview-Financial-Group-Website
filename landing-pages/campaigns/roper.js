/* =====================================================================
   CAMPAIGN CONFIG — one file per company. Builds every page listed in
   OFFERS below (webinar registration and/or PDF guide).

   New company every cycle:
     1. Copy this file to campaigns/<company>.js
     2. Change COMPANY_NAME and TICKER
     3. Set SESSIONS once dates are confirmed
     4. Add the Teams join links to CAMPAIGN_TEAMS_LINKS in Vercel
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

  // Webinar sessions, in the order they appear on the page.
  // The Microsoft Teams join links are NOT here: Vercel serves this repo's
  // source publicly, so a link in this file could be read without
  // registering. They live in the CAMPAIGN_TEAMS_LINKS environment variable
  // in Vercel, one array per campaign, in the same order as this list.
  // See landing-pages/README.md. Until a link is set, registration still
  // works: the confirmation says the link follows separately and you get an
  // email telling you to send it.
  SESSIONS: [
    'Wednesday, October 28, 2026 · 12:00 PM ET',
    'Wednesday, October 28, 2026 · 6:30 PM ET',
    'Tuesday, November 3, 2026 · 12:00 PM ET',
  ],

  // Pages to build for this company.
  OFFERS: ['webinar', 'guide'],
};
