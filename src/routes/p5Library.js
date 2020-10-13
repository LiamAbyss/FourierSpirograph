const express = require('express')
const router = express.Router()

const p5Ctrl = require('../controllers/p5Library')

router.get('/example/index.html', p5Ctrl.sendExampleHtml)
router.get('/dist/example/spirograph.js', p5Ctrl.sendSpirographJs)
router.get('/dist/example/datapts.csv', p5Ctrl.sendSpirographData)

module.exports = router
