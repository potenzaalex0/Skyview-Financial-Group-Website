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

const COMPANY_NAME = 'ADT';
const TICKER = 'ADT';

module.exports = {
  COMPANY_NAME,
  TICKER,
  SLUG: 'adt',

  // Webinar sessions, in the order they appear on the page.
  // The Microsoft Teams join links are NOT here: Vercel serves this repo's
  // source publicly, so a link in this file could be read without
  // registering. They live in the CAMPAIGN_TEAMS_LINKS environment variable
  // in Vercel, one array per campaign, in the same order as this list.
  // See landing-pages/README.md. Until a link is set, registration still
  // works: the confirmation says the link follows separately and you get an
  // email telling you to send it.
  SESSIONS: [
    'Tuesday, November 17, 2026 · 1:00 PM ET',
    'Thursday, November 19, 2026 · 1:00 PM ET',
  ],

  // Pages to build for this company.
  OFFERS: ['webinar'], // no ADT guide PDF yet

  // Same page as MasTec/Roper, with three deal-specific edits that match
  // ADT Email 1 word for word: a deal sentence under the headline, three
  // agenda bullets, and the sponsor line. Facts are from ADT's SEC filings
  // only (Oct 29 8-K and DEFA14A employee FAQ).
  WEBINAR: {
    lead: 'On October 29, ADT agreed to be acquired for $10.00 per share in cash, subject to stockholder approval. The deal changes how your stock options, RSUs and PSUs pay out. A complimentary one-hour session. All attendees will receive a written analysis of their stock options and restricted stock.',
    agenda: () => [
      'Unvested awards that convert to cash on their original vesting schedule, and what that means for your retirement plan',
      'Restricted Stock Units, Performance Stock Units, and stock options, and what happens to each at closing',
      'Vested options: how a $10.00 cash-out works, and why your exercise price matters',
      'Options with an exercise price above $10.00, and what the filings do and do not yet say about them',
      'The withholding gap on RSU vesting and option cash-outs, and the tax bill it creates in April',
    ],
    sponsorLine: 'Sponsored solely by Skyview Financial Group, LLC. Not affiliated with, endorsed by, or sponsored by ADT Inc. or Thrive Holdings. Transaction details are drawn from ADT’s public SEC filings. Skyview Financial Group has no access to non-public information regarding the transaction.',
  },
};
