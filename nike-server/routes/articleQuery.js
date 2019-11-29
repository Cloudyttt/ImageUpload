const express = require('express');
const router = express.Router();
const {connection, insert, _delete, query, update} = require('../pool/pool'); // 引入数据库连接池
const {upload} = require('../pool/multer-config'); // 导入multer配置

/*
* POST upload listing.
* 处理文件插入
* */
router.get('/', function (req, res, next) {
  (async function () {
    console.log(req.query);
    let articleId = req.query.id;
    let article = null;
    let images = null;
    let data = {};
    let articlePromise = query(null, 'articles', articleId);
    articlePromise.then(result => {
      console.log(result);
      data.article = result;
      // 查询图片
      let imageSql = `select * from images where article_id = ${articleId}`
      let imagePromise = query(imageSql);
      // 接收文件成功后返回数据给前端
      imagePromise.then(result => {
        console.log(result);
        data.images = result;
        console.log(data);
        res.send(data);
      });
    }).catch(err => {
      console.log(err);
    })
  })();
});
// 导出模块（在 app.js 中引入）
module.exports = router;
