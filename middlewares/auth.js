var mongoose=require('mongoose');
var eventproxy=require('eventproxy');
var UserModel=mongoose.model('User');
var Message=require('../proxy').Message;
var UserProxy=require('../proxy').User;
var config=require('../config');
exports.authUser=function (req,res,next) {
    var ep=new eventproxy();
    ep.fail(next);
    res.locals.current_user=null;
    if(config.debug&&req.cookies&&req.cookies['mock_user'])
    {
        var mockUser=JSON.parse(req.cookies['mock_user'])
        req.session.user=new UserModel(mockUser);
        if(mockUser.isAdmin)
        {
            req.session.user.is_admin=true;
        }
        return next();
    }
    ep.all('get_user',function (user) {
        if(!user)
        {
            return next();
        }
        user=res.locals.current_user=req.session.user=new UserModel(user);
        if(config.admins.hasOwnProperty(user.loginname))
        {
            user.is_admin=true;
        }
        Message.getMessagesCount(user.id,ep.done(function (count) {
            user.message_count=count;
            next();
        }))

    })
    if(req.session.user)
    {
        ep.emit('get_user',req.session.user);
    }
    else
    {
        var auth_token=req.signedCookies[config.auth_cookie_name];
        if(!auth_token)
        {
            return next();
        }
        var auth=auth_token.split('$$$$');
        var user_id=auth[0];
        UserProxy.getUserById(user_id,ep.done('get_user'));
    }

}