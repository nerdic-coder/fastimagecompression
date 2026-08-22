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
  - Optional automatic optimization for newly uploaded images (disabled by default)
  - Single-image optimize action in Media Library row actions
  - Batch optimize page for unoptimized images with select-all and per-action overrides
- Before/after savings shown in admin notices
- Codec/backend capability detection with clear errors when an explicitly selected format is unsupported

## Install (manual)

1. Zip the `fast-image-compression` folder
2. In WordPress admin: **Plugins → Add New → Upload Plugin**
3. Activate **Fast Image Compression**

## Notes

- Same-format optimization updates the original attachment in-place.
- Format conversion creates a correctly named attachment file (for example, `.jpg` → `.webp`) and updates WordPress attachment metadata.
- If **Keep originals** is enabled, the source file is backed up as `filename.ext.fic-orig`; optimization stops if that backup cannot be created.
- Metadata retention is best effort due to backend differences (GD/Imagick and host setup), and is applied through WordPress's `image_strip_meta` filter.
- Optimization requires both `upload_files` and attachment-level `edit_post` permission.
- The batch view tracks images optimized by this plugin with the current defaults and hides them from the list. Changing the defaults makes them eligible again.
- Automatic upload optimization is disabled by default and can be enabled in **Media → Fast Compression**.
