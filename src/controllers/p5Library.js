var path = require('path')

exports.sendExampleHtml = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/index.html'))
}

exports.sendSpirographJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/spirograph.js'))
}

exports.sendSpirographData = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/example/datapts.csv'))
}
