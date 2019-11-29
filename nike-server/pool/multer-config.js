const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
//uuid工具可以生成唯一标示 需要安装
const UUID = require('uuid');
// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 接收到文件后输出的保存路径（若不存在则需要创建）
    cb(null, 'upload/');
  },
  filename: function (req, file, cb) {
    // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
    let extName = file.originalname.slice(file.originalname.lastIndexOf('.'));
    let fileName = UUID.v1();
    cb(null, fileName + extName)
    // cb(null, Date.now() + "-" + file.originalname);
  }
});

//设置限制（可选）
let imageLimit = {
  fieldSize: '10MB'
};

//设置过滤规则（可选）
let imageFilter = function (req, file, cb) {
  let acceptableMime = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  //微信公众号只接收上述四种类型的图片
  if (acceptableMime.indexOf(file.mimetype) !== -1) {
    cb(null, true)
  } else {
    cb(null, false)
  }
};

// 创建文件夹
let createFolder = function (folder) {
  try {
    // 测试 path 指定的文件或目录的用户权限,我们用来检测文件是否存在
    // 如果文件路径不存在将会抛出错误"no such file or directory"
    fs.accessSync(folder);
  } catch (e) {
    // 文件夹不存在，以同步的方式创建文件目录。
    fs.mkdirSync(folder);
  }
};

let uploadFolder = './uploads/';
createFolder(uploadFolder);

// 创建 multer 对象
let upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: imageLimit
});


module.exports = {upload};
