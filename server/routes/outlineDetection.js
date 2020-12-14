const express = require('express')
const router = express.Router()

const outlineCtrl = require('../controllers/outlineDetection')

router.get('/outline/index.html', outlineCtrl.sendIndexHtml)
router.get('/public/outline/index.js', outlineCtrl.sendIndexJs)
router.get('/public/outline/worker.js', outlineCtrl.sendWorkerJs)
router.get('/public/outline/main.js', outlineCtrl.sendMainJs)

module.exports = router
