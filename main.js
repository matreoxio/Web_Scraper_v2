//TODO:
//Chechk for repetition
//Create a proper veiw for Retrieved_Data - add return button, tables etc.
//Crate css
//Error handling ?
//Fix formatting and all the replace functions

//-----------------Node Modules Start----------------------
var http = require("http");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var Knwl = require('knwl.js');
var knwlInstance = new Knwl('english');
var cheerio = require('cheerio');
var request = require('request');
app.use(bodyParser.json());
//-----------------Node Modules End------------------------

//----------------Running Server Details Start-------------
//Start server and listen to port 3000
var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Server address: 127.0.0.1:3000")
});
//----------------Running Server Details End---------------


//----------------Get user Email Start---------------------
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');

});
//----------------Get user Email End---------------------


//----------------Post Collected Data Start--------------
app.post('/views/Retrieved_Data.html', urlencodedParser, function (req, res){

  //Validate users email, if email syntax is incorrect return an error
  var validate = validateEmailSyntax(req.body.email);
  if (validate == false){
    var reply='';
    reply += "Error!<br>Something went wrong, please check your email:<br>" +
    req.body.email;
    res.send(reply);
  }

  //Extract url from users email
  var Web_Url = req.body.email.split("@");

  //Extract data from url
  getData("https://www." + Web_Url[1], function(eer, response){
    var reply= {Email:response.Email,l:"<br><br>" ,Address:response.Address,
    i:"<br><br>", Phone:response.Phone_Number};
    var first = JSON.stringify(reply);
    var second = first.replace(/[{}"]/g, " ");
    var third = second.replace(/[,]/g,"<br>");
    res.send(third);
  });
 });
//----------------Post Collected Data End--------------

//--------------Validate email Syntax Start-------------
function validateEmailSyntax(email)
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
//--------------Validate email Syntax End-------------

//-----------------Get Data Start---------------------
function getData(url, callback){
  request(url,(error, response, html)=>{

    //Check for errors -> load page html -> Search for email/places
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(html);
      var body = $("body").html();
      var code = body.replace(/[<>]/g, " ");
      knwlInstance.init(code);
      var emails = knwlInstance.get('emails');
      var places = knwlInstance.get('places');

      //Get body -> Remove spaces -> remove '+' -> Remove a-z and A-Z -> llok for phone numbers
      var code = $("body").text();
      str1 = code.replace(/\s/g, '');
      str2 = str1.replace(/\+/g, '  ');
      str3 = str2.replace(/[a-zA-Z]/g, ' ');
      knwlInstance.init(str3);

      var phones = knwlInstance.get('phones');

      // Load collected data into object
      var data = {
        Email:emails,
        Address:places,
        Phone_Number:phones
      };
      //callback collected data
      callback("", data);
      //  console.log(data);
    }
  })
 }
//-----------------Get Data End-----------------------
