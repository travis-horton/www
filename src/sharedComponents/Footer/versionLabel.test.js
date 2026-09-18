import { versionLabel } from './versionLabel';

// semver.org's own pattern for a version with optional pre-release and build metadata.
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

describe('the footer version label', () => {
  test('a sandbox build: version + Boise build time + short commit', () => {
    expect(versionLabel('3.27.0', '26.0918.1600', '11033ea3a7388eca475388a88843b18f351d0420')).toBe(
      'v3.27.0+26.0918.1600.11033ea',
    );
  });

  test('is standard semver (build metadata after the +)', () => {
    expect(versionLabel('3.27.0', '26.0918.1600', '11033ea').slice(1)).toMatch(SEMVER);
    expect(versionLabel('3.27.0', '', '').slice(1)).toMatch(SEMVER);
  });

  test('a local build says so rather than inventing a date or commit', () => {
    expect(versionLabel('3.27.0', undefined, undefined)).toBe('v3.27.0+local');
    expect(versionLabel('3.27.0', '', 'abcdef123')).toBe('v3.27.0+abcdef1');
  });
});
