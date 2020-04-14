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


module.exports.submit = async(event, context) => {
			// var data = JSON.parse(event.input)
			var payee = await functions.getPayeeId(event.payee_mobile, con);
			var payeeId = "UUA-" + payee[0].id
			// var res = await functions.getBalance(userId, con);
			// return res == undefined ? 'insufficient funds'
			//  : res.length==0 ? 'insufficient funds'
			//  : res < event.amount ? 'insufficient funds'
			//  : 'amount authorised';
			return payeeId
 }
