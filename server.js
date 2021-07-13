require("dotenv").config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
const Routes = require("./app/routes");   
const path =  require('path');
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use([
  cors(),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: false }), 
  Routes,  
]);



const io = (module.exports.io = require('socket.io')(server, { 
  cors: {
      origin: '*',
  }
}));
const socketManager = require("./app/socketManager");
io.on("connection", socketManager);

var cachedToken = null;

function getNewToken () {
  twilio.tokens.create({}, function(err, token) {
    if (!err && token) {
      cachedToken = token;
    }
  });
}

// fetch token initially
getNewToken();
// refetch new token every 15 mins and save to cache
setInterval(getNewToken, 1000*60*10);

app.get('/api/get-icserver', function (req, res) {
  if (!cachedToken) {
    res.send(400, 'Problem getting ice servers data from Twilio')
  } else {
    res.json(cachedToken.iceServers);
  }
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app USED FOR THE CONNECTIVITY PARTTT
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
