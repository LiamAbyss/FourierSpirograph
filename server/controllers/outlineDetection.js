var path = require('path')

exports.sendIndexHtml = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/outline/index.html'))
}

exports.sendIndexJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/outline/index.js'))
}

exports.sendMainJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/outline/main.js'))
}

exports.sendWorkerJs = (req, res) => {
  res.status(200)
  res.sendFile(path.resolve('./public/outline/worker.js'))
}
