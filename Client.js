const WebSocket = require( "ws" ); // npm ws
const statsMetter = require( "./statsMetter" );

function Client( index )
{
  this.id = "uid-" + index;
  this.ws  = null;
  this._queue = [];
  this._queuePos = 0;

  this.waitingFor = [];
}

// execute l'action suivante
Client.prototype.play = function( scenario )
{
  var sc = scenario; //this._queue[ this._queuePos++ ];

  if ( sc.action === "waitingFor" )
  {
    statsMetter.waiting( sc.message );
    this.waitingFor.push( sc.message );
  }
  else if ( sc.action === "send" )
  {
    if ( sc.returnPacket )
      statsMetter.start( sc.returnPacket, sc.IOBlocking );
    else if ( sc.expect )
      statsMetter.startExpect( sc.expect, sc.IOBlocking, true );

    this.ws.send( sc.data );
  }
  // TODO add action to start statMetter manually 
};

Client.prototype.start = function( url, options )
{
  this.ws = new WebSocket( url, options );
  var self = this;
  this.ws.on( "open", function()
  {
    self.onConnectionSuccess();
    // socket is ready
    // self.ws.off( "error" );
    self.ws.on( "error", function( err )
    {
      throw "A socket crashed for the following reason: " + err;
    } );
  }, this );
  this.ws.once( "error", function( err )
  {
    // err.code
    // error => close it ?
    self.onConnectionFail( err );
  } );

  this.ws.on( "message", function(){ self.onmessage.apply( self, arguments ); } );
};

Client.prototype.onConnectionSuccess = function(){}
Client.prototype.onConnectionFail = function( err )
{
  throw "Client connection error: " + err;
};

Client.prototype.onmessage = function( packet )
{
  // detect format
  // console.log( "onmessage: ", packet );

  // le message reçu est celui que l'on attendait
  if ( this.waitingFor.indexOf( packet ) !== -1 )
  {
    // donne le TS d'arrivé pour ensuite pouvoir calculer avec le TS de départ
    // (on a 1 client à l'origine de l'event, ce sera comparé a son timestamp d'envoi)
    // trigger qu'il a reçu sa data avec les stats
    statsMetter.received( this.id, packet, Date.now() );
    this.waitingFor.splice( this.waitingFor.indexOf( packet ), 1 );
  }
};

module.exports = Client;