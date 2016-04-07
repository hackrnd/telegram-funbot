//lightweight web server
var express = require('express');

//Middleware to parse req body
var bodyParser = require('body-parser');

//Telegram bot controller imported as module
var botCtrl = require('./tgBotCtrl');

var app = express();

// parse req with content-type application/json
app.use(bodyParser.json());


app.post('/', function(req, res){
	console.log(req.body);
	botCtrl.routeRequest(req, res);
});


app.listen(process.env.VCAP_APP_PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});

