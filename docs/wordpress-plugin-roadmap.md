# WordPress Plugin Roadmap (Issue #42)

This document defines an implementation path for a WordPress plugin version of Fast Image Compression.

## Goals
- Compress images directly in WordPress Media Library
- Provide clear quality presets and format choices
- Handle codec/server capability differences safely

## MVP (Phase 1)
1. Plugin bootstrap and admin settings page
2. Media Library single-image optimize action
3. Selected-images batch optimize action
4. Before/after stats in admin UI
5. Codec capability checks (GD/Imagick, WebP/AVIF support)
6. Graceful fallback + user messaging when codec unsupported

## Architecture options
### Option A: Server-side only (WordPress-native)
- Use GD/Imagick in PHP
- Pros: works inside WP flow, no external dependency
- Cons: quality/performance variance by hosting

### Option B: Hybrid (server-side default + browser fallback)
- Server-side in admin, optional browser-assisted compression UI
- Pros: broader compatibility
- Cons: added complexity

**Recommended:** Start with Option A for MVP.

## Capability matrix to implement
- Detect active image backend (GD/Imagick)
- Detect support flags for JPEG, WebP, AVIF
- Disable unsupported formats in UI
- Fallback to JPEG with explicit notice if selected codec unavailable

## Milestones
- M1: plugin skeleton + settings page
- M2: single-image optimize
- M3: batch optimize + progress feedback
- M4: format capability/fallback handling
- M5: QA + documentation + release packaging

## Acceptance criteria mapping
- Install/activate plugin ✅
- Compress one media item ✅
- Choose quality/format and replace/download ✅
- Unsupported codec messaging ✅
- Basic success/failure counters in admin ✅

## Open questions
- Keep originals by default?
- Metadata retention policy (EXIF/IPTC)?
- Per-site defaults vs per-action override?

Closes #42
