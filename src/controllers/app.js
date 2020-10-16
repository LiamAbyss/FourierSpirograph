var path = require('path')

exports.redirect = (req, res) => {
  res.status(301)
  res.redirect('/app/index.html')
}

exports.sendIndexHtml = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/app/index.html'))
}

exports.sendIndexJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/app/index.js'))
}

exports.sendIndexCss = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/app/index.css'))
}

exports.sendThresholdsCsv = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/app/autoThresholds.csv'))
}

exports.sendNoUiJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/lib/nouislider.js'))
}

exports.sendNoUiCss = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./src/dist/lib/nouislider.css'))
}
