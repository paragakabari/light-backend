
const aws = require("aws-sdk");
const httpStatus = require("http-status");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { env } = require("../config/config");
require("dotenv").config();



aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();




const profileUploadS3 = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      acl: "public-read", 
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (_req, file, cb) {
        
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        
        req.body = JSON.parse(JSON.stringify(req.body));
        cb(
          null,
          "images/" +
            "userimg" +
            "-" +
            Date.now().toString() +
            Date.now().toString() +
            "." +
            file.originalname.split(".")[file.originalname.split(".").length - 1]
        );
      },
      // shouldTransform: function(req, file, cb) {
      //   cb(null, /^image/i.test(file.mimetype));
      // },
      // transforms: [
      //   {
      //     id: 'original',
      //     transform: function(req, file, cb) {
      //       //Perform desired transformations
      //       cb(
      //         null,
      //         sharp()
      //           .resize(600, 600)
      //           .max()
      //       );
      //     }
      //   }
      // ],
    }),
    limits: {
      fileSize: 1024 * 1024 * 5, // we are allowing only 2 MB files
    },
  });

const deleteImage = async function (req, res, next) {
  // if (req.body.keys instanceof Array == false) {
  //   return res.status(httpStatus.FORBIDDEN).json({
  //     success: false,
  //     message: `keys should be an array`,
  //   });
  // }

  let array = req.body.keys;
  let imageNameArray = [];
  let url = "";
  for (let i = 0; i < array?.length; i++) {
    url = array[i].split("/")[array[i].split("/").length - 1];
    imageNameArray.push(url);

    const s3 = new aws.S3();
    var params = {
      Bucket: process.env.BUCKET,
      Key: req.body.keys[i],
    };
    s3.getObject(params, (err) => {
      if (err) {
        const message = "File not found";
        const payload = {
          success: false,
          message: message,
        };
        req.user = payload;
        next();
      }
      s3.deleteObject(params, async function (err, data) {
        const message = "Files deleted";
        const payload = {
          success: true,
          data: message,
        };
        req.user = payload;
        next();
      });
    });
  }
};
module.exports = { profileUploadS3, deleteImage };
