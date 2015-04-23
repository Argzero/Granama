// Dependencies
var url = require('url');
var path = require('path'); 
var express = require('express');  
var favicon = require('serve-favicon'); 
var bodyParser = require('body-parser');
var compression = require('compression');  
var session = require('express-session');
var cookieParser = require('cookie-parser');  

// Mongo setup
var mongoose = require('mongoose'); 
var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/Granama";
var db = mongoose.connect(dbURL, function(err) 
{
    if(err) 
    {
        console.log("Could not connect to database");
        throw err;
    }
});
 
// Express setup
var app = express(); 
app.use('/assets', express.static(path.resolve(__dirname+'../../client/'))); 
app.use(compression()); 
app.use(bodyParser.urlencoded({ 
    extended: true                
})); 
              
app.set('view engine', 'jade'); 
app.set('views', __dirname + '/views'); 
app.use(favicon(__dirname + '/../client/favicon.ico')); 
app.use(cookieParser()); 

// Redis setup
var RedisStore = require('connect-redis')(session);
var redisPASS;
var redisURL = {
    hostname: 'localhost',
    port: 6379
};

if(process.env.REDISCLOUD_URL) 
{
    redisURL = url.parse(process.env.REDISCLOUD_URL);
    redisPASS = redisURL.auth.split(":")[1];
}

app.use(session({
    store: new RedisStore({
        host: redisURL.hostname,
        port: redisURL.port,
        pass: redisPASS
    }),
    secret: 'Magrana', //shhh it's a secret
    resave: true,
    saveUninitialized: true
}));  

// Router setup
var router = require('./router.js')(app); 

// HTML server setup
var port = process.env.PORT || process.env.NODE_PORT || 3000; 

var server = app.listen(port, function(err) { 
    if (err)
    {
        throw err;
    }
    console.log('Listening on port ' + port);
});

// Granama server setup
var granama = require('./server.js')(server);