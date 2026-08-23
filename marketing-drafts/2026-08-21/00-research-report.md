# Distribution research — 2026-08-21

> Draft/recommendation only. Nothing was submitted, posted, scheduled, purchased, or sent.

## Product facts checked

Checked against the live homepage, repository README, `script.js`, and privacy policy on 2026-08-21.

Safe claims:

- The compressor runs in the browser; image files are not uploaded to the application's server.
- It is free to use without registration.
- It supports selecting multiple images, quality adjustment, resizing, output-format selection where the browser supports it, previews, target-size workflows, and downloads.
- The positioning is relevant to web, WordPress, email, and general image preparation.
- The site itself uses Google Analytics and third-party assets. Say **“image files are processed locally”**, not “the website sends no data” or “there is no tracking.”

Claims intentionally excluded:

- Performance numbers such as “milliseconds,” percentage savings, or “fastest.”
- Universal browser/device compatibility.
- “No quality loss” or “without compromising quality.”
- Animated GIF preservation. The implementation is Canvas-based and should not be marketed as preserving animation until that path is explicitly tested.
- README statements such as “no data collection or tracking,” because the live site includes GA4 and the privacy policy describes usage-data collection.

## Highest-quality opportunities

| Priority | Platform | Relevance | Submission path | Verified requirements / cost | Review status | Recommendation |
|---|---|---|---|---|---|---|
| 1 | Product Hunt | Strong fit for a live, immediately usable digital product | [Launch guide](https://www.producthunt.com/launch); in UI: **Submit → New Product** | Personal account; new accounts normally wait one week; direct product URL without shorteners/tracking; name; tagline up to 60 characters; description documented inconsistently as 260 vs 500 characters; thumbnail; two gallery images. Official guide says Product Hunt is free. | Product Hunt says its team reviews submissions for featuring; homepage placement is not guaranteed. | Prepare assets and manually confirm the live form. Keep the description under 260 characters for compatibility. |
| 2 | Show HN | Excellent maker/developer fit; the tool is immediately usable without signup | [Rules](https://news.ycombinator.com/showhn.html), [submit](https://news.ycombinator.com/submit) | Must be something the submitter personally built and people can try; title starts `Show HN`; explain how/why; participate in discussion; do not solicit votes/comments. No fee stated. | Valid posts appear on `shownew`; wider placement depends on points. | Post manually only when the maker can stay available for discussion. |
| 3 | SaaSHub | Good software directory and alternatives fit | [Submit a product](https://www.saashub.com/services/submit) | Product URL, relevant categories, and competitors. The form says omitting competitors lowers queue priority; optional domain-email verification raises priority. No submission fee displayed. | A processing queue is documented; manual approval was not explicitly documented. | Submit manually after preparing category and competitor choices. A guessed existing listing URL returned 404 on 2026-08-21. |
| 4 | Web Tools Weekly | Strong editorial fit for web developers/designers and media tools | [Submission guidance](https://webtoolsweekly.com/submit), [archive](https://webtoolsweekly.com/archive) | Suggestions are accepted by X DM or Bluesky chat; articles/tutorials are excluded. No editorial-submission fee stated. | Curated newsletter; inclusion is not guaranteed. | Send one concise suggestion manually, not a campaign blast. |
| 5 | AlternativeTo | Strong comparison intent, but operational details are partially blocked | [Terms/current policy](https://alternativeto.net/about/terms/) | Standard use/submission is described as free. Normal review backlog is usually months; optional priority review price appears only at checkout and does not guarantee approval. Exact current add-software route/form fields could not be verified because Cloudflare blocked the UI. | Explicit review; submissions may be edited, refused, or removed. | Hold until a person signs in and verifies the current submission route and duplicate status. Use free review unless timing matters. |
| 6 | Uneed | Relevant launch directory, but current launch placement is paid | [Submit](https://www.uneed.best/submit-a-tool), [pricing](https://www.uneed.best/pricing), [launch requirements](https://www.uneed.best/launch.txt) | Real HTTP(S) custom-domain URL; signup required to save. Free unscheduled listing remains available; free launch queue is closed. Fast-track is $14.99 (Uneed assigns a slot in about 14 days); date selection is $29.99. | Uneed calls itself curated, but inspected docs did not explicitly state manual approval. | Save only if a listing without a launch date is useful; pay only after evaluating expected audience quality. |

## Hold / reject

- **BetaList — hold:** official [criteria](https://betalist.com/criteria) favor new or unreleased products and may reject products launched weeks ago or with substantial prior coverage. Launch age and post-login price/options are not established.
- **Dev Hunt — hold:** [site](https://devhunt.org/) requires login to submit, but public rules, cost, and moderation details were insufficiently transparent.
- **Tiny Startups — reject for now:** its [submission page](https://www.tinystartups.com/submit) mixes a free startup submission with a $49 “List a Tool” offer and emphasizes SEO/directory-network value. Lower trust/fit than the shortlist.
- **Reddit — no draft today:** official subreddit rules endpoints for r/InternetIsBeautiful, r/webdev, r/SideProject, and r/wordpress returned HTTP 403, so current self-promotion rules could not be verified. Do not post until each community's live rules and recent moderation norms are manually checked.

## Access limitations

- Product Hunt and AlternativeTo live forms were blocked by Cloudflare. Product Hunt requirements were cross-checked against recent captures of official Product Hunt help/launch pages; live form limits must still be confirmed before launch.
- No platform account was accessed. Costs are reported only where visible in official platform material.

## Recommended next actions

1. Review `copy-library.md` and choose one positioning angle: privacy/local processing, WordPress workflow, or no-signup convenience.
2. Capture the four suggested screenshots at a consistent desktop viewport, using non-sensitive sample images.
3. Launch first on **Show HN** only when the maker can reply; use feedback from that discussion to refine the Product Hunt copy.
4. Verify Product Hunt duplicate status and live field limits manually, then schedule only after assets and maker comment are ready.
5. Submit to SaaSHub and suggest to Web Tools Weekly individually; do not mass-submit to low-quality directories.
