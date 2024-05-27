const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');
const app = express();
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer);
app.use(express.static('public'));

server.listen(process.env.PORT || 9000, () => {
  console.log('PeerJS chat server listening on port 9000');
});
