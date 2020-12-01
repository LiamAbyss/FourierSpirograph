var path = require('path')

exports.sendExampleHtml = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/example/index.html'))
}

exports.sendCamJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/example/Cam.js'))
}

exports.sendSpirographJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/example/spirograph.js'))
}

exports.sendSpirographData = (req, res) => {
  res.status(200)
  res.header('Access-Control-Allow-Origin', '*')
  res.sendFile(path.resolve('./public/example/datapts.csv'))
}
