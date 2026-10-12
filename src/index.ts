import type { OGImageOptions } from 'astro-og-canvas'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)

/**
 * Absolute path to bundle logomark.
 *
 * Resolve through `package.json` on purpose: `astro-og-canvas` read
 * `logo.path` with `fs.readFile`, and bundler inline this module into a
 * chunk, so `new URL('../assets', import.meta.url)` would point into
 * consumer build output instead of this package.
 */
export const logoPath = join(
  dirname(require.resolve('@nlbs/og/package.json')),
  'assets',
  'nanoo.png',
)

/**
 * Shape of {@link ogDefaults}: `astro-og-canvas` options minus
 * page-specific `title`/`description`, which consum always supply.
 */
export type OGPreset = Omit<OGImageOptions, 'title' | 'description'>

/**
 * Shared preset for `astro-og-canvas` `getImageOptions`.
 * Spread it and add `title`/`description` from the page.
 *
 * Yuppp, design is monochrome by brand decision: no accent color anywhere. The
 * signature is contrast instead of chroma - deep gray gradient, gray-3 top
 * bar, white logomark. RGB tuples are transcribe from `@nlbs/css`
 * `variables.css` (oklch converted by hand :>). No `@nlbs/css` dependency on
 * purpose: `satori`-class tools cannot parse `oklch()`, and a build-time hex
 * conversion add a dependency for zero gain.
 *
 * But  kaomoji (`⌐■_■`) cannot render in title/description: Geist has no
 * U+2310/U+25A0 coverage, and a symbol fallback font cost a second download
 * for four glyphs.
 */
export const ogDefaults: OGPreset = {
  // Geist matches site `--font-sans`. Both weight are require:
  // `astro-og-canvas` only loads what you list, and a missing 700 silently
  // fallback to 400 so title would never render bold.
  fonts: [
    'https://api.fontsource.org/v1/fonts/geist-sans/latin-400-normal.ttf',
    'https://api.fontsource.org/v1/fonts/geist-sans/latin-700-normal.ttf',
  ],
  // --gray-11 -> --gray-12, deepened beyond tokens so depth
  // survive feed-thumbnail downscaling
  bgGradient: [
    [28, 28, 28],
    [5, 5, 5],
  ],
  // --gray-3 (oklch 0.88 0 0). Width 8: at ~300px feed thumbnails the bar
  // downscales to ~2px; the old w4 disappeared entirely.
  border: { color: [215, 215, 215], width: 8, side: 'block-start' },
  padding: 60,
  // Absolute path: `astro-og-canvas` resolves `logo.path` with `fs.readFile`,
  // so a package-relative path would break against the consumer cwd.
  logo: {
    path: logoPath,
    // 144: below ~120 mark shrink to a speck at thumbnail size
    size: [144],
  },
  font: {
    // --gray-0
    title: {
      weight: 'Bold',
      color: [252, 252, 252],
      size: 70,
      lineHeight: 1.1,
    },
    // --gray-5
    description: {
      weight: 'Normal',
      color: [171, 171, 171],
      size: 40,
      lineHeight: 1.3,
    },
  },
}

/** Route key for site root, matching endpoint `pages` entry. */
const HOME = 'home'

/**
 * Output filename for a `pages` key
 *
 * Feed this to `OGImageRoute` as `getSlug`. The built-in default also strip
 * whatever follows last dot in the key, so `v2.0.0-notes` would silently
 * emit `v2.0.png`.
 *
 * `ogPath` build its return value from this, so HTML tag and emitte d
 * file cannot drift apart. Kept in sync by construction, not by convention
 *
 * @param key entry in endpoint's `pages` record
 * @returns emitted filename, e.g. `'blog/hello-world.png'`
 * @example ogSlug('blog/hello-world') // 'blog/hello-world.png'
 */
export function ogSlug(key: string): string {
  return `${key}.png`
}

/**
 * Map a page pathname to emitted OG image path.
 *
 * Must return a path consumer endpoint actually generates, otherwise
 * `og:image` 404s silently.
 *
 * `locales` are route prefixes consumer router uses, e.g.
 * `Object.keys(i18n.locales)`. Pass every locale, not just the non-default
 * ones: it also works when default locale is prefixed, and it keeps
 * package free of any assumption about the consumer routing. Defaults to
 * `[]` for single-language sites.
 *
 * With `locales: ['en', 'id']`:
 * `/`                     -> `/og/home.png`
 * `/id/`                  -> `/og/home.png`
 * `/blog/hello-world/`    -> `/og/blog/hello-world.png`
 * `/id/blog/hello-world/` -> `/og/blog/hello-world.png`
 *
 * @param pathname page pathname, trailing slashes tolerated
 * @param locales every locale route prefix the consumer router use
 * @returns the `og:image` path match endpoint emitted file
 * @example ogPath('/id/blog/hello-world/', ['en', 'id']) // '/og/blog/hello-world.png'
 */
export function ogPath(
  pathname: string,
  locales: readonly string[] = [],
): string {
  let p = pathname.replace(/\/+$/, '')
  for (const locale of locales) {
    if (p === `/${locale}`) return `/og/${ogSlug(HOME)}`
    if (p.startsWith(`/${locale}/`)) p = p.slice(locale.length + 1)
  }
  return `/og/${ogSlug(p === '' ? HOME : p.slice(1))}`
}
