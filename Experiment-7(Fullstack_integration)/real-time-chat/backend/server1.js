const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"] }
});

const users = new Map();
const messages = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('set_username', (username) => {
    users.set(socket.id, username || 'Anonymous');
    io.emit('users', Array.from(users.values()));
    socket.emit('init_messages', messages.slice(-50));
  });

  socket.on('send_message', (text) => {
    const name = users.get(socket.id) || 'Anonymous';
    const msg = { id: Date.now().toString(), name, text, time: new Date().toISOString() };
    messages.push(msg);
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('users', Array.from(users.values()));
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => res.send('Socket server running'));

server.listen(5000, () => console.log('Server running on port 5000'));
