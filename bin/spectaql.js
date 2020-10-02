#!/usr/bin/env node

const program = require('commander')
const package = require('../package')
const main = require('../index')

program
  .version(package.version)
  .usage('[options] <specfile>')
  .description(package.description)
  .option('-C, --disable-css', 'omit CSS generation (default: false)')
  .option('-J, --disable-js', 'omit JavaScript generation (default: false)')
  .option(
    '-e, --embeddable',
    'omit the HTML <body/> and generate the documentation content only (default: false)',
  )
  .option('-1, --one-file', 'Embed all resources (CSS and JS) into the same file (default: false)')
  .option('-d, --development-mode', 'start HTTP server with the file watcher (default: false)')
  .option(
    '-D, --development-mode-live',
    'start HTTP server with the file watcher and live reload (default: false)',
  )
  .option('-s, --start-server', 'start the HTTP server without any development features')
  .option(
    '-p, --port <port>',
    'the port number for the HTTP server to listen on (default: 4400)',
    Number,
  )
  .option(
    '-P, --port-live <port>',
    'the port number for the live reload to listen on (default: 4401)',
    Number,
  )
  .option('-t, --target-dir <dir>', 'the target build directory (default: public)', String)
  .option('-f, --target-file <file>', 'the target build HTML file (default: index.html)', String)
  .option('-a, --app-dir <dir>', 'the application source directory (default: app)', String)
  .option('-l, --logo-file <file>', 'specify a custom logo file (default: null)', String, null)
  .option(
    '-c, --config-file <file>',
    'specify a custom configuration file (default: app/lib/config.js)',
  )
  .option('-q, --quiet', 'Silence the output from the generator (default: false)')
  .parse(process.argv)

if (program.args.length < 1) {
  program.help()
}

program.specFile = program.args[0]

main(program)
