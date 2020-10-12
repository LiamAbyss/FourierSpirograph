var path = require('path')

exports.redirect = (req, res) => {
    res.redirect('/outline/index.html');
};

exports.sendIndexHtml = (req, res) => {
    res.status(200);
    res.sendFile(path.resolve('./src/dist/outline/index.html'));
};

exports.sendIndexJs = (req, res) => {
    res.status(200);
    res.sendFile(path.resolve('./src/dist/outline/index.js'));
};

exports.sendMainJs = (req, res) => {
    res.status(200);
    res.sendFile(path.resolve('./src/dist/outline/main.js'));
};

exports.sendWorkerJs = (req, res) => {
    res.status(200);
    res.sendFile(path.resolve('./src/dist/outline/worker.js'));
};