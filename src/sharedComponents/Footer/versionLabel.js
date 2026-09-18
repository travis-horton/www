/*
 * The footer's version, as SEMVER with build metadata (26.0918):
 *
 *   v3.27.0+26.0918.1600.11033ea
 *    │       │              └ the commit the build was made from (GIT_HASH)
 *    │       └ when the build was made, Boise time, YY.MMDD.HHMM (BUILD_DATE)
 *    └ the release version, stamped into package.json by the history workflow
 *
 * Everything after "+" is semver BUILD METADATA: it describes this particular
 * build and never changes how versions compare, so the string stays standard
 * semver. deploy-to-dev passes both build values; production runs that same
 * image, so the sandbox and the live site show the same label. A local build
 * has neither and says so: v3.27.0+local.
 */
export const versionLabel = (version, buildDate, gitHash) => {
  const meta = [buildDate, (gitHash || '').slice(0, 7)].filter(Boolean).join('.');
  return `v${version}+${meta || 'local'}`;
};
