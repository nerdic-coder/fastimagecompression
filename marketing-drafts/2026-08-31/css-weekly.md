# CSS Weekly editorial-link draft

> Draft only. No form was submitted, no message was sent, no account was created, and no sponsorship was purchased.

## Channel decision

- **Platform:** CSS Weekly — https://css-weekly.com/
- **Editorial contact route:** https://css-weekly.com/contact
- **Archive:** https://css-weekly.com/archives
- **Status:** `hold`
- **Fit:** Potentially strong for a practical article about image performance. CSS Weekly describes its archive as curated articles, tutorials, tools, and inspiration for front-end developers, and its recent archive includes web-performance and image-format material.
- **Current route:** The official contact page explicitly invites links to a blog post, article, or video and asks for full name, email, subject, optional URL, and message. It does not describe review timing, acceptance criteria, or an editorial fee.
- **Cadence caveat:** The newest publicly visible archive entry found on 2026-08-31 is Issue #639 dated 2026-04-23. Verify that editorial publication is active before sending anything.
- **Why hold:** The existing “Images and Core Web Vitals” guide is accurate at a high level but too brief for a strong editorial pitch. Improve and source the guide first rather than sending a product-only promotion through an article-submission route.

## Recommended asset before outreach

Strengthen this existing page:

- **Article:** Images and Core Web Vitals
- **URL:** https://fastimagecompression.com/guide-core-web-vitals-images
- **Current visible update date:** February 4, 2026

Suggested editorial improvements (application/content work is outside this cron's scope):

1. Explain how to identify the LCP element and distinguish field data from lab data.
2. Cover responsive delivery with `srcset`, `sizes`, and `<picture>` rather than format advice alone.
3. Explain why the LCP image normally should not be lazy-loaded and when `fetchpriority="high"` or preload is appropriate.
4. Add a compact before/after workflow using dimensions, encoded file size, and PageSpeed Insights or DevTools evidence without promising a universal score gain.
5. Link primary references for LCP, CLS, INP, responsive images, and image loading.
6. Keep the compressor as an optional practical step; the article should remain useful without requiring the tool.

Primary technical reference inspected:

- Google/web.dev, “Optimize Largest Contentful Paint” (last updated 2025-03-31): https://web.dev/articles/optimize-lcp

## Draft editorial message — use only after the hold is resolved

### Subject

Practical guide suggestion: images and Core Web Vitals

### URL

https://fastimagecompression.com/guide-core-web-vitals-images

### Message

Hi Zoran,

I wrote a practical guide for front-end developers on how image choices affect LCP, CLS, and INP. It covers sizing, format selection, reserving layout space, loading priority, responsive images, and a repeatable optimization checklist, with links to primary performance guidance.

If it fits a future CSS Weekly issue, here is the article:
https://fastimagecompression.com/guide-core-web-vitals-images

The site also includes a free browser-local compressor, but the guide is intended to stand on its own and be useful regardless of which image tool readers use.

Thanks for considering it,
Johan

## Human checklist

1. Improve the guide and update its visible date; do not send the current short version unchanged.
2. Reopen the public archive and confirm that new issues are still being published.
3. Review the final guide for technical accuracy, citations, and promotional balance.
4. Use the editorial contact route, not paid sponsorship, unless a separate sponsorship budget is approved.
5. Send at most one tailored suggestion. Do not follow up repeatedly.
6. Change the register to `submitted` only after a real form confirmation; use `approved/live` only after the article appears publicly.
