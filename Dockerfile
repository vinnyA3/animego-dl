FROM node:gallium-alpine

LABEL maintainer="Vin Aceto <vincent.aceto@gmail.com>"
LABEL org.label-schema.description="Animego-dl container (includes mpv & ytdlp)"
LABEL org.label-schema.name="animego-dl"
LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.vcs-url="https://github.com/vinnyA3/animego-dl"

RUN deluser node
RUN adduser -u 1001 -D node

# install ytdlp (latest) & mpv
RUN apk add --no-cache \
    ffmpeg \
    mesa-demos \
    mesa-dri-intel \
    mpv \
    pulseaudio \
    python3 \
    ttf-dejavu \
  && ln -s python3 /usr/bin/python \
  && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
  && chmod 755 /usr/local/bin/yt-dlp \
  && adduser -u 1000 -D mpv \
  && mkdir -p /home/mpv/media \
  && mkdir -p /home/mpv/.config/pulse \
  && echo "default-server = unix:/run/user/1000/pulse/native" > /home/mpv/.config/pulse/client.conf \
  && echo "autospawn = no" >> /home/mpv/.config/pulse/client.conf \
  && echo "daemon-binary = /bin/true" >> /home/mpv/.config/pulse/client.conf \
  && echo "enable-shm = false" >> /home/mpv/.config/pulse/client.conf \
  && mkdir -p /home/mpv/.config/mpv \
  && echo "UP add volume +2" > /home/mpv/.config/mpv/input.conf \
  && echo "DOWN add volume -2" >> /home/mpv/.config/mpv/input.conf \
  && echo "script-opts=ytdl_hook-ytdl_path=/usr/local/bin/yt-dlp" >> /home/mpv/.config/mpv/mpv.conf \
  && chown -R mpv:mpv /home/mpv

WORKDIR /home/mpv

USER mpv

VOLUME /animego-dl

SHELL ["/bin/sh", "--login", "-c"]

RUN npm install animego-dl
