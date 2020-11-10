var path = require('path')

exports.sendExampleHtml = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/index.html'))
}

exports.sendCamJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/Cam.js'))
}

exports.sendPointJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/Point.js'))
}

exports.sendSpirographJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/spirograph.js'))
}

exports.sendSpirographData = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/datapts.csv'))
}
