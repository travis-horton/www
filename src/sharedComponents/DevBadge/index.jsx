import React, { useEffect } from 'react';

import './styles.css';

/**
 * Is this hostname the sandbox deploy? kiddspazz.com (and www.) is where
 * `dev` lands; travish.com is production. Same image, same bundle — the host
 * is the only thing that tells them apart at runtime.
 */
export function isSandboxHost(hostname) {
  const h = (hostname || '').toLowerCase();
  return h === 'kiddspazz.com' || h.endsWith('.kiddspazz.com');
}

/**
 * A small fixed corner tag on the sandbox deploy, so a tab open on
 * kiddspazz.com is never mistaken for the live site. Renders nothing on
 * production and in tests (jsdom's hostname is localhost).
 *
 * It also drops a `noindex` robots meta into <head> on the sandbox. The real
 * guard is the X-Robots-Tag header the proxy adds for kiddspazz.com (see
 * deploy-to-dev.yml); this is the belt to that suspender for any crawler that
 * runs the JS.
 */
const DevBadge = ({ hostname = window.location.hostname }) => {
  const sandbox = isSandboxHost(hostname);

  useEffect(() => {
    if (!sandbox) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [sandbox]);

  if (!sandbox) return null;
  return (
    <div className="dev-badge" role="status" aria-label="Sandbox deployment">
      dev · {hostname}
    </div>
  );
};

export default DevBadge;
