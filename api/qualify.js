/* =====================================================================
   Concentrated stock funnel: qualifier handler for /stock-compensation-review.html.

   The page posts the visitor's answers and contact details here. This
   function decides fit on the server (never trusts the page), then:
     1. emails the visitor: a booking note if qualified, a reading list if not
     2. emails Alex a lead notification with a pre-call briefing built from
        the answers (how to open, likely objections, questions to ask)
   and returns { ok, qualified } so the page can show TidyCal or the
   reading-list confirmation.

   Qualified = wants a plan soon AND $1M+ investable AND timeline under
   6 months. Change MIN_ASSETS_INDEX / TIMELINE_OK below to adjust.

   Uses the same Resend setup as api/lead.js (RESEND_API_KEY). Plain text
   emails, BCC to the compliance archive, same as every other form.
   ===================================================================== */
'use strict';

const FROM = 'Alex J. Potenza | Skyview Financial Group <ajpotenza@mail.skyviewfg.com>';
const REPLY_TO = 'ajpotenza@skyviewfg.com';
const ARCHIVE = 'ajpotenza@skyviewfg.com';
const SITE = 'https://skyviewfg.com';
// Public TidyCal booking page, used in the confirmation email. Set to the
// same path as data-tidycal on stock-compensation-review.html. Empty = "we will call you".
const TIDYCAL_URL = 'https://tidycal.com/ajpotenza/30-minute-meeting';

const SIGNATURE = [
  'Alex J. Potenza, CFP®, CPWA®',
  'Skyview Financial Group',
  '816 A1A North, Suite 205, Ponte Vedra Beach, FL 32082',
  '(888) 406-0444',
].join('\n');

// Must match the option text on stock-compensation-review.html exactly.
const OPTIONS = {
  intent: ['Yes, I want to talk this through soon', 'Not yet, I am just learning'],
  holdings: ['RSUs (vested or unvested)', 'Stock options (ISOs or NQSOs)', 'ESPP shares', 'Restricted stock or founder shares', 'Shares from a past grant or IPO'],
  conc: ['Under 10%', '10% to 25%', '25% to 50%', 'Over 50%'],
  assets: ['Under $1 million', '$1 million to $3 million', '$3 million to $10 million', 'Over $10 million'],
  timeline: ['Within the next 30 days', 'In 1 to 6 months', 'In 6 to 12 months', 'Just researching for now'],
  goal: ['Reduce my single stock risk', 'Manage taxes on vesting or exercise', 'Plan around a departure, acquisition or IPO', 'Retire earlier or on my own terms'],
};
const STATES = ['Florida', 'New York', 'New Jersey', 'Other'];
const MIN_ASSETS_INDEX = 1;              // '$1 million to $3 million' and up
const TIMELINE_OK = [0, 1];              // within 30 days, or 1 to 6 months

const READING = [
  ['How RSU withholding works, and why it often falls short', `${SITE}/blog/rsu-tax-withholding.html`],
  ['ISOs vs NQSOs: how each is taxed and when to exercise', `${SITE}/blog/iso-vs-nqso-tax-difference.html`],
  ['10b5-1 plans: selling company stock on a schedule', `${SITE}/blog/10b5-1-plan-explained.html`],
  ['Ways to diversify a concentrated stock position', `${SITE}/concentrated-stock-diversification.html`],
];

// --- helpers ---------------------------------------------------------
const clean = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max || 200);
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
const pick = (list, v) => (list.includes(v) ? v : '');

const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { n: 0, t: now };
  if (now - rec.t > 60000) { rec.n = 0; rec.t = now; }
  rec.n += 1;
  hits.set(ip, rec);
  if (hits.size > 500) hits.clear();
  return rec.n > 8;
}

