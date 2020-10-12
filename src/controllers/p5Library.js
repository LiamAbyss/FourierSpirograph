var path = require('path')

exports.redirect = (req, res) => {
    res.redirect('.src/dist/outline/index.html');
};

exports.sendP5Lib = (req, res) => {
    res.status(200);
    res.sendFile(path.resolve('./src/dist/p5/p5.min.js'));
};

exports.sendSpirographJs = (req, res) => {
    res.status(200);
    res.sendFile(path.resolve('./src/dist/p5/spirograph.js'));
};

exports.sendSpirographData = (req, res) => {
    res.status(200);
    res.sendFile(path.resolve('./src/dist/p5/datapts.csv'));
};
