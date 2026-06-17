const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  const allowedOrigins = process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, 'http://localhost:5173']
    : ['http://localhost:5173'];

  io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  io.on('connection', (socket) => {
    // Client sends their userId on connect so we can route events to them
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => io;

// Emit a notification to a specific user by their MongoDB _id
const notifyUser = (userId, notification) => {
  if (io) io.to(userId.toString()).emit('notification', notification);
};

// Broadcast to all connected clients (e.g. organizers seeing live updates)
const broadcast = (event, data) => {
  if (io) io.emit(event, data);
};

module.exports = { initSocket, getIO, notifyUser, broadcast };
