const express = require('express');
const router = express.Router();

const p5Ctrl = require('../controllers/p5Library');

router.get('/dist/p5/p5.min.js', p5Ctrl.sendP5Lib);
router.get('/dist/p5/spirograph.js', p5Ctrl.sendSpirographJs);
router.get('/dist/p5/datapts.csv', p5Ctrl.sendSpirographData);

module.exports = router;