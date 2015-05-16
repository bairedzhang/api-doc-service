var fs = require('fs');
var path = require('path');
var https = require('https');
var http = require('http');
var app = require('connect')();
var wechat = require('wechat');
var ejs = require('ejs');
var alpha = require('alpha');
var signature = require('./signature');
var VIEW_DIR = path.join(__dirname, '..', 'views');

var config = require('../config');

var oauth = new wechat.OAuth(config.appid, config.appsecret);
var Payment = require('wechat-pay').Payment;
var initConfig = {
     partnerKey: "<partnerkey>",
     appId: "wx585f9aa0138e27ba",
     mchId: "1236346402",
     notifyUrl: "/wechat/getPayState"
};
var payment = new Payment(initConfig);

var List = require('wechat').List;
List.add('view', [
  ['没有找到相关API。输入模块名，方法名，事件名等都能获取到相关内容。\n回复{a}可以查看近期的NodeParty活动', function (info, req, res) {
    res.nowait('暂无活动');
  }]
]);


var callbackTpl = ejs.compile(fs.readFileSync(path.join(VIEW_DIR, 'callback.html'), 'utf-8'));

exports.callback = function (req, res) {
  res.writeHead(200);
  res.end(callbackTpl(req.query));
};

exports.signature = signature;
exports.reply = wechat(config.mp, wechat.text(function (message, req, res) {
  var input = (message.Content || '').trim();

  if (input === 'login') {
    res.reply([{
      title: 'suishisuidi',
      description: 'go',
      picurl: config.domain + ':8088/static/image/logo.png',
      url: config.domain + '/wechat/callback?uid='+message.FromUserName
    }]);
    return;
  }

  var from = message.FromUserName;
}).image(function (message, req, res) {
  res.reply('还没想好图片怎么处理啦。');
}).location(function (message, req, res) {
  res.reply('想和我约会吗，不要的啦。');
}).voice(function (message, req, res) {
  res.reply('心情不好，不想搭理你。');
}).link(function (message, req, res) {
  res.reply('点连接进来的是吧！');
}).event(function (message, req, res) {
  if(message.Event === 'subscribe') {
    res.writeHead(200);
    res.reply([{
      title: '随时随递',
      description: 'go',
      picurl: 'http://suishisuid.com:8088/static/image/logo.png',
      url: config.domain + '/wechat/callback?uid='+message.FromUserName
    }]);

    return;

  }else if (message.EventKey === 'index') {
        var uid = message.FromUserName;
	 res.reply([{
	      title: '随时随递',
	      description: 'go',
	      picurl: 'http://suishisuid.com:8088/static/image/logo.png',
	      url: config.domain + '/wechat/callback?uid='+message.FromUserName
	    }]);
		return ;
  }
}));
exports.payment = function(req,res){
    var order = {
        body: req.query.body,
        out_trade_no: 'kfc' + (+new Date),
        total_fee: req.query.total,
        spbill_create_ip: req.ip,
        openid: req.query.openid,
        trade_type: 'JSAPI'
    };

    payment.getBrandWCPayRequestParams(order, function(err, payargs){
        res.json(payargs);
    });
}
var middleware = require('wechat-pay').middleware;
app.use('/wechat/getPayState', middleware(initConfig).getNotify().done(function(message, req, res, next) {
    var openid = message.openid;
    var order_id = message.out_trade_no;
    var attach = {};
        try{
             attach = JSON.parse(message.attach);
            }catch(e){}

            /**
             ** 查询订单，在自己系统里把订单标为已处理
             ** 如果订单之前已经处理过了直接返回成功
             **/
            res.reply('success');

              /**
               ** 有错误返回错误，不然微信会在一段时间里以一定频次请求你
               ** res.reply(new Error('...'))
               **/
}));
var loginTpl = ejs.compile(fs.readFileSync(path.join(VIEW_DIR, 'login.html'), 'utf-8'));

exports.login = function (req, res) {
  res.writeHead(200);
  var redirect = config.domain+'/public/html/index.html';
  res.end(loginTpl({authorizeURL: oauth.getAuthorizeURL(redirect, 'state', 'snsapi_base')}));
};
exports.getUid = function(request,response){
    console.log(request.query);
    var code = request.query.code;
    console.log(code);
    var path = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx585f9aa0138e27ba&secret=41aecb4e7c8e4546b89ac7a95e0bbc73&code='+code+'&grant_type=authorization_code';

    console.log(path);
    https.get(path, function(res) {
			  var data = '';
			  res.on('data', function (chunk) {
			  	data +=chunk;
			  });
			  res.on('end',function(){
			  	response.writeHead(res.statusCode,res.headers);
                console.log(data);
                                console.log(data);
			  	response.end(data);
			  });
	});
};
exports.api = function(request,response){
    var path = '/api'+request.url;
    console.log(path);
	var options = {
		hostname: '123.57.56.174',
  		port: 9001,
  		path: path,
  		method: 'GET'
	};
	console.log(path);

    var req = http.request(options, function(res) {
			  var data = '';
			  res.on('data', function (chunk) {
			  	data +=chunk;
			  });
			  res.on('end',function(){
			  	response.writeHead(res.statusCode,res.headers);
			  	response.end(data);
			  });
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	req.end();

}
