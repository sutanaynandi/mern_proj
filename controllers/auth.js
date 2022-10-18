const joi=require('joi');
const schema=joi.object({
    name: joi.string().pattern(new RegExp('^[a-zA-Z]')).required(),
    password: joi.string().min(4).required(),
    email: joi.string().email()
});
module.exports={schema};