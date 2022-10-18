const express=require('express');
const mongoose=require('mongoose');
const router=require('./routes/route');
const passport=require('./passport/passport');
const cookieParser=require('cookie-parser');
const methodOverride = require('method-override');
const { NaNpage } = require('./controllers/controller');
const { verifyToken } = require('./middleware/CheckUser');
require('dotenv').config();
const app=express();
mongoose.connect(process.env.dbURI,()=>{
app.listen(3000,()=>{
    console.log('listening');
});
});
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(router);
app.set('view engine','ejs');

app.use(express.static('public'));
//app.get('*',verifyToken,NaNpage);