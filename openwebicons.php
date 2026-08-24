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

	// A composition layers several glyphs. The webfont stacks codepoints for
	// that, inline SVG just concatenates the paths.
	foreach ( $data['compositions'] as $name => $composition ) {
		$content = openwebicons_compose( $composition['glyphs'] );

		if ( ! $content ) {
			continue;
		}

		wp_register_icon(
			sprintf( '%s/%s', OPENWEBICONS_COLLECTION, $name ),
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

/**
 * Builds a single SVG out of several glyphs by concatenating their paths.
 *
 * Path coordinates are absolute, the viewBox only crops them, so the glyphs
 * share one coordinate space and the combined box is the union of theirs.
 * Taking just the first one would cut off any glyph drawn wider, which
 * indieweb-web is.
 *
 * @param array $glyphs Icon names to layer, in drawing order.
 * @return string|false The combined SVG markup, or false if a glyph is missing.
 */
function openwebicons_compose( $glyphs ) {
	// indieweb and indiewebcamp share two of their three glyphs, so without
	// this the same files are read twice on every request.
	static $cache = array();

	$paths = '';
	$box   = null;

	foreach ( $glyphs as $glyph ) {
		if ( ! isset( $cache[ $glyph ] ) ) {
			$file = sprintf( '%s/svg/%s.svg', __DIR__, $glyph );
			$svg  = is_readable( $file ) ? file_get_contents( $file ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

			if ( ! $svg || ! preg_match( '/viewBox="([^"]*)"/', $svg, $match ) ) {
				return false;
			}

			preg_match_all( '/<path[^>]*\/>/', $svg, $matches );

			$cache[ $glyph ] = array(
				'box'   => array_map( 'floatval', preg_split( '/[\s,]+/', trim( $match[1] ) ) ),
				'paths' => implode( '', $matches[0] ),
			);
		}

		$box    = openwebicons_union( $box, $cache[ $glyph ]['box'] );
		$paths .= $cache[ $glyph ]['paths'];
	}

	if ( ! $paths ) {
		return false;
	}

	return sprintf(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s">%s</svg>',
		esc_attr( implode( ' ', $box ) ),
		$paths
	);
}

/**
 * Merges two viewBoxes into the smallest one containing both.
 *
 * @param array|null $a The box merged so far, as [x, y, width, height].
 * @param array      $b The box to add.
 * @return array The union, as [x, y, width, height].
 */
function openwebicons_union( $a, $b ) {
	if ( ! $a ) {
		return $b;
	}

	$min_x = min( $a[0], $b[0] );
	$min_y = min( $a[1], $b[1] );
	$max_x = max( $a[0] + $a[2], $b[0] + $b[2] );
	$max_y = max( $a[1] + $a[3], $b[1] + $b[3] );

	return array( $min_x, $min_y, $max_x - $min_x, $max_y - $min_y );
}
