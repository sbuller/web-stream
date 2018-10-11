# web-stream

This sets up an nginx server for the purposes of providing access to a periodic live stream.

## inbound
The server is configured for a trusted inbound rtmp stream compressed with h264 and aac.

## outbound
The stream is re-muxed into HLS format without transcoding for outbound streaming. It is also
re-muxed into an mp4 container for later viewing.

## web
A simple web interface is provided for viewing live and recorded streams.
