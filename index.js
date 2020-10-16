var express = require('express')
var app = express()

const outlineRoutes = require('./src/routes/outlineDetection')
const p5Routes = require('./src/routes/p5Library')
const appRoutes = require('./src/routes/app')

app.use(outlineRoutes)
app.use(p5Routes)
app.use(appRoutes)

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 3000!')
})
