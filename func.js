module.exports = {
	apiResponseData : function(bResult, msg, errType) {
		const repData = {
			'status': bResult,
			'message': msg,
			'errorType': errType
		};
		return repData;
	},
	getFavoriteProducts : function (mobile, con) {
		return new Promise((resolve, reject) => {
			const sql = "SELECT products.* FROM favorite INNER JOIN products ON products.id=favorite.assetsid WHERE mobile='" + mobile + "' AND favorite.assetsid<>1 AND favorite.assetsid<>2 ORDER BY updateddate DESC";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	getProductDetail : function (productid, con) {
		return new Promise((resolve, reject) => {
			const sql = "SELECT * FROM products WHERE id= "+ con.escape(productid) +" AND category='products'";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	isfavoriteProduct : function (mobile, productid, con) {
		return new Promise((resolve, reject) => {
			const sql = "SELECT * FROM favorite WHERE mobile=" + con.escape(mobile) + " AND assetsid="+con.escape(productid)+"";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	getBalance : function (userid, con) {
		return new Promise((resolve, reject) => {
			const sql = "SELECT balance FROM transactions WHERE participantid=" + con.escape(userid) + " ORDER BY created_on DESC LIMIT 1";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	getUserId : function (token, con) {
		return new Promise((resolve, reject) => {
			const sql = "SELECT id FROM user_dictionary WHERE token=" + con.escape(token) + " ";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	getPayeeId : function (mobile, con) {
		return new Promise((resolve, reject) => {
			const sql = "SELECT id FROM user_dictionary WHERE mobile=" + con.escape(mobile) + " ";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	postCreditCustomer : function (data, con) {
		return new Promise((resolve, reject) => {
      const sql = "INSERT INTO transactions (participantid, correlationid, productid, type, amount, status, balance, donated, previoustransactioncreated_on, previousbalance, previousdonated) SELECT " + con.escape(data.participantid) + "," + con.escape(data.correlationid) + ", " + con.escape(data.productid) + ", " + con.escape(data.type) + ", " + con.escape(data.amount) + ", 'debited', balance - " + con.escape(data.amount) + ", donated + " + con.escape(data.amountDonated) + ", created_on, balance, donated FROM transactions WHERE participantid = " + con.escape(data.userid) + " ORDER BY created_on DESC LIMIT 1";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	postCreditMerchant : function (data, con) {
		return new Promise((resolve, reject) => {
			const sql = "INSERT INTO transactions (participantid, correlationid, productid, type, amount, status, balance, donated, previoustransactioncreated_on, previousbalance, previousdonated) SELECT " + con.escape(data.participantid) + "," + con.escape(data.correlationid) + ", " + con.escape(data.productid) + ", " + con.escape(data.type) + ", " + con.escape(data.amount) + ", 'credited', balance + " + con.escape(data.amount) + " - " + con.escape(data.amountDonated) + ", donated + " + con.escape(data.amountDonated) + ", created_on, balance, donated FROM transactions WHERE participantid = " + con.escape(data.merchantid) + " ORDER BY created_on DESC LIMIT 1";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	postCreditNonprofit : function (data, con) {
		return new Promise((resolve, reject) => {
			const sql = "INSERT INTO transactions (participantid, correlationid, productid, type, amount, status, balance, previoustransactioncreated_on, previousbalance) SELECT " + con.escape(data.participantid) + "," + con.escape(data.correlationid) + ", " + con.escape(data.productid) + ", " + con.escape(data.type) + ", " + con.escape(data.amountDonated) + ", 'credited', balance + " + con.escape(data.amountDonated) + ", created_on, balance FROM transactions WHERE participantid = " + con.escape(data.nonprofitid) + " ORDER BY created_on DESC LIMIT 1";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	postCreditCustomerCancel : function (data, con) {
			return new Promise((resolve, reject) => {
	      const sql = "INSERT INTO transactions (participantid, correlationid, productid, type, amount, status, balance, donated, previoustransactioncreated_on, previousbalance, previousdonated) SELECT " + con.escape(data.participantid) + "," + con.escape(data.correlationid) + ", " + con.escape(data.productid) + ", " + con.escape(data.type) + ", " + con.escape(data.amount) + ", 'cancelled', balance + " + con.escape(data.amount) + ", donated - " + con.escape(data.amountDonated) + ", created_on, balance, donated FROM transactions WHERE participantid = " + con.escape(data.userid) + " ORDER BY created_on DESC LIMIT 1";
				con.query(sql, function (err, result) {
					if (err)
						return reject(err);
					return resolve(result);
				});
			});
		},
	postCreditMerchantCancel : function (data, con) {
		return new Promise((resolve, reject) => {
			const sql = "INSERT INTO transactions (participantid, correlationid, productid, type, amount, status, balance, donated, previoustransactioncreated_on, previousbalance, previousdonated) SELECT " + con.escape(data.participantid) + "," + con.escape(data.correlationid) + ", " + con.escape(data.productid) + ", " + con.escape(data.type) + ", " + con.escape(data.amount) + ", 'cancelled', balance - " + con.escape(data.amount) + " + " + con.escape(data.amountDonated) + ", donated - " + con.escape(data.amountDonated) + ", created_on, balance, donated FROM transactions WHERE participantid = " + con.escape(data.merchantid) + " ORDER BY created_on DESC LIMIT 1";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	postTransferPayer : function (data, con) {
		return new Promise((resolve, reject) => {
			const sql = "INSERT INTO transactions (participantid, correlationid, productid, type, amount, status, balance, previoustransactioncreated_on, previousbalance) SELECT " + con.escape(data.participantid) + "," + con.escape(data.correlationid) + ", " + con.escape(data.productid) + ", " + con.escape(data.type) + ", " + data.amount + ", 'debited', balance - " + data.amount + ", created_on, balance FROM transactions WHERE participantid = " + con.escape(data.userid) + " ORDER BY created_on DESC LIMIT 1";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	postTransferPayee : function (data, con) {
		return new Promise((resolve, reject) => {
			const sql = "INSERT INTO transactions (participantid, correlationid, productid, type, amount, status, balance, previoustransactioncreated_on, previousbalance) SELECT " + con.escape(data.participantid) + "," + con.escape(data.correlationid) + ", " + con.escape(data.productid) + ", " + con.escape(data.type) + ", " + con.escape(data.amount) + ", 'credited', balance + " + con.escape(data.amount) + ", created_on, balance FROM transactions WHERE participantid = " + con.escape(data.payeeid) + " ORDER BY created_on DESC LIMIT 1";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	postTransferPayerCancel : function (data, con) {
		return new Promise((resolve, reject) => {
			const sql = "INSERT INTO transactions (participantid, correlationid, productid, type, amount, status, balance, previoustransactioncreated_on, previousbalance) SELECT " + con.escape(data.participantid) + "," + con.escape(data.correlationid) + ", " + con.escape(data.productid) + ", " + con.escape(data.type) + ", " + con.escape(data.amount) + ", 'credited', balance + " + con.escape(data.amount) + ", created_on, balance FROM transactions WHERE participantid = " + con.escape(data.userid) + " ORDER BY created_on DESC LIMIT 1";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	getFees : function (merchantid, con) {
		return new Promise((resolve, reject) => {
			const sql = "SELECT fee FROM txn_fee WHERE mid= "+ con.escape(merchantid) +"";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},
	postEventLog : function(event, con) {
		return new Promise((resolve, reject) => {
			const sql = "INSERT INTO event_log (correlationid, event_data) VALUES('"+event.correlationid+"', '"+ event+"')";
			con.query(sql, function (err, result) {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},

	s3Put : function(request,client) {
		return new Promise((resolve, reject) => {
			client.putObject(request, (err, result) => {
				if (err)
					return reject(err);
				return resolve(result);
			});
		});
	},

	s3CeatePutJsonRequest: function(location, filename, contents) {
		const request = {
			Bucket: location,
			Key: filename,
			Body: contents,
			ContentType: 'application/json; charset=utf-8',
			ACL: 'private',
			CacheControl: 'max-age=60'
		};
		return request;
	},
	deleteRow : function(arr, row) {
	   arr = arr.slice(0);
	   arr.splice(row - 1, 1);
	   return arr;
	}
};
