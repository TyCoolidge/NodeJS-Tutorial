let io;
const { Server } = require('socket.io');

module.exports = {
    init: httpServer => {
        io = new Server(httpServer, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
};
