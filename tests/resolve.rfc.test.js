import { describe, expect, test } from 'vitest';
import id from '../index.js';
//
const base = 'http://a/b/c/d;p?q';
const refs = {
    "g:h"           :  "g:h",
    "g"             :  "http://a/b/c/g",
    "./g"           :  "http://a/b/c/g",
    "g/"            :  "http://a/b/c/g/",
    "/g"            :  "http://a/g",
    "//g"           :  "http://g",
    "?y"            :  "http://a/b/c/d;p?y",
    "g?y"           :  "http://a/b/c/g?y",
    "#s"            :  "http://a/b/c/d;p?q#s",
    "g#s"           :  "http://a/b/c/g#s",
    "g?y#s"         :  "http://a/b/c/g?y#s",
    ";x"            :  "http://a/b/c/;x",
    "g;x"           :  "http://a/b/c/g;x",
    "g;x?y#s"       :  "http://a/b/c/g;x?y#s",
    ""              :  "http://a/b/c/d;p?q",
    "."             :  "http://a/b/c/",
    "./"            :  "http://a/b/c/",
    ".."            :  "http://a/b/",
    "../"           :  "http://a/b/",
    "../g"          :  "http://a/b/g",
    "../.."         :  "http://a/",
    "../../"        :  "http://a/",
    "../../g"       :  "http://a/g",
    "../../../g"    :  "http://a/g",
    "../../../../g" :  "http://a/g",
    "/./g"          :  "http://a/g",
    "/../g"         :  "http://a/g",
    "g."            :  "http://a/b/c/g.",
    ".g"            :  "http://a/b/c/.g",
    "g.."           :  "http://a/b/c/g..",
    "..g"           :  "http://a/b/c/..g",
    "./../g"        :  "http://a/b/g",
    "./g/."         :  "http://a/b/c/g/",
    "g/./h"         :  "http://a/b/c/g/h",
    "g/../h"        :  "http://a/b/c/h",
    "g;x=1/./y"     :  "http://a/b/c/g;x=1/y",
    "g;x=1/../y"    :  "http://a/b/c/y",
    "g?y/./x"       :  "http://a/b/c/g?y/./x",
    "g?y/../x"      :  "http://a/b/c/g?y/../x",
    "g#s/./x"       :  "http://a/b/c/g#s/./x",
    "g#s/../x"      :  "http://a/b/c/g#s/../x",
}

describe('resolveReference', () => {
    Object.keys(refs).forEach((reference) => {
        const expected = refs[reference];
        test(`resolveReference('${reference}', '${base}') === '${expected}'`, () => {
            const subject = id.resolveReference(reference, base);
            expect(subject).to.equal(expected);
        });
    });
});

// WHATWG is adding the / if no path after authority and scheme is one of their handled: http, https, ftp, ws, wss, etc
// Object.keys(refs).forEach((key) => {
//     if (new URL(key, base).href !== refs[key]) console.log('[whatwg url]: Error! expected vs result:', refs[key], '=>', new URL(key, base).href);
// });