'use strict'
var http = require('http');
var wechat = require('wechat');
var url = require('url');
var fs = require('fs');
var cryptojs = require("crypto-js");
var crypto = require("crypto");
var xml = require("node-xml/lib/node-xml.js");
var request = require('request');
var redisDao = require('../storage/redisDao');
var mongodaDao = require('../storage/mongodbDao');
var CronJob = require('cron').CronJob;
var constants = require('../helpers/constants');
var Q = require('q');
var Payment = require('wechat-pay').Payment;
var simSimiService = require('./simSimiService');
var initConfig = {
    partnerKey: constants.WeixinConstants.PARTNERKEY,
    appId: constants.WeixinConstants.APPID,
    mchId: constants.WeixinConstants.MCHID,
    notifyUrl: constants.WeixinConstants.NOTIFYURL
        // pfx: fs.readFileSync(constants.WeixinConstants.PFX)
};
var payment = new Payment(initConfig);
var discountService = require('./discountService');

// 微信接口类
class WeixinService {

    createPayment(order) {
        var deferred = Q.defer();
        payment.getBrandWCPayRequestParams(order, function(err, payargs) {
            if (err) deferred.reject(err);
            deferred.resolve(payargs);
        });
        return deferred.promise;
    }

    /**
     * 微信接入验证( 第一次绑定公众号时调用)
     * @param req
     * @param res
     */
    weixinCheck(req, res) {
        var signature = req.query.signature;
        var timestamp = req.query.timestamp;
        var nonce = req.query.nonce;
        var echostr = req.query.echostr;
        var check = false;
        check = this.isLegel(signature, timestamp, nonce, constants.WeixinConstants.TOKEN); //替换成你的token
        if (check) {
            res.write(echostr);
        } else {
            res.write("error data");
        }
        res.end();
    }


    /**
     * 微信接入校验时sha1加密
     * @param signature
     * @param timestamp
     * @param nonce
     * @returns {boolean}
     */
    isLegel(signature, timestamp, nonce, token) {
        var TOKEN = token;
        var arr = [TOKEN, timestamp, nonce];
        // 对三个参数进行字典序排序
        arr.sort();
        // sha1 加密
        var msg = arr[0] + arr[1] + arr[2];
        var key = constants.WeixinConstants.ENCODINGAESKEY;
        msg = cryptojs.SHA1(msg, key).toString();
        // 验证
        if (msg == signature) {
            return true;
        } else {
            return false;
        }
    }

    //定时任务，调用获取微信tokenid的接口
    getAccess_token() {
        var me = this;
        this.access_token();
        //每隔55分钟
        var job = new CronJob('*/55 * * * * ', function() {
            me.access_token();
        }, null, true, "Asia/Chongqing");
    }

