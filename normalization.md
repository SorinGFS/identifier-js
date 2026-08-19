# Identifier normalization research notes

These notes summarize the standards and design choices that should be resolved before implementing `normalizeReference`. They are research material, not the current API contract.

## Central constraint

There is no universal canonical form for every URI or IRI. RFC 3986 defines comparison in levels because a transformation that is safe for one scheme or application can merge distinct identifiers in another.

A normalizer should minimize false negatives without creating false positives:

1. **Simple comparison** — compare characters exactly.
2. **Syntax-based normalization** — apply transformations licensed by generic URI syntax.
3. **Scheme-based normalization** — apply additional equivalences defined by a scheme.
4. **Protocol-based normalization** — use equivalences established by observed protocol behavior.

`normalizeReference` should implement only an explicitly selected level. Protocol-derived normalization does not belong in a deterministic identifier library.

Reference: [RFC 3986 §6](https://www.rfc-editor.org/rfc/rfc3986#section-6).

## Generic syntax-based normalization

The following transformations are suitable candidates for a generic URI profile.

### Scheme and host case

- Lowercase the scheme.
- Lowercase the host.
- Do not lowercase userinfo, path, query, or fragment.
- Preserve Unicode component case unless a scheme or external policy defines equivalence.

Example:

```text
HTTP://WWW.EXAMPLE.COM/ → http://www.example.com/
```

Reference: RFC 3986 §6.2.2.1.

### Percent-triplet case

Uppercase hexadecimal letters in every valid percent triplet:

```text
%3a → %3A
%2f → %2F
```

This changes presentation, not the represented octet.

Reference: RFC 3986 §§2.1 and 6.2.2.1.

### Decode percent-encoded unreserved characters

Decode a percent triplet only when it represents an ASCII unreserved character:

```text
ALPHA / DIGIT / "-" / "." / "_" / "~"
```

Examples:

```text
%63 → c
%7E → ~
```

Do not generically decode reserved characters. `%2F` and `/`, for example, can have different structural meanings.

Parse components before decoding so an encoded delimiter cannot be mistaken for syntax. Never decode the same data twice.

References: RFC 3986 §§2.2–2.4 and 6.2.2.2.

### Remove dot segments

Apply the RFC 3986 §5.2.4 algorithm to the parsed path:

```text
/a/b/c/./../../g → /a/g
```

Only complete `.` and `..` path segments are special. Do not process similar text in a query or fragment:

```text
g?y/../x
g#s/../x
```

References: RFC 3986 §§5.2.4 and 6.2.2.3.

### Preserve component presence

Recomposition must distinguish an absent component from a present but empty component:

```text
https://example.com/path
https://example.com/path?
https://example.com/path#
```

The same applies to an empty authority. Component delimiters must be emitted based on definedness, not truthiness.

Reference: RFC 3986 §5.3.

## Scheme-based profiles

Scheme-specific transformations should not run unless the scheme profile is selected or automatic scheme handling is part of the documented contract.

### HTTP and HTTPS

RFC 9110 permits these normal forms:

- lowercase scheme and host;
- remove port `80` from `http`;
- remove port `443` from `https`;
- remove an explicitly empty port;
- use `/` when authority is present and path is empty;
- decode percent-encoded unreserved characters;
- preserve all other component case.

Examples:

```text
HTTP://Example.COM:80 → http://example.com/
https://example.com:443/a → https://example.com/a
```

An HTTP request target does not include a fragment, but identifier normalization should not silently discard a fragment unless the selected operation specifically produces a request target.

Userinfo in HTTP and HTTPS targets is deprecated and should be rejected or reported by an HTTP policy rather than silently normalized away.

Reference: [RFC 9110 §§4.2.1–4.2.5](https://www.rfc-editor.org/rfc/rfc9110#section-4.2).

### WS and WSS

Potential scheme-specific rules include:

- default port `80` for `ws`;
- default port `443` for `wss`;
- `/` as the resource path when the path is empty;
- no fragment identifiers;
- IDN-to-ASCII handling under an explicitly selected hostname policy.

Fragment rejection is validation, not normalization. A normalizer should not repair a WebSocket URI by silently deleting its fragment.

Reference: [RFC 6455 §3](https://www.rfc-editor.org/rfc/rfc6455#section-3).

### File

A generic `file` normalizer is not recommended. Behavior varies by platform and filesystem:

- local empty authority versus `localhost`;
- POSIX roots;
- Windows drive-letter case and UNC paths;
- path case sensitivity;
- backslash handling;
- platform-specific Unicode normalization;
- reserved device names and namespace paths.

Require an explicit platform profile before applying these transformations.

Reference: [RFC 8089](https://www.rfc-editor.org/rfc/rfc8089).

### Other schemes

Apply only generic syntax normalization unless the scheme's authoritative specification defines additional equivalences. Do not infer default ports, path case rules, or authority behavior from a similar scheme.

## IRI and Unicode decisions

RFC 3987 recommends that creators produce IRIs in NFC, but comparison code must not arbitrarily normalize an existing Unicode IRI. Normalizing third-party text can merge identifiers that were intentionally distinct.

Recommended policy:

- do not apply Unicode normalization by default;
- offer NFC only as an explicit creation or application-policy option;
- do not offer NFKC as a generic identifier transformation;
- retain the original IRI when a normalized form is generated only as a comparison key.

### IRI-to-URI mapping is a separate operation

Mapping an IRI to a URI is not merely normalization:

1. encode non-ASCII `ucschar` and `iprivate` characters as UTF-8;
2. percent-encode each UTF-8 octet as `%HH`;
3. preserve existing valid percent triplets and URI-allowed characters;
4. apply an explicit IDNA policy to internationalized hostnames when required.

The reverse operation must decode only valid UTF-8 and must preserve encoded reserved characters. It must not guess legacy encodings.

Reference: [RFC 3987 §§3 and 5](https://www.rfc-editor.org/rfc/rfc3987).

## Transformations excluded by default

A generic normalizer should not:

- decode percent-encoded reserved characters;
- lowercase userinfo, paths, queries, or fragments;
- sort, deduplicate, or reinterpret query parameters;
- remove empty query or fragment delimiters;
- add or remove trailing slashes without scheme authority;
- apply Unicode NFC or NFKC automatically;
- convert an internationalized hostname without a defined IDNA version and policy;
- remove userinfo rather than reporting it;
- infer filesystem semantics for `file`;
- infer equivalence from redirects or successful retrievals;
- convert a relative reference without a supplied base.

## Suggested API design

Avoid a single aggressive operation. Two viable designs are:

### Explicit profiles

```js
normalizeReference(reference, {
    profile: 'generic', // generic | http | https | ws | wss
    unicodeNormalization: false,
});
```

A `file` profile should additionally require a platform policy.

### Separate operations

```js
normalizeReference(reference);          // generic syntax only
normalizeHttpReference(reference);      // HTTP/HTTPS scheme rules
normalizeWebSocketReference(reference); // WS/WSS scheme rules
iriToUri(reference, options);            // explicit representation mapping
```

Separate operations are harder to misuse and make compatibility changes more visible. A profile-based API is easier to extend. The final choice should follow the expected consumers.

## Suggested generic processing order

1. Parse and retain whether authority, query, and fragment are absent or empty.
2. Lowercase scheme and host where generic syntax permits it.
3. Normalize percent-triplet hexadecimal case.
4. Decode percent-encoded ASCII unreserved characters component by component.
5. Remove dot segments from the path.
6. Apply an explicitly selected scheme profile.
7. Apply Unicode normalization only when explicitly requested.
8. Recompose while preserving empty components.
9. Validate the normalized output under the same identifier and scheme policy.
10. Optionally verify idempotence:

```js
normalizeReference(normalizeReference(value)) === normalizeReference(value)
```

## Acceptance scenarios

A generic profile should include at least these cases:

```text
HTTP://Example.COM/%7euser       → http://example.com/~user
http://example.com/a/./b/../c   → http://example.com/a/c
http://example.com/path?        → http://example.com/path?
http://example.com/path#        → http://example.com/path#
http://example.com/%2F          → http://example.com/%2F
```

An HTTP profile can additionally include:

```text
http://example.com:80           → http://example.com/
https://example.com:443/a       → https://example.com/a
```

Cases that must remain distinct under generic normalization include:

```text
http://example.com/a            ≠ http://example.com/a/
http://example.com/path         ≠ http://example.com/path?
http://example.com/%2F          ≠ http://example.com//
http://example.com/A            ≠ http://example.com/a
```

Testing should cover URI and IRI forms, empty components, rootless paths, percent triplets, Unicode supplementary characters, idempotence, and normalization followed by parsing/recomposition.

## Open decisions

Before implementation, decide:

1. Whether `normalizeReference` is generic-only or selects profiles automatically by scheme.
2. Whether output preserves the input category: URI versus IRI.
3. Whether relative references are normalized in place or require a base and become absolute.
4. Whether Unicode NFC is offered, and for which creation contexts.
5. Whether IDNA conversion belongs here or in a dedicated hostname dependency.
6. Whether comparison keys and display/transport identifiers use separate APIs.
7. Whether unsupported scheme profiles throw, fall back to generic rules, or require an explicit option.
8. Whether current callers can rely on `normalizeReference` remaining an identity function until a major release.

## Authoritative references

- [RFC 3986 — Uniform Resource Identifier: Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 3987 — Internationalized Resource Identifiers](https://www.rfc-editor.org/rfc/rfc3987)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [RFC 8089 — The `file` URI Scheme](https://www.rfc-editor.org/rfc/rfc8089)
