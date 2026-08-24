=== OpenWeb Icons ===
Contributors: pfefferle
Tags: icons, fediverse, indieweb, activitypub, block-editor
Requires at least: 7.1
Tested up to: 7.1
Requires PHP: 7.2
Stable tag: 2.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds the OpenWeb Icons, logos of open communities, standards and projects, to the icon library.

== Description ==

OpenWeb Icons is a set of logos of open communities, standards and projects: ActivityPub, the Fediverse, the IndieWeb, Creative Commons, Microformats, feeds and a lot more.

This plugin registers all of them as an icon collection, so you can pick them in the Icon block like any other icon. No webfont and no stylesheet is loaded, the icons are plain SVG.

You can also render an icon yourself:

`<?php echo wp_get_icon( 'openwebicons/activitypub', array( 'size' => 32 ) ); ?>`

The icons are also available as a webfont and as CSS, see [the project page](https://pfefferle.dev/openwebicons/).

== Frequently Asked Questions ==

= I do not see the icons =

The icon library needs the Icon Registration API, which was added in WordPress 7.1. On older versions the plugin does nothing.

= Can I use my own colors? =

Yes. The icons use `currentColor`, so they follow the text color.

== Changelog ==

= 2.0.0 =
* First release as a plugin.
