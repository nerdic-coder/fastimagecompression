# Show HN post draft

> Draft only. Post manually only when the maker can participate in the discussion.

## Official rules checked

- Rules: https://news.ycombinator.com/showhn.html
- Submit: https://news.ycombinator.com/submit
- Show HN should be something the poster personally built and users can try.
- The title must begin `Show HN`.
- Explain how and why it was built, and remain available for discussion.
- Do not solicit votes or comments.
- The rules say valid posts appear on `shownew`; broader placement is earned through points.
- No submission fee is stated.

## Title

Show HN: Fast Image Compression – local image compression in your browser

## Body

I built Fast Image Compression as a simple way to prepare images for websites, WordPress, email, and upload limits without sending the selected image files to the application's server.

It runs in the browser and does not require registration. You can select one or multiple images, adjust quality and maximum dimensions, choose an available output format, use a target-size workflow, compare the result, and download the output.

Try it: https://fastimagecompression.com/

I would especially appreciate technical feedback on the control flow, output quality across different source images, and browser-specific behavior. I am also interested in whether the target-size workflow is clearer than repeated manual quality adjustments.

The implementation uses browser image APIs, so output-format availability depends on the browser. The website uses analytics, but the image-processing path itself is local; selected image files are not uploaded to the application's server.

## Posting notes

- Post from the builder's established personal account.
- Be ready to answer implementation and privacy questions honestly.
- If asked about GIFs, do not claim animation preservation unless a current manual test confirms it.
- Do not cross-post simultaneously or ask anyone for votes.
