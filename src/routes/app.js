const express = require('express')
const router = express.Router()

const appCtrl = require('../controllers/app')

router.get('/', appCtrl.redirect)
router.get('/app/index.html', appCtrl.sendIndexHtml)
router.get('/dist/app/index.js', appCtrl.sendIndexJs)
router.get('/dist/app/index.css', appCtrl.sendIndexCss)
router.get('/dist/app/autoThresholds.csv', appCtrl.sendThresholdsCsv)
router.get('/dist/lib/nouislider.js', appCtrl.sendNoUiJs)
router.get('/dist/lib/nouislider.css', appCtrl.sendNoUiCss)

module.exports = router
