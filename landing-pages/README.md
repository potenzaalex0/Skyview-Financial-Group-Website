# Campaign landing pages

Two pages per company, generated on every Vercel deploy by `build.js`:

- `skyviewfg.com/<slug>-equity-compensation-webinar` (registration)
- `skyviewfg.com/<slug>-equity-compensation-guide` (PDF guide)

Nothing in `/lp/` is committed; it is rebuilt from the configs below.

Both forms post to `/api/lead`, our own serverless function, which sends the
visitor's email through Resend. **The contact page is not part of this system
— it runs on Formspree and stays there.**

## Launch a new company (every cycle)

1. In `campaigns/`, copy `jabil.js` to `<company>.js`.
2. Change `COMPANY_NAME` and `TICKER` (and `SLUG` if you want a shorter URL).
3. Set `SESSIONS` once dates are confirmed.
4. Add that campaign's Teams join links to `CAMPAIGN_TEAMS_LINKS` in Vercel
   (see below). Not to the config file.
5. Drop the guide PDF in `guides/` (see below).
6. Commit on a branch. Check the Vercel preview, then merge.

No forms to create, no endpoints to paste — that was the Formspree way and it
is gone. Want only one of the two pages? Drop the other from `OFFERS`. To
retire a company, delete its campaign file.

## Emails

`api/lead.js` owns both emails. It reads `api/_campaigns.json`, which
`build.js` regenerates on every build from the campaign configs.

| | |
|---|---|
| From | `Alex Potenza \| Skyview Financial Group <guides@mail.skyviewfg.com>` |
| Reply-to | `ajpotenza@skyviewfg.com` |
| BCC | `ajpotenza@skyviewfg.com` — compliance archive, on every visitor email |
| Format | Plain text. No HTML, no images, no tracking pixels. |

Env vars: `RESEND_API_KEY` (set by the Vercel Resend integration) and
`CAMPAIGN_TEAMS_LINKS` (below).

Sending domain is `mail.skyviewfg.com`, deliberately a subdomain: the root
domain carries client statements and does not share its reputation with a
third-party sender.

## Teams join links

**They live in Vercel, not in this repo.** `vercel.json` sets the output
directory to the repo root, so everything committed here is readable at a
URL — `skyviewfg.com/landing-pages/campaigns/jabil.js` and so on. A join link
anyone can read without registering is worthless, so it is treated as a
secret and kept with the API key.

Vercel project → Settings → Environment Variables → `CAMPAIGN_TEAMS_LINKS`:

```json
{
  "jabil-equity-compensation-webinar": [
    "https://teams.microsoft.com/l/...session-1",
    "https://teams.microsoft.com/l/...session-2",
    "https://teams.microsoft.com/l/...session-3"
  ],
  "roper-equity-compensation-webinar": ["...", "...", "..."]
}
```

One array per webinar campaign, keyed by page slug, in the **same order** as
`SESSIONS` in that campaign's config. The handler refuses to guess: if the
array is missing, malformed, or a different length from the session list, it
sends no link at all and emails you instead. A wrong link is worse than a
promised one. Redeploy after changing it — env vars are read at cold start.

`vercel.json` also redirects `/landing-pages/*`, `/api/_*` and the root
config files away, so the source is not casually readable. That is a patch,
not a fix: the real fix is a build that emits only the site into its own
output directory.

Nothing fails silently. If the visitor's email does not send, the page shows
the error, the function returns 502, and Alex gets an "ACTION NEEDED" email so
the lead can be followed up by hand. If a session has no Teams link, the
confirmation says the link follows separately and Alex gets told to send it.

## Production safety

Previews build everything. Production builds skip, with a warning in the
Vercel build log:

- a webinar page whose `SESSIONS` still contain "TBD"
- a guide page whose PDF is not in the repo
- guide pages, while `emailDeliveryLive` in `offers/guide.js` is `false`

A skipped page returns 404 instead of going live half-finished.

`emailDeliveryLive` stays `false` until the Resend domain is verified and a
live test email has actually arrived — the guide page tells visitors to check
their inbox, so it must not ship before the inbox part works.

## The guide PDF

One PDF per company, named to match the page:

- Repo path: `guides/<slug>-equity-compensation-guide.pdf`
  (e.g. `guides/jabil-equity-compensation-guide.pdf`)
- Public URL: `https://skyviewfg.com/guides/<slug>-equity-compensation-guide.pdf`
  (served with `X-Robots-Tag: noindex`, so search engines don't list it)
- The page never shows this link. It goes out by email to the address the
  visitor submitted.

## Files

| File | What it holds |
|---|---|
| `campaigns/*.js` | Per-company values. The only file you edit per cycle. |
| `offers/webinar.js` | Webinar copy: headline, agenda, 4-field form, confirmation. |
| `offers/guide.js` | Guide copy: headline, contents, 2-field form, PDF path. |
| `shared.js` | Speaker, trust row, SEC disclosure, GA4 ID. Same on every page. |
| `lp.css`, `lp.js` | Styles and form handling, inlined into each page. |
| `build.js` | Generator. No dependencies. `node landing-pages/build.js` |
| `../api/lead.js` | Form handler. Sends both emails through Resend. |
| `../api/_campaigns.json` | Generated by `build.js`. Do not edit by hand. |

## Tracking

- Hidden form fields: `campaign` (page slug), `type` (webinar / guide) and
  `source` (utm_source / utm_medium / utm_campaign, or referrer). All three
  appear on the notification email.
- GA4 (`G-Y6W2EPLT4R`): page views plus `generate_lead` on each successful
  submit, with `lead_type` (webinar / guide), `campaign_slug` and
  `session_choice`. Mark `generate_lead` as a key event in GA4.

## Spam

A honeypot field (`website_url`) on both forms, checked in the browser and
again in the function. No CAPTCHA on campaign pages, by design — every extra
step costs registrations. There is also a per-instance rate limit of 8
submissions a minute from one IP.
