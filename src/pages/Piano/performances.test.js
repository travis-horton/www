import React from 'react';
import { render } from '@testing-library/react';

import data from '../../data/performances.json';
import Performances from './Performances';

/*
 * performances.json is imported whole by Performances.jsx, so every byte of it
 * ships in the public bundle and is downloaded by every visitor, whether or not
 * the page renders it. These tests hold the file to what the page may show:
 * public rows only, and nothing internal riding along with them.
 */

const publicRows = data.performances.filter((p) => p.visibility === 'public');
const productions = Object.values(data.productions);

const referenced = (field) =>
  new Set(
    [...publicRows, ...productions]
      .map((x) => x[field])
      .filter((id) => id !== null && id !== undefined),
  );

describe('performances.json ships public data only', () => {
  test('every performance row is public', () => {
    const nonPublic = data.performances.filter(
      (p) => p.visibility !== 'public',
    );
    expect(nonPublic.length).toBe(0);
  });

  test('no row carries a notes or confidence field', () => {
    const withNotes = data.performances.filter((p) =>
      Object.prototype.hasOwnProperty.call(p, 'notes'),
    );
    const withConfidence = data.performances.filter((p) =>
      Object.prototype.hasOwnProperty.call(p, 'confidence'),
    );
    expect({
      notes: withNotes.length,
      confidence: withConfidence.length,
    }).toEqual({ notes: 0, confidence: 0 });
  });

  test('no internal top-level fields', () => {
    const internal = ['caveats', 'sourceWindow', 'generatedAt'].filter((k) =>
      Object.prototype.hasOwnProperty.call(data, k),
    );
    expect(internal).toEqual([]);
  });

  test('every venue and institution is used by a public row or a production', () => {
    const venueIds = referenced('venueId');
    const institutionIds = referenced('institutionId');
    const unusedVenues = Object.keys(data.venues).filter(
      (id) => !venueIds.has(id),
    );
    const unusedInstitutions = Object.keys(data.institutions).filter(
      (id) => !institutionIds.has(id),
    );
    expect({
      venues: unusedVenues.length,
      institutions: unusedInstitutions.length,
    }).toEqual({ venues: 0, institutions: 0 });
  });

  test('no venue carries a street address (the page shows names only)', () => {
    const withAddress = Object.values(data.venues).filter((v) =>
      Object.prototype.hasOwnProperty.call(v, 'address'),
    );
    expect(withAddress.length).toBe(0);
  });
});

describe('performances.json stays whole', () => {
  test('every venue and institution a public row or production names exists', () => {
    const dangling = [...publicRows, ...productions].filter(
      (x) =>
        (x.venueId != null && !(x.venueId in data.venues)) ||
        (x.institutionId != null && !(x.institutionId in data.institutions)),
    );
    expect(dangling.length).toBe(0);
  });

  test('the page renders every public row and every production', () => {
    const { container } = render(<Performances />);
    expect(container.querySelectorAll('li.piano__perf')).toHaveLength(
      publicRows.length + productions.length,
    );
  });
});
