//peerjs --port 3001
//npm run dev
const express = require('express');
const app = express();
const server = require('http').Server(app);
console.log(server);
const io = require('socket.io')(server);
console.log("io:"+io);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
});

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
  
server.listen(3000,() => console.log('listening at port 3000'));
