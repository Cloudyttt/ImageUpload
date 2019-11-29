const express = require('express');
const router = express.Router();
const {connection, insert, _delete, query, update} = require('../pool/pool'); // 引入数据库连接池
const {upload} = require('../pool/multer-config'); // 导入multer配置

/*
* POST upload listing.
* 处理文件插入
* */
router.post('/', upload.array('file'), function (req, res, next) {
  (function () {
    let files = req.files[0];
    let body = req.body;
    console.log(files);
    let data = {};// 用于存放响应数据
    // 文章信息
    let articleID = body.articleID; // 所要更新的旧文章ID
    let title = body.title;
    let language = body.lang;
    let uptime = body.uptime;
    let likes = parseInt(body.likes);
    // 图片信息
    let originalname = files.originalname; // 源文件名
    let size = files.size;  // 图片大小
    let path = files.path;  // 图片路径
    let mimeType = files.mimetype;  // 图片格式
    let encoding = files.encoding;  // 图片编码
    let destination = files.destination;  // 图片存储位置
    let filename = files.filename;  // 服务器中图片文件名
    let type = files.type;  // 图片类型（normal图片/cover图片两者之一）

    let insertArticleSql = `insert into articles (title, lang, uploadTime, updateTime, likes) values (\'${title}\',\'${language}\',\'${uptime}\',\'${uptime}\',${likes})`;

    // 开始插入文章表
    let newID // 新插入的文章id
    let insertArticle = insert(insertArticleSql);
    insertArticle.then(result => {
      newID = result.insertId;
      // 成功插入文章后更新中英文文章关联表
      // 全新的文章
      let idType = language === 'CN' ? 'cn_id' : 'en_id';
      let antherIdType = language === 'CN' ? 'en_id' : 'cn_id';
      if (parseInt(articleID) === -1) {
        let insertRelationSQL = `insert into relation (${idType}) values (${newID})`;
        let promise = insert(insertRelationSQL);
        promise.then(result => {
          console.log('relation表插入成功：', result);
        }).catch(err => [
          console.log(err)
        ]);
      } else { // 已经有其他语言的版本，更新relation表
        let updateRelationSQL = `update relation set ${idType} = ${newID} where ${antherIdType} = ${articleID}`;
        let promise = update(updateRelationSQL);
        promise.then(result => {
          console.log('relation表更新成功：', result);
        }).catch(err => [
          console.log(err)
        ]);
      }
    }).catch(err => {
      console.log(err)
    });

    // 成功插入文章后插入图片
    insertArticle.then(result => {
      // 插入图片表语句
      let insertImageSql = `insert into images (article_id, originalname, encoding, mimeType, destination, filename, path, size) values (${result.insertId},\'${originalname}\',\'${encoding}\',\'${mimeType}\',\'${destination}\',\'${filename}\',\'${path}\',${size})`;

      console.log('insertImageSql:\n', insertImageSql); // 打印

      // 开始插入图片表
      let insertImage = insert(insertImageSql);
      // 成功添加图片后
      insertImage.then(result => {
        console.log('成功添加图片!');
        data.files = files;
        data.newID = result.insertId;
        console.log('data:', data);
      }).catch(err => {
        console.log(err);
      })
    }).catch(err => {
      console.log(err);
    });

    // 接收文件成功后返回数据给前端
    res.send(data);
  })();
});
// 导出模块（在 app.js 中引入）
module.exports = router;
