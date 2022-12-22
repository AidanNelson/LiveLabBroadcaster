let socket;
let numScenes = 6;

let sceneSwitcherButtons = {};

function setup() {
  console.log('Setting up socket connection');

  if (window.location.hostname === 'venue.itp.io') {
    socket = io('https://venue.itp.io');
  } else {
    socket = io('http://localhost:3131');
  }

  document.getElementById('clearChat').addEventListener('click', () => {
    socket.emit('clearChat');
  });

  document.getElementById('sendAdminMessage').addEventListener('click', () => {
    let message = document.getElementById('adminMessageInput').value;
    console.log('sending admin message:', message);
    let data = {
      msg: message,
    };
    socket.emit('adminMessage', data);
  });

  // setup scene selection logic
  let sceneSelect = document.getElementById('sceneSelect');
  for (let i = 0; i < availableScenes.length; i++) {
    let sceneName = availableScenes[i];
    const option = document.createElement('option');
    option.innerText = sceneName;
    sceneSelect.appendChild(option);
  }
  let sceneGoButton = document.getElementById('sceneGoButton');
  sceneGoButton.addEventListener('click', () => {
    console.log('go to new scene');
    console.log(sceneSelect.value);
    socket.emit('sceneIdx', sceneSelect.value);
  });

  socket.on('sceneIdx', (data) => {
    console.log('Current scene from server: ', data);
    sceneSelect.value = data;

    // TODO make this work
    // sceneSelect.
    // for (let id in sceneSwitcherButtons) {
    //   sceneSwitcherButtons[id].classList.remove('activeButton');
    // }
    // if (sceneSwitcherButtons[data]) {
    //   sceneSwitcherButtons[data].classList.add('activeButton');
    // }
  });

  // let lobbyButton = document.getElementById('activateLobbyButton');
  // lobbyButton.addEventListener('click', () => {
  //   socket.emit('sceneIdx', 1);
  // });
  // sceneSwitcherButtons[1] = lobbyButton;

  // let showButton = document.getElementById('activateShowButton');
  // showButton.addEventListener('click', () => {
  //   socket.emit('sceneIdx', 2);
  // });
  // sceneSwitcherButtons[2] = showButton;

  let showChatButton = document.getElementById('showChatButton');
  showChatButton.addEventListener('click', () => {
    socket.emit('showChat', true);
  });
  let hideChatButton = document.getElementById('hideChatButton');
  hideChatButton.addEventListener('click', () => {
    socket.emit('showChat', false);
  });
}

setup();
