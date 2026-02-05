This PR improves discoverability of the new pages by:

- Updating `sitemap.xml` to include all HTML pages (compress pages, guides, about/contact, policies).
- Adding scripts to generate the sitemap (`npm run sitemap:generate`).
- Adding "Related guides" internal link sections across guide pages to improve crawl depth and navigation.
- Adding a helper script to insert related-guide sections (`npm run links:related-guides`).

How tested:
- `npm test`
- `npm run sitemap:generate`

Notes:
- Sitemap is generated from repo root HTML files and includes `<lastmod>` based on each file's mtime.
