/**
 * Created by yuhi on 15/6/23.
 */
var constants = {

    /**
     * 微信常用变量
     */
    WeixinConstants: {
        //应用ID
        APPID: '',
        //应用密钥
        APPSECRET: '',
        //Token 令牌
        TOKEN: '',
        //消息加解密密钥
        ENCODINGAESKEY: '',
        //商户号
        MCHID: '',
        //回调地址
        NOTIFYURL: 'http://xxxxx/paymentCallback',
        //证书
        PFX: process.cwd() + '',
        //密钥设置
        PARTNERKEY: ''
    },

    BaiduConstants: {
        MAPAK: ''
    },


    SimSimi:{
        KEY:''
    },

    QiNiu:{
        ACCESS_KEY:'',
        SECRET_KEY:''
    }

};
module.exports = constants;