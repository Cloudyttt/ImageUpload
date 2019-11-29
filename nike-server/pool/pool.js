const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// 连接数据库的配置
const connection = mysql.createConnection({
  // 主机名称
  host: '101.132.97.193',
  // 数据库的端口号
  port: '3306',
  // 创建数据库时设置用户名
  user: 'nike',
  // 创建数据库时设置的密码
  password: 'qazxsw',
  // 创建的数据库
  database: 'nike'
});

function handleError(err) {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // 如果是连接断开，自动重新连接
      // 连接数据库
      (() => {
        connection.connect(handleError);
        connection.on('error', handleError);
      })();
    } else if (err.code === 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE') { // 已经连接数据库时断开重连
      connection.end(function (err) {
        if (err) {
          console.log('---:' + err);
          return
        }
        console.log('关闭succeed')
      })
    } else {
      console.error(err.stack || err)
    }
  } else {
    console.log('connecting succeed!')
  }
}

/*// 连接数据库
(() => {
  connection.connect(handleError);
  connection.on('error', handleError);
})();*/
let connectMySQL = () => {
  connection.connect(handleError);
  connection.on('error', handleError);
};

/*
* 插入数据
* */
function insert(sql) {
  return new Promise((resolve, reject) => {
    console.log('insertSql:',sql);
    connection.query(sql, function (err, result) {
      if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        reject(err)
      }
      resolve(result)
    });
  })
}

/*
* 表查询
* 所要查询的表名，默认article表
* 所要查询的文章id，不传id则默认查询表中所有数据
* */
function query(sql = null, table = 'article', id = null) {
  return new Promise((resolve, reject) => {
    // 查询数据库
    let querySql;
    if(sql){
      querySql = sql;
    } else {
      querySql = `SELECT * from ${table}`;
      if (id) {
        querySql = `SELECT * from ${table} where id = ${id}`;
      }
    }
    console.log('querySql',querySql);
    connection.query(querySql, function (err, result, fields) {
      if (err) {
        console.log('[QUERY ERROR] - ', err.message);
        reject(err);
      }
      resolve(result)
    });
  });
}

/*
* 更新表
* */
function update(sql) {
  return new Promise((resolve, reject) => {
    console.log('updateSql: ', sql);
    connection.query(sql, function (err, result) {
      if (err) {
        console.log('[UPDATE ERROR] - ', err.message);
        reject(err)
      }
      resolve(result)
    });
  })
}

/*
* 表删除
* 参数：
* table:表名
* id：主键
* */
function _delete(sql = null, table = 'article', id = 1) {
  return new Promise((resolve, reject) => {
    // 插入数据库
    let deleteSql;
    if(sql){
      deleteSql = sql;
    } else {
      deleteSql = `DELETE FROM \'${table}\' WHERE id=${id}`;
    }
    console.log('deleteSql: ', deleteSql);
    connection.query(deleteSql, function (err, result) {
      if (err) {
        console.log('[DELETE ERROR] - ', err.message);
        reject(err);
      }
      resolve(result);
    });
  });
}

module.exports = {connectMySQL, connection, query, insert, update, _delete};
