const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    body: {
        type: String,
        
    },
    image: {
        type: [String]
    },
    likes: {
        type: Number,
        required: true,
        default: 0
    },
    unlikes: {
        type: Number,
        required: true,
        default: 0
    },
    
},{timestamps: true});
schema.index({title: 1, author: 1});
const blog = new mongoose.model('blog', schema);
module.exports = blog;