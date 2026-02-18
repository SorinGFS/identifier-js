---

title: Identifier JS

description: A RFC3986 / RFC3987 compliant fast parser/validator/resolver/composer for NodeJS and browser.

---

## Overview

A fully RFC [3986](https://datatracker.ietf.org/doc/html/rfc3986.html)/[3897](https://datatracker.ietf.org/doc/html/rfc3987.html) compliant URI/IRI parser, validator, resolver and composer, along with other identifier utilities.

## Install

```bash title="console"
npm i identifier-js
```

## API

Exports are documented below.

### URI (RFC 3986)

#### Validation

Validate a URI:
- isUri: (value: string) => boolean

Validate a URI reference (absolute or relative):
- isUriReference: (value: string) => boolean

Validate an absolute URI (must include scheme):
- isAbsoluteUri: (value: string) => boolean

#### Parsing

Parse a URI into structured components:
- parseUri: (value: string) => IdentifierComponents

Parse a URI reference into structured components:
- parseUriReference: (value: string) => RelativeIdentifierComponents

Parse an absolute URI (must include scheme):
- parseAbsoluteUri: (value: string) => AbsoluteIdentifierComponents

### IRI (RFC 3987)

#### Validation

Validate an IRI:
- isIri: (value: string) => boolean

Validate an IRI reference (absolute or relative):
- isIriReference: (value: string) => boolean

Validate an absolute IRI (must include scheme):
- isAbsoluteIri: (value: string) => boolean

#### Parsing

Parse an IRI into structured components:
- parseIri: (value: string) => IdentifierComponents

Parse an IRI reference into structured components:
- parseIriReference: (value: string) => RelativeIdentifierComponents

Parse an absolute IRI (must include scheme):
- parseAbsoluteIri: (value: string) => AbsoluteIdentifierComponents

### Reference Utilities (URI/IRI)

Normalize a URI or IRI reference:
- normalizeReference: (reference: string) => string

Resolve a reference against a base identifier:
- resolveReference: (reference: string, base: string, strict?: boolean, returnParts?: boolean) => string

**Note:** 
- strict enables strict resolution behavior.
- returnParts returns structured components instead of a string.

Convert a reference into absolute form:
- toAbsoluteReference: (reference: string) => string

Compute a relative reference from base to target:
- toRelativeReference: (target: string, base: string) => string

### UUID

Validate a UUID (any version):
- isUUID: (value: string) => boolean

Validate a UUID version 4:
- isUUIDv4: (value: string) => boolean

## Testing

- npm test