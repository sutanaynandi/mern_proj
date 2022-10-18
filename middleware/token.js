const jwt=require('jsonwebtoken');
const fs=require('fs');
const public=fs.readFileSync('public.pem','utf-8');
const authenticate=async(req,res,next)=>{
    const token=await req.cookies.jwt;
    console.log(token);
    if(token)
    {
        jwt.verify(token,public,(err,decodedToken)=>{
            if(err)
            {
                console.log(err);
            res.redirect('/login');}
            else
            {
                next();
            }
        });
    }
    else
    res.redirect('/login');
}
module.exports={authenticate};