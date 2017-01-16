//CONSTANTS
var STEP_SIZE = 10;

//REST OF THE SHIT
var oSocket = new WebSocket('ws://10.54.153.168:8080');

oSocket.onmessage = function(oMessage){
  console.log(oMessage.data);
  aPlayers = JSON.parse(oMessage.data);
  var oPlayerRect;
  aPlayers.forEach(function(oPlayer){
    oPlayerRect = document.getElementById(oPlayer.id);
    if (!oPlayerRect){
      var oPlayerRect = getPlayerRect(oPlayer);
      var svg = document.getElementById('gameBox');
      svg.appendChild(oPlayerRect);
    }else {
      oPlayerRect.setAttribute('x',oPlayer.x);
      oPlayerRect.setAttribute('y',oPlayer.y);
    }
  });
}

function getPlayerRect(mPlayerData){
  var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute('x',mPlayerData.x);
  rect.setAttribute('y',mPlayerData.y);
  rect.setAttribute('id',mPlayerData.id);
  rect.setAttribute('height',10);
  rect.setAttribute('width',10);
  return rect;
}


function attachMovementListeners(svg, elMainPlayer){
  var html = document.getElementsByTagName('html')[0];
  html.addEventListener('keydown',function(oEvent){
    if (oEvent.key === 'ArrowLeft'){
      elMainPlayer.setAttribute('x',parseInt(elMainPlayer.getAttribute('x'),10) - STEP_SIZE);
    }else if (oEvent.key === 'ArrowUp'){
      elMainPlayer.setAttribute('y',parseInt(elMainPlayer.getAttribute('y'), 10) - STEP_SIZE);
    }else if (oEvent.key === 'ArrowRight'){
      elMainPlayer.setAttribute('x',parseInt(elMainPlayer.getAttribute('x'), 10) + STEP_SIZE);
    }else if (oEvent.key === 'ArrowDown'){
      elMainPlayer.setAttribute('y',parseInt(elMainPlayer.getAttribute('y'), 10) + STEP_SIZE);
    }

    var oMessage = {
      updatePlayerId: elMainPlayer.getAttribute('id'),
      x: elMainPlayer.getAttribute('x'),
      y: elMainPlayer.getAttribute('y')
    }

    oSocket.send(JSON.stringify(oMessage));
  });
}



setTimeout(function(){//render
  var oPlayer = {
    x: 10,
    y: 10,
    id: Math.random().toString(36).substr(2, 5)
  };
  var elMainPlayer = getPlayerRect(oPlayer);

  oSocket.send('{"newPlayerId": "' + oPlayer.id + '"}');

  var svg = document.getElementById('gameBox');

  svg.appendChild(elMainPlayer);

  attachMovementListeners(svg, elMainPlayer);

}.bind(window),100);
