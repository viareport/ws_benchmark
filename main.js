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
    origin: 'http://localhost:3000'
  }
};

const TOTAL_USERS = 3000;
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
clients[ "uid-0" ].onConnectionSuccess = function()
{
  --remaining;
  for ( let i in clients )
  {
    if ( i === "uid-0" )
    continue;

    clients[ i ].start( CONFIG.url, CONFIG.payload );
    clients[ i ].onConnectionSuccess = function()
    {
      this.onConnectionSuccess = function(){};
      --remaining;
      if ( remaining === 0 )
        runScenarios();
    };
  }

  if ( remaining === 0 )
    runScenarios();
};
clients[ "uid-0" ].onConnectionFail = function( err )
{
  console.log( "Cannot connect to the target server:" );
  console.log( err );
  console.log( "===" );
};

var scenarioIndex = 0;
function runScenarios()
{
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
      return;
    }
  }

  console.log( "scenarios over" );
}

function broadcast( scenario )
{
  for ( let i in clients )
    clients[ i ].play( scenario );
}

statsMetter.on( "runScenarios", runScenarios );

// connect only the first one to test the connection (and continue on events)
clients[ "uid-0" ].start( CONFIG.url, CONFIG.options );