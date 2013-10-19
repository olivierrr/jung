#!/usr/bin/env node

var Watcher = require('watch-fs').Watcher,
    nopt = require('nopt'),
    path = require('path'),
    spawn = require('child_process').spawn,
    debounce = require('lodash.debounce'),
    blocked = false,
    queue = [],
    noptions = {
      root: Array,
      files: Array,
      dirs: Array,
      notfiles: Array,
      notdirs: Array,
      wait: Number,
      kill: Boolean,
      quiet: Boolean,
      help: Boolean,
      version: Boolean
    },
    shorts = {
      r: ['--root'],
      d: ['--dirs'],
      f: ['--files'],
      w: ['--wait'],
      D: ['--notdirs'],
      F: ['--notfiles'],
      q: ['--quiet'],
      k: ['--kill'],
      h: ['--help'],
      v: ['--version']
    },
  options = nopt(noptions, shorts, process.argv),
  command = options.argv.remain

if (options.version) return version()
if (!command.length || options.help) return help()
if (!options.root || !options.root.length) options.root = [process.cwd()]
if (!options.wait) options.wait = 500

var watcher_options = { paths: options.root, filters: {
        includeFile: make_filter('file'),
        includeDir: make_filter('dir')
      }
    },
    watcher = new Watcher(watcher_options)

watcher.on('any', debounce(trigger_command, options.wait))
watcher.start(function (err) {
  if (err) return console.error(err)
  if (!options.quiet) process.stdout.write('jung is listening..\n')
})

function trigger_command(name) {
  if (blocked) {
    if (options.kill) {
      queue = [name]
      process.stdout.write('** Killing old process..\n\n')
      return child.kill()
    }
    process.stdout.write('--Queueing new process\n')
    return queue.push(name)
  }
  blocked = true
  var env = process.env,
      this_command = command.map(replace_env)
  env.JUNG_FILE = name

  process.stdout.write('** Running ``' + this_command.join(' ') + '``\n')
  child = spawn(this_command[0],
      this_command.slice(1),
      { env: env, cwd: process.cwd() })

  child.on('close', finish_child)

  if (!options.quiet) {
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
  }

  function finish_child(code) {
    if (code !== 0 && !options.quiet) process.stderr.write(
        '\n** Command exited with code ' + code + '\n'
    )
    blocked = false
    if (queue.length) trigger_command(queue.shift())
  }
  function replace_env(str) {
    return str.replace(/\$JUNG_FILE/g, name)
  }

}

function make_filter(type) {
  var not_array = type === 'file' ? options.notfiles : options.notdirs,
      good_array = type === 'file' ? options.files : options.dirs

  not_array = (not_array || []).map(regex)
  good_array = (good_array || []).map(regex)

  return function (path) {
    for (var i = 0, l = good_array.length; i < l; ++i) {
      if (good_array[i].test(path)) return true
    }
    for (var i = 0, l = not_array.length; i < l; ++i) {
      if (not_array[i].test(path)) return false
    }
    return !good_array.length
  }

  function regex(str) {
    return new RegExp(str)
  }
}

function help() {
  var fs = require('fs')
  version()
  fs.createReadStream(__dirname + '/help.txt').pipe(process.stdout)
}

function version() {
  var jung = require('./package.json')
  process.stdout.write('jung version ' + jung.version + '\n')
}
