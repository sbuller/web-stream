#!/bin/sh
/usr/bin/uuidgen -r >/var/www/stream/conf/stream-key
cat /var/www/stream/conf/stream-key
