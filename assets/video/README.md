# Video assets

The homepage video section expects a self-hosted file here (client asked for the
video to be embedded in the site rather than served from YouTube):

- `abloom-tree-care.mp4`  (H.264/AAC, ~1080p, web-optimised with `-movflags +faststart`)
- `abloom-tree-care.webm` (optional VP9/Opus for smaller delivery)

Until the encoded files are supplied, the poster image stands in and the player
shows no content. Encode example:

    ffmpeg -i source.mov -vf scale=-2:1080 -c:v libx264 -crf 22 -preset slow \
           -c:a aac -b:a 128k -movflags +faststart abloom-tree-care.mp4
