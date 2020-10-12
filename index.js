var express = require('express');
var app = express();

const outlineRoutes = require('./src/routes/outlineDetection');

app.use(outlineRoutes);

app.listen(process.env.PORT, function() {
  console.log('Example app listening on port 3000!');
});
