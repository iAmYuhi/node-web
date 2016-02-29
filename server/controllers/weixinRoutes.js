/**
 * 微信路由
 * Created by yuhi on 15/11/10.
 */
var constants = require('../helpers/constants');
var weixinService = require('../service/weixinService');
var fs = require('fs');
var mongodaDao = require('../storage/mongodbDao');
var commonUtil = require('../helpers/commonUtil');
var Q = require('q');
var middleware = require('wechat-pay').middleware;
var initConfig = {
	partnerKey: constants.WeixinConstants.PARTNERKEY,
	appId: constants.WeixinConstants.APPID,
	mchId: constants.WeixinConstants.MCHID,
	notifyUrl: constants.WeixinConstants.NOTIFYURL,
	// pfx: fs.readFileSync(constants.WeixinConstants.PFX)
};


module.exports = function(app) {

	//########## 微信菜单入口  #--start--#  #################
	app.get('/wxIndex', function(req, res) {
		var code = req.query.code;
		if (code) {
			//正式环境
			weixinService.getOpenIdByCode(code).then(function(data) {
				// res.cookie('userid',  userid, { maxAge: 1000000,domain: '.foamka.com' ,httpOnly: true});
				// userid为openId
				res.cookie('userid', data.openId, {
					maxAge: 1800000
				});
				res.redirect('/');
			}).catch(function(err) {
				res.render('/#/500')
			});
		} else {
			//开发测试
			var userid = "old6iv5MVy2gDkugC1C0Yy3h-mLM";
			res.cookie('userid', userid, {
				maxAge: 1800000
			});
			res.redirect('/');
		}
	});
	//########## 微信菜单入口  #--end--#  #################

	//微信分享接口签名
	app.post('/getQMData', weixinService.getQMData);

	app.get('/weixinGetUserInfo', function(req, res) {
		var code = req.query.code;
		weixinService.weixinGetUserInfo(code).then(function(data) {
			var openid = data.openid;
			res.json({
				code: 100,
				openid: openid
			})
		}).catch(function(err) {
			res.json({
				code: 500
			})
		});
	});

	//微信订单创建
	app.post('/createOrder', function(req, res) {
		var order = {
			body: '吮指原味鸡 * 1',
			attach: '{"部位":"三角"}',
			out_trade_no: 'kfc' + (+new Date),
			total_fee: 1,
			spbill_create_ip: '127.0.0.1',
			openid: 'o8udVvxVvBGQL8HTkYd6g78pnF9U',
			trade_type: 'JSAPI'
		};
		weixinService.createPayment(order).then(function(payargs) {
			res.json({
				code: 100,
				data: payargs
			});
		}).catch(function(err) {
			logger.error(err);
			res.json({
				code: 100,
				data: err
			});
		})
	});

	//微信支付回调
	app.use('/paymentCallback', middleware(initConfig).getNotify().done(function(message, req, res, next) {
		var openid = message.openid;
		var order_id = message.out_trade_no;
		if (message.return_code == 'SUCCESS') {
			if (message.result_code == 'SUCCESS') {
				// TODO
			}
		} else {
               //TODO
		}
	}));

};