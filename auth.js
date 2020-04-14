const express = require('express');
const sls = require('serverless-http');
const app = express();
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const generator = require('generate-password');
let config = require('./config');
const Rehive = require('rehive');
var functions = require('./func');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.post('/signup', async (req, res) => {  
	const { firstname, lastname, mobile, email, pincode } = req.body;
  	if ((pincode === undefined) || (firstname === undefined) || (lastname === undefined) || (mobile === undefined) || (email === undefined)) {
    	return res.status(403).json(functions.apiResponseData(false, 'Invalid api param', 0));
  	}

	if(pincode.length > 4)
    	return res.status(403).json(functions.apiResponseData(false, 'Your PIN must have a total of 4 numbers.', 0));

  	const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  	if(!emailRegexp.test(email))
    	return res.status(403).json(functions.apiResponseData(false, 'Invalid Email format', 0));

	const password = generator.generate({
	  	length: 10,
	  	numbers: true
	});

  	const timestamp = new Date().getTime();
  	const token = jwt.sign({mobile: mobile, password : password, iat: timestamp}, config.secret);

	if(token){
		const rehive = new Rehive(config.rehiveconfig);
		rehive.auth.register({
		    first_name: firstname,
		    last_name: lastname,
		    email: email,
		    mobile: mobile,
		    company: config.rehivecompid,
		    password1: password,
		    password2: password,
		}).then(function(user){
		  	var postData = {
				firstname : firstname,
				lastname : lastname,
				email : email,
				mobile : mobile,
				pincode : pincode,
				'token': token
			};
		  	return res.status(200).json({status: true, data: postData});
		},function(err){
			return res.status(403).json(functions.apiResponseData(false, err, 0));
		});
	} else {
		return res.status(403).json(functions.apiResponseData(false, 'Unable to create Token', 0));
	}
});

app.post('/signin', async (req, res) => {
 	const { token } = req.body;
	if ((token === undefined)) {
  		return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  	}

  	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
		  	return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
		} else {
			const mobile = decoded.mobile;
			const password = decoded.password;
			const rehive = new Rehive(config.rehiveconfig);

			rehive.auth.login({
				user: mobile,
				company: config.rehivecompid,
				password: password
			}).then(function(user){
				var postData = {
					firstname : user.user.first_name,
					lastname : user.user.last_name,
					email : user.user.email,
					mobile : mobile,
					'token': token
				};
				console.log(user);
				return res.status(200).json({status: true, data: postData});
			},function(err){
				console.log(err);
			  	return res.status(403).json(functions.apiResponseData(false, err, 0));
			})

		}
  	});
});

module.exports.submit = sls(app);