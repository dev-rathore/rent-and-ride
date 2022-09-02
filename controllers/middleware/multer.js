const multer = require("multer");

var fileStorage = multer.diskStorage({
  destination: "./public/images/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: fileStorage,
});

module.exports.send = (req, res, next) => {
  upload.single("image")(req, res, () => {
    // Remember, the middleware will call it's next function
    // so we can inject our controller manually as the next()

    console.log(req.body, req.files);
    res.send("ok");
  });
};
