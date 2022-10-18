const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req,file,callback)
    {
        callback(null, './public/uploads/images');
    },
    filename: function(req, file, cb)
    {
        cb(null, Date.toString() + file.originalname);
    }
});
const fileFilter = (req,file, cb)=>{
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png')
    {
        cb(null, true);
    }
    else
    {
        cb(new Error('Not an image'), false);
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 12
    },
    fileFilter: fileFilter
});

module.exports = {upload};