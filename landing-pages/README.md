# Campaign landing pages

Two pages per company, generated on every Vercel deploy by `build.js`:

- `skyviewfg.com/<slug>-equity-compensation-webinar` (registration)
- `skyviewfg.com/<slug>-equity-compensation-guide` (PDF guide)

Nothing in `/lp/` is committed; it is rebuilt from the configs below.

## Launch a new company (every cycle)

1. In `campaigns/`, copy `jabil.js` to `<company>.js`.
2. Change `COMPANY_NAME` and `TICKER` (and `SLUG` if you want a shorter URL).
3. Set `SESSIONS` once dates are confirmed.
4. In Formspree, create two forms ("Webinar LP - <Company>", "Guide LP - <Company>")
   and paste their IDs into `FORMSPREE`. On each:
   - Settings → CAPTCHA → Turnstile, same custom key as "Skyview Contact".
   - Guide form only: Workflow → Add New → Auto Response, with the download
     link (see below). Requires the Formspree Professional plan.
5. Commit on a branch. Check the Vercel preview, then merge.

Only want one of the two pages for a company? Leave the other key out of
`FORMSPREE`. To retire a company, delete its campaign file.

## Production safety

Previews build everything. Production builds skip, with a warning in the
Vercel build log:

- a webinar page whose `SESSIONS` still contain "TBD"
- a guide page whose PDF is not in the repo

A skipped page returns 404 instead of going live half-finished.

## The guide PDF

- Repo path: `guides/understanding-your-equity-compensation.pdf`
- Public URL: `https://skyviewfg.com/guides/understanding-your-equity-compensation.pdf`
  (served with `X-Robots-Tag: noindex`, so search engines don't list it)
- The page never shows this link. Formspree's autoresponse emails it to the
  address the visitor submitted.

Suggested autoresponse (per guide form):

> Subject: Your equity compensation guide
>
> Thanks for requesting Understanding Your Equity Compensation.
> Download the PDF here:
> https://skyviewfg.com/guides/understanding-your-equity-compensation.pdf
>
> Skyview Financial Group, LLC · Ponte Vedra Beach, FL
> This guide is educational and is not individualized advice. Skyview
> Financial Group does not prepare or file tax returns.

## Files

| File | What it holds |
|---|---|
| `campaigns/*.js` | Per-company values. The only file you edit per cycle. |
| `offers/webinar.js` | Webinar copy: headline, agenda, 4-field form, confirmation. |
| `offers/guide.js` | Guide copy: headline, contents, 2-field form, PDF path. |
| `shared.js` | Speaker, trust row, SEC disclosure, GA4 ID. Same on every page. |
| `lp.css`, `lp.js` | Styles and form handling, inlined into each page. |
| `build.js` | Generator. No dependencies. `node landing-pages/build.js` |

## Tracking

- Hidden form fields: `campaign` (page slug) and `source` (utm_source /
  utm_medium / utm_campaign, or referrer). Both appear on each Formspree
  submission.
- GA4 (`G-Y6W2EPLT4R`): page views plus `generate_lead` on each successful
  submit, with `lead_type` (webinar / guide), `campaign_slug` and
  `session_choice`. Mark `generate_lead` as a key event in GA4.
