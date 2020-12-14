var path = require('path')

exports.redirect = (req, res) => {
  res.status(301)
  res.redirect('/app/index.html')
}

exports.sendIndexHtml = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/app/index.html'))
}

exports.sendUtilsJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/app/utils.js'))
}

exports.sendIndexJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/app/index.js'))
}

exports.sendIndexCss = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/app/index.css'))
}

exports.sendThresholdsCsv = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/app/autoThresholds.csv'))
}

exports.sendNoUiJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/lib/nouislider.js'))
}

exports.sendNoUiCss = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/lib/nouislider.css'))
}
