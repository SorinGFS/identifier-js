import { describe, expect, test } from 'vitest';
import id from '../index.js';

describe('isUUID', () => {
    test('valid UUID with lowercase hex digits', () => {
        expect(id.isUUID('123e4567-e89b-42d3-9456-426614174000')).to.equal(true);
    });

    test('valid UUID with uppercase hex digits', () => {
        expect(id.isUUID('123E4567-E89B-42D3-A456-426614174000')).to.equal(true);
    });

    test('valid UUID with mixed case hex digits', () => {
        expect(id.isUUID('123e4567-E89B-42d3-a456-426614174000')).to.equal(true);
    });

    test('invalid UUID missing hyphens', () => {
        expect(() => id.isUUID('123e4567e89b12d3a456426614174000')).to.throw(Error, 'Invalid UUID: 123e4567e89b12d3a456426614174000');
    });

    test('invalid UUID with extra hyphens', () => {
        expect(() => id.isUUID('123e4567-e89b-12d3-a456-426-614174000')).to.throw(Error, 'Invalid UUID: 123e4567-e89b-12d3-a456-426-614174000');
    });

    test('invalid UUID with incorrect group lengths', () => {
        expect(() => id.isUUID('123e4567-e89b-12d3-a456426614174000')).to.throw(Error, 'Invalid UUID: 123e4567-e89b-12d3-a456426614174000');
    });

    test('invalid UUID with non-hexadecimal characters', () => {
        expect(() => id.isUUID('123e4567-e89b-12d3-g456-426614174000')).to.throw(Error, 'Invalid UUID: 123e4567-e89b-12d3-g456-426614174000');
    });

    test('invalid UUID string that is too short', () => {
        expect(() => id.isUUID('123e4567-e89b-12d3-a456-42661417400')).to.throw(Error, 'Invalid UUID: 123e4567-e89b-12d3-a456-42661417400');
    });

    test('invalid UUID string that is too long', () => {
        expect(() => id.isUUID('123e4567-e89b-12d3-a456-4266141740000')).to.throw(Error, 'Invalid UUID: 123e4567-e89b-12d3-a456-4266141740000');
    });

    test('valid UUID with all zeroes except version control chars', () => {
        expect(id.isUUID('00000000-0000-4000-8000-000000000000')).to.equal(true);
    });

    test('invalid UUID with missing section', () => {
        expect(() => id.isUUID('2eb8aa08-aa98-11ea-73b441d16380')).to.throw(Error, 'Invalid UUID: 2eb8aa08-aa98-11ea-73b441d16380');
    });

    test('invalid UUID with too many dashes', () => {
        expect(() => id.isUUID('2eb8-aa08-aa98-11ea-b4aa73b44-1d16380')).to.throw(Error, 'Invalid UUID: 2eb8-aa08-aa98-11ea-b4aa73b44-1d16380');
    });

    test('invalid UUID with dashes in the wrong spot', () => {
        expect(() => id.isUUID('2eb8aa08aa9811eab4aa73b441d16380----')).to.throw(Error, 'Invalid UUID: 2eb8aa08aa9811eab4aa73b441d16380----');
    });

    test('valid UUID v5', () => {
        expect(id.isUUID('99c17cbb-656f-564a-940f-1a4568f03487')).to.equal(true);
    });

    test('valid UUID hypothetical v6', () => {
        expect(id.isUUID('99c17cbb-656f-664a-940f-1a4568f03487')).to.equal(true);
    });

    test('valid UUID hypothetical v15', () => {
        expect(id.isUUID('99c17cbb-656f-f64a-940f-1a4568f03487')).to.equal(true);
    });
});

