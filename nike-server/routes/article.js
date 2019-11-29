const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const {connection, insert, _delete, query, update} = require('../pool/pool'); // 引入数据库连接池


/* GET users listing. */
router.get('/query', function (req, res, next) {
  // console.log('请求数据： ', JSON.parse(req.query.data));
  let id = req.query.id;

  let promise = query(null, 'articles', id);
  promise.then(result => {
    console.log(result);
    res.send(result)
  }).catch(err => {
    console.log(err)
  });
});

// 更新数据
router.get('/update', function (req, res, next) {
  let data = JSON.parse(req.query.data);
  console.log(data);
  let title = data.title;
  let language = data.lang;
  let uptime = data.uptime;
  let likes = parseInt(data.likes);
  let id = data.articleID;

  // 更新数据库
  let updateSql = `update articles set title=\'${title}\',lang=\'${language}\',updateTime=\'${uptime}\', likes=${likes} where id=${id}`;
  console.log('updateSql: ', updateSql);

  let promise = update(updateSql);
  promise.then(result => {
    console.log(result);
    res.send(result)
  }).catch(err => {
    console.log(err)
  });
});

// 插入数据
router.get('/insert', function (req, res, next) {
  let data = JSON.parse(req.query.data);
  console.log(data);
  let title = data.title;
  let language = data.lang;
  let uptime = data.uptime;
  let likes = parseInt(data.likes);
  // 插入数据库
  let insertSql = `insert into articles (title, lang, uploadTime, updateTime, likes) values (\'${title}\',\'${language}\',\'${uptime}\',\'${uptime}\',${likes})`;
  console.log('insertSql: ', insertSql);

  let promise = insert(insertSql);
  promise.then(result => {
    console.log(result);
    res.send(result.insertId)
  }).catch(err => {
    console.log(err)
  });
});


router.get('/delete', function (req, res, next) {
  console.log('删除');
  let id = JSON.parse(req.query.id);
  console.log(id);
  let insertSql = `DELETE FROM articles WHERE id=${id}`;
  console.log('insertSql: ', insertSql);
  let promise = _delete(insertSql);
  promise.then(result => {
    console.log(result);
    res.send(result)
  }).catch(err => {
    console.log(err)
  });

})
;

module.exports = router;
