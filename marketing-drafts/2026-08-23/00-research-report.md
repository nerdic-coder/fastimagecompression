# Distribution research — 2026-08-23

> Drafts and recommendations only. No submission, post, comment, account creation, authentication, payment, or external write action occurred.

## Product facts rechecked

Checked the live site, `README.md`, privacy policy, sitemap, and repository metadata on 2026-08-23.

Safe claims for current copy:

- Fast Image Compression is a free browser-based image compressor.
- Selected image files are processed locally in the browser rather than uploaded to the application's server.
- The README documents drag-and-drop upload, adjustable quality, previews, compression statistics, and JPEG/PNG/WebP output.
- The README documents JPEG, PNG, WebP, GIF, and BMP input, a 10 MB maximum file size, and browser-side HTML5 Canvas processing.
- The live homepage exposes guides for JPEG, PNG, GIF, WebP, target sizes, WordPress, email, and related image-optimization workflows.

Do not use without a fresh implementation test:

- “Fastest”, “milliseconds”, universal browser support, no quality loss, specific savings percentages, or “works offline” as a production guarantee.
- “No data collection” or “no tracking”: the live site loads GA4 and third-party fonts/CDN assets, and the privacy policy describes analytics/cookies.
- AVIF support as a product feature: it appears in the homepage meta description, but the README's documented output formats are JPEG, PNG, and WebP.
- A public open-source repository link: the live About page says the project is developed publicly, but the configured GitHub remote URL returned 404 during this check. Verify the canonical public repository before including it in listings.

## Current channel review

### Product Hunt — keep existing draft; current requirements rechecked

- **Guide:** https://www.producthunt.com/launch
- **Submission deep link:** https://www.producthunt.com/posts/new (do not authenticate or open the form in this cron run)
- **Fit:** Good if positioned as an available, useful browser tool with a clear local-processing differentiator.
- **Current publicly observed guide:** Product Hunt describes itself as a daily curation of new products and provides the launch guide; the live page was reachable, but the detailed form limits are client-rendered/authenticated.
- **Requirements to re-confirm manually:** personal account and current access rules; product URL; product name; short tagline; description; tags; square thumbnail; gallery images; optional video; first comment.
- **Cost:** The existing dated official evidence in `2026-08-21/product-hunt.md` records ordinary platform use as free. Re-check the authenticated flow before launch; this run did not infer advertising or promotion costs.
- **Approval:** Submission/listing access and homepage featuring are separate; featuring is reviewed and not guaranteed.
- **Recommendation:** Keep `2026-08-21/product-hunt.md` as the draft. Draft to the stricter 260-character description limit until the live form confirms otherwise.

### SaaSHub — recommended, existing draft remains usable

- **Submission:** https://www.saashub.com/services/submit
- **Fit evidence:** The official page exposes Product/Software Alternatives, Design Tools, and Developer Tools categories; image optimization is a plausible category to confirm in the live taxonomy.
- **Requirements observed:** product URL, relevant categories, honest competitors, and optional product-domain verification. The page explicitly says submissions without competitors are slowed and that submitted products go through an approval process.
- **Cost:** No submission fee was displayed on the public form. Premium placement is presented separately; do not treat it as required.
- **Approval:** Manual approval is explicitly stated on the current page.
- **Recommendation:** Use the existing copy in `2026-08-21/directory-listings.md`, but correct any claim of “no manual approval” if reused. Search for a duplicate before manual submission.

### AlternativeTo — hold; primary route still inaccessible

- **Policy:** https://alternativeto.net/about/terms/
- **Fit:** Strong conceptual fit as a free web alternative to Squoosh, TinyPNG/TinyJPG, Compressor.io, and similar tools.
- **Requirements/cost/approval:** The official terms URL and submit UI returned HTTP 403 in this environment. Existing draft evidence records a standard free community-submission route and optional paid priority review, but the current exact form, duplicate status, and checkout price were not reverified today.
- **Recommendation:** Keep on hold. Do not use a guessed deep link or claim current pricing/queue mechanics until the owner can inspect the authenticated/site UI manually.

### Uneed — not recommended for paid launch; free queue is closed

