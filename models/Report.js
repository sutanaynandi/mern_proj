const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    postId: {
        type: mongoose.ObjectId,
        required: true
    },
    uid: {
        type: [mongoose.ObjectId]
    }
});
const reporter = new mongoose.model('report',schema);
module.exports = {reporter};