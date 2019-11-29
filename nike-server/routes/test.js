const express = require('express');
const router = express.Router();
const {upload} = require('../pool/multer-config'); // 导入multer配置

router.post('/', upload.array('file', 20), function (req, res, next) {
  let files = req.files;
  res.send(files);
});

router.post('/ooo', upload.array('file', 20), function (req, res, next) {
  let files = req.files;
  res.send(files);
});

module.exports = router;
