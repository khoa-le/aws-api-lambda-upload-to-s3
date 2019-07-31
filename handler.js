const uuidv4 = require('uuid/v4');
const moment = require('moment');
var AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-1' });
var s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
  let encodedPhoto = event.photo.split(",");
  let encodedImage= encodedPhoto[1];
  
  if(encodedPhoto[0].indexOf("data:image/")==-1){
    let response = {
      "statusCode": 400,
      "body": {"message":"File upload must be jpg, jpeg, png, gif"},
      "isBase64Encoded": false
    };
    callback(null, response);
    return;
  }
  
  if(encodedImage.length > process.env.MAX_IMAGE_SIZE){
    let response = {
      "statusCode": 400,
      "body": {"message":"Image too large, you can upload files up to "+process.env.MAX_IMAGE_SIZE+" bytes"},
      "isBase64Encoded": false
    };
    callback(null, response);
    return;
  }
  
  let fileExtenstion =encodedPhoto[0].substring("data:image/".length, encodedPhoto[0].indexOf(";base64"));
  let decodedImage = Buffer.from(encodedImage, 'base64');
  let fileNameUniquerID = uuidv4()
  let date = moment().format('YYYY-MM-DD');
  var filePath = "search_product_by_images/" + date + "/" + fileNameUniquerID + "." + fileExtenstion;

  var params = {
    "Body": decodedImage,
    "Bucket": process.env.S3_BUCKET,
    "Key": filePath,
    "ContentType " : "image/"+fileExtenstion
  };
  s3.upload(params, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      let response = {
        "statusCode": 200,
        "body": data,
        "isBase64Encoded": false
      };
      callback(null, response);
    }
  });
};