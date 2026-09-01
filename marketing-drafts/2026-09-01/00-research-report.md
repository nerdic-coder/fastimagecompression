# Distribution research — 2026-09-01

> Drafts and recommendations only. No submission, publication, post, comment, message, account creation, authentication, payment, or other external marketing write action occurred.

## Product and repository facts rechecked

The live homepage and repository README were checked before assessing channels.

Safe product positioning remains:

- Fast Image Compression is a free browser-based image compressor.
- Selected image files are processed locally rather than uploaded to the application's server.
- The live UI supports multi-image selection and presents target-size, WordPress, privacy-sensitive, quality, format, preview, and download workflows.
- Keep privacy claims scoped to selected-image processing; the site also discloses GA4 usage.
- Avoid unsupported speed, quality-retention, percentage-saving, and universal browser/device claims.

A new distribution blocker was verified: GitHub reports `nerdic-coder/-fastimagecompression` as a **private** repository with no detected repository license, while `README.md` says the project is open source under MIT. Until the owner deliberately aligns repository visibility and licensing, marketing drafts must not call the project open source or offer it to open-source catalogs.

## New channel decisions

### OpenAlternative — `rejected`

- **Official scope:** https://openalternative.co/about
- **Submission route:** https://openalternative.co/submit
- **Evidence:** OpenAlternative describes itself as a community-driven list of open-source alternatives. Its ranking uses repository stars, forks, recency, and recent commits, and it supports public repository hosts including GitHub, GitLab, Codeberg, Bitbucket, and Gitee. Submission currently redirects to sign-in.
- **Decision:** Ineligible while the product repository is private. Reconsider only after public source and license expectations are deliberately resolved.

### Toolfolio — `rejected`

- **Official listing/pricing:** https://toolfolio.com/boosted-listing
- **Guidelines:** https://toolfolio.com/listing-guidelines
- **Evidence:** Design and Photography categories make the audience superficially relevant, but the visible submission link is a paid boosted listing: $99 one-time Startup, $250/month Growth or $2,500/year, with additional paid placement options.
- **Decision:** Reject. No transparent free editorial route was found, and no spend is authorized.

### Tiny Startups — `rejected`

- **Startup launch route:** https://www.tinystartups.com/submit
- **Tool-specific route:** https://www.tinystartups.com/submit-tool
- **Evidence:** The site distinguishes “Submit a Startup — Free” from “List a Tool — $49.” The startup page foregrounds pay-what-you-want ranking and a DR backlink, while Fast Image Compression fits the tool route more naturally.
- **Decision:** Reject as a paid/backlink-led placement rather than misclassifying the product to obtain the nominal free route.

### Resource.fyi — `rejected`

- **Official site/submission entry:** https://resource.fyi/
- **Evidence:** The directory has Design Tools, Developer Tools, Open Source, and Web Development categories, but clicking Submit exposes only Google/GitHub sign-in. Fields, cost, and review mechanics remain hidden. The public latest feed is very broad and most visible entries have zero votes.
- **Decision:** Reject for now; the expected signal does not justify account access or hidden submission mechanics.

### Web Design Weekly — `rejected`

- **Official contact page:** https://web-design-weekly.com/contact/
- **Official sitemap index:** https://web-design-weekly.com/sitemap_index.xml
- **Latest sitemap partition inspected:** https://web-design-weekly.com/post-sitemap23.xml
- **Evidence:** The contact page says it accepts link suggestions, but the current sitemap exposes thousands of near-identical “Easily Improve Your Web Design with AI” URLs, with sequential slugs generated roughly every 30 minutes through 2026-09-01.
- **Decision:** Reject until the publication is demonstrably healthy. Do not send a link into a site showing this automated-content anomaly.

### Codrops Webzibition — `rejected`

- **Official active gallery:** https://tympanus.net/codrops/webzibition/
- **Official submission/contact route:** https://tympanus.net/codrops/contact/
- **Evidence:** Webzibition is active and the contact form includes “I want to submit a project/website,” but the gallery explicitly curates hand-picked websites for visual inspiration. Current selections are visually distinctive portfolios, studios, campaigns, and experiential sites.
- **Decision:** Reject as a utility-distribution channel. Reconsider only if Fast Image Compression develops a genuinely noteworthy interface/design case study, not merely a product listing request.

## Draft decision

No new platform-specific submission copy was created today. None of the newly researched candidates passed the fit, transparency, and cost screen. Creating a polished draft for an ineligible, paid, low-signal, anomalous, or poor-fit channel would add review noise.

The existing `marketing-drafts/2026-08-21/copy-library.md` already contains conservative tagline, 50-word and long descriptions, feature bullets, keywords, local-processing language, and screenshot suggestions. Reuse it only after checking the destination's current field limits.

## SEO/content opportunity

Resolve the public-source contradiction before using “open source” as a trust or discovery angle:

1. Decide whether the repository should be publicly accessible.
2. If yes, expose the intended source and license in a deliberate release, then verify the public repository and license metadata.
3. If no, remove or narrow the README's open-source/MIT claims and keep directory copy silent on source availability.

Separately, the live homepage still contains broad claims such as “milliseconds,” “works perfectly on all devices,” “complete privacy protection,” and “without compromising quality.” Continue using the narrower copy library wording until those claims are supported or revised.

## Register changes

Added six normalized channels as `rejected`: OpenAlternative, Toolfolio, Tiny Startups, Resource.fyi, Web Design Weekly, and Codrops Webzibition. Existing `submitted`, `approved/live`, `blocked`, `hold`, and `planned` states were preserved.

## Recommended next actions

1. Prioritize the already-planned Web Tools Weekly editorial suggestion and Startup Stash listing before researching more generic catalogs.
2. Decide whether Fast Image Compression is intended to be publicly open source; align repository visibility, license metadata, and README language.
3. Improve the Core Web Vitals guide before reconsidering the existing CSS Weekly hold.
4. Do not spend on Toolfolio or Tiny Startups without a channel-specific budget and measurable acquisition objective.

All external interactions were read-only. No form values were entered and no external marketing action occurred.
