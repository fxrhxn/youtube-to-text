//Require watson, and fs, to start.

//TEST OUT WATSON, AND GET THE JSON RESULTS.

var speech_to_text = watson.speech_to_text({
  username: 'ENTER API USERNAME',
  password: 'ENTER API PASSWORD',
  version : 'v1'
});


speech_to_text.getModels(null, function(error, models) {
  if (error){
    console.log('error:', error);
  }else{
    console.log(JSON.stringify(models, null, 2));
  }
});
