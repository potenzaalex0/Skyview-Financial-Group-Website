/* OFFER: downloadable PDF guide.
   Same shell as the webinar page (build.js). Differences: no speaker block,
   two-field form, and the PDF is NOT revealed on the page. Formspree's
   autoresponse emails the download link to the address submitted, so the
   visitor has to use a real inbox to get the file. */

module.exports = {
  urlSuffix: 'equity-compensation-guide',

  // The PDF, hosted by the site. Its public URL goes in each guide form's
  // Formspree autoresponse message: https://skyviewfg.com + this path.
  pdf: '/guides/understanding-your-equity-compensation.pdf',

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
  subject: (c) => `Guide request: ${c.COMPANY_NAME}`,
  consent: 'By submitting, you agree that Skyview Financial Group may email you about this guide.',
  disclaimerNoun: 'This guide',

  successTitle: 'Check your inbox.',
  successBody: () =>
    `<p>We sent the guide to <strong data-submitted-email></strong>.</p>
     <p>It should arrive within a few minutes. If you don’t see it, check your spam or promotions folder.</p>`,
};
