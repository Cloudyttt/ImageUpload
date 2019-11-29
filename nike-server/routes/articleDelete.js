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
    let lang = req.query.lang;
    let langType = lang === 'CN' ? 'cn_id' : 'en_id';
    let data = {};
    // 先检查relation表
    let querySql = `select * from relation where ${langType} = ${articleId}`;
    console.log(querySql)
    let relationPromise = query(querySql);
    relationPromise.then(result => {
      console.log(result); // result为对象数组
      // 文章有两个版本则更新relation后再删除
      if (result[0].cn_id !== null && result[0].en_id !== null) {
        let updateSql = `update relation set ${langType} = NULL where ${langType}=${articleId}`;
        console.log('updateSql:', updateSql); // 打印
        let relationUpdate = update(updateSql);
        relationUpdate.then(result => {
          console.log(result);
          let deleteSql = `DELETE FROM articles WHERE id=${articleId}`;
          console.log('deleteSql:', deleteSql); // 打印
          let articleDelete = _delete(deleteSql);
          articleDelete.then(result => {
            console.log(result);
            res.send(result);
          }).catch(err => {
            console.log(err);
          });
        }).catch(err => {
          console.log(err);
        });
      } else { // 文章只有当前一个版本则直接删除文章
        let deleteSql = `DELETE FROM articles WHERE id=${articleId}`;
        console.log('deleteSql:', deleteSql); // 打印
        let articleDelete = _delete(deleteSql);
        articleDelete.then(result => {
          console.log(result);
          res.send(result);
        }).catch(err => {
          console.log(err);
        });
      }
    }).catch(err => {
      console.log(err);
    })
  })();
});
// 导出模块（在 app.js 中引入）
module.exports = router;
