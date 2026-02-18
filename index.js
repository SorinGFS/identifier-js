'use strict';
// a valid URI is always a valid IRI
const { recursiveCompile } = require('url-templates');
const patterns = new Map();
// RFC3986/RFC3987 common rules
const commonRules = {
    scheme: '[a-zA-Z][a-zA-Z0-9+.-]*',
    port: '[0-9]*',
    IP_literal: '\\[(?:{IPv6address}|{IPvFuture})\\]',
    IPv6address: '(?:(?:{h16}:){6}{ls32}|::(?:{h16}:){5}{ls32}|(?:(?:{h16})?)::(?:{h16}:){4}{ls32}|(?:(?:{h16}:)?{h16})?::(?:{h16}:){3}{ls32}|(?:(?:{h16}:){0,2}{h16})?::(?:{h16}:){2}{ls32}|(?:(?:{h16}:){0,3}{h16})?::(?:{h16}:){1}{ls32}|(?:(?:{h16}:){0,4}{h16})?::{ls32}|(?:(?:{h16}:){0,5}{h16})?::{h16}|(?:(?:{h16}:){0,6}{h16})?::)',
    ls32: '(?:{h16}:{h16}|{IPv4address})',
    h16: '{hexdig}{1,4}',
    IPv4address: '(?:{dec_octet}\\.){3}{dec_octet}',
    dec_octet: '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
    IPvFuture: 'v{hexdig}+\\.(?:{unreserved}|{sub_delims}|:)+',
    unreserved: '[a-zA-Z0-9_.~-]',
    reserved: '(?:{gen_delims}|{sub_delims})',
    pct_encoded: '%{hexdig}{2}',
    gen_delims: '[:/?#[\\]@]',
    sub_delims: "[!&'()*+,;=$]",
    hexdig: '[0-9A-Fa-f]',
    uuid: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
    uuid_v4: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
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
    host: '(?:{IP_literal}|{IPv4address}|{reg_name})',
    userinfo: '(?:{unreserved}|{pct_encoded}|{sub_delims}|:)*',
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
    iunreserved: '(?:[a-zA-Z0-9._~-]|{ucschar})',
    iprivate: '[\\uE000-\\uF8FF\\u{F0000}-\\u{FFFFD}\\u{100000}-\\u{10FFFD}]',
    ucschar: '[\\xA0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}]',
};
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
// all rules into one map
const rules = Object.assign({}, commonRules, uriRules, iriRules);
const addNames = (key) => (groupNames[key] ? `(?<${groupNames[key]}>${rules[key]})` : rules[key]);
// parse (slower, it uses regex.exec and includes named capture groups)
const parse = (string, rule) => {
    if (!patterns.has('_' + rule)) patterns.set('_' + rule, new RegExp(`^${recursiveCompile(rules, rule, addNames)}$`, 'u'));
    const match = patterns.get('_' + rule).exec(string);
    if (match) return match.groups;
    throw new TypeError(`Invalid ${rule.replace('_', '-')}: ${string}`);
};
// validate (faster, it uses regex.test and does not include named capture groups)
const validate = (string, rule) => {
    if (!patterns.has(rule)) patterns.set(rule, new RegExp(`^${recursiveCompile(rules, rule)}$`, 'u'));
    return patterns.get(rule).test(string);
};
// compose as per RFC 3986 Section 5.3 (component recomposition)
function compose(parts = {}) {
    let result = '';
    if (parts.scheme) result += parts.scheme + ':';
    if (parts.authority) result += '//' + parts.authority;
    result += parts.path || '';
    if (parts.query) result += '?' + parts.query;
    if (parts.fragment) result += '#' + parts.fragment;
    return result;
}
// remove dot segments algorithm per RFC 3986 Section 5.2.4 (loop and replace)
function removeDotSegments(path) {
    const output = [];
    let input = path;
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
    if (R.scheme && (strict || R.scheme !== B.scheme)) {
        T = R;
    } else {
        T = {};
        T.scheme = B.scheme;
        if (R.authority !== undefined && R.authority !== null) {
            T.authority = R.authority;
            T.path = R.path;
            T.query = R.query;
        } else {
            T.authority = B.authority;
            if (R.path && R.path.length > 0) {
                if (R.path.startsWith('/')) {
                    T.path = R.path;
                } else if (B.authority !== undefined && B.authority !== null && (!B.path || B.path.length === 0)) {
                    T.path = '/' + R.path;
                } else {
                    // merge base path and ref path
                    const idx = B.path ? B.path.lastIndexOf('/') : -1;
                    const prefix = idx !== -1 ? B.path.slice(0, idx + 1) : '';
                    T.path = prefix + R.path;
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
    T.path = removeDotSegments(T.path || '');
    if (parts) return T;
    return compose(T);
}
// reverse logic for resolve
const toRelativeReference = (target, base) => {
    const B = parse(base, 'absolute_IRI');
    const T = parse(target, 'IRI');
    if (T.scheme !== B.scheme || T.authority !== B.authority) return target;
    let result;
    if (B.path === T.path) {
        result = '';
    } else {
        const baseSegments = B.path.split('/');
        const targetSegments = T.path.split('/');
        let position = 0;
        while (baseSegments[position] === targetSegments[position] && position < baseSegments.length - 1 && position < targetSegments.length - 1) {
            position++;
        }
        const segments = [];
        for (let index = position + 1; index < baseSegments.length; index++) segments.push('..');
        for (let index = position; index < targetSegments.length; index++) segments.push(targetSegments[index]);
        result = segments.join('/');
    }
    if (T.query !== undefined) result += `?${T.query}`;
    if (T.fragment !== undefined) result += `#${T.fragment}`;
    return result;
};
// export
module.exports = {
    isUUID: (string) => validate(string, 'uuid'),
    isUUIDv4: (string) => validate(string, 'uuid_v4'),
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
    resolveReference, // not yet decided if the return should be normalized or not, and in what extent
    normalizeReference: (string) => string, // not done yet
    toAbsoluteReference: (string) => resolveReference('', string),
    toRelativeReference,
};
