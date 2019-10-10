var express = require('express');
var router = express.Router();

var Cart = require('../models/cart.model')
var Product= require('../models/product.model')
var Order = require('../models/order.model');
/* GET home page. */
router.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
});
router.get('/', async function(req, res, next) {
    var successMsg= req.flash('success')[0]
    var products= await Product.find()
        res.render('shops/index',{
            products:products,successMsg: successMsg ,noMessages: !successMsg
    })
});
router.get('/add-to-cart/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    
    Product.findById(productId, function (err, product) {
        if(err){
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log( req.session.cart)
        res.redirect('/');
    });
});
router.get('/reduce/:id', function(req, res, next){
     var productId = req.params.id;
     var cart = new Cart(req.session.cart ? req.session.cart : {});
    
     cart.reduceByOne(productId) 
     req.session.cart = cart;
     res.redirect('/shopping-cart')
});
router.get('/remove/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
   
    cart.removeItem(productId)
    req.session.cart = cart;
    res.redirect('/shopping-cart')
});

router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shops/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shops/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});
router.get('/checkout',isLoggedIn,function(req,res,next){
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
  
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shops/checkout',{total: cart.totalPrice,errMsg:errMsg, noError: !errMsg})
})


router.post('/checkout',isLoggedIn,function(req,res,next){
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    
  var cart = new Cart(req.session.cart);
  var stripe = require("stripe")("sk_test_yLRFAnhEJiBP9Azja4hT3aiP00vMGN9DC7");

stripe.charges.create({
  amount: cart.totalPrice*100,
  currency: "usd",
  source: req.body.stripeToken, // obtained with Stripe.js
  description: "Test Charge"
}, function(err, charge) {
   if(err){
   req.flash('error',err.message);
       return res.redirect('/checkout');
   }
   var order= new Order({
       user: req.user,
       cart: cart,
       address: req.body.address,
       name: req.body.name,
       paymentId: charge.id
   });
   order.save(function(err, result){
    req.flash('success','Successfully bought product!');
    req.session.cart = null;
    res.redirect('/');
   });
  
});

});
module.exports = router;
// Bắt buộc user đăng nhập vào mới đc order
//Bắt buộc đăng nhập
// Nếu đã đăng nhập thì ko cần login nx
// Nếu chưa thì phải đăng nhập ms vào đc 
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
      return next();
    }
    req.session.oldUrl = req.url;
      res.redirect('/signin');
  }