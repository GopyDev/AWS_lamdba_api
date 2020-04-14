const express = require('express');
const sls = require('serverless-http');
const app = express();
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const generator = require('generate-password');
const config = require('./config');
const functions = require('./func');
const moment = require('moment');

const mysql = require('mysql');
const con = mysql.createConnection({
	host     : config.dbconf.RDS_HOSTNAME,
	user     : config.dbconf.RDS_USERNAME,
	password : config.dbconf.RDS_PASSWORD,
	port     : config.dbconf.RDS_PORT,
	database : config.dbconf.RDS_DATABASE_1
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/getProducts', (req, res) => {
	const { token } = req.query;
	if ((token === undefined)) {
  		return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  	}

  	jwt.verify(token, config.secret, async (err, decoded) => {
		if (err) {
		  	return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
		} else {
			try {
				var mobile = decoded.mobile;
				var favoriteProducts = await functions.getFavoriteProducts(mobile, con);
				if(favoriteProducts == undefined){
					return res.status(403).json(functions.apiResponseData(false, 'getFavorite - Internal server error', 0));
				}
				for (var j = favoriteProducts.length - 1; j >= 0; j--) {
					favoriteProducts[j].isFavorite = true;
				};

				const sql = "SELECT * FROM products WHERE id NOT IN (SELECT assetsid FROM favorite WHERE mobile='"+mobile+"') AND (category='products')";
				con.query(sql, function (error, result) {
					if (error)
						return res.status(403).json(functions.apiResponseData(false, error, 0));

					var products = [];
					for (var i = 0; i < result.length; i++) {
							if(result[i].id==1 || result[i].id==2){
								result[i].isFavorite = false;
								products.push(result[i]);
							} else {
								result[i].isFavorite = false;
								favoriteProducts.push(result[i]);
							}
					};

					if(favoriteProducts.length > 0)
						products = products.concat(favoriteProducts);

					return res.status(200).json({status: true, banners: aryBanners});
				});
		  	} catch(errr) {
		    	return res.status(403).json(apiResponseData(false, errr.message, 4));
		  	}
		}
  	});
})

app.get('/getBanners', (req, res) => {
	const { token } = req.query;
	if ((token === undefined)) {
  		return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  	}

  	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
		  	return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
		} else {
			const sql = "SELECT * FROM adverting WHERE category='banner'";
			con.query(sql, function (err, result) {
				if (err) 
					return res.status(403).json(functions.apiResponseData(false, err, 0));
				var aryBanners = [];
				for (var i = 0; i < result.length; i++) {
					aryBanners.push(result[i].image);
				};
				return res.status(200).json({status: true, banners: aryBanners});
			});
		}
  	});
})

app.get('/getAdBanners', (req, res) => {
	const { token } = req.query;
	if ((token === undefined)) {
  		return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  	}

  	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
		  	return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
		} else {
			const sql = "SELECT * FROM adverting WHERE category='advertisement'";
			con.query(sql, function (err, result) {
				if (err) 
					return res.status(403).json(functions.apiResponseData(false, err, 0));
				var aryAdvertisements = [];
				for (var i = result.length - 1; i >= 0; i--) {
					aryAdvertisements.push(result[i].image);
				};
				return res.status(200).json({status: true, Advertisements : aryAdvertisements});
			});
		}
  	});
})

app.post('/favorite', async (req, res) => {
 	const { token, productid } = req.body;

	if ((token === undefined) || (productid === undefined)) {
  		return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  	}

 	jwt.verify(token, config.secret, async (err, decoded) => {
		if (err) {
		  	return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
		} else {
			var productDetails = await functions.getProductDetail(productid, con);
			if(productDetails == undefined || productDetails.length==0){
				return res.status(403).json(functions.apiResponseData(false, 'Does not exist this product.', 0));
			}
			var mobile = decoded.mobile;
			var isfavoriteProd = await functions.isfavoriteProduct(mobile, productid, con);
			if(isfavoriteProd == undefined || isfavoriteProd.length==0){
				var sql = "INSERT INTO favorite (mobile, assetsid) VALUES('"+mobile+"', "+ productid+")";
				con.query(sql, function (error, result) {
					if (error)
						return res.status(403).json(functions.apiResponseData(false, error, 0));
					return res.status(200).json({status: true, message : "This product is added as favorite"});
				});
			} else {
				var currentid = isfavoriteProd[0].id;
				if(currentid == undefined){
					return res.status(200).json(functions.apiResponseData(false, 'Failed to fetch favorite product.', 0));
				} else {
					var curtime = moment().format('YYYY-MM-DD HH:mm:ss')
					var sql = "UPDATE favorite SET assetsid = "+productid+", updateddate='"+curtime+"' WHERE id = "+currentid;
					con.query(sql, function (error, result) {
						if (error)
							return res.status(403).json(functions.apiResponseData(false, error, 0));
						return res.status(200).json({status: true, message : "This product is added as favorite"});
					});
				}
			}
		}
  	});
})

app.get('/getfavoriteList', (req, res) => {
	const { token } = req.query;
	if ((token === undefined)) {
  		return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  	}

  	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
		  	return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
		} else {
			var mobile = decoded.mobile;

			const sql = "SELECT products.* FROM favorite INNER JOIN products ON products.id=favorite.assetsid WHERE mobile='" + mobile + "' ORDER BY updateddate DESC";
			con.query(sql, function (err, result) {
				if (err) 
					return res.status(403).json(functions.apiResponseData(false, err, 0));
				return res.status(200).json({status: true, favoriteProducts : result});
			});
		}
  	});
})

app.get('/browseAdBanners', (req, res) => {
	const sql = "SELECT * FROM advertings";
	con.query(sql, function (err, result) {
		if (err) 
			return res.status(403).json(functions.apiResponseData(false, err, 0));
		var aryAdvertisements = [];
		var aryBanners = [];
		var aryProducts = [];
		for (var i = 0; i < result.length; i++) {
			if(result[i].category == "advertisement")
				aryAdvertisements.push(result[i].image);
			else if(result[i].category == "banner")
				aryBanners.push(result[i].image);
		};

		return res.status(200).json({status: true, Banners: aryBanners, Advertisements : aryAdvertisements});
	});
})

app.get('/browseProducts', (req, res) => {
	const sql = "SELECT * FROM products";
	con.query(sql, function (err, result) {
		if (err) 
			return res.status(403).json(functions.apiResponseData(false, err, 0));
		var aryAdvertisements = [];
		var aryBanners = [];
		var aryProducts = [];
		for (var i = 0; i < result.length; i++) {
			if(result[i].category == "advertisement")
				aryAdvertisements.push(result[i].image);
			else if(result[i].category == "banner")
				aryBanners.push(result[i].image);
			else if(result[i].category == "products")
				aryProducts.push(result[i]);
		};

		return res.status(200).json({status: true, Products : aryProducts });
	});
})

app.get('/getCharities', (req, res) => {
	const sql = "SELECT * FROM charity";
	con.query(sql, function (err, result) {
		if (err) 
			return res.status(403).json(functions.apiResponseData(false, err, 0));
		return res.status(200).json({status: true, Charities: result});
	});
})

module.exports.submit = sls(app);