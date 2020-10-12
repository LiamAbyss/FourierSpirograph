var express = require('express');
var app = express();

const outlineRoutes = require('./src/routes/outlineDetection');

app.use(outlineRoutes);

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});