describe('isUUIDv4', () => {
    test('valid UUID v4 with lowercase hex digits', () => {
        expect(id.isUUIDv4('123e4567-e89b-42d3-9456-426614174000')).to.equal(true);
    });

    test('valid UUID v4 with uppercase hex digits', () => {
        expect(id.isUUIDv4('123E4567-E89B-42D3-A456-426614174000')).to.equal(true);
    });

    test('valid UUID v4 with mixed case hex digits', () => {
        expect(id.isUUIDv4('123e4567-E89B-42d3-a456-426614174000')).to.equal(true);
    });

    test('invalid UUID v4 missing hyphens', () => {
        expect(() => id.isUUIDv4('123e4567e89b12d3a456426614174000')).to.throw(Error, 'Invalid UUID-v4: 123e4567e89b12d3a456426614174000');
    });

    test('invalid UUID v4 with extra hyphens', () => {
        expect(() => id.isUUIDv4('123e4567-e89b-12d3-a456-426-614174000')).to.throw(Error, 'Invalid UUID-v4: 123e4567-e89b-12d3-a456-426-614174000');
    });

    test('invalid UUID v4 with incorrect group lengths', () => {
        expect(() => id.isUUIDv4('123e4567-e89b-12d3-a456426614174000')).to.throw(Error, 'Invalid UUID-v4: 123e4567-e89b-12d3-a456426614174000');
    });

    test('invalid UUID v4 with non-hexadecimal characters', () => {
        expect(() => id.isUUIDv4('123e4567-e89b-12d3-g456-426614174000')).to.throw(Error, 'Invalid UUID-v4: 123e4567-e89b-12d3-g456-426614174000');
    });

    test('invalid UUID v4 string that is too short', () => {
        expect(() => id.isUUIDv4('123e4567-e89b-12d3-a456-42661417400')).to.throw(Error, 'Invalid UUID-v4: 123e4567-e89b-12d3-a456-42661417400');
    });

    test('invalid UUID v4 string that is too long', () => {
        expect(() => id.isUUIDv4('123e4567-e89b-12d3-a456-4266141740000')).to.throw(Error, 'Invalid UUID-v4: 123e4567-e89b-12d3-a456-4266141740000');
    });

    test('valid UUID v4 with all zeroes except version control chars', () => {
        expect(id.isUUIDv4('00000000-0000-4000-8000-000000000000')).to.equal(true);
    });

    test('invalid UUID v4 with missing section', () => {
        expect(() => id.isUUIDv4('2eb8aa08-aa98-11ea-73b441d16380')).to.throw(Error, 'Invalid UUID-v4: 2eb8aa08-aa98-11ea-73b441d16380');
    });

    test('invalid UUID v4 with too many dashes', () => {
        expect(() => id.isUUIDv4('2eb8-aa08-aa98-11ea-b4aa73b44-1d16380')).to.throw(Error, 'Invalid UUID-v4: 2eb8-aa08-aa98-11ea-b4aa73b44-1d16380');
    });

    test('invalid UUID v4 with dashes in the wrong spot', () => {
        expect(() => id.isUUIDv4('2eb8aa08aa9811eab4aa73b441d16380----')).to.throw(Error, 'Invalid UUID-v4: 2eb8aa08aa9811eab4aa73b441d16380----');
    });
});

describe('isUri', () => {
    test('Full', () => {
        expect(id.isUri('https://jason@example.com:80/foo?bar#baz')).to.equal(true);
    });

    test('Scheme is required', () => {
        expect(() => id.isUri('//example.com/foo?bar#baz')).to.throw(Error, 'Invalid URI: //example.com/foo?bar#baz');
    });

    test('No authority', () => {
        expect(id.isUri('uri:/foo?bar#baz')).to.equal(true);
    });

    test('No authority starting with double slash', () => {
        expect(() => id.isUri('uri://12:34:56/foo?bar#baz')).to.throw(Error, 'Invalid URI: uri://12:34:56/foo?bar#baz');
    });

    test('Rootless path', () => {
        expect(id.isUri('uri:foo?bar#baz')).to.equal(true);
    });

    test('Unicode is not allowed', () => {
        expect(() => id.isUri('http://examplé.org/rosé#')).to.throw(Error, 'Invalid URI: http://examplé.org/rosé#');
    });
});

describe('isUriReference', () => {
    test('Full', () => {
        expect(id.isUriReference('https://jason@example.com:80/foo?bar#baz')).to.equal(true);
    });

    test('No scheme with authority', () => {
        expect(id.isUriReference('//example.com/foo?bar#baz')).to.equal(true);
    });

    test('No double slash', () => {
        expect(id.isUriReference('example.com/foo?bar#baz')).to.equal(true);
    });

    test('No authority', () => {
        expect(id.isUriReference('/foo?bar#baz')).to.equal(true);
    });

    test('No path', () => {
        expect(id.isUriReference('?bar#baz')).to.equal(true);
    });

    test('No query', () => {
        expect(id.isUriReference('#baz')).to.equal(true);
    });

    test('Empty', () => {
        expect(id.isUriReference('')).to.equal(true);
    });

    test('Unicode is not allowed', () => {
        expect(() => id.isUriReference('/rosé#')).to.throw(Error, 'Invalid URI-reference: /rosé#');
    });
});

