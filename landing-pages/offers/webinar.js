/* OFFER: webinar seat.
   Everything specific to the webinar lives here. The page shell (logo, hero,
   trust row, disclosures, form handling) is shared in build.js; the PDF-guide
   page is the sibling file offers/guide.js. */

module.exports = {
  urlSuffix: 'equity-compensation-webinar',

  title: (c) => `Equity Compensation Webinar for ${c.COMPANY_NAME} Employees | Skyview Financial Group`,
  description: (c) => `A complimentary one-hour webinar on RSUs, stock options, and concentrated ${c.TICKER} positions. Every attendee receives a written analysis of their own equity grants.`,

  eyebrow: 'Complimentary webinar',
  headline: (c, h) => `Equity Compensation for <em>${h(c.COMPANY_NAME)}</em> Employees`,
  lead: 'A complimentary one-hour webinar. Every attendee receives a written analysis of their own equity grants.',
  heroCta: 'Reserve a seat',

  agendaEyebrow: 'Agenda',
  agendaTitle: 'What we will cover',
  agenda: (c) => [
    'The withholding gap on RSU vesting, and the tax bill it creates in April',
    'When exercising options makes sense, and when waiting costs you',
    'Managing a concentrated position: 10b5-1 plans, NUA, and 83(b)',
    `What a change in ${c.TICKER} does to a retirement plan built around it`,
  ],

  showSpeaker: true,

  formEyebrow: 'Register',
  formTitle: 'Reserve your seat',
  formSub: 'Choose the session that fits your schedule. It takes under a minute.',
  fields: ['name', 'email', 'phone', 'employer'],
  showSessions: true,
  submitLabel: 'Register',
  consent: 'By registering, you agree that Skyview Financial Group may contact you by email or phone about this event.',
  disclaimerNoun: 'This presentation',

  successTitle: 'You are registered.',
  successBody: (c, h) =>
    `<p>Your seat is reserved for <strong data-selected-session></strong>.</p>
     <p>We will email your joining link before the session. After the webinar, we will follow up to collect what we need for your written grant analysis.</p>`,
};
