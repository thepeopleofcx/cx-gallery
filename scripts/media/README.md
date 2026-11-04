# Self-hosted gallery media (Vercel Blob)

Galleries from October 2026 on host their media in the public Blob store
`cx-gallery-media` (CX team, connected to this project). The June 19 gallery still
serves from Google Drive.

Pipeline used for `october-30-2026` (run outside the repo, e.g. `~/Claude/cx-gallery-media/`):

1. `process-photos.sh` — every photo → `NNN-2048.jpg` / `-1280` / `-640` (sips) + `photos.tsv` (id, w, h, source name).
2. `process-videos.sh cuts.tsv` — each clip → `vNN-loop.mp4` (6s muted 540×960 cut that plays inline in the grid),
   `vNN-full.mp4` (whole clip, 720×1280 + sound, for the lightbox), `vNN-poster.jpg`.
   `cuts.tsv` = `clip<TAB>start-seconds`; starts were picked as the brightest 6s window of each clip.
   Needs an ffmpeg binary (set `FF`); keep `-nostdin`, or ffmpeg swallows the cut list.
3. `upload.mjs <slug>` — uploads to `gallery/<slug>/...` with stable pathnames and writes `urls.json`
   (needs `BLOB_READ_WRITE_TOKEN`, from `vercel env pull`; `npm i @vercel/blob` where it runs).
4. Generate `data/galleries/<slug>.json`: items in `photos[]` are photos, or `{ "type": "video", loop, full, poster }`.
   `coverIndex` picks the home-card / social image.
