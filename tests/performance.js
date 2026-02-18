'use strict';
//
const { isAbsoluteIri, isAbsoluteUri, isIPv4, isIPv6, isIri, isIriReference, isUUID, isUUIDv4, isUri, isUriReference, parseAbsoluteIri, parseAbsoluteUri, parseIri, parseIriReference, parseUri, parseUriReference } = require('..');
//
const uri = 'https://user:pass@munich-und-uberacht.de:15/path.to/the/ccc.txt?ddd=ddd#/eee/fff/ggg';
const iri = 'https://user:pass@münich-und-uberacht.de:15/path.to/the/ccc.txt?ddd=ddd#/eee/fff/ggg';

const iterations = 1000000;

console.log(`  Number of iterations: ${iterations}`);

// URI_reference
console.time('   parse URI_reference');
for (let i = 0; i < iterations; i++) parseUriReference(uri);
console.timeEnd('   parse URI_reference');

console.time('validate URI_reference');
for (let i = 0; i < iterations; i++) isUriReference(uri);
console.timeEnd('validate URI_reference');

// URI
console.time('             parse URI');
for (let i = 0; i < iterations; i++) parseUri(uri);
console.timeEnd('             parse URI');

console.time('          validate URI');
for (let i = 0; i < iterations; i++) isUri(uri);
console.timeEnd('          validate URI');

// IRI_reference
console.time('   parse IRI_reference');
for (let i = 0; i < iterations; i++) parseIriReference(iri);
console.timeEnd('   parse IRI_reference');

console.time('validate IRI_reference');
for (let i = 0; i < iterations; i++) isIriReference(iri);
console.timeEnd('validate IRI_reference');

// IRI
console.time('             parse IRI');
for (let i = 0; i < iterations; i++) parseIri(iri);
console.timeEnd('             parse IRI');

console.time('          validate IRI');
for (let i = 0; i < iterations; i++) isIri(iri);
console.timeEnd('          validate IRI');
