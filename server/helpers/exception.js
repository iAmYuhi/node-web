'use strict'
var colors = require('colors');

//响应
function saveLog(req, res, title, stack) {
	if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'PRODUCTION') {
		if (req.method == "post") {
			logger.error("method:" + req.method + ',url:' + req.url + ",params:" + JSON.stringify(req.body) + ",error:" + title + "," + stack);
		} else {
			logger.error("method:" + req.method + ',url:' + req.url + ",params:" + JSON.stringify(req.query || req.params) + ",error:" + title + "," + stack);
		}
	} else {
		//开发环境
		const title = req.method + ':' + req.url;
		console.info(colors.red('Error info is, "%s" .'), title);
		console.info(colors.green('Error stack is, "%s" .'), stack);
	}
	res.statusCode = 500;
	res.json({
		code: 500,
		data: title
	})
}

//MAX下弹出通知
function errorNotification(str, req) {
	const title = req.method + ':' + req.url;
	console.info(colors.red('Error info is, "%s" .'), title);
	console.info(colors.green('Error stack is, "%s" .'), stack);
	require('node-notifier').notify({
		title: title,
		message: str
	})
}

var IOException = {

	//处理异步异常
	nioExceptionHandle: function(domain, req, res, next) {
		var serverDomain = domain.create();
		//监听domain的错误事件
		serverDomain.on('error', function(err) {
			const stack = err.stack
			const title = err.message
			saveLog(req, res, title, stack);
			serverDomain.dispose();
		});
		serverDomain.add(req);
		serverDomain.add(res);
		serverDomain.run(next);
	},

    //处理同步异常
	bioExceptionHandle: function(err, req, res, next) {
		const stack = err.stack
		const title = err.message
			//正式生产环境
		if (err) {
			saveLog(req, res, title, stack)
		} else {
			next();
		}
	}

}

module.exports = IOException;