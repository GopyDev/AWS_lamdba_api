const config = require('../config');
const functions = require('../func');
const moment = require('moment');

const mysql = require('mysql');
const con = mysql.createConnection({
	host     : config.dbconf.RDS_HOSTNAME,
	user     : config.dbconf.RDS_USERNAME,
	password : config.dbconf.RDS_PASSWORD,
	port     : config.dbconf.RDS_PORT,
	database : config.dbconf.RDS_DATABASE_2
});


module.exports.submit = async (event, context) => {
  // var event = JSON.parse(event.input)
	// var userId = await functions.getUserId(event.token, con);
  Object.assign(event,{
    "correlationid": event.contextDetails.correlationid,
    "participantid": event.userid
  });
  var res = await functions.postTransferPayer(event, con);
  return res.insertId > 0 ? 'authorisation accepted' : 'authorisation declined';
  // return res
}
