import React from 'react';
import { render } from '@testing-library/react';
import DevBadge, { isSandboxHost } from '.';

test('isSandboxHost: kiddspazz.com and its subdomains are the sandbox', () => {
  expect(isSandboxHost('kiddspazz.com')).toBe(true);
  expect(isSandboxHost('www.kiddspazz.com')).toBe(true);
  expect(isSandboxHost('KIDDSPAZZ.COM')).toBe(true);
});

test('isSandboxHost: production and local hosts are not', () => {
  expect(isSandboxHost('travish.com')).toBe(false);
  expect(isSandboxHost('www.travish.com')).toBe(false);
  expect(isSandboxHost('localhost')).toBe(false);
  expect(isSandboxHost('notkiddspazz.com')).toBe(false);
  expect(isSandboxHost('')).toBe(false);
  expect(isSandboxHost(undefined)).toBe(false);
});

test('renders nothing and touches no <head> on production', () => {
  const { container } = render(<DevBadge hostname="travish.com" />);
  expect(container).toBeEmptyDOMElement();
  expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
});

test('renders the badge and a noindex meta on the sandbox, and cleans up', () => {
  const { getByRole, unmount } = render(<DevBadge hostname="kiddspazz.com" />);
  expect(getByRole('status')).toHaveTextContent('dev · kiddspazz.com');
  const meta = document.head.querySelector('meta[name="robots"]');
  expect(meta).not.toBeNull();
  expect(meta.getAttribute('content')).toBe('noindex, nofollow');
  unmount();
  expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
});

test('defaults to the real hostname, which is not the sandbox under jest', () => {
  const { container } = render(<DevBadge />);
  expect(container).toBeEmptyDOMElement();
});
