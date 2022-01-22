Anime Series Downloader
=======================

<img src="./git-images/anime.png" alt="anime-doko" width="250" height="250">
<br />
<br />

A simple node script that downloads your desired anime series from `gogoanimes`.

> :warning: This script / tool will be improved in the near future. A modification of
> source will be necessary to download the series of your choice; out of the box, the
> script will only download Neon Genesis Evangelion (eps 2 - 26).

## Dependencies

:warning: First, make sure you have the following installed on your machine:
* [yt-dlp](https://github.com/yt-dlp/yt-dlp) - a youtube download fork with additional fixes and features.
* nodejs - the latest LTS should be good

## Installation and Usage

**Install**:
1. Clone repo & `cd anime-series-dl`
2. Install script dependencies: `node install`

**Usage**:
1. Optionally modify the `BASE_URL` to your url of choice (line `5` of `index.js`)
2. Optionally modify the download destination folder (line `74` of `index.js`)
3. In your terminal: `node index.js`
4. Pour a :beer:, you'll be waiting a bit.
