# Fast Image Compression - WordPress Plugin (MVP)

This folder contains an MVP WordPress plugin implementation for Fast Image Compression.

## Path

- `fast-image-compression/fast-image-compression.php`

## MVP features included

- Plugin bootstrap and admin pages under **Media**
- Settings:
  - Default output format (JPEG/WebP/AVIF, capability-aware)
  - Default quality (1-100)
  - Keep originals by default (enabled)
  - Metadata retention toggle (best effort)
- Single-image optimize action in Media Library row actions
- Batch optimize page for selected images (with per-action overrides)
- Before/after savings shown in admin notices
- Codec/backend capability detection with fallback to JPEG when unsupported

## Install (manual)

1. Zip the `fast-image-compression` folder
2. In WordPress admin: **Plugins → Add New → Upload Plugin**
3. Activate **Fast Image Compression**

## Notes

- Current MVP optimizes the original attachment file in-place.
- If **Keep originals** is enabled, backup files are created as `filename.ext.fic-orig`.
- Metadata retention is marked as best effort due to backend differences (GD/Imagick and host setup).
