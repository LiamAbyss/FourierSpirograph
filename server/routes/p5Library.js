const express = require('express')
const router = express.Router()

const p5Ctrl = require('../controllers/p5Library')

router.get('/example/index.html', p5Ctrl.sendExampleHtml)
router.get('/public/example/Cam.js', p5Ctrl.sendCamJs)
router.get('/public/example/spirograph.js', p5Ctrl.sendSpirographJs)
router.get('/public/example/datapts.csv', p5Ctrl.sendSpirographData)

module.exports = router
