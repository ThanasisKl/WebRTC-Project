//peerjs --port 3001
//npm run dev
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
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

let port = 80;
srv = server.listen(port,() => console.log(`listening at port ${port}`));

app.use('/peerjs', require('peer').ExpressPeerServer(srv, {
	debug: true
}))