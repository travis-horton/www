import { versionLabel } from './versionLabel';

// semver.org's own pattern for a version with optional pre-release and build metadata.
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

describe('the footer version label', () => {
  test('a sandbox build: the release version + its Boise build time', () => {
    expect(versionLabel('3.28.0', '26.0918.1600')).toBe('v3.28.0+26.0918.1600');
  });

  test('is standard semver (build metadata after the +)', () => {
    expect(versionLabel('3.28.0', '26.0918.1600').slice(1)).toMatch(SEMVER);
    expect(versionLabel('3.28.0', '').slice(1)).toMatch(SEMVER);
  });

  test('a local build says so rather than inventing a date', () => {
    expect(versionLabel('3.28.0', undefined)).toBe('v3.28.0+local');
  });
});
