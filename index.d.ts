export const isUUID: (string: string) => boolean;
export const isUUIDv4: (string: string) => boolean;

export const isUri: (uri: string) => boolean;
export const isUriReference: (uriReference: string) => boolean;
export const isAbsoluteUri: (uri: string) => boolean;

export const parseUri: (uri: string) => IdentifierComponents;
export const parseUriReference: (uriReference: string) => RelativeIdentifierComponents;
export const parseAbsoluteUri: (uri: string) => AbsoluteIdentifierComponents;

export const isIri: (iri: string) => boolean;
export const isIriReference: (iriReference: string) => boolean;
export const isAbsoluteIri: (iri: string) => boolean;

export const parseIri: (iri: string) => IdentifierComponents;
export const parseIriReference: (iriReference: string) => RelativeIdentifierComponents;
export const parseAbsoluteIri: (iri: string) => AbsoluteIdentifierComponents;

export const normalizeReference: (reference: string) => string;
export const resolveReference: (reference: string, base: string, strict?: boolean, returnParts?: boolean) => string;
export const toAbsoluteReference: (reference: string) => string;
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
