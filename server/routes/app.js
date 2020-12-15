const express = require('express')
const router = express.Router()

const appCtrl = require('../controllers/app')

router.get('/', appCtrl.redirect)
router.get('/app/index.html', appCtrl.sendIndexHtml)
router.get('/app/examples.html', appCtrl.sendExamplesHtml)
router.get('/public/app/examples.js', appCtrl.sendExamplesJs)
router.get('/app/example/:name', appCtrl.sendExamplesCsv)
router.get('/app/example/img/:name', appCtrl.sendExamplesImg)
router.get('/app/examples.json', appCtrl.sendExamplesJson)
router.get('/public/app/index.js', appCtrl.sendIndexJs)
router.get('/public/app/utils.js', appCtrl.sendUtilsJs)
router.get('/public/app/index.css', appCtrl.sendIndexCss)
router.get('/public/app/autoThresholds.csv', appCtrl.sendThresholdsCsv)
router.get('/public/lib/nouislider.js', appCtrl.sendNoUiJs)
router.get('/public/lib/nouislider.css', appCtrl.sendNoUiCss)

module.exports = router
