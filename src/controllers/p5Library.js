var path = require('path')

exports.sendExampleHtml = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/index.html'))
}

exports.sendP5Lib = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/p5/p5.min.js'))
}

exports.sendSpirographJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/spirograph.js'))
}

exports.sendSpirographData = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/datapts.csv'))
}
