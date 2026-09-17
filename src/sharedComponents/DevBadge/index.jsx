import React, { useEffect } from 'react';

import './styles.css';

/**
 * Which non-production environment is this hostname, if any?
 *   'dev'   — kiddspazz.com (and www.): where `dev` deploys.
 *   'local' — localhost, 127.0.0.1, ::1, *.local, *.localhost: `parcel serve`.
 *   null    — travish.com, or anything else: production, no badge.
 * Same image, same bundle everywhere — the host is the only thing that tells
 * the environments apart at runtime.
 */
export function sandboxLabel(hostname) {
  const h = (hostname || '').toLowerCase();
  if (h === 'kiddspazz.com' || h.endsWith('.kiddspazz.com')) return 'dev';
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '::1' ||
    h === '[::1]' ||
    h.endsWith('.localhost') ||
    h.endsWith('.local')
  ) {
    return 'local';
  }
  return null;
}

/** Kept for callers that only need the dev/prod question. */
export function isSandboxHost(hostname) {
  return sandboxLabel(hostname) === 'dev';
}

/**
 * A small fixed corner tag on every non-production host, so a tab open on
 * kiddspazz.com or on `parcel serve` is never mistaken for the live site.
 * Renders nothing on production.
 *
 * On the dev host it also drops a `noindex` robots meta into <head>. The real
 * guard is the X-Robots-Tag header the proxy adds for kiddspazz.com (see
 * deploy-to-dev.yml); this is the belt to that suspender for any crawler that
 * runs the JS. Local never needs it — nothing crawls localhost.
 */
const DevBadge = ({ hostname = window.location.hostname }) => {
  const label = sandboxLabel(hostname);
  const noindex = label === 'dev';

  useEffect(() => {
    if (!noindex) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [noindex]);

  if (!label) return null;
  return (
    <div
      className={`dev-badge dev-badge--${label}`}
      role="status"
      aria-label={`${label} deployment`}
    >
      {label} · {hostname}
    </div>
  );
};

export default DevBadge;
