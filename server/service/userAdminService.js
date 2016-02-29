
'use strict'
var mongodbDao = require('../storage/mongodbDao');
var commonUtil = require('../helpers/commonUtil');
var BaseService = require('../service/baseService');
var redisDao = require('../storage/redisDao');
var ObjectID = require('mongodb').ObjectID;
var Q = require('q');


class UserAdminService extends BaseService {


}

module.exports = new UserAdminService('User');
