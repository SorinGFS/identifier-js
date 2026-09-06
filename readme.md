---

title: Identifier JS

description: An RFC 3986 and RFC 3987 parser, validator, normalizer, and reference resolver for Node.js and browser bundles.

---

# Identifier JS

`identifier-js` is a URI/IRI parser, validator, normalizer, resolver, and composer based on RFC [3986](https://www.rfc-editor.org/rfc/rfc3986) and RFC [3987](https://www.rfc-editor.org/rfc/rfc3987). Its recognized HTTP, WebSocket, and `file` schemes retain the documented hostname-policy restrictions below. It provides:

- URI and IRI validation;
- parsed identifier components;
- conservative syntax normalization, recognized-scheme port/path forms, and a registered-name extension point;
- RFC 3986 reference resolution and dot-segment removal;
- relative-reference generation with resolution round-trip guarantees for supported forms;
- UUID and UUIDv4 lexical validation;
- lazily compiled and cached regular expressions.

The package is synchronous, CommonJS, and supports Node.js 24 or newer. Browser use requires bundling; target browsers must support Unicode regular expressions and duplicate named capture groups in mutually exclusive alternatives. This includes Chrome and Edge 125+, Firefox 129+, Safari 17+, and corresponding newer releases.

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
parseUri(value: string): ParsedIdentifierComponents
parseUriReference(value: string): ParsedRelativeIdentifierComponents
parseAbsoluteUri(value: string): ParsedAbsoluteIdentifierComponents
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

IRI support permits the RFC 3987 Unicode ranges in applicable components and preserves their parsed Unicode spelling.

</details>

### Parse IRI components

Parse an IRI while preserving its Unicode component values.

<details>
<summary><strong>API and examples</strong></summary>

```ts
parseIri(value: string): ParsedIdentifierComponents
parseIriReference(value: string): ParsedRelativeIdentifierComponents
parseAbsoluteIri(value: string): ParsedAbsoluteIdentifierComponents
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
// https://example.com/a/../b

const target = 'https://example.com/docs/images/logo.svg';
const base = 'https://example.com/docs/api/page';
const relative = toRelativeReference(target, base);
console.log(relative); // ../images/logo.svg
```

When no safe rootless relative form can round-trip to the target, `toRelativeReference` returns the absolute target. Different schemes or authorities also return the target unchanged. Complete dot segments in either path also trigger this fallback because RFC resolution removes them. For those inputs, resolving the result produces the same identifier as resolving the target directly; lexical dot-segment spelling is not preserved.

</details>

### Normalize parsed URI and IRI references

Every URI and IRI parse result provides an optional, non-enumerable `normalize()` method. Parsing remains usable by itself; normalization runs only when the method is called and returns a string without modifying the parsed components.

<details>
<summary><strong>API, behavior, and examples</strong></summary>

```ts
type RegNameMapper = (regName: string) => string

type NormalizeTransform = 'URI' | 'IRI'

type NormalizeOptions = {
    transform?: NormalizeTransform
    mapRegName?: RegNameMapper
}

interface NormalizableReference {
    normalize(options?: NormalizeOptions): string
}
```

```js
const { parseIriReference } = require('identifier-js');

const parsed = parseIriReference('HTTP://Example.COM/%7e/a/../b?x=%2f#%41');
console.log(parsed.host); // Example.COM
console.log(parsed.normalize());
// http://example.com/~/b?x=%2F#A
console.log(parsed.path); // /%7e/a/../b
```

The method is available from `parseUri`, `parseUriReference`, `parseAbsoluteUri`, `parseIri`, `parseIriReference`, and `parseAbsoluteIri`.

Normalization implements RFC 3986 and RFC 3987 syntax normalization for scheme and host case, percent triplets, ASCII unreserved characters, path dot segments, and component recomposition. IPv6 literals use RFC 5952 text. HTTP(S) default ports and empty paths follow RFC 9110; WS(S) defaults and resource-name paths follow RFC 6455.

For a non-empty registered-name host, `mapRegName` receives the current host spelling before built-in normalization. The mapper exclusively owns validation, representation, and host-kind policy for its returned string. Apart from enforcing the declared string return type, this package does not check whether mapper output is non-empty, remains a registered name, introduces delimiters, resembles an IP address, or satisfies a scheme-specific hostname grammar.

With `transform: 'URI'`, non-ASCII userinfo, mapper output, path, query, and fragment text becomes uppercase UTF-8 percent triplets under RFC 3987 §3.1. With `transform: 'IRI'`, eligible percent-encoded ASCII unreserved characters and strictly legal UTF-8 sequences become IRI characters under RFC 3987 §3.2; reserved, malformed, disallowed, and non-UTF-8 octets remain encoded. Private-use characters are decoded only in queries, and forbidden bidirectional formatting characters remain encoded. A mapper can supply the desired Unicode or ASCII hostname representation; this package does not enforce that policy or validate the complete normalized result.

See [`normalization.md`](normalization.md) for the exact RFC section mapping and examples.

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

`isUUID` validates the `8-4-4-4-12` hexadecimal layout. `isUUIDv4` additionally requires version `4` and the RFC variant nibble `8`, `9`, `a`, or `b`.

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

Matching is case-insensitive. Other valid schemes use generic RFC 3986/3987 registered-name syntax. RFC 8089's empty `file` authority is accepted when followed by an absolute path, as in `file:///path`; empty hosts remain rejected for HTTP and WebSocket schemes.

Parsing validates DNS-style label shape and the selected RFC 3987 Unicode character classes. A registered-name mapper runs later during optional normalization, and its returned string is not submitted to this hostname policy again.

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

Component parsing provides scheme, authority, host, port, path, and query fields for policy decisions.

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

Applications can inspect scheme, authority, path, and query before selecting a connector, enforcing an allowlist, constructing an HTTP request target, or routing to a service.

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

RFC 9562 lists database keys, filenames, system identifiers, and transaction identifiers among common UUID uses.

</details>

## Standards behavior

<details>
<summary><strong>Validation and parsing</strong></summary>

- Generic URI syntax follows RFC 3986 character and component grammar; recognized schemes select the documented hostname profile.
- Generic IRI syntax follows the RFC 3987 Unicode extensions to URI grammar; recognized schemes select the documented hostname profile.
- Validators return `true` or throw at the first grammar violation.
- `absolute-URI` and `absolute-IRI` use the fragment-free grammar defined by their RFCs; complete URI and IRI operations accept fragments.
- Port syntax follows RFC 3986 `port = *DIGIT`, including empty and leading-zero values.
- Parsing records absent optional components as `undefined` and present-empty components as empty strings.

</details>

<details>
<summary><strong>Resolution, conversion, and normalization</strong></summary>

- `resolveReference` implements RFC 3986 §5 component inheritance, path merging, dot-segment removal, and recomposition for URI and IRI text.
- An empty reference path inherits the base path unchanged.
- `strict = false` implements RFC 3986 §5.2.2 backward-compatible same-scheme handling.
- `toAbsoluteReference` removes the fragment from an identifier containing a scheme.
- `toRelativeReference` generates a reference whose RFC resolution equals the target resolution for supported forms.
- `normalize()` implements the applicable case, percent-encoding, and path-segment rules from RFC 3986 §§6.2.2.1–6.2.2.3 and RFC 3987 §§5.3.2.1, 5.3.2.3–5.3.2.4, RFC 3987 §§3.1–3.2 URI/IRI representation transformation, RFC 5952 IPv6 text, RFC 9110 HTTP(S) port/path forms, and RFC 6455 WS(S) port/resource-name forms.

</details>

<details>
<summary><strong>UUID validation</strong></summary>

- `isUUID` validates the RFC 9562 hexadecimal `8-4-4-4-12` text layout.
- `isUUIDv4` additionally validates version `4` and the RFC variant bits.

</details>

## Verification

Tests, benchmarks, and supporting ABNF documents are maintained in [SorinGFS/public-data](https://github.com/SorinGFS/public-data) rather than in the package or canonical repository. The [gh-workspace-data](https://github.com/SorinGFS/gh-workspace-data) extension materializes those concerns together with the shared `#/version-layers.js` runtime required by both dispatchers.

<details>
<summary><strong>gh-workspace-data usage</strong></summary>

Install the GitHub CLI extension once:

```sh
gh extension install SorinGFS/gh-workspace-data
```

Initialize and load workspace data from the cloned project repository:

```sh
gh workspace-data init
gh workspace-data load
```

The extension materializes ordinary local files under `#/public/tests/`, `#/public/benchmarks/`, and `#/public/docs/`, while `#/version-layers.js` provides common deterministic version-layer discovery. The generated `#/` namespace remains excluded from the canonical Git repository and npm package.

Run `gh workspace-data load` again to refresh materialized data after public-data changes or an extension upgrade.

</details>

### Tests

The active suite contains 3,137 tests covering URI/IRI validation, parsing, generic normalization, bidirectional URI/IRI representation transformation, scheme-specific hosts, IPv4, IPv6, IPvFuture, ports, UUIDs, RFC 3986 resolution examples, empty components, absolute conversion, and relative-reference round trips, including 2,646 generated combinations of target/base paths, query-presence states, and target-fragment states across equivalent URI and IRI families.

<details>
<summary><strong>Test details</strong></summary>

Install package dependencies and run the materialized suite:

```sh
npm install
npm test
```

The suite uses the `node:test` module built into Node.js and requires no separate test-runner dependency. Its deterministic dispatcher delegates version-layer selection, numbered-fixture traversal, and explicit concern discovery to the `gh-workspace-data v0.5.0` runtime. The materialized `#/public/tests/README.md` documents fixture discovery, version eligibility, ordering, callback configuration, and suite registration.

`npm test` exits unsuccessfully when configuration, fixture loading, suite registration, or a test fails. Continuous integration runs the suite on Node.js 24 and 26 across Ubuntu, Windows, and macOS.

</details>

### Benchmarks

The materialized benchmark suite provides portable, version-aware measurements for every exported function plus isolated package loading, reporting initial-call behavior, warmed latency statistics, integer throughput, workload counts, representative inputs, and environment metadata.

<details>
<summary><strong>Benchmark details</strong></summary>

Run the standard workload:

```sh
npm run benchmark
```

Run a reduced workload with machine-readable output for CI smoke checks or artifacts:

```sh
node ./#/public/benchmarks --quick --json
```

Direct invocation also supports an explicit iteration count; `npm run benchmark` retains the standard 100,000 iterations per sample:

```sh
node ./#/public/benchmarks --iterations 250000
```

The generic coordinator delegates version-layer selection and ordered concern discovery to the `gh-workspace-data v0.5.0` runtime. The materialized `#/public/benchmarks/README.md` documents concern registration, version eligibility, workload controls, measurement semantics, output fields, and guidance for interpreting results from noisy CI runners.

</details>

## Authoritative references

- [RFC 3986 — Uniform Resource Identifier: Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 3987 — Internationalized Resource Identifiers](https://www.rfc-editor.org/rfc/rfc3987)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [RFC 8089 — The `file` URI Scheme](https://www.rfc-editor.org/rfc/rfc8089)
- [RFC 9562 — Universally Unique IDentifiers](https://www.rfc-editor.org/rfc/rfc9562)
