# SEO and content opportunities — 2026-08-21

> Recommendations only. No site content was changed.

## What already exists

The live site already has:

- format pages for JPEG, PNG, GIF, and WebP;
- target-size pages for 100 KB, 200 KB, 500 KB, and 1 MB;
- workflow pages for WordPress and email;
- a privacy/local-processing page;
- guides covering quality, resizing, formats, Core Web Vitals, batch compression, and social-media formats;
- a comparison section naming TinyPNG/TinyJPG and Squoosh.

This is already broad coverage. The next step should be improving trust and decision usefulness, not producing many near-duplicate keyword pages.

## Priority 1 — reconcile claims before distribution

Marketing outreach will send reviewers to the privacy policy and implementation. Resolve these contradictions before a major launch:

1. The README says “No data collection or tracking,” while live pages load Google Analytics and the privacy policy describes usage data.
2. The homepage says animated GIF compression, but the Canvas-based pipeline should not be assumed to preserve animation.
3. The homepage/footer uses absolutes such as “fastest,” “works perfectly on all devices,” and “without compromising quality” without published evidence.
4. The README lists fixed browser versions and “No limit” dimensions without a current compatibility test matrix.

Suggested content change: use the more precise phrase **“Selected image files are processed locally and are not uploaded to the application's server.”** Separate that from analytics disclosure.

## Priority 2 — strengthen comparison/search intent with evidence

SaaSHub and AlternativeTo are built around alternatives/comparison intent. Add a dedicated, indexable comparison methodology page rather than expanding the short homepage cards.

Suggested outline:

- local processing vs upload-based processing;
- registration requirements;
- single vs batch workflow;
- resize and target-size controls;
- browser-dependent output formats;
- when Squoosh, TinyPNG/TinyJPG, or a WordPress plugin may be a better fit;
- “verified on” date and links to primary product documentation.

Avoid declaring competitors slower or less private without a repeatable test and primary evidence.

## Priority 3 — publish a transparent compatibility/test page

A strong launch asset would be a maintained compatibility page showing:

- tested browser/version and operating system;
- tested input formats;
- available output formats in each browser;
- transparency handling;
- animated/static GIF behavior;
- large-dimension and memory limitations;
- batch ZIP behavior;
- test date and fixture methodology.

This supports both user trust and honest directory attributes. It also prevents unsupported “works everywhere” claims.

## Priority 4 — make local-processing evidence understandable

Expand the privacy/local-processing page with a simple architecture diagram and a reproducible verification procedure:

1. load the app;
2. open DevTools Network;
3. select and compress a non-sensitive sample image;
4. explain which network requests are page assets/analytics and why no image-upload request should appear.

Do not label the entire site “offline” or “zero network” because analytics and third-party assets load. Scope the claim to selected image files and processing.

## Priority 5 — consolidate overlapping target-size pages

The 100 KB, 200 KB, 500 KB, and 1 MB pages serve real task intent, but they risk thin duplication. Give each page distinct examples and constraints, then link to one canonical target-size guide that explains:

- why exact targets may not always be reachable;
- quality/dimension trade-offs;
- format effects;
- best-effort behavior;
- how to inspect the result before upload.

Do not create dozens of additional numeric pages unless Search Console shows distinct demand and each page can offer unique help.

## Distribution-driven content assets

Create only after implementation is verified:

- **How local browser image compression works** — technical explainer suitable for Show HN follow-up.
- **Image compressor compatibility matrix** — evidence for Product Hunt and AlternativeTo reviewers.
- **Prepare images for WordPress without uploading them to another compression service** — deepen the existing workflow with screenshots and a measurable checklist.
- **Target file size vs image quality** — show reproducible examples across photo, logo, and screenshot fixtures without presenting one result as universal.

## Measurement

Use tagged links only where the platform permits them. Product Hunt explicitly rejects tracking links in the submitted product URL, so use the canonical homepage there. Measure referral traffic in analytics by referrer, and document launch-day baseline/after windows without claiming causation from small samples.
