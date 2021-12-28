//peerjs --port 3001
//npm run dev
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
let participants = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.json());

app.get('/login', (req, res) => {
  res.redirect(`/${uuidV4()}`)
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
});

app.get('/', (req, res) => {
  res.render('index')
});

app.post('/add', (req, res) => {  //adds the name of person who joins the call
  participants.push(req.body.name);
  console.log("POST REQUEST (Add Participant) "+ participants);
});

app.delete('/remove', (req, res) => {  //removes the name of person who leaves the call
  let pos = 0;
  for(i=0;i<participants.length;i++){
    if(req.body.name === participants[i]){
      pos = i;
    }
  }
  participants.splice(pos, 1)
  console.log("DELETE REQUEST (Remove Participant) "+ participants);
});

// app.get('/participants',(req,res)=>{
//   console.log(json(participants))
//   res.json(participants);
// });

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit('user-connected', userId);      //sends to everyone in this room that somebody connected
  
      socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId);    
      });
      console.log(roomId,userId);
      socket.on('chat', function(data){ 
        io.sockets.emit('chat', data);  
      });
    });
});

let port = 80;
srv = server.listen(port,() => console.log(`listening at port ${port}`));

app.use('/peerjs', require('peer').ExpressPeerServer(srv, {
	debug: true
}))