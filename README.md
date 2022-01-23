Anime Series Downloader
=======================

<img src="./git-images/anime.png" alt="anime-doko" width="250" height="250">
<br />

A simple node-based cli tool that downloads your desired anime series from `gogoanimes`.

> :warning: Make sure that your input anime series name is propertly formatted.
> I will add better input processing in the near future.  For examples of proper
> series input, see [Usage](#usage)

## Dependencies

First, make sure you have the following installed on your machine:
* [yt-dlp](https://github.com/yt-dlp/yt-dlp) - a youtube download fork with additional fixes and features.
* nodejs - the latest LTS should be good

## Installation and Usage

**Install**:
1. Clone repo & `cd anime-series-dl`
2. Install script dependencies: `node install`
3. *optional* - install command globally:
    * `npm install -g .`
    * to uninstall: `npm uninstall -g gogoanime-dl-cli`

## Usage

```sh
Usage: -d <download destination> -n <anime name>

Options:
      --help        Show help                                          [boolean]
      --version     Show version number                                [boolean]
  -d, --directory   Source directory for your anime download [string] [required]
  -n, --anime-name  The title of your desired anime to download [string] [required]
```

**note**: if you installed the package globally, you can simply run:

```sh
anime-dl -d <destination dir> -n <anime series name>`
```

If you did not install globally, you can run from the root of the project's source directory:
```
node .
```
---

> :warning: Please make sure that your input anime series title is properly
> formatted (improvements to tool will be made in the near future).

Anime title input examples:
  * specify dub: `anime-dl -d '<destination dir>' -n 'Berserk dub'`
    - no params, no dashes

## TODO

- process cli arguments (remove hardcoded shit):
  - [x] ~~accept series name~~
  - [x] ~~download destination~~
  - [ ] desired season
- [ ] add tests
- [ ] typescript
- [x] ~~organize code better (isolate helpers, extract logic)~~
- [x] ~~remove Evangelion-specific naming in source~~
- [ ] dockerize all the things
