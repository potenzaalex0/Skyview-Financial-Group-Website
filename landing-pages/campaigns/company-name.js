/* =====================================================================
   CAMPAIGN CONFIG — one file per company.

   New company every cycle:
     1. Copy this file to campaigns/<company>.js
     2. Change COMPANY_NAME and TICKER below
     3. Update SESSIONS and FORMSPREE_ID
     4. Commit. Vercel builds the page automatically.

   URL: skyviewfg.com/<slug>-equity-compensation-webinar
   The slug is generated from COMPANY_NAME ("Acme Corp" -> "acme-corp").
   Set SLUG only if you want something different.
   ===================================================================== */

const COMPANY_NAME = 'COMPANY_NAME';
const TICKER = 'TICKER';

module.exports = {
  COMPANY_NAME,
  TICKER,

  // 'webinar' today. 'guide' (PDF download, name + email only) is next.
  OFFER: 'webinar',

  // Session options shown to the visitor. Edit each cycle.
  // PLACEHOLDER DATES — replace before this page goes live.
  SESSIONS: [
    'Tuesday, October 13, 2026 · 12:00 PM ET',
    'Wednesday, October 14, 2026 · 6:30 PM ET',
    'Thursday, October 15, 2026 · 8:00 AM ET',
  ],

  // Formspree form ID — the part after formspree.io/f/
  // Create a new form per company so registrations are already segmented.
  FORMSPREE_ID: 'mljdbgbl',

  // SLUG: 'custom-slug',   // optional override
};
