/* OFFER: downloadable PDF guide.
   Same shell as the webinar page (build.js). Differences: no speaker block,
   two-field form, and the PDF is NOT revealed on the page. api/lead.js emails
   the download link to the address submitted, so the visitor has to use a
   real inbox to get the file. */

module.exports = {
  urlSuffix: 'equity-compensation-guide',

  // One PDF per company, hosted by the site at guides/<slug>-equity-compensation-guide.pdf
  // (e.g. guides/jabil-equity-compensation-guide.pdf). Its public URL is what
  // the confirmation email links to. It is never shown on the page.
  pdf: (c) => `/guides/${c.slug}-equity-compensation-guide.pdf`,

  // Flip to true once the Resend sending domain is verified and a live test
  // has arrived. Until then production skips guide pages, because the page
  // tells visitors to check their inbox.
  emailDeliveryLive: true,

  title: (c) => `Understanding Your Equity Compensation: A Guide for ${c.COMPANY_NAME} Employees | Skyview Financial Group`,
  description: (c) => `A guide for ${c.COMPANY_NAME} employees. Nine pages on RSUs, stock options, and concentrated positions, plus a worksheet.`,

  eyebrow: 'Complimentary guide',
  headline: () => 'Understanding Your <em>Equity Compensation</em>',
  lead: (c) => `A guide for ${c.COMPANY_NAME} employees. Nine pages on RSUs, stock options, and concentrated positions — plus a worksheet.`,
  heroCta: 'Get the guide',

  agendaEyebrow: 'Inside the guide',
  agendaTitle: 'What’s inside',
  agenda: () => [
    'How RSUs are taxed, and where the withholding gap comes from',
    'Non-qualified versus incentive stock options, side by side',
    'The 90-day window if you leave',
    'Concentration, and the tools that address it',
    'A one-page worksheet to map your own position',
  ],
  showSpeaker: false,

  formEyebrow: 'Free PDF',
  formTitle: 'Get the guide',
  formSub: 'Enter your name and email. We will send the PDF to your inbox.',
  fields: ['name', 'email'],
  showSessions: false,
  submitLabel: 'Email me the guide',
  consent: 'By submitting, you agree that Skyview Financial Group may email you about this guide.',
  disclaimerNoun: 'This guide',

  successTitle: 'Check your inbox.',
  successBody: () =>
    `<p>We sent the guide to <strong data-submitted-email></strong>.</p>
     <p>It should arrive within a few minutes. If you don’t see it, check your spam or promotions folder.</p>`,
};
