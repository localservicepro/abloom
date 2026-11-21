#!/usr/bin/env python3
"""Regenerate the responsive image variants referenced by srcset.

Every photo in assets/img/ that a page displays at size gets a ladder of
smaller renditions (`name-400w.webp`, `name-550w.webp`, ...) so phones download
a file matched to their screen instead of the full-width master.

Run this after adding or replacing a photo, then add the srcset by hand or
re-run the page rewrite. Masters are the source of truth; variants are derived
and safe to delete and rebuild.

    python3 tools/build-image-variants.py
"""
import glob
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is required:  pip install Pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'img')

# Smaller renditions are displayed smaller, so they tolerate more compression.
LADDER = {400: 66, 550: 70, 650: 70, 700: 72, 900: 75, 1100: 76}
# Logos, icons and favicons are sized exactly for their slot already.
SKIP = ('abloom-logo', 'favicon', 'apple-touch')
VARIANT = re.compile(r'-\d+w\.webp$')


def displayed():
    """Photos that actually appear in an <img> tag. A file referenced only as
    an og:image never needs a responsive ladder."""
    names = set()
    pages = ['index.html', 'about/index.html', 'contact/index.html', 'thank-you/index.html']
    pages += sorted(glob.glob(os.path.join(ROOT, 'services', '*', 'index.html')))
    for f in pages:
        s = open(os.path.join(ROOT, f), encoding='utf-8').read()
        for tag in re.findall(r'<img\b[^>]*>', s):
            m = re.search(r'src="/assets/img/([A-Za-z0-9._-]+\.webp)"', tag)
            if m:
                names.add(m.group(1))
    return names


def masters():
    shown = displayed()
    for p in sorted(glob.glob(os.path.join(IMG, '*.webp'))):
        name = os.path.basename(p)
        if VARIANT.search(name) or any(k in name for k in SKIP) or name not in shown:
            continue
        yield p, name


def main():
    made = skipped = 0
    for path, name in masters():
        im = Image.open(path)
        # Never flatten a transparent source: converting to RGB fills the
        # alpha with black, which is how the logos once ended up in a box.
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        w, h = im.size
        stem = name[:-5]
        for tw, q in sorted(LADDER.items()):
            # no point shipping a variant within 8% of the master
            if tw >= w * 0.92:
                skipped += 1
                continue
            out = os.path.join(IMG, '%s-%dw.webp' % (stem, tw))
            im.resize((tw, round(h * tw / w)), Image.LANCZOS).save(out, 'WEBP', quality=q, method=6)
            made += 1
    print('variants written: %d (skipped %d too close to the master)' % (made, skipped))


if __name__ == '__main__':
    main()
