const User=require('../models/user');
require('dotenv').config();
const jwt=require('jsonwebtoken');
const Blog = require('../models/Blog');
const { userLike } = require('../models/Likes');
const {ObjectId} = require('mongodb');
const { reporter } = require('../models/Report');
const {comment} = require('../models/Comment');
const fs = require('fs');
const blog = require('../models/Blog');
const { title } = require('process');
// const publicKey=fs.readFileSync('public.pem','utf-8');
//console.log(process.env.PUBLIC_KEY.replace(/\\n/g, '\n'));
const publicKey = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
const get_signup=(req,res)=>{
    res.render('signUp',{title:'Sign up'});
};
const post_signup=async(req,res)=>{
    try
    {
    const user=await User.create(req.body);
    
    console.log(user);
    
    res.send(user);
    }
    catch(err)
    {
        console.log(err);
        
        res.send(err);
    }
};
const get_login=(req,res)=>{

    res.render('login',{title:'Login'});
}
const postBlog = async(req, res) => {
    let token = req.cookies.jwt;
    let author = "";
    jwt.verify(token, publicKey, async(err,decodedToken)=>{
        if(err)
        {
            res.redirect('/login');
        }
        else
        {
            console.log(decodedToken);
            author = await User.findById(decodedToken.id);
            console.log(author);let blog= undefined;
            if(req.file)
            {
                blog = {
                title: req.body.title,
                author: author.name,
                image: req.file.filename,
                body: req.body.body
            };
            }
            else
            {
                blog = {
                    title: req.body.title,
                    author: author.name,
                    body: req.body.body
                    }
            }
            let B = await Blog.create(blog);
            res.redirect('/blogs/'.concat(B._id));
        }
    });
    
};
const getHome = async(req,res)=>{

    let skip = req.query.p || 0;
    let total = await Blog.find().count();
    let blogs = await Blog.find().sort({created_at: -1}).skip(skip * 4).limit(4);

    res.render('Index',{title: 'Home', blogs: blogs});
    
    
};
const myPosts = async(req, res) =>{

    let token = req.cookies.jwt;
    jwt.verify(token, publicKey, async(err, d) => {
        if(err)
        {
            res.render('login');
        }
        else
        {
            let user = await User.findById(d.id);
            let blogs = await Blog.find({author: user.name});
            res.render('MyBlog',{title: 'My Posts',blogs: blogs});
        }
    })
}
const likedPosts = async(req, res) => {

    let uid = jwt.verify(req.cookies.jwt, publicKey);
    let like = await userLike.find({userId: ObjectId(uid)});
    let posts = like[0].postId;

    var blogs = [];
    for(i = 0; i< posts.length;i++)
      {
          let blog = await Blog.findById(posts[i]);
          if(blog)
        blogs.push(blog);

    };

    res.render('LikedPosts',{title: 'Liked Posts', blogs: blogs});
}
const newBlogs = async(req, res) => {

}
const blogDetails = async(req, res) => {

    let id = req.params.id;
    let blog = await Blog.findById(id);
    let user = jwt.verify(req.cookies.jwt, publicKey);
    let u = await User.findById(user.id);
    let like = await userLike.find({userId: ObjectId(user), postId: ObjectId(id)});
    let commentsA = await comment.find({postId: ObjectId(id)});
    let name, body;let comments = [];
    if(commentsA[0])
    {
        for(i = 0; i < commentsA[0].uid.length; i++)
        {
            let user = await User.findById(commentsA[0].uid[i]);
            name = user.name;
            body = commentsA[0].comments[i];
            if(body != 'C6R5')
            {
                comments.push({name: name, body: body});
            }
        }
    }
    if(blog.image[0] && blog.body)
    {
  
        res.render('PhotoImage', {title: blog.title, blog: blog, like: like[0], comments: comments, user: u});
    }
    else if(blog.image[0])
    {
        res.render('Blog',{title: blog.title, blog: blog, like: like[0], comments: comments, user: u});
    }
    else
    {
        res.render('ImageView.ejs',{title: blog.title, blog: blog, like: like[0], comments: comments, user: u});
    }
}
const editBlog = async(req, res) => {
    let blog = await Blog.findById(req.params.id);
    res.render('EditBlog',{title: 'editBlog', blog: blog});
}
const deleteBlog = async(req, res) => {
let id = req.params.id;
let blog = await Blog.deleteOne({_id: id});
res.redirect('/myPosts');
}
const putEditBlog = async(req,res)=>{
    let blogUpdate = ''; let blog = await Blog.findById(req.params.id);
    console.log(req.body);
    if(req.file && req.file.filename)
    {
    //     blogUpdate = {
    //     title: req.body.title,
    //     image: req.file.filename,
    //     body: req.body.body
    // };
    blog.title = req.body.title;
    blog.image = req.file.filename;
    blog.body = req.body.body;
    blog = await blog.save();
    //blog = await Blog.updateOne({_id: req.params.id},{$set: blogUpdate});
    }
    else
    {
        // blogUpdate = {
        //     title: req.body.title,
        //     body: req.body.body
        // };
        blog.title = req.body.title;

    blog.body = req.body.body;
    blog = await blog.save();
        //blog = await Blog.updateOne({_id: req.params.id},{$set: {body: blogUpdate.body}});
    }
    
    res.redirect('/blogs/'.concat(blog._id));

}

