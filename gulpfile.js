const childProcess = require('node:child_process')
const fs = require('node:fs')

const { series } = require('gulp')

const { version } = require('./package.json')

function build(cb) {
  childProcess.exec('babel ./src -d ./dist --copy-files', (err) => {
    if (err) {
      throw err
    }

    cb()
  })
}

function updateSwaggerAPIVersion(cb) {
  fs.readFile('./src/swagger.json', 'utf8', (err, data) => {
    if (err) {
      throw err
    }

    const updatedSwaggerData = data.replace('development-version', version)

    fs.writeFile('./dist/swagger.json', updatedSwaggerData, (writeErr) => {
      if (writeErr) throw writeErr

      cb()
    })
  })
}

exports.default = series(build, updateSwaggerAPIVersion)