async function sendEmail(payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend ${res.status}: ${body.slice(0, 500)}`);
  return body;
}

function qualify(a) {
  const intentOk = a.intent === OPTIONS.intent[0];
  const assetsOk = OPTIONS.assets.indexOf(a.assets) >= MIN_ASSETS_INDEX;
  const timeOk = TIMELINE_OK.includes(OPTIONS.timeline.indexOf(a.timeline));
  return { qualified: intentOk && assetsOk && timeOk, intentOk, assetsOk, timeOk };
}

// --- visitor emails (no dashes, professional tone) -------------------
function bookedEmail(c) {
  const book = TIDYCAL_URL
    ? `If you have not picked a time yet, you can do that here: ${TIDYCAL_URL}`
    : 'We will reach out within one business day to find a time that works.';
  return {
    subject: 'Your call with Skyview Financial Group',
    text: `Hi ${c.first},

Thank you for answering a few questions about your company stock. Based on what you shared, a conversation makes sense.

${book}

Before we talk, it helps to have your most recent equity award statement from your stock plan portal (Fidelity, Schwab, E*TRADE or Morgan Stanley). There is no need to send it ahead.

On the call we will look at your grants and vest schedule, the tax picture for this year and next, and two or three ways to reduce your concentration over time. There is no cost and nothing to sign.

If anything changes, just reply to this email.

${SIGNATURE}
`,
  };
}

function readingEmail(c) {
  return {
    subject: 'Your reading list on company stock',
    text: `Hi ${c.first},

Thank you for your interest. Here are the pieces our clients find most useful when they start thinking about their company stock:

${READING.map(([t, u]) => `${t}\n${u}`).join('\n\n')}

When the timing is right for a conversation, reply to this email and we will set up a call.

${SIGNATURE}
`,
  };
}

// --- Alex's notification with the pre-call briefing ------------------
const OPEN = {
  'Reduce my single stock risk': (a) => `Open with the number: "You said roughly ${a.conc.toLowerCase()} of your net worth is in one company. Walk me through how it got there." Let them tell the vesting story before strategy.`,
  'Manage taxes on vesting or exercise': () => 'Open with April: "Did last year\'s RSU vests leave you owing at tax time?" Withholding at 22% in a higher bracket is the fastest way to show value.',
  'Plan around a departure, acquisition or IPO': () => 'Open with the date: "Is there a date driving this, and what happens to unvested grants on that date?" Deadlines create urgency on their own; do not add any.',
  'Retire earlier or on my own terms': () => 'Open with the finish line: "If the stock were already diversified, what year would you stop working?" Then work back to a selling schedule.',
};

function briefing(a, c, q) {
  const has = (p) => a.holdings.some((h) => h.startsWith(p));
  const objections = [];
  if (a.conc === '25% to 50%' || a.conc === 'Over 50%') objections.push('"I don\'t want to pay the tax." Show the tax as a range spread over several years next to the cost of a 30% drawdown. Choosing when to pay, not whether.');
  objections.push('"The stock has done well, I believe in the company." Agree. The question is how much of the family\'s future depends on it. Suggest a schedule that keeps a meaningful stake.');
  if (has('Stock options')) objections.push('"I\'ll exercise when the price is higher." Walk through expiration dates and AMT exposure on ISOs. Waiting is a decision with its own risk.');
  if (has('RSUs')) objections.push('"My company plan handles it." The plan administrator executes trades; it does not plan taxes, sequencing or the rest of the balance sheet.');
  objections.push('"What do you charge?" Answer directly with the fee schedule. Fee only, no commissions.');

  const before = [
    `Check Advyzon: confirm ${c.company || 'this person'} is not an existing client or household.`,
    `Pull ${c.company || 'the company'}'s trading window, recent stock performance and any deal or layoff news.`,
  ];
  if (has('Stock options')) before.push('Have the ISO vs NQSO tax comparison ready, including AMT exposure.');
  if (c.state === 'Other') before.push('Out of footprint: confirm notice filing status for their state before giving advice.');
  if (c.sms) before.push('Opted in to a text reminder: text 2 hours before from the work number. "Reply YES to confirm."');

  return [
    `FIT: ${q.qualified ? 'QUALIFIED' : 'NOT QUALIFIED'} (intent ${q.intentOk ? 'yes' : 'no'}, assets ${q.assetsOk ? 'ok' : 'below $1M'}, timeline ${q.timeOk ? 'ok' : 'too far out'})`,
    '',
    `Name: ${c.first} ${c.last}`,
    `Email: ${c.email}`,
    `Phone: ${c.phone || 'not given'}${c.sms ? ' (text reminders OK)' : ''}`,
    `State: ${c.state}`,
    `Company: ${c.company || 'not given'}`,
    '',
    `Wants a plan soon: ${a.intent}`,
    `Holdings: ${a.holdings.join(', ') || 'skipped'}`,
    `Concentration: ${a.conc || 'skipped'}`,
    `Investable assets: ${a.assets || 'skipped'}`,
    `Timeline: ${a.timeline || 'skipped'}`,
    `Top priority: ${a.goal || 'skipped'}`,
    ...(q.qualified ? [
      '',
      'BEFORE THE CALL',
      ...before.map((b) => `- ${b}`),
      '',
      'HOW TO OPEN',
      (OPEN[a.goal] || OPEN['Reduce my single stock risk'])(a),
      '',
      'LIKELY OBJECTIONS',
      ...objections.map((o) => `- ${o}`),
      '',
      'LANGUAGE',
      'Use: "a written selling schedule", "spread the tax across years", "keep a meaningful stake".',
      'Avoid: "sell everything", price predictions, "guarantee" or "risk free", criticizing their employer plan.',
      '',
      'QUESTIONS TO ASK',
      '1. When are your next three vest dates, and roughly how many shares?',
      '2. What is your cost basis on the shares you already hold?',
      '3. Are you subject to a trading window or preclearance?',
      '4. Who else is involved: spouse, CPA, estate attorney?',
      '5. What would "this worked" look like a year from now?',
      '',
      'CLOSE',
      'Offer a concentration analysis: two or three selling schedules with estimated taxes, reviewed in a second meeting within two weeks. Book it before ending the call.',
    ] : []),
  ].join('\n');
}

