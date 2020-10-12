const express = require('express')
const router = express.Router()

const outlineCtrl = require('../controllers/outlineDetection')

router.get('/', outlineCtrl.redirect)
router.get('/outline/index.html', outlineCtrl.sendIndexHtml)
router.get('/dist/outline/index.js', outlineCtrl.sendIndexJs)
router.get('/dist/outline/worker.js', outlineCtrl.sendWorkerJs)
router.get('/dist/outline/main.js', outlineCtrl.sendMainJs)

module.exports = router
