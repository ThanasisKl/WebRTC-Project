const express = require('express');
const upload = require('express-fileupload');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');
const fs = require('fs');
const uploadsFolder = 'public/uploads/';
let participants = [];


app.use(upload());

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

app.post('/',(req,res)=>{
  if(req.files){
    // console.log(req.files);
    let file = req.files.file;
    let filename = file.name;
    // console.log(filename);
    file.mv('./public/uploads/' + getFileName(filename),function(err){
      if(err){
        res.status(500).json({
          msg:"Error from database"
        });
        console.log("Error from database");
      }else{
        res.status(200).json({
          msg:"File Uploaded"
        });
        console.log("File Uploaded");      
      }
    });
  }
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

app.put('/members',(req,res)=>{ //?
  res.json(participants);
});

app.put('/files',(req,res)=>{  //?
  fs.readdir(uploadsFolder, (err, files) => {
    res.json(files);
  });
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
}));

function getFileName(filename){   //rename file so all the files have a unique file name
  let filename_splitted = filename.split(".");
  let name = filename_splitted[0];
  let file_extension = filename_splitted[1];
  return name + uuidV4() +"." + file_extension;
}