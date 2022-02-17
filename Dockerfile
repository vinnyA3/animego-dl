FROM node:gallium

WORKDIR /app

RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp 
RUN chmod a+rx /usr/local/bin/yt-dlp  
SHELL ["/bin/bash", "--login", "-c"]   
RUN npm install -g animego-dl

VOLUME /anime
