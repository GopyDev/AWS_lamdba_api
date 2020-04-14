const express = require('express');
const sls = require('serverless-http');
const app = express();
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const generator = require('generate-password');
let config = require('./config');
var functions = require('./func');
var AWS = require('aws-sdk');

const stepFunctions = new AWS.StepFunctions();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))


app.post('/create.credit', async (req, res) => {
  const {
    token,
    userid,
    productid,
    type,
    amount,
    merchantid,
    nonprofitid
  } = req.body;
  if ((token === undefined)) {
    return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
    } else {
      const input = {
        token: token,
        userid: userid,
        productid: productid,
        type: "purchase",
        amount: amount,
        merchantid: merchantid,
        nonprofitid: nonprofitid
      };
      const inputJSON = JSON.stringify(input);

      const params = {
        stateMachineArn: 'arn:aws:states:us-east-1:596555505216:stateMachine:appCreateCredit',
        input: inputJSON
      };
      stepFunctions.startExecution(params, (err, data) => {
        if (err) {
        console.log(err);
        return res.status(403).json(functions.apiResponseData(false, err, 0));
      } else {
        console.log(data);
        return res.status(200).json({status: true, data});
      }
    });
  }
  });
});

app.post('/create.transfer', async (req, res) => {
  const {
    token,
    userid,
    productid,
    type,
    amount,
    payee_mobile,
  } = req.body;
  if ((token === undefined)) {
    return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
    } else {
      const input = {
        token: token,
        userid: userid,
        productid: productid,
        type: "transfer",
        amount: amount,
        payee_mobile: payee_mobile,
      };
      const inputJSON = JSON.stringify(input);

      const params = {
        stateMachineArn: 'arn:aws:states:us-east-1:596555505216:stateMachine:appCreateTransfer',
        input: inputJSON
      };
      stepFunctions.startExecution(params, (err, data) => {
        if (err) {
        console.log(err);
        return res.status(403).json(functions.apiResponseData(false, err, 0));
      } else {
        console.log(data);
        return res.status(200).json({status: true, data});
      }
    });
  }
  });
});

app.post('/create.status', async (req, res) => {
  const {
    token,
    arn
  } = req.body;
  if ((token === undefined)) {
    return res.status(200).json(functions.apiResponseData(false, 'Invalid api param', 0));
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).json(functions.apiResponseData(false, 'Token is not valid', 0));
    } else {
      const input = {
        arn: arn,
      };
      // const inputJSON = JSON.stringify(input);

      const params = {
        "executionArn": input.arn
      };
      stepFunctions.describeExecution(params, (err, data) => {
        if (err) {
        console.log(err);
        return res.status(403).json(functions.apiResponseData(false, err, 0));
      } else {
        console.log(data);
        return res.status(200).json({status: true, data});
      }
    });
  }
  });
});


module.exports.submit = sls(app);
