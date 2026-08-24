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
 * @return void
 */
function openwebicons_register() {
	if ( ! function_exists( 'wp_register_icon_collection' ) || ! function_exists( 'wp_register_icon' ) ) {
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

	foreach ( $data['icons'] as $name => $icon ) {
		$file = __DIR__ . '/svg/' . $name . '.svg';

		if ( ! is_readable( $file ) ) {
			continue;
		}

		wp_register_icon(
			OPENWEBICONS_COLLECTION . '/' . $name,
			array(
				'label'     => $icon['label'],
				'file_path' => $file,
			)
		);
	}

	// A composition layers several glyphs. The webfont stacks codepoints for
	// that, inline SVG just concatenates the paths.
	foreach ( $data['compositions'] as $name => $composition ) {
		$content = openwebicons_compose( $composition['glyphs'] );

		if ( ! $content ) {
			continue;
		}

		wp_register_icon(
			OPENWEBICONS_COLLECTION . '/' . $name,
			array(
				'label'   => $composition['label'],
				'content' => $content,
			)
		);
	}
}

/**
 * Reads the icon metadata.
 *
 * Aliases are deliberately left out: they are alternative names for a glyph
 * that is already registered, and would show up as duplicates in the picker.
 *
 * @return array|false The decoded icons.json, or false if it cannot be read.
 */
function openwebicons_get_data() {
	$file = __DIR__ . '/icons.json';

	if ( ! is_readable( $file ) ) {
		return false;
	}

	$data = json_decode( file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

	if ( ! is_array( $data ) || empty( $data['icons'] ) ) {
		return false;
	}

	return array(
		'icons'        => $data['icons'],
		'compositions' => isset( $data['compositions'] ) ? $data['compositions'] : array(),
	);
}

/**
 * Builds a single SVG out of several glyphs by concatenating their paths.
 *
 * @param array $glyphs Icon names to layer, in drawing order.
 * @return string|false The combined SVG markup, or false if a glyph is missing.
 */
function openwebicons_compose( $glyphs ) {
	$paths    = '';
	$view_box = '';

	foreach ( (array) $glyphs as $glyph ) {
		$file = __DIR__ . '/svg/' . $glyph . '.svg';

		if ( ! is_readable( $file ) ) {
			return false;
		}

		$svg = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		if ( ! $view_box && preg_match( '/viewBox="([^"]*)"/', $svg, $match ) ) {
			$view_box = $match[1];
		}

		if ( preg_match_all( '/<path[^>]*\/>/', $svg, $matches ) ) {
			$paths .= implode( '', $matches[0] );
		}
	}

	if ( ! $paths || ! $view_box ) {
		return false;
	}

	return sprintf(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s">%s</svg>',
		esc_attr( $view_box ),
		$paths
	);
}
