/* =====================================================================
   SHARED CONTENT — identical on every campaign page, every offer.
   Change it here once and every landing page picks it up on next build.
   ===================================================================== */

module.exports = {
  SPEAKER: {
    name: 'Alex R. Potenza',
    credentials: 'CIMA®, CDFA®',
    title: 'President, Skyview Financial Group',
    bio: '30 years advising executives on equity compensation.',
    photo: '/assets/lp/alex-r-potenza-320.webp',
  },

  TRUST: ['Fee-only', 'Fiduciary', 'Independent', 'Custody at Fidelity and Charles Schwab'],

  // Shown to the visitor if a send fails, and where lead notifications go.
  FALLBACK_EMAIL: 'ajpotenza@skyviewfg.com',

  GA4_ID: 'G-Y6W2EPLT4R',

  // Standard SEC disclosure — same text as the site footer (contact.html).
  // Links removed deliberately: landing pages carry no exits.
  SEC_DISCLOSURE: [
    'Skyview Financial Group, LLC is an investment adviser registered with the U.S. Securities and Exchange Commission, located in Ponte Vedra Beach, FL. Investment advisory services are offered through Skyview Financial Group. Custody services provided by Fidelity Brokerage Services LLC and Charles Schwab & Co., Inc., Members FINRA/SIPC, and/or other qualified custodians. Registration with the SEC or any state securities authority does not imply a certain level of skill or training. Information provided on this website is for general informational and educational purposes only and should not be construed as personalized investment, legal, tax, or accounting advice. Skyview Financial Group, LLC does not provide legal or tax advice.',
    'Different types of investments involve varying degrees of risk. It should not be assumed that future performance of any specific investment or investment strategy will be profitable. To check the background of Skyview Financial Group, please visit adviserinfo.sec.gov.',
  ],
};
