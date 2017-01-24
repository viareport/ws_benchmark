module.exports = {
  // users created on start
  start_users: 3,
  
  max_users: 3,

  // TODO ramps
  ramp_to: 1000,
  ramp_by: 100,
  ramp_interval_ms: 2000,
  ramp_after_ms: 5000,
  ramp_replay_scenarios: false,

  // TODO unramp
  unramp_to: 300,
  unramp_by: 50,
  unramp_interval_ms: 2000,
  unramp_after_ms: 30000,
  unramp_replay_scenarios: false,

  // scenarios to play
  scenarios: [
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
      "action": "REST",
      "method": "POST",
      "url": "http://localhost:3001/post-contract-modification",
      "data": { data: "post-contract-modification" },
      "returnPacket": "get-contract-modification",
      "IOBlocking": true // will wait until all clients received the edit packet, before continuing the scenario
    }
    // TODO wait (wait before continue)
    // TODO send + expect
    // TODO replay_id (will replay the scenario described at the index, for example 0 will replay "send-ping")
  ],

  // connection config, header can include whatever you like
  connectionConfig: {
    url: "ws://localhost:3002",
    options: {
      protocolVersion: 8,
      origin: 'http://localhost:3002',
      headers: {
      }
    }
  // LEASE REDUCER LOCAL CONFIG READY
  //   url: "ws://172.17.0.19:4567/apicontratreducer/ws",
  //   options: {
  //     origin: "http://172.17.0.19:4567",
  //     headers: {
  //       Cookie: 'RESTIT_TUTORIAL=1; PLAY_USER=CA-INATIV; PLAY_LANG=fr; PLAY_SESSION="b9af6a28b6d8a3f695ed2bcaceb8d18c9e395c90-username=ca-inativ&level=SUPERADMIN&___AT=f5b0677479b0eb30fc32dd3161874c9cacb35280"'
  //     }
  //   }
  }
}