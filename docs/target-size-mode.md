# Target Size Mode (Issue #47)

This document outlines implementation for `--max-size-kb` style behavior in the web compressor flow.

## Goal
Allow users to target a maximum output file size (KB), minimizing trial-and-error.

## Planned behavior
- Add a **Target size (KB)** input in advanced settings.
- If set, run an iterative quality search to produce output `<= target`.
- Respect a quality floor (default 0.35).
- Add two modes:
  - **best-effort** (default): returns smallest result even if target can't be met.
  - **strict**: fails when target cannot be met.

## Algorithm
1. Start from current format/quality settings.
2. Binary-search quality range `[qualityFloor, initialQuality]` for N attempts.
3. Keep smallest successful candidate under target.
4. If none under target:
   - strict mode: return failure state.
   - best-effort: return smallest generated variant.

## Acceptance mapping
- Deterministic: fixed attempt count + deterministic search boundaries.
- Clear logs: report target, attempts, final quality, output KB.
- Tests:
  - target reached
  - impossible target in strict mode
  - impossible target in best-effort mode
