# Campaign landing pages

One page per company, generated on every Vercel deploy by `build.js`.
Nothing in `/lp/` is committed; it is rebuilt from the configs below.

## Launch a new company (every cycle)

1. In `campaigns/`, copy `company-name.js` to `<company>.js`.
2. Change `COMPANY_NAME` and `TICKER`.
3. Update `SESSIONS` (the three date/time options).
4. Create a new form in Formspree, paste its ID into `FORMSPREE_ID`.
   In that form's Settings → CAPTCHA, choose Turnstile and use the same
   custom key as the "Skyview Contact" form.
5. Commit on a branch. Check the Vercel preview, then merge.

Live URL: `skyviewfg.com/<slug>-equity-compensation-webinar`
(slug = company name lowercased and hyphenated, or set `SLUG`).

To retire a page, delete its campaign file.

## Files

| File | What it holds |
|---|---|
| `campaigns/*.js` | Per-company values. The only file you edit per cycle. |
| `offers/webinar.js` | Webinar copy: headline, agenda, form fields, confirmation. |
| `shared.js` | Speaker, trust row, SEC disclosure, GA4 ID. Same on every page. |
| `lp.css`, `lp.js` | Styles and form handling, inlined into each page. |
| `build.js` | Generator. No dependencies. `node landing-pages/build.js` |

## Adding the PDF-guide offer

Create `offers/guide.js` modelled on `offers/webinar.js` with
`urlSuffix: 'equity-compensation-guide'`, `fields: ['name', 'email']`,
`showSessions: false`, and a success message that links the PDF.
Then set `OFFER: 'guide'` in a campaign file. The URL rewrite for
`-equity-compensation-guide` is already in `vercel.json`.

## Tracking

- Hidden form fields: `campaign` (page slug) and `source` (utm_source /
  utm_medium / utm_campaign, or referrer). Both appear on each Formspree
  submission.
- GA4 (`G-Y6W2EPLT4R`, the site's existing property): page views plus a
  `generate_lead` event on successful registration, with `campaign_slug` and
  `session_choice` parameters. Mark `generate_lead` as a key event in GA4.
