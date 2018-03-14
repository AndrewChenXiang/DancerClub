var validator=require('validator');
var eventproxy=require('eventproxy');
var tool=require('../common/tools');
var User=require('../proxy').User;
exports.showSignup=function (req,res) {
    res.render('sign/signup');
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


            })
            
        }))


    })








}