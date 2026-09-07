# Astro + Mistlane

The site is built by Astro. Its existing Mistlane Pug templates, Stylus, CSS,
fonts and browser scripts are rendered through `src/lib/theme-renderer.mjs`.
The adapter supplies template helpers and content collections without starting
Hexo or using `.deploy_git` as a build input.

- `npm run dev`: prepare assets and start Astro development server.
- `npm run build`: compile the theme, build into `public`, run existing site checks.
- `npm run preview -- --port 4322`: serve the production build locally.
- `npm run test:theme`: browser checks against port 4322, using installed Chrome.
  Set `BLOG_TEST_URL` to test a different local server.

Continue editing posts in `source/_posts`, moments in `source/_moments`, pages
in `source`, and theme settings in `_config.mistlane.yml`. HTML pages with YAML
frontmatter are rendered with the same layout as Markdown pages. Article URLs
continue to use `abbrlink`; category/tag paths retain their original names.
Dates without an offset use the timezone in `_config.yml`.

Restart `npm run dev` after changing theme assets to recompile Stylus and copy
browser resources. `astro.public`, `.astro`, `public`, and `test-results` are
generated files. Original content and theme files are the source of truth.
