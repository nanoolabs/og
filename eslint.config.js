import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

// formatting lives in eslint
// this repo is pure TS/JS, no prettier.
// matches org standard:
// * 2-space indent
// * no semicolons
// * single quotes
// * trailing commas
export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '*.tsbuildinfo'],
  },
  // core rules first: tseslint.configs.recommended does NOT
  // include eslint:recommended (no-dupe-keys, no-undef, ...).
  js.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    commaDangle: 'always-multiline',
    jsx: false,
  }),
  {
    languageOptions: {
      // host global *.js touch.
      // tsc only checks index.ts, so no-undef
      // is only static safety net for plain JS in this repo.
      globals: { console: 'readonly', URL: 'readonly' },
    },
    rules: {
      '@stylistic/indent-binary-ops': ['error', 2],
      // parity with the org prettier config: stylistic's customize()
      // defaults differ on these three
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/quotes': [
        'error',
        'single',
        { allowTemplateLiterals: 'always', avoidEscape: true },
      ],
      // prettier printWidth: 100.
      // stylistic cannot wrap lines, so this
      // reports instead reformatting.
      '@stylistic/max-len': [
        'error',
        {
          code: 100,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)
