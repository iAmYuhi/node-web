/**
 * Created by yuhi on 15/11/19.
 * terminalType 0: PC; 1: mobile
 * sourceType 0: mobile browser; 1:mobile APP
 */
var redisDao = require('../storage/redisDao');
var underscore = require('underscore');
var __string = require('underscore.string');
var util = require('util');
var logger = require('../log/logFactory').getLogger();
//映射模型
var cmsurls = new Map();
//哪些url不需要验证
// cmsurls.set('/cms/cmsLogin', true);
// cmsurls.set('/cms/cmsLogout', true);

var terminal = ['Macintosh', 'Windows', 'iPhone', 'Linux'];
var source = 'Html5Plus/1.0';

var filter = {

     //允许跨域请求设置
     crossDomain: function(req, res, next) {
        res.append("Access-Control-Allow-Origin", "*");
        res.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.append('Access-Control-Allow-Credentials', 'true');
        res.append("Access-Control-Allow-Methods", "*");
        res.append("X-Powered-By", "3.2.1");
        res.append("Content-Type", "application/json;charset=utf-8");
        next();
    },

    //权限验证
    check: function (req, res, next) {
        var path = req.path;
        //请求的地址如果不在URLS里面，则表示需要验证权限，不然就直接通过；
        if (cmsurls.get(path)) {
            var sessionId = req.sessionID;
            redisDao.hgetall(sessionId).then(function (userInfo) {
                if (!userInfo) {
                    //返回到登录界面
                    //res.render('/login');
                     res.json({code:200});
                } else {
                    next();
                }
            }).catch(function (err) {
                logger.error('entitle validation: path', err);
                // res.render('/500');
                res.json({code:500});
            });
        } else {
            next();
        }
    },

    //访问信息来源
    getVisitInfo: function (req, res, next) {
        var agent = req.header('user-agent'), lowerAgent = '';
        //0:PC,1:移动
        var terminalType = 1;
        if (agent) {
            for (var i = 0; i < 2; i++) {
                if (agent.indexOf(terminal[i]) > -1) {
                    terminalType = 0;
                    break;
                }
            }
            if (agent.indexOf(source) > -1) {
                req.sourceType = 1;
            } else {
                req.sourceType = 0;
            }
            // 判断是否在微信中打开 START
            lowerAgent = agent.toLowerCase();
            if (/micromessenger/.test(lowerAgent)) {
                req.weiXin = 1;
            } else {
                req.weiXin = 0;
            }
            // 判断是否在微信中打开 END
        }
        req.terminalType = terminalType;
        next();
    }

}

module.exports = filter;