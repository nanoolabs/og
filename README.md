# @nlbs/og [⌐■_■]

> Shared Open Graph image presets for Nanoo Labs sites, built on
> [`astro-og-canvas`](https://github.com/delucis/astro-og-canvas).

## Install

```sh
pnpm add @nlbs/og astro-og-canvas canvaskit-wasm
```

`astro-og-canvas` is a peer dependency and `canvaskit-wasm` must be a direct
dependency (library resolves its `.wasm` through `require`).

## Usage

Endpoint at `src/pages/og/[...route].ts`:

```ts
import { OGImageRoute } from 'astro-og-canvas'
import { ogDefaults, ogSlug } from '@nlbs/og'
import { getCollection } from 'astro:content'

const pages: Record<string, { title: string; description?: string }> = {
  home: { title: 'Nanoo', description: 'Built to be fast, simple, scalable.' },
  // one entry per top-level route, no conditional emit
}

// mirror [...slug] route exactly: if it does not filter drafts, do not filter here
for (const post of await getCollection('blog')) {
  pages[`blog/${post.id}`] = {
    title: post.data.title,
    description: post.data.description,
  }
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getSlug: (key) => ogSlug(key),
  getImageOptions: (_path, page) => ({
    ...ogDefaults,
    title: page.title,
    description: page.description,
  }),
})
```

Then in layout:

```astro
---
import { locales } from '../lib/i18n'
---

<meta
  property="og:image"
  content={`${SITE.url}${ogPath(Astro.url.pathname, Object.keys(locales))}`}
/>
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta name="twitter:card" content="summary_large_image" />
```

Pass **every** locale key, not just the non-default ones. It stay correct if
default locale is prefixed later, and single-language site just omit argument.

## API

| Export       | Type                                                        | Purpose                                                     |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `ogDefaults` | `Omit<OGImageOptions, 'title' \| 'description'>`            | Palette, fonts, logo, padding                               |
| `ogPath`     | `(pathname: string, locales?: readonly string[]) => string` | Route pathname to emitted file path. Strips locale prefixes |
| `ogSlug`     | `(key: string) => string`                                   | `pages` key to output filename. Feed to `getSlug`           |
| `logoPath`   | `string`                                                    | Absolute path to the bundle logomark                        |

`ogPath` and `ogSlug` are the same contract by construction: `ogPath` calls
`ogSlug` internally. If they ever diverge, every page would serve a 404
`og:image` with no build failure, so do not hand-roll either one.

## Gotcha

- **Card text is ASCII-only.** The bundle Geist font has no coverage for
  kaomoji glyphs like `[⌐■_■]`; they render as missing box.
- **Bundle logomark is PNG, not SVG.** Passing an `.svg` path silently
  skips the logo.

## License

[ISC](./LICENSE)
