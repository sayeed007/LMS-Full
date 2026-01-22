require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { app, connectDB } = require('./app');
const socketService = require('./services/socketService');
const reminderService = require('./services/reminderService');

// Create HTTP server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io accessible to routes/controllers
app.set('io', io);

// Initialize Socket.io service
socketService.initialize(io);

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  reminderService.initialize();
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`WebSocket server initialized`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception thrown');
  console.log(err);
  process.exit(1);
});

module.exports = { server, io };
