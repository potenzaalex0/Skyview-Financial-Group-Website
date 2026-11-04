/* =====================================================================
   CAMPAIGN CONFIG — ADT (Thrive Holdings take-private, announced
   October 29, 2026). Webinar page only.

   Same template as jabil.js / mastec.js. The WEBINAR block below overrides
   individual keys of offers/webinar.js for this company only (headline,
   agenda, form fields, disclaimers); everything else is the shared page.

   BRAND RULE: no ADT logo, wordmark or other ADT brand asset anywhere on
   this page. ADT is referenced by name in text only. The only logo is
   Skyview's (rendered by build.js).

   Every fact in WEBINAR.background is from ADT's public SEC filings. Do not
   add deal terms that are not in a filing.

   URL: skyviewfg.com/adt-equity-compensation-webinar
   ===================================================================== */

const COMPANY_NAME = 'ADT';
const TICKER = 'ADT';

module.exports = {
  COMPANY_NAME,
  TICKER,
  SLUG: 'adt',

  // >>> SWAP THE DATES HERE <<<
  // Keep the exact format "Weekday, Month D, YYYY · 1:00 PM ET": the
  // confirmation email and the calendar invite read the date and time out
  // of this string. Production skips the page if a placeholder like
  // [SESSION DATE 1] is put back.
  // Add two Teams links, same order, to CAMPAIGN_TEAMS_LINKS in Vercel
  // under "adt-equity-compensation-webinar".
  SESSIONS: [
    'Tuesday, November 17, 2026 · 1:00 PM ET',
    'Thursday, November 19, 2026 · 1:00 PM ET',
  ],

  OFFERS: ['webinar'],

  WEBINAR: {
    title: () => 'ADT Equity and the $10.00 Buyout | Webinar for ADT Employees | Skyview Financial Group',
    description: () => 'A complimentary planning session for ADT employees holding options, RSUs or PSUs ahead of the $10.00 per share Thrive Holdings acquisition.',

    headline: (c, h) => `Your <em>ADT</em> equity and the $10.00 buyout`,
    lead: 'A complimentary planning session for ADT employees holding options, RSUs or PSUs.',

    background: {
      eyebrow: 'The transaction',
      title: 'What has been announced',
      paragraphs: [
        'On October 29, 2026, ADT agreed to be acquired by Thrive Holdings for $10.00 per share in cash. The transaction values ADT at $7.6 billion in equity value and is expected to close in the first quarter of 2027, subject to a stockholder vote and U.S. antitrust clearance. On closing, ADT becomes privately held and its common stock ceases trading on the NYSE.',
      ],
    },

    agendaIntro: '',
    // Must match the Instantly email sequence word for word.
    agenda: () => [
      'Vested options: how the cash-out works at $10.00 minus your exercise price, and why your grant date determines almost all of your outcome',
      'Grants struck above $10.00, given ADT’s $6.87 unaffected price, and what the filings do and do not yet say about them',
      'Unvested RSUs and PSUs: what changes when an award converts from stock into a cash obligation that keeps its original vesting schedule',
      'The 22% supplemental withholding gap on a large cash-out, and the April tax bill it creates for anyone in the 32% or 35% bracket',
      'What it means to hold an illiquid, unhedgeable position in a company that is no longer publicly traded',
      'Which questions are still genuinely open until ADT files its merger proxy',
    ],

    offerNote: {
      label: 'For every attendee',
      text: 'A complimentary written analysis of your outstanding grants, each grant summarized on one page.',
    },

    speaker: { title: 'President, Skyview Financial Group, LLC' },

    formSub: 'Both sessions start at 1:00 PM Eastern. It takes under a minute.',
    sessionControl: 'select',
    sessionLabel: 'Which session?',
    fields: ['first_name', 'last_name', 'email', { key: 'phone', optional: true }, 'holdings'],
    holdingsLabel: 'Which do you hold?',
    holdingsOptions: ['Stock options', 'RSUs', 'PSUs', 'ESPP shares', 'Not sure'],

    // Required disclaimers, verbatim. Shown in an "Important information"
    // box in the page body AND in the footer. The first one replaces the
    // template's generic sponsor line.
    notices: [
      'This event is sponsored solely by Skyview Financial Group, LLC and is not affiliated with, endorsed by, or sponsored by ADT Inc. or Thrive Holdings.',
      'Skyview Financial Group has no access to non-public information regarding the transaction. All transaction details referenced are drawn from ADT’s public SEC filings.',
      // Ending of this sentence approved by Alex J. on Nov 4, 2026 (the
      // original brief was cut off after "governed by that").
      'This presentation is for educational purposes and is not tax, legal or investment advice. The treatment of any individual equity award is governed by that award’s plan documents and grant agreement and by the terms of the merger agreement.',
    ],

    successBody: (c, h) =>
      `<p>Thank you<span data-first-name></span>. Your seat is reserved for <strong data-selected-session></strong>.</p>
     <p>A confirmation email with your Microsoft Teams join link and a calendar invite is on its way to <strong data-submitted-email></strong>.</p>
     <p>After the session we will follow up to collect what we need for your written grant analysis.</p>`,
  },
};
