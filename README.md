# web-stream

This sets up an nginx server for the purposes of providing access to a periodic live stream.

Currently setup is not fully automated. There's some config that goes in /etc/nginx, some
cron files for the respective directories under /etc, and some files that go under
/var/stream/. Additionally there's some scripts to run. `downloads.sh` gets some includes
to avoid relying on CDNs. `setup.sh` takes care of most of the running of commands for
setup. `reset-stream-key.sh` sets up the 'stream-key' that controls access to the inbound
rtmp endpoint. `packages-ubuntu.txt` of course is a list of packages that are depended on
by the system as configured.

## inbound
The server is configured for a trusted inbound rtmp stream compressed with h264 and aac.

## outbound
The stream is re-muxed into HLS format without transcoding for outbound streaming. It is also
re-muxed into an mp4 container for later viewing.

## web
A simple web interface is provided for viewing live and recorded streams.
