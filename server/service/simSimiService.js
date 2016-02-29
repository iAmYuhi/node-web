'use strict'
var BaseService = require('../service/baseService');
var Q = require('q');
var constants = require('../helpers/constants');
var request = require('request');

class SimSimiService extends BaseService {

	send(text) {
		var deferred = Q.defer();
		request.get({
			url: 'http://sandbox.api.simsimi.com/request.p?key=' + constants.SimSimi.KEY + '&lc=ch&ft=1.0&text=' + encodeURI(text),
			formData: {}
		}, function(err, res, body) {
			var json=JSON.parse(res.body);
			if (!err && json.result == 100) {
				var response = json.response;
				deferred.resolve(response);
			} else {
				deferred.reject(err);
			}
		});
		return deferred.promise;
	}


}

module.exports = new SimSimiService('simi');