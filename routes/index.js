var express = require('express');
const mycontroller = require('../bin/mycontroller');
const upload = require('../bin/upload');

var router = express.Router();

router.get('/', mycontroller.healthCheck);
router.post('/upload', upload.single("file"), mycontroller.addCandidate);

module.exports = router;
