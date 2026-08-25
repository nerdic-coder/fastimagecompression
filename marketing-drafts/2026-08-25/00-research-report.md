# Distribution research — 2026-08-25

> Drafts and recommendations only. No submission, post, comment, account creation, authentication, payment, or external write action occurred.

## Product facts rechecked

The live homepage and repository README were checked today. Safe claims for distribution copy based on the live site:

- Fast Image Compression is a browser-based image compressor with local processing; selected image files are not uploaded to the application's server.
- The live UI includes multi-image selection, adjustable quality, optional resizing, target-size mode, JPEG/PNG/WebP/AVIF output controls, before/after preview, compression statistics, presets, and local metadata removal where supported.
- The homepage states that the app works offline after the first load.
- The README is stale in places: it documents JPEG/PNG/WebP output, a 10 MB maximum, and does not describe all current homepage controls. Do not use README-only claims for new channel copy without reconciling the documentation.
- The live site loads analytics, so do not claim “no tracking” or “no data collection.” Keep the narrower claim that image files are not uploaded to the application server.
- The configured GitHub repository is private (`https://github.com/nerdic-coder/-fastimagecompression`); do not present it as a public open-source repository.

## Channel reviewed

### Uneed — retain `hold`; prepare a manual draft

- **Official product submission page:** https://www.uneed.best/submit-a-tool
- **Official launch guide:** https://www.uneed.best/launch.txt
- **Official pricing:** https://www.uneed.best/pricing
- **Fit:** Relevant social launchpad for a privacy-oriented browser utility and its founder/tech audience.
- **Current mechanics:** The product page allows a URL preview without an account, then asks the owner to sign up to save the product. The launch guide says product creation is free, but the free waiting line is closed to new products.
- **Current launch cost:** The official pricing page lists Skip the Line at $29.99 and Fast-track at $14.99. The launch guide says “Submit without scheduling” is valid and leaves the product saved without a launch date. No paid placement or launch was authorized.
- **Recommendation:** Keep the register status `hold`, because a free product listing can be created but a dated launch requires paid scheduling while the free queue is closed. The draft below is for human review only.

## Existing channels checked without new submission recommendations

- **SaaSHub:** `approved/live`; maintenance only, not a new submission.
- **Product Hunt:** `blocked`; the launch route returned 403 from this environment and existing access limitation remains unresolved.
- **AlternativeTo:** `hold`; official terms route returned 403 and no current add-software route was safely verified.
- **Launching Next:** `submitted`; no duplicate recommendation. Existing free submission is in queue.
- **MicroLaunch:** `submitted`; no duplicate recommendation.
- **DEV Community and Indie Hackers:** `approved/live`; recommend maintenance or follow-up content only, not duplicate listings.
- **Uneed:** `hold`; current evidence changed the mechanics, but paid scheduling is not authorized.
- **Reddit:** `hold`; no specific subreddit with current official self-promotion rules was verified.
- **Hacker News / Show HN, Lobsters, Frontend Focus, Web Designer News:** retain existing rejected/held states; no new evidence justifies reopening them.

## SEO/content opportunities

1. Reconcile README and public documentation with the live controls, especially AVIF output, target-size mode, batch processing, resizing, offline behavior, and metadata removal.
2. Keep privacy copy scoped: local image processing does not mean the site has no analytics or cookies.
3. Verify whether AVIF output works across the supported browsers before using AVIF as a universal compatibility claim.
4. Refresh the target-size and workflow pages with screenshots that show the current controls; these are stronger evidence assets for directory submissions than generic feature copy.
5. Do not use the private repository URL in public directory copy unless the repository is intentionally made public and its canonical URL is verified.

## Recommended next actions

1. Review `2026-08-25/uneed.md`; if Uneed is worth pursuing, choose between an unscheduled free listing and an explicitly approved paid launch date.
2. Before broad directory distribution, reconcile the README/live-site discrepancies and capture fresh screenshots.
3. Treat existing live channels as maintenance work and avoid mass posting or vote solicitation.

## Evidence

- Live site: https://fastimagecompression.com/
- README: repository `README.md`
- Privacy policy: https://fastimagecompression.com/privacy-policy.html
- Uneed product submission: https://www.uneed.best/submit-a-tool
- Uneed launch guide: https://www.uneed.best/launch.txt
- Uneed pricing: https://www.uneed.best/pricing
- Product Hunt launch page: https://www.producthunt.com/launch
- AlternativeTo terms: https://alternativeto.net/about/terms/
- GitHub repository visibility check: https://github.com/nerdic-coder/-fastimagecompression

All external interactions were read-only.