    access_token() {
        var appid = constants.WeixinConstants.APPID;
        var secret = constants.WeixinConstants.APPSECRET;
        //console.log("调用获取access_token方法");
        request.get({
            url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret,
            formData: {}
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                redisDao.set(appid + "access_token", json.access_token);
                redisDao.expire(appid + "access_token", 7000); // 默认是7200的有效期
                //调用微信卡券接口，获取api_ticket
                request.get({
                    url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + json.access_token + '&type=jsapi',
                    formData: {}
                }, function(err, res, body) {
                    if (!err && res.statusCode == 200) {
                        redisDao.hset(appid, "ticket", JSON.parse(body).ticket);
                    } else {
                        logger.error(err);
                    }
                });
            } else {
                logger.error(error);
            }
        });
    }

    //分享用的数字签名验证
    getQMData(req, res) {
        var url = req.body.url;
        var appId = constants.WeixinConstants.APPID;
        redisDao.hgetall(appId).then(function(data) {
            var ticket = data.ticket;
            //createTimestamp
            var timestamp = parseInt(new Date().getTime() / 1000) + '';
            //createNonceStr
            var nonceStr = Math.random().toString(36).substr(2, 15);
            //先按照微信指定的规则生成jsapi_ticket
            var stringutil = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
            //SHA1
            var md5sum = crypto.createHash('sha1');
            md5sum.update(stringutil, 'utf8');
            var signature = md5sum.digest('hex');
            //动态的返回前天进行微信接口操作的数据
            return res.json({
                appId: appId,
                timestamp: timestamp,
                nonceStr: nonceStr,
                signature: signature
            });
        });
    }

    //----------------------------------公用promise方法

    /**
     * 获取AccessToken方法（Promise）
     * @returns {*|promise}
     */
    getAccessToken() {
        var deferred = Q.defer();
        var appid = constants.WeixinConstants.APPID;
        var secret = constants.WeixinConstants.APPSECRET;
        redisDao.get(appid + "access_token").then(function(access_token) {
            if (access_token) {
                deferred.resolve(access_token);
            } else {
                //获取access_token
                request.get({
                    url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret,
                    formData: {}
                }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var _data = JSON.parse(body);
                        redisDao.set(appid + "access_token", _data.access_token);
                        redisDao.expire(appid + "access_token", 7000); // 默认是7200的有效期
                        deferred.resolve(_data.access_token);
                    } else {
                        deferred.reject(new Error(err));
                    }
                });
            }
        })
        return deferred.promise;
    }

    /**
     * 创建自定义菜单
     * @param access_token
     * @returns {promise.promise|Function|jQuery.promise|d.promise|*|promise}
     */
    addCustomMenu(access_token, data) {
        var deferred = Q.defer();
        request.post({
            url: 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + access_token,
            formData: JSON.stringify(data)
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var _data = JSON.parse(body);
                deferred.resolve(_data);
            } else {
                deferred.reject(new Error(err));
            }
        });
        return deferred.promise;
    }

    /**
     * 查询自定义菜单
     * @param access_token
     * @returns {promise.promise|Function|jQuery.promise|d.promise|*|promise}
     */
    quryCustomMenu(access_token) {
        var deferred = Q.defer();
        request.get({
            //url:'https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token='+access_token,
            url: 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token=' + access_token,
            formData: {}
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var _data = JSON.parse(body);
                deferred.resolve(_data);
            } else {
                deferred.reject(new Error(err));
            }
        });
        return deferred.promise;
    }

    /**
     * 删除自定义菜单
     * @param access_token
     * @returns {promise.promise|Function|jQuery.promise|d.promise|*|promise}
     */
    deleteCustomMenu(access_token) {
        var deferred = Q.defer();
        request.get({
            url: 'https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=' + access_token,
            formData: {}
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var _data = JSON.parse(body);
                deferred.resolve(_data);
            } else {
                deferred.reject(new Error(err));
            }
        });
        return deferred.promise;
    }

    /**
     * 根据code进行网页授权获取用户openid
     * @param code
     */
    getOpenIdByCode(code) {
        var defferred = Q.defer();
        var appid = constants.WeixinConstants.APPID;
        var secret = constants.WeixinConstants.APPSECRET;
        request.get({
            url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code',
            formData: {}
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                var openId = json.openid;
                defferred.resolve({
                    code: 100,
                    openId: openId
                });
            } else {
                defferred.resolve({
                    code: 500,
                    message: '网络请求失败'
                })
            }
        });
        return defferred.promise;
    }

    /**
     * UnionID机制获取微信用户信息
     * @param access_token
     * @param opednId
     * @returns {promise.promise|Function|jQuery.promise|*|r.promise|promise}
     */
    getWechatUserInfo(openId) {
        var defferred = Q.defer();
        this.getAccessToken().then(function(data) {
            var access_token = data;
            request.get({
                url: 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + openId + '&lang=zh_CN',
                formData: {}
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var wechatUserInfo = JSON.parse(body);
                    defferred.resolve(wechatUserInfo);
                } else {
                    defferred.resolve({
                        code: 500,
                        message: '网络请求失败'
                    })
                }
            });
        })
        return defferred.promise;
    }

    //获取微信用户信息
    weixinGetUserInfo(code) {
        var defferred = Q.defer();
        var appid = constants.WeixinConstants.APPID;
        var secret = constants.WeixinConstants.APPSECRET;
        request.get({
            url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code',
            formData: {}
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = JSON.parse(body);
                var access_token = json.access_token;
                var openid = json.openid;
                request.get({
                    url: 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN',
                    formData: {}
                }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var json = JSON.parse(body);
                        delete json._id;
                        mongodaDao.query('User', {
                            openid: json.openid
                        }).then(function(users) {
                            if (users.length == 0) {
                                mongodaDao.save('User', json).then(function(userInfo) {
                                    defferred.resolve(userInfo);
                                }).catch(function(error) {
                                    defferred.reject(error);
                                });
                            } else {
                                defferred.resolve(users[0]);
                            }
                        }).catch(function(err) {
                            defferred.reject(err);
                        })
                    } else {
                        defferred.reject(error);
                    }
                });
            }
        });
        return defferred.promise;
    }

    //微信关注
    payAttentionTo(req, res, next) {
        // 微信输入信息都在req.
        var message = req.weixin;
        var openId = message.FromUserName;
        var pathname = url.parse(req.url).pathname; //pathname => select
        var arg = url.parse(req.url).query; //arg => name=a&id=5
        //关注事件
        if ((message.MsgType == 'event') && (message.Event == 'subscribe')) {
            var replyStr = "欢迎来到xx";
            //关注时，获取用户信息
            Q(1).then(function(data) {
                    return getAccessToken();
                }).then(function(data) {
                    var defferred = Q.defer();
                    var access_token = data;
                    request.get({
                        url: 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + access_token + '&openid=' + openId + '&lang=zh_CN',
                        formData: {}
                    }, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var wechatUserInfo = JSON.parse(body);
                            defferred.resolve({
                                code: 100,
                                wechatUserInfo: wechatUserInfo
                            });
                        } else {
                            defferred.resolve({
                                code: 500,
                                message: '网络请求失败'
                            })
                        }
                    });
                    return defferred.promise;
                }).then(function(wechatUserResult) {
                    var wechatUserInfo = wechatUserResult.wechatUserInfo;
                    var userInfo = {
                            subscribe: wechatUserInfo.subscribe,
                            openId: wechatUserInfo.openid,
                            nickname: wechatUserInfo.nickname,
                            sex: wechatUserInfo.sex,
                            wechatCity: wechatUserInfo.city,
                            country: wechatUserInfo.country,
                            province: wechatUserInfo.province,
                            language: wechatUserInfo.language,
                            headimgurl: wechatUserInfo.headimgurl,
                            subscribe_time: wechatUserInfo.subscribe_time,
                            remark: wechatUserInfo.remark,
                            groupid: wechatUserInfo.groupid,
                            usertype: '0'
                        }
                        //不需要同步，直接推送
                    mongodaDao.query('User', {
                        openId: openId
                    }).then(function(data) {
                        if (data.length == 0) {
                            return mongodaDao.save('User', userInfo).then(function(user) {
                                logger.info("微信关注:openid为" + openId + "关注成功");
                                // var openId = user.openId;
                                // var nickname = user.nickname;
                                // var phone = user.phone;
                                //正式环境取消送优惠劵
                                // return discountService.subscribeSendDiscount(openId, phone, nickname);
                                return Q(false)
                            })
                        } else if (data.length > 0) {
                            return mongodaDao.update('User', {
                                openId: openId
                            }, {
                                subscribe: 1
                            }).then(function(data) {
                                logger.info("微信关注:openid为" + openId + "再次关注成功");
                            })
                        }
                    }).catch(function(err) {
                        logger.error("微信关注:openid为" + openId + "，错误为:" + JSON.stringify(err));
                    });
                    // res.reply(replyStr);
                    res.reply([{
                        title: '',
                        description: '',
                        picurl: '',
                        url: ''
                    }]);
                }).catch(function(err) {
                    logger.error("微信关注过程中出错：openid：" + openId + "，错误为:" + JSON.stringify(err));
                    res.reply('err')
                })
                //取消关注事件
        } else if ((message.MsgType == 'event') && (message.Event == 'unsubscribe')) {
            mongodaDao.query('User', {
                openId: openId
            }).then(function(data) {
                if (data.length === 0) {
                    logger.info('openId为：' + openId + '的用户取消关注时，数据库没有该用户的数据');
                     res.reply('ok')
                } else if (data.length === 1) {
                    var unsub = new Date();
                    unsub.setHours(unsub.getHours() + 8);
                    return mongodaDao.update('User', {
                        openId: openId
                    }, {
                        subscribe: 0,
                        unsubscribe_time: unsub
                    }).then(function(data) {
                        logger.info('openId为：' + openId + '的用户取消关注成功。');
                        res.reply('ok')
                    }).catch(function(err){
                        logger.error("微信关注过程中出错：openid：" + openId + "，错误为:" + JSON.stringify(err));
                        res.reply('err');
                    })
                } else if (data.length > 1) {
                    logger.info("openId为:" + openId + "的用户取消关注时，数据库里存在多条用户信息");
                    res.reply('ok')
                }
            }).catch(function(err) {
                logger.error("微信关注:openid为" + openId + "，错误为:" + JSON.stringify(err));
                res.reply('err')
            });
        } else if (message.MsgType == 'text') {
            var input = (message.Content || '').trim();
            if (input) {
                //机器人
                // simSimiService.send(input).then(function(data) {
                //     res.reply(data);
                // })
            }
            //防止没有响应给微信端的报警
            res.send('success')

        }

    }

}

function getAccessToken() {
    var deferred = Q.defer();
    var appid = constants.WeixinConstants.APPID;
    var secret = constants.WeixinConstants.APPSECRET;
    redisDao.get(appid + "access_token").then(function(access_token) {
        if (access_token) {
            deferred.resolve(access_token);
        } else {
            //获取access_token
            request.get({
                url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret,
                formData: {}
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var _data = JSON.parse(body);
                    redisDao.set(appid + "access_token", _data.access_token);
                    redisDao.expire(appid + "access_token", 7000); // 默认是7200的有效期
                    deferred.resolve(_data.access_token);
                } else {
                    deferred.reject(new Error(err));
                }
            });
        }
    })
    return deferred.promise;
}

module.exports = new WeixinService();