#!/usr/bin/env python3
"""Rewrite srcset / sizes on every content image, and the homepage LCP preload.

Reads whatever variants exist in assets/img (see build-image-variants.py) and
rebuilds the srcset attribute for each <img> from scratch, so the markup can
never drift from the files on disk. The `sizes` value per image depends on
where it sits in the layout; those widths are derived from styles.css and are
listed in SIZES below.

    python3 tools/build-image-variants.py     # first: make the files
    python3 tools/build-srcset.py             # then: point the markup at them
"""
import glob
import io
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is required:  pip install Pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'img')

# Layout widths taken from styles.css:
#   .wrap        max-width 1180, side padding 32 (22 below 860px)
#   .hero-visual <=860: 100vw-44  | <=1020: 560 | else ~450
#   .split-img   <=860: 100vw-44  | else (1116-56)/2 = 530
#   .gallery     <=860: 100vw-44  | else (1116-36)/3 = 360
#   .side-img    hidden below 1020px, else a 360px column
SIZES = {
    'hero':    '(max-width:860px) calc(100vw - 44px), (max-width:1020px) 560px, 450px',
    'split':   '(max-width:860px) calc(100vw - 44px), 530px',
    'gallery': '(max-width:860px) calc(100vw - 44px), 360px',
    'side':    '360px',
    'poster':  '(max-width:860px) calc(100vw - 44px), 1116px',
}
LADDER = (400, 550, 650, 700, 900, 1100)
SKIP = ('abloom-logo', 'favicon', 'apple-touch')


def srcset_for(fname):
    stem = fname[:-5]
    parts = []
    for w in LADDER:
        p = os.path.join(IMG, '%s-%dw.webp' % (stem, w))
        if os.path.exists(p):
            parts.append('/assets/img/%s-%dw.webp %dw' % (stem, w, w))
    master = os.path.join(IMG, fname)
    if os.path.exists(master):
        parts.append('/assets/img/%s %dw' % (fname, Image.open(master).size[0]))
    return parts


def kind_of(tag, before, wider):
    if 'hero-photo' in tag:   return 'hero'
    if 'vp-poster' in tag:    return 'poster'
    if '<figure' in before and 'gallery' in wider: return 'gallery'
    if 'side-img' in before:  return 'side'
    return 'split'


def pages():
    names = ['index.html', 'about/index.html', 'contact/index.html', 'thank-you/index.html']
    names += sorted(os.path.relpath(p, ROOT) for p in glob.glob(os.path.join(ROOT, 'services', '*', 'index.html')))
    return names


def main():
    total = 0
    for name in pages():
        path = os.path.join(ROOT, name)
        s = io.open(path, encoding='utf-8').read()
        before_all = s
        # start clean so a shrunken ladder cannot leave stale entries behind
        s = re.sub(r'\s+srcset="[^"]*"\s+sizes="[^"]*"', '', s)
        s = re.sub(r'(<link rel="preload" as="image" href="[^"]+)" imagesrcset="[^"]*" imagesizes="[^"]*"', r'\1"', s)

        count = 0
        for m in list(re.finditer(r'<img\b[^>]*?src="/assets/img/([A-Za-z0-9._-]+\.webp)"[^>]*>', s)):
            tag, fname = m.group(0), m.group(1)
            if any(k in fname for k in SKIP):
                continue
            parts = srcset_for(fname)
            if len(parts) < 2:
                continue
            kind = kind_of(tag, s[max(0, m.start() - 320):m.start()], s[max(0, m.start() - 2200):m.start()])
            s = s.replace(tag, tag[:-1].rstrip() + ' srcset="%s" sizes="%s">' % (', '.join(parts), SIZES[kind]), 1)
            count += 1

        # the preload must offer the same candidates, or the browser fetches twice
        hero = re.search(r'<img class="hero-photo"[^>]*srcset="([^"]*)"[^>]*>', s)
        pre = re.search(r'[ \t]*<link rel="preload" as="image" href="([^"]+)" fetchpriority="high">\n', s)
        if hero and pre:
            src = re.search(r'src="([^"]+)"', hero.group(0)).group(1)
            s = s[:pre.start()] + ('<link rel="preload" as="image" href="%s" imagesrcset="%s" imagesizes="%s" fetchpriority="high">\n'
                                   % (src, hero.group(1), SIZES['hero'])) + s[pre.end():]

        if s != before_all:
            io.open(path, 'w', encoding='utf-8').write(s)
        total += count
        print('%-46s %2d images' % (name, count))
    print('srcset attributes written:', total)


if __name__ == '__main__':
    main()
