# DEV Community `#showdev` draft

> Draft only. Do not create an account or publish automatically.

## Current official guidance

- Tag page and rules: https://dev.to/t/showdev
- New-post route: https://dev.to/new
- Code of conduct: https://dev.to/code-of-conduct
- `#showdev` is for showing projects and launching products.
- Posts should be community-driven, not overly corporate or salesy.
- A DEV account is required to publish. Standard posts are user-published and remain subject to moderation.
- No normal posting fee was displayed.

## Suggested title

I built a browser-local image compressor with target-size and batch workflows

## Suggested tags

`showdev`, `webdev`, `javascript`, `privacy`

Confirm the current tag vocabulary before publishing.

## Draft post

I built [Fast Image Compression](https://fastimagecompression.com/) to make a routine image-preparation task easier without sending selected image files to an application server.

The compression path runs in the browser. You can choose one or multiple images, adjust quality and maximum dimensions, select an output format supported by the browser, or aim for a target file size. The interface previews the result and file-size change before individual or batch downloads. The tool is free and does not require registration.

The use cases I had in mind were preparing images for websites, WordPress, email, and forms with upload limits. I also wanted the local-processing boundary to be explicit: image files stay in the browser during compression. That does not mean the whole website makes zero network requests—the site uses analytics and web assets—so I scope the privacy claim specifically to selected image files and processing.

The implementation uses browser image APIs rather than an upload-and-process backend. That keeps the image-processing workflow local, but it also creates browser-dependent behavior. Output-format availability depends on the browser, and I do not currently market animated-GIF preservation, universal compatibility, or a fixed compression percentage.

I would appreciate feedback on:

1. whether the control flow is understandable on the first attempt;
2. whether target-size mode is more useful than repeatedly adjusting quality;
3. output quality and format behavior across different browsers and source images;
4. whether the local-processing explanation is clear without overstating privacy.

Try it here: https://fastimagecompression.com/

If you test it, please use a non-sensitive image and keep the original until you have reviewed the output.

## Publishing notes

- Publish from the builder's real personal account and disclose the relationship to the tool.
- Add implementation detail only if it has been checked against the current source.
- Stay available to answer comments.
- Do not ask for likes, follows, or coordinated engagement.
- Do not reuse this as an identical link-drop on multiple communities.
