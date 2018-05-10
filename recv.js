var cheerio = require('cheerio');
var request = require('request');

/*
bir array olustur
bu arrayın icinde 2 kod olucak, bir tanesi calısan, digeri bozuk kod 
request postan dönen status code eğer 400 se tekrar recursive çagır
statusCode != 400  return [str] */

var codes = [`incomes <- c(60, 49, 40, 61, 64, 60, 59, 54, 62, 69, 70, 42, 56,
               61, 61, 61, 58, 51, 48, 65, 49, 49, 41, 48, 52, 46,
               59, 46, 58, 43)`,
               `> incomes c(60, 49, 40, 61, 64, 60, 59, 54, 62, 69, 70, 42, 56,
               61, 61, 61, 58, 51, 48, 65, 49, 49, 41, 48, 52, 46,
               59, 46, 58, 43)`]

for(var i = 0; i < codes.length; i++) {
  	recursive(codes[i])
	console.log(recursive(codes[i]))
}

function recursive(str) {
	 request.post({url:'https://dev.pranageo.com:444/raas/raas/library/base/R/parse', form: {text:str}}, 
          function(err,res) {
            if (!err && res.statusCode == 200) {
					console.log(str)
					recursive(str)            		
            } else if (!err && res.statusCode == 400) {
              		return [str];
              		console.log("bb");
            } 
      })
}

