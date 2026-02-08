# Analytics Hardening Checklist (GA4)

Use this checklist to separate real usage from bot/noise traffic and track meaningful product outcomes.

## 1) Confirm key events are firing

Expected GA4 events from the app:

- `compress_click`
- `download_click`
- `download_all_click`
- `copy_results_text`
- `copy_link`

How to verify:

1. Open GA4 Realtime report
2. Perform one end-to-end flow on the site
3. Confirm each event appears at least once

## 2) Mark key events in GA4

In GA4 Admin -> Events, mark at least these as Key events:

- `compress_click`
- `download_click`

Recommended to also mark:

- `download_all_click`
- `copy_results_text`
- `copy_link`

## 3) Exclude internal/test traffic

Create GA4 internal traffic filters so team/dev sessions do not pollute data.

Suggested steps:

1. Define internal traffic rule (office/home/VPN IP ranges)
2. Enable internal traffic filter in GA4 Data settings
3. Re-check Realtime to confirm internal hits are excluded

## 4) Bot/noise triage playbook

When traffic spikes, check these in order:

1. **Acquisition -> Traffic acquisition**
   - Session source / medium
   - Watch for suspicious spikes in Direct
2. **Engagement quality**
   - Average engagement time per active user
   - Engaged sessions
   - Events per session
3. **Geo/tech anomalies**
   - One/few cities dominating
   - Highly uniform browser/version/device patterns
4. **Landing pages**
   - Real users usually hit multiple pages and trigger action events

### Likely noise indicators

- Average engagement near 0-5 seconds
- Almost all traffic is Direct with no action events
- No `compress_click`/`download_click` movement during traffic spikes

## 5) KPI definitions (monthly)

Track these monthly KPIs for business signal:

- **Visitors**: users / sessions
- **Activation**: `compress_click` count
- **Value action**: `download_click` + `download_all_click`
- **Share intent**: `copy_results_text` + `copy_link`
- **Activation rate**: `compress_click / users`
- **Download rate**: `(download_click + download_all_click) / compress_click`

## 6) Monthly reporting template

Use this template each month:

- Month:
- Total users:
- Total sessions:
- Compress clicks:
- Downloads (single + all):
- Copy actions (text + link):
- Activation rate:
- Download rate:
- Top source/medium:
- Top landing pages:
- Notes on anomalies/bot noise:
- Actions for next month:

## 7) Operational guardrails

- Do not make roadmap decisions from pageviews alone
- Prioritize changes that improve activation/download KPIs
- Keep a short changelog of analytics-related changes (event names, filters, definitions)
