const passport=require('passport');
const googleStrategy=require('passport-google-oauth20');
const fbStrategy=require('passport-facebook').Strategy;
const localStrategy=require('passport-local').Strategy;
const User=require('../models/user');
const passportJWT=require('passport-jwt');
const JWTStrategy=passportJWT.Strategy;
const fs=require('fs');
//const public=fs.readFileSync('public.pem','utf-8');
const public = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
//const private=fs.readFileSync('private.pem','utf-8');
const private = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
const bcrypt=require('bcrypt');
require('dotenv').config();


passport.use(
    new googleStrategy({
        callbackURL:'http://localhost:3000/google/redirect',
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret
},async(accessToken, refreshToken,profile,done)=>{
    let gUser=await User.findOne({email:profile.emails[0].value});
    if(gUser)
    {
        done(null,gUser);
    }
    else
    {   gUser= await new User({name: profile.displayName, email:profile.emails[0].value}).save();
        done(null,gUser);
    }
})
);

passport.use(new JWTStrategy({
    jwtFromRequest: req=>req.cookies.jwt,
    secretOrKey: public,
    algorithm: ["RS256"]
},(jwtPayload,done)=>{

    if (jwtPayload.exp>Date.now()) {
        return done('jwt expired');
      }
  
      return done(null, jwtPayload);
    
}));

passport.use(new fbStrategy({

    clientID: process.env.fbClientID,
    clientSecret: process.env.fbClientSecret,
    callbackURL: "http://localhost:3000/facebook/redirect",
    profileFields: ['id', 'emails', 'displayName']

},async(accessToken,refreshToken,profile,done)=>{
    let gUser=await User.findOne({email:profile.emails[0].value});
    if(gUser)
    {
        done(null,gUser);
    }
    else
    {   gUser= await new User({name: profile.displayName, email:profile.emails[0].value}).save();
        done(null,gUser);
    }

}));

passport.use(new localStrategy({
    usernameField:'email'

},async(email,password,done)=>{
    let user=await User.findOne({email:email});
    if(user)
    {
        const auth=await bcrypt.compare(password,user.password);
        if(auth)
        {
            done(null,user);
        }
        else
        done("Incorrect Password",null);
    }
    else
    done("Email doesn't exist",false);
}));
