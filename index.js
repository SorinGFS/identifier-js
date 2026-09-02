'use strict';
// Parse, validate, normalize, resolve, and convert RFC 3986 URI and RFC 3987 IRI references.
// a valid URI is always a valid IRI
const { recursiveCompile } = require('url-templates');
const patterns = new Map();
const implemented_schemes = '(?:[hH][tT][tT][pP][sS]?|[wW][sS][sS]?|[fF][iI][lL][eE])';
// RFC3986/RFC3987 common rules + https://datatracker.ietf.org/doc/html/rfc3986#section-3.2.2:~:text=DNS%29%2E-,A,of%20%5BRFC1123%5D%2E
const commonRules = {
    implemented_schemes,
    scheme: '(?!{implemented_schemes}:)[a-zA-Z][a-zA-Z0-9+.-]*',
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
// RFC3986 rules
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
// RFC3987 rules
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
// scheme specific URI reg_name and IRI ireg_name
const schemeSpecificRules = {
    scheme: implemented_schemes,
    reg_name: '(?:(?=.{1,255}(?:[:/?#]|$))(?:{a_label})(?:\\.{a_label})*)',
    a_label: '(?:{alpha_digit})(?:(?:{alpha_digit}|-){0,61}(?:{alpha_digit}))?',
    ireg_name: '(?:(?=.{1,255}(?:[:/?#]|$))(?:{u_label})(?:{u_separator}(?:{u_label}))*)',
    u_label: '(?:{u_char})(?:(?:{u_char}|-){0,61}(?:{u_char}))?',
    u_separator: '[\\x2E\\uFF0E\\u3002\\uFF61]',
    u_char: '[\\p{L}\\p{N}\\p{Mn}\\p{Mc}\\u200C\\u200D\\u00B7\\u0375\\u30FB\\u05F3\\u05F4]',
};
// Recognize RFC 8089's empty file authority without weakening other scheme host policies.
const emptyFileHostRules = Object.assign({}, schemeSpecificRules, {
    scheme: '[fF][iI][lL][eE]',
    reg_name: '',
    ireg_name: '',
});
// pattern RFC group names
const groupNames = {
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
};
// Select and merge generic, DNS-host, or empty-file-host grammar overrides.
const isSpecificScheme = (string) => new RegExp('^' + implemented_schemes + ':').test(string);
const schemeProfile = (string) => (string.slice(0, 8).toLowerCase() === 'file:///' ? 'f' : isSpecificScheme(string) ? 's' : '');
const rules = (profile) => Object.assign({}, commonRules, uriRules, iriRules, profile === 'f' ? emptyFileHostRules : profile ? schemeSpecificRules : {});
// parse (slower, it uses regex.exec and includes named capture groups)
const parse = (string, rule) => {
    if (typeof string !== 'string') throw new TypeError(`Invalid ${rule.replace('_', '-')} type: must be a string.`);
    const profile = schemeProfile(string);
    const addNames = (key) => (groupNames[key] ? `(?<${groupNames[key]}>${rules(profile)[key]})` : rules(profile)[key]);
    const ruleId = '_' + profile + rule;
    if (!patterns.has(ruleId)) patterns.set(ruleId, new RegExp(`^${recursiveCompile(rules(profile), rule, addNames)}$`, 'u'));
    const match = patterns.get(ruleId).exec(string);
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
// validate (faster, it uses regex.test and does not include named capture groups)
const validate = (string, rule) => {
    if (typeof string !== 'string') throw new TypeError(`Invalid ${rule.replace('_', '-')} type: must be a string.`);
    const profile = schemeProfile(string);
    const ruleId = profile + rule;
    if (!patterns.has(ruleId)) patterns.set(ruleId, new RegExp(`^${recursiveCompile(rules(profile), rule)}$`, 'u'));
    if (patterns.get(ruleId).test(string)) return true;
    throw new SyntaxError(`Invalid ${rule.replace('_', '-')}: ${string}`);
};
// compose as per RFC 3986 Section 5.3 (component recomposition)
function compose(parts = {}) {
    let result = '';
    if (parts.scheme) result += parts.scheme + ':';
    if (parts.authority !== undefined && parts.authority !== null) result += '//' + parts.authority;
    result += parts.path ?? '';
    if (parts.query !== undefined && parts.query !== null) result += '?' + parts.query;
    if (parts.fragment !== undefined && parts.fragment !== null) result += '#' + parts.fragment;
    return result;
}
// remove dot segments algorithm per RFC 3986 Section 5.2.4 (loop and replace)
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
// resolve as per RFC https://datatracker.ietf.org/doc/html/rfc3986#section-5.2
function resolveReference(reference, base, strict = true, parts = false) {
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
    if (parts) return T;
    return compose(T);
}
// Convert a complete IRI to fragment-free form without changing its other components.
function toAbsoluteReference(string) {
    const result = parse(string, 'IRI');
    result.fragment = undefined;
    return compose(result);
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
        const unreserved = (octet >= 0x41 && octet <= 0x5A) || (octet >= 0x61 && octet <= 0x7A) || (octet >= 0x30 && octet <= 0x39) || octet === 0x2D || octet === 0x2E || octet === 0x5F || octet === 0x7E;
        result += decodeUnreserved && unreserved ? String.fromCharCode(octet) : `%${hexadecimal.toUpperCase()}`;
        index += 2;
    }
    return result;
}
// Expand any accepted IPv6 spelling into eight numeric 16-bit fields.
function parseIPv6Words(address) {
    let expanded = address;
    // Convert a dotted-decimal tail to the same two-field representation used by every later step.
    const lastColon = expanded.lastIndexOf(':');
    const lastSegment = expanded.slice(lastColon + 1);
    if (lastSegment.includes('.')) {
        const octets = lastSegment.split('.');
        const high = Number(octets[0]) * 0x100 + Number(octets[1]);
        const low = Number(octets[2]) * 0x100 + Number(octets[3]);
        expanded = `${expanded.slice(0, lastColon + 1)}${high.toString(16)}:${low.toString(16)}`;
    }

    const compression = expanded.indexOf('::');
    const leftText = compression === -1 ? expanded : expanded.slice(0, compression);
    const rightText = compression === -1 ? '' : expanded.slice(compression + 2);
    const left = leftText ? leftText.split(':') : [];
    const right = rightText ? rightText.split(':') : [];
    const words = [];
    // Retain every explicit field before the compressed zero run.
    for (const field of left) words.push(Number.parseInt(field, 16));
    // Expand the single compression marker to the required number of zero fields.
    if (compression !== -1) {
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
    // Suppress every leading zero by converting each field through its numeric value.
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
    const compatible = words[0] === 0 && words[1] === 0 && words[2] === 0 && words[3] === 0 && words[4] === 0 && words[5] === 0 && low32 > 1;
    const mapped = words[0] === 0 && words[1] === 0 && words[2] === 0 && words[3] === 0 && words[4] === 0 && words[5] === 0xFFFF;
    const translated = words[0] === 0 && words[1] === 0 && words[2] === 0 && words[3] === 0 && words[4] === 0xFFFF && words[5] === 0;
    const nat64 = words[0] === 0x64 && words[1] === 0xFF9B && words[2] === 0 && words[3] === 0 && words[4] === 0 && words[5] === 0;
    if (compatible || mapped || translated || nat64) {
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
// Remove an empty or default-valued HTTP or WebSocket port.
function normalizePort(scheme, port) {
    if (port === undefined) return undefined;
    const defaultPort = scheme === 'http' || scheme === 'ws' ? '80' : scheme === 'https' || scheme === 'wss' ? '443' : undefined;
    if (defaultPort !== undefined && (port === '' || port.replace(/^0+(?=\d)/, '') === defaultPort)) return undefined;
    return port;
}
// Encode each non-ASCII Unicode scalar as uppercase UTF-8 percent triplets.
function encodeIriComponent(component) {
    // Process complete code points so supplementary characters produce one UTF-8 sequence.
    return component.replace(/[^\x00-\x7F]/gu, (character) => encodeURIComponent(character).toUpperCase());
}
// Rebuild authority from normalized values while preserving other empty component delimiters.
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
    const { toUri = false, mapRegName } = options;
    if (typeof toUri !== 'boolean') throw new TypeError('Invalid toUri option type: must be a boolean.');
    if (mapRegName !== undefined && typeof mapRegName !== 'function') throw new TypeError('Invalid registered-name mapper type: must be a function.');
    // Normalize each component independently so encoded delimiters cannot become structure.
    const scheme = parts.scheme === undefined ? undefined : parts.scheme.toLowerCase();
    const normalized = {
        scheme,
        authority: normalizeAuthority(parts, scheme, mapRegName),
        path: normalizePercentEncoding(parts.path),
        query: parts.query === undefined ? undefined : normalizePercentEncoding(parts.query),
        fragment: parts.fragment === undefined ? undefined : normalizePercentEncoding(parts.fragment),
    };
    // Use the slash form defined for an empty HTTP or WebSocket authority path.
    if (normalized.authority !== undefined && normalized.path === '' && (scheme === 'http' || scheme === 'https' || scheme === 'ws' || scheme === 'wss')) normalized.path = '/';
    // Limit dot-segment removal to paths whose standalone interpretation remains stable.
    const rootlessRelativePath = normalized.scheme === undefined && normalized.authority === undefined && normalized.path.length > 0 && !normalized.path.startsWith('/');
    if (!rootlessRelativePath) {
        const reducedPath = removeDotSegments(normalized.path);
        // Preserve a no-authority path when reduction would reparse it as an authority.
        if (normalized.authority !== undefined || !reducedPath.startsWith('//')) normalized.path = reducedPath;
    }
    if (!toUri) return compose(normalized);
    // Map every non-ASCII authority, path, query, and fragment scalar under RFC 3987 URI output.
    if (normalized.authority !== undefined) normalized.authority = encodeIriComponent(normalized.authority);
    normalized.path = encodeIriComponent(normalized.path);
    if (normalized.query !== undefined) normalized.query = encodeIriComponent(normalized.query);
    if (normalized.fragment !== undefined) normalized.fragment = encodeIriComponent(normalized.fragment);
    return compose(normalized);
}
// export
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
