<?php
/**
 * Plugin Name:       OpenWeb Icons
 * Plugin URI:        https://pfefferle.dev/openwebicons/
 * Description:       Adds the OpenWeb Icons, logos of open communities, standards and projects, to the icon library.
 * Version:           2.0.0
 * Requires at least: 7.1
 * Requires PHP:      7.2
 * Author:            Matthias Pfefferle
 * Author URI:        https://pfefferle.dev
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       openwebicons
 *
 * @package OpenWebIcons
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'OPENWEBICONS_COLLECTION', 'openwebicons' );

add_action( 'init', 'openwebicons_register' );

/**
 * Registers the icon collection and every icon in it.
 *
 * The Icon Registration API landed in WordPress 7.1. On older versions the
 * plugin simply does nothing, the webfont is unaffected either way.
 *
 * Aliases are left out on purpose: they are alternative names for a glyph that
 * is already registered and would show up twice in the picker.
 *
 * @return void
 */
function openwebicons_register() {
	if ( ! function_exists( 'wp_register_icon' ) ) {
		return;
	}

	$data = openwebicons_get_data();

	if ( ! $data ) {
		return;
	}

	wp_register_icon_collection(
		OPENWEBICONS_COLLECTION,
		array(
			'label'       => __( 'OpenWeb Icons', 'openwebicons' ),
			'description' => __( 'Logos of open communities, standards and projects.', 'openwebicons' ),
		)
	);

	// WordPress reads the file only when the icon is actually rendered, and
	// warns without fataling if it is gone, so there is no reason to stat all
	// of them on every request.
	foreach ( $data['icons'] as $name => $icon ) {
		wp_register_icon(
			sprintf( '%s/%s', OPENWEBICONS_COLLECTION, $name ),
			array(
				'label'     => $icon['label'],
				'file_path' => sprintf( '%s/svg/%s.svg', __DIR__, $name ),
			)
		);
	}

	// A composition shows several glyphs next to each other. The webfont gets
	// that from a multi-codepoint CSS content string; for SVG the build writes
	// the glyphs into one file with the offsets baked into the path data.
	foreach ( $data['compositions'] as $name => $composition ) {
		wp_register_icon(
			sprintf( '%s/%s', OPENWEBICONS_COLLECTION, $name ),
			array(
				'label'     => $composition['label'],
				'file_path' => sprintf( '%s/composed/%s.svg', __DIR__, $name ),
			)
		);
	}
}

/**
 * Reads the icon metadata.
 *
 * @return array|false The decoded icons.json, or false if it cannot be read.
 */
function openwebicons_get_data() {
	$file = sprintf( '%s/icons.json', __DIR__ );

	if ( ! is_readable( $file ) ) {
		return false;
	}

	$data = json_decode( file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

	if ( ! is_array( $data ) || empty( $data['icons'] ) ) {
		return false;
	}

	if ( ! isset( $data['compositions'] ) ) {
		$data['compositions'] = array();
	}

	return $data;
}
