/**
 * Created by yuhi on 15-4-11.
 */
var log4js = require('log4js');
log4js.configure(process.cwd() + '/log4js_configuration.json', {});
var fs = require('fs');
var logdir = process.cwd();
var info = fs.createWriteStream(logdir + '/info.log', {flags: 'a', mode: '0666'});
var error = fs.createWriteStream(logdir + '/error.log', {flags: 'a', mode: '0666'});
var log = new console.Console(info, error);
var custmoLogger = {};

custmoLogger.info = function (content) {
   if (process.env.NODE_ENV != 'production' || process.env.NODE_ENV != 'PRODUCTION') {
        console.info(new Date().toString() + ":" + content.toString());
    }
    log.info(new Date().toString() + ":" + content.toString());
}

custmoLogger.error = function (content) {
    if (process.env.NODE_ENV != 'production' || process.env.NODE_ENV != 'PRODUCTION') {
        console.error(new Date().toString() + ":" + content.toString());
    }
    log.error(new Date().toString() + ":" + content.toString());
}

exports.getLogger = function () {
    return custmoLogger;
}
