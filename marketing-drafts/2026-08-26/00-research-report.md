# Distribution research — 2026-08-26

> Drafts and recommendations only. No submission, post, comment, account creation, authentication, payment, or external write action occurred.

## Product facts rechecked

The live homepage and repository README were checked today. Safe claims for distribution copy remain:

- Fast Image Compression is a browser-based image compressor with local processing; selected image files are not uploaded to the application's server.
- The live homepage presents multi-image selection, quality controls, optional resizing, target-size workflows, before/after previews, compression statistics, JPEG/PNG/WebP/AVIF output controls, workflow presets, and local metadata removal where supported.
- The homepage states that the app works offline after the first load.
- The README remains stale in places: it documents narrower output support and does not describe all current controls. Use live-site copy, not README-only claims, until documentation is reconciled.
- The live site loads Google Analytics, so do not claim “no tracking” or “no data collection.” Keep privacy copy scoped to image files not being uploaded to the application server.
- The configured GitHub repository is private; do not describe the project as publicly open source.

## Channel research and register changes

### Newly recorded: BetaList — retain `hold`

- **Official route:** https://betalist.com/submit (redirected to the official sign-in page during verification).
- **Fit:** Potentially relevant as a startup/early-product discovery channel, but weaker than a tool directory for an already-launched utility.
- **Verified evidence:** The official site exposes “Submit Startup”; the route requires sign-in before any current submission form, review criteria, price, or approval timing could be checked.
- **Decision:** Record as `hold`, not `planned`, because the product fit and current mechanics are not sufficiently verified. No account creation or authentication is authorized.

### Newly recorded: Dev Hunt — reject

- **Official route:** https://devhunt.org/submit
- **Verified evidence:** The official navigation labels the service “A launchpad for dev tools, built by developers,” while the public submission route returned a 404 page.
- **Decision:** `rejected`: Fast Image Compression is a general browser image utility, not a developer tool, and no usable current submission route was verified.

### Existing channels rechecked

- **Product Hunt:** remains `blocked`; the official launch route showed Cloudflare verification from this environment.
- **AlternativeTo:** remains `hold`; the official site and add-software URL showed Cloudflare verification, so no current workflow or price was guessed.
- **Peerlist Launchpad:** remains `hold`; the official page showed Cloudflare verification, leaving requirements and cost unconfirmed.
- **Uneed:** remains `hold`; the official launch guide still states that the free waiting line is closed, while submitting without scheduling is free and dated launches require paid options. No paid action is authorized.
- **SaaSHub, DEV Community, Indie Hackers:** existing `approved/live` entries; maintenance only, not new submissions.
- **MicroLaunch and Launching Next:** existing `submitted` entries; no duplicate recommendation.
- **Reddit, Sidebar, Hacker News, Lobsters, Frontend Focus, Web Designer News:** no new evidence justifies changing their existing statuses.

## SEO/content opportunities

1. Reconcile README and public documentation with the live controls, particularly AVIF output, target-size mode, batch processing, resizing, offline behavior, and metadata removal.
2. Keep privacy language precise: local image processing does not imply no analytics or cookies.
3. Add or refresh screenshot assets showing target-size and batch workflows; these are stronger evidence for human-reviewed directory profiles.
4. Keep workflow pages (100 KB, 200 KB, WordPress, email) internally linked from relevant directory copy and verify that every page reflects the current UI.

## Recommended next actions

1. Human-review the BetaList fit only if the product is intentionally positioned as an early-stage startup; do not create an account solely for research.
2. Reconcile the README/live-site discrepancies before preparing additional directory submissions.
3. Treat existing live channels as maintenance work and avoid mass posting or vote solicitation.

## Evidence

- Live site: https://fastimagecompression.com/
- README: repository `README.md`
- Privacy policy: https://fastimagecompression.com/privacy-policy.html
- Product Hunt launch route: https://www.producthunt.com/launch
- AlternativeTo add route: https://alternativeto.net/software/add/
- Peerlist Launchpad: https://peerlist.io/launchpad
- BetaList submit route: https://betalist.com/submit
- Dev Hunt submit route: https://devhunt.org/submit
- Uneed launch guide: https://www.uneed.best/launch.txt

All external interactions were read-only.