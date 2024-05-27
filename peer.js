const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let peers = {};

io.on('connection', (socket) => {
  console.log('New connection');

  socket.on('join', (id) => {
    peers[id] = socket;
    console.log(`Peer ${id} joined`);
  });

  socket.on('leave', (id) => {
    delete peers[id];
    console.log(`Peer ${id} left`);
  });

  socket.on('message', (id, data) => {
    if (peers[id]) {
      peers[id].emit('message', data);
    }
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
