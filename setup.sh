#!/bin/bash

set -e

### Set hostname.
read -p "DNS name of server: " NAME
NAME=${NAME:-"hostname.example.com"}

hostnamectl set-hostname "$NAME"


### setup directories for web server ###
mkdir -p /var/stream/{video,www,conf,hls}
chown www-data /var/stream/{video,www,hls}


### setup site users
# if password entry is botched, just run htpasswd manually
# 'admin' account is used for viewing and setting stream-key
touch /var/stream/conf/htpasswd
ADMIN_PASS=$(pwgen 10 1)
MEMBER_PASS=$(pwgen 10 1)
echo "$ADMIN_PASS" | htpasswd -i /var/stream/conf/htpasswd admin
echo "$MEMBER_PASS" | htpasswd -i /var/stream/conf/htpasswd member

### setup unattended-upgrades ###
# NOTE: Interactive
dpkg-reconfigure unattended-upgrades

### setup firewall ###
ufw limit ssh
ufw allow 80
ufw allow 443
ufw limit 1935

### prepare new dhparam
[ -f /etc/nginx/dhparam.pem ] || openssl dhparam -out /etc/nginx/dhparam.pem 2048

touch /var/stream/conf/stream-key
chown www-data /var/stream/conf/stream-key
# also run once to generate initial stream-key
sudo -u www-data sh $SCRIPT




### acmetool's 'response-file' is not working out. Remember to setup the redirector
echo "acmetool's respones-file is not working out. Remember to setup the redirector"
acmetool quickstart
systemctl enable acmetool.timer
acmetool want "$NAME"


echo
echo
echo "Successfully configured $NAME"
echo "Admin password: $ADMIN_PASS"
echo "Member password: $MEMBER_PASS"
echo "Stream Key: $(cat /var/stream/conf/stream-key)"