// --- handler ---------------------------------------------------------
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let d = req.body;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } }
  d = d || {};

  if (clean(d.website_url)) return res.status(200).json({ ok: true, qualified: false }); // honeypot

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return res.status(429).json({ error: 'Too many submissions. Please try again in a minute.' });

  const ai = d.answers || {};
  const ci = d.contact || {};
  const a = {
    intent: pick(OPTIONS.intent, ai.intent),
    holdings: (Array.isArray(ai.holdings) ? ai.holdings : []).filter((h) => OPTIONS.holdings.includes(h)),
    conc: pick(OPTIONS.conc, ai.conc),
    assets: pick(OPTIONS.assets, ai.assets),
    timeline: pick(OPTIONS.timeline, ai.timeline),
    goal: pick(OPTIONS.goal, ai.goal),
  };
  const c = {
    first: clean(ci.first, 60), last: clean(ci.last, 60),
    email: clean(ci.email, 160).toLowerCase(), phone: clean(ci.phone, 40),
    state: pick(STATES, ci.state), company: clean(ci.company, 120), sms: ci.sms === true && !!clean(ci.phone, 40),
  };
  const utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map((k) => `${k.slice(4)}=${clean(d[k], 100) || 'none'}`).join(' ');

  if (!a.intent) return res.status(400).json({ error: 'Please answer the first question.' });
  if (!c.first || !c.last || !isEmail(c.email) || !c.state) return res.status(400).json({ error: 'Please check your name, email and state.' });

  const q = qualify(a);
  const visitor = q.qualified ? bookedEmail(c) : readingEmail(c);

  try {
    await sendEmail({ from: FROM, to: [c.email], bcc: [ARCHIVE], reply_to: REPLY_TO, subject: visitor.subject, text: visitor.text });
  } catch (err) {
    console.error('[qualify] visitor email failed', err.message);
    try {
      await sendEmail({ from: FROM, to: [ARCHIVE], reply_to: REPLY_TO,
        subject: `ACTION NEEDED: stock review email failed, ${c.first} ${c.last}`,
        text: `The confirmation to ${c.email} did NOT send. Follow up by hand.\n\nError: ${err.message}\n\n${briefing(a, c, q)}\n` });
    } catch (e) { console.error('[qualify] alert also failed', e.message); }
    // Still let a qualified visitor book: the lead is captured in the alert.
  }

  try {
    await sendEmail({ from: FROM, to: [ARCHIVE], reply_to: c.email,
      subject: `${q.qualified ? 'Stock review QUALIFIED' : 'Stock review (reading list)'}: ${c.first} ${c.last}${c.company ? ', ' + c.company : ''}`,
      text: `${briefing(a, c, q)}\n\nSource: ${clean(d.source, 200) || 'direct'}\nUTM: ${utm}\nReceived: ${new Date().toISOString()}\n` });
  } catch (err) {
    console.error('[qualify] notification failed', err.message);
  }

  return res.status(200).json({ ok: true, qualified: q.qualified });
};
