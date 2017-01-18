// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.send("yohoho");
// });

// io.on('connection', function(socket){
//   console.log('a user connected');

//   socket.on( "ping", function()
//   {
//     socket.emit( "pong" );
//   } );

//   socket.on( "post-contract-modification", function()
//   {
//     socket.emit( "get-contract-modification" );
//   } );
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 3000 });
 
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

wss.on('connection', function connection(ws) {
  // console.log( "client connection !" );

  ws.on('message', function incoming(message) {
    // console.log('received: %s', message);

    switch( message )
    {
      case "ping":
        ws.send( "pong" );
        break;
      
      case "post-contract-modification":
        setTimeout( function(){ wss.broadcast( "get-contract-modification" ); }, 250 );
        break;
    }
  } );
});

console.log( "server running ?" );