/*
 * The footer's version, as SEMVER with build metadata (26.0918):
 *
 *   v3.28.0+26.0918.1600
 *    │       └ when this build was made, Boise time, YY.MMDD.HHMM (BUILD_DATE)
 *    └ the release version (APP_VERSION)
 *
 * APP_VERSION is decided when the SANDBOX builds: deploy-to-dev asks the history
 * tools what the next release will be (`history-append.mjs --predict` — the same
 * calculation the release's own merge makes), and production runs that exact
 * image, so the live site shows the version it really is. A build without it
 * falls back to package.json's version.
 *
 * Everything after "+" is semver BUILD METADATA: it describes this build and never
 * changes how versions compare, so the label stays standard semver. A local build
 * has no date and says so: v3.28.0+local.
 */
export const versionLabel = (version, buildDate) => `v${version}+${buildDate || 'local'}`;
