var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var  passport=require('passport')
var { check, validationResult } = require('express-validator');
var Order = require('../models/order.model');
var Cart = require('../models/cart.model')
var csrfProtection=csrf() 
router.use(csrfProtection)

// profile
 router.get('/profile',isLoggedIn,function(req,res,next){
    Order.find({user: req.user}, function(err, orders) {
      if (err) {
          return res.write('Error!');
      }
      var cart;
      var item;
      orders.forEach(function(order) {
          cart = new Cart(order.cart);
          item = cart.generateArray();
        });
       
        console.log(item)
         res.render('user/profile', {
           orders: orders,  item:item        
        });
  });
});
// logout
router.get('/logout',isLoggedIn,function(req,res,next){
  req.logout();
  res.redirect('signin')
})
  router.use('/',notLoggedIn,function(req,res,next){
   next();
 })

 // signup
 router.get('/signup',function(req, res, next){
    var messages = req.flash('error')
    dataForm = {
   
      email : '',
      password : ''
}    
    res.render('user/signup',{ csrfToken: req.csrfToken(), 
      messages: messages,
      hasErrors: messages.length > 0,
      dataForm : dataForm
     })
 
})
router.post('/signup',
  
  [
 
  check('email', 'Your email is not valid').isEmail(),
  check('password', 'Your password must be at least 5 characters').isLength({ min: 5 })
  ],
  (function (req, res, next) {
 
  var email = req.body.email;
  var password = req.body.password;

  var messages = req.flash('error');
  const result= validationResult(req);
  var errors=result.errors;
  dataForm = {
    email : email,
    password : password
}
  if (!result.isEmpty()) {
    var messages = [];
    errors.forEach(function(error){
        messages.push(error.msg);
    });
    res.render('user/signup',{
      csrfToken: req.csrfToken(), 
      messages: messages,
      hasErrors: messages.length > 0,
      dataForm : dataForm
    });
    console.log(messages)
}else{
     next();
  }
}),
passport.authenticate('local.signup', {
  failureRedirect: '/signup',
  failureFlash: true
}), function (req,res,next){
  if(req.session.oldUrl){
    // Nó sẽ tìm cái thèn url cũ mà nó vừa signup
    // Nếu ko tìm thấy URL cũ là /checkout thì nó sẽ redirect('/profile)
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  
  }else{
    res.redirect('/profile')
  }
});
 
// Sign In
router.get('/signin',function(req, res, next){
  var messages = req.flash('error')
  dataForm = {
 
    email : '',
    password : ''
}    
  res.render('user/signin',{ csrfToken: req.csrfToken(), 
    messages: messages,
    hasErrors: messages.length > 0,
    dataForm : dataForm
   })

})

// signin
router.post('/signin',

[

check('email', 'Your email is not valid').isEmail(),
check('password', 'Your password must be at least 5 characters').isLength({ min: 5 })
],
(function (req, res, next) {

var email = req.body.email;
var password = req.body.password;

var messages = req.flash('error');
const result= validationResult(req);
var errors=result.errors;
dataForm = {

  email : email,
  password : password
}
if (!result.isEmpty()) {
  var messages = [];
  errors.forEach(function(error){
      messages.push(error.msg);
  });
  res.render('user/signin',{
    csrfToken: req.csrfToken(), 
    messages: messages,
    hasErrors: messages.length > 0,
    dataForm : dataForm
  });
  console.log(messages)
}else{
   next();
}
}),
passport.authenticate('local.signin', {
failureRedirect: '/signin',
failureFlash: true
}), function (req,res,next){
  if(req.session.oldUrl){
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  }else{
    res.redirect('/profile')
  }
});


module.exports = router;
//Bắt buộc đăng nhập
// Nếu đã đăng nhập thì ko cần login nx
// Nếu chưa thì phải đăng nhập ms vào đc 
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
    res.redirect('/');
}
// Đã Login thì ko cho login nx
function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()){
    return next();
  }
    res.redirect('/');
}