describe('isAbsoluteUri', () => {
    test('Full', () => {
        expect(id.isAbsoluteUri('https://jason@example.com:80/foo?bar')).to.equal(true);
    });

    test('Scheme is required', () => {
        expect(() => id.isAbsoluteUri('//example.com/foo?bar')).to.throw(Error, 'Invalid absolute-URI: //example.com/foo?bar');
    });

    test('Fragment is not allowed', () => {
        expect(() => id.isAbsoluteUri('https://example.com/foo?bar#baz')).to.throw(Error, 'Invalid absolute-URI: https://example.com/foo?bar#baz');
    });

    test('Unicode is not allowed', () => {
        expect(() => id.isAbsoluteUri('http://examplé.org/rosé')).to.throw(Error, 'Invalid absolute-URI: http://examplé.org/rosé');
    });
});

describe('isIri', () => {
    test('Full', () => {
        expect(id.isIri('http://jásón@examplé.org:80/rosé?fóo#bár')).to.equal(true);
    });

    test('Scheme is required', () => {
        expect(() => id.isIri('//examplé.com/rosé?fóo#bár')).to.throw(Error, 'Invalid IRI: //examplé.com/rosé?fóo#bár');
    });

    test('No authority', () => {
        expect(id.isIri('uri:/rosé?fóo#bár')).to.equal(true);
    });

    test('No authority starting with double slash', () => {
        expect(() => id.isIri('uri://12:23:45/rosé?fóo#bár')).to.throw(Error, 'Invalid IRI: uri://12:23:45/rosé?fóo#bár');
    });

    test('Rootless path', () => {
        expect(id.isIri('uri:rosé?fóo#bár')).to.equal(true);
    });

    test('Unicode is not allowed in scheme', () => {
        expect(() => id.isIri('examplé://examplé.org/rosé')).to.throw(Error, 'Invalid IRI: examplé://examplé.org/rosé');
    });
});

describe('isIriReference', () => {
    test('Full', () => {
        expect(id.isIriReference('http://jásón@examplé.org:80/rosé?fóo#bár')).to.equal(true);
    });

    test('No scheme with authority', () => {
        expect(id.isIriReference('//examplé.org/rosé?fóo#bár')).to.equal(true);
    });

    test('No double slash', () => {
        expect(id.isIriReference('examplé.org/rosé?fóo#bár')).to.equal(true);
    });

    test('No authority', () => {
        expect(id.isIriReference('/rosé?fóo#bár')).to.equal(true);
    });

    test('Rootless path', () => {
        expect(id.isIriReference('rosé?fóo#bár')).to.equal(true);
    });

    test('No path', () => {
        expect(id.isIriReference('?fóo#bár')).to.equal(true);
    });

    test('No query', () => {
        expect(id.isIriReference('#bár')).to.equal(true);
    });

    test('Empty', () => {
        expect(id.isIriReference('')).to.equal(true);
    });
});

describe('isAbsoluteIri', () => {
    test('Full', () => {
        expect(id.isAbsoluteIri('http://jásón@examplé.org:80/rosé?fóo')).to.equal(true);
    });

    test('Scheme is required', () => {
        expect(() => id.isAbsoluteIri('//examplé.org/rosé?fóo')).to.throw(Error, 'Invalid absolute-IRI: //examplé.org/rosé?fóo');
    });

    test('Fragment is not allowed', () => {
        expect(() => id.isAbsoluteIri('http://examplé.org/rosé?fóo#bár')).to.throw(Error, 'Invalid absolute-IRI: http://examplé.org/rosé?fóo#bár');
    });

    test('Unicode is not allowed in scheme', () => {
        expect(() => id.isAbsoluteIri('examplé://examplé.org/rosé')).to.throw(Error, 'Invalid absolute-IRI: examplé://examplé.org/rosé');
    });
});
