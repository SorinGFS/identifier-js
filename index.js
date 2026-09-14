'use strict';
// Validate UUIDs and parse, validate, normalize, resolve, and convert RFC 3986 URI, RFC 3987 IRI, and RFC 8141 URN references.
// A valid URI is always a valid IRI, subject to every implemented scheme's more specific grammar.
const { recursiveCompile } = require('url-templates');
const patternCache = new Map();
const dnsHostSchemesPattern = '(?:[hH][tT][tT][pP][sS]?|[wW][sS][sS]?|[fF][iI][lL][eE])';
// Define shared RFC 3986/3987 productions and helper productions used by UUID and scheme-specific grammars.
const commonRules = {
    dnsHostSchemesPattern,
    scheme: '(?!{dnsHostSchemesPattern}:)[a-zA-Z][a-zA-Z0-9+.-]*',
    port: '\\d*',
    IP_literal: '\\[(?:{IPv6address}|{IPvFuture})\\]',
    IPv6address: '(?:(?:{h16}:){6}{ls32}|::(?:{h16}:){5}{ls32}|(?:(?:{h16})?)::(?:{h16}:){4}{ls32}|(?:(?:{h16}:)?{h16})?::(?:{h16}:){3}{ls32}|(?:(?:{h16}:){0,2}{h16})?::(?:{h16}:){2}{ls32}|(?:(?:{h16}:){0,3}{h16})?::(?:{h16}:){1}{ls32}|(?:(?:{h16}:){0,4}{h16})?::{ls32}|(?:(?:{h16}:){0,5}{h16})?::{h16}|(?:(?:{h16}:){0,6}{h16})?::)',
    ls32: '(?:{h16}:{h16}|{IPv4address})',
    h16: '{hex_digit}{1,4}',
    IPv4address: '(?:{dec_octet}\\.){3}{dec_octet}',
    dec_octet: '(?:\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])',
    IPvFuture: '[vV]{hex_digit}+\\.(?:{unreserved}|{sub_delims}|:)+',
    unreserved: '[a-zA-Z0-9_.~-]',
    reserved: '(?:{gen_delims}|{sub_delims})',
    pct_encoded: '%{hex_digit}{2}',
    gen_delims: '[:/?#[\\]@]',
    sub_delims: "[!&'()*+,;=$]",
    hex_digit: '[0-9A-Fa-f]',
    alpha_digit: '[a-zA-Z0-9]',
    UUID: '{hex_digit}{8}-{hex_digit}{4}-{hex_digit}{4}-{hex_digit}{4}-{hex_digit}{12}',
    UUID_v4: '{hex_digit}{8}-{hex_digit}{4}-4{hex_digit}{3}-[89abAB]{hex_digit}{3}-{hex_digit}{12}',
};
// Define RFC 3986 URI productions.
const uriRules = {
    URI_reference: '(?:{URI}|{relative_ref})',
    URI: '{absolute_URI}(?:#{fragment})?',
    absolute_URI: '{scheme}:{hier_part}(?:\\?{query})?',
    relative_ref: '{relative_part}(?:\\?{query})?(?:#{fragment})?',
    hier_part: '(?:\/\/{authority}{path_abempty}|{path_absolute}|{path_rootless}|{path_empty})',
    relative_part: '(?:\/\/{authority}{path_abempty}|{path_absolute}|{path_noscheme}|{path_empty})',
    authority: '(?:{userinfo}@)?{host}(?::{port})?',
    userinfo: '(?:{unreserved}|{pct_encoded}|{sub_delims}|:)*',
    host: '(?:{IP_literal}|{IPv4address}|{reg_name})',
    reg_name: '(?:{unreserved}|{pct_encoded}|{sub_delims})*',
    path: '(?:{path_abempty}|{path_absolute}|{path_noscheme}|{path_rootless}|{path_empty})',
    path_abempty: '(?:\/{segment})*',
    path_absolute: '\/(?:{segment_nz}(?:\/{segment})*)?',
    path_noscheme: '{segment_nz_nc}(?:\/{segment})*',
    path_rootless: '{segment_nz}(?:\/{segment})*',
    path_empty: '',
    segment: '{pchar}*',
    segment_nz: '{pchar}+',
    segment_nz_nc: '(?:{unreserved}|{pct_encoded}|{sub_delims}|@)+',
    query: '(?:{pchar}|\/|\\?)*',
    fragment: '(?:{pchar}|\/|\\?)*',
    pchar: '(?:{unreserved}|{pct_encoded}|{sub_delims}|:|@)',
};
// Define RFC 3987 IRI productions.
const iriRules = {
    IRI_reference: '(?:{IRI}|{irelative_ref})',
    IRI: '{absolute_IRI}(?:#{ifragment})?',
    absolute_IRI: '{scheme}:{ihier_part}(?:\\?{iquery})?',
    irelative_ref: '(?:{irelative_part}(?:\\?{iquery})?(?:#{ifragment})?)',
    ihier_part: '(?:\/\/{iauthority}{ipath_abempty}|{ipath_absolute}|{ipath_rootless}|{ipath_empty})',
    irelative_part: '(?:\/\/{iauthority}{ipath_abempty}|{ipath_absolute}|{ipath_noscheme}|{ipath_empty})',
    iauthority: '(?:{iuserinfo}@)?{ihost}(?::{port})?',
    iuserinfo: '(?:{iunreserved}|{pct_encoded}|{sub_delims}|:)*',
    ihost: '(?:{IP_literal}|{IPv4address}|{ireg_name})',
    ireg_name: '(?:{iunreserved}|{pct_encoded}|{sub_delims})*',
    ipath: '(?:{ipath_abempty}|{ipath_absolute}|{ipath_noscheme}|{ipath_rootless}|{ipath_empty})',
    ipath_empty: '',
    ipath_rootless: '{isegment_nz}(?:\/{isegment})*',
    ipath_noscheme: '{isegment_nz_nc}(?:\/{isegment})*',
    ipath_absolute: '\/(?:{isegment_nz}(?:\/{isegment})*)?',
    ipath_abempty: '(?:\/{isegment})*',
    isegment_nz_nc: '(?:{iunreserved}|{pct_encoded}|{sub_delims}|@)+',
    isegment_nz: '{ipchar}+',
    isegment: '{ipchar}*',
    iquery: '(?:{ipchar}|{iprivate}|\/|\\?)*',
    ifragment: '(?:{ipchar}|\/|\\?)*',
    ipchar: '(?:{iunreserved}|{pct_encoded}|{sub_delims}|:|@)',
    iunreserved: '(?:{unreserved}|{ucschar})',
    iprivate: '[\\uE000-\\uF8FF\\u{F0000}-\\u{FFFFD}\\u{100000}-\\u{10FFFD}]',
    ucschar: '[\\xA0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}]',
};
// Define a closed RFC 8141 profile whose root overrides and direct fragment expression expose only URN captures.
const urnRules = {
    scheme: '[uU][rR][nN]',
    URI_reference: '{URI}',
    URI: '{namestring}',
    absolute_URI: '{assigned_name}(?:{rq_components})?',
    IRI_reference: '{IRI}',
    IRI: '{URI}',
    absolute_IRI: '{absolute_URI}',
    namestring: '{assigned_name}(?:{rq_components})?(?:#{f_component})?',
    assigned_name: '{scheme}:{NID}:{NSS}',
    NID: '{alpha_digit}{ldh}{0,30}{alpha_digit}',
    ldh: '(?:{alpha_digit}|-)',
    NSS: '{pchar}(?:{pchar}|\/)*',
    rq_components: '(?:[?][+]{r_component})?(?:[?]={q_component})?',
    r_component: '{pchar}(?:{pchar}|\/|[?](?!=))*',
    q_component: '{pchar}(?:{pchar}|\/|[?])*',
    f_component: uriRules.fragment,
};
// Compile character-repertoire checks used during URI/IRI percent-encoding normalization.
const uriUnreservedPattern = new RegExp(`^${commonRules.unreserved}$`);
const iriUcscharPattern = new RegExp(`^${iriRules.ucschar}$`, 'u');
const iriPrivatePattern = new RegExp(`^${iriRules.iprivate}$`, 'u');
// Apply the additional RFC 3987 Section 4.1 prose restriction outside the ABNF repertoire.
const forbiddenIriFormattingPattern = /^[\u200E\u200F\u202A-\u202E]$/u;
// Restrict registered names for selected hierarchical schemes to DNS-style labels.
const dnsHostRules = {
    scheme: dnsHostSchemesPattern,
    reg_name: '(?:(?=.{1,255}(?:[:/?#]|$))(?:{a_label})(?:\\.{a_label})*)',
    a_label: '(?:{alpha_digit})(?:(?:{alpha_digit}|-){0,61}(?:{alpha_digit}))?',
    ireg_name: '(?:(?=.{1,255}(?:[:/?#]|$))(?:{u_label})(?:{u_separator}(?:{u_label}))*)',
    u_label: '(?:{u_char})(?:(?:{u_char}|-){0,61}(?:{u_char}))?',
    u_separator: '[\\x2E\\uFF0E\\u3002\\uFF61]',
    u_char: '[\\p{L}\\p{N}\\p{Mn}\\p{Mc}\\u200C\\u200D\\u00B7\\u0375\\u30FB\\u05F3\\u05F4]',
};
// Recognize RFC 8089's empty file authority without weakening other scheme host policies.
const emptyFileHostRules = Object.assign({}, dnsHostRules, {
    scheme: '[fF][iI][lL][eE]',
    reg_name: '',
    ireg_name: '',
});
// Map grammar productions to the public named captures returned by parsers.
const captureGroupNames = {
    scheme: 'scheme',
    port: 'port',
    authority: 'authority',
    host: 'host',
    userinfo: 'userinfo',
    query: 'query',
    fragment: 'fragment',
    iauthority: 'authority',
    ihost: 'host',
    iuserinfo: 'userinfo',
    iquery: 'query',
    ifragment: 'fragment',
    path_abempty: 'path',
    path_absolute: 'path',
    path_noscheme: 'path',
    path_rootless: 'path',
    path_empty: 'path',
    ipath_abempty: 'path',
    ipath_absolute: 'path',
    ipath_noscheme: 'path',
    ipath_rootless: 'path',
    ipath_empty: 'path',
    NID: 'nid',
    NSS: 'nss',
    r_component: 'rComponent',
    q_component: 'qComponent',
    f_component: 'fComponent',
};
// Detect schemes whose registered names use the DNS-host grammar.
const usesDnsHostRules = (string) => new RegExp('^' + dnsHostSchemesPattern + ':').test(string);
// Grammar profiles: '' is generic, 's' uses DNS-host rules, 'f' permits an empty file host, and 'u' is URN.
const grammarProfile = (string) => (string.slice(0, 4).toLowerCase() === 'urn:' ? 'u' : string.slice(0, 8).toLowerCase() === 'file:///' ? 'f' : usesDnsHostRules(string) ? 's' : '');
// Select and merge the rules for the active grammar profile.
const grammarRules = (profile) => Object.assign({}, commonRules, uriRules, iriRules, profile === 'u' ? urnRules : profile === 'f' ? emptyFileHostRules : profile ? dnsHostRules : {});
// Compile and execute a grammar with named component captures.
const parse = (string, rule) => {
    if (typeof string !== 'string') throw new TypeError(`Invalid ${rule.replace('_', '-')} type: must be a string.`);
    const profile = grammarProfile(string);
    // Wrap each public component production in its associated named capture.
    const addNamedCapture = (key) => (captureGroupNames[key] ? `(?<${captureGroupNames[key]}>${grammarRules(profile)[key]})` : grammarRules(profile)[key]);
    const cacheKey = '_' + profile + rule;
    if (!patternCache.has(cacheKey)) patternCache.set(cacheKey, new RegExp(`^${recursiveCompile(grammarRules(profile), rule, addNamedCapture)}$`, 'u'));
    const match = patternCache.get(cacheKey).exec(string);
    if (match) {
        Object.defineProperty(match.groups, 'normalize', {
            // Normalize this parsed result only when its optional method is called.
            value: function normalize(options) {
                return normalizeParsedReference(this, options);
            },
        });
        return match.groups;
    }
    throw new SyntaxError(`Invalid ${rule.replace('_', '-')}: ${string}`);
};
// Compile and test a capture-free grammar for validation.
const validate = (string, rule) => {
    if (typeof string !== 'string') throw new TypeError(`Invalid ${rule.replace('_', '-')} type: must be a string.`);
    const profile = grammarProfile(string);
    const cacheKey = profile + rule;
    if (!patternCache.has(cacheKey)) patternCache.set(cacheKey, new RegExp(`^${recursiveCompile(grammarRules(profile), rule)}$`, 'u'));
    if (patternCache.get(cacheKey).test(string)) return true;
    throw new SyntaxError(`Invalid ${rule.replace('_', '-')}: ${string}`);
};
// Serialize scheme, authority, path, query, and fragment slots using RFC 3986 delimiters.
function composeReference(parts = {}) {
    let result = '';
    if (parts.scheme) result += parts.scheme + ':';
    if (parts.authority !== undefined && parts.authority !== null) result += '//' + parts.authority;
    result += parts.path ?? '';
    if (parts.query !== undefined && parts.query !== null) result += '?' + parts.query;
    if (parts.fragment !== undefined && parts.fragment !== null) result += '#' + parts.fragment;
    return result;
}
// Local abbreviations: idx is an index and seg is a path segment.
// Remove complete dot segments using the RFC 3986 Section 5.2.4 algorithm.
function removeDotSegments(path) {
    const output = [];
    let input = path ?? '';
    while (input.length > 0) {
        if (input.startsWith('../')) input = input.slice(3);
        else if (input.startsWith('./')) input = input.slice(2);
        else if (input.startsWith('/./')) input = input.replace('/./', '/');
        else if (input === '/.') input = '/';
        else if (input.startsWith('/../')) {
            input = input.replace('/../', '/');
            if (output.length) output.pop();
        } else if (input === '/..') {
            input = '/';
            if (output.length) output.pop();
        } else if (input === '.' || input === '..') {
            input = '';
        } else {
            // move first segment from input to output
            let seg = '';
            if (input[0] === '/') {
                // keep leading '/'
                const idx = input.indexOf('/', 1);
                if (idx === -1) {
                    seg = input;
                    input = '';
                } else {
                    seg = input.slice(0, idx);
                    input = input.slice(idx);
                }
            } else {
                const idx = input.indexOf('/');
                if (idx === -1) {
                    seg = input;
                    input = '';
                } else {
                    seg = input.slice(0, idx);
                    input = input.slice(idx);
                }
            }
            output.push(seg);
        }
    }
    return output.join('');
}
// RFC 3986 resolution notation: B is the base, R is the reference, and T is the target.
// Resolve a reference according to RFC 3986 Section 5.2.
function resolveReference(reference, base, strict = true, returnParts = false) {
    let B;
    if (typeof base === 'string') {
        B = parse(base, 'IRI');
    } else {
        B = Object.assign({}, base);
    }
    if (!B.scheme) throw new Error('Expected an URI/IRI (with scheme) as base.');

    let R;
    if (typeof reference === 'string') {
        R = parse(reference, 'IRI_reference');
    } else {
        R = Object.assign({}, reference);
    }

    let T;
    if (R.scheme && (strict || R.scheme.toLowerCase() !== B.scheme.toLowerCase())) {
        T = R;
        T.path = removeDotSegments(R.path);
    } else {
        T = {};
        T.scheme = B.scheme;
        if (R.authority !== undefined && R.authority !== null) {
            T.authority = R.authority;
            T.path = removeDotSegments(R.path);
            T.query = R.query;
        } else {
            T.authority = B.authority;
            if (R.path && R.path.length > 0) {
                if (R.path.startsWith('/')) {
                    T.path = removeDotSegments(R.path);
                } else if (B.authority !== undefined && B.authority !== null && (!B.path || B.path.length === 0)) {
                    T.path = removeDotSegments('/' + R.path);
                } else {
                    // Merge the base directory and reference path before removing complete dot segments.
                    const idx = B.path ? B.path.lastIndexOf('/') : -1;
                    const prefix = idx !== -1 ? B.path.slice(0, idx + 1) : '';
                    T.path = removeDotSegments(prefix + R.path);
                }
                T.query = R.query;
            } else {
                T.path = B.path;
                if (R.query !== undefined && R.query !== null) T.query = R.query;
                else T.query = B.query;
            }
        }
        T.fragment = R.fragment;
    }
    if (returnParts) return T;
    return composeReference(T);
}
// Convert a complete IRI to fragment-free form without changing its other components.
function toAbsoluteReference(string) {
    const result = parse(string, 'IRI');
    result.fragment = undefined;
    return composeReference(result);
}
// Generate a relative reference when resolution is stable, otherwise retain the absolute target.
const toRelativeReference = (target, base) => {
    const B = parse(base, 'absolute_IRI');
    const T = parse(target, 'IRI');
    // Use the absolute target when dot-segment processing makes lexical relative round trips unstable.
    if (/(?:^|\/)\.{1,2}(?=\/|$)/.test(T.path) || /(?:^|\/)\.{1,2}(?=\/|$)/.test(B.path)) return target;
    if (T.scheme !== B.scheme || T.authority !== B.authority) return target;
    let result;
    if (B.path === T.path) {
        if (T.query === undefined && B.query !== undefined) {
            // Use an explicit path to prevent the base query from being inherited.
            if (T.path.startsWith('/')) result = T.path;
            else if (T.path) {
                const segment = T.path.slice(T.path.lastIndexOf('/') + 1);
                result = segment && !segment.includes(':') ? segment : `./${segment}`;
            } else if (T.authority !== undefined) result = `//${T.authority}`;
            else return target;
        } else result = '';
    } else if (!T.path) {
        // A network-path reference is required to represent an empty path without inheritance.
        if (T.authority !== undefined) result = `//${T.authority}`;
        else return target;
    } else {
        const baseSegments = B.path.split('/');
        const targetSegments = T.path.split('/');
        let position = 0;
        // Find the common path prefix before constructing the relative traversal.
        while (baseSegments[position] === targetSegments[position] && position < baseSegments.length - 1 && position < targetSegments.length - 1) {
            position++;
        }
        const segments = [];
        // Backtrack from the base resource to the common path prefix.
        for (let index = position + 1; index < baseSegments.length; index++) segments.push('..');
        // Append the target path after the common prefix.
        for (let index = position; index < targetSegments.length; index++) segments.push(targetSegments[index]);
        result = segments.join('/');
        if (!result) result = T.path.startsWith('/') ? T.path : './';
        else if (/^[^/]*:/.test(result)) result = './' + result;
    }
    if (T.query !== undefined) result += `?${T.query}`;
    if (T.fragment !== undefined) result += `#${T.fragment}`;
    // Parent traversal would convert a rootless path into an absolute path during resolution.
    if (T.authority === undefined && !T.path.startsWith('/') && result.startsWith('..')) return target;
    return result;
};
// Identify RFC 3986 IPv4 literals without misclassifying numeric registered names.
function isIPv4Address(host) {
    const octets = host.split('.');
    if (octets.length !== 4) return false;
    // Require the parser's decimal-octet spelling and numeric range for every address part.
    for (const octet of octets) {
        if (!/^(?:0|[1-9]\d{0,2})$/.test(octet) || Number(octet) > 255) return false;
    }
    return true;
}
// Identify ASCII octets through the URI grammar's canonical unreserved repertoire.
function isAsciiUnreservedOctet(octet) {
    return uriUnreservedPattern.test(String.fromCharCode(octet));
}
// Normalize percent triplets while optionally decoding only ASCII unreserved octets.
function normalizePercentEncoding(value, decodeUnreserved = true) {
    let result = '';
    // Preserve literal Unicode while processing each already-validated percent triplet atomically.
    for (let index = 0; index < value.length; index++) {
        if (value[index] !== '%' || !/^[0-9A-Fa-f]{2}$/.test(value.slice(index + 1, index + 3))) {
            result += value[index];
            continue;
        }
        const hexadecimal = value.slice(index + 1, index + 3);
        const octet = Number.parseInt(hexadecimal, 16);
        result += decodeUnreserved && isAsciiUnreservedOctet(octet) ? String.fromCharCode(octet) : `%${hexadecimal.toUpperCase()}`;
        index += 2;
    }
    return result;
}
// Expand any accepted IPv6 spelling into eight numeric 16-bit fields.
function parseIPv6Words(address) {
    let addressText = address;
    // Convert a dotted-decimal tail to the same two-field representation used by every later step.
    const lastColon = addressText.lastIndexOf(':');
    const lastSegment = addressText.slice(lastColon + 1);
    if (lastSegment.includes('.')) {
        const octets = lastSegment.split('.');
        const highWord = Number(octets[0]) * 0x100 + Number(octets[1]);
        const lowWord = Number(octets[2]) * 0x100 + Number(octets[3]);
        addressText = `${addressText.slice(0, lastColon + 1)}${highWord.toString(16)}:${lowWord.toString(16)}`;
    }

    const compressionIndex = addressText.indexOf('::');
    const leftText = compressionIndex === -1 ? addressText : addressText.slice(0, compressionIndex);
    const rightText = compressionIndex === -1 ? '' : addressText.slice(compressionIndex + 2);
    const left = leftText ? leftText.split(':') : [];
    const right = rightText ? rightText.split(':') : [];
    const words = [];
    // Retain every explicit field before the compressed zero run.
    for (const field of left) words.push(Number.parseInt(field, 16));
    // Expand the single compression marker to the required number of zero fields.
    if (compressionIndex !== -1) {
        // Fill the omitted field count determined from both explicit sides.
        for (let index = left.length + right.length; index < 8; index++) words.push(0);
    }
    // Retain every explicit field after the compressed zero run.
    for (const field of right) words.push(Number.parseInt(field, 16));
    return words;
}
// Serialize IPv6 fields with maximal first-run zero compression and lowercase digits.
function serializeIPv6Words(words) {
    let bestStart = -1;
    let bestLength = 0;
    // Select the first longest run containing at least two zero fields.
    for (let start = 0; start < words.length;) {
        if (words[start] !== 0) {
            start++;
            continue;
        }
        let end = start;
        // Measure this complete zero run before comparing it with the retained candidate.
        while (end < words.length && words[end] === 0) end++;
        if (end - start > bestLength) {
            bestStart = start;
            bestLength = end - start;
        }
        start = end;
    }
    if (bestLength < 2) bestStart = -1;

    const fields = [];
    // Render each field without leading hexadecimal zeroes.
    for (const word of words) fields.push(word.toString(16));
    if (bestStart === -1) return fields.join(':');
    const before = fields.slice(0, bestStart).join(':');
    const after = fields.slice(bestStart + bestLength).join(':');
    return `${before}::${after}`;
}
// Canonicalize an IPv6 address under RFC 5952, including known embedded-IPv4 prefixes.
function normalizeIPv6Address(address) {
    const words = parseIPv6Words(address);
    // Detect standardized prefixes that identify an embedded IPv4 address from address bits alone.
    const low32 = words[6] * 0x10000 + words[7];
    const isCompatible = words[0] === 0 && words[1] === 0 && words[2] === 0 && words[3] === 0 && words[4] === 0 && words[5] === 0 && low32 > 1;
    const isMapped = words[0] === 0 && words[1] === 0 && words[2] === 0 && words[3] === 0 && words[4] === 0 && words[5] === 0xFFFF;
    const isTranslated = words[0] === 0 && words[1] === 0 && words[2] === 0 && words[3] === 0 && words[4] === 0xFFFF && words[5] === 0;
    const isWellKnownNat64 = words[0] === 0x64 && words[1] === 0xFF9B && words[2] === 0 && words[3] === 0 && words[4] === 0 && words[5] === 0;
    if (isCompatible || isMapped || isTranslated || isWellKnownNat64) {
        const prefix = serializeIPv6Words(words.slice(0, 6));
        const ipv4 = `${words[6] >>> 8}.${words[6] & 0xFF}.${words[7] >>> 8}.${words[7] & 0xFF}`;
        return prefix.endsWith(':') ? prefix + ipv4 : `${prefix}:${ipv4}`;
    }
    return serializeIPv6Words(words);
}
// Lowercase an ASCII host without changing uppercase hexadecimal in retained percent triplets.
function lowercaseAsciiHost(host) {
    let result = '';
    // Treat each retained percent triplet as an indivisible token during host case folding.
    for (let index = 0; index < host.length; index++) {
        if (host[index] === '%' && /^[0-9A-F]{2}$/.test(host.slice(index + 1, index + 3))) {
            result += host.slice(index, index + 3);
            index += 2;
        } else result += host[index].toLowerCase();
    }
    return result;
}
// Normalize a parsed host according to its IP-literal, IPv4, or registered-name kind.
function normalizeHost(host, mapRegName) {
    if (!host) return host;
    // Keep IP hosts outside application registered-name policy.
    if (host.startsWith('[')) {
        const address = host.slice(1, -1);
        return address[0].toLowerCase() === 'v' ? `[${address.toLowerCase()}]` : `[${normalizeIPv6Address(address)}]`;
    }
    if (isIPv4Address(host)) return host;

    let result = host;
    // Delegate registered-name representation to the mapper before built-in text normalization.
    if (mapRegName) {
        result = mapRegName(host);
        if (typeof result !== 'string') throw new TypeError('Invalid registered-name mapper result: must be a string.');
    }
    // Preserve the parsed host kind only when no mapper has assumed registered-name ownership.
    const encodedResult = result;
    result = normalizePercentEncoding(result);
    if (!mapRegName && isIPv4Address(result)) result = normalizePercentEncoding(encodedResult, false);
    return /[^\x00-\x7F]/u.test(result) ? result : lowercaseAsciiHost(result);
}
// Omit an empty or default port only for HTTP and WebSocket schemes.
function normalizePort(scheme, port) {
    if (port === undefined) return undefined;
    const defaultPort = scheme === 'http' || scheme === 'ws' ? '80' : scheme === 'https' || scheme === 'wss' ? '443' : undefined;
    if (defaultPort !== undefined && (port === '' || port.replace(/^0+(?=\d)/, '') === defaultPort)) return undefined;
    return port;
}
// Encode each non-ASCII Unicode scalar as uppercase UTF-8 percent triplets for URI output.
function encodeNonAsciiForUri(component) {
    // Process complete code points so supplementary characters produce one UTF-8 sequence.
    return component.replace(/[^\x00-\x7F]/gu, (character) => encodeURIComponent(character).toUpperCase());
}
// Decode the maximal RFC 3987 character repertoire allowed by one IRI component.
function decodeUriTextToIri(component, allowPrivateUse = false) {
    let result = '';
    // Inspect each normalized percent triplet as either ASCII or the lead of one strict UTF-8 scalar.
    for (let index = 0; index < component.length; index++) {
        if (component[index] !== '%' || !/^[0-9A-F]{2}$/.test(component.slice(index + 1, index + 3))) {
            result += component[index];
            continue;
        }
        const hexadecimal = component.slice(index + 1, index + 3);
        const octet = Number.parseInt(hexadecimal, 16);
        if (octet <= 0x7F) {
            result += isAsciiUnreservedOctet(octet) ? String.fromCharCode(octet) : `%${hexadecimal}`;
            index += 2;
            continue;
        }
        const sequenceLength = octet >= 0xC2 && octet <= 0xDF ? 2 : octet >= 0xE0 && octet <= 0xEF ? 3 : octet >= 0xF0 && octet <= 0xF4 ? 4 : 0;
        let encodedSequence = '';
        // Collect exactly one candidate scalar without consuming malformed trailing input.
        for (let sequenceIndex = 0; sequenceIndex < sequenceLength; sequenceIndex++) {
            const position = index + sequenceIndex * 3;
            if (component[position] !== '%' || !/^[0-9A-F]{2}$/.test(component.slice(position + 1, position + 3))) {
                encodedSequence = '';
                break;
            }
            encodedSequence += component.slice(position, position + 3);
        }
        let character;
        if (encodedSequence) {
            try {
                character = decodeURIComponent(encodedSequence);
            } catch {
                character = undefined;
            }
        }
        const isAllowedIriCharacter = character !== undefined && !forbiddenIriFormattingPattern.test(character) && (iriUcscharPattern.test(character) || (allowPrivateUse && iriPrivatePattern.test(character)));
        if (isAllowedIriCharacter) {
            result += character;
            index += encodedSequence.length - 1;
        } else {
            result += `%${hexadecimal}`;
            index += 2;
        }
    }
    return result;
}
// Rebuild authority from normalized userinfo, host, and port while preserving their presence.
function normalizeAuthority(parts, scheme, mapRegName) {
    if (parts.authority === undefined) return undefined;
    const userinfo = parts.userinfo === undefined ? undefined : normalizePercentEncoding(parts.userinfo);
    const host = normalizeHost(parts.host, mapRegName);
    const port = normalizePort(scheme, parts.port);
    let authority = '';
    if (userinfo !== undefined) authority += `${userinfo}@`;
    authority += host;
    if (port !== undefined) authority += `:${port}`;
    return authority;
}
// Derive a normalized string from parsed URI/IRI components without modifying them.
function normalizeParsedReference(parts, options = {}) {
    // Validate the optional API settings before they select normalization behavior.
    if (options === null || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Invalid normalization argument type: must be an options object.');
    const { transform, mapRegName } = options;
    if (transform !== undefined && transform !== 'URI' && transform !== 'IRI') throw new TypeError('Invalid transform option: must be "URI" or "IRI".');
    if (mapRegName !== undefined && typeof mapRegName !== 'function') throw new TypeError('Invalid registered-name mapper type: must be a function.');
    // Normalize captured URN fields without applying generic path or representation processing.
    if (parts.nid !== undefined) {
        const rComponent = parts.rComponent === undefined ? undefined : normalizePercentEncoding(parts.rComponent, false);
        const qComponent = parts.qComponent === undefined ? undefined : normalizePercentEncoding(parts.qComponent, false);
        const rqComponentText = rComponent !== undefined ? `+${rComponent}${qComponent === undefined ? '' : `?=${qComponent}`}` : qComponent === undefined ? undefined : `=${qComponent}`;
        return composeReference({ scheme: parts.scheme.toLowerCase(), path: `${parts.nid.toLowerCase()}:${normalizePercentEncoding(parts.nss, false)}`, query: rqComponentText, fragment: parts.fComponent === undefined ? undefined : normalizePercentEncoding(parts.fComponent, false) });
    }
    // Normalize each component independently so encoded delimiters cannot become structure.
    const scheme = parts.scheme === undefined ? undefined : parts.scheme.toLowerCase();
    const normalizedParts = {
        scheme,
        authority: normalizeAuthority(parts, scheme, mapRegName),
        path: normalizePercentEncoding(parts.path),
        query: parts.query === undefined ? undefined : normalizePercentEncoding(parts.query),
        fragment: parts.fragment === undefined ? undefined : normalizePercentEncoding(parts.fragment),
    };
    // Use the slash form defined for an empty HTTP or WebSocket authority path.
    if (normalizedParts.authority !== undefined && normalizedParts.path === '' && (scheme === 'http' || scheme === 'https' || scheme === 'ws' || scheme === 'wss')) normalizedParts.path = '/';
    // Limit dot-segment removal to paths whose standalone interpretation remains stable.
    const rootlessRelativePath = normalizedParts.scheme === undefined && normalizedParts.authority === undefined && normalizedParts.path.length > 0 && !normalizedParts.path.startsWith('/');
    if (!rootlessRelativePath) {
        const reducedPath = removeDotSegments(normalizedParts.path);
        // Preserve a no-authority path when reduction would reparse it as an authority.
        if (normalizedParts.authority !== undefined || !reducedPath.startsWith('//')) normalizedParts.path = reducedPath;
    }
    // Select an explicit target representation only after component normalization is complete.
    if (transform === 'URI') {
        // Percent-encode every non-ASCII authority, path, query, and fragment scalar for URI output.
        if (normalizedParts.authority !== undefined) normalizedParts.authority = encodeNonAsciiForUri(normalizedParts.authority);
        normalizedParts.path = encodeNonAsciiForUri(normalizedParts.path);
        if (normalizedParts.query !== undefined) normalizedParts.query = encodeNonAsciiForUri(normalizedParts.query);
        if (normalizedParts.fragment !== undefined) normalizedParts.fragment = encodeNonAsciiForUri(normalizedParts.fragment);
    } else if (transform === 'IRI') {
        // Decode valid UTF-8 percent sequences only where the destination component permits their scalar.
        if (normalizedParts.authority !== undefined) normalizedParts.authority = decodeUriTextToIri(normalizedParts.authority);
        normalizedParts.path = decodeUriTextToIri(normalizedParts.path);
        if (normalizedParts.query !== undefined) normalizedParts.query = decodeUriTextToIri(normalizedParts.query, true);
        if (normalizedParts.fragment !== undefined) normalizedParts.fragment = decodeUriTextToIri(normalizedParts.fragment);
    }
    return composeReference(normalizedParts);
}
// Expose the public validation, parsing, resolution, and conversion API.
module.exports = {
    isUUID: (string) => validate(string, 'UUID'),
    isUUIDv4: (string) => validate(string, 'UUID_v4'),
    isUri: (string) => validate(string, 'URI'),
    isUriReference: (string) => validate(string, 'URI_reference'),
    isAbsoluteUri: (string) => validate(string, 'absolute_URI'),
    parseUri: (string) => parse(string, 'URI'),
    parseUriReference: (string) => parse(string, 'URI_reference'),
    parseAbsoluteUri: (string) => parse(string, 'absolute_URI'),
    isIri: (string) => validate(string, 'IRI'),
    isIriReference: (string) => validate(string, 'IRI_reference'),
    isAbsoluteIri: (string) => validate(string, 'absolute_IRI'),
    parseIri: (string) => parse(string, 'IRI'),
    parseIriReference: (string) => parse(string, 'IRI_reference'),
    parseAbsoluteIri: (string) => parse(string, 'absolute_IRI'),
    resolveReference,
    toRelativeReference,
    toAbsoluteReference
};
