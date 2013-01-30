#!/bin/sh

# standard css files
sass sass/openwebicons.scss:css/openwebicons.css --style expanded
sass sass/openwebicons.scss:css/openwebicons.min.css --style compressed

# bootstrap compatible icons
sass sass/openwebicons-bootstrap.scss:css/openwebicons-bootstrap.css --style expanded
sass sass/openwebicons-bootstrap.scss:css/openwebicons-bootstrap.min.css --style compressed

# "we love icon fonts" example
sass sass/weloveiconfonts.scss:css/weloveiconfonts.css --style compact

exit 0