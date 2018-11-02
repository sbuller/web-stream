#!/bin/sh

# Download the various includes used in the frontend.

wget https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxP.ttf -O /var/stream/www/roboto.ttf
wget https://github.com/video-dev/hls.js/releases/download/v0.11.0/hls.min.js -O /var/stream/www/hls.min.js
wget https://code.getmdl.io/1.3.0/material.min.js -O /var/stream/www/material.min.js
wget https://fonts.gstatic.com/s/materialicons/v41/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf -O /var/stream/www/material-icons.ttf
wget https://code.getmdl.io/1.3.0/material.indigo-pink.min.css -O /var/stream/www/material.indigo-pink.min.css

