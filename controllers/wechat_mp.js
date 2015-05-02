var fs = require('fs');
var path = require('path');

var wechat = require('wechat');
var ejs = require('ejs');
var alpha = require('alpha');
var VIEW_DIR = path.join(__dirname, '..', 'views');

var config = require('../config');

var oauth = new wechat.OAuth(config.appid, config.appsecret);

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

var loginTpl = ejs.compile(fs.readFileSync(path.join(VIEW_DIR, 'login.html'), 'utf-8'));

exports.login = function (req, res) {
  res.writeHead(200);
  var redirect = config.domain+':8088/html/index.html';
  res.end(loginTpl({authorizeURL: oauth.getAuthorizeURL(redirect, 'state', 'snsapi_userinfo')}));
};
exports.static = function(req,res){
    console.log(req.query);
    var path =  fs.readFileSync(path.join(VIEW_DIR, 'login.html'), 'utf-8')
    res.writeHead(200);
    res.end('111');
}
