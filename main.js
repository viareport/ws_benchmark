"use strict";

const Client = require( "./Client" );
const statsMetter = require( "./statsMetter" );

const jsonConfig = require( "./config" );

const SCENARIOS = jsonConfig.scenarios;
const CONFIG = jsonConfig.connectionConfig;
var TOTAL_USERS = jsonConfig.start_users;

// TODO
// var CURRENT_USERS_RAMP = jsonConfig.start_users;

// TODO: ramp, unramp, wait interval ...

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