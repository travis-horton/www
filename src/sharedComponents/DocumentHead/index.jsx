/*
 * The tab title and the canonical address, per page (26.1009).
 *
 * Until now every address had index.html's one title, "Travis Horton: one
 * human bean", and no canonical link, so search results and browser tabs could
 * not tell the pages apart, and Search Console flagged the hosts as duplicates
 * with no canonical chosen.
 *
 *   useDocumentTitle('Piano')  ->  "Piano · Travis Horton"
 *   useDocumentTitle()         ->  the home page's title
 *
 * A page that sets no title shows the home page's: each title is put back when
 * its page leaves, and React runs a leaving page's clean-up before the next
 * page's effects, so a page never inherits the one before it.
 *
 * Call it from the LEAF that draws the page (Titled, below, for a route
 * element), never from a section that wraps other pages: React runs a child's
 * effects before its parent's, so a section's title would overwrite its pages'.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE_NAME = 'Travis Horton';
export const HOME_TITLE = 'Travis Horton: one human bean';
// www.travish.com is the canonical host (the bare domain redirects to it, and
// kiddspazz.com is the sandbox), so every copy of a page names this one.
export const CANONICAL_ORIGIN = 'https://www.travish.com';

export const titleFor = (title) =>
  title ? `${title} · ${SITE_NAME}` : HOME_TITLE;

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = titleFor(title);
    return () => {
      document.title = HOME_TITLE;
    };
  }, [title]);
}

/** A route element with a title: <Titled title="Asteroids"><Asteroids /></Titled>. */
export function Titled({ title, children }) {
  useDocumentTitle(title);
  return children;
}

/** Keeps one <link rel="canonical"> in the head, naming this page on www. */
export function Canonical() {
  const { pathname } = useLocation();
  useEffect(() => {
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${CANONICAL_ORIGIN}${pathname}`);
  }, [pathname]);
  return null;
}
