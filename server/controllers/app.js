var path = require('path')

exports.redirect = (req, res) => {
  res.status(301)
  res.redirect('/app/index.html')
}

exports.sendIndexHtml = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/app/index.html'))
}

exports.sendExamplesJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/app/examples.js'))
}

exports.sendExamplesCsv = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve(`./public/example/examples/${req.params.name}.csv`))
}

exports.sendExamplesImg = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve(`./public/example/examples/img/${req.params.name}.png`))
}

exports.sendExamplesJson = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/app/examples.json'))
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
