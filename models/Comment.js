
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    postId: {
        type: mongoose.ObjectId,
        required: true
    },
    uid: {
        type: [mongoose.ObjectId],

    },
    comments: {
        type: [String],

    }
});
const comment = new mongoose.model('Comment',schema);
module.exports = {comment};