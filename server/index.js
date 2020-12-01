var express = require('express')
var app = express()

const outlineRoutes = require('./routes/outlineDetection')
const p5Routes = require('./routes/p5Library')
const appRoutes = require('./routes/app')

app.use(outlineRoutes)
app.use(p5Routes)
app.use(appRoutes)

app.listen(3000, function () {
  console.log('App listening on http://localhost:3000/')
})
