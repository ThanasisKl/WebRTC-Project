const socket = io('/');

var myPeer = new Peer(undefined,{
	host: location.hostname,
	port: location.port || (location.protocol === 'https:' ? 443 : 80),
	path: '/peerjs'
})

const users_name = localStorage.getItem('users_name');

const peers = {};
var muteVideo = false;
var muteAudio = false;
var userStream;

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
});

socket.on('user-connected', userId => {
  console.log("user connected "+userId);
});

var message = document.getElementById("message");
var btn = document.getElementById("send-btn");
var chat = document.getElementById("all_messages");
var filesDiv = document.getElementById("files-div");
var membersDiv = document.getElementById("members-div");


btn.addEventListener("click",function(){
  socket.emit("chat",{message:message.value});
  message.value = "";
});

document.querySelector('#message').addEventListener('keypress', function (e) { //when enter button is pressed and sends the message to the server
  if (e.key === 'Enter') {
    socket.emit("chat",{message:message.value});
    message.value = "";
  }
});

socket.on("chat",function(data){  // if message not empty then show it
  if(data.message.trim() !== ""){
    chat.innerHTML += `<li> ${users_name}: ${data.message}</li>`;
    console.log(users_name,data.message);
  }
});

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true; // mute so we can hear our voice back

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  userStream = stream;
  addVideoStream(myVideo, stream);
  console.log(muteVideo);

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
    video.play();    //when video is loaded play it
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

document.getElementById("end_call").addEventListener("click", function(){  //when somebody leaves the call, goes to index page
  deleteParticipant();
  window.location='/';
});

document.getElementById("mute_audio").addEventListener("click", function(){  //mute and unmute audio
  if(!muteAudio){ 
    console.log("Mute Audio");
    document.getElementById("mute_audio").className = "fas fa-microphone-alt-slash";
  }
  else{ 
    console.log("Unmute Audio");
    document.getElementById("mute_audio").className = "fas fa-microphone-alt";
  }
  userStream.getAudioTracks().forEach(track => track.enabled = muteAudio);
  muteAudio = !muteAudio;
});

document.getElementById("mute_video").addEventListener("click", function(){  //mute and unmute video
  if(!muteVideo){ 
    console.log("Mute Video");
    document.getElementById("mute_video").className = "fas fa-video-slash";
  }else{
    console.log("Unmute Video");
    document.getElementById("mute_video").className = "fas fa-video";
  }

  userStream.getVideoTracks().forEach(track => track.enabled = muteVideo);
  muteVideo = !muteVideo;
});

document.getElementById("showMembers").addEventListener("click",  function(){ //get the members names from the server
  fetch(`/members`,{
    method:'PUT',
    headers:{
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(members => {
    // console.log(members);
    showParticipants(members);
  })
  .catch(err => {
    console.log(`Error: ${err}`);
  })
});

document.getElementById("showFiles").addEventListener("click",  function(){  // get the uploaded files from server
  fetch(`/files`,{
    method:'PUT',
    headers:{
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(files => {
    showFiles(files);
  })
  .catch(err => {
    console.log(`Error: ${err}`);
  })
});

window.onload = async function(){   // when somebody joins call sends his name to the server to add him in participants list
  let height = this.screen.height;
  // console.log(height);
  if(height< 900){
    document.getElementById("video-grid").style.marginBottom = `${height*0.41}px`;
  }else{
    document.getElementById("video-grid").style.marginBottom = `${height*0.5}px`;
  }
  
  
  // document.getElementById("mainRight").style.height = `${height*0.41}px`;

  const response = await fetch(`/add`,{  //add the user to the members list
    method:'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    body:JSON.stringify({
      name:users_name
    })
  });

  
}

async function deleteParticipant(){  // when somebody leaves call sends his name to the server to remove him from participants list
  const response = await fetch(`/remove`,{
    method:'DELETE',
    headers:{
      'Content-Type': 'application/json'
    },
    body:JSON.stringify({
      name:users_name
    })
  }
  );
}

function showFiles(files_names){  // show to the screen the uploades files
  if(filesDiv.innerHTML == ""){
    filesDiv.innerHTML = `<h2 class="headers">Files</h2>`
    for(let i=0;i<files_names.length;i++){
      let name  = "";
      if(files_names[i].length>8){   //if the name of the file is large then put only the initials 
        name = files_names[i][0] + files_names[i][1] + files_names[i][2] + files_names[i][3] +files_names[i][4] +files_names[i][5] +"..." ;
      }else{
        name = files_names[i];
      }
      filesDiv.innerHTML += `<i class="fas fa-file-alt"><a href="/uploads/${files_names[i]}" download>${name}</a></i><br/>`
    }
  }else{
    filesDiv.innerHTML = "";
  }
}

function showParticipants(members){  // show the members to the screen
  if(membersDiv.innerHTML == ""){
    membersDiv.innerHTML = `<h2 class="headers">Members</h2>`;
    for(let i=0;i<members.length;i++){
      membersDiv.innerHTML += `<i class="fas fa-user-astronaut">${members[i]}</i><br/>`
    }
  }else{
    membersDiv.innerHTML = "";
  }
}
