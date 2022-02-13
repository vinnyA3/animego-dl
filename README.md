Anime Series Downloader
=======================

<img src="./git-images/anime.png" alt="anime-doko" width="250" height="250">
<br />

A simple node-based cli tool that downloads your desired anime series from `gogoanimes`.

> :warning: Windows is not supported at this time.

Table of Contents:
* [Dependencies](#dependencies)
* [Installation](#installation)
* [Usage](#usage)
* [Contributing](#contributing)
* [Development](#development)
  - [Testing](#testing)
* [Disclaimer](#disclaimer)

## Dependencies

First, make sure you have the following installed on your machine:
* [yt-dlp](https://github.com/yt-dlp/yt-dlp) - a youtube download fork with additional fixes and features.
* nodejs - the latest LTS should be good

## Installation

Install from NPM - *recommended*:
```sh
npm install -g animego-dl # remove with: npm uninstall -g animego-dl
```

Install from source:
1. Clone repo & `cd animego-dl`
2. Install script dependencies: `npm install`
3. Compile Typescript source: `npm run build`
4. *optional* - install command globally:
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
animego-dl -d <destination dir> '<anime series name>'`
```

If you did not install globally & installed from source, you can run the following from the root of the project:
```
node ./dist/bin -d <destination dir> '<anime series name>'`
```
---

> :warning: Please make sure that your input anime series title is properly
> formatted (improvements to tool will be made in the near future).

Anime title input examples:
  * specify dub: `animego-dl -d '<destination dir>' 'Berserk dub'`
    - no special characters, params, or dashes
  * specify sub: `animego-dl -d '<destination dir>' 'sono bisque doll wa koi wo suru'`
    - please note we **do not** specify *dub* in the name -- this will be
      improved in the future
    - no special characters, params, or dashes

## Contributing

All contributions are welcome!  Please refer the [contributing document](CONTRIBUTING.md) for
project practices and the Code of Conduct.

## Development

The project is built with [Typescript](https://www.typescriptlang.org/).  To
compile the source into working JavaScript, you can run:
```bash
npm run build
```

The aforementioned will compile to `/dist`.  For here, you can execute the
program with:
```bash
node ./dist/bin -d <destination dir> '<anime series name>'
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
