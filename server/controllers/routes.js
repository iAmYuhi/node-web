/**
 * Created by yuhi on 15/11/10.
 */
var weixinRoutes = require('./weixinRoutes');
var userAdminRoutes = require('./userAdminRoutes');
var Q = require('q');

module.exports = function (app) {
    //微信
    weixinRoutes(app);
    //TODO

};



