<?php
/**
 * Plugin Name: Fast Image Compression
 * Description: Optimize WordPress Media Library images with quality and format controls (MVP).
 * Version: 0.2.0
 * Author: Nerdic Coder
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

final class FIC_Plugin {
    const OPTION_KEY = 'fic_settings';
    const OPTIMIZATION_META_KEY = '_fic_optimization_signature';
    const NONCE_ACTION_SINGLE = 'fic_optimize_attachment';
    const NONCE_ACTION_BATCH = 'fic_batch_optimize';
    private static $auto_optimizing_upload = false;
    private static $capabilities = null;

    public function __construct() {
        add_action('admin_menu', [$this, 'register_admin_pages']);
        add_action('admin_init', [$this, 'register_settings']);
        add_filter('wp_generate_attachment_metadata', [$this, 'maybe_optimize_uploaded_image'], 20, 2);
        add_filter('media_row_actions', [$this, 'add_media_row_action'], 10, 2);
        add_action('admin_post_fic_optimize_attachment', [$this, 'handle_single_optimize']);
        add_action('admin_post_fic_batch_optimize', [$this, 'handle_batch_optimize']);
        add_action('admin_notices', [$this, 'render_admin_notices']);
    }

    public function register_admin_pages() {
        add_submenu_page(
            'upload.php',
            'Fast Image Compression',
            'Fast Compression',
            'upload_files',
            'fic-settings',
            [$this, 'render_settings_page']
        );

        add_submenu_page(
            'upload.php',
            'Batch Optimize Images',
            'Batch Optimize',
            'upload_files',
            'fic-batch-optimize',
            [$this, 'render_batch_page']
        );
    }

    public function register_settings() {
        register_setting(self::OPTION_KEY, self::OPTION_KEY, [$this, 'sanitize_settings']);

        add_settings_section('fic_general', 'General Settings', '__return_false', 'fic-settings');

        add_settings_field('format', 'Default output format', [$this, 'render_field_format'], 'fic-settings', 'fic_general');
        add_settings_field('quality', 'Default quality (1-100)', [$this, 'render_field_quality'], 'fic-settings', 'fic_general');
        add_settings_field('keep_originals', 'Keep originals by default', [$this, 'render_field_keep_originals'], 'fic-settings', 'fic_general');
        add_settings_field('retain_metadata', 'Retain metadata (best effort)', [$this, 'render_field_retain_metadata'], 'fic-settings', 'fic_general');
        add_settings_field('auto_optimize_uploads', 'Optimize uploads automatically', [$this, 'render_field_auto_optimize_uploads'], 'fic-settings', 'fic_general');
    }

    public function sanitize_settings($input) {
        $caps = $this->detect_capabilities();

        $format = isset($input['format']) ? sanitize_text_field($input['format']) : 'jpeg';
        if (!in_array($format, ['jpeg', 'webp', 'avif'], true)) {
            $format = 'jpeg';
        }
        if (!$caps['formats'][$format]) {
            $format = 'jpeg';
        }

        $quality = isset($input['quality']) ? intval($input['quality']) : 82;
        $quality = max(1, min(100, $quality));

        return [
            'format' => $format,
            'quality' => $quality,
            'keep_originals' => !empty($input['keep_originals']) ? 1 : 0,
            'retain_metadata' => !empty($input['retain_metadata']) ? 1 : 0,
            'auto_optimize_uploads' => !empty($input['auto_optimize_uploads']) ? 1 : 0,
        ];
    }

    private function get_settings() {
        $defaults = [
            'format' => 'jpeg',
            'quality' => 82,
            'keep_originals' => 1,
            'retain_metadata' => 0,
            'auto_optimize_uploads' => 0,
        ];

        $saved = get_option(self::OPTION_KEY, []);
        if (!is_array($saved)) {
            return $defaults;
        }

        return wp_parse_args($saved, $defaults);
    }

    public function render_field_format() {
        $settings = $this->get_settings();
        $caps = $this->detect_capabilities();
        ?>
        <select name="<?php echo esc_attr(self::OPTION_KEY); ?>[format]">
            <?php foreach (['jpeg' => 'JPEG', 'webp' => 'WebP', 'avif' => 'AVIF'] as $key => $label) : ?>
                <option value="<?php echo esc_attr($key); ?>" <?php selected($settings['format'], $key); ?> <?php disabled(!$caps['formats'][$key]); ?>>
                    <?php echo esc_html($label . (!$caps['formats'][$key] ? ' (unsupported)' : '')); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php
    }

    public function render_field_quality() {
        $settings = $this->get_settings();
        ?>
        <input type="number" min="1" max="100" name="<?php echo esc_attr(self::OPTION_KEY); ?>[quality]" value="<?php echo esc_attr($settings['quality']); ?>" />
        <?php
    }

    public function render_field_keep_originals() {
        $settings = $this->get_settings();
        ?>
        <label>
            <input type="checkbox" name="<?php echo esc_attr(self::OPTION_KEY); ?>[keep_originals]" value="1" <?php checked(1, intval($settings['keep_originals'])); ?> />
            Save a backup copy before replacing original
        </label>
        <?php
    }

    public function render_field_retain_metadata() {
        $settings = $this->get_settings();
        ?>
        <label>
            <input type="checkbox" name="<?php echo esc_attr(self::OPTION_KEY); ?>[retain_metadata]" value="1" <?php checked(1, intval($settings['retain_metadata'])); ?> />
            Keep EXIF/IPTC when backend supports it
        </label>
        <?php
    }

    public function render_field_auto_optimize_uploads() {
        $settings = $this->get_settings();
        ?>
        <label>
            <input type="checkbox" name="<?php echo esc_attr(self::OPTION_KEY); ?>[auto_optimize_uploads]" value="1" <?php checked(1, intval($settings['auto_optimize_uploads'])); ?> />
            Optimize newly uploaded images using the settings above
        </label>
        <p class="description">Disabled by default. Existing images are not changed when this setting is enabled.</p>
        <?php
    }

    public function render_settings_page() {
        if (!current_user_can('upload_files')) {
            return;
        }

        $caps = $this->detect_capabilities();
        ?>
        <div class="wrap">
            <h1>Fast Image Compression</h1>
            <p><strong>Backend:</strong> <?php echo esc_html($caps['backend']); ?></p>
            <p>
                <strong>Format support:</strong>
                JPEG: <?php echo $caps['formats']['jpeg'] ? '✅' : '❌'; ?>,
                WebP: <?php echo $caps['formats']['webp'] ? '✅' : '❌'; ?>,
                AVIF: <?php echo $caps['formats']['avif'] ? '✅' : '❌'; ?>
            </p>
            <form method="post" action="options.php">
                <?php
                settings_fields(self::OPTION_KEY);
                do_settings_sections('fic-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function render_batch_page() {
        if (!current_user_can('upload_files')) {
            return;
        }

        $settings = $this->get_settings();
        $signature = $this->optimization_signature($settings);
        $items = get_posts([
            'post_type' => 'attachment',
            'post_mime_type' => 'image',
            'post_status' => 'inherit',
            'posts_per_page' => 30,
            'orderby' => 'date',
            'order' => 'DESC',
            'meta_query' => [
                'relation' => 'OR',
                [
                    'key' => self::OPTIMIZATION_META_KEY,
                    'compare' => 'NOT EXISTS',
                ],
                [
                    'key' => self::OPTIMIZATION_META_KEY,
                    'value' => $signature,
                    'compare' => '!=',
                ],
            ],
        ]);

        ?>
        <div class="wrap">
            <h1>Batch Optimize Images</h1>
            <p>Select images that have not been optimized with the current defaults. One-time overrides are available below.</p>

            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <input type="hidden" name="action" value="fic_batch_optimize" />
                <?php wp_nonce_field(self::NONCE_ACTION_BATCH, '_fic_nonce'); ?>

                <h2>Overrides (optional)</h2>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">Format</th>
                        <td>
                            <select name="format">
                                <option value="">Use default (<?php echo esc_html(strtoupper($settings['format'])); ?>)</option>
                                <option value="jpeg">JPEG</option>
                                <option value="webp">WebP</option>
                                <option value="avif">AVIF</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Quality</th>
                        <td>
                            <input type="number" min="1" max="100" name="quality" placeholder="Use default (<?php echo intval($settings['quality']); ?>)" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Keep originals</th>
                        <td>
                            <label><input type="checkbox" name="keep_originals" value="1" /> Force keep originals</label>
                        </td>
                    </tr>
                </table>

                <h2>Images needing optimization</h2>
                <?php if (empty($items)) : ?>
                    <p>No images need optimization with the current defaults.</p>
                <?php else : ?>
                    <p>
                        <label>
                            <input type="checkbox" id="fic-select-all" />
                            Select all visible images
                        </label>
                    </p>
                    <ul>
                        <?php foreach ($items as $item) : ?>
                            <li>
                                <label>
                                    <input type="checkbox" class="fic-attachment-checkbox" name="attachment_ids[]" value="<?php echo intval($item->ID); ?>" />
                                    <?php echo esc_html($item->post_title . ' (#' . $item->ID . ')'); ?>
                                </label>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                    <?php submit_button('Optimize Selected Images'); ?>
                <?php endif; ?>
            </form>
        </div>
        <script>
        document.addEventListener('DOMContentLoaded', function () {
            const selectAll = document.getElementById('fic-select-all');
            if (!selectAll) {
                return;
            }

            const checkboxes = Array.from(document.querySelectorAll('.fic-attachment-checkbox'));
            const updateSelectAllState = function () {
                const selected = checkboxes.filter(function (checkbox) { return checkbox.checked; }).length;
                selectAll.checked = checkboxes.length > 0 && selected === checkboxes.length;
                selectAll.indeterminate = selected > 0 && selected < checkboxes.length;
            };

            selectAll.addEventListener('change', function () {
                checkboxes.forEach(function (checkbox) { checkbox.checked = selectAll.checked; });
                selectAll.indeterminate = false;
            });
            checkboxes.forEach(function (checkbox) {
                checkbox.addEventListener('change', updateSelectAllState);
            });
        });
        </script>
        <?php
    }

    public function add_media_row_action($actions, $post) {
        if (!current_user_can('upload_files') || !wp_attachment_is_image($post->ID)) {
            return $actions;
        }

        $url = wp_nonce_url(
            admin_url('admin-post.php?action=fic_optimize_attachment&attachment_id=' . intval($post->ID)),
            self::NONCE_ACTION_SINGLE,
            '_fic_nonce'
        );

        $actions['fic_optimize'] = '<a href="' . esc_url($url) . '">Optimize (Fast Compression)</a>';
        return $actions;
    }

    public function handle_single_optimize() {
        if (!current_user_can('upload_files')) {
            wp_die('Insufficient permissions');
        }

        check_admin_referer(self::NONCE_ACTION_SINGLE, '_fic_nonce');

        $attachment_id = isset($_GET['attachment_id']) ? intval($_GET['attachment_id']) : 0;
        if ($attachment_id <= 0) {
            $this->redirect_with_notice('error', 'Invalid attachment id.');
        }

        $settings = $this->get_settings();
        $result = $this->optimize_attachment($attachment_id, $settings);

        if ($result['success']) {
            $msg = sprintf('Optimized attachment #%d. Saved %s.', $attachment_id, size_format($result['saved_bytes']));
            $this->redirect_with_notice('success', $msg);
        }

        $this->redirect_with_notice('error', $result['message']);
    }

    public function handle_batch_optimize() {
        if (!current_user_can('upload_files')) {
            wp_die('Insufficient permissions');
        }

        check_admin_referer(self::NONCE_ACTION_BATCH, '_fic_nonce');

        $ids = isset($_POST['attachment_ids']) && is_array($_POST['attachment_ids'])
            ? array_map('intval', $_POST['attachment_ids'])
            : [];

        if (empty($ids)) {
            $this->redirect_with_notice('error', 'No images selected for batch optimization.', 'upload.php?page=fic-batch-optimize');
        }

        $settings = $this->get_settings();

        if (!empty($_POST['format'])) {
            $format = sanitize_key(wp_unslash($_POST['format']));
            if (in_array($format, ['jpeg', 'webp', 'avif'], true)) {
                $settings['format'] = $format;
            }
        }
        if (!empty($_POST['quality'])) {
            $settings['quality'] = max(1, min(100, intval($_POST['quality'])));
        }
        if (!empty($_POST['keep_originals'])) {
            $settings['keep_originals'] = 1;
        }

        $success = 0;
        $failed = 0;
        $saved_total = 0;

        foreach ($ids as $id) {
            $result = $this->optimize_attachment($id, $settings);
            if ($result['success']) {
                $success++;
                $saved_total += $result['saved_bytes'];
            } else {
                $failed++;
            }
        }

        $msg = sprintf('Batch complete. Success: %d, Failed: %d, Total saved: %s.', $success, $failed, size_format($saved_total));
        $this->redirect_with_notice($failed > 0 ? 'warning' : 'success', $msg, 'upload.php?page=fic-batch-optimize');
    }

    public function maybe_optimize_uploaded_image($metadata, $attachment_id) {
        $settings = $this->get_settings();

        // Only act during the initial upload metadata generation. The guard also
        // prevents recursion when optimize_attachment regenerates metadata.
        if (empty($settings['auto_optimize_uploads'])
            || self::$auto_optimizing_upload
            || !empty(get_post_meta($attachment_id, '_wp_attachment_metadata', true))
            || !wp_attachment_is_image($attachment_id)
        ) {
            return $metadata;
        }

        self::$auto_optimizing_upload = true;
        try {
            $result = $this->optimize_attachment($attachment_id, $settings);
            if ($result['success']) {
                $optimized_metadata = wp_get_attachment_metadata($attachment_id);
                if (is_array($optimized_metadata) && !empty($optimized_metadata)) {
                    return $optimized_metadata;
                }
            }
        } finally {
            self::$auto_optimizing_upload = false;
        }

        return $metadata;
    }

    private function optimization_signature($settings) {
        return md5(wp_json_encode([
            'format' => $settings['format'],
            'quality' => intval($settings['quality']),
            'keep_originals' => !empty($settings['keep_originals']) ? 1 : 0,
            'retain_metadata' => !empty($settings['retain_metadata']) ? 1 : 0,
        ]));
    }

    private function optimize_attachment($attachment_id, $settings) {
        $attachment = get_post($attachment_id);
        if (!$attachment || 'attachment' !== $attachment->post_type || !wp_attachment_is_image($attachment_id)) {
            return ['success' => false, 'saved_bytes' => 0, 'message' => 'Invalid image attachment.'];
        }

        if (!current_user_can('edit_post', $attachment_id)) {
            return ['success' => false, 'saved_bytes' => 0, 'message' => 'You are not allowed to edit this attachment.'];
        }

        $file = get_attached_file($attachment_id);
        if (!$file || !file_exists($file)) {
            return ['success' => false, 'saved_bytes' => 0, 'message' => 'Attachment file not found.'];
        }

        $before = filesize($file);
        $format = in_array($settings['format'], ['jpeg', 'webp', 'avif'], true) ? $settings['format'] : 'jpeg';
        $caps = $this->detect_capabilities();

        if (!$caps['formats'][$format]) {
            return ['success' => false, 'saved_bytes' => 0, 'message' => strtoupper($format) . ' output is not supported by this WordPress image backend.'];
        }

        $target_mime = $this->format_to_mime($format);
        $target_extension = $this->format_to_extension($format);
        $source_format = $this->extension_to_format(pathinfo($file, PATHINFO_EXTENSION));
        $target_file = $file;

        // A converted image must have a matching extension. Saving WebP/AVIF bytes
        // into a .jpg path causes incorrect MIME handling and broken thumbnails.
        if ($source_format !== $format) {
            $target_name = wp_unique_filename(
                dirname($file),
                pathinfo($file, PATHINFO_FILENAME) . '.' . $target_extension
            );
            $target_file = trailingslashit(dirname($file)) . $target_name;
        }

        $editor = wp_get_image_editor($file);
        if (is_wp_error($editor)) {
            return ['success' => false, 'saved_bytes' => 0, 'message' => 'Image editor unavailable: ' . $editor->get_error_message()];
        }

        $editor->set_quality(max(1, min(100, intval($settings['quality']))));

        // When converting formats, the source file remains untouched because
        // the optimized image is written to a separate path. A backup is only
        // needed when optimization will replace the source file in-place.
        if (!empty($settings['keep_originals']) && $target_file === $file) {
            $backup = $file . '.fic-orig';
            if (!file_exists($backup)) {
                if (!copy($file, $backup)) {
                    return ['success' => false, 'saved_bytes' => 0, 'message' => 'Could not create the original backup.'];
                }
            }
        }

        $strip_metadata = empty($settings['retain_metadata']);
        $strip_metadata_filter = static function ($strip) use ($strip_metadata) {
            return $strip_metadata;
        };
        add_filter('image_strip_meta', $strip_metadata_filter);
        $save_result = $editor->save($target_file, $target_mime);
        remove_filter('image_strip_meta', $strip_metadata_filter);
        if (is_wp_error($save_result)) {
            return ['success' => false, 'saved_bytes' => 0, 'message' => 'Failed to save optimized image: ' . $save_result->get_error_message()];
        }

        clearstatcache(true, $file);
        clearstatcache(true, $target_file);
        $after = file_exists($target_file) ? filesize($target_file) : $before;
        $saved = max(0, $before - $after);

        if ($target_file !== $file) {
            update_attached_file($attachment_id, $target_file);
            wp_update_post([
                'ID' => $attachment_id,
                'post_mime_type' => $target_mime,
            ]);
        }

        // Keep attachment metadata aligned in case dimensions or format changed.
        $metadata = wp_generate_attachment_metadata($attachment_id, $target_file);
        if (!is_wp_error($metadata) && !empty($metadata)) {
            wp_update_attachment_metadata($attachment_id, $metadata);
        }

        update_post_meta($attachment_id, self::OPTIMIZATION_META_KEY, $this->optimization_signature($settings));

        if ($target_file !== $file && empty($settings['keep_originals']) && file_exists($file)) {
            wp_delete_file($file);
        }

        return ['success' => true, 'saved_bytes' => $saved, 'message' => ''];
    }

    private function format_to_mime($format) {
        switch ($format) {
            case 'webp':
                return 'image/webp';
            case 'avif':
                return 'image/avif';
            case 'jpeg':
            default:
                return 'image/jpeg';
        }
    }

    private function format_to_extension($format) {
        switch ($format) {
            case 'webp':
                return 'webp';
            case 'avif':
                return 'avif';
            case 'jpeg':
            default:
                return 'jpg';
        }
    }

    private function extension_to_format($extension) {
        $extension = strtolower((string) $extension);

        if (in_array($extension, ['jpg', 'jpeg'], true)) {
            return 'jpeg';
        }
        if ('webp' === $extension) {
            return 'webp';
        }
        if ('avif' === $extension) {
            return 'avif';
        }

        return 'other';
    }

    private function detect_capabilities() {
        if (is_array(self::$capabilities)) {
            return self::$capabilities;
        }

        $backend = class_exists('Imagick') ? 'Imagick (preferred)' : 'GD (fallback)';

        $imagetype_flags = function_exists('imagetypes') ? imagetypes() : 0;
        $gd_webp = (defined('IMG_WEBP') && ($imagetype_flags & IMG_WEBP));
        $gd_avif = (defined('IMG_AVIF') && ($imagetype_flags & IMG_AVIF));

        $imagick_supports = function($format) {
            if (!function_exists('wp_image_editor_supports')) {
                return false;
            }

            $mime_type = $this->format_to_mime(strtolower($format));
            try {
                return wp_image_editor_supports(['mime_type' => $mime_type]);
            } catch (Throwable $e) {
                return false;
            }
        };

        self::$capabilities = [
            'backend' => $backend,
            'formats' => [
                'jpeg' => true,
                'webp' => $gd_webp || $imagick_supports('WEBP'),
                'avif' => $gd_avif || $imagick_supports('AVIF'),
            ],
        ];

        return self::$capabilities;
    }

    private function redirect_with_notice($type, $message, $path = 'upload.php?page=fic-settings') {
        $url = add_query_arg([
            'fic_notice_type' => rawurlencode($type),
            'fic_notice_msg' => rawurlencode($message),
        ], admin_url($path));

        wp_safe_redirect($url);
        exit;
    }

    public function render_admin_notices() {
        if (empty($_GET['fic_notice_type']) || empty($_GET['fic_notice_msg'])) {
            return;
        }

        $type = sanitize_text_field(wp_unslash($_GET['fic_notice_type']));
        $message = sanitize_text_field(wp_unslash($_GET['fic_notice_msg']));

        $map = [
            'success' => 'notice-success',
            'warning' => 'notice-warning',
            'error' => 'notice-error',
        ];

        $class = isset($map[$type]) ? $map[$type] : 'notice-info';
        echo '<div class="notice ' . esc_attr($class) . ' is-dismissible"><p>' . esc_html(rawurldecode($message)) . '</p></div>';
    }
}

new FIC_Plugin();
