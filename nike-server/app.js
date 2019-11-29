let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const pool = require('./pool/pool'); // 引入数据库连接池塘
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let articleRouter = require('./routes/article');
let updateRouter = require('./routes/articleUpdate');
let uploadRouter = require('./routes/articleUpload');
let deleteRouter = require('./routes/articleDelete');
let queryRouter = require('./routes/articleQuery');
let testRouter = require('./routes/test');

let app = express();
pool.connectMySQL(); // 启动数据库连接
// CORS跨域
let allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next()
};
app.use(allowCrossDomain);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//通过将 public 目录下的图片、CSS 文件、JavaScript 文件对外开放访问
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/article', articleRouter);
app.use('/upload', uploadRouter);
app.use('/update', updateRouter);
app.use('/delete', deleteRouter);
app.use('/query', queryRouter);
app.use('/test', testRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});









module.exports = app;
