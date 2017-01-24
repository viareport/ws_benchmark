const WebSocket = require( "ws" ); // npm ws
const statsMetter = require( "./statsMetter" );
const REST_Api = require( "./REST_Api" );

function Client( index, wsOpts )
{
  this.id = "uid-" + index;
  this.ws  = null;
  this._queue = [];
  this._queuePos = 0;

  this.waitingFor = [];

  this.wsUseJSON = wsOpts ? wsOpts.useJson : false;
  this.wsPacketAttributeName = wsOpts ? wsOpts.packetAttributeName : undefined;
}

var _knownMethods = [ "post", "get", "put", "delete" ];
// execute l'action suivante
Client.prototype.play = function( scenario )
{
  var sc = scenario; //this._queue[ this._queuePos++ ];

  switch( sc.action.toLowerCase() )
  {
    case "waitingfor":
      statsMetter.waiting( sc.message );
      this.waitingFor.push( sc.message );
      break;
    
    case "send":
      this.ws.send( sc.data );
      if ( sc.returnPacket )
        statsMetter.start( sc.returnPacket, sc.IOBlocking );
      else if ( sc.expect )
        statsMetter.startExpect( sc.expect, sc.IOBlocking, true );
      break;
    
    case "rest":
      if ( _knownMethods.indexOf( sc.method.toLowerCase() ) === -1 )
        throw "Unkown method " + sc.method + " check your config";
      
      if ( sc.metterBefore && sc.returnPacket )
        statsMetter.start( sc.returnPacket, sc.IOBlocking );
      else if ( sc.metterBefore && sc.expect )
        statsMetter.startExpect( sc.expect, sc.IOBlocking, true );
        
      console.log( "REST call " + sc.method + ":" + sc.url );
      REST_Api[ sc.method.toLowerCase() ]( sc.url, sc.options )
        .then( () => {
          console.log( "REST call success" );
          if ( !sc.metterBefore && sc.returnPacket )
            statsMetter.start( sc.returnPacket, sc.IOBlocking );
          else if ( !sc.metterBefore && sc.expect )
            statsMetter.startExpect( sc.expect, sc.IOBlocking, true );
        } )
        .catch( err => {
          console.log( "REST call fail at " + sc.method + ":" + sc.url );
          throw err;
        } );
      break;
  }
  // TODO add action to start statMetter manually ?
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
  var messageName = packet;
  if ( this.wsUseJSON )
  {
    var data = JSON.parse( packet );
    messageName = data[ this.wsPacketAttributeName ];
  }
  // TODO detect format and parse it, actually it's only string support
  // console.log( "onmessage: ", packet );

  // le message reçu est celui que l'on attendait
  if ( this.waitingFor.indexOf( messageName ) !== -1 )
  {
    // donne le TS d'arrivé pour ensuite pouvoir calculer avec le TS de départ
    // (on a 1 client à l'origine de l'event, ce sera comparé a son timestamp d'envoi)
    // trigger qu'il a reçu sa data avec les stats
    statsMetter.received( this.id, messageName, Date.now() );
    this.waitingFor.splice( this.waitingFor.indexOf( messageName ), 1 );
  }
};

module.exports = Client;