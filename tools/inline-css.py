#!/usr/bin/env python3
"""Inline assets/css/styles.css into every page.

The stylesheet is the last render-blocking request on the site, and on a
throttled mobile connection that round trip costs roughly a second of First
Contentful Paint. Folding it into the HTML that is already in flight removes
the request entirely.

assets/css/styles.css stays the single source of truth. Edit that file, then
run this script to push the change into the pages:

    python3 tools/inline-css.py

It is idempotent: the inlined block sits between the CSS_START / CSS_END
markers and is replaced wholesale on every run.
"""
import glob
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, 'assets', 'css', 'styles.css')
START = '<!-- styles.css inlined by tools/inline-css.py. Edit the stylesheet, not this block. -->'
END = '<!-- /styles.css -->'
LINK = '<link rel="stylesheet" href="/assets/css/styles.css">'


def minify(css):
    """Conservative minify: drop comments, collapse whitespace, tighten
    punctuation. Whitespace collapses to a single space rather than nothing so
    descendant combinators (`.a .b`) always survive."""
    out = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out = re.sub(r'\s+', ' ', out)
    out = re.sub(r'\s*([{};:,])\s*', r'\1', out)
    out = re.sub(r';}', '}', out)
    return out.strip()


def pages():
    names = ['index.html', 'about/index.html', 'contact/index.html', 'thank-you/index.html']
    names += sorted(os.path.relpath(p, ROOT) for p in glob.glob(os.path.join(ROOT, 'services', '*', 'index.html')))
    return names


def main():
    css = io.open(CSS, encoding='utf-8').read()
    block = START + '<style>' + minify(css) + '</style>' + END
    print('styles.css %d bytes -> %d inlined' % (len(css), len(block)))

    changed = 0
    for name in pages():
        path = os.path.join(ROOT, name)
        s = io.open(path, encoding='utf-8').read()
        before = s
        existing = re.search(re.escape(START) + r'.*?' + re.escape(END), s, re.S)
        if existing:
            s = s[:existing.start()] + block + s[existing.end():]
        elif LINK in s:
            s = s.replace(LINK, block, 1)
        else:
            sys.exit('no stylesheet link or inlined block found in ' + name)
        if s != before:
            io.open(path, 'w', encoding='utf-8').write(s)
            changed += 1
    print('pages rewritten:', changed, 'of', len(pages()))


if __name__ == '__main__':
    main()
