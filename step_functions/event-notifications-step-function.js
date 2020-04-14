const AWS = require('aws-sdk');
const config = require('../config');
const functions = require('../func');
const moment = require('moment');



module.exports.submit = async (event, context) => {
	// const s3Client = new AWS.S3({accessKeyId: process.env.ACCESS_KEY_ID, secretAccessKey: process.env.SECRET_ACCESS_KEY});
	// const filename = event.contextDetails.correlationid + '.json'
	// const s3PutRequest = functions.s3CeatePutJsonRequest('mybucket/bucketpath', 'filename.json', JSON.stringify({
	//   hello: 'world'
	// }));
	// var s3Response = await functions.s3Put(s3PutRequest,s3Client);
	return "done"
}
