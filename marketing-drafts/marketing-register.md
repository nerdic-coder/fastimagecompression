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
| Product Hunt | Launch platform | blocked | https://www.producthunt.com/@nerdic_coder | https://www.producthunt.com/posts/new | 2026-08-21 | 2026-08-23 | Existing account is redirected to the posting-access help article. Do not recommend another submission attempt until access is granted. Draft exists at `2026-08-21/product-hunt.md`. |
| MicroLaunch | Launch platform | submitted | — | https://tally.so/r/mYaR6N | 2026-08-22 | 2026-08-24 | Submitted successfully through the free/basic route for Fast Image Compression. Confirmation shown: “Congratulations, your product has been submitted”; launch instructions will be emailed to johan@nerdic-coder.com. No paid placement selected. Draft: `2026-08-22/microlaunch.md`. |
| DEV Community `#showdev` | Developer community | approved/live | https://dev.to/nerdiccoder/i-built-a-browser-local-image-compressor-with-target-size-and-batch-workflows-4gbe | https://dev.to/new | 2026-08-22 | 2026-08-24 | Article is publicly published: “I Built a Browser-Local Image Compressor with Target Size and Batch Workflows”. |
| AlternativeTo | Product directory | hold | — | https://alternativeto.net/about/terms/ | 2026-08-21 | 2026-08-23 | Current add-software route was inaccessible during verification. Do not guess a submission URL or current pricing. |
| Uneed | Launch platform | hold | — | https://www.uneed.best/submit-a-tool | 2026-08-21 | 2026-08-23 | Free queue is closed and paid scheduling was not justified. Do not recommend paid launch placement without a clear objective. |
| Hacker News / Show HN | Developer community | rejected | — | https://news.ycombinator.com/submit | 2026-08-21 | 2026-08-24 | User decided this channel is not a good fit; do not recommend or prepare a Show HN submission unless circumstances change. Draft: `2026-08-21/show-hn.md`. |
| Indie Hackers | Founder community | approved/live | https://www.indiehackers.com/post/now-compress-multiple-files-Xsmy9CIYF9YhMKA7jK7L | — | 2026-08-21 | 2026-08-24 | FastImageCompression is already added as a product on the user's Indie Hackers profile. Public news item “Now compress multiple files!” verified; it links to FastImageCompression.com and is posted under the Fast Image Compression product. |
| Lobsters | Developer community | rejected | — | https://lobste.rs/about | 2026-08-23 | 2026-08-23 | Do not recommend a generic product promotion; self-promotion policy and participation requirements make it unsuitable for now. |
| Reddit | Social/community | hold | — | — | 2026-08-23 | 2026-08-23 | No subreddit recommendation until current official rules are accessible and a specific community is verified. |
| Sidebar | Newsletter/community | hold | — | https://sidebar.io/submit | 2026-08-22 | 2026-08-23 | Hold pending confirmation that the product meets the launch-age/prior-exposure condition. |
| Peerlist Launchpad | Launch platform | hold | — | https://peerlist.io/launchpad | 2026-08-22 | 2026-08-23 | Requires a verified, complete profile/project; reach and any verification cost need confirmation. |
| Launching Next | Startup/project directory | submitted | — | https://www.launchingnext.com/submit/ | 2026-08-24 | 2026-08-24 | Submitted successfully via the free route. Confirmation says status is “In Queue (Estimated Wait: 4 Months)”. The optional $99 fast-track upgrade was not purchased. No newsletter opt-in selected. Draft: `2026-08-24/launching-next.md`. |
| Frontend Focus | Newsletter | rejected | — | https://frontendfoc.us/submit | 2026-08-22 | 2026-08-23 | Former public submission endpoint returned 404; no transparent current route verified. |
| Web Designer News | Community/news site | rejected | — | https://webdesignernews.com/submit-story/ | 2026-08-22 | 2026-08-23 | No usable, verifiable submission mechanics found. |

## Update rules

1. Add or update an entry whenever a channel is researched, submitted to, published on, rejected, blocked, or verified live.
2. Normalize duplicate names and domains before adding a row. A platform's listing URL and submission URL belong to the same register entry.
3. Never overwrite an existing status with `planned` merely because a new draft was created.
4. Keep `blocked`, `hold`, and `rejected` entries visible so the cron does not repeatedly recommend them.
5. Use `last verified` whenever a live page, listing, rule, or access state is checked.
6. The cron may create drafts, but must not change a status to `submitted` or `approved/live` without evidence of an actual external action or publicly visible listing.
