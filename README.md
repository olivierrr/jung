jung
=====

[![Build Status](http://img.shields.io/travis/jarofghosts/jung.svg?style=flat)](https://travis-ci.org/jarofghosts/jung)
[![npm install](http://img.shields.io/npm/dm/jung.svg?style=flat)](https://www.npmjs.org/package/jung)

lightweight, flexible, file-watching command runner

## installation

`npm install -g jung`

## why

so you can do `jung -f '\.js$' -- browserify main.js -o bundle.js`

or

`jung *.md -- cat \$JUNG_FILE | marked -o \$JUNG_BARENAME.html`

or

`jung -r /var/log -- echo \$JUNG_FILE changed!`

or any other variety of neat stuff.

## usage

`jung [options] [files] -- <command>`

Options are

* `--root, -r <dir>` Watch files in `<dir>`, default cwd
* `--dirs, -d <regex>` Only watch sub directories matching `<regex>`
* `--notdirs, -D <regex>` Ignore sub directories matching `<regex>`
* `--files, -f <regex>` Only watch files matching `<regex>`
* `--notfiles, -F <regex>` Ignore files matching `<regex>`
* `--wait, -w <time>` Debounce reaction for `<time>` ms, default 300
* `--timeout, -t <time>` Wait `<time>` ms after SIGTERM to SIGKILL, default 500
* `--kill, -k` Rather than queueing command runs, kill child process
* `--quiet, -q` Do not show output from `<command>`
* `--run, -R` Run `<command>` at first start
* `--version, -v` Print jung version
* `--help, -h` Print help

Commands are anything you can run in your shell. Including a shell script, for
more complicated things!

## notes

When using jung as part of an npm run script, you will need to escape any `\`
in order to avoid JSON parsing errors.

### example

```js
{
  // ...
  "scripts": {
    "watch-md": "jung -f '\\.md$' -- make html"
  }
  // ...
}
```

When your command is fired, the following environment variables will be
available:

* `$JUNG_FILE` - Full path to file that triggered the command
* `$JUNG_DIR` - The directory the trigger file lives in
* `$JUNG_FILENAME` - Just the filename part of the trigger file
* `$JUNG_EXTENSION` - Just the extension of the trigger file
* `$JUNG_BARENAME` - Trigger filename with no extension

If you run jung with `--run` these environment variables will be blank strings
when the initial execution occurs.

This works really well with scripts, but for one-liners you will need to escape
the `$` to prevent your shell from replacing it too early.

### bad

`jung -- echo $JUNG_FILE did something!`

### good

`jung -- echo WHOA CHECKOUT \$JUNG_FILE` || `jung -- echo 'wee $JUNG_FILE'`

## as a module

```js
var jung = require('jung')

var options = { files: ['\.js$', /\.md$/], quiet: true }
  , command = 'sh recompile_file.sh $JUNG_FILE'

jung(options, command).start()
```

## module notes

Options accepts an object of options with keys matching the long form of
any acceptable command line flag, for example `files`, `notfiles`, `wait`, etc.

`files`, `notfiles`, `dirs`, and `notdirs` each accept an array of either
strings or RegExps or any combination thereof.

Any command line flags that do not accept an argument require a boolean value
in the options object and they all default to `false`.

The second argument is the `command` which can be either a string of the
command to be run or an array of each part of the command (i.e. 
`command.split(' ')`)

## license

MIT
