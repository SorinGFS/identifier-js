import { describe, expect, test } from 'vitest';
import id from '../index.js';

// Verify relative-reference generation and round trips through reference resolution.
describe('toRelativeReference IRI', () => {
    test.each([
        ['https://examplé.com/var/lib', 'https://examplé.com', '/var/lib'],
        ['https://examplé.com/var/lib', 'https://examplé.com/z', 'var/lib'],
        ['https://examplé.com/a/var/lib', 'https://examplé.com/a', 'a/var/lib'],
        ['https://examplé.com/a/var/lib', 'https://examplé.com/a/', 'var/lib'],
        ['https://examplé.com/foo/test/bar/package.json', 'https://examplé.com/foo/test', 'test/bar/package.json'],
        ['https://examplé.com/var', 'https://examplé.com/var/lib', '../var'],
        ['https://examplé.com/bin', 'https://examplé.com/var/lib', '../bin'],
        ['https://examplé.com/var/lib', 'https://examplé.com/var/lib', ''],
        ['https://examplé.com/var/apache', 'https://examplé.com/var/lib', 'apache'],
        ['https://examplé.com/Users/a/web/b', 'https://examplé.com/Users/a/web/b/test/mails', '../../b'],
        ['https://examplé.com/foo/bar/baz', 'https://examplé.com/foo/bar/baz-quux', 'baz'],
        ['https://examplé.com/foo/bar/baz-quux', 'https://examplé.com/foo/bar/baz', 'baz-quux'],
        ['https://examplé.com/baz', 'https://examplé.com/baz-quux', 'baz'],
        ['https://examplé.com/baz-quux', 'https://examplé.com/baz', 'baz-quux'],
        ['https://examplé.com/', 'https://examplé.com/page1/page2/foo', '../../'],
    ])('toRelativeIri(%s, %s) => %s', (target, base, expected) => {
        const relative = id.toRelativeReference(target, base);
        expect(relative).to.equal(expected);
        expect(id.resolveReference(relative, base)).to.equal(target); // sanity check
    });
});

describe('toRelativeReference URI', () => {
    test.each([
        ['https://example.com/var/lib', 'https://example.com', '/var/lib'],
        ['https://example.com/var/lib', 'https://example.com/z', 'var/lib'],
        ['https://example.com/a/var/lib', 'https://example.com/a', 'a/var/lib'],
        ['https://example.com/a/var/lib', 'https://example.com/a/', 'var/lib'],
        ['https://example.com/foo/test/bar/package.json', 'https://example.com/foo/test', 'test/bar/package.json'],
        ['https://example.com/var', 'https://example.com/var/lib', '../var'],
        ['https://example.com/bin', 'https://example.com/var/lib', '../bin'],
        ['https://example.com/var/lib', 'https://example.com/var/lib', ''],
        ['https://example.com/var/apache', 'https://example.com/var/lib', 'apache'],
        ['https://example.com/Users/a/web/b', 'https://example.com/Users/a/web/b/test/mails', '../../b'],
        ['https://example.com/foo/bar/baz', 'https://example.com/foo/bar/baz-quux', 'baz'],
        ['https://example.com/foo/bar/baz-quux', 'https://example.com/foo/bar/baz', 'baz-quux'],
        ['https://example.com/baz', 'https://example.com/baz-quux', 'baz'],
        ['https://example.com/baz-quux', 'https://example.com/baz', 'baz-quux'],
        ['https://example.com/', 'https://example.com/page1/page2/foo', '../../'],
    ])('toRelativeIri(%s, %s) => %s', (target, base, expected) => {
        const relative = id.toRelativeReference(target, base);
        expect(relative).to.equal(expected);
        expect(id.resolveReference(relative, base)).to.equal(target); // sanity check
    });
});

// Verify empty components and path forms that require explicit inheritance control.
describe('toRelativeReference component presence', () => {
    // Require every generated reference to have the expected form and resolve back to its target.
    test.each([
        ['clears a query on the same absolute path', 'https://example.com/a/item', 'https://example.com/a/item?old', '/a/item'],
        ['preserves an empty target query', 'https://example.com/a/item?', 'https://example.com/a/item?old', '?'],
        ['preserves an empty target fragment', 'https://example.com/a/item#', 'https://example.com/a/item', '#'],
        ['clears a query on an empty path', 'https://example.com', 'https://example.com?old', '//example.com'],
        ['clears a query on a colon-containing rootless path', 'urn:a:b', 'urn:a:b?old', './a:b'],
        ['produces an empty path from a non-empty base path', 'https://example.com', 'https://example.com/a', '//example.com'],
        ['produces a root path from a single-segment base path', 'https://example.com/', 'https://example.com/a', '/'],
        ['preserves a trailing slash on a rootless directory', 'urn:a/', 'urn:a/b', './'],
        ['protects a colon-containing first path segment', 'urn:a:b', 'urn:c', './a:b'],
        ['falls back for an empty rootless target path', 'urn:', 'urn:a', 'urn:'],
        ['falls back when rootless parent traversal changes path form', 'urn:a', 'urn:a/', 'urn:a'],
    ])('%s', (description, target, base, expected) => {
        const relative = id.toRelativeReference(target, base);
        expect(relative).to.equal(expected);
        expect(id.resolveReference(relative, base)).to.equal(target);
    });
});