const postLikes = async(req, res) =>{

    let token = req.cookies.jwt;
    jwt.verify(token, publicKey, async(e, d) =>{
        if(e)
        {
            res.redirect('/login');
        }
        else
        {
            let like = await userLike.find({userId: d.id});

            if(like != undefined && like != null && like[0] != undefined && like[0] != null)
            {
                //console.log(like[0]);
                like[0].postId.push(req.params.id);
                like[0].save();
                let flag = await Blog.update({_id: req.params.id},{$inc:{likes: 1}});

                //userLike.update({userId: d.id},{$push:{postId: new ObjectId(req.params.id)}});
            }
            else
            {
                userLike.create({userId: d.id, postId: req.params.id});
                let flag = await Blog.update({_id: req.params.id},{$inc:{likes: 1}});

            }
        }
        res.json("Done");
    })
}
const removeLikes = async(req,res) =>{
    let token = req.cookies.jwt;
    jwt.verify(token, publicKey, async(e, d) =>{
        if(e)
        {
            res.redirect('/login');
        }
        else
        {
            let like = await userLike.find({userId: d.id});
            like[0].postId.pull( new ObjectId(req.params.id));
            like[0].save();
            let flag = await Blog.update({_id: req.params.id},{$inc:{likes: -1}});

        }
    });
    res.json("Done");
}

const writeComment = async(req, res) => {
    let com = await comment.find({postId: req.params.id});
    if(com[0])
    {
        let user = jwt.verify(req.cookies.jwt, publicKey);
        com[0].uid.push(user.id);
        com[0].comments.push(req.body.commentBody);
        com[0].save();
    }
    else
    {
        let user = jwt.verify(req.cookies.jwt, publicKey);
        //console.log(user);
        comment.create({postId: req.params.id, uid: user.id, comments: req.body.commentBody});
    }
    res.redirect(`/blogs/${req.params.id}`);
}
const removeComment = async(req, res) => {

    let com = await comment.find({postId: req.params.id});

    if(com[0])
    {

        //let valC = com[0].comments.slice(req.params.i, req.params.i + 1);

        //com[0].comments.pull(valC[0]);
        //valC = com[0].uid.slice(req.params.i, req.params.i + 1);
        //console.log(valC);
        //com[0].uid.pull(valC);
        com[0].comments.slice(req.params.i, 1, 'C6R5');

        com[0].save();
    }
    res.redirect('/');
}
const report = async(req, res) => {
    let doc = await reporter.find({postId: ObjectId(req.params.id)});
    let f = jwt.verify(req.cookies.jwt, publicKey);
    if(doc[0])
    {
        
        let u = await User.findById(f.id);
        let query = await reporter.find({postId: ObjectId(req.params.id), uid: ObjectId(u._id)})
        if(query)
        {
            res.json("Reported already");
        }
        else
        {
            if(doc[0].uid.length >= 5 )
        {
            Blog.delete({postId: ObjectId(req.params.id)});
            res.redirect('/');
        }
        else
        {

            doc[0].uid.push(ObjectId(f.id));
            doc[0].save();
            res.json("reported");
        }
        }
        
    }
    else
    {
        reporter.create({postId: ObjectId(req.params.id), uid: ObjectId(f.id)});
        res.json("reported");
    }
    
    //res.redirect(`/blog${req.params.id}`);
}
const searcher = async(req,res) =>{
let titS = await Blog.find({title: req.body.query});
if(titS[0])
{
    res.redirect(`/blogs/${titS[0]._id}`);
}
else
{
    let authS = await Blog.find({author: {$regex: new RegExp(req.body.query, "i")}});

    if(authS[0])
    {
        res.render('Index',{title: 'Search Results', blogs: authS});
    }
    else
    {
        res.redirect('*');
    }
}
}
const NaNpage = (req,res) =>{
    res.redirect('/');
}
module.exports={get_signup,post_signup,get_login, postBlog, getHome, myPosts, likedPosts, newBlogs, blogDetails, editBlog, deleteBlog, putEditBlog, postLikes, removeLikes, writeComment, removeComment, report, searcher, NaNpage};