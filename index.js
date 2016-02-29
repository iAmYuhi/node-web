'use strict'

var Server = require('./server/server');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
global.logger = require('./server/log/logFactory').getLogger();
var http = require('http');
var app = express();
var wechat = require('wechat');
// 微信开发需要开启
// var weixinService = require('./server/service/weixinService');
var constants = require('./server/helpers/constants');
var authority = require('./server/filter/authority');
var domain=require('domain');
var exception=require('./server/helpers/exception')
app.use(express.static(__dirname + '/public')); //方便开发，暂时引入
// App 全局配置
app.use(cookieParser());
//权限拦截
// app.use(authority.check);
//设置跨域
// app.use(authority.crossDomain);
app.use(bodyParser.json({
    limit: '2mb'
}));
app.use(bodyParser.urlencoded({
    limit: '2mb',
    extended: true
}));
//捕获异步引起的异常
app.use(function(req, res, next) {
     exception.nioExceptionHandle(domain,req,res,next);
});
//微信开发需要开启
// weixinService.getAccess_token(); //开启微信获取token定时任务
// app.use('/weixin', wechat(constants.WeixinConstants.TOKEN, weixinService.payAttentionTo));
//注入URL
require('./server/controllers/routes')(app);
//捕获同步引起的异常
app.use(exception.bioExceptionHandle);

var appServer = new Server(app);
appServer.start();
