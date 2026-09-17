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

/** `host` is hostname[:port]; the label is decided on the hostname alone. */
function hostnameOf(host) {
  const h = host || '';
  // "[::1]:1234" → "[::1]"; "localhost:1234" → "localhost"; "kiddspazz.com" as is.
  return h.startsWith('[') ? h.slice(0, h.indexOf(']') + 1) : h.split(':')[0];
}

/**
 * A tag at the top-left, straddling the header/page divider, on every
 * non-production host — "DEV" on kiddspazz.com, "LOCAL" under `parcel serve`,
 * with host:port on a second line — so a tab is never mistaken for the live
 * site. Renders nothing on production.
 *
 * On the dev host it also drops a `noindex` robots meta into <head>. The real
 * guard is the X-Robots-Tag header the proxy adds for kiddspazz.com (see
 * deploy-to-dev.yml); this is the belt to that suspender for any crawler that
 * runs the JS. Local never needs it — nothing crawls localhost.
 */
const DevBadge = ({ host = window.location.host }) => {
  const label = sandboxLabel(hostnameOf(host));
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
      aria-label={`${label} deployment: ${host}`}
    >
      <span className="dev-badge__label">{label}</span>
      <span className="dev-badge__info">{host}</span>
    </div>
  );
};

export default DevBadge;
