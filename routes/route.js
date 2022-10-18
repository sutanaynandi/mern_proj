const express=require('express');
const passport = require('passport');
const cont=require('../controllers/controller');
const { validate } = require('../middleware/validation');
const jwt=require('jsonwebtoken');
const fs=require('fs');
const multer = require('../middleware/Multer');
const { authenticate } = require('../middleware/token');
const { verifyToken } = require('../middleware/CheckUser');
//const private=fs.readFileSync('private.pem','utf-8');
const private = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
//const public =fs.readFileSync('public.pem','utf-8');
const public = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
const router=express.Router();

router.get('/signup',verifyToken,cont.get_signup);
router.post('/signup',validate,cont.post_signup);
router.get('/login',verifyToken,cont.get_login);
router.get('/google',passport.authenticate('google',{
    session:false,
    scope:['profile','email']
}));
// router.get('/google/redirect',passport.authenticate('google',{session:false}),(req,res)=>{
//     res.send('Nyah');
// });

router.get('/google/redirect', (req, res) => {
    passport.authenticate(
      'google',
      { session: false },
      (error, user) => {
  
        if (error || !user) {
          res.status(400).json({ error });
        }
  
        /** This is what ends up in our JWT */
        const payload = {
          id: user._id,
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
        };
  
        /** assigns payload to req.user */
        req.login(payload, {session: false}, (error) => {
          if (error) {
            res.status(400).send({ error });
          }
  
          /** generate a signed json web token and return it in the response */
          const token = jwt.sign(payload, private,{algorithm:'RS256'});
  
          /** assign our jwt to the cookie */
          res.cookie('jwt', token, { httpOnly: true,maxAge:1000*60*60 });
          res.status(200).redirect('/');
        });
      },
    )(req, res);
  });

router.get('/facebook',passport.authenticate('facebook',{session:false, scope:['email']}));
router.get('/facebook/redirect',(req,res)=>{
    passport.authenticate('facebook',{session:false},
    (error,user)=>{
        if(error||!user)
        res.status(400).json({error});

        const payload={
            id:user._id,
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };
        req.login(payload,{session:false},(error)=>{
            if(error)
            res.status(400).json({error});

            const token=jwt.sign(payload,private,{algorithm:'RS256'});
        res.cookie('jwt',token,{httpOnly:true,maxAge:1000*60*60});
        res.status(200).redirect('/');
        });

        
    }
    )(req,res);

});

router.post('/login',(req,res)=>{

    passport.authenticate('local',{session:false},
    (error,user)=>{
        if(error||!user)
        {
            res.status(400);
            res.json({error});
        }
        else
        {
            const payload={
            id:user._id,
            exp: Math.floor(Date.now()/1000)+(60*60)
        };
        req.login(payload,{session:false},(error)=>{
            if(error)
            res.status(400).json({error});
            const token=jwt.sign(payload,private,{algorithm:'RS256'});
            res.cookie('jwt',token,{maxAge:1000*60*60,httpOnly:true});
            console.log('user',user._id);
            res.status(200).redirect('/');
            
        });
    }
    })(req,res);

});

router.get('/logout',
passport.authenticate('jwt',{session:false}),
(req,res)=>{
  res.cookie('jwt','',{maxAge:1});
  res.redirect('/');
}
);

router.get('/protected',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const { user } = req;

    res.status(200).send({user} );
  });

router.get('/addBlog',passport.authenticate('jwt',{session: false, failureRedirect: '/login'}),verifyToken,(req,res)=>{
  res.render('AddBlog',{title:'Add Blog'});
});
router.post('/addBlog',multer.upload.single('image'),cont.postBlog);
router.get('/likedPosts',passport.authenticate('jwt',{session: false, failureRedirect: '/login'}),verifyToken,cont.likedPosts);
router.get('/myPosts',passport.authenticate('jwt',{session: false, failureRedirect: '/login'}),verifyToken,cont.myPosts);
router.get('/blogs/:id',passport.authenticate('jwt',{session: false,failureRedirect: '/login'}),verifyToken,cont.blogDetails);
router.delete('/blogs/:id',passport.authenticate('jwt',{session: false,failureRedirect: '/login'}),verifyToken,cont.deleteBlog);
router.get('/',verifyToken,cont.getHome);
//router.put('/blogs/:id',passport.authenticate('jwt',{session: false, failureRedirect: '/login'}), verifyToken, cont.editBlog);
router.get('/editBlog/:id',passport.authenticate('jwt',{session: false, failureRedirect: '/login'}), verifyToken,cont.editBlog);
router.put('/editBlog/:id',passport.authenticate('jwt',{session: false, failureRedirect: '/login'}), verifyToken,multer.upload.single('image'),cont.putEditBlog);

router.get('/postlikes/:id',passport.authenticate('jwt',{session: false, failureRedirect:'/login'}), verifyToken, cont.postLikes);
router.get('/removelikes/:id',passport.authenticate('jwt',{session: false, failureRedirect:'/login'}), verifyToken, cont.removeLikes);

router.get('/comments/:id',passport.authenticate('jwt',{session: false, failureRedirect:'/login'}),verifyToken,cont.writeComment);
router.get('/removeComments/:i/:id',passport.authenticate('jwt',{session: false, failureRedirect:'/login'}),verifyToken,cont.removeComment);
router.get('/report/:id',passport.authenticate('jwt',{session: false, failureRedirect:'/login'}), verifyToken,cont.report);
router.get('/search', passport.authenticate('jwt',{session: false, failureRedirect:'/login'}), verifyToken,cont.searcher);
//router.get('*',verifyToken,cont.NaNpage);
module.exports = router;