- **Submission:** https://www.uneed.best/submit-a-tool
- **Current launch guide:** https://www.uneed.best/launch.txt
- **Pricing:** https://www.uneed.best/pricing
- **Requirements observed:** real HTTP(S) custom-domain landing page; email OTP authentication is required for the API flow; product URL, name, and description are collected. The launch guide says the free waiting line is closed and that the available scheduled launch option is Skip the Waiting Line at $29.99. A product can be submitted without scheduling.
- **Approval:** The public launch guide documents product creation and scheduling but does not clearly establish editorial approval mechanics.
- **Recommendation:** Do not buy a launch slot for this product based on directory exposure alone. Keep the existing conditional draft in `2026-08-21/directory-listings.md`; manual review is required if an unscheduled listing has independent value.

### Hacker News — Show HN, conditional community opportunity

- **Guidelines:** https://news.ycombinator.com/showhn.html
- **Submit:** https://news.ycombinator.com/submit
- **Fit:** The tool is directly usable without signup, which matches Show HN's requirement that users can try the thing. However, HN says the project should be non-trivial, personally worked on, and something the maker is available to discuss.
- **Rules observed:** Title must begin with “Show HN”; do not ask friends to upvote or comment; landing pages and fundraisers are off-topic.
- **Recommendation:** Existing `2026-08-21/show-hn.md` is still the right draft. Only post when the maker can answer technical questions and can explain the implementation and trade-offs. Do not cross-post the same launch copy on the same day.

### Lobsters — do not recommend now

- **Guidelines:** https://lobste.rs/about
- **Fit:** Computing focus is relevant only if the post is about the implementation or a substantive technical lesson, not a generic product announcement.
- **Self-promotion rule:** The official guidelines say self-promotion should be less than a quarter of a user's stories and comments.
- **Recommendation:** No new draft. There is no evidence in this run that the owner has the participation history needed to make a self-promotional product post appropriate.

### Reddit — not included today

Official subreddit rules could not be fetched from Reddit's `/about/rules.json` endpoint in this environment (HTTP 403). Per the research policy, no subreddit is recommended and no Reddit copy is drafted from inferred or stale rules.

## New drafts created

- `marketing-drafts/2026-08-23/00-research-report.md` — current evidence, channel decisions, copy-safety corrections, and next actions.

No additional platform-specific draft was created because Product Hunt, SaaSHub, AlternativeTo, Uneed, Show HN, and MicroLaunch already have drafts in earlier dated folders, and the newly checked candidates either need manual access or are poor/conditional fits.

## SEO/content opportunities from live site and repository

1. **Trust-copy cleanup before distribution:** replace the unsupported absolute homepage/footer wording “The fastest online image compression tool” and reconcile the README's “No data collection or tracking” statement with the live GA4/privacy disclosures.
2. **Capability consistency:** reconcile AVIF in the homepage meta description with the README's documented JPEG/PNG/WebP output. Do not advertise AVIF output until verified in the running app.
3. **Open-source proof:** add the canonical public repository URL to the About page and directory drafts only after the actual public repository is confirmed; the current configured remote returned 404.
4. **High-intent page refresh:** the sitemap shows target-size pages (`100 KB`, `200 KB`, `500 KB`, `1 MB`) and workflow pages for email/WordPress. Refresh them with screenshots and exact current UI instructions, then link them from the homepage and guides index where appropriate.
5. **Evidence-led comparison content:** add a short “local processing vs upload-based compressors” explanation that distinguishes image privacy from site analytics/privacy-policy scope.

## Recommended next actions

1. Correct the public trust/capability inconsistencies before Product Hunt or directory distribution.
2. Manually verify the canonical public GitHub URL and update About/listing copy if appropriate.
3. Submit SaaSHub first if a directory listing is desired; it has the clearest current free submission path and explicit approval wording.
4. Treat Product Hunt and Show HN as maker-led launches requiring time for comments, not backlink submissions.
5. Leave AlternativeTo on hold until its live add-software route is accessible; do not pay for Uneed scheduling without a measured referral objective.
6. Do not mass-post or solicit votes/comments.

## Evidence and verification

- Live site: https://fastimagecompression.com/
- Robots: https://fastimagecompression.com/robots.txt
- Sitemap: https://fastimagecompression.com/sitemap.xml
- Privacy policy: https://fastimagecompression.com/privacy-policy.html
- About: https://fastimagecompression.com/about.html
- Product Hunt: https://www.producthunt.com/launch
- SaaSHub: https://www.saashub.com/services/submit
- AlternativeTo policy: https://alternativeto.net/about/terms/
- Uneed launch guide: https://www.uneed.best/launch.txt
- HN Show guidelines: https://news.ycombinator.com/showhn.html
- Lobsters guidelines: https://lobste.rs/about

All external interactions were read-only. No account, submission, post, payment, or contact action was performed.
