// @ts-check
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import test from 'node:test'
import { ogDefaults, ogPath, ogSlug } from '../dist/index.js'

const LOCALES = ['en', 'id']

const routes = {
  '/': '/og/home.png',
  '/id/': '/og/home.png',
  '/id': '/og/home.png',
  '/blog/': '/og/blog.png',
  '/blog/hello-world/': '/og/blog/hello-world.png',
  '/id/blog/hello-world/': '/og/blog/hello-world.png',
  '/terms': '/og/terms.png',
  // must not be eaten by the locale prefix
  '/identity': '/og/identity.png',
}

test('ogPath maps route pathname -> emitted og path', () => {
  for (const [pathname, expected] of Object.entries(routes)) {
    assert.equal(ogPath(pathname, LOCALES), expected, pathname)
  }
})

test('ogPath strips nothing when no locales are passed', () => {
  assert.equal(ogPath('/blog/x'), '/og/blog/x.png')
  assert.equal(ogPath('/id/blog/x'), '/og/id/blog/x.png')
  assert.equal(ogPath('/'), '/og/home.png')
})

test('ogSlug keeps dots in slugs, unlike the library default getSlug', () => {
  assert.equal(ogSlug('v2.0.0-notes'), 'v2.0.0-notes.png')
  assert.equal(ogSlug('blog/hello-world'), 'blog/hello-world.png')
})

test('logo path is absolute and ships with the package', () => {
  const { logo } = ogDefaults
  assert.ok(logo, 'logo preset must stay wired')
  assert.ok(
    logo.path.startsWith('/'),
    'logo.path must be absolute, cwd-relative breaks fs.readFile',
  )
  assert.ok(existsSync(logo.path), `missing asset: ${logo.path}`)
})

test('both font weights are declared, or bold silently renders as 400', () => {
  const fonts = ogDefaults.fonts ?? []
  assert.equal(fonts.length, 2)
  assert.match(fonts[0], /400/)
  assert.match(fonts[1], /700/)
})

test('preset carries no title/description, those come from the page', () => {
  assert.ok(!('title' in ogDefaults))
  assert.ok(!('description' in ogDefaults))
})
