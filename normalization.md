# URI and IRI normalization

Parsed URI and IRI results expose `normalize()` for syntax-based normalization, the implemented HTTP, HTTPS, WS, and WSS scheme rules, and optional RFC 3987 URI/IRI representation transformation. The method returns a string and leaves the parsed components unchanged.

## API

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

The method is available on results from:

- `parseUri`
- `parseUriReference`
- `parseAbsoluteUri`
- `parseIri`
- `parseIriReference`
- `parseAbsoluteIri`

It is non-enumerable and reads the result object's current component properties when called.

```js
const { parseIriReference } = require('identifier-js');

const parsed = parseIriReference(
    'HTTP://Example.COM/%7e/a/../b?x=%2f#%41',
);

parsed.normalize();
// http://example.com/~/b?x=%2F#A

parsed.path;
// /%7e/a/../b
```

## RFC syntax normalization

| Behavior | Implementation | Source |
| --- | --- | --- |
| Case normalization | Lowercase the scheme and an ASCII-only host. Uppercase hexadecimal letters in percent triplets. | [RFC 3986 §6.2.2.1](https://www.rfc-editor.org/rfc/rfc3986#section-6.2.2.1), [RFC 3987 §5.3.2.1](https://www.rfc-editor.org/rfc/rfc3987#section-5.3.2.1) |
| Percent-encoded unreserved characters | Decode percent triplets representing ASCII letters, digits, `-`, `.`, `_`, or `~`. Retain percent encoding for reserved octets. | [RFC 3986 §§2.2–2.4 and 6.2.2.2](https://www.rfc-editor.org/rfc/rfc3986#section-6.2.2.2), [RFC 3987 §5.3.2.3](https://www.rfc-editor.org/rfc/rfc3987#section-5.3.2.3) |
| Path segments | Apply the RFC dot-segment algorithm where the parsed reference can be normalized independently. Preserve unresolved rootless-relative path semantics. | [RFC 3986 §§5.2.4 and 6.2.2.3](https://www.rfc-editor.org/rfc/rfc3986#section-5.2.4), [RFC 3987 §5.3.2.4](https://www.rfc-editor.org/rfc/rfc3987#section-5.3.2.4) |
| Component recomposition | Emit authority, query, and fragment delimiters from component presence, including present-empty components. | [RFC 3986 §5.3](https://www.rfc-editor.org/rfc/rfc3986#section-5.3) |
| IPv6 text | Suppress leading zeroes, compress the longest zero run with first-run tie breaking, and use lowercase hexadecimal. Known embedded-IPv4 forms use mixed notation. | [RFC 5952 §§4–5](https://www.rfc-editor.org/rfc/rfc5952#section-4) |
| IRI-to-URI output | With `transform: 'URI'`, encode non-ASCII authority, path, query, and fragment characters as uppercase UTF-8 percent triplets. | [RFC 3987 §3.1](https://www.rfc-editor.org/rfc/rfc3987#section-3.1) |
| URI-to-IRI output | With `transform: 'IRI'`, decode percent-encoded ASCII unreserved characters and strictly legal UTF-8 sequences permitted in each destination component. Retain reserved, malformed, disallowed, and non-UTF-8 octets. | [RFC 3987 §3.2](https://www.rfc-editor.org/rfc/rfc3987#section-3.2) |

Without a mapper, normalization retains the parser's host classification as an IP literal, IPv4 address, or registered name. IPvFuture literals use generic host case normalization. Existing non-ASCII IRI host text is retained unless the registered-name mapper supplies another value.

## HTTP and HTTPS

For `http` and `https`, normalization applies the generic rules and these scheme rules:

| Input component | Output | Source |
| --- | --- | --- |
| Empty port | Omit the port delimiter. | [RFC 3986 §3.2.3](https://www.rfc-editor.org/rfc/rfc3986#section-3.2.3) |
| `http` port numerically equal to `80` | Omit the port. | [RFC 9110 §4.2.3](https://www.rfc-editor.org/rfc/rfc9110#section-4.2.3) |
| `https` port numerically equal to `443` | Omit the port. | [RFC 9110 §4.2.3](https://www.rfc-editor.org/rfc/rfc9110#section-4.2.3) |
| Empty authority path | Use `/`. | [RFC 9110 §4.2.3](https://www.rfc-editor.org/rfc/rfc9110#section-4.2.3) |

Decimal port comparison includes leading-zero spellings.

```text
HTTP://Example.COM:80                → http://example.com/
https://example.com:00443/a          → https://example.com/a
http://example.com:/a                → http://example.com/a
```

## WS and WSS

For `ws` and `wss`, normalization applies the generic rules and these scheme rules:

| Input component | Output | Source |
| --- | --- | --- |
| Empty port | Omit the port delimiter. | [RFC 3986 §3.2.3](https://www.rfc-editor.org/rfc/rfc3986#section-3.2.3) |
| `ws` port numerically equal to `80` | Omit the port. | [RFC 3986 §6.2.3](https://www.rfc-editor.org/rfc/rfc3986#section-6.2.3), [RFC 6455 §3](https://www.rfc-editor.org/rfc/rfc6455#section-3) |
| `wss` port numerically equal to `443` | Omit the port. | [RFC 3986 §6.2.3](https://www.rfc-editor.org/rfc/rfc3986#section-6.2.3), [RFC 6455 §3](https://www.rfc-editor.org/rfc/rfc6455#section-3) |
| Empty authority path | Use `/` as the resource-name path. | [RFC 6455 §3](https://www.rfc-editor.org/rfc/rfc6455#section-3) |

```text
WS://Example.COM:80                  → ws://example.com/
wss://example.com:00443/chat         → wss://example.com/chat
ws://example.com?channel=updates     → ws://example.com/?channel=updates
```

## Registered-name mapping and representation transformation

For a non-empty registered-name host, `options.mapRegName` is called once with the current host spelling before built-in normalization. IP literals, IPv4 addresses, absent hosts, and empty hosts bypass the mapper.

The mapper owns the returned text and all registered-name validation, representation, and host-kind policy. This package enforces only the declared string return type. It does not check whether mapper output is non-empty, remains a registered name, introduces component delimiters, resembles an IP address, or satisfies a scheme-specific hostname grammar. The returned string then receives percent-triplet and ASCII host-case normalization. Mapper exceptions propagate unchanged.

```js
const mapped = parseIriReference('x://example').normalize({
    mapRegName: () => 'Application Defined',
});

mapped;
// x://application defined
```

The example deliberately produces text that is not a valid URI or IRI; validating or selecting mapper output belongs to the application.

With `transform: 'URI'`, retained reserved and non-ASCII percent triplets remain encoded, and literal non-ASCII userinfo, mapper output, path, query, and fragment text becomes uppercase UTF-8 percent triplets. A mapper can supply an ASCII hostname when its consuming scheme requires one; this package does not validate mapper output against that scheme.

```js
const { parseIri, parseUri } = require('identifier-js');

parseIri('x:/café?q=資料#résultat').normalize({ transform: 'URI' });
// x:/caf%C3%A9?q=%E8%B3%87%E6%96%99#r%C3%A9sultat

parseUri('x:/caf%C3%A9?q=%E8%B3%87%E6%96%99#r%C3%A9sultat').normalize({ transform: 'IRI' });
// x:/café?q=資料#résultat
```

With `transform: 'IRI'`, conversion uses UTF-8 exclusively and decodes as many eligible percent-encoded characters as possible. Encoded reserved characters, `%25`, malformed or incomplete UTF-8, legacy character encodings, Unicode outside the RFC 3987 component repertoire, and forbidden bidirectional formatting characters remain percent encoded. Private-use characters are decoded only in the query component. The hexadecimal letters of retained triplets are uppercase.

The IRI transformation decodes percent-encoded ASCII unreserved characters even when this changes a registered name into IPv4-looking text. Without an explicit transformation, normalization preserves that registered-name host classification.

ACE-to-Unicode and Unicode-to-ACE registered-name conversion remain application policy. `mapRegName` runs before the selected representation transformation, so applications can provide the appropriate mapping in either direction.

## Verification

The normalization suite covers URI and IRI parser results, component presence, percent triplets, dot segments, host kinds, RFC 5952 output, HTTP and WebSocket scheme rules, registered-name mapping, both RFC representation transformations, malformed UTF-8 retention, component-specific Unicode repertoires, component non-mutation, round trips, and idempotence.

```sh
npm test
```

## References

- [RFC 3986 — Uniform Resource Identifier: Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 3987 — Internationalized Resource Identifiers](https://www.rfc-editor.org/rfc/rfc3987)
- [RFC 5952 — A Recommendation for IPv6 Address Text Representation](https://www.rfc-editor.org/rfc/rfc5952)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
