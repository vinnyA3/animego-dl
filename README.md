AnimeGo-DL
=======================
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
![NPM Latest](https://img.shields.io/npm/v/animego-dl/latest?style=flat-square)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

A simple node-based cli tool that downloads your desired anime series from `gogoanimes`!

> :bomb: :boom: **WE'RE BROKEN AT THE MOMENT** -- Gogoanime will no longer be
> supported.  A refactor is currently in the works, so please check back soon!
> :boom: :bomb:

---

<img src="./.github/readme-images/a.png" alt="anime-doko" width="250" height="250">
<br />

**Table of Contents**:
* [Dependencies](#dependencies)
* [Installation](#installation)
* [Usage](#usage)
  - [Downloaded output examples](#output)
  - [Dub](#dub)
  - [Sub](#sub)
  - [Docker](#docker)
* [Contributing](#contributing)
* [Development](#development)
  - [Testing](#testing)
* [Disclaimer](#disclaimer)

## Dependencies

> :warning: Sorry Windows users, things have been tested on Linux & MacOS only.  Support
> might be coming soon.

First, make sure you have the following installed on your machine:
* [yt-dlp](https://github.com/yt-dlp/yt-dlp) - a youtube download fork with additional fixes and features.
* nodejs - the latest LTS should be good

## Installation

Install from [NPM](https://www.npmjs.com/package/animego-dl) - *recommended*:
```sh
npm install -g animego-dl # remove with: npm uninstall -g animego-dl
```

\- *or* -


Install with Docker:
* Pull the [latest](https://hub.docker.com/r/vinnya3/animego-dl) docker image: `docker pull vinnya3/animego-dl`
* Please refer to [Usage](#docker) for running w/ Docker.

\- *or* -

Install from source:
1. Clone repo: `git clone https://github.com/vinnyA3/animego-dl.git`
2. Change into the project directory: `cd animego-dl`
3. Install script dependencies: `npm install`
4. Compile Typescript source: `npm run build`
5. *optional* - install command globally:
    * `npm install -g .`
    * to uninstall: `npm uninstall -g animego-dl`

## Usage

```sh
Usage: animego-dl [options] <anime name>

CLI tool to download your favorite anime series.

Arguments:
  anime name                The name of anime series to download  [string] [required]

Options:
  -V, --version             output the version number
  -d, --directory <string>  the download directory for your anime  [string] [required]
  -h, --help                display help for command
```

**note**: if you installed the package globally, you can simply run:

```sh
animego-dl -d ./my-anime-directory '<anime series name>'`
```

If you did not install globally & installed from source, you can run the following from the root of the project:
```
node ./dist/bin -d ./my-anime-directory '<anime series name>'`
```

---

### Output

The anime, of your choosing, will be downloaded to the directory that you
specfied at the `-d` option's argument.  A directory of the anime will be
created and named like: `Neon Genesis Evangelion (Dub) (1995)/`.  Each episode will be
numbered & named like: `episode-00.mp4`, `episode-01.mp4` .. etc.

Example:
```
my-anime
└── Neon\ Genesis\ Evangelion\ (Dub)\ (1995)
    └── episode-01.mp4
    └── episode-02.mp4
    └── episode-03.mp4
    └── episode-04.mp4
```

---

> :warning: Please make sure that your input anime series title is properly
> formatted (improvements to tool will be made in the near future).

### Dub

You can specify a dub selection by suffixing your anime name with 'dub'.

Example(s):
  * specify dub: `animego-dl -d ./my-anime-directory 'Berserk dub'`
    - no special characters, params, or dashes

### Sub

Sub versions can be downloaded by providing just the title of the desired anime.

Examples:
  * specify sub: `animego-dl -d ./my-anime-directory 'sono bisque doll wa koi wo suru'`
    - no special characters, params, or dashes

### Docker

First, make sure you installed the [Docker image](https://hub.docker.com/r/vinnya3/animego-dl).

Next, create your desired mount directory -- this will be your machine's local
directory, where the anime will be downloaded; for example: `mkdir ./anime`

You can now start create the mount point & run the container:
```
docker run --rm -v ${PWD}/anime:/anime -it animego-dl /bin/bash
```

After running the aforementioned command, you will be directed to an interactive
shell session.  From here, you can run the tool as instructed [here](#usage).

:warning: **important note**: make sure the download directory, specified by the
`-d` option is `/anime` -- this is the mount point specified inside of the
container.  The actual download directory, on your host machine, is what you
specified earlier (when running the container).

Example(s):
```
#app> animego-dl -d /anime 'monster'
```

## Contributing

All contributions are welcome!  Please refer the [contributing document](CONTRIBUTING.md) for
project practices and the Code of Conduct.

Also, checkout the [list of the project's contributors](#contributors-)!

## Development

The project is built with [Typescript](https://www.typescriptlang.org/).  To
compile the source into working JavaScript, you can run:
```bash
npm run build
```

The aforementioned will compile to `/dist`.  For here, you can execute the
program with:
```bash
node ./dist/bin -d ./my-anime-directory '<anime series name>'
```

### Testing

To run local tests: `npm run test`

To run tests in watch mode: `npm run test:watch`

> :warning: Tests are few and far between at the moment.  In fact, no test
> suites are live at this time - 2/13/22.

## Disclaimer

This project, and it's owner, does not endorse piracy!  Anime streaming services are
:100:% supported!

`animego-dl` uses anime information & sources that is fully available to the public.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/mayanknoldus"><img src="https://avatars.githubusercontent.com/u/82813390?v=4?s=100" width="100px;" alt=""/><br /><sub><b>mayanknoldus</b></sub></a><br /><a href="https://github.com/vinnyA3/animego-dl/commits?author=mayanknoldus" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
