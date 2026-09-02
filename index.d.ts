// Declare the public validation, parsing, resolution, and normalization API.
/** @throws {Error} If the UUID is invalid. */
export const isUUID: (string: string) => true;
/** @throws {Error} If the UUID-v4 is invalid. */
export const isUUIDv4: (string: string) => true;

/** @throws {Error} If the URI is invalid. */
export const isUri: (uri: string) => true;
/** @throws {Error} If the URI-reference is invalid. */
export const isUriReference: (uriReference: string) => true;
/** @throws {Error} If the absolute-URI is invalid. */
export const isAbsoluteUri: (uri: string) => true;

/** @throws {Error} If the URI is invalid. */
export const parseUri: (uri: string) => ParsedIdentifierComponents;
/** @throws {Error} If the URI-reference is invalid. */
export const parseUriReference: (uriReference: string) => ParsedRelativeIdentifierComponents;
/** @throws {Error} If the absolute-URI is invalid. */
export const parseAbsoluteUri: (uri: string) => ParsedAbsoluteIdentifierComponents;

/** @throws {Error} If the IRI is invalid. */
export const isIri: (iri: string) => true;
/** @throws {Error} If the IRI-reference is invalid. */
export const isIriReference: (iriReference: string) => true;
/** @throws {Error} If the absolute-IRI is invalid. */
export const isAbsoluteIri: (iri: string) => true;

/** @throws {Error} If the IRI is invalid. */
export const parseIri: (iri: string) => ParsedIdentifierComponents;
/** @throws {Error} If the IRI-reference is invalid. */
export const parseIriReference: (iriReference: string) => ParsedRelativeIdentifierComponents;
/** @throws {Error} If the absolute-IRI is invalid. */
export const parseAbsoluteIri: (iri: string) => ParsedAbsoluteIdentifierComponents;
/** @throws {Error} If the base or the reference is invalid. */
export function resolveReference(reference: string, base: string, strict?: boolean, returnParts?: false): string;
export function resolveReference(reference: string, base: string, strict: boolean | undefined, returnParts: true): IdentifierComponents;
export function resolveReference(reference: string, base: string, strict: boolean | undefined, returnParts: boolean | undefined): string | IdentifierComponents;
/** @throws {Error} If the reference is invalid. */
export const toAbsoluteReference: (reference: string) => string;
/** @throws {Error} If the base or the reference is invalid. */
export const toRelativeReference: (target: string, base: string) => string;

/** Map a parsed non-empty registered-name host to caller-owned text. */
export type RegNameMapper = (regName: string) => string;

/** Select optional URI output and registered-name mapping for parsed-result normalization. */
export type NormalizeOptions = {
    toUri?: boolean;
    mapRegName?: RegNameMapper;
};

/** Provide lazy RFC normalization and optional IRI-to-URI output on a parsed result. */
export type NormalizableReference = {
    normalize(options?: NormalizeOptions): string;
};

// Describe component presence for complete, relative, and fragment-free absolute identifiers.
export type IdentifierComponents = {
    scheme: string;
    authority?: string;
    userinfo?: string;
    host?: string;
    port?: string;
    path: string;
    query?: string;
    fragment?: string;
};

export type RelativeIdentifierComponents = {
    scheme?: string;
    authority?: string;
    userinfo?: string;
    host?: string;
    port?: string;
    path: string;
    query?: string;
    fragment?: string;
};

export type AbsoluteIdentifierComponents = {
    scheme: string;
    authority?: string;
    userinfo?: string;
    host?: string;
    port?: string;
    path: string;
    query?: string;
};

export type ParsedIdentifierComponents = IdentifierComponents & NormalizableReference;
export type ParsedRelativeIdentifierComponents = RelativeIdentifierComponents & NormalizableReference;
export type ParsedAbsoluteIdentifierComponents = AbsoluteIdentifierComponents & NormalizableReference;
