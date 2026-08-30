---

title: Identifier JS

description: An RFC 3986 and RFC 3987 parser, validator, and reference resolver for Node.js and browser bundles.

---

# Identifier JS

`identifier-js` is a fully RFC [3986](https://www.rfc-editor.org/rfc/rfc3986) and RFC [3987](https://www.rfc-editor.org/rfc/rfc3987) compliant URI/IRI parser, validator, resolver, and composer. It provides:

- URI and IRI validation;
- parsed identifier components;
- RFC 3986 reference resolution and dot-segment removal;
- relative-reference generation with round-trip guarantees for supported forms;
- UUID and UUIDv4 lexical validation;
- lazily compiled and cached regular expressions.

The package is synchronous, CommonJS, and supports Node.js 20 or newer. Browser use requires a bundler or runtime that supports CommonJS dependencies and Unicode regular expressions.

## Install

```bash title="console"
npm install identifier-js
```

## API

Every validator returns `true` or throws at the first detected violation. Parsing and reference operations also throw when their input does not satisfy the required grammar.

### Validate URI syntax

Validate a complete URI, a URI reference, or an absolute URI without a fragment.

<details>
<summary><strong>API and examples</strong></summary>

```ts
isUri(value: string): true
isUriReference(value: string): true
isAbsoluteUri(value: string): true
```

```js
const { isUri, isUriReference, isAbsoluteUri } = require('identifier-js');

console.log(isUri('https://example.com/path?query#fragment')); // true
console.log(isUriReference('../asset?version=2')); // true
console.log(isAbsoluteUri('https://example.com/path?query')); // true
```

An `absolute-URI` is the fragment-free grammar defined by RFC 3986. Use `isUri` when a fragment is allowed.

</details>

### Parse URI components

Parse URI syntax into scheme, authority, userinfo, host, port, path, query, and fragment components.

<details>
<summary><strong>API and examples</strong></summary>

```ts
parseUri(value: string): IdentifierComponents
parseUriReference(value: string): RelativeIdentifierComponents
parseAbsoluteUri(value: string): AbsoluteIdentifierComponents
```

```js
const { parseUri } = require('identifier-js');

console.log(parseUri('https://user@example.com:8443/a?b#c'));
// {
//   scheme: 'https',
//   authority: 'user@example.com:8443',
//   userinfo: 'user',
//   host: 'example.com',
//   port: '8443',
//   path: '/a',
//   query: 'b',
//   fragment: 'c'
// }
```

Absent optional components are returned as `undefined`. Present but empty query and fragment components are returned as empty strings.

</details>

### Validate IRI syntax

Validate Unicode-capable identifiers using RFC 3987 grammar.

<details>
<summary><strong>API and examples</strong></summary>

```ts
isIri(value: string): true
isIriReference(value: string): true
isAbsoluteIri(value: string): true
```

```js
const { isIri, isIriReference } = require('identifier-js');

console.log(isIri('https://例え.テスト/資料?項目=値#概要')); // true
console.log(isIriReference('../résumé')); // true
```

IRI support permits RFC 3987 Unicode ranges in applicable components. Complete IDNA processing and conversion to a transport URI are separate responsibilities.

</details>

### Parse IRI components

Parse an IRI while preserving its Unicode component values.

<details>
<summary><strong>API and examples</strong></summary>

```ts
parseIri(value: string): IdentifierComponents
parseIriReference(value: string): RelativeIdentifierComponents
parseAbsoluteIri(value: string): AbsoluteIdentifierComponents
```

```js
const { parseIri } = require('identifier-js');

console.log(parseIri('https://usér@例え.テスト:8443/résumé?lang=fr#profil'));
// {
//   scheme: 'https',
//   authority: 'usér@例え.テスト:8443',
//   userinfo: 'usér',
//   host: '例え.テスト',
//   port: '8443',
//   path: '/résumé',
//   query: 'lang=fr',
//   fragment: 'profil'
// }
```

</details>

### Resolve a reference

Resolve a URI or IRI reference against an absolute base using RFC 3986 §5.

<details>
<summary><strong>API and examples</strong></summary>

```ts
resolveReference(
    reference: string,
    base: string,
    strict?: boolean,
    returnParts?: boolean
): string | Record<string, string | undefined>
```

```js
const { resolveReference } = require('identifier-js');

console.log(resolveReference('../images/logo.svg', 'https://example.com/docs/api/page'));
// https://example.com/docs/images/logo.svg

console.log(resolveReference('?page=2', 'https://example.com/items?page=1#current'));
// https://example.com/items?page=2
```

`strict` defaults to `true`. In strict mode, a reference containing a scheme replaces the base identifier even when both schemes are equal. `returnParts` defaults to `false`; when enabled at runtime, the function returns the resolved component object.

Empty authorities, queries, and fragments are preserved during recomposition.

</details>

### Produce absolute and relative forms

Remove a base fragment or derive a relative reference that resolves back to a target.

<details>
<summary><strong>API and examples</strong></summary>

```ts
toAbsoluteReference(reference: string): string
toRelativeReference(target: string, base: string): string
```

```js
const { toAbsoluteReference, toRelativeReference } = require('identifier-js');

console.log(toAbsoluteReference('https://example.com/a/../b#section'));
// https://example.com/b

const target = 'https://example.com/docs/images/logo.svg';
const base = 'https://example.com/docs/api/page';
const relative = toRelativeReference(target, base);
console.log(relative); // ../images/logo.svg
```

When no safe rootless relative form can round-trip to the target, `toRelativeReference` returns the absolute target. Different schemes or authorities also return the target unchanged.

</details>

### Normalization status

`normalizeReference` is reserved for future normalization policy and currently returns its input unchanged.

<details>
<summary><strong>Current behavior and research</strong></summary>

```ts
normalizeReference(reference: string): string
```

```js
const { normalizeReference } = require('identifier-js');

console.log(normalizeReference('HTTP://Example.COM/a/../b'));
// HTTP://Example.COM/a/../b
```

URI/IRI normalization has multiple standards-defined levels and scheme-specific tradeoffs. See [`normalization.md`](normalization.md) for implementation options, unsafe transformations, suggested profiles, and acceptance scenarios.

</details>

### Validate UUID text

Validate the canonical UUID text shape or the stricter UUIDv4 version and variant fields.

<details>
<summary><strong>API and examples</strong></summary>

```ts
isUUID(value: string): true
isUUIDv4(value: string): true
```

```js
const { isUUID, isUUIDv4 } = require('identifier-js');

console.log(isUUID('99c17cbb-656f-564a-940f-1a4568f03487')); // true
console.log(isUUIDv4('123e4567-e89b-42d3-9456-426614174000')); // true
```

`isUUID` validates the `8-4-4-4-12` hexadecimal layout without restricting the version or variant fields. `isUUIDv4` requires version `4` and the RFC variant nibble `8`, `9`, `a`, or `b`.

</details>

## Processing model

The parser builds its validation logic from declarative RFC grammar fragments:

1. Select generic URI/IRI rules or the package's scheme-specific hostname policy.
2. Recursively expand grammar references through `url-templates`.
3. Add named capture groups when parsing is requested.
4. Compile the complete expression with Unicode support.
5. Cache the expression by operation, grammar rule, and scheme-policy class.
6. Validate with `RegExp.test()` or parse with `RegExp.exec()`.
7. Resolve references by component inheritance, path merging, dot-segment removal, and definedness-preserving recomposition.

<details>
<summary><strong>Lazy compilation and cache behavior</strong></summary>

Parsing and validation use separate cached expressions because parsing requires named groups and validation does not. Generic and scheme-specific identifiers also use separate entries.

The first call for an operation/rule/policy combination includes recursive grammar expansion and regular-expression compilation. Later calls reuse the cached expression and are considerably faster. No regular expressions are generated during package import.

</details>

<details>
<summary><strong>Scheme-specific hostname policy</strong></summary>

The following schemes trigger DNS-style ASCII or Unicode label rules instead of the fully generic `reg-name` grammar:

- `http`
- `https`
- `ws`
- `wss`
- `file`

Matching is case-insensitive. Other valid schemes use generic RFC 3986/3987 registered-name syntax.

This policy validates label shape and selected Unicode character classes. It is not complete IDNA processing and does not replace normalization, contextual, bidi, registry, or Punycode validation.

</details>

## Real-world use cases

### Follow HTTP redirects and resource locations

HTTP `Location` values are URI references and can be relative to the original target URI.

<details>
<summary><strong>Example and context</strong></summary>

```js
const { resolveReference } = require('identifier-js');

const requestUrl = 'https://example.com/account/profile';
const location = '../login?return=profile';
console.log(resolveReference(location, requestUrl));
// https://example.com/login?return=profile
```

RFC 9110 uses URI references in `Location`, `Content-Location`, and `Referer`. Correct resolution requires component parsing, path merging, query inheritance rules, and dot-segment removal.

</details>

### Keep document trees portable

Relative references let documents and assets move together without rewriting every internal link.

<details>
<summary><strong>Example and context</strong></summary>

```js
const { resolveReference, toRelativeReference } = require('identifier-js');

const documentUrl = 'https://example.com/manual/chapters/intro.html';
const imageUrl = 'https://example.com/manual/images/diagram.svg';
const relative = toRelativeReference(imageUrl, documentUrl);
console.log(relative); // ../images/diagram.svg
console.log(resolveReference(relative, documentUrl)); // original image URL
```

RFC 3986 identifies portable hypertext document trees as a central use for relative references.

</details>

### Process internationalized identifiers

IRI parsing preserves native-script host, path, query, and fragment text for interfaces and internationalized content.

<details>
<summary><strong>Example and context</strong></summary>

```js
const { parseIri } = require('identifier-js');

const parts = parseIri('https://例え.テスト/検索?q=資料#結果');
console.log(parts.host); // 例え.テスト
console.log(parts.path); // /検索
```

RFC 3987 uses IRIs for internationalized identification while requiring mapping to URIs when a protocol accepts only URI syntax. Cache lookup, browser history, XML identifiers, and indexing are cited comparison contexts.

</details>

### Validate and route protocol identifiers

Component parsing supports policy decisions without unsafe string splitting.

<details>
<summary><strong>Example and context</strong></summary>

```js
const { parseUri } = require('identifier-js');

const parts = parseUri('wss://example.com:8443/events?channel=updates');
console.log(parts.scheme); // wss
console.log(parts.host);   // example.com
console.log(parts.port);   // 8443
console.log(parts.path);   // /events
```

Applications can inspect scheme, authority, path, and query before selecting a connector, enforcing an allowlist, constructing an HTTP request target, or routing to a service. Protocol-specific security and semantic validation remains the application's responsibility.

</details>

### Validate externally supplied UUID text

Lexical UUID checks are useful at API, configuration, and storage boundaries.

<details>
<summary><strong>Example and context</strong></summary>

```js
const { isUUIDv4 } = require('identifier-js');

try {
    isUUIDv4('123e4567-e89b-42d3-9456-426614174000');
    console.log('valid UUIDv4');
} catch (error) {
    console.error(error.message);
}
```

RFC 9562 lists database keys, filenames, system identifiers, and transaction identifiers among common UUID uses. UUID validation does not establish authorization, unpredictability, uniqueness, or safe use as a capability token.

</details>

## Intentional behavior and limitations

<details>
<summary><strong>Validation and parsing boundaries</strong></summary>

- Validators return `true` or throw; they do not return `false`.
- URI functions reject non-ASCII characters where RFC 3986 permits only URI syntax. Use the IRI functions for RFC 3987 Unicode ranges.
- `absolute-URI` and `absolute-IRI` exclude fragments by definition. The complete `URI` and `IRI` functions permit fragments.
- Scheme-specific processing currently specializes hostname syntax; it does not implement every protocol rule for HTTP, WebSocket, or `file` identifiers.
- Scheme-specific Unicode labels are not complete IDNA validation.
- Ports are restricted to an empty value or the numeric range 0–65535. Generic RFC 3986 syntax itself permits any sequence of digits.
- Generic registered names may contain syntax that DNS-style hostnames reject.
- Parsing separates components before any application-level percent decoding.
- The library does not perform network, DNS, filesystem, registry, or authorization checks.

</details>

<details>
<summary><strong>Resolution and conversion boundaries</strong></summary>

- Resolution uses IRI grammar, so Unicode references and bases are accepted.
- Empty authorities, queries, and fragments remain distinct from absent components.
- `strict = false` enables RFC 3986 backward-compatible handling when a reference repeats the base scheme.
- `toAbsoluteReference` requires an identifier containing a scheme and removes its fragment through empty-reference resolution.
- `toRelativeReference` compares scheme and authority text exactly; it does not normalize them first.
- `toRelativeReference` may return an absolute target when a rootless relative path cannot preserve identity.
- `normalizeReference` is intentionally an identity function until a normalization contract is selected.

</details>

<details>
<summary><strong>UUID boundaries</strong></summary>

- `isUUID` validates canonical hexadecimal layout only; it does not enforce a known version or the RFC variant.
- `isUUIDv4` validates the version and variant fields but does not assess random-number quality.
- A syntactically valid UUID is not proof of uniqueness, integrity, authenticity, or authorization.

</details>

## Tests

The current suite contains 418 active tests covering URI/IRI validation and parsing, scheme-specific hosts, IPv4, IPv6, ports, UUIDs, RFC 3986 resolution examples, empty components, absolute conversion, and relative-reference round trips.

The reference-conversion changes were additionally checked against 2,646 combinations of paths, absent/empty/non-empty queries, and absent/empty/non-empty fragments.

Continuous integration materializes the public test suite and runs it on Node.js 20, 22, and 24 across Ubuntu, Windows, and macOS.

<details>
<summary><strong>Tests</strong></summary>

The test suite and supporting ABNF source documents are maintained separately as public workspace data, so they are not included in the package or canonical repository. Users and contributors who need them can materialize them into a cloned repository with [gh-workspace-data](https://github.com/SorinGFS/gh-workspace-data).

Install the project development dependencies:

```sh
npm install
```

Vitest is a development dependency and is not installed for consumers of the published library.

Install the GitHub CLI extension once:

```sh
gh extension install SorinGFS/gh-workspace-data
```

Then run the workspace-data commands from the repository:

```sh
gh workspace-data init
gh workspace-data load
```

The tests are materialized as ordinary local files under `#/public/tests/`, and the supporting documents are available under `#/public/docs/`. Both remain excluded from the canonical Git repository.

Run the materialized suite:

```sh
npm test
```

`npm test` exits unsuccessfully when any discovered test, hook, or test-module import fails.

</details>

## Authoritative references

- [RFC 3986 — Uniform Resource Identifier: Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 3987 — Internationalized Resource Identifiers](https://www.rfc-editor.org/rfc/rfc3987)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [RFC 8089 — The `file` URI Scheme](https://www.rfc-editor.org/rfc/rfc8089)
- [RFC 9562 — Universally Unique IDentifiers](https://www.rfc-editor.org/rfc/rfc9562)

## Disclaimer

Validation establishes conformance with this implementation's syntax and policy. It does not establish that an identifier is registered, reachable, trustworthy, safe to dereference, or appropriate for a particular protocol operation.
