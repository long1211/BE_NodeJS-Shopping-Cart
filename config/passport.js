var passport = require('passport');
var User = require('../models/user.model');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
    done(null, user.id);
})

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
})

passport.use('local.signup',new LocalStrategy({
     usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},function(req, email, password,done) {
   
 User.findOne({ 'email': email }, function(err, user) {
        if (err) { return done(err); }
        if (user) {
          req.flash('dataForm',dataForm);
          return done(null, false, { message : 'Email is already in use.'})
        }
       var newUser= new User();
      // newUser.name= name;
       newUser.email= email;
       newUser.password=newUser.encryptPassword(password);
       newUser.save(function(err, result){
         if(err){
           return done(err)
         }
         return done(null, newUser);
       })
      });
    }
  ));

  passport.use('local.signin',new LocalStrategy({
    usernameField:'email',
   passwordField:'password',
   passReqToCallback:true
},function(req, email, password,done) {
  
User.findOne({ 'email': email }, function(err, user) {
       if (err) { return done(err); }
       if (!user) {
        req.flash('dataForm',dataForm);
         return done(null, false, { message : 'Not user found'})
       }
       if(!user.validPassword(password)){
      
           return done(null,false,{message:'Wrong password'})
       }
        return done(null, user);
    
     });
   }
 ));