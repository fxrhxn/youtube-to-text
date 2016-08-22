



//TEST OUT THE STREAM FUNCTIONALITY HERE


var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var ss = require('socket.io-stream');
var watson = require('watson-developer-cloud');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/watson-test');

var watsonSchema = mongoose.Schema({
  text : String
});

var WatsonFull = mongoose.model('Watson', watsonSchema);
//Shows if the connections are saved, or not saved, and it gets appended into this array below.
var connections = [];

//Testing out watson.
var speech_to_text = watson.speech_to_text({
  username: 'ENTER USERNAME',
  password: 'ENTER PASSWORD',
  version : 'v1'
});

var params = {
  // From file
  audio: fs.createReadStream('./watson/flac/startups.flac'),
  content_type: 'audio/flac'
};

app.set('view engine', 'ejs');

app.get('/' , function(req,res){

///================================
//Here is the code that works copy and paste to try it out motherfucker. ...
var dataData = '';
var readStream = fs.createReadStream('./watson/flac/startups.flac')
  .pipe(speech_to_text.createRecognizeStream({ content_type: 'audio/flac' })).on('data', function(chunk){
    dataData += chunk;
    //console.log(dataData);
    io.sockets.emit('tweets', {twit : dataData});
    //dataData.replace('NaN', '-->');
    dataData = '';
}).on('end', function(){
//Your stream is done. Now do something.
  console.log(dataData);

});
//=====================================

   res.render("stream");
});

app.get('/clearStream', function(req,res){
  readStream.close();
  res.redirect('/');
})

//When I refresh the page, the stream starts. Interesting.

server.listen("3000", function(){
  console.log('------------------------');
  console.log(' Listening on PORT 3000');
  console.log('------------------------');

});
