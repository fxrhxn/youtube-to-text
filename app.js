var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var colors = require('colors');
var mp3 = require('youtube-mp3');
var dragDrop = require('drag-drop');
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest : 'public/uploads/'});
var watson = require('watson-developer-cloud');
var server = require('http').Server(app);
var io = require('socket.io')(server);

mongoose.connect('mongodb://localhost/youtube-saver');

var YoutubeSchema = new mongoose.Schema({
  url : String,
  text : String
});

var Youtube = mongoose.model('Videos', YoutubeSchema);

//Setting view engine, and body parser.
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//This is the home test page.
app.get('/', function(req,res){

  if(typeof(query) == 'undefined'){
    var query = 'https://www.youtube.com/watch?v=sklFbxeEqLY';
    var url = query.substr(32);
  }else{
    var query = req.query.youtube;
    var url = query.substr(32);
  }
res.render('index', {url : url , query : query});
});

var cpUpload = upload.fields([{ name: 'test.mp3' }])

app.post('/upload', upload.any() , function(req,res,next){

//This is what gets the files, and lets you see what you uploaded.
var fileName = req.files;

//Put all the filenames in a loop so we can print them.
fileName.forEach(function(file){
  nameOfFile = file.originalname;
  var numberFile = file.filename;
//Gets the unique path location for each saved file.
var pathLocation = './public/uploads/' + numberFile;

//Renames the paths with a .mp3 tag.
fs.rename(pathLocation, './public/uploads/' + nameOfFile + '.mp3', function(err) {
    if ( err ) console.log('ERROR: ' + err);
});

//variable that stores the new file with the .mp3 tag.
var newFile = './public/uploads/' + nameOfFile + '.mp3';

res.render('stream', {nameOfFile : nameOfFile});

//Set the API keys so you can activate watson.
var speech_to_text = watson.speech_to_text({
  username: 'ENTER API USERNAME',
  password: 'ENTER API PASSWORD',
  version : 'v1'
});

//INSERT AN API KEY FROM cloudconvert.com here
  var cloudconvert = new (require('cloudconvert'))('INSERT API KEY!!!');

  fs.createReadStream(newFile)
  .pipe(cloudconvert.convert({
      inputformat: 'mp3',
      outputformat: 'flac',
      converteroptions: {
          quality : 75,
      }
   }))
  .pipe(fs.createWriteStream('./watson/flac/' + nameOfFile + '.flac')).on('finish', function() {
      console.log('Converted MP3 to Flac!');

      //res.redirect('/stream');

      var dataData = "";
   var readStream = fs.createReadStream('./watson/flac/' + nameOfFile + '.flac')
        .pipe(speech_to_text.createRecognizeStream({ content_type: 'audio/flac' })).on('data', function(chunk){
          dataData += chunk;
          console.log(dataData);
          io.sockets.emit('tweets', {twit : dataData});
          //dataData.replace('NaN', '-->');
          dataData = '';


      }).on('end', function(){
      //Your stream is done. Now do something.
        console.log(dataData);

      });
    });
  });
});

app.get('/clearStream', function(req,res){
  readStream.close();
  res.redirect('/');
})

app.get('/moreVideos', function(req,res){
    var query = req.query.youtube;
    var url = query.substr(32);
    res.render('index', {url : url , query : query});
  });

app.get('/download/:id', function(req,res){
    mp3.download('https://www.youtube.com/watch?v=' + req.params.id, function(err) {
        if(err){
          console.log(err);
        }else{
          res.redirect('/');
        }
    });
  });

app.get('/stream', function(req,res){
  res.render('stream');
});

app.get('/loadingPage', function(req,res){
  res.send('This is currently a loading page while your MP3 gets converted so watson can read it.');
});

server.listen('3000', function(){
    console.log('========================'.blue);
    console.log(' Listening on port 3000'.red);
    console.log('========================='.blue);
  });
