"use strict";

const Client = require( "./Client" );
const statsMetter = require( "./statsMetter" );

const SCENARIOS = [
  {
    "action": "send",
    "data": "ping"
  },
  {
    "action": "waitingFor",
    "message": "get-contract-modification"
  },
  {
    "target": "uid-0",
    "action": "send",
    "data": "post-contract-modification",
    "returnPacket": "get-contract-modification",
    "IOBlocking": true // will wait until all clients received the edit packet, before continuing the scenario
  }/*,
  {
    "action": "send",
    "data": "ping",
    "expect": "pong"
  },
  {
    "action": "send",
    "data": "changeProfile",
    "expect": "changeProfileSuccess",
    "IOBlocking": false
  }*/
];

// TODO gérer le timeout client dans le statmetter ?

const CONFIG = {
  url: "ws://localhost:3000",
  options: {
    protocolVersion: 8,
    origin: 'http://localhost:3000',
    headers: {
    }
  }
};


// confg lease ok
// const CONFIG = {
//   url: "ws://172.17.0.19:4567/apicontratreducer/ws",
//   options: {
//     origin: "http://172.17.0.19:4567",
//     headers: {
//       Cookie: 'RESTIT_TUTORIAL=1; PLAY_USER=CA-INATIV; PLAY_LANG=fr; PLAY_SESSION="b9af6a28b6d8a3f695ed2bcaceb8d18c9e395c90-username=ca-inativ&level=SUPERADMIN&___AT=f5b0677479b0eb30fc32dd3161874c9cacb35280"'
//     }
//   }
// };

const TOTAL_USERS = 10;
// send an action that will broadcast to everyone, get the time and then get the arrival time for each response
// {
//   "waitingFor": "on-message",
//   "expect": { id: "ui1", msg: "Hello" },
//   "dispatcher": fn
// }

var clients = {};
for ( let i = 0, client; i < TOTAL_USERS; ++i )
{
  client = new Client( i );
  clients[ client.id ] = client;
}

var remaining = TOTAL_USERS;
var connected = 0;
clients[ "uid-0" ].onConnectionSuccess = function()
{
  console.log( "first client connection success" );
  --remaining;
  ++connected;
  for ( let i in clients )
  {
    if ( i === "uid-0" )
    continue;

    clients[ i ].start( CONFIG.url, CONFIG.options );
    clients[ i ].onConnectionSuccess = function()
    {
      this.onConnectionSuccess = function(){};
      --remaining;
      ++connected;
      console.log( "connection success, " + connected + " connected, " + remaining + " remainings" );
      if ( remaining === 0 )
      {
        console.log( "all clients connected, run scenarios" );
        runScenarios();
      }
    };
  }

  if ( remaining === 0 )
    runScenarios();
};
clients[ "uid-0" ].onConnectionFail = function( err )
{
  console.log( "Cannot connect to the target server:" );
  throw err;
};

var scenarioIndex = 0;
var _checkTimeout = false;
function runScenarios()
{
  _checkTimeout = false;
  console.log( "|> run scenarios" );
  for ( var sc; sc = SCENARIOS[ scenarioIndex ]; ++scenarioIndex )
  {
    console.log( "play scenario " + scenarioIndex );
    if ( sc.target )
      clients[ sc.target ].play( sc );
    else
      broadcast( sc );
    if ( sc.IOBlocking )
    {
      ++scenarioIndex;
      _checkTimeout = true;
      setTimeout( function()
      {
        if ( !_checkTimeout )
          return;
        console.log( "Scenario " + ( scenarioIndex - 1 ) + " timed out, no answer from target server. Check your scenarios." );
        console.log( "Process terminating" );
        process.exit();
      }, 30000 );
      return;
    }
  }

  console.log( "Scenarios over, press ctrl+c for exit" );
}

function broadcast( scenario )
{
  for ( let i in clients )
    clients[ i ].play( scenario );
}

statsMetter.on( "runScenarios", runScenarios );

// connect only the first one to test the connection (and continue on events)
clients[ "uid-0" ].start( CONFIG.url, CONFIG.options );