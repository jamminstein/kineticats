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
- Choose the final web address before changing DNS. No domain or DNS change is part of this initial copy.

## Custom domain later

Set the selected domain in Settings → Pages and configure its DNS according to [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Verify the new address and HTTPS before retiring the old hosting. The email address currently uses kineticats.com, so preserve its mail configuration if that address is still in use.

## Paw illustrations

The previous flat punk sticker illustrations are preserved in the comparison gallery: lightly distressed black ink, white paper with a die-cut edge, and transparent outer margins. The source PNGs themselves use neutral black ink and white paper. CSS uses neutral gray shadows and pure white labels. Small rotations, CSS drop shadows and black labels make them read as paper stickers. The first three keep their original poses; the fourth has been redrawn to show its furry back. The drawing styles and page layout are preserved. They explicitly depict front paws with five toes: four forward digits and a smaller inner first digit bearing a dewclaw, positioned farther toward the wrist. All four current illustrations show the furry dorsal backs of the paws, with no visible pads. The older underside illustration is retained only in the previous studies. All responsive variants and the prerendered HTML use the updated artwork. Original ink assets and earlier studies are retained. `stickers.css` owns the presentation, including reduced-motion handling.

Anatomy references: [WSU Extension Cat Project Unit One, page 19](https://ucanr.edu/sites/default/files/2024-07/400276.pdf) and [Zoetis veterinary explanation of dewclaws](https://www.zoetispetcare.com/blog/article/what-are-dewclaws). These are stylized brand illustrations, not clinical diagrams.

## Rotatable relief and finish studies

Open [Ink in depth](https://jamminstein.github.io/kineticats/paw-study/). All four corrected drawings are used as the actual front textures of rounded 3D reliefs. Geometry follows each image silhouette; the depth and plain reverse are interpretations, not a complete anatomical reconstruction. Drag, use the arrow keys, or press Home to reset; the original-image comparison preserves the flat artwork. Rendering occurs on interaction and resize, with no automatic rotation. Original drawings remain available if WebGL is unavailable.

Three static finish studies use the Production paw as their reference: realistic fur, rough printed ink and carved graphite. These are generated art-direction variations, separately viewable at full image resolution. These studies remain separate from the current home-page sticker artwork.

The earlier generic 3D experiment remains in Git history at `22ffd43`; this version derives the relief from the actual artwork. The Three.js runtime is bundled locally, with its license in `paw-study/vendor/THREE-LICENSE.txt`.

## Full 3D fur study

Open [Fur in the round](https://jamminstein.github.io/kineticats/paw-realistic/). This separate prototype uses a complete volumetric mesh with four forward toes, a smaller inner digit, five curved claws, seven pads and individual tapered fur strands. The underside is an interpretation of feline anatomy; it is not recovered from the single reference image. It rotates through 360 degrees and supports zoom, front/pad views, two lighting presets and comparison with the original photorealistic style image.

This is an editable first model, not a photorealistic final asset or a rigged animation. The coat and forms still read softer and more stylized than the reference. The home page now uses the realistic two-state paws described below. Geometry is Draco-compressed for delivery; Three.js and its matching Draco decoder are bundled locally. The reproducible Blender builder is in `paw-realistic/source/build_model.py`; running it creates an ignored `rebuilt/` folder beside the script. The uncompressed model and editable Blender scene are delivered separately.

## Realistic paw images and hover behavior

The homepage shows three disciplines: Film, Design and Coding. Their centered realistic paw photographs are selected from the rotating collection below. Hovering reveals the matching version with visible claws and irregular garden dirt, then returns to the clean state when the pointer leaves. Tapping toggles the effect on touch devices. Keyboard users can focus each paw and use Enter or Space to toggle it, or Escape to reset. Reduced-motion preferences disable the 220ms crossfade, and the standard image remains visible until the hover image has loaded.

[The comparison gallery](https://jamminstein.github.io/kineticats/paw-photos/) has the same interaction, separate Standard and Hover downloads, and a toggle for the preserved monochrome stickers. Each version is a generated image study. Earlier angled and cleaner centered studies remain in the photos folder.

`paw-interactions.js` and `paws.css` own the interaction. The homepage initializes these layers after the original Figma runtime finishes hydration and reapplies them at responsive breakpoints. One thick continuous black outline, shaped like the rounded square in the Kineticats logo, surrounds each realistic paw. Both image states use the same matching crop with room for the claws. The frame is a lightweight local SVG with no ornaments or rotation; it stays still during the hover crossfade and is omitted in sticker comparison mode. The original page layout is retained. Discipline names appear as plain, unrotated dark text beneath each frame, with no background box.

## Running-cat films

The original film is restored in the cover area. The silent 50-second, 100-cat edit is now revealed behind the massive footer only while hovering the actual strokes of the Kineticats wordmark. The wordmark and footer information become white over the film; moving into letter holes, gaps or the surrounding space restores the original footer and pauses the film. Re-entering resumes playback.

`footer-film.js` uses the original SVG geometry for exact hit-testing across responsive layouts; `footer-film.css` owns the video layer and white treatment. The original logo artwork, layout, links and paw interactions are preserved. Touch users tap the letter shapes to toggle; keyboard users focus the wordmark and use Enter/Space or Escape. Leaving the viewport or tab pauses the film. With reduced motion enabled, hover reveals a still frame and deliberate keyboard/touch activation can play the film.

`_videos/v3/kineticats-100-half-second.mp4` is the 1920×1080, 24 fps web export, loaded only near the footer. Every cat appears for exactly half a second (12 frames), at natural speed, using a central burst within its approved running excerpt. The order is unchanged from the four-minute edit: ordinary cats progress into increasingly surreal cats. The neutral contrast curve and fine temporal luminance grain are preserved. The earlier four-minute export remains under `_videos/v2/`. High-quality clean and graded exports and the full untrimmed clean master are retained separately from this repository.

## Hidden cat sounds

Hover the top-left logo for a short, quiet purr, or the Bradbury Building address in the footer for a meow. Keyboard focus and Enter/Space also work. Sounds have soft edges, stop on leaving the target, do not overlap, and have a short retrigger cooldown. They never loop. The layout stays unchanged. Browsers may require an initial click or keypress before hover audio can play; `cat-sounds.js` unlocks Web Audio on that first gesture. The silent videos remain silent.

The locally hosted recordings and their public-domain/CC0 source credits are in `_audio/CREDITS.txt`.

## Rotating paw collection

Eight matched clean/hover pairs feed the three discipline cards. Four approved pairs are joined by new ginger, mottled white, calico and silver paws, generated with built-in OpenAI image generation. Each new hover was edited from its clean reference to preserve pose and identity while adding claws and garden dirt. All new images are 1254 × 1254 PNGs under `_assets/v12/`.

`paw-collection.js` picks three different pairs once per page load, avoiding all three paws from the preceding visit when local storage is available. Labels remain Film, Design and Coding. The chosen trio stays fixed across responsive breakpoints; blocked storage falls back to a random trio. Both responsive page data and prerendered HTML contain three cards. The row becomes a single column on mobile. The four-paw comparison gallery is retained as an earlier study.
