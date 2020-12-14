const express = require('express')
const router = express.Router()

const appCtrl = require('../controllers/app')

router.get('/', appCtrl.redirect)
router.get('/app/index.html', appCtrl.sendIndexHtml)
router.get('/public/app/index.js', appCtrl.sendIndexJs)
router.get('/public/app/utils.js', appCtrl.sendUtilsJs)
router.get('/public/app/index.css', appCtrl.sendIndexCss)
router.get('/public/app/autoThresholds.csv', appCtrl.sendThresholdsCsv)
router.get('/public/lib/nouislider.js', appCtrl.sendNoUiJs)
router.get('/public/lib/nouislider.css', appCtrl.sendNoUiCss)

module.exports = router
