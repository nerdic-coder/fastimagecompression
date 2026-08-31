# FastImageCompression marketing register

This is the source of truth for marketing/distribution channels. The daily marketing cron must read this file before recommending a channel or creating a draft.

## Status definitions

- `planned` — a possible channel has been researched, but no submission or post has been made.
- `submitted` — a submission/post was sent and is awaiting review or publication.
- `approved/live` — the product listing or post is publicly available.
- `needs-update` — an existing listing/post should be corrected or refreshed.
- `rejected` — the channel or attempt was rejected; do not recommend again unless circumstances change.
- `blocked` — action cannot currently be completed because of access, authentication, or platform limitations.
- `hold` — potentially relevant, but current evidence or an important decision is missing.

## Register

| Platform/service | Type | Status | Listing/post URL | Submission URL | Date recorded | Last verified | Next action / notes |
|---|---|---|---|---|---|---|---|
| SaaSHub | Product directory | approved/live | https://www.saashub.com/fastimagecompression-com | https://www.saashub.com/services/submit | 2026-08-21 | 2026-08-23 | Listing is live and approved/nominated. Check copy before reusing it elsewhere. |
| Product Hunt | Launch platform | blocked | https://www.producthunt.com/@nerdic_coder | https://www.producthunt.com/posts/new | 2026-08-21 | 2026-08-26 | Official launch route still presents Cloudflare verification in this environment; existing access limitation remains unresolved. Do not recommend another submission attempt until access is granted. Draft exists at `2026-08-21/product-hunt.md`. |
| MicroLaunch | Launch platform | submitted | — | https://tally.so/r/mYaR6N | 2026-08-22 | 2026-08-24 | Submitted successfully through the free/basic route for Fast Image Compression. Confirmation shown: “Congratulations, your product has been submitted”; launch instructions will be emailed to johan@nerdic-coder.com. No paid placement selected. Draft: `2026-08-22/microlaunch.md`. |
| DEV Community `#showdev` | Developer community | approved/live | https://dev.to/nerdiccoder/i-built-a-browser-local-image-compressor-with-target-size-and-batch-workflows-4gbe | https://dev.to/new | 2026-08-22 | 2026-08-24 | Article is publicly published: “I Built a Browser-Local Image Compressor with Target Size and Batch Workflows”. |
| AlternativeTo | Product directory | hold | — | https://alternativeto.net/about/terms/ | 2026-08-21 | 2026-08-26 | Official site and guessed add-software route present Cloudflare verification in this environment; no current add-software workflow or pricing was verified. Do not guess a submission URL or current pricing. |
| Uneed | Launch platform | hold | — | https://www.uneed.best/submit-a-tool | 2026-08-21 | 2026-08-25 | Current submission page allows URL preview/product saving, but the official guide says the free waiting line is closed. Launch scheduling is currently Fast-track $14.99 or Skip the Line $29.99; no paid placement is authorized. Manual draft: `2026-08-25/uneed.md`. |
| Hacker News / Show HN | Developer community | rejected | — | https://news.ycombinator.com/submit | 2026-08-21 | 2026-08-24 | User decided this channel is not a good fit; do not recommend or prepare a Show HN submission unless circumstances change. Draft: `2026-08-21/show-hn.md`. |
| Indie Hackers | Founder community | approved/live | https://www.indiehackers.com/post/now-compress-multiple-files-Xsmy9CIYF9YhMKA7jK7L | — | 2026-08-21 | 2026-08-24 | FastImageCompression is already added as a product on the user's Indie Hackers profile. Public news item “Now compress multiple files!” verified; it links to FastImageCompression.com and is posted under the Fast Image Compression product. |
| Lobsters | Developer community | rejected | — | https://lobste.rs/about | 2026-08-23 | 2026-08-23 | Do not recommend a generic product promotion; self-promotion policy and participation requirements make it unsuitable for now. |
| Reddit | Social/community | hold | — | — | 2026-08-23 | 2026-08-23 | No subreddit recommendation until current official rules are accessible and a specific community is verified. |
| Sidebar | Newsletter/community | hold | — | https://sidebar.io/submit | 2026-08-22 | 2026-08-23 | Hold pending confirmation that the product meets the launch-age/prior-exposure condition. |
| Peerlist Launchpad | Launch platform | hold | — | https://peerlist.io/launchpad | 2026-08-22 | 2026-08-26 | Official launchpad page is behind Cloudflare verification from this environment. Profile/project requirements, reach, and any verification cost remain unconfirmed. |
| Launching Next | Startup/project directory | submitted | — | https://www.launchingnext.com/submit/ | 2026-08-24 | 2026-08-24 | Submitted successfully via the free route. Confirmation says status is “In Queue (Estimated Wait: 4 Months)”. The optional $99 fast-track upgrade was not purchased. No newsletter opt-in selected. Draft: `2026-08-24/launching-next.md`. |
| Frontend Focus | Newsletter | rejected | — | https://frontendfoc.us/submit | 2026-08-22 | 2026-08-23 | Former public submission endpoint returned 404; no transparent current route verified. |
| Web Designer News | Community/news site | rejected | — | https://webdesignernews.com/submit-story/ | 2026-08-22 | 2026-08-23 | No usable, verifiable submission mechanics found. |
| BetaList | Launch platform | hold | — | https://betalist.com/submit | 2026-08-26 | 2026-08-26 | Official site exposes a “Submit Startup” route, but it redirects to sign-in; current price, review criteria, and fit for an already-launched browser utility were not verified. Do not create an account or recommend submission yet. |
| Dev Hunt | Developer-tool directory | rejected | — | https://devhunt.org/submit | 2026-08-26 | 2026-08-26 | Official navigation describes Dev Hunt as a launchpad for dev tools, but the public submission route returned 404 and Fast Image Compression is a general browser utility rather than a developer tool. |
| SideProjectors | Side-project marketplace/community | hold | — | https://www.sideprojectors.com/project/submit | 2026-08-27 | 2026-08-27 | Official site describes a marketplace to sell, buy, and showcase side projects. The public route is an application shell and did not expose current listing requirements, review process, or cost without account interaction. Audience is more founders/acquirers than image-tool users; hold pending a deliberate showcase objective and manual verification. |
| Startup Stash | Startup tool directory | planned | — | https://startupstash.com/add-listing/ | 2026-08-28 | 2026-08-28 | Relevant Design-category directory for startup users. Public Typeform requests business contact details, product name, short and long descriptions, URL, logo, optional video, and advertising interest. The confirmation text indicates editorial follow-up; no listing fee was displayed, but free submission was not explicitly promised. Draft: `2026-08-28/startup-stash.md`. |
| Web Tools Weekly | Developer newsletter | planned | — | https://webtoolsweekly.com/submit | 2026-08-21 | 2026-08-29 | Official submission page accepts web apps useful to web developers or designers via one X DM or Bluesky chat. Issue #684 (2026-08-27) confirms the newsletter is active and currently features browser-local image/media tools. Editorial suggestions are distinct from sponsorship; no editorial fee is stated. Human-send only. Existing draft: `2026-08-21/web-tools-weekly.md`. |
| Fazier | Launch platform | hold | — | https://fazier.com/submit | 2026-08-30 | 2026-08-30 | Relevant and active, but the free Basic route requires a Fazier backlink badge on the product homepage/footer; adding it is outside this cron's authorized scope. Displayed paid routes are Lite $29, Premium $49, and Super $149, with no spend authorized. Account required; official guide lists name, tagline, description, category, thumbnail, gallery, and pricing. Draft: `2026-08-30/fazier.md`. |
| CSS Weekly | Frontend newsletter | hold | — | https://css-weekly.com/contact | 2026-08-31 | 2026-08-31 | Official contact page invites links to a blog post, article, or video; archive covers frontend tools, image formats, and performance. Hold until the existing Core Web Vitals image guide is strengthened and the newsletter's current cadence is rechecked: newest publicly visible issue found was #639 on 2026-04-23. Draft: `2026-08-31/css-weekly.md`. |

## Update rules

1. Add or update an entry whenever a channel is researched, submitted to, published on, rejected, blocked, or verified live.
2. Normalize duplicate names and domains before adding a row. A platform's listing URL and submission URL belong to the same register entry.
3. Never overwrite an existing status with `planned` merely because a new draft was created.
4. Keep `blocked`, `hold`, and `rejected` entries visible so the cron does not repeatedly recommend them.
5. Use `last verified` whenever a live page, listing, rule, or access state is checked.
6. The cron may create drafts, but must not change a status to `submitted` or `approved/live` without evidence of an actual external action or publicly visible listing.
