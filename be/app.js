const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

var aPlayers = [];
function createPlayer(ws, id){
  return {
    id: id,
    x: 10,
    y: 10,
    client: ws
  }
}

function getPlayersForBroadcast(aPlayers){
  return JSON.stringify(aPlayers.map(function(oPlayer){
    return {
      id: oPlayer.id,
      x: oPlayer.x,
      y: oPlayer.y
    };
  }))
}

app.use(express.static(process.cwd()));
app.get('/',(oReq, oRes)=>{oRes.redirect('/ui/index.html')});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

wss.on('connection', function connection(ws) {
  const location = url.parse(ws.upgradeReq.url, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message',function (oMessage) {
    console.log(oMessage)
    var oData;
    try {
      oData = JSON.parse(oMessage);
    }catch (e){
      console.log('failed to parse message: ' + oMessage, e);
      return;
    }

    if (oData.hasOwnProperty('newPlayerId')){
      //Create new player
      var oPlayer = createPlayer(ws, oData.newPlayerId);
      console.log('New Player ' + oPlayer.id + ' connected');
      aPlayers.push(oPlayer);
      //Broadcast new player to all other players
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(getPlayersForBroadcast(aPlayers));
        }
      });
    }else if (oData.hasOwnProperty('updatePlayerId')){

      for (var i = 0, ii = aPlayers.length; i < ii; i++){
        if (aPlayers[i].id === oData.updatePlayerId){
          aPlayers[i].x = oData.x;
          aPlayers[i].y = oData.y;
          break;
        }
      }

      var aPlayersForBroadcast = getPlayersForBroadcast(aPlayers);
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(aPlayersForBroadcast);
        }
      });
    }
  });

  //Handle Logout
  ws.on('close', function(){
    var oPlayer = null;

    for (var i = 0, ii = aPlayers.length; i < ii; i++){
      if (aPlayers[i].client === ws){
        oPlayer = aPlayers.splice(i,1);
        break;
      }
    }
    console.log('Player ' + oPlayer.id + ' disconnected');
  });
});



server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
