var validator=require('validator');
var eventproxy=require('eventproxy');
var tool=require('../common/tools');
var User=require('../proxy').User;
var mail=require('../common/mail');
var utility=require('utility');
var config=require('../config');
var authMiddleWare=require('../middlewares/auth');
var uuid=require('node-uuid');


exports.showSignup=function (req,res) {

    res.render('sign/signup');
}
exports.showLogin=function (req,res) {
    req.session._loginReferer=req.headers.referer;
    res.render('sign/signin');
}
exports.signup=function (req,res,next) {
    var loginname=validator.trim(req.body.loginname);
    var email=validator.trim(req.body.email).toLowerCase();
    var pass=validator.trim(req.body.pass);
    var rePass=validator.trim(req.body.re_pass);
    var ep=new eventproxy();
    ep.fail(next);
    ep.on('prop_err',function (msg) {
        res.status(422);
        res.render('sign/signup',{error:msg,loginname:loginname,email:email});
    })
    if([loginname,pass,rePass,email].some(function (value) { return value==='' }))
    {
        ep.emit('prop_err','信息不完整');
    }
    if(loginname.length<5){
        ep.emit('prop_err','用户名至少需要5个字符。');
        return;
    }
    if(!tool.validateId(loginname))
    {
        return ep.emit('prop_err','用户名不合法。');
    }
    if(!validator.isEmail(email))
    {
        return ep.emit('prop_err','邮箱不合法。');
    }
    if(pass!==rePass)
    {
        return ep.emit('prop_err','两次密码输入不一致。')
    }

    User.getUsersByQuery({'$or':[{'loginname':loginname},{'email':email}]},{},function (err,users) {
        if(err){
            return next(err);
        }
        if(users.length>0)
        {
            ep.emit('prop_err','用户名或邮箱已被使用。');
            return;
        }
        tool.bhash(pass,ep.done(function (passhash) {
            var avatarUrl=User.makeGravatar(email);
            User.newAndSave(loginname,loginname,passhash,email,avatarUrl,false,function (err) {
                if(err){
                    return next(err);
                }
              mail.sendActiveMail(email,utility.md5(email+passhash+config.session_secret),loginname);
                res.render('sign/signup', {
                    success: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
                });

            });
            
        }))


    })








};
var notJump = [
    '/active_account', //active page
    '/reset_pass',     //reset password page, avoid to reset twice
    '/signup',         //regist page
    '/search_pass'    //serch pass page
];
exports.signout=function (req,res,next) {
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name,{path:'/'});
    res.redirect('/');
};
exports.showSearchPass = function (req, res) {
    res.render('sign/search_pass');
};

exports.updateSearchPass=function (req,res,next) {
    var email=validator.trim(req.body.email).toLowerCase();
    if(!validator.isEmail(email))
    {
        return res.render('sign/search_pass',{error: '邮箱不合法', email: email});
    }
    var retrieveKey=uuid.v4();
    var retrieveTime=new Date().getTime();
    User.getUserByMail(email,function (err,user) {
        if(err)
        {
            next(err);
        }
        if(!user)
        {
            res.render('sign/search_pass',{error:'没有这个电子邮箱。',email:email});
        }
        user.retrieve_key=retrieveKey;
        user.retrieve_time=retrieveTime;
        user.save(function (err) {
            if(err){
                return next(err);
            }
            mail.sendResetPassMail(email,retrieveKey,user.loginname);
            res.render('notify/notify',{success:'我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'})
        })
    })
}
exports.updatePass=function (req,res,next) {
    var psw=validator.trim(req.body.psw)||'';
    var repsw=validator.trim(req.body.repsw) || '';
    var key=validator.trim(req.body.key)|| '';
    var name=validator.trim(req.body.name) ||'';
    var ep=new eventproxy();
    ep.fail(next);
    if(psw !== repsw)
    {
        return res.render('sign/reset',{name:name,key:key,error:'两次密码输入不一致。'})
    }
    User.getUserByNameAndKey(name,key,ep.done(function (user) {
        if(!user)
        {
            res.render('notify/notify',{error:'错误的激活链接'});
        }
        tool.bhash(psw,ep.done(function (passhash) {
            user.pass=passhash;
            user.retrieve_key=null;
            user.retrieve_time=null;
            user.active =true;
            user.save(function (err) {
                if(err)
                {
                    return next(err);
                }
                return res.render('notify/notify',{success: '你的密码已重置。'});
            })
        }))
    }))
}
exports.resetPass=function (req,res,next) {
    var key=validator.trim(req.query.key || '');
    var name=validator.trim(req.query.name || '');
    User.getUserByNameAndKey(name,key,function (err,user) {
        if(!user)
        {
            res.status(403);
            return res.render('notify/notify',{error:'信息有误，密码无法重置。'})
        }
        var now=new Date().getTime();
        var oneDay=1000*60*60*24;
        if(!user.retrieve_time||now-user.retrieve_time>oneDay)
        {
            res.status(403);
            return res.render('notify/notify', {error: '该链接已过期，请重新申请。'});
        }
        return res.render('sign/reset',{name:name,key:key});
    })
}
exports.login=function (req,res,next) {
    var loginname=validator.trim(req.body.name).toLowerCase();
    var pass=validator.trim(req.body.pass);
    var ep=new eventproxy();
    ep.fail(next);
    ep.on('login_error',function (login_error) {
        res.status(403);
        res.render('sign/signin',{error:'用户名或者密码错误'})
    })
    if(!loginname || !pass)
    {
        res.status(422);
        return res.render('sign/signin',{error:'x信息不完整'});
    }
    var getUser;
    if(loginname.indexOf('@')!==-1)
    {
        getUser=User.getUserByMail;
    }
    else{
        getUser=User.getUserByLoginName;
    }

    getUser(loginname,function (err,user) {
        if(err){
            return next(err);
        }
        if(!user)
        {
            return ep.emit('login_error');
        }
        var passhash=user.pass;
        tool.bcompare(pass,passhash,ep.done(function (bool) {
            if(!bool){
                return ep.emit('login_error');
            }
            if (!user.active) {
                // 重新发送激活邮件
                mail.sendActiveMail(user.email, utility.md5(user.email + passhash + config.session_secret), user.loginname);
                res.status(403);
                return res.render('sign/signin', { error: '此帐号还没有被激活，激活链接已发送到 ' + user.email + ' 邮箱，请查收。' });
            }

            authMiddleWare.gen_session(user,res);
            var refer = req.session._loginReferer || '/';
            for (var i = 0, len = notJump.length; i !== len; ++i) {
                if (refer.indexOf(notJump[i]) >= 0) {
                    refer = '/';
                    break;
                }
            }
            res.redirect(refer);
        }));
    })

}
exports.activeAccount=function (req,res,next) {
    var key=validator.trim(req.query.key);
    var name=validator.trim(req.query.name);
    User.getUserByLoginName(name,function (err,user) {
        if(err)
        {
            next(err);
        }
        if(!user)
        {
            next(new Error('[ACTIVE_ACCOUNT] no such user:'+name));
        }
        var passhash=user.pass;
        if(!user || utility.md5(user.email+passhash+config.session_secret)!==key)
        {
            return res.render('notify/notify',{error:'信息有误，帐号无法被激活。'})
        }
        user.active=true;
        user.save(function (err) {
            if(err)
            {
                return next(err);
            }
            res.render('notify/notify',{success:'帐号已被激活，请登录'});
            next();
        })
    })
}