const express = require('express');
const router = express.Router();
const {connection, insert, _delete, query, update} = require('../pool/pool'); // 引入数据库连接池
const {upload} = require('../pool/multer-config'); // 导入multer配置

/*
* POST upload listing.
* 处理文件插入
* 更新流程：
* 1、直接在直接再articles表中插入新文章，相应图片直接插入iamges表；
* 2、更新中英文文章关联表realtion，用新文章的newID替换掉旧文章的id
* 3、直接从articles表中删除旧文章（images中旧文章相对应图片会通过外键约束自动删除）
* * */
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

    // 第一部：articles表中直接插入新文章
    let insertArticleSql = `insert into articles (title, lang, uploadTime, updateTime, likes) values (\'${title}\',\'${language}\',\'${uptime}\',\'${uptime}\',${likes})`;
    // 开始插入文章表
    let newID; // 新插入的文章id
    let insertArticle = insert(insertArticleSql);
    insertArticle.then(result => {
      newID = result.insertId;
      // 第二步：成功插入文章后更新中英文文章关联表
      // 全新的文章,更新relation，顶替掉旧文章
      let idType = language === 'CN' ? 'cn_id' : 'en_id';
      let antherIdType = language === 'CN' ? 'en_id' : 'cn_id';
      let updateRelationSQL = `update relation set ${idType} = ${newID} where ${idType} = ${articleID} `;
      let promise = update(updateRelationSQL);
      promise.then(result => {
        console.log('relation表更新成功：', result);
        // 第三步：直接从articles表中删除旧文章（images中相应图片会通过外键约束自动删除）
        let deleteSql = `DELETE FROM articles WHERE id=${articleID}`;
        let articleDelete = _delete(deleteSql);
        articleDelete.then(result => {
          console.log(result);
          console.log('article表更新成功：', result);
        }).catch(err => {
          console.log(err);
        });
      }).catch(err => [
        console.log(err)
      ]);
    }).catch(err => {
      console.log(err)
    });

    // 第一步中剩下要做的事：成功插入文章后直接插入新文章对应的图片
    insertArticle.then(result => {
      // 插入图片表语句
      let insertImageSql = `insert into images (article_id, originalname, encoding, mimeType, destination, filename, path, size) values (${result.insertId},\'${originalname}\',\'${encoding}\',\'${mimeType}\',\'${destination}\',\'${filename}\',\'${path}\',${size})`;
      // 开始插入图片表
      let insertImage = insert(insertImageSql);
      // 成功添加图片后
      insertImage.then(result => {
        console.log('成功添加图片!');
        data.files = files;
        data.newID = newID;
        console.log('data => ',data);
        res.send(data);
      }).catch(err => {
        console.log(err);
      })
    }).catch(err => {
      console.log(err);
    });
  })();
});
// 导出模块（在 app.js 中引入）
module.exports = router;
