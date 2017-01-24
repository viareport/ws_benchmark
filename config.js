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

  wsClientConfig: {
    useJson: true,
    packetAttributeName: "type"
  },

  // scenarios to play
  scenarios: [
    // LOCAL SCENARIO
    // {
    //   "action": "send",
    //   "data": "ping"
    // },
    // {
    //   "action": "waitingFor",
    //   "message": "get-contract-modification"
    // },
    // {
    //   "target": "uid-0",
    //   "action": "REST",
    //   "method": "POST",
    //   "url": "http://localhost:3001/post-contract-modification",
    //   "data": { data: "post-contract-modification" },
    //   "returnPacket": "get-contract-modification",
    //   "IOBlocking": true // will wait until all clients received the edit packet, before continuing the scenario
    // }
    // TODO wait (wait before continue)
    // TODO send + expect
    // TODO replay_id (will replay the scenario described at the index, for example 0 will replay "send-ping")
    

    // DEVEL SCENARIO
    {
      // subscribe the client to the contract
      action: "send",
      data: '{"uuid":"7b167758-0323-48b7-a138-75f17acc632f","envId":78770}'
    },
    {
      "action": "waitingFor",
      "message": "contratProjection"
    },
    {
      "target": "uid-0",
      "action": "REST",
      "method": "PUT",
      "url": "https://192.168.1.14:443/apilease/env/78770/contrats/7b167758-0323-48b7-a138-75f17acc632f/evenements/0",
      "options": {
        body: {versionNumerique: "1", eventType: "Prolongation"}
      },
      "metterBefore": true,
      // https://preprod.viareport.com/apilease/env/78770/contrats/7b167758-0323-48b7-a138-75f17acc632f/evenements/0
      "returnPacket": "get-contract-modification",
      "IOBlocking": true // will wait until all clients received the edit packet, before continuing the scenario
    }

  ],

  // connection config, header can include whatever you like
  connectionConfig: {
    // url: "ws://localhost:3002",
    // options: {
    //   protocolVersion: 8,
    //   origin: 'http://localhost:3002',
    //   headers: {
    //   }
    // }
  // LEASE REDUCER LOCAL CONFIG READY
  //   url: "ws://172.17.0.19:4567/apicontratreducer/ws",
  //   options: {
  //     origin: "http://172.17.0.19:4567",
  //     headers: {
  //       Cookie: 'RESTIT_TUTORIAL=1; PLAY_USER=CA-INATIV; PLAY_LANG=fr; PLAY_SESSION="b9af6a28b6d8a3f695ed2bcaceb8d18c9e395c90-username=ca-inativ&level=SUPERADMIN&___AT=f5b0677479b0eb30fc32dd3161874c9cacb35280"'
  //     }
  //   }

  // LEASE REDUCER DEVEL CONFIG
    // url: "wss://devel.inativ.fr/apicontratreducer/ws",
    url: "ws://192.168.1.14:8080/apicontratreducer/ws",
    options: {
      // origin: "https://devel.inativ.fr",
      origin: "https://192.168.1.14:8080",
      headers: {
        Cookie: 'RESTIT_RELEASE_NOTES=1.0.1; PLAY_USER="ADMIN CA-INATIV"; PLAY_LANG=fr; PLAY_SESSION="5b6b98374779427a40bed526870877d64db57dd4-username=ca-inativ&level=SUPERADMIN"'
      }
    }
  }
}