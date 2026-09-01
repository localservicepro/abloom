# Video assets

The homepage video is self-hosted (the client asked for it to be embedded in the
site rather than served from YouTube). Two encodes ship, both H.264 MP4, silent,
37s, 16:9, written with `-movflags +faststart` so playback can begin before the
file finishes downloading:

| File | Resolution | Bitrate | Size | Used for |
|---|---|---|---|---|
| `abloom-web-desktop.mp4` | 1280x720 | ~2.2 Mbps | 10.4 MB | Viewports wider than 767px |
| `abloom-web-mobile.mp4`  | 854x480  | ~0.9 Mbps | 4.3 MB  | Viewports 767px and under |

`assets/js/main.js` swaps the `<source>` to the mobile file on narrow screens,
once at page load (not on resize, so a viewport change never interrupts
playback). Without JavaScript the desktop file declared in the markup is used,
which still plays everywhere.

The player uses `preload="none"` plus a poster image, so neither file is
downloaded until the visitor presses play. That keeps the video off the
homepage's Largest Contentful Paint.

The poster (`assets/img/video-poster.webp`) is a frame taken from the video at
1.2s. To regenerate it:

    ffmpeg -ss 1.2 -i assets/video/abloom-web-desktop.mp4 -frames:v 1 \
           -vf "scale=1280:720" -c:v libwebp -quality 80 assets/img/video-poster.webp
