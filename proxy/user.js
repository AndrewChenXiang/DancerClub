var User=require('../models').User;
var uuid=require('node-uuid');
var utility=require('utility');
var validator=require('validator');
exports.getUserById=function (id,callback) {
    if(!id)
       return callback();
    User.findOne({_id:id},callback);
};
exports.getUsersByQuery=function (query,opt,callback) {
    User.find(query,'',opt,callback);
};
exports.makeGravatar = function (email) {
    return 'http://www.gravatar.com/avatar/' + utility.md5(email.toLowerCase()) + '?size=48';
};
exports.newAndSave=function (name,loginname,pass,email,avatar_url,active,callback) {
    var user=new User();
    user.name=name;
    user.loginname=loginname;
    user.pass=pass;
    user.email=email;
    user.avatar=avatar_url;
    user.active=active||true;
    user.accessToken=uuid.v4();
    user.save(callback);
};
exports.getUserByLoginName=function (name,callback) {
    User.findOne({'loginname':new RegExp('^'+name+'$',"i")},callback);
}

exports.getUserByMail=function (email,callback) {
    User.findOne({email:email},callback);
}