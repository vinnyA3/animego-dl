FROM python

WORKDIR /app

RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp 
RUN chmod a+rx /usr/local/bin/yt-dlp 
RUN curl -sL https://deb.nodesource.com/setup_14.x 
RUN apt-get update 
RUN apt-get install -y nodejs \
    npm 
SHELL ["/bin/bash", "--login", "-c"]   
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
RUN nvm install 14


COPY . . 

RUN npm install -g animego-dl

