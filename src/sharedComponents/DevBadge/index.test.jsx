import React from 'react';
import { render } from '@testing-library/react';
import DevBadge, { isSandboxHost, sandboxLabel } from '.';

test('sandboxLabel: kiddspazz.com and its subdomains are dev', () => {
  expect(sandboxLabel('kiddspazz.com')).toBe('dev');
  expect(sandboxLabel('www.kiddspazz.com')).toBe('dev');
  expect(sandboxLabel('KIDDSPAZZ.COM')).toBe('dev');
  expect(isSandboxHost('kiddspazz.com')).toBe(true);
});

test('sandboxLabel: loopback and .local names are local', () => {
  expect(sandboxLabel('localhost')).toBe('local');
  expect(sandboxLabel('127.0.0.1')).toBe('local');
  expect(sandboxLabel('::1')).toBe('local');
  expect(sandboxLabel('www.localhost')).toBe('local');
  expect(sandboxLabel('macbook.local')).toBe('local');
  expect(isSandboxHost('localhost')).toBe(false);
});

test('sandboxLabel: production and unknown hosts get no label', () => {
  expect(sandboxLabel('travish.com')).toBe(null);
  expect(sandboxLabel('www.travish.com')).toBe(null);
  expect(sandboxLabel('notkiddspazz.com')).toBe(null);
  expect(sandboxLabel('mylocal.example')).toBe(null);
  expect(sandboxLabel('')).toBe(null);
  expect(sandboxLabel(undefined)).toBe(null);
});

test('renders nothing and touches no <head> on production', () => {
  const { container } = render(<DevBadge hostname="travish.com" />);
  expect(container).toBeEmptyDOMElement();
  expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
});

test('dev: renders the ribbon and a noindex meta, and cleans up', () => {
  const { getByRole, unmount } = render(<DevBadge hostname="kiddspazz.com" />);
  const badge = getByRole('status');
  expect(badge).toHaveTextContent(/^devkiddspazz\.com$/);
  expect(badge).toHaveClass('dev-badge--dev');
  expect(badge).toHaveAttribute('aria-label', 'dev deployment: kiddspazz.com');
  const meta = document.head.querySelector('meta[name="robots"]');
  expect(meta).not.toBeNull();
  expect(meta.getAttribute('content')).toBe('noindex, nofollow');
  unmount();
  expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
});

test('local: renders the ribbon but no robots meta', () => {
  const { getByRole } = render(<DevBadge hostname="localhost" />);
  const badge = getByRole('status');
  expect(badge).toHaveTextContent(/^locallocalhost$/);
  expect(badge).toHaveClass('dev-badge--local');
  expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
});

test('defaults to the real hostname, which is localhost under jest', () => {
  const { getByRole } = render(<DevBadge />);
  expect(getByRole('status')).toHaveTextContent(/^locallocalhost$/);
});
