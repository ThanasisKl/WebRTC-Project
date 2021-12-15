
// var socket = io.connect("http://localhost:3000");
const socket = io('/');
const myPeer = new Peer(undefined, {    //undefined so the server generate ids
  // host: 'localhost',
  port: '3001'
  // config: {'iceServers': [
  //   { url: 'stun:stun.l.google.com:19302' },
  //   { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
  // ]}
});

const peers = {};

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
});

socket.on('user-connected',userId => {
    console.log("user connected "+userId);
});

var message = document.getElementById("message");
// var handle = document.getElementById("handle");
var handle = "name";
var btn = document.getElementById("send-btn");
var chatDiv = document.getElementById("chat-div");
var feedback = document.getElementById("feedback");

btn.addEventListener("click",function(){
  socket.emit("chat",{message:message.value,handle:handle});
  message.value = "";
});


socket.on("chat",function(data){
  chatDiv.innerHTML += `<p class="chat-p"> user: ${data.message}</p>`;
  console.log("user:",data.message);
});

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true; // mute so we can hear our voice back

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('call',call => {  //when someone calls we send him our stream
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  });

  socket.on('user-connected',userId =>{
    setTimeout(function(){connectToNewUser(userId,stream);}, 2000); 
  })
});


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();   //if user exists disconnect him
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();              //when video is loaded play it
  })
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) { //calls user with id userId and send to him our video stream
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');

  call.on('stream', userVideoStream => {   //take the stream from other user and put it in our page
    addVideoStream(video, userVideoStream)
  });

  call.on('close', () => {  //closes the video when someone leaves
    video.remove();
  });

  peers[userId] = call;
}