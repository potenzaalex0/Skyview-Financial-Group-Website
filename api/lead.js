/* =====================================================================
   Campaign form handler — webinar registrations and guide downloads.

   One function, two form types. The landing pages POST JSON here; this
   sends the visitor their email through Resend and notifies Alex. The
   contact page is NOT handled here — it stays on Formspree.

   Campaign data (company name, session list, Teams links, PDF path) comes
   from api/_campaigns.json, which landing-pages/build.js generates from the
   campaign configs on every deploy. The Teams join links live server-side
   on purpose: they are never in the page HTML, so a link cannot be picked
   up without registering.

   Env: RESEND_API_KEY (added by the Vercel Resend integration).
   ===================================================================== */
'use strict';

let CAMPAIGNS = {};
try {
  CAMPAIGNS = require('./_campaigns.json');
} catch (e) {
  console.error('[lead] api/_campaigns.json missing — run landing-pages/build.js');
}

const FROM = 'Alex Potenza | Skyview Financial Group <guides@mail.skyviewfg.com>';
const REPLY_TO = 'ajpotenza@skyviewfg.com';
const ARCHIVE = 'ajpotenza@skyviewfg.com'; // BCC on every visitor email + notifications
const SITE = 'https://skyviewfg.com';

const SIGNATURE = [
  'Alex Potenza, CFP®, CPWA®',
  'Skyview Financial Group',
  '816 A1A North, Suite 205, Ponte Vedra Beach, FL 32082',
  '(888) 406-0444',
].join('\n');

// --- helpers ---------------------------------------------------------
const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'there';
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
const clean = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max || 200);

// 'Wednesday, October 14, 2026 · 12:00 PM ET' -> { day, time }
function splitSession(when) {
  const parts = String(when || '').split('·');
  return {
    day: (parts[0] || '').trim(),
    time: (parts[1] || '').replace(/\bET\b/i, '').trim(),
  };
}

// Best-effort flood control per warm instance. Not a substitute for the
// honeypot; it just blunts a burst from one address.
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
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend ${res.status}: ${body.slice(0, 500)}`);
  return body;
}

// If anything fails, Alex needs to know — a guide that silently never
// arrives is worse than a form that errors.
async function alertAlex(subject, text) {
  try {
    await sendEmail({ from: FROM, to: [ARCHIVE], reply_to: REPLY_TO, subject, text });
  } catch (e) {
    console.error('[lead] ALERT EMAIL ALSO FAILED:', e.message);
  }
}

// --- email bodies ----------------------------------------------------
function webinarEmail(d, campaign, session) {
  const { day, time } = splitSession(session && session.when);
  const join = session && session.teams
    ? `Join here: ${session.teams}`
    : 'Your joining link follows in a separate email shortly — we are finalizing the room for this session.';

  return {
    subject: `You're registered — ${campaign.company} equity compensation`,
    text: `${firstName(d.name)} —

You're registered for ${day} at ${time} Eastern.

${join}

No Microsoft account needed and nothing to download. You won't be seen
or heard, and you won't see who else is attending — it's a private room.

Questions go through the Q&A panel during the session.

Every attendee gets a complimentary written analysis of their own equity
grants afterward. No cost, no obligation.

${SIGNATURE}
`,
  };
}

function guideEmail(d, campaign) {
  return {
    subject: 'Your equity compensation guide',
    text: `${firstName(d.name)} —

Here's the guide: ${SITE}${campaign.pdf}

Nine pages on how RSUs are taxed, where the withholding gap comes from,
and what to do about a concentrated position. There's a worksheet on
page 8 — about fifteen minutes, and it's the fastest way to see your
whole position in one place.

If anything in it raises a question, just reply to this email.

${SIGNATURE}
`,
  };
}

