const joiSchema=require('../controllers/auth');
const validate=async(req,res,next)=>{
    try {
        const name=req.body.name;
        const password=req.body.password;
        const email=req.body.email;
        const x=await joiSchema.schema.validateAsync({name:name,email:email,password:password});
        next();
    } catch (err) {
        res.json({err});
        console.log(err);
    }
};
module.exports={validate};