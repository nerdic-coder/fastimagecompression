Adds a lightweight share hook after compression results, to improve non-SEO discoverability.

What it does:
- After single or batch compression, shows a small "Share your savings" card.
- Card includes:
  - Savings summary (bytes + percent + count)
  - "Copy share text" button
  - "Share on X" (tweet intent) link
  - WordPress-oriented note: "compress first, then upload to your Media Library"

Implementation notes:
- Only appears when compression actually reduces size.
- Uses clipboard API with a fallback for older browsers.

How tested:
- `npm test`
- Manual test: compress an image locally and verify share card appears + copy button shows "Copied!".
