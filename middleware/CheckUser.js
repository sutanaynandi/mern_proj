const User=require('../models/user');
const jwt=require('jsonwebtoken');
const fs = require('fs');
const publicKey=fs.readFileSync('public.pem','utf-8');
let verifyToken = (req,res,next)=>{
    let token = req.cookies.jwt;
    let user;
    jwt.verify(token,publicKey,async(err,d)=>{
        if(err)
        {
            user = null;
            
        }
        else
        {
            user = await User.findById(d.id);
        }
        res.locals.user = user;
            next();
    });
}

module.exports = { verifyToken };