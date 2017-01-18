"use strict";
const Events = require( "events" );

class StatsMetter extends Events {
  constructor() {
    super();
    
    this._stats = {};
    this._waitings = {};
  }

  start( packetName, IOBlocking )
  {
    if ( this._stats[ packetName ] &&  !this._stats[ packetName ].done )
    {
      console.log( "=======" );
      console.log( "Try to start a new waiting packet, but the previous one is not over:: " + packetName );
      console.log( "HELP: try to give different names, or set IOBlocking true to be sure each request is over before an other one" );
      return;
    }

    this._stats[ packetName ] = {
      all: [], // get all timestamp for each clients, allow calculating the average at the end
      min: undefined, // minimum time
      max: undefined, // maximum time
      average: 0,
      //remaining: 0, // how many client remaining from this packet
      IOBlocking: IOBlocking,
      start: Date.now(),
      done: false
    }
  }

  // start a packet for a single user (send and expect answer directly)
  startExpect( packetName, IOBlocking, expectingAnswer )
  {
    if ( this._stats[ packetName ] )
      return ++this._stats[ packetName ].remaining;

    this._stats[ packetName ] = {
      all: [],
      min: undefined,
      max: undefined,
      average: 0,
      remaining: 1
    }
  }

  waiting( packet )
  {
    if ( this._waitings[ packet ] === undefined )
      this._waitings[ packet ] = 0;
    ++this._waitings[ packet ];
    // console.log( "waiting " + packet + ": " + this._waitings[ packet ] );
  }

  received( clientId, packet, time )
  {
    var pkStat = this._stats[ packet ];

    if ( !pkStat )
      return;
    
    var latency = time - pkStat.start;
    pkStat.all.push( latency );
    pkStat.average += latency;

    if ( !pkStat.min || latency < pkStat.min )
      pkStat.min = latency;
    if ( !pkStat.max || latency > pkStat.max )
      pkStat.max = latency;
    
    if ( this._waitings[ packet ] !== undefined && --this._waitings[ packet ] <= 0 )
    {
      var average = pkStat.average / pkStat.all.length >> 0;
      console.log( "Waiting for packet " + packet + " is over. Stats:" );
      console.log( "Min time: " + pkStat.min );
      console.log( "Max time: " + pkStat.max );
      console.log( "Avg time: " + average );
      
      if ( pkStat.IOBlocking )
        this.emit( "runScenarios" );
    }
  }
};

module.exports = new StatsMetter();