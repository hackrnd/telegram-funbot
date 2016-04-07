//HTTP client - https://www.npmjs.com/package/request
var request = require("request");

var fs = require("fs");


var tgBot = {
		token : "xxx",
		keyboard : {"keyboard": [["Photo", "Quote"], 
	                             ["Rajnikant Fact"]],
					"one_time_keyboard": false, 
					"resize_keyboard": true}
};

var mashapeKey = "xxx";


module.exports = {
		
	routeRequest: function(req, res){
		if (req.body.message.text.lastIndexOf('/start', 0) === 0) {
			return this.sendTelegramText(req, res, 'Welcome! Please select an option from below menu.');
		}else if (req.body.message.text.lastIndexOf('Photo', 0) === 0) {
			return this.sendTelegramPhoto(req, res, "https://unsplash.it/200/200/?random");
		}else if (req.body.message.text.lastIndexOf('Quote', 0) === 0) {
			return this.sendQuote(req, res);
		}else if (req.body.message.text.lastIndexOf('Rajnikant Fact', 0) === 0) {
			return this.sendRajniFact(req, res);
		}else{
			return this.sendTelegramText(req, res, 'Command not found');	
		}
    },
		
   sendQuote: function(req, res){
	var message = '';
	self = this;
		
	request.post({
		url: "https://andruxnet-random-famous-quotes.p.mashape.com",
		form: {'cat':'famous'},
		headers: {'X-Mashape-Key': mashapeKey}
	  }, function (error, response, data) {

		if (!error && response.statusCode === 200) {	
			//JSON.parse is required because response Content-Type is text/html
			data = JSON.parse(data);
			if(data && data.quote){
				message = data.quote;
			}else{ 
				message = "Quote API failed. Please try again later.";
			}
		}else{
			message = "Quote API is unavailable.";
		}
		self.sendTelegramText(req, res, message);
	  });	
  },
  
  sendRajniFact: function(req, res){
	var message = '';
	self = this;
	
	request({
		url: "http://api.irkfdb.in/facts/random",
		json: true,
		headers: {'User-Agent' : 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'}
	  }, function (error, response, data) {

		if (!error && response.statusCode === 200) {				
			if(data.resultSet && data.resultSet.data && data.resultSet.data.length > 0){
				data = data.resultSet.data[0];
				message = data.fact;
			}else{ 
				message = "Fact API failed. Please try again later.";
			}
		}else{
			message = "Fact API is unavailable.";
		}
		self.sendTelegramText(req, res, message);
	  });	
  },
  
  sendTelegramText: function (req, res, text){
	  var chatId = req.body.message.chat.id;
	  var body = {
			  	chat_id: chatId,
			  	text: text,
			  	reply_markup: tgBot.keyboard,
			  	parse_mode: "HTML"
			  };
	 
		var options = {
		  url: 'https://api.telegram.org/bot' + tgBot.token + '/sendMessage',
		  json: true,
		  body: body
		};
		return request.post(options, function(err, response, body){
			if(err)
				return res.status(500).json({
					test: err,
					success: false,
					error: 'Error on sendMessage to telegram'
				});

			return res.json({
		      success: true,
		      error: null
		    });
		});
	},
	
	
	sendTelegramPhoto: function (req, res, photoUrl){
		
		//Download from photo service
		return request(photoUrl).pipe(fs.createWriteStream('temp.png')).on('close', function(){
		  console.log('photo downloaded');
		  var chatId = req.body.message.chat.id;
		    var formData = {
				  	chat_id: chatId,
				  	//create read stream to upload as multipart/form-data
				  	photo: fs.createReadStream('temp.png')
				  };
		 
			var options = {
			  url: 'https://api.telegram.org/bot' + tgBot.token + '/sendPhoto',
			  formData: formData
			};
			
			//Upload to telegram
			return request.post(options, function(err, response, body){
				if(err)
					return res.status(500).json({
						test: err,
						success: false,
						error: 'Error on sendMessage to telegram'
					});

				return res.json({
			      success: true,
			      error: null
			    });
			}); 
		});    	  
	}
};