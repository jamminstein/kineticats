# Kineticats

Self-contained migration of https://www.kineticats.com/ to GitHub Pages, captured November 18, 2026.

Live address: https://jamminstein.github.io/kineticats/

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/. There is no install or build step. GitHub Pages serves the main branch root. `.nojekyll` preserves underscore-prefixed asset folders.

## What is preserved

The published single-page layout, all public image/logo assets, fonts, original video, page data and original Figma runtime are stored locally. The sitemap lists only the home page. This is a copy of the published output, not an editable Figma design file. The original runtime's bundled third-party notices remain intact.

`boot.js` supplies relative asset locations and a one-page history adapter, so assets also work below a GitHub project path or at a future custom domain. The video has an `.mp4` extension for the correct MIME type on static hosts. Page metadata uses the GitHub Pages URL. Search indexing stays disabled as on the original during review.

## Editing and next steps

- Keep this baseline in Git history before redesigning.
- Replace the generated layout with readable semantic HTML/CSS as we remake the page.
- Add working, separately accessible telephone, email and Instagram links.
- Improve mobile spacing, image descriptions and motion controls.
- Develop a longer cat film as separately generated shots, then edit them into a sequence.
- Choose the final web address before changing DNS. No domain or DNS change is part of this initial copy.

## Custom domain later

Set the selected domain in Settings → Pages and configure its DNS according to [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Verify the new address and HTTPS before retiring the old hosting. The email address currently uses kineticats.com, so preserve its mail configuration if that address is still in use.
