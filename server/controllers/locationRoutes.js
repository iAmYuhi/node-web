/**
 * 微信路由
 * Created by yuhi on 15/11/10.
 */
var constants = require('../helpers/constants');
var weixinService = require('../service/weixinService');
var tecentMapService = require('../service/tecentMapService');
var baiduMapService = require('../service/baiduMapService');
var commonUtil = require('../helpers/commonUtil');
var mongodaDao = require('../storage/mongodbDao');

var Q = require('q');

module.exports = function(app) {

	//微信端 地址补全
	app.get('/getPlaceSuggestion', function(req, res) {
		var place = req.query.place;
		var longitude = req.query.longitude;
		var latitude = req.query.latitude;
		baiduMapService.getAutoCompleteAddresses(place, longitude, latitude).then(function(data) {
			res.json({
				code: 100,
				data: data
			});
		});
	});

	//根据地址获取坐标
	app.get('/getLngLatByAddress', function(req, res) {
		var place = req.query.place;
		baiduMapService.getLngLatByAddress(place).then(function(data) {
			res.json({
				code: 100,
				data: data
			});
		});
	});

	//根据坐标获取地址
	app.get('/getAddressByLngLat', function(req, res) {
		var longitude = req.query.longitude;
		var latitude = req.query.latitude;
		baiduMapService.getAddressByLngLat(longitude, latitude).then(function(data) {
			res.json({
				code: 100,
				data: data
			});
		});
	});

	//微信首页地址验证
	app.get('/checkAddress', function(req, res) {
		// todo
		res.json({
			code: 100
		})

	});

	app.get('/getDistance/:lat1/:lng1/:lat2/:lng2', function(req, res) {
		var lat1 = req.params.lat1;
		var lng1 = req.params.lng1;
		var lat2 = req.params.lat2;
		var lng2 = req.params.lng2;
		var distance = baiduMapService.getDistanceOfTwoPoints(lng1, lat1, lng2, lat2);
		res.json({
			code: 100,
			data: distance
		});

	})



};