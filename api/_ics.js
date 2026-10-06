/* =====================================================================
   Calendar invite (.ics) for webinar registration confirmations.

   Everything comes from data, nothing per company is hardcoded here:
   - the session date/time is parsed from the session string the visitor
     picked (the same string as SESSIONS in the campaign config), e.g.
     "Tuesday, October 20, 2026 · 12:00 PM ET"
   - the company name comes from api/_campaigns.json
   - the Teams link comes from CAMPAIGN_TEAMS_LINKS (see api/lead.js)

   A new company or new session dates need no change in this file.

   METHOD:PUBLISH, not REQUEST: we don't track RSVPs through the calendar,
   and REQUEST makes Outlook/Gmail show Accept/Decline and send replies.
   The UID is derived from the campaign and session start, so it is the
   same for everyone in a session and identical on any resend: calendar
   apps update the existing event instead of adding a duplicate.

   Files prefixed with "_" in api/ are not deployed as functions, and
   vercel.json redirects /api/_* away, so this is not reachable by URL.
   ===================================================================== */
'use strict';

const TZID = 'America/New_York';
const DURATION_MINUTES = 60;
const ORGANIZER = { name: 'Alex R. Potenza', email: 'ajpotenza@skyviewfg.com' };
const ADDRESS = 'Skyview Financial Group, LLC\n816 A1A North, Suite 205, Ponte Vedra Beach, FL 32082';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const pad = (n) => String(n).padStart(2, '0');

// "Tuesday, October 20, 2026 · 12:00 PM ET" -> { y, m, d, hh, mm } (Eastern wall clock)
// Returns null if the string can't be read, so the caller sends the email
// without an invite rather than an invite at the wrong time.
function parseSession(when) {
  const s = String(when || '');
  const date = s.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  const time = s.match(/(\d{1,2}):(\d{2})\s*([AP])\.?M\.?/i);
  if (!date || !time) return null;
  const m = MONTHS.indexOf(date[1].toLowerCase()) + 1;
  if (!m) return null;
  let hh = Number(time[1]) % 12;
  if (time[3].toUpperCase() === 'P') hh += 12;
  return { y: Number(date[3]), m, d: Number(date[2]), hh, mm: Number(time[2]) };
}

function addMinutes(t, minutes) {
  // Wall-clock arithmetic in a UTC Date, so DST never shifts it.
  const x = new Date(Date.UTC(t.y, t.m - 1, t.d, t.hh, t.mm + minutes));
  return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate(), hh: x.getUTCHours(), mm: x.getUTCMinutes() };
}

const local = (t) => `${t.y}${pad(t.m)}${pad(t.d)}T${pad(t.hh)}${pad(t.mm)}00`;
const stampUTC = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// RFC 5545 text escaping.
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Fold at 75 octets without splitting a UTF-8 character.
function fold(line) {
  const out = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

// US Eastern rules since 2007. Outlook needs a VTIMEZONE for any TZID it
// doesn't map itself; including it makes the file correct everywhere.
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${TZID}`,
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0400',
  'TZNAME:EDT',
  'DTSTART:20070311T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:-0400',
  'TZOFFSETTO:-0500',
  'TZNAME:EST',
  'DTSTART:20071104T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

function description(company, link) {
  const join = link ? `Join here: ${link}` : 'Your join link will follow in a separate email.';
  return [
    `A complimentary session on equity compensation for ${company} employees.`,
    '',
    join,
    '',
    "No Microsoft account needed and nothing to download. You won't be seen or heard, and you won't see who else is attending.",
    '',
    'Questions go through the Q&A panel during the session.',
    '',
    'Every attendee receives a complimentary written analysis of their own equity grants afterward. No cost, no obligation.',
    '',
    ADDRESS,
  ].join('\n');
}

// Outlook renders X-ALT-DESC as the event body, which makes the join link
// a real clickable link rather than relying on auto-linking.
function htmlDescription(text, link) {
  const body = escHtml(text)
    .replace(link ? escHtml(link) : '\u0000', () => (link ? `<a href="${escHtml(link)}">${escHtml(link)}</a>` : ''))
    .split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  return `<!DOCTYPE HTML><html><body>${body}</body></html>`;
}

/**
 * Build the invite for one session.
 * @returns {{ filename: string, content: string } | null}  null if the session can't be parsed
 */
function buildInvite({ campaignId, company, session, link, now = new Date() }) {
  const start = parseSession(session);
  if (!start) return null;
  const end = addMinutes(start, DURATION_MINUTES);
  const title = `Equity Compensation for ${company} Employees`;
  const text = description(company, link);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Skyview Financial Group//Campaign Webinars//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...VTIMEZONE,
    'BEGIN:VEVENT',
    `UID:${campaignId}-${local(start)}@skyviewfg.com`,
    'SEQUENCE:0',
    `DTSTAMP:${stampUTC(now)}`,
    `DTSTART;TZID=${TZID}:${local(start)}`,
    `DTEND;TZID=${TZID}:${local(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(link || 'Microsoft Teams (link to follow by email)')}`,
    ...(link ? [`URL:${link}`] : []),
    `DESCRIPTION:${esc(text)}`,
    `X-ALT-DESC;FMTTYPE=text/html:${esc(htmlDescription(text, link))}`,
    `ORGANIZER;CN=${esc(ORGANIZER.name)}:mailto:${ORGANIZER.email}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'X-MICROSOFT-CDO-BUSYSTATUS:BUSY',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)} starts tomorrow`,
    'TRIGGER:-PT24H',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)} starts in 15 minutes`,
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const month = MONTHS[start.m - 1].slice(0, 3);
  return {
    filename: `skyview-equity-comp-${month}-${start.d}.ics`,
    content: lines.map(fold).join('\r\n') + '\r\n',
  };
}

module.exports = { buildInvite, parseSession };