function notification(d, campaign, kind, sessionWhen) {
  const lines = [
    `Type: ${kind === 'webinar' ? 'Webinar registration' : 'Guide download'}`,
    `Company: ${campaign.company}`,
    `Page: ${SITE}/${d.campaign}`,
    '',
    `Name: ${d.name}`,
    `Email: ${d.email}`,
  ];
  if (kind === 'webinar') {
    lines.push(`Phone: ${d.phone || '—'}`, `Employer: ${d.employer || '—'}`, `Session: ${sessionWhen || '—'}`);
  }
  lines.push(`Source: ${d.source || 'direct'}`, `Received: ${new Date().toISOString()}`);
  return {
    subject: `${kind === 'webinar' ? 'Webinar registration' : 'Guide request'}: ${campaign.company} — ${d.name}`,
    text: lines.join('\n') + '\n',
  };
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

  // Honeypot: a bot fills every field it finds. Look successful, send nothing.
  if (clean(d.website_url) || clean(d._gotcha)) return res.status(200).json({ ok: true });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return res.status(429).json({ error: 'Too many submissions. Please try again in a minute.' });

  const kind = clean(d.type, 20);
  const campaign = CAMPAIGNS[clean(d.campaign, 120)];
  d = {
    campaign: clean(d.campaign, 120),
    name: clean(d.name, 120),
    email: clean(d.email, 160).toLowerCase(),
    phone: clean(d.phone, 40),
    employer: clean(d.employer, 120),
    session: clean(d.session, 120),
    source: clean(d.source, 200),
  };

  if (!campaign || (kind !== 'webinar' && kind !== 'guide') || campaign.type !== kind) {
    return res.status(400).json({ error: 'Unknown campaign.' });
  }
  if (!d.name || !isEmail(d.email)) {
    return res.status(400).json({ error: 'Please check your name and email address.' });
  }

  let session = null;
  if (kind === 'webinar') {
    session = (campaign.sessions || []).find((s) => s.when === d.session);
    if (!session) return res.status(400).json({ error: 'Please choose one of the listed sessions.' });
  }

  const visitor = kind === 'webinar' ? webinarEmail(d, campaign, session) : guideEmail(d, campaign);

  // 1. The visitor's email. This is the one that must not fail silently.
  try {
    await sendEmail({
      from: FROM,
      to: [d.email],
      bcc: [ARCHIVE],
      reply_to: REPLY_TO,
      subject: visitor.subject,
      text: visitor.text,
    });
  } catch (err) {
    console.error('[lead] send failed', { campaign: d.campaign, kind, email: d.email, err: err.message });
    await alertAlex(
      `ACTION NEEDED: ${kind} email failed — ${campaign.company}`,
      `A ${kind} submission came in but the email to the visitor did NOT send.\n\n` +
        `Name: ${d.name}\nEmail: ${d.email}\n` +
        (kind === 'webinar' ? `Session: ${d.session}\nPhone: ${d.phone}\nEmployer: ${d.employer}\n` : '') +
        `Page: ${SITE}/${d.campaign}\n\nError: ${err.message}\n\nFollow up with them by hand.\n`
    );
    return res.status(502).json({ error: 'We could not send your email just now. Please email ajpotenza@skyviewfg.com and we will send it straight over.' });
  }

  // 2. Alex's notification. A failure here must not fail the visitor's request.
  try {
    const note = notification(d, campaign, kind, d.session);
    await sendEmail({ from: FROM, to: [ARCHIVE], reply_to: d.email, subject: note.subject, text: note.text });
  } catch (err) {
    console.error('[lead] notification failed', err.message);
  }

  if (kind === 'webinar' && session && !session.teams) {
    await alertAlex(
      `Teams link missing — ${campaign.company} (${d.session})`,
      `${d.name} registered for ${d.session} but that session has no Teams link in its campaign config,\n` +
        `so the confirmation went out promising the link separately. Send it by hand and add it to\n` +
        `landing-pages/campaigns/*.js so the next registration carries it.\n\n` +
        `Their email: ${d.email}\n`
    );
  }

  return res.status(200).json({ ok: true });
};
