/**
 * Created by chenxiang on 2018/3/4.
 */

var express = require('express');
var site=require('./controllers/site');
var sign=require('./controllers/sign');
var router=express.Router();
router.get('/',site.index);

router.get('/signup',sign.showSignup);
router.get('/signin',sign.showLogin);
router.post('/signin',sign.login);
router.post('/signout',sign.signout);
router.get('/search_pass',sign.showSearchPass);
router.post('/search_pass',sign.updateSearchPass)

router.get('/reset_pass',sign.resetPass);
router.post('/reset_pass',sign.updatePass);

router.get('/active_account',sign.activeAccount);
module.exports=router;
