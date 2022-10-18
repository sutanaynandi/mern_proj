const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    postId: {
        type: mongoose.ObjectId,
        required: true
    },
    userId: {
        type: [mongoose.ObjectId]
    }
});
const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    postId: {
        type: [mongoose.ObjectId]
    }
});

const postLike = new mongoose.model('postLike', postSchema);
const userLike = new mongoose.model('userLike', userSchema);

module.exports = {postLike, userLike};