/**
 * Created by chenxiang on 2018/3/4.
 */

var express = require('express');
var site=require('./controllers/site');
var sign=require('./controllers/sign');
var router=express.Router();
router.get('/',site.index);

router.get('/signup',sign.showSignup);
router.post('/signup',sign.signup);

module.exports=router;
