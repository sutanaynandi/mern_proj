const mongoose=require('mongoose');

const bcrypt=require('bcrypt');
const schema=new mongoose.Schema({
    name: {type: String,required:true},
    email: {type: String,unique:[true,'This email exists!']},
    password:{type:String}
});
schema.pre('save',async function(next){
    if(this.password)
    {const salt=await bcrypt.genSalt();
    this.password=await bcrypt.hash(this.password,salt);}
    next();
});
const user=new mongoose.model('user',schema);

module.exports=user;