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
export const parseUri: (uri: string) => IdentifierComponents;
/** @throws {Error} If the URI-reference is invalid. */
export const parseUriReference: (uriReference: string) => RelativeIdentifierComponents;
/** @throws {Error} If the absolute-URI is invalid. */
export const parseAbsoluteUri: (uri: string) => AbsoluteIdentifierComponents;

/** @throws {Error} If the IRI is invalid. */
export const isIri: (iri: string) => true;
/** @throws {Error} If the IRI-reference is invalid. */
export const isIriReference: (iriReference: string) => true;
/** @throws {Error} If the absolute-IRI is invalid. */
export const isAbsoluteIri: (iri: string) => true;

/** @throws {Error} If the IRI is invalid. */
export const parseIri: (iri: string) => IdentifierComponents;
/** @throws {Error} If the IRI-reference is invalid. */
export const parseIriReference: (iriReference: string) => RelativeIdentifierComponents;
/** @throws {Error} If the absolute-IRI is invalid. */
export const parseAbsoluteIri: (iri: string) => AbsoluteIdentifierComponents;

/** @throws {Error} If the reference is invalid. */
export const normalizeReference: (reference: string) => string;
/** @throws {Error} If the base or the reference is invalid. */
export const resolveReference: (reference: string, base: string, strict?: boolean, returnParts?: boolean) => string;
/** @throws {Error} If the reference is invalid. */
export const toAbsoluteReference: (reference: string) => string;
/** @throws {Error} If the base or the reference is invalid. */
export const toRelativeReference: (target: string, base: string) => string;

type IdentifierComponents = {
    scheme: string;
    authority: string;
    userinfo?: string;
    host: string;
    port?: string;
    path: string;
    query?: string;
    fragment?: string;
};

type RelativeIdentifierComponents = {
    scheme?: string;
    authority?: string;
    userinfo?: string;
    host?: string;
    port?: string;
    path: string;
    query?: string;
    fragment?: string;
};

type AbsoluteIdentifierComponents = {
    scheme: string;
    authority: string;
    userinfo?: string;
    host: string;
    port?: string;
    path: string;
    query?: string;
};
